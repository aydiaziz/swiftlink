from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('invoice', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='invoice',
            name='status',
            field=models.CharField(choices=[('paid by E-transfer', 'Paid by E-transfer'), ('paid by cash', 'Paid by cash'), ('Future Payment', 'Future Payment'), ('In Dispute', 'In Dispute')], default='Future Payment', max_length=50),
        ),
        migrations.AddField(
            model_name='invoice',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
    ]
