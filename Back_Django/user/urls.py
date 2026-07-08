from django.urls import path
from .views import MyProfileView, SignUpView, LoginView, PushTokenView

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MyProfileView.as_view(), name="me"),
    path("push-token/", PushTokenView.as_view(), name="push-token"),
]
