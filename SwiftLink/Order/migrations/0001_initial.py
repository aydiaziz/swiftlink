# Generated by Django 5.1.6 on 2025-03-10 15:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('Client', '0001_initial'),
        ('Ref_Entity', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('orderID', models.AutoField(primary_key=True, serialize=False)),
                ('division', models.CharField(choices=[('PROS', 'PROS'), ('Helper', 'Helper')], max_length=50)),
                ('jobTitle', models.CharField(max_length=255)),
                ('jobStatus', models.CharField(choices=[('Pending', 'Pending'), ('Booked', 'Booked'), ('Completed', 'Completed'), ('Canceled', 'Canceled')], default='Pending', max_length=50)),
                ('jobAddress', models.CharField(max_length=255)),
                ('priorityLevel', models.CharField(choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')], default='Low', max_length=50)),
                ('serviceType', models.CharField(max_length=100)),
                ('creationDate', models.DateTimeField(auto_now_add=True)),
                ('executionDate', models.DateTimeField()),
                ('assignedTo', models.JSONField()),
                ('orderDuration', models.DurationField()),
                ('expirationTime', models.DateTimeField()),
                ('expressedInterest', models.JSONField()),
                ('manpower', models.IntegerField()),
                ('jobResources', models.TextField()),
                ('clientID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Client.client')),
                ('entityID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Ref_Entity.ref_entity')),
            ],
        ),
    ]
