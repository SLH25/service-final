from datetime import timedelta

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from .models import Service, Prestataire, AuditLog
from .serializers import (
    LoginSerializer,
    UserSerializer,
    UserCreateSerializer,
    ServiceSerializer,
    PrestataireSerializer,
)


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class AdminLoginView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {"message": "Nom d'utilisateur ou mot de passe incorrect"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_staff:
            return Response(
                {"message": "Accès refusé"},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username
        })


class AdminLogoutView(APIView):
    """Invalide le refresh token (blacklist) lors de la déconnexion."""

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"message": "Le refresh token est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            # Blacklist le refresh token courant
            token.blacklist()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TokenError:
            return Response(
                {"message": "Refresh token invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception:
            return Response(
                {"message": "Erreur lors de la déconnexion."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    permission_classes = [IsStaff]
    search_fields = ["username", "email", "first_name", "last_name"]
    filterset_fields = ["is_active", "is_staff"]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return UserCreateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        instance._audit_actor = self.request.user
        instance.save()

    def perform_update(self, serializer):
        instance = serializer.save()
        instance._audit_actor = self.request.user
        instance.save()

    def perform_destroy(self, instance):
        instance._audit_actor = self.request.user
        instance.delete()


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsStaff]
    search_fields = ["name", "description"]
    filterset_fields = ["active"]

    def perform_create(self, serializer):
        instance = serializer.save()
        instance._audit_actor = self.request.user
        instance.save()

    def perform_update(self, serializer):
        instance = serializer.save()
        instance._audit_actor = self.request.user
        instance.save()

    def perform_destroy(self, instance):
        instance._audit_actor = self.request.user
        instance.delete()


class PrestataireViewSet(viewsets.ModelViewSet):
    queryset = Prestataire.objects.all()
    serializer_class = PrestataireSerializer
    permission_classes = [IsStaff]
    search_fields = ["first_name", "last_name", "email", "phone"]
    filterset_fields = ["status", "service"]

    def perform_create(self, serializer):
        instance = serializer.save()
        instance._audit_actor = self.request.user
        instance.save()

    def perform_update(self, serializer):
        instance = serializer.save()
        instance._audit_actor = self.request.user
        instance.save()

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
        active_prestataires = Prestataire.objects.filter(status="Actif").count()
        total_prestataires = Prestataire.objects.count()
        total_services = Service.objects.count()
        active_services = Service.objects.filter(active=True).count()

        return Response({
            "total_users": total_users,
            "new_users_week": new_users_week,
            "active_prestataires": active_prestataires,
            "total_prestataires": total_prestataires,
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

        # Inscriptions récentes (utilisateurs)
        recent_users = User.objects.filter(date_joined__gte=week_ago).order_by("-date_joined")[:10]
        for user in recent_users:
            events.append({
                "type": "user",
                "action": "Inscription",
                "label": f"{user.username} s'est inscrit",
                "date": user.date_joined.isoformat(),
            })

        # Nouveaux prestataires
        recent_prestataires = Prestataire.objects.filter(date_joined__gte=week_ago).order_by("-date_joined")[:10]
        for prestataire in recent_prestataires:
            events.append({
                "type": "prestataire",
                "action": "Nouveau prestataire",
                "label": f"{prestataire.first_name} {prestataire.last_name} a rejoint la plateforme",
                "date": prestataire.date_joined.isoformat(),
            })

        events.sort(key=lambda e: e["date"], reverse=True)

        return Response(events[:20])


# ── Endpoints publics (sans authentification) ──────────────

class PublicServiceListView(APIView):
    """Liste publique des services actifs (pour la page d'accueil/services)."""
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        services = Service.objects.filter(active=True).order_by("-created_at")
        data = []
        for s in services:
            data.append({
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "prestataires_count": s.prestataires.filter(status="Actif").count(),
            })
        return Response(data)


class PublicPrestataireListView(APIView):
    """Liste publique des prestataires actifs (pour la page prestataires)."""
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        prestataires = Prestataire.objects.filter(status="Actif").order_by("-date_joined")
        data = []
        for p in prestataires:
            data.append({
                "id": p.id,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "service_name": p.service.name if p.service else "",
                "email": p.email,
                "phone": p.phone,
                "status": p.status,
            })
        return Response(data)
