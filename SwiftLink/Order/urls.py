from django.urls import path
from .views import LikeOrderView,OrdersByServiceTypeView,CreateOrderView,AllOrdersView

urlpatterns = [
    path('orders/<int:order_id>/like/', LikeOrderView.as_view(), name='like-order'),
    path('orders/my-service/', OrdersByServiceTypeView.as_view(), name='orders-by-service'),
     path('orders/create/', CreateOrderView.as_view(), name='create-order'),
     path('orders/', AllOrdersView.as_view(), name='all-orders'),
]
