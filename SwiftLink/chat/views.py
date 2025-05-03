# chat/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from Order.models import Order 
from .models import models
from .models import Conversation, Message,Ref_User
from .serializers import ConversationSerializer, MessageSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_conversation(request):
    helper_id = request.data.get('helper_id')
    client_id = request.user.user_id  # ✅ l'utilisateur connecté est le client
    order_id = request.data.get('order_id')
    if not helper_id:
        return Response({'error': 'helper_id is required'}, status=400)

    try:
        client = Ref_User.objects.get(user_id=client_id)
        helper = Ref_User.objects.get(user_id=helper_id)
        order =  Order.objects.get(orderID=order_id)
    except Ref_User.DoesNotExist:
        return Response({'error': 'Client or Helper not found'}, status=404)

    conversation, created = Conversation.objects.get_or_create(
        client=client,
        helper=helper,
        order=order,
    )

    return Response({'conversation_id': conversation.id})

@api_view(['GET'])
def get_conversation(request, conversation_id):
    conversation = Conversation.objects.get(id=conversation_id)
    serializer = ConversationSerializer(conversation)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(sender=request.user)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_conversations(request):
    user = request.user
    conversations = Conversation.objects.filter(
        models.Q(client=user) | models.Q(helper=user)
    ).order_by('-created_at')
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data)
