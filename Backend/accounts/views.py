from datetime import timedelta

from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status, viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Service, Prestataire, Client, AuditLog, User
from .serializers import (
    LoginSerializer,
    UserSerializer,
    ServiceSerializer,
    ClientSerializer,
    ClientUpdateSerializer,
    PrestataireSerializer,
    PrestataireUpdateSerializer,
    RegisterSerializer,
    MeSerializer,
    ChangePasswordSerializer,
)


class IsStaff(permissions.BasePermission):
    """Autorise uniquement les administrateurs (role=ADMIN / is_staff)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


# ── Authentification ─────────────────────────────────────

class LoginView(APIView):
    """Connexion avec username + password.

    Le rôle est détecté automatiquement grâce au champ `role` du User :
      - ADMIN       → espace admin
      - PRESTATAIRE → espace prestataire
      - CLIENT      → espace client
    Le frontend ne demande jamais le rôle au moment de la connexion.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                {"message": "Nom d'utilisateur ou mot de passe incorrect"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"message": "Ce compte est désactivé."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_staff": user.is_staff,
            },
        })


class RegisterView(APIView):
    """Inscription publique — UNIQUE source de création des comptes.

    Crée User + profil métier (Client ou Prestataire PENDING).
    Le prestataire est invisible tant qu'un admin ne l'a pas traité.
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """Invalide le refresh token (blacklist) lors de la déconnexion."""

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"message": "Le refresh token est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TokenError:
            return Response(
                {"message": "Refresh token invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            return Response(
                {"message": "Erreur lors de la déconnexion."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MeView(APIView):
    """Profil de l'utilisateur connecté (GET) et mise à jour des infos (PUT)."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user, context={"request": request}).data)

    def put(self, request):
        user = request.user
        email = request.data.get("email")
        if email:
            if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
                return Response(
                    {"email": "Un compte avec cet email existe déjà."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.email = email
        user.save()
        profile = user.profile
        if profile is not None:
            if "first_name" in request.data:
                profile.first_name = request.data["first_name"]
            if "last_name" in request.data:
                profile.last_name = request.data["last_name"]
            profile.save()
        return Response(MeSerializer(user, context={"request": request}).data)


class ChangePasswordView(APIView):
    """Change le mot de passe de l'utilisateur connecté."""

    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Mot de passe modifié avec succès."})


# ── Administration ───────────────────────────────────────

class ClientViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Gestion des clients par l'admin.

    PAS de création : les clients sont créés UNIQUEMENT via l'inscription publique.
    L'admin liste, consulte, modifie et supprime les comptes existants.
    """

    queryset = Client.objects.select_related("user").all()
    permission_classes = [IsStaff]
    search_fields = ["first_name", "last_name", "user__email", "user__username", "telephone"]
    filterset_fields = ["user__is_active"]

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return ClientUpdateSerializer
        return ClientSerializer

    def perform_destroy(self, instance):
        """Supprimer le client supprime aussi son compte User."""
        instance._audit_actor = self.request.user
        user = instance.user
        if user:
            user._audit_actor = self.request.user
        instance.delete()
        if user:
            user.delete()


class PrestataireViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Gestion des prestataires par l'admin.

    PAS de création ici : les prestataires sont créés UNIQUEMENT via
    l'inscription publique (RegisterView). L'admin liste, consulte, modifie,
    change le statut et supprime les comptes existants.

    Actions :
      - verify  → VERIFIED (visible + badge "Vérifié")
      - affiche → AFFICHE  (visible sans badge "Vérifié")
      - reject  → REJECTED (invisible)
    """

    queryset = Prestataire.objects.select_related("user", "service").all()
    permission_classes = [IsStaff]
    search_fields = ["first_name", "last_name", "user__email", "user__username", "telephone"]
    filterset_fields = ["status", "service"]

    def get_serializer_class(self):
        if self.action in ("update", "partial_update"):
            return PrestataireUpdateSerializer
        return PrestataireSerializer

    def perform_destroy(self, instance):
        """Supprimer le prestataire supprime aussi son compte User."""
        instance._audit_actor = self.request.user
        user = instance.user
        if user:
            user._audit_actor = self.request.user
        instance.delete()
        if user:
            user.delete()

    def _set_status(self, request, new_status):
        prestataire = self.get_object()
        prestataire.status = new_status
        prestataire._audit_actor = request.user
        prestataire.save()
        return Response(PrestataireSerializer(prestataire).data)

    @action(detail=True, methods=["patch"])
    def verify(self, request, pk=None):
        """Valide un compte → VERIFIED, visible avec le badge Vérifié."""
        return self._set_status(request, Prestataire.Status.VERIFIED)

    @action(detail=True, methods=["patch"])
    def affiche(self, request, pk=None):
        """Affiche un compte → AFFICHE, visible sans badge Vérifié."""
        return self._set_status(request, Prestataire.Status.AFFICHE)

    @action(detail=True, methods=["patch"])
    def reject(self, request, pk=None):
        """Refuse un compte → invisible."""
        return self._set_status(request, Prestataire.Status.REJECTED)


class ServiceViewSet(viewsets.ModelViewSet):
    """Gestion complète des services (seul l'admin crée/modifie/supprime)."""

    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsStaff]
    search_fields = ["name", "description"]
    filterset_fields = ["active"]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance._audit_actor = self.request.user
        instance.delete()


class StatsView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        now = timezone.now()
        week_ago = now - timedelta(days=7)

        total_users = User.objects.count()
        new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
        verified_prestataires = Prestataire.objects.filter(
            status=Prestataire.Status.VERIFIED
        ).count()
        affiche_prestataires = Prestataire.objects.filter(
            status=Prestataire.Status.AFFICHE
        ).count()
        pending_prestataires = Prestataire.objects.filter(
            status=Prestataire.Status.PENDING
        ).count()
        total_prestataires = Prestataire.objects.count()
        total_clients = Client.objects.count()
        total_services = Service.objects.count()
        active_services = Service.objects.filter(active=True).count()

        return Response({
            "total_users": total_users,
            "new_users_week": new_users_week,
            "active_prestataires": verified_prestataires,
            "affiche_prestataires": affiche_prestataires,
            "pending_prestataires": pending_prestataires,
            "total_prestataires": total_prestataires,
            "total_clients": total_clients,
            "total_services": total_services,
            "active_services": active_services,
        })


class ActivityView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        now = timezone.now()
        week_ago = now - timedelta(days=7)

        # Événements d'audit (CRUD admin)
        audit_events = AuditLog.objects.filter(created_at__gte=week_ago).order_by("-created_at")[:20]

        events = []

        for log in audit_events:
            action_map = {
                "create": "Création",
                "update": "Modification",
                "delete": "Suppression",
            }
            events.append({
                "type": log.entity_type,
                "action": action_map.get(log.action, log.action),
                "label": log.details,
                "date": log.created_at.isoformat(),
            })

        # IDs des entités déjà couvertes par un AuditLog "create" (créées via l'admin)
        audited_user_ids = set(
            AuditLog.objects.filter(
                entity_type="user",
                action="create",
                created_at__gte=week_ago,
            ).values_list("entity_id", flat=True)
        )
        audited_prestataire_ids = set(
            AuditLog.objects.filter(
                entity_type="prestataire",
                action="create",
                created_at__gte=week_ago,
            ).values_list("entity_id", flat=True)
        )

        # Inscriptions récentes (utilisateurs)
        recent_users = User.objects.filter(date_joined__gte=week_ago).order_by("-date_joined")[:10]
        for user in recent_users:
            if str(user.id) in audited_user_ids:
                continue
            events.append({
                "type": "user",
                "action": "Inscription",
                "label": f"{user.username} s'est inscrit",
                "date": user.date_joined.isoformat(),
            })

        # Nouvelles inscriptions prestataires (y compris PENDING : à traiter par l'admin)
        recent_prestataires = Prestataire.objects.filter(
            created_at__gte=week_ago
        ).order_by("-created_at")[:10]
        for prestataire in recent_prestataires:
            if str(prestataire.id) in audited_prestataire_ids:
                continue
            events.append({
                "type": "prestataire",
                "action": "Nouveau prestataire",
                "label": f"{prestataire.first_name} {prestataire.last_name} a rejoint la plateforme",
                "date": prestataire.created_at.isoformat(),
            })

        events.sort(key=lambda e: e["date"], reverse=True)

        return Response(events[:20])


# ── Endpoints publics (sans authentification) ──────────────

class PublicServiceListView(APIView):
    """Liste publique des services actifs (pour le formulaire et la page services)."""

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        services = Service.objects.filter(active=True).order_by("name")
        data = []
        for s in services:
            data.append({
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "prestataires_count": s.prestataires.filter(
                    status__in=(Prestataire.Status.VERIFIED, Prestataire.Status.AFFICHE)
                ).count(),
            })
        return Response(data)


class PublicPrestataireListView(APIView):
    """Liste publique des prestataires — seuls VERIFIED et AFFICHE sont visibles."""

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        prestataires = (
            Prestataire.objects.select_related("user", "service")
            .filter(status__in=(Prestataire.Status.VERIFIED, Prestataire.Status.AFFICHE))
            .order_by("-created_at")
        )
        data = []
        for p in prestataires:
            data.append({
                "id": p.id,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "service_name": p.service.name if p.service else "",
                "email": p.user.email,
                "telephone": p.telephone,
                "description": p.description,
                "photo": p.photo,
                "adresse": p.adresse,
                "ville": p.ville,
                "experience": p.experience,
                "status": p.status,
                "created_at": p.created_at,
            })
        return Response(data)


class PublicPrestataireDetailView(APIView):
    """Détail public d'un prestataire — seuls VERIFIED et AFFICHE sont visibles."""

    authentication_classes = []
    permission_classes = []

    def get(self, request, pk):
        try:
            prestataire = (
                Prestataire.objects.select_related("user", "service")
                .get(pk=pk, status__in=(Prestataire.Status.VERIFIED, Prestataire.Status.AFFICHE))
            )
        except Prestataire.DoesNotExist:
            return Response(
                {"detail": "Prestataire introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "id": prestataire.id,
            "first_name": prestataire.first_name,
            "last_name": prestataire.last_name,
            "service_name": prestataire.service.name if prestataire.service else "",
            "email": prestataire.user.email,
            "telephone": prestataire.telephone,
            "description": prestataire.description,
            "photo": prestataire.photo,
            "adresse": prestataire.adresse,
            "ville": prestataire.ville,
            "experience": prestataire.experience,
            "status": prestataire.status,
            "created_at": prestataire.created_at,
        })
