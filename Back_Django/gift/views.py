import os

import requests
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework.views import APIView  # 💡 APIView 임포트
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from urllib.parse import urljoin
from .models import Event, RecommendedProduct
from .serializers import RecommendedProductSerializer
from django.contrib.auth import get_user_model
from .models import Recipient
from .serializers import RecipientSerializer, EventSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .utils import get_coupang_product


class RecipientCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        login_user = request.user

        serializer = RecipientSerializer(data=request.data)

        if serializer.is_valid():
            recipient = serializer.save(user=login_user)

            return Response(
                {
                    "message": "선물 상대방이 성공적으로 등록되었습니다.",
                    "recipient_id": recipient.id,
                    "recipient": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


##############################


class EventCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, recipient_id):
        recipient = get_object_or_404(Recipient, id=recipient_id)

        if recipient.user != request.user:
            raise PermissionDenied("선물 상대방에 대한 권한이 없습니다.")

        serializer = EventSerializer(data=request.data)

        if serializer.is_valid():
            event = serializer.save(recipient=recipient)
            return Response(
                {
                    "message": f"'{recipient.name}'님에게 새로운 기념일이 추가되었습니다.",
                    "event_id": event.id,
                    "event": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


##############################


class GiftRecommendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)
        recipient = event.recipient

        if recipient.user != request.user:
            raise PermissionDenied("선물 상대방에 대한 권한이 없습니다.")

        fastapi_url = os.environ.get("FASTAPI_URL") + "/api/v1/recommend"

        payload = {
            "age_group": recipient.age_group,
            "gender": recipient.gender,
            "mbti": recipient.mbti,
            "hobbies": recipient.hobbies,
            "notes": recipient.notes,
            "purpose": event.purpose,
            "min_budget": event.min_budget,
            "max_budget": event.max_budget,
        }

        try:
            response = requests.post(fastapi_url, json=payload, timeout=15)

            if response.status_code != 200:
                return Response(
                    {"error": "AI 엔진 서버 에러", "details": response.text},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            recommendations = response.json()
            response_data = []  # 프론트엔드에 최종 전달할 리스트

            for prod in recommendations:
                product_name = prod.get("product_name")

                # 💡 [여기 수정!] 네이버 API 함수에 예산 범위를 같이 던져줍니다.
                coupang_info = get_coupang_product(
                    search_keyword=product_name,
                    min_budget=event.min_budget,
                    max_budget=event.max_budget,
                )

                final_price = (
                    coupang_info["price"]
                    if coupang_info["price"] > 0
                    else prod.get("product_price", 0)
                )

                final_product_name = (
                    coupang_info["product_name"]
                    if coupang_info["product_name"]
                    else prod.get("product_name", "")
                )

                # 2. DB에는 핵심 영구 데이터만 저장 (url, image_url은 필드에 없으므로 빼고 저장)
                obj, created = RecommendedProduct.objects.get_or_create(
                    event=event,
                    product_name=final_product_name,
                    defaults={
                        "product_price": final_price,
                        "recommendation_reason": prod.get("recommendation_reason", ""),
                        "status": "RECOMMENDED",
                    },
                )

                serializer = RecommendedProductSerializer(obj)
                prod_dict = serializer.data

                # 4. 변환된 딕셔너리에 '유효기간이 있는 임시 쿠팡 데이터'를 슥 얹어줍니다.
                prod_dict["product_url"] = coupang_info["product_url"]
                prod_dict["image_url"] = coupang_info["image_url"]

                response_data.append(prod_dict)

            return Response(
                {
                    "message": "AI 추천 및 쿠팡 매핑 성공!",
                    "recommendations": response_data,
                },
                status=status.HTTP_200_OK,
            )

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": "AI 엔진 서버 연결 실패", "details": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except Exception as e:
            return Response(
                {"error": "서버 내부 로직 에러 발생", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
