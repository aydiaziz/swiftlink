from django.db import models
from Order.models import Order
from Workforce.models import WorkForce

class Invoice(models.Model):
    invoiceID = models.AutoField(primary_key=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice')
    helper = models.ForeignKey(WorkForce, on_delete=models.SET_NULL, null=True, blank=True)
    
    serviceType = models.CharField(max_length=255)
    duration = models.DurationField()  # durée totale
    unitPrice = models.DecimalField(max_digits=10, decimal_places=2)
    baseAmount = models.DecimalField(max_digits=10, decimal_places=2)  # unitPrice * durée (arrondie)

    # Divers (extra items)
    extras = models.JSONField(default=list, blank=True)  # [{'label': 'Extra cleaning', 'price': 50.00}, ...]

    totalAmount = models.DecimalField(max_digits=10, decimal_places=2)
    createdAt = models.DateTimeField(auto_now_add=True)
    sentToClient = models.BooleanField(default=False)

    def __str__(self):
        return f"Invoice {self.invoiceID} for Order {self.order.orderID}"

