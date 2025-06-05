# dashboard/serializers.py
from rest_framework import serializers
from Workforce.models import WorkForce
from Ref_User.models import Ref_User

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
    first_name = serializers.CharField(source='UserId.first_name')
    last_name = serializers.CharField(source='UserId.last_name')
    services = serializers.StringRelatedField(source='workCategory', many=True)

    class Meta:
        model = WorkForce
        fields = [
            'first_name', 'last_name', 'email', 'phone',
            'services', 'resume', 'driverLicence',
            'driverLicenceClass', 'availability',
            'training', 'address', 'yearsOfExperience'
        ]


class WorkforceProfileCompletionSerializer(serializers.ModelSerializer):
    profileImage = serializers.ImageField(source='UserId.profileImage', required=False)
    first_name = serializers.CharField(source='UserId.first_name', required=False)
    last_name = serializers.CharField(source='UserId.last_name', required=False)
    password = serializers.CharField(source='UserId.password', write_only=True, required=False)
    
    class Meta:
        model = WorkForce
        fields = [
            'professionnelemail',
            'profileImage',
            'first_name',
            'last_name',
            'password',
            'driverLicence', 'driverLicenceExpiry', 'driverLicenceFile',
            'wcbNumber', 'wcbFile',
            'address', 'city', 'province', 'postalCode', 'country',
            'careerExpectations', 'referralSource', 'wantsUpdates',
            'hourlyRatebyService', 'securityFundRate', 'platformFeeRate',
            'clientChargeRate', 'consumablesFee'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('UserId', {})
        user = instance.UserId

        # Gestion sécurisée du mot de passe
        password = user_data.pop('password', None)

        for attr, value in user_data.items():
            setattr(user, attr, value)

        if password:
            user.set_password(password)  # ✅ hachage sécurisé

        user.save()

        # Mise à jour des champs WorkForce
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance