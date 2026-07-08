
import os
from django.apps import AppConfig


class GiftConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "gift"  # 👈 gift 앱 이름 매핑 확인

    def ready(self):
        # runserver 구동 시 내부 프로세스가 더블 부팅되는 장고 고유 버그 방지 가드 쳐주기
        if os.environ.get("RUN_MAIN") == "true":
            from .cron import start_scheduler

            start_scheduler()
