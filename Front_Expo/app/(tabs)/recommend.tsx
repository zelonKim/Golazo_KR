import { client } from "@/api/client";
import { useTheme } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { User, UserPlus } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

interface Recipient {
  id: number;
  name: string;
}

const PURPOSE_LIST = [
  { code: "FRIEND_BDAY", label: "🎂 친구 생일" },
  { code: "LOVER_BDAY", label: "❤️ 애인 생일" },
  { code: "PARENTS_BDAY", label: "💐 부모님 생신" },
  { code: "COUPLE_ANNIV", label: "👩‍❤️‍👨 커플 기념일" },
  { code: "WED_ANNIV", label: "💍 결혼 기념일" },
  { code: "GRADUATE", label: "🎓 졸업" },
  { code: "EMPLOY", label: "💼 취업" },
  { code: "HOUSE", label: "🏠 집들이" },
  { code: "BIRTH", label: "👶 출산" },
  { code: "SELF_GIFT", label: "🎁 나에게 선물" },
];

export default function RecommendScreen() {
  const { colors } = useTheme();

  // 📝 입력 폼 상태 관리
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(
    null,
  );
  const [eventPurpose, setEventPurpose] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  // 🔍 1. useQuery: 내 지인 리스트 가져오기
  const { data: recipients = [] } = useQuery<Recipient[]>({
    queryKey: ["recipients"],
    queryFn: async () => {
      const response = await client.get("gift/recipient/");
      return response.data;
    },
  });

  // 🚀 2. useMutation: 지인에게 새로운 이벤트 생성하기
  const createEventMutation = useMutation({
    mutationFn: async (newEventData: {
      purpose: string;
      min_budget: number;
      max_budget: number;
    }) => {
      if (!selectedRecipientId) throw new Error("지인을 선택해야 합니다.");
      const response = await client.post(
        `gift/recipient/${selectedRecipientId}/event/`,
        newEventData,
      );
      return response.data;
    },
    onSuccess: (data) => {
      const serverEventId =
        data.event_id || data.id || (data.event && data.event.id);

      if (!serverEventId) {
        Alert.alert("오류 😢", "이벤트 생성 실패");
        return;
      }

      // 폼 리셋
      setEventPurpose("");
      setMinBudget("");
      setMaxBudget("");
      setSelectedRecipientId(null);

      // 🎉 [핵심 변경] 등록 완료 후 결과 페이지로 event_id를 넘기며 자동 이동!
      router.push({
        pathname: "/recommendResult",
        params: { event_id: serverEventId },
      });
    },
    onError: (error: any) => {
      console.error("이벤트 등록 실패:", error.response?.data);
      Alert.alert("등록 실패 🥲", "입력 내용을 다시 한번 확인해 주세요.");
    },
  });

  const handleCreateEvent = () => {
    if (!selectedRecipientId || !eventPurpose || !minBudget || !maxBudget) {
      Alert.alert(
        "알림 🎀",
        "상대방과 선물 목적, 예산 범위를 모두 입력해 주세요!",
      );
      return;
    }
    createEventMutation.mutate({
      purpose: eventPurpose,
      min_budget: Number(minBudget),
      max_budget: Number(maxBudget),
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={styles.logoText}>AI Recommend</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        // 안드로이드는 네이티브 윈도우 조절을 타므로 iOS만 살짝 패딩 보정해주면 부드럽습니다.
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* 🚨 [정석 서순 2] 허공 터치 시 키보드 dismiss 레이어를 스크롤뷰 위에 얹어줍니다. */}


        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // 💡 배지나 버튼 누를 때 키보드 때문에 터치가 한 번 씹히는 걸 방지해줍니다!
        >
          <View style={styles.formContainer}>
            <Text style={styles.mainTitle}>누구를 위한 선물인가요? ✨</Text>
            <Text style={styles.mainSub}>
              선물 대상과 이벤트를 등록하고 AI에게 {"\n"}최적의 선물을 추천
              받아보세요.
            </Text>

            {/* 👥 인풋 1: 선물 대상 선택 */}
            <Text style={styles.inputLabel}>선물 대상 선택</Text>
            {/* 지인 가로 스크롤 영역 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recipientSelector}
              keyboardShouldPersistTaps="handled" // 👈 여기도 추가하면 지인 배지 누를 때 키보드가 바로 안 내려가고 찰떡같이 선택됩니다.
            >
              <TouchableOpacity
                style={[
                  styles.recipientBadge,
                  {
                    backgroundColor: "#FFF0F3",
                    borderColor: "#FF7096",
                    borderStyle: "dashed",
                  },
                ]}
                onPress={() => router.push("/(tabs)/recipient")}
              >
                <UserPlus
                  size={13}
                  color="#FF7096"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[styles.recipientBadgeText, { fontWeight: "900" }]}
                >
                  지인 추가 +
                </Text>
              </TouchableOpacity>

              {recipients.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.recipientBadge,
                    selectedRecipientId === r.id &&
                      styles.recipientBadgeSelected,
                  ]}
                  onPress={() => setSelectedRecipientId(r.id)}
                >
                  <User
                    size={12}
                    color={selectedRecipientId === r.id ? "white" : "#FF7096"}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.recipientBadgeText,
                      selectedRecipientId === r.id && { color: "white" },
                    ]}
                  >
                    {r.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 🎁 인풋 2: 선물 목적 */}
            <Text style={styles.inputLabel}>선물 목적</Text>
            <View style={styles.gridContainer}>
              {PURPOSE_LIST.map((item) => {
                const isSelected = eventPurpose === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[
                      styles.purposeGridBadge,
                      isSelected && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setEventPurpose(item.code)}
                  >
                    <Text
                      style={[
                        styles.purposeGridBadgeText,
                        isSelected && { color: "white" },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 💰 인풋 3: 예산 범위 설정 */}
            <Text style={styles.inputLabel}>예산 범위 설정 (원 단위)</Text>
            <View style={styles.budgetRow}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="최소 예산"
                  placeholderTextColor="#AEAEB2"
                  keyboardType="numeric"
                  value={minBudget}
                  onChangeText={setMinBudget}
                />
              </View>
              <Text style={styles.budgetBetween}>~</Text>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="최대 예산"
                  placeholderTextColor="#AEAEB2"
                  keyboardType="numeric"
                  value={maxBudget}
                  onChangeText={setMaxBudget}
                />
              </View>
            </View>

            {/* 🤖 추천받기 제출 버튼 */}
            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                createEventMutation.isPending && styles.disabledButton,
              ]}
              onPress={handleCreateEvent}
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.modalSubmitButtonText}>
                  선물 추천받기 🤖
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
   
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#FFF0F3",
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FF7096",
    fontStyle: "italic",
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 20,
    borderWidth: 1.5,
    borderColor: "#FFF0F3",
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D2D3A",
    marginBottom: 6,
  },
  mainSub: { fontSize: 13, color: "#757580", marginBottom: 24 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#757580",
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBFB",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F6F6FA",
    paddingHorizontal: 16,
    height: 52,
  },
  textInput: { flex: 1, fontSize: 14, fontWeight: "600", color: "#2D2D3A" },
  recipientSelector: {
    flexDirection: "row",
    marginBottom: 12,
    paddingVertical: 4,
  },
  recipientBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F3",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#FFE3EB",
  },
  recipientBadgeSelected: {
    backgroundColor: "#FF7096",
    borderColor: "#FF7096",
  },
  recipientBadgeText: { fontSize: 13, fontWeight: "700", color: "#FF7096" },
  budgetRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  budgetBetween: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#AEAEB2",
  },
  modalSubmitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF7096",
    height: 54,
    borderRadius: 20,
    marginTop: 16,
  },
  modalSubmitButtonText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  disabledButton: { backgroundColor: "#FFAEC4" },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  purposeGridBadge: {
    width: "48.5%",
    backgroundColor: "#FFF0F3",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFE3EB",
  },
  purposeGridBadgeText: { fontSize: 13, fontWeight: "700", color: "#FF7096" },
  choiceBadgeSelected: { backgroundColor: "#FF7096", borderColor: "#FF7096" },
});
