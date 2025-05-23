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
from .serializers import ClientProfileSerializer
from rest_framework.decorators import api_view, permission_classes
from django.core.mail import send_mail
from django.conf import settings


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

        # Forcer le rôle "3rd Party"
        request.data['UserId']['role'] = '3rd Party'

        # Crée le WorkForce
        response = super().create(request, *args, **kwargs)

        # Envoi de l'email de confirmation
        if response.status_code == 201:
            try:
                # Récupération de l'adresse email et prénom (si disponible)
                email = response.data.get('professionnelemail') or response.data.get('UserId', {}).get('email')
                first_name = response.data.get('UserId', {}).get('firstName', 'Applicant')

                if email:
                    subject = "Welcome to Swift Helpers"
                    message = f"""
Hello {first_name},

✅ Thank you for registering as a helper with Swift Helpers!

Our team will review your application and contact you to schedule a phone interview.

Meanwhile, feel free to explore how Swift Helpers empowers independent workers like you.

See you soon!
The Swift Helpers Team
"""
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [email],
                        fail_silently=False
                    )
            except Exception as e:
                # Log the exception if needed
                print("❌ Error sending email:", e)

        return response

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
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_client_profile(request):
    try:
        user = Ref_User.objects.get(pk=request.user.user_id)
        client = Client.objects.get(UserId=user)
    except (Ref_User.DoesNotExist, Client.DoesNotExist):
        return Response({'error': 'Client not found'}, status=404)

    serializer = ClientProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.update({'user': user, 'client': client}, serializer.validated_data)
        return Response({'success': True})
    else:
        return Response(serializer.errors, status=400)