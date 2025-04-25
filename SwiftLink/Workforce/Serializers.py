# dashboard/serializers.py
from rest_framework import serializers
from Workforce.models import WorkForce

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkForce
        fields = [
            'phone', 'gender', 'skills', 'address', 
            'workCategory', 'hourlyRatebyService',
            'driverLicence', 'credentials', 'training'
        ]