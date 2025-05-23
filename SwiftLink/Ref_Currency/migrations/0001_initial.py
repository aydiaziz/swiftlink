# Generated by Django 5.1.6 on 2025-03-10 15:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('Ref_Entity', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='RefCurrency',
            fields=[
                ('currency_id', models.AutoField(primary_key=True, serialize=False)),
                ('currency_code', models.CharField(choices=[('USD', 'US Dollar'), ('EUR', 'Euro'), ('GBP', 'British Pound'), ('CAD', 'Canadian Dollar'), ('AUD', 'Australian Dollar')], max_length=10, unique=True)),
                ('currency_name', models.CharField(max_length=255)),
                ('currency_symbol', models.CharField(max_length=10)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Inactive', 'Inactive')], max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('entityId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Ref_Entity.ref_entity')),
            ],
        ),
    ]
