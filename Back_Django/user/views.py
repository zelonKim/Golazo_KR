from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import SignUpSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from .serializers import PushTokenUpdateSerializer
import jwt
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class SignUpView(APIView):
    """일반 이메일 회원가입 API"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)

            return Response(
                {
                    "message": "회원가입이 성공적으로 완료되었습니다.",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                    },
                    "tokens": tokens,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


###########################################


class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    #  마이페이지 내 정보 조회
    def get(self, request):
        login_user = request.user
        serializer = UserSerializer(login_user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    #  마이페이지 내 정보 수정
    def patch(self, request):
        login_user = request.user

        incoming_token = request.data.get("push_token")
        if incoming_token:
            print(
                f"\n📡 [FCM 토큰 동기화 요청 수신] 유저: {login_user.email} | 토큰: {incoming_token}"
            )

        serializer = UserSerializer(login_user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()

            if incoming_token:
                print(
                    f"🎯 [동기화 완료] {login_user.email} 유저의 push_token 필드가 업데이트되었습니다.\n"
                )

            return Response(
                {
                    "message": "회원 정보가 성공적으로 수정되었습니다.",
                    "user": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 회원 탈퇴 (계정 및 연관 데이터 영구 삭제)
    def delete(self, request):
        login_user = request.user

        login_user.delete()

        return Response(
            {
                "message": f"회원 탈퇴가 완료되었습니다. 그동안 서비스를 이용해 주셔서 감사합니다."
            },
            status=status.HTTP_200_OK,
        )


###########################################


class PushTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        login_user = request.user

        serializer = PushTokenUpdateSerializer(
            login_user, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "디바이스 푸시 토큰이 성공적으로 등록되었습니다. 🎯",
                    "user": {
                        "username": login_user.username,
                        "push_token": login_user.push_token,
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


########################################


class LoginView(APIView):
    """일반 이메일 로그인 API"""

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "이메일과 비밀번호를 모두 입력해주세요."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 이메일 기반 로그인 검증
        user = authenticate(request, username=email, password=password)

        if user is not None:
            tokens = get_tokens_for_user(user)
            return Response(
                {
                    "message": "로그인 성공!",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                    },
                    "tokens": tokens,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"error": "이메일 혹은 비밀번호가 올바르지 않습니다."},
            status=status.HTTP_401_UNAUTHORIZED,
        )


########################################


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"error": "토큰이 제공되지 않았습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            ALLOWED_CLIENT_IDS = [
                "98991306295-v4vpr6ecbiu0k29umjm70h01g1d9jis0.apps.googleusercontent.com",  # Web Client ID
                "98991306295-mhv6t76alflm4t0rrj4u8f2fbres67un.apps.googleusercontent.com",  # Android Client ID (json 파일에 있던 값)
                "98991306295-lovlqprpttnq8j8cnmubtqjmgtofr1o.apps.googleusercontent.com",  # iOS Client ID (plist 파일에 있던 값)
            ]

            id_info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                audience=ALLOWED_CLIENT_IDS,
            )

            social_id = id_info.get("sub")
            email = id_info.get("email")
            name = id_info.get("name", "")

        except ValueError as e:
            print(f"구글 토큰 검증 실패 원인 상세: {e}")
            return Response(
                {"error": "유효하지 않은 구글 토큰입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 🌟 회원 조회 및 생성
        user = User.objects.filter(
            social_provider="google", social_uid=social_id
        ).first()

        if not user:
            # 2. 소셜 가입은 없는데, 이미 같은 이메일로 가입된 유저가 있는지 체크합니다.
            existing_email_user = User.objects.filter(email=email).first()

            if existing_email_user:
                # 이미 이메일이 존재하면 해당 계정에 소셜 연동을 업데이트하고 로그인 시켜줍니다.
                user = existing_email_user
                user.social_provider = "google"
                user.social_uid = social_id
                user.save()

            else:
                user = User.objects.create(
                    social_provider="google",
                    social_uid=social_id,
                    email=email if email else f"google_{social_id}@golazo.ai",
                    username=f"google_{social_id}",
                    nickname=name,
                )

        tokens = get_tokens_for_user(user)
        return Response({"tokens": tokens}, status=status.HTTP_200_OK)


###########################################


class AppleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response(
                {"error": "토큰이 제공되지 않았습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            apple_public_keys = requests.get(
                "https://appleid.apple.com/auth/keys"
            ).json()
            client_id = "com.zelon.golazo"

            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")

            apple_key = next(
                (k for k in apple_public_keys["keys"] if k["kid"] == kid), None
            )
            if not apple_key:
                return Response(
                    {"error": "알 수 없는 애플 서명 키입니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(apple_key)
            payload = jwt.decode(
                token, public_key, algorithms=["RS256"], audience=client_id
            )

            social_id = payload.get("sub")
            email = payload.get(
                "email"
            )  # ⚠️ 주의: 두 번째 로그인부터는 None으로 올 수 있음

        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return Response(
                {"error": "유효하지 않거나 만료된 애플 토큰입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. 먼저 애플 고유의 social_uid로 가입된 유저가 이미 있는지 찾습니다.
        user = User.objects.filter(
            social_provider="apple", social_uid=social_id
        ).first()

        if not user:
            # 2. 기존 소셜 가입이 없다면, '이메일'이 제공되었을 때 한해서만 중복 이메일 유저를 찾습니다.
            existing_email_user = None
            if email:
                existing_email_user = User.objects.filter(email=email).first()

            if existing_email_user:
                # [Case A] 소셜 가입 기록은 없는데 동일한 이메일 유저가 있다면, 해당 계정에 애플 연동 정보를 업데이트합니다.
                user = existing_email_user
                user.social_provider = "apple"
                user.social_uid = social_id
                user.save()
            else:
                # [Case B] 완전히 새로운 유저인 경우 가입을 진행합니다.
                # 두 번째 로그인부터는 email이 안 오기 때문에, 첫 가입 때 무조건 이메일을 확정 지어 둡니다.
                final_email = email if email else f"apple_{social_id}@zelon.com"

                user = User.objects.create(
                    social_provider="apple",
                    social_uid=social_id,
                    email=final_email,
                    username=f"apple_{social_id}",
                    nickname=f"회원_{social_id[:6]}",
                )

        # 3. 토큰 발급 및 로그인 완료
        tokens = get_tokens_for_user(user)
        return Response({"tokens": tokens}, status=status.HTTP_200_OK)
