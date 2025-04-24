from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    verification_code = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return self.email


class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return self.name


class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)

    def get_total_price(self):
        """Calculate the total price of the order."""
        return sum(item.get_item_total() for item in self.items.all())

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def save(self, *args, **kwargs):
        """Override save to capture the product price at time of order."""
        if not self.price and self.product:
            self.price = self.product.price
        super().save(*args, **kwargs)

    def get_item_total(self):
        """Calculate the total price for this order item."""
        if self.price:
            return self.price * self.quantity
        return self.product.price * self.quantity if self.product else 0

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
