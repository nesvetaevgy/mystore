from django.db import models


class Product(models.Model):
    photo = models.ImageField()
    title = models.CharField(max_length=32)
    price = models.PositiveIntegerField()
    details = models.JSONField()

    def __str__(self):
        return self.title


class Order(models.Model):
    uuid = models.UUIDField()
    invoice_link = models.URLField()
    user_id = models.BigIntegerField()
    products = models.JSONField()
    status = models.CharField(max_length=16)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.pk)