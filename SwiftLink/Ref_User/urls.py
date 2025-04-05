from django.urls import path
from .views import ClientSignupView, WorkforceSignupView, SigninView,CurrentUserView
urlpatterns = [
     path('signup/client/', ClientSignupView.as_view(), name='client_signup'),
    path('signup/workforce/', WorkforceSignupView.as_view(), name='workforce_signup'),
    path('signin/', SigninView.as_view(), name='signin'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
]
