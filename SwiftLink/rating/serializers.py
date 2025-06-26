from rest_framework import serializers
from .models import Rating

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['id', 'invoice', 'helper', 'rating', 'comment', 'created_at']
        read_only_fields = ['helper', 'created_at']
