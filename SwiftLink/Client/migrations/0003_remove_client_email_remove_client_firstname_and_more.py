# Generated by Django 5.1.6 on 2025-03-17 23:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Client', '0002_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='client',
            name='email',
        ),
        migrations.RemoveField(
            model_name='client',
            name='firstname',
        ),
        migrations.RemoveField(
            model_name='client',
            name='lastname',
        ),
        migrations.RemoveField(
            model_name='client',
            name='password',
        ),
    ]
