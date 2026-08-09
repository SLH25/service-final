from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Manager du modèle User custom (rôles CLIENT / PRESTATAIRE / ADMIN)."""

    use_in_migrations = True

    def _create_user(self, username, email, password, role, **extra_fields):
        if not username:
            raise ValueError("Le nom d'utilisateur est requis.")
        email = self.normalize_email(email) if email else ""
        user = self.model(username=username, email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(
            username, email, password, self.model.Role.CLIENT, **extra_fields
        )

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Le superutilisateur doit avoir is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Le superutilisateur doit avoir is_superuser=True.")
        return self._create_user(
            username, email, password, self.model.Role.ADMIN, **extra_fields
        )


class User(AbstractUser):
    """Modèle d'authentification unique pour toute l'application.

    Contient UNIQUEMENT les informations de connexion : username, email,
    mot de passe et rôle. Les données métier (nom, prénom, téléphone, etc.)
    sont stockées dans les profils Client / Prestataire liés en OneToOne.
    """

    class Role(models.TextChoices):
        CLIENT = "CLIENT", "Client"
        PRESTATAIRE = "PRESTATAIRE", "Prestataire"
        ADMIN = "ADMIN", "Administrateur"

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.CLIENT
    )

    # Nom / prénom retirés du User : ils vivent dans les profils métier
    first_name = None
    last_name = None

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    @property
    def profile(self):
        """Retourne le profil métier selon le rôle (None si aucun)."""
        if self.role == self.Role.PRESTATAIRE:
            return getattr(self, "prestataire", None)
        if self.role == self.Role.CLIENT:
            return getattr(self, "client", None)
        return None

    def __str__(self):
        return self.username


class Service(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Client(models.Model):
    """Profil métier d'un client, relié en OneToOne au User d'authentification."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    telephone = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def email(self):
        return self.user.email

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Prestataire(models.Model):
    """Profil métier d'un prestataire, relié en OneToOne au User d'authentification.

    L'authentification (username/password/email/role) appartient exclusivement au
    modèle User. Le profil Prestataire ne contient que les informations métier.
    La création passe UNIQUEMENT par l'inscription publique (endpoint register).
    """

    class Status(models.TextChoices):
        PENDING = "PENDING", "En attente"
        AFFICHE = "AFFICHE", "Affiché"
        VERIFIED = "VERIFIED", "Vérifié"
        REJECTED = "REJECTED", "Refusé"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="prestataire",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    service = models.ForeignKey(
        Service, on_delete=models.SET_NULL, null=True, blank=True, related_name="prestataires"
    )
    telephone = models.CharField(max_length=30, blank=True)
    telephone_secondaire = models.CharField(max_length=30, blank=True)
    description = models.TextField(blank=True)
    photo = models.URLField(blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    ville = models.CharField(max_length=100, blank=True)
    experience = models.PositiveIntegerField(null=True, blank=True, help_text="Années d'expérience")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["service", "status"]),
        ]

    @property
    def email(self):
        return self.user.email

    @property
    def is_visible(self):
        """Un prestataire est visible publiquement s'il est VERIFIED ou AFFICHE."""
        return self.status in (self.Status.VERIFIED, self.Status.AFFICHE)

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
        ("client", "Client"),
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
