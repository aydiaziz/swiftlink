from django.urls import path
from .views import ClientSignupView, WorkforceSignupView, SigninView,CurrentUserView,update_client_profile
urlpatterns = [
     path('signup/client/', ClientSignupView.as_view(), name='client_signup'),
    path('signup/workforce/', WorkforceSignupView.as_view(), name='workforce_signup'),
    path('signin/', SigninView.as_view(), name='signin'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('client/profile/', update_client_profile, name='update_client_profile'),
]
