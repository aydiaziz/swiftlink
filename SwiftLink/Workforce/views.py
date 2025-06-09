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
from django.core.mail import EmailMessage



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

def get_helper_profile(request, user_id):
    try:
        helper = WorkForce.objects.select_related('UserId').get(UserId__user_id=user_id)
        serializer = WorkForceProfileSerializer(helper, context={'request': request})
        return Response(serializer.data)
    except WorkForce.DoesNotExist:
        return Response({'error': 'Helper not found'}, status=404)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_helpers(request):
    helpers = WorkForce.objects.all().select_related('UserId')
    serializer = WorkForceListSerializer(helpers, many=True)
    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def onboard_helper(request, helper_id):
    try:
        helper = WorkForce.objects.get(UserId__user_id=helper_id)
        helper.acces = 3
        first_name = helper.UserId.first_name or "there"
        helper.save()
        form_url = f'https://www.swift-helpers.com/onborading/{helper_id}'
        # Envoi d’email
        message = f"""
        Hi {first_name},

        Your interview is now complete, and we’re pleased to confirm you’ve been approved to move forward with onboarding. We’re confident you’re a great fit for the Swift Helpers Self-Employment Network, ready to begin your journey as a self-employed professional supported by our platform tools and Income Security model.

        What’s Next: Complete your onboarding by submitting the full profile form here:
        {form_url}

        Once submitted and verified, your account will be activated.
        You’ll gain full access to:
        • The Swift Helpers job board
        • Your personal work dashboard
        • Tools to manage jobs, track earnings, and build your professional profile

        Swift Helpers is more than a job board, it’s a trusted platform designed to support your commission-free, self-employed journey in the property services sector. We look forward to supporting your growth every step of the way.

        Warm regards,  
        Recruitment/Onboarding Team  
        www.swift-helpers.com  
        accounts@swift-helpers.com
        """

        send_mail(
                    subject="Swift Helpers Interview Complete – You’re Approved to Onboard",
                    message=message,
                    from_email="accounts@swift-helpers.com",
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


        return Response(serializer.data)

    except WorkForce.DoesNotExist:
        return Response({'error': 'Helper not found'}, status=404)
api_view(['POST'])
def complete_helper_profile(request, id):
    try:
        helper = WorkForce.objects.select_related('UserId').get(pk=id)

        serializer = WorkforceProfileCompletionSerializer(
            helper, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            helper.acces = 1
            helper.save()

            # Prepare and send welcome email
            first_name = helper.UserId.first_name or "there"

            email_body = f"""
Hi {first_name},

Thank you for completing your onboarding.

You are now part of a trusted community of self-employed professionals delivering property services with flexibility, independence, and professionalism.
Your self-employment profile will be activated shortly, giving you access to work opportunities, tools, and support designed to grow your success on the platform.

Here's what to do next:
• Stay Work-Ready: New job opportunities are posted regularly on the Swift Helpers work board. Stay tuned and check for updates frequently.
• Engage with Jobs: When you see a task that matches your skills and availability, click “Express Interest” to let the client know you’re ready to help.
• Respond Promptly: If a client reaches out, reply quickly. Fast responses help you secure more work and improve your reputation.
• Schedule Cooperatively: Coordinate with the client on timing, location, and job details. Be punctual, clear, and proactive in your communication.
• Set Expectations & Be Professional: Confirm the scope of work, tools you'll bring, and any special requirements. Maintain a respectful, honest, and solution-focused approach.
• Deliver Quality: Positive client reviews lead to more job offers. Consistent, incident-free service puts you on the path to becoming an Assured Helper, with higher rates, greater visibility, and stronger client trust.

We’re excited to support your journey.

Contract attached – Please review your Dependent Contractor Agreement for terms of engagement and platform responsibilities.

Warm regards,  
Recruitment/Onboarding Team  
www.swift-helpers.com  
accounts@swift-helpers.com
"""

            email = EmailMessage(
                subject="Welcome to Swift Helpers — you’re now officially recognized as a Dependent Contractor!",
                body=email_body,
                from_email="accounts@swift-helpers.com",
                to=[helper.UserId.email]
            )

            # Optional: attach PDF contract
            # contract_path = '/path/to/contract.pdf'
            # email.attach_file(contract_path)

            email.send(fail_silently=False)

            return Response({"success": True})
        return Response(serializer.errors, status=400)

    except WorkForce.DoesNotExist:
        return Response({"error": "Helper not found."}, status=404)
@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Add this for security
def send_interview_invite(request, user_id):
    try:
        helper = WorkForce.objects.select_related('UserId').get(UserId__user_id=user_id)
        recipient_email = helper.UserId.email
        first_name = helper.UserId.first_name or "there"
        helper.acces = 2
        helper.save()

        message = f"""
Hello {first_name},

We’ve reviewed your initial profile and would like to invite you to an interview to assess mutual fit. This step will help us better understand your goals, availability, and how we can support your success on the platform.

Please reply with your availability within the next 3 days.

Swift Helpers is more than a job board—it’s a platform for flexible, commission-free self-employment in the property services sector. We're excited to learn more about you.

Warm regards,  
Recruitment & Onboarding Team  
www.swift-helpers.com  
application@swift-helpers.com
"""

        send_mail(
            subject="Swift Helpers Application - Interview Availability Request",
            message=message,
            from_email='application@swift-helpers.com',
            recipient_list=[recipient_email],
        )
        return Response({'message': 'Interview email sent successfully.'}, status=200)

    except WorkForce.DoesNotExist:
        return Response({'error': 'Helper not found.'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_helper(request, helper_id):
    try:
        helper = WorkForce.objects.select_related('UserId').get(UserId__user_id=helper_id)
        helper.acces = 1
        helper.save()

        first_name = helper.UserId.first_name or "there"

        email_body = f"""
Hi {first_name},

We’re happy to let you know that your Swift Helpers profile has been successfully activated.

You now have full access to the Swift Helpers job board, your personal dashboard, and tools to help you grow your independent work in the property services sector.

Start by browsing the job board and expressing interest in tasks that match your skills and schedule. The more you engage, the more visible you become to clients.

You are part of a trusted network of self-employed professionals, supported by Swift Helpers’ Income Security system and quality assurance tools.

Your journey as a Dependent Contractor officially begins now.

Warm regards,  
Recruitment/Onboarding Team  
www.swift-helpers.com  
accounts@swift-helpers.com
"""

        email = EmailMessage(
            subject="Your Swift Helpers Profile Is Now Active – Ready to Start Working!",
            body=email_body,
            from_email="accounts@swift-helpers.com",
            to=[helper.UserId.email]
        )

        email.send(fail_silently=False)

        return Response({'message': 'Helper activated and email sent.'})

    except WorkForce.DoesNotExist:
        return Response({'error': 'Helper not found.'}, status=404)
