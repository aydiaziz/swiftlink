from django.db import models
from invoice.models import Invoice
from Workforce.models import WorkForce

class Rating(models.Model):
    invoice = models.OneToOneField(Invoice, on_delete=models.CASCADE, related_name='rating')
    helper = models.ForeignKey(WorkForce, on_delete=models.CASCADE, related_name='ratings')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating {self.rating} for Invoice {self.invoice_id}"
