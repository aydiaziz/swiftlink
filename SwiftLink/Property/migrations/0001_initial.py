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
            name='Property',
            fields=[
                ('propertyID', models.AutoField(primary_key=True, serialize=False)),
                ('address', models.CharField(max_length=255)),
                ('city', models.CharField(max_length=100)),
                ('province', models.CharField(max_length=100)),
                ('postalCode', models.CharField(max_length=20)),
                ('propertyType', models.CharField(choices=[('Residential', 'Residential'), ('Commercial', 'Commercial'), ('Industrial', 'Industrial')], max_length=50)),
                ('serviceHistory', models.TextField()),
                ('createdAt', models.DateTimeField(auto_now_add=True)),
                ('lastUpdate', models.DateTimeField(auto_now=True)),
                ('propertyDetails', models.TextField()),
                ('clientID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Client.client')),
                ('entityID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='Ref_Entity.ref_entity')),
            ],
        ),
    ]
