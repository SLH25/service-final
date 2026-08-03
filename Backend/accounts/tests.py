from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import AuditLog, Prestataire, Service


class AdminAuthTests(APITestCase):
    """Tests d'authentification admin."""

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", password="admin123", is_staff=True
        )
        self.client_user = User.objects.create_user(
            username="client", password="client123", is_staff=False
        )

    def test_login_admin_success(self):
        """Un admin peut se connecter et reçoit des tokens."""
        response = self.client.post(
            "/api/accounts/login/",
            {"username": "admin", "password": "admin123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["username"], "admin")

    def test_login_non_staff_forbidden(self):
        """Un utilisateur non-staff ne peut pas se connecter à l'admin."""
        response = self.client.post(
            "/api/accounts/login/",
            {"username": "client", "password": "client123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_wrong_password(self):
        """Un mauvais mot de passe renvoie 401."""
        response = self.client.post(
            "/api/accounts/login/",
            {"username": "admin", "password": "wrong"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_refresh_token(self):
        """Le logout blackliste le refresh token."""
        login = self.client.post(
            "/api/accounts/login/",
            {"username": "admin", "password": "admin123"},
            format="json",
        )
        refresh = login.data["refresh"]

        # Logout
        response = self.client.post(
            "/api/accounts/logout/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Le refresh token ne doit plus fonctionner
        response = self.client.post(
            "/api/accounts/refresh/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class AdminCRUDTests(APITestCase):
    """Tests CRUD des endpoints admin."""

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", password="admin123", is_staff=True
        )
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_list_users_requires_auth(self):
        """Sans token, la liste des utilisateurs est refusée."""
        self.client.credentials()
        response = self.client.get("/api/accounts/users/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_users(self):
        """Un admin peut lister les utilisateurs."""
        response = self.client.get("/api/accounts/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)

    def test_create_user(self):
        """Un admin peut créer un utilisateur."""
        response = self.client.post(
            "/api/accounts/users/",
            {
                "username": "newuser",
                "email": "new@example.com",
                "first_name": "New",
                "last_name": "User",
                "password": "Pass123!",
                "is_active": True,
                "is_staff": False,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_create_service(self):
        """Un admin peut créer un service."""
        response = self.client.post(
            "/api/accounts/services/",
            {"name": "Plomberie", "description": "Services de plomberie", "active": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Service.objects.filter(name="Plomberie").exists())

    def test_create_prestataire(self):
        """Un admin peut créer un prestataire."""
        service = Service.objects.create(name="Plomberie", active=True)
        response = self.client.post(
            "/api/accounts/prestataires/",
            {
                "first_name": "Jean",
                "last_name": "Dupont",
                "service": service.id,
                "email": "jean@example.com",
                "phone": "0123456789",
                "status": "Actif",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Prestataire.objects.filter(email="jean@example.com").exists())

    def test_delete_service(self):
        """Un admin peut supprimer un service."""
        service = Service.objects.create(name="Test", active=True)
        response = self.client.delete(f"/api/accounts/services/{service.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(id=service.id).exists())


class AuditLogTests(APITestCase):
    """Tests du journal d'audit."""

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin", password="admin123", is_staff=True
        )
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_audit_log_created_on_service_create(self):
        """La création d'un service génère un événement d'audit."""
        self.client.post(
            "/api/accounts/services/",
            {"name": "Électricité", "description": "Test", "active": True},
            format="json",
        )
        self.assertTrue(
            AuditLog.objects.filter(entity_type="service", action="create").exists()
        )

    def test_audit_log_created_on_user_create(self):
        """La création d'un utilisateur génère un événement d'audit."""
        self.client.post(
            "/api/accounts/users/",
            {
                "username": "audituser",
                "email": "audit@example.com",
                "first_name": "Audit",
                "last_name": "User",
                "password": "Pass123!",
                "is_active": True,
                "is_staff": False,
            },
            format="json",
        )
        self.assertTrue(
            AuditLog.objects.filter(entity_type="user", action="create").exists()
        )

    def test_activity_endpoint_returns_audit_events(self):
        """L'endpoint activity retourne les événements d'audit."""
        AuditLog.objects.create(
            entity_type="service",
            entity_id="1",
            action="create",
            actor=self.admin,
            details="Service Test créé",
        )
        response = self.client.get("/api/accounts/activity/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(e["type"] == "service" for e in response.data))


class PublicEndpointTests(APITestCase):
    """Tests des endpoints publics."""

    def setUp(self):
        self.service = Service.objects.create(name="Plomberie", active=True)
        Service.objects.create(name="Inactif", active=False)
        Prestataire.objects.create(
            first_name="Jean",
            last_name="Dupont",
            service=self.service,
            email="jean@example.com",
            status="Actif",
        )

    def test_public_services_only_active(self):
        """L'endpoint public services ne retourne que les services actifs."""
        response = self.client.get("/api/accounts/public/services/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Plomberie")

    def test_public_prestataires_only_active(self):
        """L'endpoint public prestataires ne retourne que les prestataires actifs."""
        Prestataire.objects.create(
            first_name="Marie",
            last_name="Curie",
            service=self.service,
            email="marie@example.com",
            status="Inactif",
        )
        response = self.client.get("/api/accounts/public/prestataires/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["first_name"], "Jean")