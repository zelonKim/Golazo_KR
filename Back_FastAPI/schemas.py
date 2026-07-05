from typing import List
from pydantic import BaseModel


class RecommendRequest(BaseModel):
    purpose: str
    age_group: str
    gender: str
    min_budget: int
    max_budget: int
    mbti: str | None = None
    hobbies: str | None = None
    notes: str | None = None


class RecommendResponse(BaseModel):
    product_name: (
        str  # 💡 여기에 구체적인 상품명(예: 브라운 시리즈 9 면도기)이 바로 꽂힙니다.
    )
    product_price: int  # AI가 예측한 대략적인 예산 가격
    recommendation_reason: str  # 유저에게 보여줄 감동적인 추천 이유


class RecommendListResponse(BaseModel):
    recommendations: List[RecommendResponse]
