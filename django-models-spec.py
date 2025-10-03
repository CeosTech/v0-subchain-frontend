# Spécifications des modèles Django pour SubChain
# À utiliser comme référence pour créer les modèles dans Django

"""
# models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator
import uuid
import secrets

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    wallet_address = models.CharField(max_length=58, blank=True, null=True)
    plan_tier = models.CharField(
        max_length=20,
        choices=[
            ('starter', 'Starter'),
            ('pro', 'Pro'),
            ('enterprise', 'Enterprise'),
        ],
        default='starter'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='plans')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=6, validators=[MinValueValidator(0)])
    currency = models.CharField(
        max_length=10,
        choices=[('ALGO', 'ALGO'), ('USDC', 'USDC')],
        default='ALGO'
    )
    interval = models.CharField(
        max_length=10,
        choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')],
        default='monthly'
    )
    features = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=10,
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('draft', 'Draft'),
        ],
        default='draft'
    )
    subscriber_count = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

class Subscriber(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='subscribers')
    wallet_address = models.CharField(max_length=58)
    email = models.EmailField(blank=True, null=True)
    status = models.CharField(
        max_length=15,
        choices=[
            ('active', 'Active'),
            ('cancelled', 'Cancelled'),
            ('paused', 'Paused'),
            ('past_due', 'Past Due'),
        ],
        default='active'
    )
    start_date = models.DateTimeField(auto_now_add=True)
    next_payment_date = models.DateTimeField(blank=True, null=True)
    last_payment_date = models.DateTimeField(blank=True, null=True)
    total_paid = models.DecimalField(max_digits=15, decimal_places=6, default=0)
    payment_method = models.CharField(max_length=50, default='algorand_wallet')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['plan', 'wallet_address']

class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscriber = models.ForeignKey(Subscriber, on_delete=models.CASCADE, related_name='payments')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=6, validators=[MinValueValidator(0)])
    currency = models.CharField(
        max_length=10,
        choices=[('ALGO', 'ALGO'), ('USDC', 'USDC')],
        default='ALGO'
    )
    status = models.CharField(
        max_length=15,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('refunded', 'Refunded'),
        ],
        default='pending'
    )
    transaction_hash = models.CharField(max_length=64, blank=True, null=True)
    algorand_txn_id = models.CharField(max_length=64, blank=True, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(blank=True, null=True)
    failure_reason = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

class Webhook(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='webhooks')
    url = models.URLField()
    events = models.JSONField(default=list)
    secret = models.CharField(max_length=64, default=lambda: secrets.token_urlsafe(32))
    is_active = models.BooleanField(default=True)
    last_triggered = models.DateTimeField(blank=True, null=True)
    failure_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

class APIKey(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100)
    key = models.CharField(max_length=64, unique=True, default=lambda: f"sk_{'test' if settings.DEBUG else 'live'}_{secrets.token_urlsafe(32)}")
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

class WebhookEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    webhook = models.ForeignKey(Webhook, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=50)
    payload = models.JSONField()
    status = models.CharField(
        max_length=15,
        choices=[
            ('pending', 'Pending'),
            ('delivered', 'Delivered'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    attempts = models.PositiveIntegerField(default=0)
    response_status = models.PositiveIntegerField(blank=True, null=True)
    response_body = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
"""
