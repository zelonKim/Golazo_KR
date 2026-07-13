import { client } from "@/api/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { Calendar, ChevronRight, Gift, NotepadText } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// 백엔드 Event 모델과 매핑되는 인터페이스 정의
interface GiftEvent {
  id: number;
  purpose: string;
  purpose_display: string; // 장고 choices의 가독성 좋은 한글 라벨
  min_budget: number;
  max_budget: number;
  created_at: string;
  recipient_name: string; // 누구에게 준 선물인지 표시하기 위함
}

// 목적별 어울리는 귀여운 이모지 매핑 딕셔너리
const PURPOSE_EMOJIS: Record<string, string> = {
  FRIEND_BDAY: "🎂",
  LOVER_BDAY: "❤️",
  PARENTS_BDAY: "💐",
  COUPLE_ANNIV: "👩‍❤️‍👨",
  WED_ANNIV: "💍",
  GRADUATE: "🎓",
  EMPLOY: "💼",
  HOUSE: "🏠",
  BIRTH: "👶",
  SELF_GIFT: "🎁",
};

export default function HistoryScreen() {
  const queryClient = useQueryClient();

  // 🔍 1. useQuery: 내 프로필 정보 및 중첩 지인 데이터 가져오기
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfileHistory"],
    queryFn: async () => {
      const response = await client.get("user/me/");
      return response.data;
    },
  });

  // 🆕 매직 디테일: 사용자가 히스토리 탭 메뉴를 누르고 진입할 때마다 캐시 무효화 및 리프레시 강제 가동!
  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["userProfileHistory"] });
    }, [queryClient]),
  );

  // 🔍 2. 중첩된 구조(User -> Recipient -> Event)에서 역참조된 이벤트들만 일렬로 평탄화(Flat) 추출
  const events = React.useMemo(() => {
    if (!userProfile || !userProfile.recipients) return [];

    // 1. 유저가 가진 모든 지인들의 events 배열을 하나로 합침
    const flatEvents = userProfile.recipients.flatMap(
      (recipient: any) => recipient.events || [],
    );

    // 2. 🔥 최신순 정렬 (created_at이 큰/최신 날짜가 맨 앞으로 오도록 정렬)
    return [...flatEvents].sort((a: any, b: any) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // 내림차순 정렬 (최신순)
    });
  }, [userProfile]);

  // 📊 대시보드용 통계 데이터 실시간 계산 (평탄화된 events 리스트 기반)
  const totalCount = events.length;

  const totalMinBudget = events.reduce(
    (sum: number, item: any) => sum + (item.min_budget || 0),
    0,
  );

  const totalMaxBudget = events.reduce(
    (sum: number, item: any) => sum + item.max_budget,
    0,
  );

  const formatSummaryPrice = (price: number) => {
    if (price === 0) return "0원";
    if (price >= 10000) {
      return `${(price / 10000).toFixed(1).replace(".0", "")}만원`;
    }
    return `${price.toLocaleString()}원`;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top"]}
    >
      {/* 1. 상단 타이틀 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gift History</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerFlex}>
          <ActivityIndicator size="large" color="#FF7096" />
          <Text style={styles.loadingText}>지난 기록들을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 🏆 2. 몽글몽글 대시보드 통계 카드 */}
          <View style={styles.summaryCard}>
            {/* 왼쪽 탭: 최소 예산 대시보드 */}
            <View style={styles.summaryItem}>
              <View style={[styles.iconBg, { backgroundColor: "#E6F7FF" }]}>
                <Gift size={22} color="#1890FF" />
              </View>
              <Text style={styles.summaryCount}>
                {formatSummaryPrice(totalMinBudget)}
              </Text>
              <Text style={styles.summaryLabel}>마음을 담은 최소 예산</Text>
            </View>

            <View style={styles.dividerLine} />

            {/* 오른쪽 탭: 최대 예산 */}
            <View style={styles.summaryItem}>
              <View style={[styles.iconBg, { backgroundColor: "#FFF9E6" }]}>
                <Gift size={22} color="#FFB800" />
              </View>
              <Text style={styles.summaryCount}>
                {formatSummaryPrice(totalMaxBudget)}
              </Text>
              <Text style={styles.summaryLabel}>마음을 담은 최대 예산</Text>
            </View>
          </View>

          {/* 📅 3. 히스토리 타임라인 리스트 영역 */}
          <View style={styles.sectionContainer}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ marginTop: Platform.OS === "android" ? 5 : 1 }}>
                <NotepadText size={23} color={"#FF7096"} />
              </View>
              <Text style={styles.sectionTitle}>지난 기록들 </Text>
            </View>
            {events.length > 0 ? (
              events.map((item) => {
                const displayDate = item.created_at
                  ? new Date(item.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "날짜 미지정";

                const emoji = PURPOSE_EMOJIS[item.purpose] || "💝";

                return (
                  <View key={item.id} style={styles.historyCard}>
                    {/* 카드 상단: 이모지 + 타이틀 + 완료 체크 배지 */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.titleLeft}>
                        <Text style={styles.cardEmoji}>{emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.recipient_name}
                          </Text>
                          <Text style={styles.cardDate}>{displayDate}</Text>
                        </View>
                      </View>
                      <View style={styles.successBadge}>
                        <Gift
                          size={14}
                          color="#FF7096"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.successText}>
                          {" "}
                          {item.purpose_display}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    {/* 카드 하단 터치 영역: 누르면 해당 recommendResult.tsx로 점프! */}
                    <TouchableOpacity
                      style={styles.giftDetailRow}
                      onPress={() => {
                        router.push({
                          pathname: "/recommendResult",
                          params: { event_id: item.id },
                        });
                      }}
                    >
                      <View>
                        <Text style={styles.giftLabel}>예산 범위</Text>
                        <Text style={styles.giftNameText}>
                          {item.min_budget.toLocaleString()}원 ~{" "}
                          {item.max_budget.toLocaleString()}원
                        </Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>선물 보기</Text>
                        <ChevronRight
                          size={14}
                          color="#FF7096"
                          strokeWidth={3}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Calendar
                  size={40}
                  color="#E5E5EA"
                  style={{ marginBottom: 10 }}
                />
                <Text style={styles.emptyText}>
                  아직 추천받은 내역이 없어요.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#FFF0F3",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FF7096",
    fontStyle: "italic",
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
  },
  centerFlex: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFBFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#757580",
  },
  /* 🏆 상단 요약 대시보드 카드 */
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 22,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 2,
    borderColor: "#FFE3EB",
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  iconBg: {
    padding: 10,
    borderRadius: 50,
    marginBottom: 8,
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2D2D3A",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#757580",
    marginTop: 2,
    fontWeight: "600",
  },
  dividerLine: {
    width: 1.5,
    height: "60%",
    backgroundColor: "#F6F6FA",
  },
  /* 🕒 히스토리 리스트 구조 */
  sectionContainer: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2D2D3A",
    marginBottom: 16,
    paddingLeft: 4,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#F6F6FA",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2D2D3A",
  },
  cardDate: {
    fontSize: 12,
    color: "#AEAEB2",
    marginTop: 3,
    fontWeight: "500",
  },
  /* 완료 태그 */
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F3",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
  },
  successText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF7096",
  },
  cardDivider: {
    height: 1.5,
    backgroundColor: "#FDF4F6",
    marginVertical: 14,
  },
  /* 하단 기프트 정보 */
  giftDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFBFB",
    padding: 12,
    borderRadius: 18,
  },
  giftLabel: {
    fontSize: 11,
    color: "#A0A0AB",
    fontWeight: "600",
  },
  giftNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A4A5A",
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FF7096",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AEAEB2",
  },
});
