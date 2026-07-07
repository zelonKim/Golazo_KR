import { client } from "@/api/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface RecommendedProduct {
  id: number;
  product_name: string;
  product_price: number;
  recommendation_reason: string;
  product_url: string;
  image_url: string;
}

export default function RecommendResultScreen() {
  const params = useLocalSearchParams();
  const eventId = Number(params.event_id);

  // 🔍 1. useQuery: 기존에 저장된 추천 목록 가져오기
  const {
    data: savedRecommendations = [],
    refetch: refetchHistory,
    isLoading: isQueryLoading,
  } = useQuery<RecommendedProduct[]>({
    queryKey: ["recommendedProducts", eventId],
    queryFn: async () => {
      const response = await client.get(
        `gift/event/${eventId}/recommended-products/`,
      );
      return response.data;
    },
    enabled: !!eventId,
  });

  // 🚀 2. useMutation: AI 엔진 추천 요청 API
  const recommendMutation = useMutation({
    mutationFn: async () => {
      const response = await client.post(`gift/event/${eventId}/recommend/`);
      return response.data.recommendations;
    },
    onSuccess: () => {
      refetchHistory();
      Alert.alert("추천 완료 🎁", "AI가 최적의 선물들을 새롭게 골라왔어요!");
    },
    onError: (error: any) => {
      console.error(
        "AI 추천 수행 실패:",
        error.response?.data || error.message,
      );
      Alert.alert("분석 실패 🥲", "AI 엔진과의 연동에 실패했습니다.");
    },
  });

  // 💡 매직 디테일: 페이지 진입 시 데이터 여부를 완벽히 판별하여 최초 AI 가동 및 방어
  useEffect(() => {
    // 서버로부터 기존 추천 내역을 조회하는 중이라면 가드
    if (isQueryLoading) return;

    // 조회가 끝났는데도 추천된 상품이 0개인 완전 새 이벤트일 때만 AI 가동
    if (eventId && savedRecommendations.length === 0) {
      recommendMutation.mutate();
    }
  }, [eventId, savedRecommendations.length, isQueryLoading]);

  const handleOpenLink = async (url: string) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  const formatPrice = (price: number) => price.toLocaleString("ko-KR") + "원";
  const displayItems = recommendMutation.data || savedRecommendations;

  // ⏳ 기존 추천 내역 초동 로딩 처리
  if (isQueryLoading && displayItems.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: "#FFFBFB" }]}
        edges={["top"]}
      >
        <View style={styles.centerFlex}>
          <ActivityIndicator size="large" color="#FF7096" />
          <Text style={styles.loadingText}>
            이전 추천 상품 목록을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top", "bottom"]}
    >
      {/* 아기자기한 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color="#FF7096" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Recommend</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ✨ 2. AI 분석 작동 제어 보드 (원래의 화이트 클라우드 카드 테마) */}
        <View style={styles.cloudCard}>
          <View style={styles.bubbleTag}>
            <Text style={styles.bubbleTagText}>지인 맞춤형 추천 선물</Text>
          </View>
          <Text style={styles.mainCardTitle}>
            {recommendMutation.isPending
              ? "AI가 선물을 고르고 있어요"
              : "선물 추천 완료! 🥳"}
          </Text>
          <Text style={styles.mainCardSub}>
            지인의 성향 데이터와 설정하신 예산 범위를 매칭해 최적의 선물을
            추천해 드려요.
          </Text>

          {/* 다시 추천받기 버튼 테마 일치화 */}
          {!recommendMutation.isPending && (
            <TouchableOpacity
              style={styles.cuteButton}
              onPress={() => {
                recommendMutation.reset();
                recommendMutation.mutate();
              }}
            >
              <Text style={styles.cuteButtonText}>선물 다시 추천받기</Text>
              <RefreshCw size={16} color="#FFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
        </View>

        {/* 3. 추천 결과 상품 리스트 영역 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🎁 AI가 픽한 선물 리스트</Text>

          {recommendMutation.isPending ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="small" color="#FF7096" />
              <Text style={styles.loaderBoxText}>
                AI 엔진이 상품 분석 및{"\n"}실시간 최저가 매핑 작업 중... 🚀
              </Text>
            </View>
          ) : displayItems.length > 0 ? (
            displayItems.map((item: RecommendedProduct) => (
              <View key={item.id} style={styles.productCard}>
                <View style={styles.productMainRow}>
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[styles.productImage, styles.imagePlaceholder]}
                    >
                      <ShoppingBag size={24} color="#FFAEC4" />
                    </View>
                  )}
                  <View style={styles.productTextSide}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.product_name}
                    </Text>
                    <Text style={styles.productPrice}>
                      {formatPrice(item.product_price)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardDivider} />

                <View style={styles.reasonContainer}>
                  <Text style={styles.reasonLabel}>🤖 추천 이유</Text>
                  <Text style={styles.reasonText}>
                    {item.recommendation_reason}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleOpenLink(item.product_url)}
                >
                  <Text style={styles.linkButtonText}>선물 구매하기</Text>
                  <ExternalLink
                    size={14}
                    color="#FF7096"
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <ShoppingBag size={32} color="#E5E5EA" />
              <Text style={styles.emptyContainerText}>
                아직 추천 내역이 없어요.{"\n"}새로운 이벤트를 등록해 보세요!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#FFF0F3",
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FF7096",
    fontStyle: "italic",
    marginLeft: 12,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
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

  /* 아기자기한 화이트 클라우드 카드 테마 스타일 */
  cloudCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FFE3EB",
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  bubbleTag: {
    backgroundColor: "#FFF0F3",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    marginBottom: 12,
  },
  bubbleTagText: { fontSize: 11, fontWeight: "700", color: "#FF7096" },
  mainCardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D2D3A",
    textAlign: "center",
  },
  mainCardSub: {
    fontSize: 13,
    color: "#757580",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 10,
  },

  /* 시그니처 큐트 버튼 구조 */
  cuteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF7096",
    width: "100%",
    paddingVertical: 16,
    marginTop: 20,
    borderRadius: 24,
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  cuteButtonText: { color: "#FFF", fontSize: 15, fontWeight: "800" },

  sectionContainer: { marginTop: 10 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2D2D3A",
    marginBottom: 16,
    paddingLeft: 2,
  },

  /* 개별 상품 카드 레이아웃 테마 */
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#F6F6FA",
  },
  productMainRow: { flexDirection: "row", alignItems: "center" },
  productImage: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: "#FFFBFB",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFF0F3",
  },
  productTextSide: { flex: 1, marginLeft: 16, justifyContent: "center" },
  productName: { fontSize: 15, fontWeight: "700", color: "#2D2D3A" },
  productPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FF7096",
    marginTop: 4,
  },
  cardDivider: { height: 1, backgroundColor: "#F6F6FA", marginVertical: 14 },
  reasonContainer: {
    backgroundColor: "#FFFBFB",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFF0F3",
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF7096",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5C5C62",
    lineHeight: 18,
  },
  linkButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 12,
    backgroundColor: "#FFF0F3",
    borderRadius: 16,
  },
  linkButtonText: { fontSize: 13, fontWeight: "800", color: "#FF7096" },

  loaderBox: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#FFE3EB",
    alignItems: "center",
  },
  loaderBoxText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#757580",
    textAlign: "center",
    lineHeight: 18,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainerText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#AEAEB2",
    textAlign: "center",
    lineHeight: 18,
  },
});
