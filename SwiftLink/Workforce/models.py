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
    professionnelemail = models.EmailField(max_length=255, blank=True)
    driverLicenceFile = models.FileField(upload_to='licenses/', null=True, blank=True)
    wcbNumber = models.CharField(max_length=100, blank=True)
    wcbFile = models.FileField(upload_to='wcb_clearances/', null=True, blank=True)
    city = models.CharField(max_length=100, blank=True)
    province = models.CharField(max_length=100, blank=True)
    postalCode = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default='Canada')
    phone = models.CharField(max_length=20)   
    gender = models.CharField(max_length=50, choices=Gender.choices)
    dateOfBirth = models.DateField(null=True,blank=True)
    socialSecurityNumber = models.CharField(max_length=20, blank=True) 
    skills = models.TextField(null=True, blank=True)  
    address = models.CharField(max_length=255, blank=True)
    workCategory = models.ManyToManyField(ServiceType) 
    availability = models.JSONField( blank=True)  
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
    acces = models.IntegerField(default=0)
    careerExpectations = models.TextField(null=True, blank=True)
    referralSource = models.CharField(max_length=100, blank=True)
    wantsUpdates = models.BooleanField(default=False)
    securityFundRate = models.DecimalField(max_digits=5, decimal_places=2, default=15.0)  # %
    platformFeeRate = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)   # %
    clientChargeRate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    consumablesFee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    yearsOfExperience = models.TextField(blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    driverLicenceClass = models.CharField(max_length=50, blank=True, null=True)
    def __str__(self):
        return f"{self.firstName} {self.lastName} - {self.workForceType}"
