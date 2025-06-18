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
import logging
import re


from Order.models import Order
from Ref_Entity.models import Ref_Entity
from Client.models import Client
from ServiceType.models import ServiceType
from django.db import models
from .models import Conversation, Message, Ref_User
from .serializers import ConversationSerializer, MessageSerializer
logger = logging.getLogger(__name__)

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


def extract_json(response: str) -> dict:
    """Extract and parse the first JSON object found in the GPT response."""
    if not response:
        raise ValueError("Empty assistant reply")

    # Check for a fenced code block
    code_block = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", response, re.DOTALL)
    if code_block:
        try:
            return json.loads(code_block.group(1))
        except Exception as e:
            raise ValueError(f"Failed to decode JSON code block: {e}")

    # Fallback: first balanced set of braces
    match = re.search(r"\{.*?\}", response, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception as e:
            raise ValueError(f"Failed to decode JSON snippet: {e}")

    raise ValueError("No valid JSON object found in response.")


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

    # Prompt système corrigé avec instructions JSON plus strictes
    system_prompt = (
        "You are the Swift Helpers assistant. Your goal is to help clients create clear job requests "
        "for the Swift Link work board. Ask clarifying questions if instructions are vague and keep each "
        "interaction focused on a single missing field. Start by requesting the jobAddress, then ask for "
        "serviceType and executionDate in separate messages. Only once these are provided, request the "
        "priorityLevel. Do not ask for jobTitle, expirationDate or jobResources. Automatically set "
        "expirationDate to three days after executionDate. When all details are gathered, summarise the job "
        "and ask for confirmation. "
        "CRITICAL: You must return your response as a valid JSON object with exactly these fields: "
        "'reply', 'order', and 'confirm'. Set 'confirm' to true only after the client explicitly confirms. "
        "Example format: {\"reply\": \"your message\", \"order\": null, \"confirm\": false} "
        "Do not include any text outside the JSON object. Do not use markdown formatting. "
        "Supported services are: " + service_details + ". Today's date is " + str(today) + ". "
        "Infer missing details when possible: deduce executionDate from relative expressions, "
        "and infer manpower from the service type (moving usually needs 2 helpers, cleaning 1). "
        "Deduce typical jobResources from the service type."
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
        completion = client.chat.completions.create(
            model='gpt-4o', 
            messages=chat_history,
            temperature=0.1,  # Réduire la température pour plus de cohérence
            response_format={"type": "json_object"}  # Forcer le format JSON
        )
        assistant_reply = completion.choices[0].message.content
        logger.debug(f"Raw GPT response: {assistant_reply}")
    except Exception as e:
        logger.exception("GPT request failed")
        return Response({'error': str(e)}, status=500)

    # Parsing JSON amélioré avec gestion d'erreur
    try:
        # Nettoyer la réponse au cas où il y aurait des caractères indésirables
        cleaned_reply = assistant_reply.strip()
        
        # Vérifier si la réponse commence et finit par des accolades
        if not (cleaned_reply.startswith('{') and cleaned_reply.endswith('}')):
            logger.error(f"Response doesn't look like JSON: {cleaned_reply}")
            raise ValueError("Response is not a valid JSON object")
        
        # Parser le JSON
        import json
        data = json.loads(cleaned_reply)
        
        # Valider la structure
        if not isinstance(data, dict):
            raise ValueError("Response is not a JSON object")
        
        reply_text = data.get('reply', '')
        order_data = data.get('order')
        confirm = data.get('confirm', False)
        
        logger.debug("Successfully parsed data: %s", data)
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON decode error: {e}")
        logger.error(f"Raw response: {assistant_reply}")
        # Fallback: utiliser la réponse brute comme texte
        reply_text = assistant_reply
        order_data = None
        confirm = False
        
    except Exception as e:
        logger.error(f"❌ Failed to parse GPT reply: {e}")
        logger.error(f"Raw response: {assistant_reply}")
        # Fallback: utiliser la réponse brute comme texte
        reply_text = assistant_reply
        order_data = None
        confirm = False

    # Sauvegarder les données de commande en attente
    if order_data:
        conversation.pending_order_data = order_data
        conversation.save()
        logger.debug("Saved pending order data: %s", order_data)

    # Créer la commande si confirmée
    if confirm and conversation.pending_order_data:
        try:
            client_obj = Client.objects.get(UserId=conversation.client)
            entity = Ref_Entity.objects.get(pk=1)
            pending = conversation.pending_order_data
            execution_dt = pending.get('executionDate')
            expiration_dt = pending.get('expirationDate')

            # Calculer la date d'expiration si non fournie
            if execution_dt and not expiration_dt:
                try:
                    from django.utils.dateparse import parse_datetime, parse_date
                    exec_date = parse_datetime(execution_dt) or parse_date(execution_dt)
                    if exec_date:
                        if hasattr(exec_date, 'date'):  # datetime object
                            exec_date = exec_date.date()
                        expiration_dt = (exec_date + timezone.timedelta(days=3)).isoformat()
                except Exception as e:
                    logger.warning(f"Failed to calculate expiration date: {e}")
                    expiration_dt = None

            # Créer la commande
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
            
            # Mettre à jour la conversation
            conversation.order = order
            conversation.pending_order_data = None
            conversation.save()
            
            logger.info("✅ Successfully created order %s for conversation %s", order.orderID, conversation.id)
            reply_text = "Your order has been successfully posted to the work board!"
            
        except Exception as e:
            logger.exception("❌ Order creation failed")
            reply_text = "I apologize, but there was an error creating your order. Please try again or contact support."

    # Sauvegarder la réponse de l'assistant
    Message.objects.create(conversation=conversation, sender=conversation.helper, content=reply_text)

    return Response({
        'reply': reply_text, 
        'conversation_id': conversation.id, 
        'order_confirmed': confirm
    })