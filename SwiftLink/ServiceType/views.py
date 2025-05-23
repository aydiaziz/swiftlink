from rest_framework import generics, status
from rest_framework.response import Response
from .models import ServiceType
from .serializers import ServiceTypeSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny



class ServiceTypeCreateView(generics.CreateAPIView):
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer

    def create(self, request, *args, **kwargs):
        print("Données reçues:", request.data)  # 🔥 Debug

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Erreurs de validation:", serializer.errors)  # 🔥 Debug
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        service = serializer.save()

        return Response({
            "message": "ServiceType ajouté avec succès",
            "service": ServiceTypeSerializer(service).data
        }, status=status.HTTP_201_CREATED)
@api_view(['GET'])
@permission_classes([AllowAny])  # ou [IsAuthenticated] selon ton besoin
def get_service_types(request):
    services = ServiceType.objects.filter(isActive=True)
    serializer = ServiceTypeSerializer(services, many=True)
    return Response(serializer.data)