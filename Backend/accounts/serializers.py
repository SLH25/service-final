from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Service, Prestataire, Client, User


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    """Représentation d'un utilisateur (admin), avec son profil métier."""

    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "role",
            "is_active",
            "is_staff",
            "date_joined",
            "last_login",
            "profile",
        )
        read_only_fields = ("id", "date_joined", "last_login", "profile")

    def get_profile(self, obj):
        profile = obj.profile
        if profile is None:
            return None
        if obj.role == User.Role.PRESTATAIRE:
            return PrestataireSerializer(profile).data
        if obj.role == User.Role.CLIENT:
            return ClientSerializer(profile).data
        return None


class ClientSerializer(serializers.ModelSerializer):
    """Lecture d'un client (admin). L'email provient du User (jamais dupliqué)."""

    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Client
        fields = (
            "id",
            "user",
            "username",
            "email",
            "first_name",
            "last_name",
            "telephone",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")


class ClientUpdateSerializer(serializers.ModelSerializer):
    """Modification d'un client par l'administrateur (jamais de création)."""

    email = serializers.EmailField(required=False)

    class Meta:
        model = Client
        fields = ("first_name", "last_name", "telephone", "email")

    def update(self, instance, validated_data):
        email = validated_data.pop("email", None)
        if email and instance.user:
            instance.user.email = email
            request = self.context.get("request")
            instance.user._audit_actor = request.user if request else None
            instance.user.save(update_fields=["email"])
        return super().update(instance, validated_data)


class PrestataireSerializer(serializers.ModelSerializer):
    """Lecture d'un prestataire (admin). L'email provient du User (jamais dupliqué)."""

    service_name = serializers.CharField(source="service.name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Prestataire
        fields = (
            "id",
            "user",
            "username",
            "email",
            "first_name",
            "last_name",
            "service",
            "service_name",
            "telephone",
            "telephone_secondaire",
            "description",
            "photo",
            "adresse",
            "ville",
            "experience",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")


class PrestataireUpdateSerializer(serializers.ModelSerializer):
    """Modification d'un prestataire par l'administrateur (jamais de création)."""

    email = serializers.EmailField(required=False)

    class Meta:
        model = Prestataire
        fields = (
            "first_name",
            "last_name",
            "service",
            "email",
            "telephone",
            "telephone_secondaire",
            "description",
            "photo",
            "adresse",
            "ville",
            "experience",
            "status",
        )

    def update(self, instance, validated_data):
        email = validated_data.pop("email", None)
        if email and instance.user:
            instance.user.email = email
            request = self.context.get("request")
            instance.user._audit_actor = request.user if request else None
            instance.user.save(update_fields=["email"])
        return super().update(instance, validated_data)


class ServiceSerializer(serializers.ModelSerializer):
    prestataires_count = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ("id", "name", "description", "active", "created_at", "prestataires_count")
        read_only_fields = ("id", "created_at")

    def get_prestataires_count(self, obj):
        # Même filtre que le site public : seuls les prestataires visibles comptent
        return obj.prestataires.filter(
            status__in=(Prestataire.Status.VERIFIED, Prestataire.Status.AFFICHE)
        ).count()


class RegisterSerializer(serializers.Serializer):
    """Inscription publique — UNIQUE source de création des comptes.

    Crée le User d'authentification + le profil métier :
      - rôle CLIENT      → profile Client
      - rôle PRESTATAIRE → profile Prestataire (status=PENDING, invisible)
    """

    # Authentification (User)
    role = serializers.ChoiceField(
        choices=["client", "prestataire"], write_only=True
    )
    username = serializers.CharField(write_only=True, max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    accept_terms = serializers.BooleanField(write_only=True)

    # Communs (profils métier)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    telephone = serializers.CharField(required=False, allow_blank=True, max_length=30)

    # Prestataire uniquement
    service = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.filter(active=True),
        required=False,
        allow_null=True,
    )
    telephone_secondaire = serializers.CharField(required=False, allow_blank=True, max_length=30)
    experience = serializers.IntegerField(required=False, allow_null=True, min_value=0, max_value=99)
    description = serializers.CharField(required=False, allow_blank=True)
    ville = serializers.CharField(required=False, allow_blank=True, max_length=100)
    adresse = serializers.CharField(required=False, allow_blank=True, max_length=255)

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        role = attrs.get("role")
        # Seuls les prestataires doivent obligatoirement accepter les conditions
        if role == "prestataire" and not attrs.get("accept_terms"):
            raise serializers.ValidationError(
                {"accept_terms": "Vous devez accepter les conditions d'utilisation."}
            )
        username = attrs.get("username", "").strip()
        if not username:
            raise serializers.ValidationError({"username": "Le nom d'utilisateur est requis."})
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError(
                {"username": "Ce nom d'utilisateur est déjà pris."}
            )
        email = attrs.get("email", "").lower().strip()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                {"email": "Un compte avec cet email existe déjà."}
            )
        if role == "prestataire":
            if not attrs.get("first_name") or not attrs.get("last_name"):
                raise serializers.ValidationError(
                    {"first_name": "Le prénom et le nom sont requis pour un prestataire."}
                )
            if not attrs.get("service"):
                raise serializers.ValidationError(
                    {"service": "Le service est requis pour un prestataire."}
                )
            if not attrs.get("telephone"):
                raise serializers.ValidationError(
                    {"telephone": "Le téléphone est requis pour un prestataire."}
                )
            if not attrs.get("experience"):
                raise serializers.ValidationError(
                    {"experience": "L'expérience est requise pour un prestataire."}
                )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop("role")
        password = validated_data.pop("password")
        validated_data.pop("password_confirm", None)
        validated_data.pop("accept_terms", None)

        username = validated_data.pop("username").strip()
        email = validated_data.pop("email", "").lower().strip()
        service = validated_data.pop("service", None)

        user_role = User.Role.PRESTATAIRE if role == "prestataire" else User.Role.CLIENT
        user = User(
            username=username,
            email=email,
            role=user_role,
        )
        user.set_password(password)
        # Inscription publique → pas d'AuditLog admin
        user._skip_audit = True
        user.save()

        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")
        telephone = validated_data.pop("telephone", "")

        if role == "prestataire":
            prestataire = Prestataire(
                user=user,
                first_name=first_name,
                last_name=last_name,
                service=service,
                telephone=telephone,
                telephone_secondaire=validated_data.pop("telephone_secondaire", ""),
                experience=validated_data.pop("experience", None),
                description=validated_data.pop("description", ""),
                ville=validated_data.pop("ville", ""),
                adresse=validated_data.pop("adresse", ""),
                status=Prestataire.Status.PENDING,
            )
            prestataire._skip_audit = True
            prestataire.save()
        else:
            client = Client(
                user=user,
                first_name=first_name,
                last_name=last_name,
                telephone=telephone,
            )
            client._skip_audit = True
            client.save()

        return user

    def to_representation(self, user):
        refresh = RefreshToken.for_user(user)
        profile = user.profile
        data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_staff": user.is_staff,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
        if profile is not None:
            data["profile"] = {
                "id": profile.id,
                "status": getattr(profile, "status", None),
            }
        return data


class MeSerializer(serializers.ModelSerializer):
    """Profil de l'utilisateur connecté + son profil métier (lecture)."""

    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "is_staff", "profile")
        read_only_fields = ("id", "username", "role", "is_staff", "profile")

    def get_profile(self, obj):
        profile = obj.profile
        if profile is None:
            return None
        context = self.context or {}
        if obj.role == User.Role.PRESTATAIRE:
            return PrestataireSerializer(profile, context=context).data
        if obj.role == User.Role.CLIENT:
            return ClientSerializer(profile, context=context).data
        return None


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect.")
        return value

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
