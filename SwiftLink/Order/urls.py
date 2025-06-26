from django.urls import path
from .views import LikeOrderView,OrdersByServiceTypeView,CreateOrderView,AllOrdersView
from . import views

urlpatterns = [
    path('orders/<int:order_id>/like/', LikeOrderView.as_view(), name='like-order'),
    path('orders/my-service/', OrdersByServiceTypeView.as_view(), name='orders-by-service'),
     path('orders/create/', CreateOrderView.as_view(), name='create-order'),
     path('orders/', AllOrdersView.as_view(), name='all-orders'),
     path('order/confirm-assignment/',views.confirm_order_assignment),
     path('orders/agenda/',views.helper_agenda),
     path('orders/<int:order_id>/update-duration/', views.update_order_duration),
    path('orders/today/', views.orders_today),
    path('dashboard/helper/', views.helper_dashboard),
    path('dashboard/work-orders/', views.work_orders_dashboard),
    path('orders/client-booked/', views.client_booked_orders),
]
