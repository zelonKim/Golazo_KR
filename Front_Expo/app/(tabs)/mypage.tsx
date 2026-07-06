import { useTheme } from "@react-navigation/native";
import { Gift, Heart, LogOut, Settings, User } from "lucide-react-native";
import React, { useState } from "react";
import {
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
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);

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
        {/* 👤 2. 가로 분할형 프로필 대시보드 카드 (디자인 정체성 유지) */}
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

        {/* ⚙ 3. 수정된 부분: 하나의 카테고리로 깔끔하게 통합된 일반 설정 리스트 */}
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

          {/* 로그아웃 */}
          <TouchableOpacity style={styles.cuteListItem}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
  },
  /* 👤 프로필 대시보드 카드 */
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
  profileMainRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  profileTextSide: {
    marginLeft: 16,
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bubbleTag: {
    backgroundColor: "#FFF0F3",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  bubbleTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF7096",
  },
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
  avatarEmoji: {
    fontSize: 32,
  },
  mainCardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D2D3A",
  },
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
  /* 대시보드 스탯 */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2D2D3A",
  },
  statLabel: {
    fontSize: 11,
    color: "#757580",
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#F6F6FA",
  },
  /* ⚙ 리스트 통합 섹션 */
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D2D3A",
  },
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
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  heartIconBg: {
    backgroundColor: "#FFF0F3",
    padding: 10,
    borderRadius: 50,
  },
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
