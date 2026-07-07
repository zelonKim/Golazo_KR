import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router"; // 💡 라우터 이동을 위해 임포트 추가!
import * as SecureStore from "expo-secure-store"; // 💡 토큰 삭제를 위해 임포트 추가!
import { Gift, Heart, LogOut, Settings, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert, // 💡 로그아웃 확인 창을 위해 임포트 추가!
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function MyPageScreen() {
  const { colors } = useTheme();
  const router = useRouter(); // 💡 라우터 훅 선언
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);

  // 🚪 실제 로그아웃 처리 핸들러 함수
  const handleLogOut = () => {
    Alert.alert(
      "로그아웃 ",
      "정말 로그아웃 하시겠어요?",
      [
        {
          text: "아니오",
          style: "cancel", // 팝업 닫기
        },
        {
          text: "네",
          style: "destructive", // 빨간색 강조 버튼 (iOS 기준)
          onPress: async () => {
            try {
              // 1. 우리 인터셉터가 바라보는 토큰 키값을 완전히 삭제합니다.
              await SecureStore.deleteItemAsync("userToken");

              // 2. 뒤로가기로 마이페이지에 다시 못 오도록 replace를 사용해 로그인 창으로 워프!
              router.replace("/login");
            } catch (error) {
              console.error("로그아웃 중 오류 발생:", error);
              Alert.alert(
                "오류",
                "로그아웃 처리에 실패했습니다. 다시 시도해 주세요.",
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top"]}
    >
      {/* 1. 귀여운 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>My Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 👤 2. 가로 분할형 프로필 대시보드 카드 */}
        <View style={styles.cloudCard}>
          <View style={styles.profileMainRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>🧸</Text>
            </View>
            <View style={styles.profileTextSide}>
              <View style={styles.badgeRow}>
                <View style={styles.bubbleTag}>
                  <Text style={styles.bubbleTagText}>반가워요 성진님✨</Text>
                </View>
              </View>
              <Text style={styles.mainCardTitle}>김성진</Text>
              <Text style={styles.mainCardEmail}>sungjin@example.com</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* 미니 활동 통계 스탯 영역 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Heart
                size={16}
                color="#FF7096"
                fill="#FF7096"
                style={{ marginBottom: 4 }}
              />
              <Text style={styles.statNumber}>12명</Text>
              <Text style={styles.statLabel}>소중한 인맥</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Gift size={16} color="#FFB800" style={{ marginBottom: 4 }} />
              <Text style={styles.statNumber}>3개</Text>
              <Text style={styles.statLabel}>챙긴 기념일</Text>
            </View>
          </View>
        </View>

        {/* ⚙ 3. 서비스 설정 리스트 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚙ 서비스 설정</Text>
          </View>

          {/* 닉네임 변경 */}
          <TouchableOpacity style={styles.cuteListItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.heartIconBg}>
                <User size={16} color="#FF7096" />
              </View>
              <View>
                <Text style={styles.listItemName}>닉네임 변경</Text>
                <Text style={styles.listItemSubText}>
                  앱에서 사용할 이름 수정하기
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 기념일 푸시 알림 */}
          <View style={styles.cuteListItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.heartIconBg}>
                <Settings size={16} color="#FF7096" />
              </View>
              <View>
                <Text style={styles.listItemName}>기념일 푸시 알림</Text>
                <Text style={styles.listItemSubText}>
                  소중한 날 똑똑하게 받아보기
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E5EA", true: "#FFE3EB" }}
              thumbColor={isAlarmEnabled ? "#FF7096" : "#F2F2F7"}
              ios_backgroundColor="#E5E5EA"
              onValueChange={() => setIsAlarmEnabled(!isAlarmEnabled)}
              value={isAlarmEnabled}
            />
          </View>

          {/* 로그아웃 버튼 */}
          {/* 💡 여기에 onPress={handleLogOut}을 연결했습니다! */}
          <TouchableOpacity style={styles.cuteListItem} onPress={handleLogOut}>
            <View style={styles.listItemLeft}>
              <View style={styles.heartIconBg}>
                <LogOut size={16} color="#FF7096" />
              </View>
              <View>
                <Text style={styles.listItemName}>로그아웃</Text>
                <Text style={styles.listItemSubText}>
                  현재 기기에서 계정 나가기
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... styles 구조는 기존 성진님 코드와 100% 동일하므로 생략합니다!
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#FFF0F3",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FF7096",
    fontStyle: "italic",
  },
  scrollContent: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 },
  cloudCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFE3EB",
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  profileMainRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  profileTextSide: { marginLeft: 16, flex: 1 },
  badgeRow: { flexDirection: "row", marginBottom: 4 },
  bubbleTag: {
    backgroundColor: "#FFF0F3",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  bubbleTagText: { fontSize: 11, fontWeight: "700", color: "#FF7096" },
  avatarContainer: {
    width: 68,
    height: 68,
    backgroundColor: "#FFF0F3",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFE3EB",
  },
  avatarEmoji: { fontSize: 32 },
  mainCardTitle: { fontSize: 22, fontWeight: "800", color: "#2D2D3A" },
  mainCardEmail: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AEAEB2",
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#FFF0F3",
    marginVertical: 18,
    width: "100%",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  statItem: { alignItems: "center", flex: 1 },
  statNumber: { fontSize: 16, fontWeight: "800", color: "#2D2D3A" },
  statLabel: {
    fontSize: 11,
    color: "#757580",
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: { width: 1, height: 24, backgroundColor: "#F6F6FA" },
  sectionContainer: { marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2D2D3A" },
  cuteListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#F6F6FA",
  },
  listItemLeft: { flexDirection: "row", alignItems: "center" },
  heartIconBg: { backgroundColor: "#FFF0F3", padding: 10, borderRadius: 50 },
  listItemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D2D3A",
    marginLeft: 14,
  },
  listItemSubText: {
    fontSize: 12,
    color: "#AEAEB2",
    marginTop: 3,
    marginLeft: 14,
  },
});
