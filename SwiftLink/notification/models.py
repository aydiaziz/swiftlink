from django.db import models
from Ref_User.models import Ref_User  

class Notification(models.Model):
    user = models.ForeignKey(Ref_User, on_delete=models.CASCADE)  
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notif for {self.user.email}: {self.message}"
