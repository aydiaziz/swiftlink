from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('Ref_User.urls',)),
    path('api/', include('Ref_Entity.urls',)),
    path('api/', include('ServiceType.urls',)),
    path('api/', include('Order.urls',)),
    path('api/', include('notification.urls',)),
    path('api/', include('Workforce.urls',)),
    path('api/', include('Client.urls',)),
    path('api/chat/', include('chat.urls')),
    path('api/', include('invoice.urls')),
    path('api/', include('rating.urls')),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
