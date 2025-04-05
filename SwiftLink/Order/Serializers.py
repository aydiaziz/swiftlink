from rest_framework import serializers
from .models import Order

class OrderLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['expressedInterest']
class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'