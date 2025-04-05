from django.db import models
from Ref_Entity.models import Ref_Entity
from Ref_User.models import Ref_User 

class Client(models.Model):
    class ClientType(models.TextChoices):
        INDIVIDUAL = 'Individual', 'Individual'
        BUSINESS = 'Business', 'Business'

    clientID = models.AutoField(primary_key=True)
    entityID = models.ForeignKey(Ref_Entity, on_delete=models.CASCADE)
    UserId=models.OneToOneField(
        Ref_User,
        on_delete=models.CASCADE,
        primary_key=False,
        limit_choices_to={'role': 'CLIENT'}  
    )
    clientType = models.CharField(max_length=50, choices=ClientType.choices,null=True, blank=True)
    address = models.CharField(max_length=255,null=True, blank=True)
    city = models.CharField(max_length=100,null=True, blank=True)
    province = models.CharField(max_length=100,null=True, blank=True)
    postalCode = models.CharField(max_length=20,null=True, blank=True)
    phone = models.CharField(max_length=20,null=True, blank=True)
    preferredService = models.CharField(max_length=100,null=True, blank=True)
    preferredPaymentMethod = models.CharField(max_length=50,null=True, blank=True)

    def __str__(self):
        return f"{self.firstname} {self.lastname}"
