import { Coins, Heart, Smile, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
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

// 💡 장고 AI 프롬프트 연동을 위한 옵션 리스트 정의
const TARGETS = ["연인 💖", "부모님 🏡", "친구 🤝", "직장동료 ☕"];
const BUDGETS = ["3만원 이하", "3~5만원", "5~10만원", "10만원 이상 🔥"];
const MOODS = ["감동적인 🥹", "실용적인 🛠️", "센스있는 😎", "귀여운 🧸"];

export default function RecommendScreen() {
  // 유저가 선택한 값을 담을 상태(State) - 나중에 장고 API로 쏠 데이터들!
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedMood, setSelectedMood] = useState("");

  const handleStartAI = () => {
    if (!selectedTarget || !selectedBudget || !selectedMood) {
      alert("모든 조건을 톡톡 골라주세요! 🎀");
      return;
    }
    console.log("장고 AI 추천 API 호출 데이터:", {
      target: selectedTarget,
      budget: selectedBudget,
      mood: selectedMood,
    });
    // 여기에 나중에 axios.post('/api/recommend/', { ... }) 가 들어갑니다!
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top"]}
    >
      {/* 1. 상단 타이틀 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Recommend</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🪄 상단 안내 요정 박스 */}
        <View style={styles.wizardCard}>
          <Text style={styles.wizardEmoji}>🪄</Text>
          <Text style={styles.wizardText}>
            누구에게 어떤 선물을 할지 곰곰이 고르면,{"\n"}
            AI 마법사가 특별한 선물을 큐레이션 해줄게요!
          </Text>
        </View>

        {/* 👥 Q1. 누구에게 선물하나요? */}
        <View style={styles.questionSection}>
          <View style={styles.questionTitleRow}>
            <Heart size={18} color="#FF7096" fill="#FF7096" />
            <Text style={styles.questionTitle}>누구에게 선물하나요?</Text>
          </View>
          <View style={styles.chipGrid}>
            {TARGETS.map((target) => {
              const isSelected = selectedTarget === target;
              return (
                <TouchableOpacity
                  key={target}
                  style={[styles.chip, isSelected && styles.selectedChip]}
                  onPress={() => setSelectedTarget(target)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.selectedChipText,
                    ]}
                  >
                    {target}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 💵 Q2. 예산은 얼마인가요? */}
        <View style={styles.questionSection}>
          <View style={styles.questionTitleRow}>
            <Coins size={18} color="#FF7096" />
            <Text style={styles.questionTitle}>준비한 예산은 얼마인가요?</Text>
          </View>
          <View style={styles.chipGrid}>
            {BUDGETS.map((budget) => {
              const isSelected = selectedBudget === budget;
              return (
                <TouchableOpacity
                  key={budget}
                  style={[styles.chip, isSelected && styles.selectedChip]}
                  onPress={() => setSelectedBudget(budget)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.selectedChipText,
                    ]}
                  >
                    {budget}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 🧸 Q3. 어떤 느낌의 선물을 원하나요? */}
        <View style={styles.questionSection}>
          <View style={styles.questionTitleRow}>
            <Smile size={18} color="#FF7096" />
            <Text style={styles.questionTitle}>
              어떤 분위기의 선물이 좋을까요?
            </Text>
          </View>
          <View style={styles.chipGrid}>
            {MOODS.map((mood) => {
              const isSelected = selectedMood === mood;
              return (
                <TouchableOpacity
                  key={mood}
                  style={[styles.chip, isSelected && styles.selectedChip]}
                  onPress={() => setSelectedMood(mood)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.selectedChipText,
                    ]}
                  >
                    {mood}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 🚀 대망의 AI 추천 시작하기 매직 버튼 */}
        <TouchableOpacity style={styles.magicButton} onPress={handleStartAI}>
          {/* <Gift size={20} color="#FFF" style={{ marginRight: 8 }} /> */}
          <Text style={styles.magicButtonText}>AI에게 추천 부탁하기</Text>
          <Sparkles size={16} color="#FFF" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
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
  /* 🪄 마법사 카드 레이아웃 */
  wizardCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    marginBottom: 26,
    borderWidth: 2,
    borderColor: "#FFE3EB",
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  wizardEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  wizardText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5C5C62",
    lineHeight: 18,
    flex: 1,
  },
  /* ❓ 설문 질문 섹션 */
  questionSection: {
    marginBottom: 26,
  },
  questionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingLeft: 4,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2D2D3A",
    marginLeft: 8,
  },
  /* 💊 동글동글 젤리 칩 칩 레이아웃 */
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap", // 바둑판식 자동 줄바꿈 활성화
    gap: 10,
  },
  chip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20, // 홈화면 젤리 배지들과 통일
    borderWidth: 1.5,
    borderColor: "#F6F6FA",
    // 미세한 조약돌 섀도우
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedChip: {
    backgroundColor: "#FFF0F3", // 선택되면 연핑크 무드로 반전
    borderColor: "#FF7096",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5C5C62",
  },
  selectedChipText: {
    color: "#FF7096", // 선택된 글자는 딸기우유 컬러로 강조
  },
  /* 🎁 최종 매직 버튼 */
  magicButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF7096",
    paddingVertical: 18,
    borderRadius: 24, // 홈화면 메인 버튼과 완벽 동기화
    marginTop: 14,
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  magicButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
