from django.db import models
from Ref_Entity.models import Ref_Entity
from Ref_User.models import Ref_User
from ServiceType.models import ServiceType

class WorkForce(models.Model):
    class Gender(models.TextChoices):
        MALE = 'Male', 'Male'
        FEMALE = 'Female', 'Female'
        OTHER = 'Other', 'Other'

    class WorkForceType(models.TextChoices):
        OFFICE_ADMIN = 'Office Admin', 'Office Admin'
        OPERATION_SUPERVISOR = 'Operation Supervisor', 'Operation Supervisor'
        TEAM_LEAD = 'Team Lead', 'Team Lead'
        EMPLOYEE = 'Employee', 'Employee'
        PROFESSIONAL_HELPER = 'Professional Helper', 'Professional Helper'
        GENERAL_HELPER = 'General Helper', 'General Helper'
        EXPERT = 'Expert', 'Expert'

    entityID = models.ForeignKey(Ref_Entity, on_delete=models.CASCADE)  
    UserId= models.OneToOneField(
        Ref_User,
        on_delete=models.CASCADE,
        primary_key=True,
        limit_choices_to={'role': 'WORKFORCE'}
    )
    
    phone = models.CharField(max_length=20)   
    gender = models.CharField(max_length=50, choices=Gender.choices)
    dateOfBirth = models.DateField()
    socialSecurityNumber = models.CharField(max_length=20) 
    skills = models.TextField(null=True, blank=True)  
    address = models.CharField(max_length=255)
    workCategory = models.ManyToManyField(ServiceType) 
    availability = models.JSONField()  
    hourlyRatebyService = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True) 
    fixedRate = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)  
    driverLicence = models.CharField(max_length=50,null=True, blank=True)  
    driverLicenceExpiry = models.DateField(null=True, blank=True)  
    credentials = models.TextField(null=True, blank=True) 
    credentialsExpiry = models.DateField(null=True, blank=True)  
    training = models.TextField(null=True, blank=True)  
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00,null=True, blank=True)  
    workForceType = models.CharField(max_length=50, choices=WorkForceType.choices)
    createdAt = models.DateTimeField(auto_now_add=True) 
    def __str__(self):
        return f"{self.firstName} {self.lastName} - {self.workForceType}"
