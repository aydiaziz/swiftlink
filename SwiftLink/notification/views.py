from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    user = request.user
    notifs = Notification.objects.filter(user=user).order_by('-created_at')
    serializer = NotificationSerializer(notifs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notifications_count(request):
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({"count": count})
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_as_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"message": "All notifications marked as read."})