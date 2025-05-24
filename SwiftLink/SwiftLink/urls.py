from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api1/', include('Ref_User.urls',)),
    path('api1/', include('Ref_Entity.urls',)),
    path('api1/', include('ServiceType.urls',)),
    path('api1/', include('Order.urls',)),
    path('api1/', include('notification.urls',)),
    path('api1/', include('Workforce.urls',)),
    path('api1/chat/', include('chat.urls')),
    path('api1/', include('invoice.urls')),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
