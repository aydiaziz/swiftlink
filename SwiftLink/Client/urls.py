from django.urls import path
from .views import get_memberships

urlpatterns = [
    path('memberships/', get_memberships, name='get_memberships'),
]
