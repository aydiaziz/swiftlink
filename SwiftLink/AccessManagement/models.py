from django.db import models
from .models import Ref_Entity, Ref_Role, Ref_User

class AccessManagement(models.Model):
    access_id = models.AutoField(primary_key=True)
    entityId = models.ForeignKey(Ref_Entity, on_delete=models.CASCADE)
    role = models.ForeignKey(Ref_Role, on_delete=models.CASCADE)  
    user = models.ForeignKey(Ref_User, on_delete=models.CASCADE)  
    permission = models.CharField(max_length=100)  
    status = models.CharField(max_length=50, choices=[('Granted', 'Granted'), ('Revoked', 'Revoked')])
    assigned_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role.role_type} - {self.permission} - {self.status}"

