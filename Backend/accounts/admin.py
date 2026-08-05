from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import Client, Prestataire, Service, User


class AccountsUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "email")


class AccountsUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User


@admin.register(User)
class AccountsUserAdmin(UserAdmin):
    add_form = AccountsUserCreationForm
    form = AccountsUserChangeForm
    model = User
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Rôle", {"fields": ("role",)}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2"),
        }),
    )
    search_fields = ("username", "email")
    ordering = ("-date_joined",)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "telephone", "created_at")
    search_fields = ("first_name", "last_name", "user__email", "telephone")


@admin.register(Prestataire)
class PrestataireAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "service", "status", "telephone", "created_at")
    list_filter = ("status", "service")
    search_fields = ("first_name", "last_name", "user__email", "telephone")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "active", "created_at")
    list_filter = ("active",)
    search_fields = ("name", "description")
