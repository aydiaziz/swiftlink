
from django.db import models
from Ref_User.models import Ref_User
from Order.models import Order

class Conversation(models.Model):
    client = models.ForeignKey(Ref_User, related_name='client_conversations', on_delete=models.CASCADE)
    helper = models.ForeignKey(Ref_User, related_name='helper_conversations', on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(Ref_User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
