from django.db import models
from Ref_User.models import Ref_User  

class Notification(models.Model):
    user = models.ForeignKey(Ref_User, on_delete=models.CASCADE) #id du client por recevoir la notif 
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    related_helper = models.ForeignKey(Ref_User, related_name='notif_helper', on_delete=models.CASCADE,default=16)
    order = models.ForeignKey('Order.Order', on_delete=models.CASCADE, null=True, blank=True)
    def __str__(self):
        return f"Notif for {self.user.email}: {self.message}"
