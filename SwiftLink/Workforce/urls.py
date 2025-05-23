# dashboard/urls.py
from django.urls import path
from Workforce.views import dashboard_stats,get_helper_profile,accept_helper,list_helpers,get_helper_detail,complete_helper_profile

urlpatterns = [
    path('stats/', dashboard_stats, name='dashboard-stats'),
     path('helpers/<int:user_id>/profile/', get_helper_profile),
    path('admin/helpers', list_helpers),
    path('admin/helpers/<int:helper_id>/accept', accept_helper),
    path('admin/helper/<int:user_id>', get_helper_detail),
    path('helper/profile-completion', complete_helper_profile),
]