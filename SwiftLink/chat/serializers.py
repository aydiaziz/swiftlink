# chat/serializers.py
from rest_framework import serializers
from .models import Conversation, Message
from Ref_User.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    client = UserSerializer(read_only=True)
    helper = UserSerializer(read_only=True)
    order= serializers.IntegerField(source='order.orderID', read_only=True) 
    class Meta:
        model = Conversation
        fields = ['id', 'client', 'helper', 'created_at', 'messages','order']
