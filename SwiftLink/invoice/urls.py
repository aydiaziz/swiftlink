from django.urls import path
from . import views
urlpatterns = [
    path('invoices/<order_id>/init/',views.init_invoice ),
    path('invoices/<order_id>/submit/',views.submit_invoice ),
    path('invoices/client/', views.client_invoices),
    path('invoices/helper/', views.helper_invoices),
    path('invoices/<int:invoice_id>/', views.invoice_detail),
    path('invoices/<int:invoice_id>/status/', views.update_invoice_status),

]