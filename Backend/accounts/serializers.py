from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Service, Prestataire


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined")


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "is_active",
            "is_staff",
        )
        read_only_fields = ("id",)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ServiceSerializer(serializers.ModelSerializer):
    prestataires_count = serializers.IntegerField(source="prestataires.count", read_only=True)

    class Meta:
        model = Service
        fields = ("id", "name", "description", "active", "created_at", "prestataires_count")
        read_only_fields = ("id", "created_at")


class PrestataireSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)

    class Meta:
        model = Prestataire
        fields = (
            "id",
            "first_name",
            "last_name",
            "service",
            "service_name",
            "email",
            "phone",
            "status",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined")