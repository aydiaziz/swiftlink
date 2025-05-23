# chat/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.start_conversation),
    path('<int:conversation_id>/', views.get_conversation),
    path('send/', views.send_message),
    path('conversations/', views.get_user_conversations),
]
