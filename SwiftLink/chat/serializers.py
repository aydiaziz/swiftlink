# chat/serializers.py
from rest_framework import serializers
from .models import Conversation, Message
from Ref_User.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    senderImage = serializers.SerializerMethodField()
    class Meta:
        model = Message
        fields = '__all__'
    def get_senderImage(self, obj):
        if obj.sender and obj.sender.profileImage:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.sender.profileImage.url)
        return None
class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    client = UserSerializer(read_only=True)
    helper = UserSerializer(read_only=True)
    order = serializers.IntegerField(source='order.orderID', read_only=True)
    order_status = serializers.CharField(source='order.jobStatus', read_only=True)
    unread_count = serializers.SerializerMethodField()
    class Meta:
        model = Conversation
        fields = [
            'id',
            'client',
            'helper',
            'created_at',
            'messages',
            'order',
            'order_status',
            'unread_count'
        ]

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request:
            user = request.user
            return obj.messages.exclude(sender=user).filter(is_read=False).count()
        return 0
