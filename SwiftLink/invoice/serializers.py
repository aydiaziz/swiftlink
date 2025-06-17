from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    helper_professional_email = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = '__all__'

    def get_helper_professional_email(self, obj):
        if obj.helper:
            return obj.helper.professionnelemail
        return None
