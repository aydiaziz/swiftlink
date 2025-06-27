from rest_framework import serializers
from .models import Order
from invoice.models import Invoice

class OrderLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['expressedInterest']
    
class OrderSerializer(serializers.ModelSerializer):
    hasInvoice = serializers.SerializerMethodField()
    clientName = serializers.SerializerMethodField()
    clientPhone = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    def get_hasInvoice(self, obj):
        return Invoice.objects.filter(order=obj).exists()

    def get_clientName(self, obj):
        first = getattr(obj.clientID.UserId, 'first_name', '')
        last = getattr(obj.clientID.UserId, 'last_name', '')
        return f"{first} {last}".strip()

    def get_clientPhone(self, obj):
        return getattr(obj.clientID, 'phone', '')
        