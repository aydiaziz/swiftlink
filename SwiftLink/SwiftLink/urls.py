from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/api/', include('Ref_User.urls',)),
    path('api/api/', include('Ref_Entity.urls',)),
    path('api/api/', include('ServiceType.urls',)),
    path('api/api/', include('Order.urls',)),
    path('api/api/', include('notification.urls',)),
    path('api/api/', include('Workforce.urls',)),
    path('api/chat/api/', include('chat.urls')),
    path('api/api/', include('invoice.urls')),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
