from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('Ref_User.urls',)),
    path('api/', include('Ref_Entity.urls',)),
    path('api/', include('ServiceType.urls',)),
    path('api/', include('Order.urls',)),
    path('api/', include('notification.urls',)),
]
