# chat/views.py
from urllib import request
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import openai
import json


from Order.models import Order
from Ref_Entity.models import Ref_Entity
from Client.models import Client
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

    chat_history = [
        {
            'role': 'system',
            'content': (
                'You are a helpful assistant tasked with collecting order details. '
                'Extract jobAddress, serviceType, executionDate, jobTitle, '
                'priorityLevel, expirationDate, manpower, and jobResources from the client. '
                'Return a JSON object with fields "reply", "order", and "confirm". '
                'When everything is gathered and the client approves, set "confirm" to true. '
                'Respond in the same language as the user.'
            )
        }
    ]

    for msg in conversation.messages.order_by('timestamp'):
        role = 'assistant' if msg.sender != request.user else 'user'
        chat_history.append({'role': role, 'content': msg.content})

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
            order = Order.objects.create(
                entityID=entity,
                clientID=client_obj,
                division='Helper',
                jobTitle=conversation.pending_order_data.get('jobTitle'),
                jobAddress=conversation.pending_order_data.get('jobAddress'),
                serviceType=conversation.pending_order_data.get('serviceType'),
                executionDate=conversation.pending_order_data.get('executionDate'),
                priorityLevel=conversation.pending_order_data.get('priorityLevel', 'Low'),
                expirationTime=conversation.pending_order_data.get('expirationDate'),
                manpower=conversation.pending_order_data.get('manpower'),
                jobResources=conversation.pending_order_data.get('jobResources'),
            )
            conversation.order = order
            conversation.pending_order_data = None
            conversation.save()
        except Exception:
            pass

    Message.objects.create(conversation=conversation, sender=conversation.helper, content=reply_text)

    return Response({'reply': reply_text, 'conversation_id': conversation.id, 'order_confirmed': confirm})
