from django.conf import settings
from django.db import models


class Service(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Prestataire(models.Model):
    STATUS_CHOICES = [
        ("Actif", "Actif"),
        ("Inactif", "Inactif"),
        ("En attente", "En attente"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True, blank=True, related_name="prestataires"
    )
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="En attente")
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class AuditLog(models.Model):
    """Journal d'audit des actions administrateur (CRUD)."""

    ACTION_CHOICES = [
        ("create", "Création"),
        ("update", "Modification"),
        ("delete", "Suppression"),
    ]

    ENTITY_CHOICES = [
        ("user", "Utilisateur"),
        ("prestataire", "Prestataire"),
        ("service", "Service"),
    ]

    entity_type = models.CharField(max_length=30, choices=ENTITY_CHOICES)
    entity_id = models.CharField(max_length=36, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs"
    )
    details = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["entity_type", "entity_id"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"{self.action} {self.entity_type} #{self.entity_id} par {self.actor or 'system'}"
