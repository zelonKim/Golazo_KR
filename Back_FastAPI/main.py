from fastapi import FastAPI, Depends, HTTPException
from typing import List, Optional
import os
from dotenv import load_dotenv
from schemas import RecommendRequest, RecommendResponse, RecommendListResponse
from openai import AsyncOpenAI
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

app = FastAPI(title="선물 추천 AI 엔진")

client = AsyncOpenAI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "FastAPI 엔진이 정상 작동 중입니다."}


@app.post("/api/v1/recommend", response_model=List[RecommendResponse])
async def get_recommendation(request: RecommendRequest):
    try:
        # 1. AI에게 부여할 전문적인 페르소나와 지침 (System Prompt)
        system_prompt = (
            "당신은 대한민국 최고의 선물 큐레이터이자 트렌디한 선물 추천 봇입니다.\n"
            "주어진 대상자의 정보(나이, 성별, 취향, 예산 등)를 완벽하게 분석하여,\n"
            "대상자가 감동할 만한 가장 센스 있고 실용적인 선물 3가지를 추천해야 합니다."
        )

        # 🎯 2. Django GENDER_CHOICES 스크린샷 기준 매핑 적용
        gender_mapping = {
            "M": "남성",
            "F": "여성",
            "N": "모름",
        }
        gender_str = gender_mapping.get(request.gender, "모름")

        # 🎯 3. Django PURPOSE_CHOICES 스크린샷 기준 매핑 적용
        purpose_mapping = {
            "FRIEND_BDAY": "친구 생일",
            "LOVER_BDAY": "애인 생일",
            "PARENTS_BDAY": "부모님 생신",
            "COUPLE_ANNIV": "커플 기념일",
            "WED_ANNIV": "결혼 기념일",
            "GRADUATE": "졸업",
            "EMPLOY": "취업",
            "HOUSE": "집들이",
            "BIRTH": "출산",
            "SELF_GIFT": "나에게 선물",
        }
        purpose_str = purpose_mapping.get(request.purpose, request.purpose)

        # 4. 유저가 입력한 상황 데이터 동적 바인딩 (User Prompt)
        user_prompt = f"""
            [선물 대상자 및 상황 정보]
            - 선물 목적: {purpose_str}
            - 나이대: {request.age_group}대
            - 성별: {gender_str}
            - 필수 예산 범위: 최소 {request.min_budget:,}원 이상 ~ 최대 {request.max_budget:,}원 이하 (이 범위를 절대 벗어나면 안 됨)
            - MBTI: {request.mbti or "모름"}
            - 취미: {request.hobbies or "모름"}
            - 특이 사항: {request.notes or "모름"}

            [ 주의 사항 ]
            1. product_name 필드에는 검색창에 쳤을 때 반드시 유저의 [필수 예산 범위: {request.min_budget:,}원 ~ {request.max_budget:,}원] 내부의 실제 판매가가 매칭될 만한 구체적인 단어로 조합하세요.
               - (잘못된 예 - 너무 포괄적이라 저가 소모품이 검색됨): 세차 타이어 광택제 (❌ 네이버/쿠팡 검색시 3천원짜리 나옴)
               - (올바른 예 - 예산 범위 3~5만원에 매치되는 단어): 불스원 세차 툴백 세트 (⭕ 검색시 3~4만원대 세트 상품이 나옴)
               
               - (잘못된 예): 캠핑용 미니 테이블 (❌ 1만원짜리 보조 탁자가 검색됨)
               - (올바른 예): 카즈미 캠핑 롤테이블 (⭕ 4~5만원대 제대로 된 메인 테이블이 나옴)

               - (잘못된 예): 러닝용 힙색 (❌ 5천원짜리 벨트가 검색됨)
               - (올바른 예): 골스튜디오 러닝 백팩 (⭕ 3~5만원대 러닝 전용 가방이 나옴)

            2. 뇌피셜로 가짜 상세 모델명(예: 9415s 같은 품번)을 지어내지는 마되, [유명 브랜드명 + 구체적인 제품 라인업/세트 명칭] 구조로 3단어 내외의 검색용 product_name을 적으세요. 
               - 예시: '록시땅 핸드크림 세트', '필립스 면도기 3000시리즈', '샤오미 무선 이어폰'

            3. product_price는 해당 상품이 실제 쇼핑몰에서 판매되는 현실적인 평균 가격을 int로 적으세요.
            4. recommendation_reason에는 왜 이 선물이 대상자의 예산과 성향에 찰떡인지 센스 있게 설명하세요.

            위 [선물 대상자 및 상황 정보]와 [주의 사항] 그리고, 필수 예산 범위를 완벽하게 충족하는 최적의 선물 3가지만 철저히 검증하여 추천해 주세요.
        """

        response = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            temperature=0.8,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=RecommendListResponse,
        )

        result = response.choices[0].message.parsed

        if result is None:
            raise HTTPException(
                status_code=500, detail="AI가 답변을 생성하지 못했습니다."
            )

        return result.recommendations

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 엔진 오류: {str(e)}")
