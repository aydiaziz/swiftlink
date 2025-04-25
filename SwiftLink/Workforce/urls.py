# dashboard/urls.py
from django.urls import path
from Workforce.views import dashboard_stats

urlpatterns = [
    path('stats/', dashboard_stats, name='dashboard-stats'),
    
]