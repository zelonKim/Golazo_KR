from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    PROVIDER_CHOICES = [
        ("local", "일반 가입"),
        ("kakao", "카카오"),
        ("naver", "네이버"),
        ("google", "구글"),
        ("apple", "애플"),
    ]

    email = models.EmailField(unique=True, verbose_name="이메일 주소")

    nickname = models.CharField(
        max_length=30, blank=True, null=True, verbose_name="닉네임"
    )

    push_token = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="FCM 푸시 토큰"
    )

    social_provider = models.CharField(
        max_length=20,
        choices=PROVIDER_CHOICES,
        default="local",
        verbose_name="가입 경로",
    )

    social_uid = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="소셜 유저 고유 ID"
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = ["username"]

    class Meta:
        unique_together = ("social_provider", "social_uid")
        verbose_name = "사용자"
        verbose_name_plural = "사용자 목록"

    def __str__(self):
        if self.social_provider != "local":
            return f"[{self.get_social_provider_display()}] {self.email}"
        return self.email
