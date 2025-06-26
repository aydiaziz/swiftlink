from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.db.models import Avg
from .models import Rating
from invoice.models import Invoice
from Workforce.models import WorkForce
from .serializers import RatingSerializer

class RatingCreateView(generics.CreateAPIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        invoice = serializer.validated_data['invoice']
        if invoice.order.clientID.UserId != request.user:
            raise PermissionDenied("You are not allowed to rate this invoice.")

        rating_obj, created = Rating.objects.update_or_create(
            invoice=invoice,
            defaults={
                'helper': invoice.helper,
                'rating': serializer.validated_data['rating'],
                'comment': serializer.validated_data.get('comment', '')
            }
        )

        self.update_helper_rating(invoice.helper)

        return Response(
            RatingSerializer(rating_obj).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    def update_helper_rating(self, helper: WorkForce):
        avg = Rating.objects.filter(helper=helper).aggregate(Avg('rating'))['rating__avg']
        helper.rating = round(avg or 0, 2)
        helper.save()
