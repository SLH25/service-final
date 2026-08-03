from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import AuditLog, Prestataire, Service


def _log_audit(entity_type: str, entity_id, action: str, actor=None, details: str = ""):
    """Helper pour créer un événement d'audit."""
    AuditLog.objects.create(
        entity_type=entity_type,
        entity_id=str(entity_id),
        action=action,
        actor=actor if actor and actor.is_authenticated else None,
        details=details[:255],
    )


# ── Utilisateurs ─────────────────────────────────────────

@receiver(post_save, sender=User)
def log_user_save(sender, instance, created, **kwargs):
    # Ignorer les créations via le shell ou les fixtures sans utilisateur connecté
    _log_audit(
        "user",
        instance.id,
        "create" if created else "update",
        actor=getattr(instance, "_audit_actor", None),
        details=f"Utilisateur {instance.username} {'créé' if created else 'modifié'}",
    )


@receiver(post_delete, sender=User)
def log_user_delete(sender, instance, **kwargs):
    _log_audit(
        "user",
        instance.id,
        "delete",
        actor=getattr(instance, "_audit_actor", None),
        details=f"Utilisateur {instance.username} supprimé",
    )


# ── Prestataires ─────────────────────────────────────────

@receiver(post_save, sender=Prestataire)
def log_prestataire_save(sender, instance, created, **kwargs):
    _log_audit(
        "prestataire",
        instance.id,
        "create" if created else "update",
        actor=getattr(instance, "_audit_actor", None),
        details=f"Prestataire {instance.first_name} {instance.last_name} {'créé' if created else 'modifié'}",
    )


@receiver(post_delete, sender=Prestataire)
def log_prestataire_delete(sender, instance, **kwargs):
    _log_audit(
        "prestataire",
        instance.id,
        "delete",
        actor=getattr(instance, "_audit_actor", None),
        details=f"Prestataire {instance.first_name} {instance.last_name} supprimé",
    )


# ── Services ─────────────────────────────────────────────

@receiver(post_save, sender=Service)
def log_service_save(sender, instance, created, **kwargs):
    _log_audit(
        "service",
        instance.id,
        "create" if created else "update",
        actor=getattr(instance, "_audit_actor", None),
        details=f"Service {instance.name} {'créé' if created else 'modifié'}",
    )


@receiver(post_delete, sender=Service)
def log_service_delete(sender, instance, **kwargs):
    _log_audit(
        "service",
        instance.id,
        "delete",
        actor=getattr(instance, "_audit_actor", None),
        details=f"Service {instance.name} supprimé",
    )