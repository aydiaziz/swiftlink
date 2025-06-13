from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Ref_User
from Client.models import Client
from Workforce.models import WorkForce
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth import authenticate

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from Ref_User.models import Ref_User
from Client.models import Client
from Workforce.models import WorkForce

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['address', 'city', 'province', 'postalCode', 'phone', 'clientType']

class WorkForceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkForce
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    profileImage = serializers.ImageField(read_only=True)
    client = ClientSerializer(read_only=True)
    workforce = WorkForceSerializer(read_only=True)

    class Meta:
        model = Ref_User
        fields = [
            'user_id', 'email', 'password', 'username',
            'first_name', 'last_name', 'role', 'entityId',
            'profileImage', 'client', 'workforce'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        # Assigner email comme username si vide
        validated_data['username'] = validated_data.get('username') or validated_data['email']
        validated_data['first_name'] = validated_data.get('first_name', '')

        if 'entityId' not in validated_data:
            raise serializers.ValidationError({"entityId": "Ce champ est requis pour Ref_User."})

        # Hacher le mot de passe
        validated_data['password'] = make_password(validated_data['password'])

        return Ref_User.objects.create(**validated_data)


class ClientSerializer(serializers.ModelSerializer):
    UserId = UserSerializer()  
    class Meta:
        model = Client
        fields = ['UserId', 'clientType', 'phone', 'address', 'city', 'province', 'postalCode', 'preferredService', 'preferredPaymentMethod']

    def create(self, validated_data):
        """Créer d'abord l'utilisateur, puis le client"""
        user_data = validated_data.pop('UserId')

        # 🔥 Vérifier que entityId est bien fourni
        if 'entityId' not in user_data:
            raise serializers.ValidationError({"entityId": "Ce champ est requis pour Client."})

        # 🔥 Hashage du mot de passe du client
        user_data['password'] = make_password(user_data['password'])

        # 🔥 Créer l'utilisateur
        user = Ref_User.objects.create(**user_data)

        # 🔥 Assigner l'entityID du user au client
        validated_data['entityID'] = user.entityId  

        # 🔹 Créer le client en associant l'utilisateur
        client = Client.objects.create(UserId=user, **validated_data)
        return client



class SigninSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")

        # Étape 1 : essayer Ref_User
        try:
            user = Ref_User.objects.get(email=email)
        except Ref_User.DoesNotExist:
            # Étape 2 : fallback via WorkForce.professionnelemail
            try:
                helper = WorkForce.objects.select_related('UserId').get(professionnelemail=email)
                user = helper.UserId
            except WorkForce.DoesNotExist:
                raise serializers.ValidationError("User not found.")

        # Auth via username (car AbstractUser → username est unique)
        user = authenticate(username=user.username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.is_active:
            raise serializers.ValidationError("User is inactive.")

        # Générer JWT
        refresh = RefreshToken.for_user(user)
        refresh[api_settings.USER_ID_FIELD] = str(user.user_id)

        # Récupérer client ou workforce si disponible
        client_data = None
        workforce_data = None

        try:
            client = Client.objects.get(UserId=user)
            client_data = ClientSerializer(client).data
        except Client.DoesNotExist:
            pass

        try:
            workforce = WorkForce.objects.get(UserId=user)
            workforce_data = WorkForceSerializer(workforce).data
        except WorkForce.DoesNotExist:
            pass

        return {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "entityId": user.entityId.entity_id if user.entityId else None,
            "client": client_data,
            "workforce": workforce_data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    
class WorkForceSerializer(serializers.ModelSerializer):
    UserId = UserSerializer()
    resume = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = WorkForce
        fields = '__all__'

    def create(self, validated_data):
        """Create the user, then the workforce, with optional resume and categories."""
        user_data = validated_data.pop('UserId')
        work_categories_data = validated_data.pop('workCategory', [])
        resume_file = validated_data.pop('resume', None)

        if 'entityId' not in user_data:
            raise serializers.ValidationError({"entityId": "This field is required for WorkForce."})

        user_data['password'] = make_password(user_data['password'])
        user = Ref_User.objects.create(**user_data)

        workforce = WorkForce.objects.create(UserId=user, resume=resume_file, **validated_data)

        if work_categories_data:
            workforce.workCategory.set(work_categories_data)

        return workforce


class ClientProfileSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    password = serializers.CharField(required=False, write_only=True)
    address = serializers.CharField(required=False, allow_blank=True)
    profileImage = serializers.ImageField(required=False)

    def update(self, instance, validated_data):
        user = instance['user']
        client = instance['client']

        if 'email' in validated_data:
            user.email = validated_data['email']

        if 'password' in validated_data:
            user.set_password(validated_data['password'])

        if 'profileImage' in validated_data:
            user.profileImage = validated_data['profileImage']

        user.save()

        if 'address' in validated_data:
            client.address = validated_data['address']
            client.save()

        return {'user': user, 'client': client}
class SuperAdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data['email']
        password = data['password']
        try:
            user = Ref_User.objects.get(email=email)
        except Ref_User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")

        if user.role != "Super Admin":
            raise serializers.ValidationError("Not authorized as Super Admin")

        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user_id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role
        }

