from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Membership
from .serializers import MembershipSerializer

# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def get_memberships(request):
    memberships = Membership.objects.all()
    serializer = MembershipSerializer(memberships, many=True)
    return Response(serializer.data)
