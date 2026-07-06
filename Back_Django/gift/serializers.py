from rest_framework import serializers
from .models import RecommendedProduct
from .models import Recipient, Event
from .models import PeopleMemo


class RecipientSerializer(serializers.ModelSerializer):
    """선물 상대방(Recipient) 생성을 위한 시리얼라이저"""

    class Meta:
        model = Recipient
        fields = [
            "id",
            "name",
            "gender",
            "age_group",
            "mbti",
            "hobbies",
            "notes",
            "created_at",
        ]

        read_only_fields = ["id", "created_at"]


###########################################


class EventSerializer(serializers.ModelSerializer):
    """기념일(Event) 생성을 위한 시리얼라이저"""

    purpose_display = serializers.CharField(
        source="get_purpose_display", read_only=True
    )

    class Meta:
        model = Event
        fields = ["id", "purpose", "purpose_display", "min_budget", "max_budget"]

        read_only_fields = ["id"]

    def validate(self, data):
        min_budget = data.get("min_budget")
        max_budget = data.get("max_budget")

        if min_budget is not None and max_budget is not None:
            if min_budget > max_budget:
                raise serializers.ValidationError(
                    {"min_budget": "최소 예산은 최대 예산보다 클 수 없습니다."}
                )

        return data


###########################################


class RecommendedProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecommendedProduct
        fields = [
            "id",
            "product_name",
            "product_price",
            "recommendation_reason",
            "search_keyword",
            "status",
        ]


###########################################


class PeopleMemoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeopleMemo
        fields = ["id", "name", "target_date"]
        read_only_fields = ["id"]
