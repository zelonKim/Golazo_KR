from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# 커스텀 유저 모델을 어드민에 등록합니다.
admin.site.register(User, UserAdmin)