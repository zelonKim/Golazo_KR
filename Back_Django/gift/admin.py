from django.contrib import admin
from .models import Recipient, Event, DateMemo, RecommendedProduct


@admin.register(Recipient)
class RecipientAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "gender", "age_group", "created_at")
    search_fields = ("name", "user__email")
    list_filter = ("gender", "age_group")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("id", "recipient", "purpose", "min_budget", "max_budget")
    search_fields = ("recipient__name", "purpose")
    list_filter = ("purpose",)


@admin.register(DateMemo)
class DateMemoAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content", "target_date", "last_alarm_sent_year")
    search_fields = ("content", "user__email")
    ordering = ("target_date",)


@admin.register(RecommendedProduct)
class RecommendedProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "event",
        "product_name",
        "product_price",
        "status",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("product_name", "event__recipient__name")
