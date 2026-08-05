from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import AuditLog, Client, Prestataire, Service, User


def _create_admin():
    return User.objects.create_superuser(
        username="admin", email="admin@test.com", password="Admin123!"
    )


def _register(client, role="client", username="user", email="user@test.com", service=None):
    payload = {
        "role": role,
        "username": username,
        "email": email,
        "first_name": "Jean",
        "last_name": "Dupont",
        "telephone": "0612345678",
        "password": "Pass123!",
        "password_confirm": "Pass123!",
        "accept_terms": True,
    }
    if role == "prestataire":
        payload["service"] = service
        payload["description"] = "Description"
        payload["ville"] = "Paris"
        payload["adresse"] = "10 rue"
    return client.post("/api/accounts/register/", payload, format="json")


class RegisterTests(APITestCase):
    def setUp(self):
        self.client.defaults = {"HTTP_HOST": "localhost"}
        self.service = Service.objects.create(name="Plomberie", active=True)

    def test_register_client_creates_user_and_client(self):
        resp = _register(self.client, role="client", username="jean", email="jean@test.com")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["user"]["role"], "CLIENT")
        user = User.objects.get(username="jean")
        self.assertTrue(hasattr(user, "client"))
        self.assertFalse(hasattr(user, "prestataire"))

    def test_register_prestataire_creates_user_and_pending_prestataire(self):
        resp = _register(
            self.client,
            role="prestataire",
            username="marie",
            email="marie@test.com",
            service=self.service.id,
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["user"]["role"], "PRESTATAIRE")
        prestataire = User.objects.get(username="marie").prestataire
        self.assertEqual(prestataire.status, Prestataire.Status.PENDING)

    def test_register_requires_unique_username(self):
        _register(self.client, role="client", username="jean", email="a@test.com")
        resp = _register(self.client, role="client", username="jean", email="b@test.com")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", resp.data)

    def test_register_requires_unique_email(self):
        _register(self.client, role="client", username="jean", email="same@test.com")
        resp = _register(self.client, role="client", username="autre", email="same@test.com")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", resp.data)

    def test_register_prestataire_requires_service(self):
        resp = _register(self.client, role="prestataire", username="marie", email="m@test.com")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("service", resp.data)


class LoginTests(APITestCase):
    def setUp(self):
        self.client.defaults = {"HTTP_HOST": "localhost"}

    def test_login_detects_client_role(self):
        _register(self.client, role="client", username="jean", email="j@test.com")
        resp = self.client.post(
            "/api/accounts/login/",
            {"username": "jean", "password": "Pass123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["user"]["role"], "CLIENT")

    def test_login_detects_admin_role(self):
        _create_admin()
        resp = self.client.post(
            "/api/accounts/login/",
            {"username": "admin", "password": "Admin123!"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["user"]["role"], "ADMIN")
        self.assertTrue(resp.data["user"]["is_staff"])

    def test_login_wrong_password(self):
        resp = self.client.post(
            "/api/accounts/login/",
            {"username": "nobody", "password": "wrong"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class AdminClientTests(APITestCase):
    def setUp(self):
        self.client.defaults = {"HTTP_HOST": "localhost"}
        self.admin = _create_admin()
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        _register(self.client, role="client", username="jean", email="j@test.com")

    def test_admin_cannot_create_client(self):
        resp = self.client.post(
            "/api/accounts/clients/",
            {"first_name": "X", "last_name": "Y", "telephone": "06"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_admin_lists_clients(self):
        resp = self.client.get("/api/accounts/clients/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["count"], 1)
        self.assertEqual(resp.data["results"][0]["username"], "jean")

    def test_admin_updates_client(self):
        client = Client.objects.get(user__username="jean")
        resp = self.client.patch(
            f"/api/accounts/clients/{client.id}/",
            {"first_name": "Jean-Michel"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        client.refresh_from_db()
        self.assertEqual(client.first_name, "Jean-Michel")

    def test_admin_deletes_client(self):
        client = Client.objects.get(user__username="jean")
        resp = self.client.delete(f"/api/accounts/clients/{client.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username="jean").exists())


class AdminPrestataireTests(APITestCase):
    def setUp(self):
        self.client.defaults = {"HTTP_HOST": "localhost"}
        self.admin = _create_admin()
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        self.service = Service.objects.create(name="Plomberie", active=True)
        _register(
            self.client,
            role="prestataire",
            username="marie",
            email="m@test.com",
            service=self.service.id,
        )

    def test_admin_cannot_create_prestataire(self):
        resp = self.client.post(
            "/api/accounts/prestataires/",
            {"first_name": "X", "last_name": "Y"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_verify_sets_verified(self):
        prestataire = Prestataire.objects.get(user__username="marie")
        resp = self.client.patch(f"/api/accounts/prestataires/{prestataire.id}/verify/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        prestataire.refresh_from_db()
        self.assertEqual(prestataire.status, Prestataire.Status.VERIFIED)

    def test_affiche_sets_affiche(self):
        prestataire = Prestataire.objects.get(user__username="marie")
        resp = self.client.patch(f"/api/accounts/prestataires/{prestataire.id}/affiche/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        prestataire.refresh_from_db()
        self.assertEqual(prestataire.status, Prestataire.Status.AFFICHE)

    def test_reject_sets_rejected(self):
        prestataire = Prestataire.objects.get(user__username="marie")
        resp = self.client.patch(f"/api/accounts/prestataires/{prestataire.id}/reject/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        prestataire.refresh_from_db()
        self.assertEqual(prestataire.status, Prestataire.Status.REJECTED)

    def test_admin_deletes_prestataire_and_user(self):
        prestataire = Prestataire.objects.get(user__username="marie")
        resp = self.client.delete(f"/api/accounts/prestataires/{prestataire.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username="marie").exists())


class ServiceTests(APITestCase):
    def setUp(self):
        self.client.defaults = {"HTTP_HOST": "localhost"}
        self.admin = _create_admin()
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_admin_creates_service(self):
        resp = self.client.post(
            "/api/accounts/services/",
            {"name": "Jardinage", "description": "Test", "active": True},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Service.objects.filter(name="Jardinage").exists())

    def test_admin_deletes_service(self):
        service = Service.objects.create(name="Test", active=True)
        resp = self.client.delete(f"/api/accounts/services/{service.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(id=service.id).exists())


class PublicEndpointTests(APITestCase):
    def setUp(self):
        self.client.defaults = {"HTTP_HOST": "localhost"}
        self.service = Service.objects.create(name="Plomberie", active=True)
        Service.objects.create(name="Inactif", active=False)

    def test_public_services_only_active(self):
        resp = self.client.get("/api/accounts/public/services/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["name"], "Plomberie")

    def test_public_prestataires_only_visible(self):
        # PENDING invisible
        _register(self.client, role="prestataire", username="marie", email="m@test.com", service=self.service.id)
        resp = self.client.get("/api/accounts/public/prestataires/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)

        # VERIFIED visible
        prestataire = Prestataire.objects.get(user__username="marie")
        prestataire.status = Prestataire.Status.VERIFIED
        prestataire.save()
        resp = self.client.get("/api/accounts/public/prestataires/")
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["first_name"], "Jean")

        # AFFICHE visible aussi
        prestataire.status = Prestataire.Status.AFFICHE
        prestataire.save()
        resp = self.client.get("/api/accounts/public/prestataires/")
        self.assertEqual(len(resp.data), 1)


class AuditLogTests(APITestCase):
    def setUp(self):
        self.client.defaults = {"HTTP_HOST": "localhost"}
        self.admin = _create_admin()
        refresh = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_audit_log_created_on_service_create(self):
        self.client.post(
            "/api/accounts/services/",
            {"name": "Électricité", "description": "Test", "active": True},
            format="json",
        )
        self.assertTrue(
            AuditLog.objects.filter(entity_type="service", action="create").exists()
        )
