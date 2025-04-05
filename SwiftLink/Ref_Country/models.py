from django.db import models
from Ref_Entity.models import Ref_Entity


class RefCountry(models.Model):
    country_id = models.AutoField(primary_key=True)
    entityId = models.ForeignKey(Ref_Entity, on_delete=models.CASCADE)
    country_name = models.CharField(max_length=255, unique=True)
    country_code = models.CharField(max_length=10, unique=True)  
    country_dial_code = models.CharField(max_length=10) 
    region = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.country_name} ({self.country_code})"
