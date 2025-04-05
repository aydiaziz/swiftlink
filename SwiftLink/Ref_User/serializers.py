from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Ref_User
from Client.models import Client
from Workforce.models import WorkForce
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ref_User
        fields = ['user_id', 'email', 'password', 'username', 'first_name', 'last_name', 'role', 'entityId']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        """ Assigner `email` comme `username` si `username` est vide et gérer `first_name` """
        validated_data['username'] = validated_data.get('username') or validated_data['email']
        validated_data['first_name'] = validated_data.get('first_name', '')

        if 'entityId' not in validated_data:
            raise serializers.ValidationError({"entityId": "Ce champ est requis pour Ref_User."})

        # 🔥 Assurer le hashage du mot de passe
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
        from Ref_User.models import Ref_User  # 🔥 Importer le bon modèle
        try:
            user = Ref_User.objects.get(email=data['email'])
        except Ref_User.DoesNotExist:
            raise serializers.ValidationError({"non_field_errors": ["Invalid email or password"]})

        if not user.check_password(data['password']):
            raise serializers.ValidationError({"non_field_errors": ["Invalid email or password"]})

        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)
        refresh[api_settings.USER_ID_FIELD] = str(user.user_id)  


        return {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role,
            "entityId": user.entityId.entity_id if user.entityId else None,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


    
class WorkForceSerializer(serializers.ModelSerializer):
    UserId = UserSerializer()  

    class Meta:
        model = WorkForce
        fields = '__all__'

    def create(self, validated_data):
        """Créer d'abord l'utilisateur, puis le workforce"""
        user_data = validated_data.pop('UserId') 
        work_categories_data = validated_data.pop('workCategory', [])

        # 🔥 Vérifier que entityId est bien fourni
        if 'entityId' not in user_data:
            raise serializers.ValidationError({"entityId": "Ce champ est requis pour WorkForce."})

        # 🔥 Hashage du mot de passe du workforce
        user_data['password'] = make_password(user_data['password'])

        # 🔥 Créer l'utilisateur
        user = Ref_User.objects.create(**user_data)

        # 🔹 Créer le workforce en associant l'utilisateur
        workforce = WorkForce.objects.create(UserId=user, **validated_data)
        if work_categories_data:
            workforce.workCategory.set(work_categories_data)
        return workforce
