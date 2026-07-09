import { client } from "@/api/client";
import { useTheme } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  Gift,
  Heart,
  LogOut,
  Settings,
  User,
  UserX,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface UserProfile {
  id: number;
  username: string;
  email: string;
  nickname?: string | null;
  recipients?: any[];
}

export default function MyPageScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [inputNickname, setInputNickname] = useState("");

  // 🔍 1. useQuery: 내 프로필 정보 실시간 조회 (GET /user/me/)
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await client.get("user/me/");
      return response.data;
    },
  });

  // 🚀 2. useMutation: 닉네임 수정 (PATCH /user/me/)
  const updateNicknameMutation = useMutation({
    mutationFn: async (nickname: string) => {
      const response = await client.patch("user/me/", { nickname });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      Alert.alert("변경 완료", "새로운 닉네임이 프로필에 반영되었습니다.");
      setIsEditModalVisible(false);
    },
    onError: () => {
      Alert.alert("오류", "닉네임 수정에 실패했습니다.");
    },
  });

  // 🚀 3. useMutation: 회원 탈퇴 (DELETE /user/me/)
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return (await client.delete("user/me/")).data;
    },
    onSuccess: async () => {
      await SecureStore.deleteItemAsync("userToken");
      Alert.alert(
        "탈퇴 완료",
        "그동안 서비스를 이용해 주셔서 진심으로 감사드립니다.",
      );
      router.replace("/login");
    },
    onError: () => {
      Alert.alert("오류 😢", "탈퇴 처리에 실패했습니다. 다시 시도해 주세요.");
    },
  });

  // 🛠️ 닉네임 변경 폼 열기 핸들러
  const openEditModal = () => {
    setInputNickname(profile?.nickname || "");
    setIsEditModalVisible(true);
  };

  const handleSaveNickname = () => {
    if (!inputNickname.trim()) {
      Alert.alert("알림", "원하시는 닉네임을 적어주세요!");
      return;
    }
    updateNicknameMutation.mutate(inputNickname.trim());
  };

  const handleLogOut = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠어요?", [
      { text: "아니오", style: "cancel" },
      {
        text: "네",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("userToken");
          router.replace("/login");
        },
      },
    ]);
  };

  // ⚠️ 회원 탈퇴 컨펌 얼럿 핸들러
  const handleDeleteAccountCheck = () => {
    Alert.alert(
      "⚠️ 회원 탈퇴 ",
      "정말 계정을 삭제하시겠어요?\n\n등록하신 지인 정보와 선물 추천 내역도 모두 삭제되며 이는 복구할 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴할래요",
          style: "destructive",
          onPress: () => deleteAccountMutation.mutate(),
        },
      ],
    );
  };

  // 📊 역참조 데이터 개수 동적 연산
  const totalRecipients = profile?.recipients?.length || 0;
  const totalEvents =
    profile?.recipients?.reduce((sum, r) => sum + (r.events?.length || 0), 0) ||
    0;

  if (isLoading) {
    return (
      <View style={styles.centerFlex}>
        <ActivityIndicator size="large" color="#FF7096" />
      </View>
    );
  }

  // 표시 명칭 분기 가이드라인 반영
  const displayNickname = profile?.nickname || "닉네임을 설정해주세요";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top"]}
    >
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
              <Text style={styles.avatarEmoji}>🎁</Text>
            </View>
            <View style={styles.profileTextSide}>
              <View style={styles.badgeRow}>
                <View style={styles.bubbleTag}>
                  <Text style={styles.bubbleTagText} numberOfLines={1}>
                    {profile?.nickname && `반가워요 👋`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={openEditModal}>
                <Text
                  style={[
                    styles.mainCardTitle,
                    !profile?.nickname && { color: "#bebec1", fontSize: 16 },
                  ]}
                  numberOfLines={1}
                >
                  {displayNickname}
                </Text>
              </TouchableOpacity>
              <Text style={styles.mainCardEmail}>{profile?.email || ""}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* 실시간 연동 미니 활동 통계 스탯 영역 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Heart
                size={16}
                color="#FF7096"
                fill="#FF7096"
                style={{ marginBottom: 4 }}
              />
              <Text style={styles.statNumber}>{totalRecipients}명</Text>
              <Text style={styles.statLabel}>소중한 인맥</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Gift size={16} color="#FFB800" style={{ marginBottom: 4 }} />
              <Text style={styles.statNumber}>{totalEvents}개</Text>
              <Text style={styles.statLabel}>챙긴 기념일</Text>
            </View>
          </View>
        </View>

        {/* ⚙️ 3. 서비스 설정 리스트 */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Settings size={22} color={"#FF7096"} />
            <Text style={styles.sectionTitle}>서비스 설정</Text>
          </View>

          {/* 닉네임 변경 터치 시 모달 온 */}
          <TouchableOpacity style={styles.cuteListItem} onPress={openEditModal}>
            <View style={styles.listItemLeft}>
              <View style={styles.heartIconBg}>
                <User size={16} color="#FF7096" />
              </View>
              <View>
                <Text style={styles.listItemName}>닉네임 설정 및 변경</Text>
                <Text style={styles.listItemSubText}>
                  앱에서 사용할 이름 수정하기
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 기념일 푸시 알림 */}
          {/* <View style={styles.cuteListItem}>
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
          </View> */}

          {/* 로그아웃 버튼 */}
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

          {/* 🆕 회원 탈퇴 버튼 (최하단 배치) */}
          <TouchableOpacity
            style={[styles.cuteListItem, { borderColor: "#FFF0F3" }]}
            onPress={handleDeleteAccountCheck}
          >
            <View style={styles.listItemLeft}>
              <View
                style={[styles.heartIconBg, { backgroundColor: "#FFF0F3" }]}
              >
                <UserX size={16} color="#FF4D4D" />
              </View>
              <View>
                <Text style={[styles.listItemName, { color: "#FF4D4D" }]}>
                  회원 탈퇴
                </Text>
                <Text style={styles.listItemSubText}>
                  계정 및 연관 데이터 영구 삭제
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 🎀 닉네임 수정용 큐트 팝업 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          // 안드로이드는 네이티브 윈도우 조절을 타므로 iOS만 살짝 패딩 보정해주면 부드럽습니다.
          keyboardVerticalOffset={Platform.OS === "ios" ? -150 : -120}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>
                    닉네임 설정 및 변경
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsEditModalVisible(false)}
                  >
                    <X size={20} color="#AEAEB2" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>새로운 닉네임</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="닉네임을 입력해 주세요"
                    placeholderTextColor="#AEAEB2"
                    value={inputNickname}
                    onChangeText={setInputNickname}
                    maxLength={15}
                  />
                </View>

                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={handleSaveNickname}
                >
                  <Text style={styles.modalSubmitButtonText}>저장하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

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
  centerFlex: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFBFB",
  },
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
  avatarEmoji: { fontSize: Platform.OS === "ios" ? 32 : 25 },
  mainCardTitle: {
    marginTop: Platform.OS === "ios" ? 4 : 0,
    fontSize: 22,
    fontWeight: "800",
    color: "#2D2D3A",
  },
  mainCardEmail: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7c7c7c",
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
  sectionContainer: { marginTop: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
    gap: 6,
    marginStart: 4,
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

  /* 팝업 모달 감성 스타일 */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(45, 45, 58, 0.4)",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: -100,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    borderWidth: 2,
    borderColor: "#FFE3EB",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: "800", color: "#2D2D3A" },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#757580",
    marginBottom: 8,
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
    marginBottom: 20,
  },
  textInput: { flex: 1, fontSize: 14, fontWeight: "600", color: "#2D2D3A" },
  modalSubmitButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF7096",
    height: 52,
    borderRadius: 20,
  },
  modalSubmitButtonText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
});
