from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    MeView,
    ChangePasswordView,
    ClientViewSet,
    ServiceViewSet,
    PrestataireViewSet,
    StatsView,
    ActivityView,
    PublicServiceListView,
    PublicServiceDetailView,
    PublicPrestataireListView,
    PublicPrestataireDetailView,
)

router = DefaultRouter()
router.register(r"clients", ClientViewSet)
router.register(r"services", ServiceViewSet)
router.register(r"prestataires", PrestataireViewSet)

urlpatterns = [
    # Authentification
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change_password"),
    # Administration
    path("stats/", StatsView.as_view(), name="stats"),
    path("activity/", ActivityView.as_view(), name="activity"),
    # Endpoints publics (sans auth)
    path("public/services/", PublicServiceListView.as_view(), name="public_services"),
    path("public/services/<int:pk>/", PublicServiceDetailView.as_view(), name="public_service_detail"),
    path("public/prestataires/", PublicPrestataireListView.as_view(), name="public_prestataires"),
    path("public/prestataires/<int:pk>/", PublicPrestataireDetailView.as_view(), name="public_prestataire_detail"),
    path("", include(router.urls)),
]
