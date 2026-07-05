from django.db import models
from django.conf import settings


class Recipient(models.Model):
    """선물 상대(대상자) 정보 테이블"""

    GENDER_CHOICES = [
        ("M", "남성"),
        ("F", "여성"),
        ("N", "모름"),
    ]

    AGE_CHOICES = [
        ("0", "10대 미만"),
        ("10", "10대"),
        ("20", "20대"),
        ("30", "30대"),
        ("40", "40대"),
        ("50", "50대"),
        ("60", "60대"),
        ("70", "70대"),
        ("80", "80대 이상"),
    ]

    MBTI_CHOICES = [
        (mbti, mbti)
        for mbti in [
            "ISTJ",
            "ISFJ",
            "INFJ",
            "INTJ",
            "ISTP",
            "ISFP",
            "INFP",
            "INTP",
            "ESTP",
            "ESFP",
            "ENFP",
            "ENTP",
            "ESTJ",
            "ESFJ",
            "ENFJ",
            "ENTJ",
        ]
    ]

    # 필수 정보
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recipients",
        verbose_name="접속한 유저",
    )
    name = models.CharField(max_length=50, verbose_name="상대 이름")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="성별")
    age_group = models.CharField(
        max_length=2, choices=AGE_CHOICES, verbose_name="나이대"
    )

    # 선택 정보
    mbti = models.CharField(
        max_length=4, choices=MBTI_CHOICES, blank=True, null=True, verbose_name="MBTI"
    )

    hobbies = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="취미 (예: 등산, 독서, 요리 등 자유입력)",
        help_text="쉼표로 구분하여 입력하거나 자유롭게 작성해주세요.",
    )

    notes = models.TextField(blank=True, null=True, verbose_name="특이사항 (자유입력)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}의 지인: {self.name}"


##########################


class Event(models.Model):
    PURPOSE_CHOICES = [
        ("FRIEND_BDAY", "친구 생일"),
        ("LOVER_BDAY", "애인 생일"),
        ("PARENTS_BDAY", "부모님 생신"),
        ("COUPLE_ANNIV", "커플 기념일"),
        ("WED_ANNIV", "결혼 기념일"),
        ("GRADUATE", "졸업"),
        ("EMPLOY", "취업"),
        ("HOUSE", "집들이"),
        ("BIRTH", "출산"),
    ]

    recipient = models.ForeignKey(
        Recipient,
        on_delete=models.CASCADE,
        related_name="events",
        verbose_name="선물 상대",
    )

    purpose = models.CharField(
        max_length=20, choices=PURPOSE_CHOICES, verbose_name="선물 목적"
    )

    min_budget = models.PositiveIntegerField(verbose_name="최소 예산 (원)")
    max_budget = models.PositiveIntegerField(verbose_name="최대 예산 (원)")

    def __str__(self):
        return f"{self.recipient.name} - {self.get_purpose_display()} "


############################


class RecommendedProduct(models.Model):
    """AI가 추천한 개별 상품 정보 및 유저의 반응을 기록하는 테이블"""

    STATUS_CHOICES = [
        ("RECOMMENDED", "추천됨"),  # 유저에게 화면으로 보여짐
        ("CLICKED", "클릭함"),  # 상세 페이지나 구매 링크를 눌러봄
        ("PURCHASED", "구매함"),  # 최종 구매 확정
        ("DISLIKED", "관심없음"),  # 유저가 '이 상품은 별로예요'를 누름
    ]

    # 1. 어떤 상황(기념일)에서 추천되었는가?
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="recommended_products",
        verbose_name="연관된 기념일/이벤트",
    )

    # 2. 추천된 상품의 메타 정보 (외부 쇼핑몰 API를 쓴다면 ID나 URL만 저장해도 됨)
    product_name = models.CharField(max_length=255, verbose_name="상품명")

    product_price = models.PositiveIntegerField(verbose_name="상품 가격")

    # 3. AI의 추천 이유 (추천봇 화면이나 히스토리 탭에 보여줄 용도)
    recommendation_reason = models.TextField(verbose_name="AI의 추천 이유")

    search_keyword = models.CharField(max_length=255, verbose_name="쿠팡 검색 키워드")

    # 4. 유저의 피드백/상태 (추천 품질 고도화를 위한 핵심 데이터)
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default="RECOMMENDED",
        verbose_name="유저 반응 상태",
    )

    actual_affiliate_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="실제 생성된 쿠팡 파트너스 링크",
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="추천 일시")

    def __str__(self):
        return f"[{self.event.recipient.name}]에게 추천된 {self.product_name} ({self.get_status_display()})"


##########################


class PeopleMemo(models.Model):
    """홈 탭 대시보드에서 이름과 기념일만 빠르게 메모하는 인맥 관리 테이블"""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="memo_people",
        verbose_name="등록한 유저",
    )

    name = models.CharField(max_length=100, verbose_name="이름")
    target_date = models.DateField(verbose_name="기념일 날짜")

    # 매년 반복되는 알림 관리를 위해 연도 저장 방식으로 변경 (0이면 미발송)
    last_alarm_sent_year = models.IntegerField(
        default=0, verbose_name="마지막으로 알림을 보낸 연도"
    )

    class Meta:
        ordering = ["target_date"]

    def __str__(self):
        return f"{self.user.username}의 메모: {self.name} ({self.target_date})"
