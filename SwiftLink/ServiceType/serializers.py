from rest_framework import serializers
from .models import ServiceType

class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = '__all__'  # Inclut tous les champs du modèle
