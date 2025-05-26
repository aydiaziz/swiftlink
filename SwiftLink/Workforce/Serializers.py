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
class WorkForceProfileSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='UserId.first_name')
    lastName = serializers.CharField(source='UserId.last_name')
    profileImage = serializers.SerializerMethodField()
    email = serializers.EmailField(source='UserId.email')

    class Meta:
        model = WorkForce
        fields = [
            'firstName', 'lastName', 'profileImage', 'email',
            'hourlyRatebyService', 'workForceType', 'skills', 'rating'
        ]

    def get_profileImage(self, obj):
        request = self.context.get('request')
        if obj.UserId.profileImage:
            return request.build_absolute_uri(obj.UserId.profileImage.url)
        return None
class WorkForceListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='UserId.email')
    first_name = serializers.CharField(source='UserId.first_name')
    last_name = serializers.CharField(source='UserId.last_name')
    acces = serializers.IntegerField()

    class Meta:
        model = WorkForce
        fields = ['UserId', 'first_name', 'last_name', 'email', 'acces']
class WorkForceDetailSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='UserId.email')
    full_name = serializers.SerializerMethodField()
    services = serializers.StringRelatedField(source='workCategory', many=True)

    class Meta:
        model = WorkForce
        fields = [
            'full_name', 'email', 'phone',
            'services', 'resume', 'driverLicence',
            'driverLicenceClass', 'availability',
            'training', 'address'
        ]

    def get_full_name(self, obj):
        return f"{obj.firstName} {obj.lastName}"

class WorkforceProfileCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkForce
        fields = [
            'professionnelemail',
            'driverLicence', 'driverLicenceExpiry', 'driverLicenceFile',
            'wcbNumber', 'wcbFile',
            'address', 'city', 'province', 'postalCode', 'country',
            'careerExpectations', 'referralSource', 'wantsUpdates',
            'hourlyRatebyService', 'securityFundRate', 'platformFeeRate',
            'clientChargeRate', 'consumablesFee'
        ]