from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from Order.models import Order
from Workforce.models import WorkForce
import logging
from django.utils import timezone

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