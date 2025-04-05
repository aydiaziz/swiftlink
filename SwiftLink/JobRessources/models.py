
from django.db import models

class JobResources(models.Model):
    
    class ResourceCategory(models.TextChoices):
        EQUIPMENT = 'EQUIPMENT', 'Equipment'
        MATERIAL = 'MATERIAL', 'Material'
        PART = 'PART', 'Part'

   
    jobResourcesID = models.AutoField(primary_key=True, verbose_name='Job Resource ID')
    name = models.CharField(max_length=255, verbose_name='Resource Name')
    category = models.CharField(
        max_length=10,
        choices=ResourceCategory.choices,
        verbose_name='Category'
    )
    technicalSpecification = models.TextField(verbose_name='Technical Specification')
    description = models.TextField(verbose_name='Description', blank=True, null=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Price'
    )
    jobResourceRate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Job Resource Rate'
    )
    chargeableToClient = models.BooleanField(
        default=True,
        verbose_name='Chargeable to Client'
    )
    quantity = models.IntegerField(verbose_name='Quantity', default=1)
    linkedToService = models.BooleanField(
        default=False,
        verbose_name='Linked to Service'
    )
    archived = models.BooleanField(default=False, verbose_name='Archived')
    createdAt = models.DateTimeField(auto_now_add=True, verbose_name='Created At')
    updatedAt = models.DateTimeField(auto_now=True, verbose_name='Updated At')

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

    class Meta:
        verbose_name = 'Job Resource'
        verbose_name_plural = 'Job Resources'