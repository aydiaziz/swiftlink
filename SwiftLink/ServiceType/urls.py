from django.urls import path
from .views import ServiceTypeCreateView
from .views import get_service_types
urlpatterns = [
    path('service/add/', ServiceTypeCreateView.as_view(), name='add_service'),
    path('services/', get_service_types, name='get_service_types'),
]
