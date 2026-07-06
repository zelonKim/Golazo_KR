from django.urls import path
from .views import (
    EventDetailView,
    DateMemoDetailView,
    DateMemoView,
    RecipientDetailView,
    RecipientView,
    EventView,
    GiftRecommendView,
    RecommendedProductDetailView,
    RecommendedProductListView,
)

urlpatterns = [
    # 선물 상대방 CRUD
    path("recipient/", RecipientView.as_view(), name="recipient_list_create"),
    path(
        "recipient/<int:recipient_id>/",
        RecipientDetailView.as_view(),
        name="recipient_read_update_delete",
    ),
    #  상대방에 대한 이벤트 CRUD
    path(
        "recipient/<int:recipient_id>/event/",
        EventView.as_view(),
        name="event_list_create",
    ),
    path(
        "event/<int:event_id>/",
        EventDetailView.as_view(),
        name="event_read_update_delete",
    ),
    # 특정 이벤트에 대한 AI 선물 추천 수행
    path(
        "event/<int:event_id>/recommend/",
        GiftRecommendView.as_view(),
        name="gift-recommend_create",
    ),
    #  특정 이벤트에 대한 AI 추천 상품 목록 조회
    path(
        "event/<int:event_id>/recommended-products/",
        RecommendedProductListView.as_view(),
        name="recommended-products_list",
    ),
    #  특정 추천 상품 삭제
    path(
        "recommended-product/<int:product_id>/",
        RecommendedProductDetailView.as_view(),
        name="recommended-product_delete",
    ),
    # 4. 지인 기념일 메모 CRUD
    path("people-memo/", DateMemoView.as_view(), name="people-memo_list_create"),
    path(
        "people-memo/<int:memo_id>/",
        DateMemoDetailView.as_view(),
        name="people-memo_read_update_delete",
    ),
]
