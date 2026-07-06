import { useTheme } from "@react-navigation/native";
import { Bell, Calendar, Plus } from "lucide-react-native"; // 💡 Plus 아이콘 추가!
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

const UPCOMING_ANNIVERSARIES = [
  { id: 1, content: " 여자친구 생일", date: "7월 24일", dDay: 18 },
  { id: 2, content: " 부모님 결혼기념일", date: "8월 12일", dDay: 37 },
  { id: 3, content: " 베프 이사 집들이", date: "9월 05일", dDay: 61 },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const mainDDay = UPCOMING_ANNIVERSARIES[0];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top"]}
    >
      {/* 1. 귀여운 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Special Day</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={20} color="#5C5C62" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. 몽글몽글 구름 모양의 메인 디데이 카드 */}
        <View style={styles.cloudCard}>
          <View style={styles.bubbleTag}>
            <Text style={styles.bubbleTagText}>곧 다가오는 특별한 날</Text>
          </View>

          <Text style={styles.mainCardDDay}>
            <Text style={{ color: "#FF7096" }}>D-{mainDDay.dDay}</Text>
          </Text>
          <Text style={styles.mainCardTitle}>{mainDDay.content}</Text>

          <TouchableOpacity style={styles.cuteButton}>
            <Text style={styles.cuteButtonText}>AI 맞춤 선물 추천받기</Text>
            <Text> 🎁</Text>
          </TouchableOpacity>
        </View>

        {/* 4. 동글동글 아기자기한 기념일 리스트 */}
        <View style={styles.sectionContainer}>
          {/* 💡 수정된 부분: 타이틀과 플러스 버튼을 나란히 배치하는 헤더 구조 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎉 다가오는 특별한 날</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => console.log("기념일 추가 버튼 클릭됨!")} // 나중에 추가 모달 연동 자리!
            >
              <Plus size={21} color="white" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {UPCOMING_ANNIVERSARIES.map((item) => (
            <TouchableOpacity key={item.id} style={styles.cuteListItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.heartIconBg}>
                  <Calendar size={16} color="#FF7096" />
                </View>
                <View>
                  <Text style={styles.listItemName}>{item.content}</Text>
                  <Text style={styles.listItemDate}>{item.date}</Text>
                </View>
              </View>
              <View style={styles.cuteDDayBadge}>
                <Text style={styles.cuteDDayText}>D-{item.dDay}</Text>
              </View>
            </TouchableOpacity>
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
  iconButton: {
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginTop: -5,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
  },
  cloudCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 26,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFE3EB",
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
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
  bubbleTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF7096",
  },
  mainCardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2D2D3A",
    textAlign: "center",
  },
  mainCardDDay: {
    fontSize: 18,
    fontWeight: "700",
    color: "#757580",
    marginTop: 6,
    marginBottom: 12,
    textAlign: "center",
  },
  cuteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF7096",
    width: "100%",
    paddingVertical: 16,
    marginTop: 24,
    borderRadius: 24,
  },
  cuteButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  sectionContainer: {
    marginTop: 20,
  },
  /* 💡 새롭게 추가된 헤더 가로 정렬 스타일 */
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
  /* 💡 동글동글 아기자기한 플러스 버튼 배경 스타일 */
  addButton: {
    padding: 8,
    backgroundColor: "#FF7096", // 앙증맞은 연핑크 배경 동그라미
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
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
    marginRight: 14,
  },
  listItemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D2D3A",
  },
  listItemDate: {
    fontSize: 12,
    color: "#AEAEB2",
    marginTop: 3,
  },
  cuteDDayBadge: {
    backgroundColor: "#FFF0F3",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
  },
  cuteDDayText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF7096",
  },
});
