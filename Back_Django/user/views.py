from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import SignUpSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class SignUpView(APIView):
    """일반 이메일 회원가입 API"""
    permission_classes = [AllowAny]  

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            
            return Response({
                "message": "회원가입이 성공적으로 완료되었습니다.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username
                },
                "tokens": tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



###############################


class LoginView(APIView):
    """일반 이메일 로그인 API"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "이메일과 비밀번호를 모두 입력해주세요."}, status=status.HTTP_400_BAD_REQUEST)

        # 이메일 기반 로그인 검증
        user = authenticate(request, username=email, password=password)

        if user is not None:
            tokens = get_tokens_for_user(user)
            return Response({
                "message": "로그인 성공!",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username
                },
                "tokens": tokens
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "이메일 또는 비밀번호가 올바르지 않습니다."}, status=status.HTTP_401_UNAUTHORIZED)