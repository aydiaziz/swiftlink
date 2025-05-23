from django.urls import path
from . import views
urlpatterns = [
    path('invoices/<order_id>/init/',views.init_invoice ),
    path('invoices/<order_id>/submit/',views.submit_invoice ),
    
]