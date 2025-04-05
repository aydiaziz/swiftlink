from django.db import models
from JobRessources.models import JobResources
from Ref_Entity.models import Ref_Entity

from django.db import models

class ServiceType(models.Model):
   
    class Division(models.TextChoices):
        PROS = 'PROS', 'Professionals'
        HELPER = 'HELPER', 'Helpers'
        OTHER = 'OTHER', 'Other'

    
    serviceTypeID = models.AutoField(primary_key=True, verbose_name='Service Type ID')
    entity = models.ForeignKey(Ref_Entity, on_delete=models.CASCADE, verbose_name='Related Entity')
    serviceName = models.CharField(max_length=255, verbose_name='Service Name')
    serviceDescription = models.TextField(verbose_name='Service Description')
    manpower = models.IntegerField(verbose_name='Manpower Required', default=1)
    manpowerRate = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Manpower Rate')
    jobResourcesRate = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Job Resources Rate',null=True, blank=True)
    division = models.CharField(max_length=10, choices=Division.choices, verbose_name='Division')
    isActive = models.BooleanField(default=True, verbose_name='Is Active')
    createdAt = models.DateTimeField(auto_now_add=True, verbose_name='Created At')
    fixedServiceRate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Fixed Service Rate'
    )

   
    jobResources = models.ManyToManyField(
        JobResources,
        blank=True,
        verbose_name='Job Resources',
        related_name='service_types'
    )

    def __str__(self):
        return self.serviceName

    class Meta:
        verbose_name = 'Service Type'
        verbose_name_plural = 'Service Types'