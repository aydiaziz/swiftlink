from django.urls import path
from .views import AddEntityView,get_csrf_token

urlpatterns = [
    path('add-entity/', AddEntityView.as_view(), name='add-entity'),
    path("csrf/", get_csrf_token),
]
