from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from Order.models import Order
from Workforce.models import WorkForce
import logging
from django.utils import timezone
from .Serializers import WorkForceProfileSerializer,WorkForceListSerializer,WorkForceDetailSerializer,WorkforceProfileCompletionSerializer
from django.core.mail import send_mail



logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    try:
        user_id = str(request.user.user_id)
        
        # Stats de base
        total_orders = Order.objects.filter(
            assignedTo__contains=[user_id]
        ).count()
        
        current_month = timezone.now().month
        completed_orders = Order.objects.filter(
            assignedTo__contains=[user_id],
            jobStatus='Completed',
            executionDate__month=current_month
        ).count()
        
        # 1. Récupérer le taux horaire/fixe du workforce
        workforce = WorkForce.objects.get(UserId=request.user)
        hourly_rate = workforce.hourlyRatebyService or workforce.fixedRate or 0
        
        # 2. Calculer le revenu total basé sur la durée des commandes
        completed_jobs = Order.objects.filter(
            assignedTo__contains=[user_id],
            jobStatus='Completed'
        )
        
        total_income = 0
        for job in completed_jobs:
            if job.orderDuration and hourly_rate:
                # Convertir la durée en heures et calculer le revenu
                hours = job.orderDuration.total_seconds() / 3600
                total_income += float(hours * hourly_rate)
        
        # Jobs à venir
        upcoming_jobs = Order.objects.filter(
            assignedTo__contains=[user_id],
            executionDate__gte=timezone.now()
        ).order_by('executionDate')[:5]
        
        return Response({
            'stats': {
                'total_orders': total_orders,
                'monthly_completed': completed_orders,
                'total_income': round(total_income, 2)  # Arrondir à 2 décimales
            },
            'upcoming_jobs': [
                {
                    'id': job.orderID,
                    'title': job.jobTitle,
                    'date': job.executionDate,
                    'address': job.jobAddress,
                    'priority': job.priorityLevel
                } for job in upcoming_jobs
            ]
        })
        
    except WorkForce.DoesNotExist:
        logger.error(f"Workforce not found for user {request.user.user_id}")
        return Response({"error": "Workforce profile not found"}, status=404)
    except Exception as e:
        logger.exception("Error in dashboard_stats:")
        return Response({"error": str(e)}, status=500)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_helper_profile(request, user_id):
    try:
        helper = WorkForce.objects.select_related('UserId').get(UserId__user_id=user_id)
        serializer = WorkForceProfileSerializer(helper, context={'request': request})
        return Response(serializer.data)
    except WorkForce.DoesNotExist:
        return Response({'error': 'Helper not found'}, status=404)
@api_view(['GET'])

def list_helpers(request):
    helpers = WorkForce.objects.all().select_related('UserId')
    serializer = WorkForceListSerializer(helpers, many=True)
    return Response(serializer.data)
@api_view(['POST'])

def accept_helper(request, helper_id):
    try:
        helper = WorkForce.objects.get(UserId__user_id=helper_id)
        helper.acces = 1
        helper.save()

        # Envoi d’email
        send_mail(
            subject=' Your Application has been Accepted!',
            message='Please complete your onboarding by filling this form:https://www.swift-helpers.com/helper/form/16',
            from_email='application@swift-helpers.com',
            recipient_list=[helper.UserId.email],
            fail_silently=False,
        )
        return Response({'message': 'Helper accepted and email sent.'})
    except WorkForce.DoesNotExist:
        return Response({'error': 'Helper not found'}, status=404)
@api_view(['GET'])

def get_helper_detail(request, user_id):
    try:
        helper = WorkForce.objects.select_related('UserId').get(UserId__user_id=user_id)
        serializer = WorkForceDetailSerializer(helper)

        # Compose email
        first_name = helper.firstName or "there"
        subject = "Swift Helpers Application Received – Next Steps Inside"
        message = f"""Hi {first_name},

Thank you for submitting your initial application to join the Swift Helpers Self-Employment Network.

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

        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email='application@swift-helpers.com',
            recipient_list=[helper.UserId.email],
            fail_silently=False,
        )

        return Response(serializer.data)

    except WorkForce.DoesNotExist:
        return Response({'error': 'Helper not found'}, status=404)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_helper_profile(request):
    try:
        helper = WorkForce.objects.get(UserId=request.user)

        if helper.acces == 1:
            return Response({"detail": "Profile already completed."}, status=400)

        serializer = WorkforceProfileCompletionSerializer(helper, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            helper.acces = 1
            helper.save()
            return Response({"success": True})
        return Response(serializer.errors, status=400)

    except WorkForce.DoesNotExist:
        return Response({"error": "Helper not found."}, status=404)
