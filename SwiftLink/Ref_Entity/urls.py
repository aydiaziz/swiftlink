from django.urls import path
from .views import AddEntityView

urlpatterns = [
    path('add-entity/', AddEntityView.as_view(), name='add-entity'),
]
