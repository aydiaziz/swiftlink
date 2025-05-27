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
                first_name = response.data.get('UserId', {}).get('first_name', 'Applicant')

                if email:
                    subject = "Welcome to Swift Helpers"
                    message = f"""
Hello {first_name},

✅ hank you for submitting your initial application to join the Swift Helpers Self-Employment Network.

We’re reviewing your information and might contact you to schedule an interview. This conversation will help us confirm a mutual fit before proceeding to the full application and platform activation.

What’s Next:
• You will receive a call and/or an email from our us within the next 2 weeks
• Please watch your inbox for scheduling updates and further instructions
• Once approved, you’ll move forward to set up your full profile and begin onboarding to access Swift Helpers job board

Swift Helpers is more than a job board. It is your pathway to flexible, commission-free self-employment in the property services sector with professional tools, real opportunities, and a support system designed around your success.

We’re excited to support your journey.

Warm regards,  
Recruitment/Onboarding Team  
www.swift-helpers.com  
application@swift-helpers.com"""

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