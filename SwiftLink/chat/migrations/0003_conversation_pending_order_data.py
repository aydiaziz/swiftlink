from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('chat', '0002_conversation_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='conversation',
            name='pending_order_data',
            field=models.JSONField(null=True, blank=True),
        ),
    ]
