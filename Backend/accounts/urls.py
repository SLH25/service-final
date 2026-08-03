from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    AdminLoginView,
    AdminLogoutView,
    UserViewSet,
    ServiceViewSet,
    PrestataireViewSet,
    StatsView,
    ActivityView,
    PublicServiceListView,
    PublicPrestataireListView,
)

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"services", ServiceViewSet)
router.register(r"prestataires", PrestataireViewSet)

urlpatterns = [
    path("login/", AdminLoginView.as_view()),
    path("logout/", AdminLogoutView.as_view()),
    path("refresh/", TokenRefreshView.as_view()),
    path("verify/", TokenVerifyView.as_view()),
    path("stats/", StatsView.as_view()),
    path("activity/", ActivityView.as_view()),
    # Endpoints publics (sans auth)
    path("public/services/", PublicServiceListView.as_view()),
    path("public/prestataires/", PublicPrestataireListView.as_view()),
    path("", include(router.urls)),
]
