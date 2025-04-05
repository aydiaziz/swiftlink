from django.db import models

class Ref_Entity(models.Model):  
    entity_id = models.AutoField(primary_key=True)  
    label = models.CharField(max_length=255)  
    created_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):  
        return self.label  
    @classmethod
    def addEntity(cls, label):
            """Ajoute une nouvelle entité avec un label donné."""
            entity, created = cls.objects.get_or_create(label=label)
            return entity, created