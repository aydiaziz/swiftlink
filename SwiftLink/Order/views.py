from datetime import date, datetime
from decimal import Decimal
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from notification.models import Notification
from Workforce.models import WorkForce
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from .Serializers import OrderSerializer
from invoice.serializers import InvoiceSerializer
from invoice.models import Invoice
from Client.models import Client
from rest_framework import generics
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from chat.models import Conversation
from django.utils import timezone
from collections import defaultdict



class LikeOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, orderID=order_id)
        helper = request.user  # 👈 The helper who liked the order

        if helper.user_id not in order.expressedInterest:
            order.expressedInterest.append(helper.user_id)
            order.save()

            # ✅ Create a notification with full context
            message = f"{helper.UserId.first_name} is interested to help you! Click to start the conversation"
            Notification.objects.create(
                user=order.clientID.UserId,         # The client
                message=message,
                order=order,                        # 🔥 Link to order
                related_helper=helper               # 🔥 Link to helper
            )

        return Response({"message": "Order liked!"}, status=200)

    def send_notification(self, client, helper, order):
        """Simuler l'envoi d'une notification"""
        print(f"📩 Notification envoyée à {client.UserId.email}: {helper.UserId.username} a liké votre ordre '{order.jobTitle}'")
class OrdersByServiceTypeView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 🔥 Récupérer le helper connecté
        helper = WorkForce.objects.get(UserId=self.request.user)

        # 🔥 Récupérer les serviceTypes du helper
        helper_service_types = helper.workCategory.values_list('name', flat=True)

        # 🔥 Filtrer les ordres par serviceType du helper
        return Order.objects.filter(serviceType__in=helper_service_types, jobStatus="Pending")
User = get_user_model()

class CreateOrderView(generics.CreateAPIView):
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        print("📥 Données reçues:", request.data)  # 🔍 Debug input

        # Vérification des champs requis
        required_fields = ["serviceType", "clientID", "entityID"]
        for field in required_fields:
            if field not in request.data:
                return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Erreurs de validation du serializer:")
            for field, errors in serializer.errors.items():
                print(f"  - {field}: {errors}")

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class AllOrdersView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_order_assignment(request):
    conversation_id = request.data.get('conversation_id')

    try:
        conversation = Conversation.objects.get(id=conversation_id)

        if not conversation.order:
            return Response({'error': 'No order associated with this conversation'}, status=400)

        conversation.order.assignedTo = conversation.helper.user_id
        conversation.order.jobStatus = Order.JobStatus.BOOKED
        conversation.order.save()

        return Response({'success': True})

    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def helper_agenda(request):
    helper_id = request.user.user_id
    orders = Order.objects.filter(assignedTo=helper_id).exclude(executionDate=None)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime, timedelta
from .models import Order  # adapte si besoin

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_order_duration(request, order_id):
    start_time = request.data.get('start_time')
    end_time = request.data.get('end_time')
    manual_duration = request.data.get('manual_duration')  # en minutes (optionnel)

    if not start_time or not end_time:
        return Response({'error': 'start_time and end_time are required'}, status=400)

    try:
        order = Order.objects.get(orderID=order_id)
        fmt = "%Y-%m-%dT%H:%M:%S.%fZ"

        start = datetime.strptime(start_time, fmt)
        end = datetime.strptime(end_time, fmt)

        if manual_duration:
            try:
                manual_duration = int(manual_duration)
                final_duration = timedelta(minutes=manual_duration)
                arrondi = 'manual'
            except ValueError:
                return Response({'error': 'manual_duration must be an integer'}, status=400)
        else:
            duration = end - start
            total_minutes = duration.total_seconds() / 60

            # Arrondi logique (par paliers de 30 min)
            if total_minutes <= 30:
                final_minutes = 30
            elif total_minutes <= 60:
                final_minutes = 60
            elif total_minutes <= 90:
                final_minutes = 90
            elif total_minutes <= 120:
                final_minutes = 120
            elif total_minutes <= 150:
                final_minutes = 150
            else:
                final_minutes = 180  # max fallback

            final_duration = timedelta(minutes=final_minutes)
            arrondi = f'auto ({final_minutes} min)'

        order.orderDuration = final_duration
        order.save()

        return Response({
            'success': True,
            'order_id': order_id,
            'final_duration': str(final_duration),
            'arrondi': arrondi
        })
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def orders_today(request):
    user_id = request.user.user_id
    today = date.today()

    orders = Order.objects.filter(
        assignedTo__contains=user_id,
        executionDate__date=today
    )
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def helper_dashboard(request):
    user = request.user
    if user.role != '3rd Party':
        return Response({'error': 'Not a helper'}, status=403)

    helper = getattr(user, 'workforce', None)
    if not helper:
        return Response({'error': 'Helper profile not found'}, status=404)

    orders = Order.objects.filter(assignedTo__contains=user.user_id)

    total_income = Decimal('0.0')
    monthly_completed = 0
    total_orders = orders.count()
    now = timezone.now()
    six_months = []

    for order in orders:
        if order.orderDuration:
            hours = Decimal(order.orderDuration.total_seconds()) / Decimal(3600)
            income = hours * helper.hourlyRatebyService
            total_income += income

            if order.executionDate and order.executionDate.month == now.month:
                monthly_completed += 1

            month_key = order.executionDate.strftime('%Y-%m') if order.executionDate else None
            if month_key:
                six_months.append((month_key, income))

    upcoming_jobs = orders.filter(executionDate__gte=now).order_by('executionDate')[:5]
    job_list = [{
        'title': o.jobTitle,
        'date': o.executionDate,
        'address': o.jobAddress,
        'priority': o.priorityLevel
    } for o in upcoming_jobs]

    monthly_income = defaultdict(Decimal)
    for key, value in six_months:
        monthly_income[key] += value

    return Response({
        'stats': {
            'total_orders': total_orders,
            'monthly_completed': monthly_completed,
            'total_income': float(total_income),
            'monthly_income': {k: float(v) for k, v in monthly_income.items()}
        },
        'upcoming_jobs': job_list
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def work_orders_dashboard(request):
    orders = Order.objects.all().select_related('clientID__UserId').prefetch_related('invoice__helper__UserId')
    data = []
    for order in orders:
        client = order.clientID
        invoice = getattr(order, 'invoice', None)
        helper = invoice.helper if invoice else None

        order_data = OrderSerializer(order).data
        invoice_data = InvoiceSerializer(invoice).data if invoice else None
        workforce_data = {
            'firstName': helper.UserId.first_name,
            'lastName': helper.UserId.last_name,
            'hourlyRatebyService': helper.hourlyRatebyService,
        } if helper else None
        client_data = {
            'firstName': client.UserId.first_name,
            'lastName': client.UserId.last_name,
            'address': client.address,
            'phone': client.phone,
        }
        data.append({
            'order': order_data,
            'client': client_data,
            'workforce': workforce_data,
            'invoice': invoice_data
        })
    return Response(data)

