from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('Ref_User.urls',)),
    path('', include('Ref_Entity.urls',)),
    path('', include('ServiceType.urls',)),
    path('', include('Order.urls',)),
    path('', include('notification.urls',)),
    path('', include('Workforce.urls',)),
    path('chat/', include('chat.urls')),
    path('', include('invoice.urls')),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
