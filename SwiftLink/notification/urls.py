from django.urls import path
from .views import get_notifications,unread_notifications_count,mark_notifications_as_read

urlpatterns = [
   path('notifications/', get_notifications),
path('notifications/unread_count/', unread_notifications_count),
path('notifications/mark-read/', mark_notifications_as_read),
]
