from rest_framework import serializers
from .models import Order
from invoice.models import Invoice

class OrderLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['expressedInterest']
    
class OrderSerializer(serializers.ModelSerializer):
    hasInvoice = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = '__all__'
        
    def get_hasInvoice(self, obj):
        return Invoice.objects.filter(order=obj).exists()
        