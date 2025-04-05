from rest_framework import serializers
from .models import Ref_Entity

class RefEntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Ref_Entity
        fields = ['entity_id', 'label', 'created_at']
