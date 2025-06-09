# dashboard/urls.py
from django.urls import path
from Workforce.views import dashboard_stats,get_helper_profile, activate_helper,onboard_helper,list_helpers,get_helper_detail,complete_helper_profile,send_interview_invite

urlpatterns = [
    path('stats/', dashboard_stats, name='dashboard-stats'),
     path('helpers/<int:user_id>/profile/', get_helper_profile),
    path('admin/helpers', list_helpers),
    path('admin/helpers/<int:helper_id>/accept', onboard_helper),
    path('admin/helper/<int:user_id>', get_helper_detail),
    path('helper/profile-completion/<int:id>/', complete_helper_profile),
    path('admin/helper/<int:user_id>/send-interview/', send_interview_invite),
    path('helpers/<int:helper_id>/activate/', activate_helper, name='activate_helper'),
]