from django.urls import path
from .views import MyProfileView, SignUpView, LoginView, PushTokenView, GoogleLoginView, AppleLoginView

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("google/login/", GoogleLoginView.as_view(), name="google_login"),
    path("apple/login/", AppleLoginView.as_view(), name="apple_login"),
    path("me/", MyProfileView.as_view(), name="me"),
    path("push-token/", PushTokenView.as_view(), name="push-token"),
]
