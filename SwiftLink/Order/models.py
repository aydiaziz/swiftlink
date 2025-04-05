from django.db import models
from Ref_Entity.models import Ref_Entity
from Client.models import Client
class Order(models.Model):
    class JobStatus(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        BOOKED = 'Booked', 'Booked'
        COMPLETED = 'Completed', 'Completed'
        CANCELED = 'Canceled', 'Canceled'

    class PriorityLevel(models.TextChoices):
        LOW = 'Low', 'Low'
        MEDIUM = 'Medium', 'Medium'
        HIGH = 'High', 'High'

    division_choices = [
        ('PROS', 'PROS'),
        ('Helper', 'Helper'),
    ]

    orderID = models.AutoField(primary_key=True)
    entityID = models.ForeignKey(Ref_Entity, on_delete=models.CASCADE) 
    clientID = models.ForeignKey(Client, on_delete=models.CASCADE)  
    division = models.CharField(max_length=50, choices=division_choices)
    jobTitle = models.CharField(max_length=255,null=True, blank=True)
    jobStatus = models.CharField(max_length=50, choices=JobStatus.choices, default=JobStatus.PENDING)
    jobAddress = models.CharField(max_length=255,null=True, blank=True)
    priorityLevel = models.CharField(max_length=50, choices=PriorityLevel.choices, default=PriorityLevel.LOW)
    serviceType = models.CharField(max_length=100) #list
    creationDate = models.DateTimeField(auto_now_add=True)
    executionDate = models.DateTimeField(null=True, blank=True)
    assignedTo = models.JSONField(null=True, blank=True)  
    orderDuration = models.DurationField(null=True, blank=True)  
    expirationTime = models.DateTimeField(null=True, blank=True)
    expressedInterest = models.JSONField(default=list, blank=True) 
    manpower = models.IntegerField(null=True, blank=True) 
    jobResources = models.TextField(null=True, blank=True) 

    def __str__(self):
        return f"Order {self.orderID} - {self.jobTitle}"
