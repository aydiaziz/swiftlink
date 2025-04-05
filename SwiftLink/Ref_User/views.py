from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Ref_User
from .serializers import UserSerializer, ClientSerializer, WorkForceSerializer
from Client.models import Client
from Workforce.models import WorkForce
from .serializers import SigninSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

# Signup pour Client
class ClientSignupView(generics.CreateAPIView):
    serializer_class = ClientSerializer

    def create(self, request, *args, **kwargs):
        print("Données reçues:", request.data)  # 🔥 Debugging

        # Vérifier si `UserId` est présent
        if 'UserId' not in request.data:
            return Response({"error": "UserId is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Ajouter le rôle `Client` automatiquement
        request.data['UserId']['role'] = 'Client'

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Erreurs de validation:", serializer.errors)  # 🔥 Debugging
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return super().create(request, *args, **kwargs)
    
# Signup pour Workforce
class WorkforceSignupView(generics.CreateAPIView):
    serializer_class = WorkForceSerializer

    def create(self, request, *args, **kwargs):
        if 'UserId' not in request.data:
            return Response({"error": "UserId is required"}, status=status.HTTP_400_BAD_REQUEST)

        request.data['UserId']['role'] = '3rd Party'
        return super().create(request, *args, **kwargs)

# Signin (connexion)
class SigninView(APIView):
    def post(self, request):
        serializer = SigninSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)