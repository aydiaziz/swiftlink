from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Ref_Entity
from .serializers import RefEntitySerializer

class AddEntityView(generics.GenericAPIView):
    serializer_class = RefEntitySerializer

    def post(self, request):
        label = request.data.get("label")
        if not label:
            return Response({"error": "Label is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        entity, created = Ref_Entity.addEntity(label)
        return Response({"entity": entity.label, "created": created}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
