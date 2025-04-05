from django.db import models
from Ref_Entity.models import Ref_Entity
from Client.models import Client


class Property(models.Model):
    class PropertyType(models.TextChoices):
        RESIDENTIAL = 'Residential', 'Residential'
        COMMERCIAL = 'Commercial', 'Commercial'
        INDUSTRIAL = 'Industrial', 'Industrial'

    propertyID = models.AutoField(primary_key=True)
    clientID = models.ForeignKey(Client, on_delete=models.CASCADE)  
    entityID = models.ForeignKey(Ref_Entity, on_delete=models.CASCADE)  
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    postalCode = models.CharField(max_length=20)
    propertyType = models.CharField(max_length=50, choices=PropertyType.choices)
    serviceHistory = models.TextField()  
    createdAt = models.DateTimeField(auto_now_add=True)
    lastUpdate = models.DateTimeField(auto_now=True)
    propertyDetails = models.TextField()

    def __str__(self):
        return f"Property {self.propertyID} - {self.address}"
