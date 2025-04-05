from django.urls import path
from .views import ServiceTypeCreateView

urlpatterns = [
    path('service/add/', ServiceTypeCreateView.as_view(), name='add_service'),
]
