import { Award, CheckCircle2, ChevronRight, Gift } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// 💡 장고 DB 연동을 고려한 과거 완료된 선물 히스토리 더미 데이터
const PAST_HISTORIES = [
  {
    id: 1,
    content: "여자친구 1000일 기념일",
    date: "2026년 05월 14일",
    giftName: "티파니앤코 실버 목걸이 💎",
    price: "350,000원",
    emoji: "💖",
  },
  {
    id: 2,
    content: "어버이날 감사 선물",
    date: "2026년 05월 08일",
    giftName: "설화수 자음 기초 2종 세트 🌸",
    price: "120,000원",
    emoji: "🏡",
  },
  {
    id: 3,
    content: "팀장님 승진 축하",
    date: "2026년 04월 02일",
    giftName: "스타벅스 디저트 텀블러 세트 ☕",
    price: "45,000원",
    emoji: "👔",
  },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top"]}
    >
      {/* 1. 상단 타이틀 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gift History</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🏆 2. 몽글몽글 대시보드 통계 카드 */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={[styles.iconBg, { backgroundColor: "#FFF0F3" }]}>
              <Award size={22} color="#FF7096" />
            </View>
            <Text style={styles.summaryCount}>3번의</Text>
            <Text style={styles.summaryLabel}>성공적인 기념일</Text>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.summaryItem}>
            <View style={[styles.iconBg, { backgroundColor: "#FFF9E6" }]}>
              <Gift size={22} color="#FFB800" />
            </View>
            <Text style={styles.summaryCount}>51.5만원</Text>
            <Text style={styles.summaryLabel}>마음을 담은 선물</Text>
          </View>
        </View>

        {/* 📅 3. 히스토리 타임라인 리스트 영역 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>지난 기록들 🕒</Text>

          {PAST_HISTORIES.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              {/* 카드 상단: 이모지 + 타이틀 + 완료 체크 배지 */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.titleLeft}>
                  <Text style={styles.cardEmoji}>{item.emoji}</Text>
                  <View>
                    <Text style={styles.cardTitle}>{item.content}</Text>
                    <Text style={styles.cardDate}>{item.date}</Text>
                  </View>
                </View>
                <View style={styles.successBadge}>
                  <CheckCircle2
                    size={14}
                    color="#FF7096"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.successText}>완료</Text>
                </View>
              </View>

              {/* 점선이나 얇은 구분선 */}
              <View style={styles.cardDivider} />

              {/* 카드 하단: 내가 준 선물 정보 정보 */}
              <TouchableOpacity style={styles.giftDetailRow}>
                <View>
                  <Text style={styles.giftLabel}>내가 전한 마음</Text>
                  <Text style={styles.giftNameText}>{item.giftName}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>{item.price}</Text>
                  <ChevronRight size={14} color="#AEAEB2" />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
    borderRadius: 28, // 둥글둥글 젤리 무드 마감
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
    backgroundColor: "#FFFBFB", // 은은한 핑크빛 배경으로 감싸기
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
    fontSize: 14,
    fontWeight: "800",
    color: "#FF7096",
  },
});
