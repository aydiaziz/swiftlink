from django.db import models
from Ref_Entity.models import Ref_Entity


class CurrencyCode(models.TextChoices):
    USD = "USD", "US Dollar"
    EUR = "EUR", "Euro"
    GBP = "GBP", "British Pound"
    CAD = "CAD", "Canadian Dollar"
    AUD = "AUD", "Australian Dollar"

class RefCurrency(models.Model):
    currency_id = models.AutoField(primary_key=True)
    entityId = models.ForeignKey(Ref_Entity, on_delete=models.CASCADE)  
    currency_code = models.CharField(max_length=10, choices=CurrencyCode.choices, unique=True)
    currency_name = models.CharField(max_length=255)
    currency_symbol = models.CharField(max_length=10)
    status = models.CharField(max_length=50, choices=[('Active', 'Active'), ('Inactive', 'Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.currency_name} ({self.currency_code})"
