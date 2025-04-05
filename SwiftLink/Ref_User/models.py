from django.db import models
from Ref_Entity.models import Ref_Entity
from django.contrib.auth.models import AbstractUser
class RoleType(models.TextChoices):
    SUPER_ADMIN = "Super Admin", "Super Admin"
    TERRITORY_ADMIN = "Territory Admin", "Territory Admin"
    MANAGER = "Manager", "Manager"
    OFFICE_ADMIN = "Office Admin", "Office Admin"
    OPERATION_SUPERVISOR = "Operation Supervisor", "Operation Supervisor"
    TEAM_LEAD = "Team Lead", "Team Lead"
    EMPLOYEE = "Employee", "Employee"
    THIRD_PARTY = "3rd Party", "3rd Party"
    CLIENT = "Client", "Client"

class Ref_User(AbstractUser):
    user_id = models.AutoField(primary_key=True)
    entityId = models.ForeignKey(Ref_Entity, on_delete=models.CASCADE) 
    first_name = models.CharField(max_length=100) 
    last_name = models.CharField(max_length=100)   
    email = models.EmailField(max_length=255)
    password = models.CharField(max_length=255) 
    role = models.CharField(max_length=50, choices=RoleType.choices)
    status = models.CharField(max_length=50, choices=[('Active', 'Active'), ('Inactive', 'Inactive')])
    assigned_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id} - {self.role}"


