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
from rest_framework.exceptions import ParseError, PermissionDenied
from .utils import get_coupang_product
from .serializers import DateMemoSerializer
from datetime import date
from .models import DateMemo


class RecipientView(APIView):
    permission_classes = [IsAuthenticated]

    # 내 지인 목록 전체 조회
    def get(self, request):
        login_user = request.user
        # 💡 로그인한 유저가 등록한 지인들만 필터링해서 가져옴 (최신순)
        recipients = Recipient.objects.filter(user=login_user).order_by("-created_at")

        # 목록 조회가 가능하도록 many=True 옵션 필수!
        serializer = RecipientSerializer(recipients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # B. 선물 상대방 정보 등록
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


############################


class RecipientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    # 특정 선물 상대방의 상세 정보 조회
    def get(self, request, recipient_id):
        login_user = request.user
        recipient = get_object_or_404(Recipient, id=recipient_id)

        if recipient.user != login_user:
            raise PermissionDenied("해당 선물 상대방의 정보를 조회할 권한이 없습니다.")

        serializer = RecipientSerializer(recipient)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 선물 상대방 정보 수정
    def patch(self, request, recipient_id):
        login_user = request.user
        recipient = get_object_or_404(Recipient, id=recipient_id)

        if recipient.user != login_user:
            raise PermissionDenied("해당 선물 상대방의 정보를 수정할 권한이 없습니다.")

        serializer = RecipientSerializer(recipient, data=request.data, partial=True)

        if serializer.is_valid():
            updated_recipient = serializer.save(user=login_user)
            return Response(
                {
                    "message": f"'{updated_recipient.name}'님의 정보가 성공적으로 수정되었습니다.",
                    "recipient": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 선물 상대방 정보 삭제
    def delete(self, request, recipient_id):
        login_user = request.user
        recipient = get_object_or_404(Recipient, id=recipient_id)

        if recipient.user != login_user:
            raise PermissionDenied("해당 선물 상대방을 삭제할 권한이 없습니다.")

        recipient_name = recipient.name
        recipient.delete()

        return Response(
            {
                "message": f"선물 상대방 '{recipient_name}'님에 대한 정보가 정상적으로 삭제되었습니다."
            },
            status=status.HTTP_200_OK,
        )


##################################################################


class EventView(APIView):
    permission_classes = [IsAuthenticated]

    # 특정 상대방에게 등록된 모든 이벤트 목록 조회
    def get(self, request, recipient_id):
        recipient = get_object_or_404(Recipient, id=recipient_id)
        if recipient.user != request.user:
            raise PermissionDenied("선물 상대방에 대한 권한이 없습니다.")

        events = Event.objects.filter(recipient=recipient)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 특정 상대방에게 새로운 이벤트 등록
    def post(self, request, recipient_id):
        recipient = get_object_or_404(Recipient, id=recipient_id)

        if recipient.user != request.user:
            raise PermissionDenied("선물 상대방에 대한 권한이 없습니다.")

        serializer = EventSerializer(data=request.data)

        if serializer.is_valid():
            event = serializer.save(recipient=recipient)
            return Response(
                {
                    "message": f"'{recipient.name}'님에게 새로운 이벤트가 추가되었습니다.",
                    "event_id": event.id,
                    "event": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


########################################


class EventDetailView(APIView):
    permission_classes = [IsAuthenticated]

    # 특정 이벤트 상세 조회
    def get(self, request, event_id):
        # 1. 조회할 이벤트 획득 (없으면 404)
        event = get_object_or_404(Event, id=event_id)

        # 🚨 [철벽 방어] 이 이벤트의 소유권이 현재 로그인한 유저가 맞는지 검증
        if event.recipient.user != request.user:
            raise PermissionDenied("해당 이벤트 조회할 권한이 없습니다.")

        # 2. 시리얼라이저를 통해 단건 데이터를 JSON으로 변환 후 반환
        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 특정 이벤트 정보 부분 수정
    def patch(self, request, event_id):
        # 1. 수정할 이벤트 조회
        event = get_object_or_404(Event, id=event_id)

        # [철벽 방어] 내 지인의 이벤트가 맞는지 검증
        if event.recipient.user != request.user:
            raise PermissionDenied("해당 이벤트를 수정할 권한이 없습니다.")

        # partial=True 옵션으로 원하는 필드만 쏙쏙 수정
        serializer = EventSerializer(event, data=request.data, partial=True)

        event_purpose = event.purpose
        recipient_name = event.recipient.name

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": f"'{recipient_name}'님의 '{event_purpose}' 이벤트 정보가 수정되었습니다.",
                    "event": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 특정 이벤트 삭제
    def delete(self, request, event_id):
        # 1. 삭제할 이벤트 조회
        event = get_object_or_404(Event, id=event_id)

        # 🚨 [철벽 방어] 권한 검증
        if event.recipient.user != request.user:
            raise PermissionDenied("해당 이벤트를 삭제할 권한이 없습니다.")

        event_purpose = event.purpose
        recipient_name = event.recipient.name

        # 2. DB에서 이벤트 깔끔하게 삭제
        event.delete()

        return Response(
            {
                "message": f"'{recipient_name}'님의 '{event_purpose}' 이벤트가 성공적으로 삭제되었습니다."
            },
            status=status.HTTP_200_OK,
        )


##################################################################


class GiftRecommendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(Event, id=event_id)

        RecommendedProduct.objects.filter(event=event).delete()

        recipient = event.recipient

        if recipient.user != request.user:
            raise PermissionDenied("선물 상대방에 대한 권한이 없습니다.")

        fastapi_url = os.environ.get("FASTAPI_URL") + "api/v1/recommend"

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


#################################################################


# 특정 이벤트에 속한 추천 상품 목록 조회
class RecommendedProductListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        # 1. 해당 이벤트가 존재하는지, 로그인한 유저의 소유가 맞는지 검증
        event = get_object_or_404(Event, id=event_id)
        if event.recipient.user != request.user:
            raise PermissionDenied("추천 내역을 조회할 권한이 없습니다.")

        # 2. 이 이벤트로 저장된 추천 상품들 싹 긁어오기
        products = RecommendedProduct.objects.filter(event=event).order_by("id")

        # 3. 💡 [중요] 조회할 때도 쿠팡 링크와 이미지를 실시간으로 슥 얹어줍니다!
        response_data = []
        for prod in products:
            serializer = RecommendedProductSerializer(prod)
            prod_dict = serializer.data

            # 실시간 네이버/쿠팡 링크 재조립
            coupang_info = get_coupang_product(
                search_keyword=prod.product_name,
                min_budget=prod.product_price,
                max_budget=prod.product_price,
            )

            prod_dict["product_url"] = coupang_info["product_url"]
            prod_dict["image_url"] = coupang_info["image_url"]
            response_data.append(prod_dict)

        return Response(response_data, status=status.HTTP_200_OK)


############################


class RecommendedProductDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        product = get_object_or_404(RecommendedProduct, id=product_id)

        # [철벽 방어] 내 이벤트의 추천 상품이 맞는지 검증
        if product.event.recipient.user != request.user:
            raise PermissionDenied("해당 추천 상품을 삭제할 권한이 없습니다.")

        product_name = product.product_name

        product.delete()

        return Response(
            {"message": f"추천 상품 '{product_name}'이(가) 리스트에서 삭제되었습니다."},
            status=status.HTTP_200_OK,
        )


#################################################################


class DateMemoView(APIView):
    permission_classes = [IsAuthenticated]

    #  지인 메모 목록 조회 (+ 실시간 D-Day 계산)
    def get(self, request):
        login_user = request.user
        # 다가오는 기념일 날짜 순서대로 정렬해서 긁어오기
        memos = DateMemo.objects.filter(user=login_user).order_by("target_date")

        today = date.today()
        response_data = []

        for memo in memos:
            serializer = DateMemoSerializer(memo)
            memo_dict = serializer.data

            try:
                this_year_target = memo.target_date.replace(year=today.year)
                # 만약 올해 기념일이 이미 지났다면 내년 기념일 기준으로 계산
                if this_year_target < today:
                    this_year_target = memo.target_date.replace(year=today.year + 1)

                d_day = (this_year_target - today).days
                memo_dict["d_day"] = d_day
            except ValueError:
                memo_dict["d_day"] = None

            response_data.append(memo_dict)

        return Response(response_data, status=status.HTTP_200_OK)

    # 지인 메모 신규 등록
    def post(self, request):
        login_user = request.user
        serializer = DateMemoSerializer(data=request.data)

        if serializer.is_valid():
            memo = serializer.save(user=login_user)
            return Response(
                {
                    "message": f"'{memo.content}'을 메모하였습니다.",
                    "memo_id": memo.id,
                    "people_memo": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


##################################################################


class DateMemoDetailView(APIView):
    permission_classes = [IsAuthenticated]

    # 특정 메모 단건 상세 조회 (+ D-Day 계산)
    def get(self, request, memo_id):
        memo = get_object_or_404(DateMemo, id=memo_id)

        # [철벽 방어] 내 메모가 맞는지 검증
        if memo.user != request.user:
            raise PermissionDenied("해당 메모를 조회할 권한이 없습니다.")

        serializer = DateMemoSerializer(memo)
        memo_dict = serializer.data

        # 실시간 D-Day 계산 주입
        today = date.today()
        try:
            this_year_target = memo.target_date.replace(year=today.year)
            if this_year_target < today:
                this_year_target = memo.target_date.replace(year=today.year + 1)
            memo_dict["d_day"] = (this_year_target - today).days
        except ValueError:
            memo_dict["d_day"] = None

        return Response(memo_dict, status=status.HTTP_200_OK)

    # 특정 메모 부분 수정
    def patch(self, request, memo_id):
        memo = get_object_or_404(DateMemo, id=memo_id)

        if memo.user != request.user:
            raise PermissionDenied("해당 메모를 수정할 권한이 없습니다.")

        # partial=True로 이름이나 날짜 중 하나만 보내도 에러 없이 갱신 가능하게 세팅
        serializer = DateMemoSerializer(memo, data=request.data, partial=True)

        if serializer.is_valid():
            updated_memo = serializer.save()
            return Response(
                {
                    "message": f"'{updated_memo.name}'님의 메모 정보가 성공적으로 수정되었습니다.",
                    "people_memo": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 특정 메모 삭제
    def delete(self, request, memo_id):
        memo = get_object_or_404(DateMemo, id=memo_id)

        if memo.user != request.user:
            raise PermissionDenied("해당 메모를 삭제할 권한이 없습니다.")

        memo_name = memo.name
        memo.delete()

        return Response(
            {"message": f"'{memo_name}'님에 대한 메모가 정상적으로 삭제되었습니다."},
            status=status.HTTP_200_OK,
        )
