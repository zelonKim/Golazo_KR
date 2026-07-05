from django.urls import path
from .views import (
    RecipientCreateView, 
    EventCreateView, 
    GiftRecommendView
)

urlpatterns = [
    # 1. 선물 상대방 등록
    path('recipient/', RecipientCreateView.as_view(), name='recipient_create'),
    # 2. 등록된 특정 상대방에게 새로운 기념일 추가 
    path('recipient/<int:recipient_id>/event/', EventCreateView.as_view(), name='event_create'),
    # 3. 등록된 특정 기념일에 대해 AI 추천 수행 
    path('recommend/<int:event_id>/', GiftRecommendView.as_view(), name='gift_recommend'),
]