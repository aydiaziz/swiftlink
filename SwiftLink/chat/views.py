# chat/views.py
from urllib import request
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_datetime, parse_date
import openai
import json


from Order.models import Order
from Ref_Entity.models import Ref_Entity
from Client.models import Client
from ServiceType.models import ServiceType
from .models import models
from .models import Conversation, Message, Ref_User
from .serializers import ConversationSerializer, MessageSerializer


def get_default_helper():
    """Return the bot user used for conversations, creating it if necessary."""
    helper = Ref_User.objects.filter(username="chatbot").first()
    if not helper:
        entity = Ref_Entity.objects.first()
        helper = Ref_User.objects.create(
            username="chatbot",
            first_name="Chat",
            last_name="Bot",
            email="chatbot@example.com",
            password="",
            role="Employee",
            status="Active",
            entityId=entity,
        )
    return helper


class IsAuthenticatedWithMessage(IsAuthenticated):
    message = "You have to log in to help you"

@api_view(['POST'])
@permission_classes([IsAuthenticatedWithMessage])
def start_conversation(request):
    helper_id = request.data.get('helper_id')
    client_id = request.user.user_id
    order_id = request.data.get('order_id')

    try:
        client = Ref_User.objects.get(user_id=client_id)
    except Ref_User.DoesNotExist:
        return Response({'error': 'Client not found'}, status=404)

    if helper_id:
        try:
            helper = Ref_User.objects.get(user_id=helper_id)
        except Ref_User.DoesNotExist:
            return Response({'error': 'Helper not found'}, status=404)
    else:
        helper = get_default_helper()

    order = Order.objects.filter(orderID=order_id).first() if order_id else None

    conversation, created = Conversation.objects.get_or_create(
        client=client,
        helper=helper,
        order=order,
    )

    return Response({'conversation_id': conversation.id})

@api_view(['GET'])
def get_conversation(request, conversation_id):
    conversation = Conversation.objects.get(id=conversation_id)
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticatedWithMessage])
def send_message(request):
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(sender=request.user)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
@api_view(['GET'])
@permission_classes([IsAuthenticatedWithMessage])
def get_user_conversations(request):
    user = request.user
    conversations = Conversation.objects.filter(
        models.Q(client=user) | models.Q(helper=user)
    ).order_by('-created_at')
    serializer = ConversationSerializer(conversations, context={'request': request}, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticatedWithMessage])
def gpt_message(request):
    """Handle a chat message using OpenAI GPT."""
    conversation_id = request.data.get('conversation_id')
    message = request.data.get('message')
    if not message:
        return Response({'error': 'message is required'}, status=400)

    if conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=404)
    else:
        default_helper = get_default_helper()
        conversation, _ = Conversation.objects.get_or_create(
            client=request.user,
            helper=default_helper,
            order=None,
        )

    Message.objects.create(conversation=conversation, sender=request.user, content=message)

    services = ServiceType.objects.filter(isActive=True)
    service_details = ", ".join([
        f"{s.serviceName} (helpers {s.manpower})" for s in services
    ])
    today = timezone.now().date()

    system_prompt = (
        "You are the Swift Helpers assistant. Your goal is to help clients "
        "create clear job requests for the Swift Link work board. "
        "Ask clarifying questions if instructions are vague and offer helpful "
        "suggestions about describing the task, required tools, location type, "
        "and timing. Be polite and concise. Do not ask for job title, priority level, "
        "expiration date or job resources. Ask about the remaining fields one by one. "
        "Set expirationDate automatically to three days after executionDate. "
        "Confirm when the job summary is ready to post but do not show the JSON to the client. "
        "Avoid assigning helpers or assuming a job is accepted. Never give "
        "legal or safety advice. Supported services are: " + service_details + ". "
        "If a client requests something outside this list, politely explain that it "
        "is not currently supported and note their request. Base informal estimates on "
        "typical duration using median hourly rates. Today's date is " + str(today) + ". "
        "Extract jobTitle, jobAddress, serviceType, executionDate, priorityLevel, "
        "expirationDate, manpower, and jobResources from the conversation. Infer "
        "missing details when possible: deduce executionDate from relative expressions "
        "(e.g., 'next Sunday'), set expirationDate three days later, and infer manpower from the service type "
        "(moving usually needs 2 helpers, cleaning 1). Deduce typical jobResources from the service "
        "type. Return a JSON object with fields 'reply', 'order', and 'confirm'. "
        "When the client confirms everything, set 'confirm' to true. Respond in english."
    )

    chat_history = [
        {
            'role': 'system',
            'content': system_prompt,
        }
    ]

    for msg in conversation.messages.order_by('timestamp'):
        role = 'assistant' if msg.sender != request.user else 'user'
        chat_history.append({'role': role, 'content': msg.content})

    if not settings.OPENAI_API_KEY:
        return Response({'error': 'OpenAI API key not configured'}, status=500)

    try:
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        completion = client.chat.completions.create(model='gpt-4o', messages=chat_history)
        assistant_reply = completion.choices[0].message.content
    except Exception as e:
        return Response({'error': str(e)}, status=500)

    try:
        data = json.loads(assistant_reply)
        reply_text = data.get('reply', '')
        order_data = data.get('order')
        confirm = data.get('confirm', False)
    except Exception:
        reply_text = assistant_reply
        order_data = None
        confirm = False

    if order_data:
        conversation.pending_order_data = order_data
        conversation.save()

    if confirm and conversation.pending_order_data:
        try:
            client_obj = Client.objects.get(UserId=conversation.client)
            entity = Ref_Entity.objects.get(pk=1)
            pending = conversation.pending_order_data
            execution_dt = pending.get('executionDate')
            expiration_dt = pending.get('expirationDate')

            if execution_dt and not expiration_dt:
                try:
                    exec_date = parse_datetime(execution_dt) or parse_date(execution_dt)
                    if exec_date:
                        expiration_dt = (exec_date + timezone.timedelta(days=3)).isoformat()
                except Exception:
                    expiration_dt = None

            order = Order.objects.create(
                entityID=entity,
                clientID=client_obj,
                division='Helper',
                jobTitle=pending.get('jobTitle') or pending.get('serviceType'),
                jobAddress=pending.get('jobAddress'),
                serviceType=pending.get('serviceType'),
                executionDate=execution_dt,
                priorityLevel=pending.get('priorityLevel', 'Low'),
                expirationTime=expiration_dt,
                manpower=pending.get('manpower'),
                jobResources=pending.get('jobResources'),
            )
            conversation.order = order
            conversation.pending_order_data = None
            conversation.save()
            reply_text = "Your order has been posted."
        except Exception:
            reply_text = "The order has not been created; I didn't find it in the database."

    Message.objects.create(conversation=conversation, sender=conversation.helper, content=reply_text)

    return Response({'reply': reply_text, 'conversation_id': conversation.id, 'order_confirmed': confirm})
