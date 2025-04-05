from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from notification.models import Notification
from Workforce.models import WorkForce
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from .Serializers import OrderSerializer
from rest_framework import generics
from django.contrib.auth import get_user_model

class LikeOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, orderID=order_id)
        helper = request.user  # ✅ Le helper qui like

        # 🔥 Ajout du like dans `expressedInterest`
        if helper.user_id not in order.expressedInterest:
            order.expressedInterest.append(helper.user_id)
            order.save()

            # 🔥 Créer une notification pour le client
            message = f"{helper.username} is interested to help you!"
            Notification.objects.create(user=order.clientID.UserId, message=message)

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
      # 🔒 Authentification requise

    def create(self, request, *args, **kwargs):
        print("Données reçues:", request.data)  # 🔥 Debugging

        # Vérification des champs requis
        required_fields = ["serviceType", "clientID", "entityID"]
        for field in required_fields:
            if field not in request.data:
                return Response({f"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class AllOrdersView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)