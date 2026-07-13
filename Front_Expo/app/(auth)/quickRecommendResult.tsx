import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { ArrowLeft, BookmarkCheck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Product {
  product_name: string;
  product_price: number;
  recommendation_reason: string;
  product_url: string;
  image_url: string;
}

export default function RecommendResultScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await SecureStore.getItemAsync(
          "golazo_recommend_result",
        );

        if (savedData) {
          setProducts(JSON.parse(savedData));
          setIsReady(true);
        } else {
          Alert.alert(
            "알림",
            "추천 결과가 없습니다. 정보를 다시 입력해 주세요 🥲",
            [{ text: "확인", onPress: () => router.replace("/recommend") }],
          );
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        router.replace("/recommend");
      }
    };

    loadSavedData();
  }, []);

  // 외부 링크 이동 핸들러 (Expo WebBrowser 활용)
  const handleOpenLink = async (url: string) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("링크 열기 실패:", error);
      Alert.alert("오류", "링크를 열 수 없습니다.");
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>결과 화면을 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 🌟 헤더 영역 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/quickRecommend")}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>

        <Text style={styles.badgeText}>🎉 추천 완료</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 타이틀 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.mainTitle}>
            🤖 AI가 픽한 <Text style={styles.highlightText}>맞춤 선물</Text>
          </Text>
          <Text style={styles.subTitle}>
            입력된 정보를 바탕으로 분석한 {"\n"}맞춤 선물 리스트입니다.
          </Text>
        </View>

        {/* 결과 리스트 렌더링 */}
        <View style={styles.listContainer}>
          {products.map((item, idx) => (
            <View key={idx} style={styles.productCard}>
              {/* 상품 상단 정보 (이미지 + 이름/가격) */}
              <View style={styles.productHeader}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderEmoji}>🎁</Text>
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.product_name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {item.product_price === 0
                      ? "변동"
                      : `${item.product_price.toLocaleString()}원`}
                  </Text>
                </View>
              </View>

              {/* AI 추천 이유 */}
              <View style={styles.reasonBox}>
                <Text style={styles.reasonTitle}>🤖 추천 이유</Text>
                <Text style={styles.reasonText}>
                  {item.recommendation_reason}
                </Text>
              </View>

              {/* 구매하기 버튼 */}
              <TouchableOpacity
                style={styles.buyButton}
                onPress={() => handleOpenLink(item.product_url)}
              >
                <Text style={styles.buyButtonText}>
                  🎁 선물 구매하러 가기 ➔
                </Text>
              </TouchableOpacity>

              <Text style={styles.partnersText}>
                ※ 쿠팡 파트너스 활동의 일환으로 구매 시 소정의 수수료를
                제공받습니다.
              </Text>
            </View>
          ))}
        </View>

        {/* 💖 하단 홈 이동 버튼 */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => {
            router.replace("/login");
            Alert.alert("안내", "로그인한 회원만 추천 결과 저장이 가능합니다.");
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.homeButtonText}>추천 결과 저장하기 </Text>
            <BookmarkCheck
              color={"#FF7096"}
              size={22}
              style={{
                marginRight: 3,
                marginTop: Platform.OS === "ios" ? 0 : 3,
              }}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFBFB" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { fontSize: 14, fontWeight: "500", color: "#64748B" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#334155" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  welcomeSection: { alignItems: "center", marginTop: 16, marginBottom: 12 },
  badge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFE4E6",
    shadowColor: "#F43F5E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeText: { fontSize: 16, fontWeight: "700", color: "#FF7096" },
  mainTitle: {
    fontSize: 24,
    fontWeight: Platform.OS === "ios" ? "800" : "700",
    color: "#0F172A",
  },
  subTitle: {
    fontSize: Platform.OS === "ios" ? 13 : 12,
    color: "#64748B",
    marginTop: 6,
    textAlign: "center",
    fontWeight: Platform.OS === "ios" ? "500" : "400",
  },
  listContainer: { marginTop: 20 },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#FF7096",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === "ios" ? 0.03 : 0.1,
    shadowRadius: 8,
    elevation: Platform.OS === "ios" ? 10 : 0.2,
  },
  productHeader: { flexDirection: "row", gap: 14, marginBottom: 14 },
  productImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  imagePlaceholder: {
    width: 88,
    height: 88,
    backgroundColor: "#FFE4E6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: { fontSize: 36 },
  productInfo: { flex: 1, justifyContent: "center" },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    // leadingHegiht: 20,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FF7096",
    marginTop: 6,
  },
  reasonBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  reasonTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: Platform.OS === "ios" ? 12.5 : 11.5,
    color: "#475569",
    lineHeight: Platform.OS === "ios" ? 18 : 17,
    fontWeight: Platform.OS === "ios" ? 500 : 400,
  },
  buyButton: {
    backgroundColor: "#FF7096",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  buyButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  partnersText: {
    fontSize: Platform.OS === "ios" ? 9 : 8,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 12,
    fontWeight: Platform.OS === "ios" ? "500" : "400",
  },
  homeButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 12,
  },
  homeButtonText: {
    fontSize: Platform.OS === "ios" ? 15 : 14,
    color: "#FF7096",
    fontWeight: Platform.OS === "ios" ? "700" : "600",
    // textDecorationLine: "underline",
    borderBottomWidth: 1.2,
    borderBottomColor: "#FF7096",
  },
  highlightText: { color: "#FF7096" },
});
