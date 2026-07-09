# gift/cron.py
from datetime import date, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
import firebase_admin
from firebase_admin import credentials, messaging
from .models import DateMemo
from apscheduler.schedulers.background import BackgroundScheduler
from django_apscheduler.jobstores import DjangoJobStore, register_events
from django.conf import settings
import os
from firebase_admin import exceptions


FIREBASE_KEY_PATH = os.path.join(settings.BASE_DIR, "firebase-sdk.json")

try:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)
except ValueError:
    pass


User = get_user_model()


def send_fcm_notification(token, title, body):
    """
    구글 FCM 서버로 푸시 알림을 원격 전송하는 헬퍼 함수 (디버깅 고도화 버전)
    """
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            token=token,
        )
        response = messaging.send(message)
        print(f"✅ 푸시 알림 전송 성공: {response}")

    except exceptions.FirebaseError as fe:
        print("\n" + "=" * 50)
        print(
            f"❌ [FCM 서버 거절] 세부 에러 내용:\n{fe}"
        )  # 👈 fe.message 대신 fe 객체 전체 출력
        if fe.http_response is not None:
            print(f"❌ [FCM 응답 바디]: {fe.http_response.text}")
        print("=" * 50 + "\n")

    except Exception as e:
        # 일반 시스템 에러용
        print(f"❌ [기타 시스템 에러]: {e}")


def check_anniversaries_and_notify():
    """
    매일 아침 9시에 실행되어 D-7, D-3, D-2, D-1 일정을 계산하고 알림을 쏘는 메인 배치 함수
    """
    print("⏰ [배치 작업 시작] 기념일 및 디데이 체크 중...")
    today = date.today()

    # 타겟 날짜 계산 (오늘 기준으로 1일 뒤, 2일 뒤, 3일 뒤, ..., 7일 뒤)
    target_days = [1, 2, 3, 4, 5, 6, 7]
    target_dates = [today + timedelta(days=d) for d in target_days]

    # 해당 타겟 날짜에 걸리는 모든 기념일(DateMemo) 조회 + user 모델 select_related 최적화
    memos = DateMemo.objects.filter(target_date__in=target_dates).select_related("user")

    for memo in memos:
        # 🆕 [핵심 변경] User 모델의 push_token 필드에서 다이렉트로 토큰 추출!
        token = memo.user.push_token

        if not token:
            print(f"⚠️ 패스: {memo.user.email} 사용자는 발급된 푸시 토큰이 없습니다.")
            continue  # 토큰이 유실되었거나 없는 유저는 발송 건너뛰기

        # 남은 디데이 일수 계산
        target_date_obj = date.fromisoformat(str(memo.target_date))
        remaining_days = (target_date_obj - today).days

        # 알림용 칭호 및 문구 분기 (닉네임이 있으면 닉네임, 없으면 이메일 앞자리 활용)
        user_name = (
            memo.user.nickname if memo.user.nickname else memo.user.email.split("@")[0]
        )

        title = f"{memo.content} D-{remaining_days}"
        body = f"🎁 Golazo에서 선물을 미리 골라보세요."

        # FCM 발송
        send_fcm_notification(token, title, body)

    print("⏰ [배치 작업 완료] 모든 알림 발송 프로세스가 종료되었습니다.")


def start_scheduler():
    """
    장고 앱 구동 시 스케줄러를 백그라운드에 등록해 주는 함수
    """
    scheduler = BackgroundScheduler(timezone=timezone.get_current_timezone())
    scheduler.add_jobstore(DjangoJobStore(), "default")

    # 💡 핵심 설정: 매일 오전 11시(hour=11, minute=0)에 체킹 함수 트리거 가동!
    scheduler.add_job(
        check_anniversaries_and_notify,
        trigger="cron",
        hour=11,
        minute=0,
        id="check_anniversaries_job",
        max_instances=1,
        replace_existing=True,
    )

    register_events(scheduler)
    scheduler.start()
    print(
        "🚀 APScheduler 백그라운드 스케줄러가 정상 가동되었습니다! (매일 오전 11시 작동)"
    )
