import { client } from "@/api/client";
import { useTheme } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Plus, Trash2, User, UserPlus, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// 장고 Recipient 모델에 완벽 호환되는 타입 정의
interface Recipient {
  id: number;
  name: string;
  gender: "M" | "F" | "N";
  age_group: string;
  mbti?: string | null;
  hobbies?: string | null;
  notes?: string | null;
}

export default function RecipientScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  // 📝 모달 및 폼 상태 관리
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(
    null,
  );

  // 📝 입력 필드 스테이트
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"M" | "F" | "N">("N");
  const [ageGroup, setAgeGroup] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [notes, setNotes] = useState("");

  // 🧠 MBTI 개별 성향 상태 관리 (선택형 UI를 위함)
  const [mbtiEI, setMbtiEI] = useState<"E" | "I" | null>(null);
  const [mbtiSN, setMbtiSN] = useState<"S" | "N" | null>(null);
  const [mbtiTF, setMbtiTF] = useState<"T" | "F" | null>(null);
  const [mbtiJP, setMbtiJP] = useState<"J" | "P" | null>(null);

  // 수정 모드 진입 시 기존 MBTI 문자열을 파싱하여 상태에 반영
  useEffect(() => {
    if (editingRecipient && editingRecipient.mbti) {
      // 혹시 모를 공백 제거 및 대문자 변환
      const savedMbti = editingRecipient.mbti.trim().toUpperCase();

      // 🆕 각 알파벳이 정확히 포함되어 있는지 검사 (단어 오인식 방지)
      setMbtiEI(
        savedMbti.includes("E") ? "E" : savedMbti.includes("I") ? "I" : null,
      );
      setMbtiSN(
        savedMbti.includes("S") ? "S" : savedMbti.includes("N") ? "N" : null,
      );
      setMbtiTF(
        savedMbti.includes("T") ? "T" : savedMbti.includes("F") ? "F" : null,
      );
      setMbtiJP(
        savedMbti.includes("J") ? "J" : savedMbti.includes("P") ? "P" : null,
      );

      // 🔥 [추가 피드백 방어 코드]
      // 만약 백엔드에서 데이터가 없을 때 널이 아니라 문자열 "NONE"을 주는 경우가 있다면
      // 아래와 같이 예외 처리를 해주면 완벽합니다.
      if (savedMbti === "NONE" || savedMbti === "NULL") {
        setMbtiEI(null);
        setMbtiSN(null);
        setMbtiTF(null);
        setMbtiJP(null);
      }
    } else {
      // 데이터가 없으면 모두 초기화
      setMbtiEI(null);
      setMbtiSN(null);
      setMbtiTF(null);
      setMbtiJP(null);
    }
  }, [editingRecipient]);

  // 🔍 1. useQuery: 내 지인 목록 가져오기
  const { data: recipients = [], isLoading } = useQuery<Recipient[]>({
    queryKey: ["recipients"],
    queryFn: async () => {
      const response = await client.get("gift/recipient/");
      return response.data;
    },
  });

  // 🚀 2. useMutation: 지인 등록 (POST)
  const addRecipientMutation = useMutation({
    mutationFn: async (newData: Omit<Recipient, "id">) => {
      return (await client.post("gift/recipient/", newData)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      Alert.alert("추가 완료", "해당 지인이 성공적으로 추가되었어요.");
      closeFormModal();
    },
    onError: (error: any) => {
      console.log("서버 에러:", error.response?.data);
      Alert.alert(
        "등록 실패",
        JSON.stringify(error.response?.data) || "데이터 형식을 확인해 주세요.",
      );
    },
  });

  // 🚀 3. useMutation: 지인 수정 (PATCH)
  const updateRecipientMutation = useMutation({
    mutationFn: async ({
      id,
      updatedData,
    }: {
      id: number;
      updatedData: Partial<Recipient>;
    }) => {
      return (await client.patch(`gift/recipient/${id}/`, updatedData)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      Alert.alert("변경 완료", "지인의 정보가 정상적으로 변경되었습니다.");
      closeFormModal();
    },
  });

  // 🚀 4. useMutation: 지인 삭제 (DELETE)
  const deleteRecipientMutation = useMutation({
    mutationFn: async (id: number) => {
      return (await client.delete(`gift/recipient/${id}/`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      Alert.alert(
        "삭제 완료 🌊",
        "지인 정보가 리스트에서 안전하게 제거되었습니다.",
      );
    },
  });

  // 🛠️ 수정 모드 폼 열기 핸들러
  const openEditModal = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setName(recipient.name);
    setGender(recipient.gender);

    let uiAgeGroup = "20대";
    if (recipient.age_group === "0") {
      uiAgeGroup = "10대 미만";
    } else if (recipient.age_group === "80") {
      uiAgeGroup = "80대 이상";
    } else if (recipient.age_group) {
      uiAgeGroup = `${recipient.age_group}대`;
    }
    setAgeGroup(uiAgeGroup); // 👈 복원된 UI용 값을 상태에 세팅!

    setHobbies(recipient.hobbies || "");
    setNotes(recipient.notes || "");
    setIsFormModalVisible(true);
  };

  // ❌ 모달 닫기 및 초기화
  const closeFormModal = () => {
    setIsFormModalVisible(false);
    setEditingRecipient(null);
    setName("");
    setGender("N");
    setAgeGroup("");
    setHobbies("");
    setNotes("");
    setMbtiEI(null);
    setMbtiSN(null);
    setMbtiTF(null);
    setMbtiJP(null);
  };

  // 💾 최종 저장 버튼 핸들러
  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("알림", "지인의 이름을 입력해 주세요!");
      return;
    }

    if (!gender) {
      Alert.alert("알림", "지인의 성별을 선택해 주세요!");
      return;
    }

    if (!ageGroup) {
      Alert.alert("알림", "지인의 나이대를 선택해 주세요!");
      return;
    }

    // 🆕 선택된 것만 글자를 합치고, 선택 안 된 null은 빈 문자열("")로 대체
    const mbtiStr = `${mbtiEI || ""}${mbtiSN || ""}${mbtiTF || ""}${mbtiJP || ""}`;

    // 최종 글자수가 0보다 크면 그 문자열을 쓰고, 아무것도 선택 안 했으면 null 처리
    const combinedMbti = mbtiStr.length > 0 ? mbtiStr : null;

    let convertedAgeGroup; // 기본값 지정

    if (ageGroup === "10대 미만") convertedAgeGroup = "0";
    else if (ageGroup === "80대 이상") convertedAgeGroup = "80";
    else {
      // "20대" 에서 "대"를 제거하고 숫자 "20"만 추출하는 정규식/슬라이싱
      convertedAgeGroup = ageGroup.replace("대", "");
    }

    const payload = {
      name: name.trim(),
      gender,
      age_group: convertedAgeGroup,
      mbti: combinedMbti,
      hobbies: hobbies.trim() || null,
      notes: notes.trim() || null,
    };

    if (editingRecipient) {
      updateRecipientMutation.mutate({
        id: editingRecipient.id,
        updatedData: payload,
      });
    } else {
      addRecipientMutation.mutate(payload);
    }
  };

  // 🗑️ 삭제 컨펌 얼럿 핸들러
  const handleDeleteCheck = (id: number, targetName: string) => {
    Alert.alert(
      "⚠️삭제 확인 ",
      `정말 ${targetName}님을 지인 목록에서 삭제하시겠어요?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제하기",
          style: "destructive",
          onPress: () => deleteRecipientMutation.mutate(id),
        },
      ],
    );
  };

  const getGenderEmoji = (g: string) => {
    if (g === "M") return "👦🏻";
    if (g === "F") return "👧🏻";
    return "🧸";
  };

  const ageGroups = [
    "10대 미만",
    "10대",
    "20대",
    "30대",
    "40대",
    "50대",
    "60대",
    "70대",
    "80대 이상",
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top"]}
    >
      {/* 1. 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>My People</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsFormModalVisible(true)}
        >
          <Plus size={20} color="white" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* 로딩 처리 */}
      {isLoading ? (
        <View style={styles.centerFlex}>
          <ActivityIndicator size="large" color="#FF7096" />
          <Text style={styles.loadingText}>지인 정보를 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {recipients.length > 0 ? (
            recipients.map((item) => {
              // 🆕 백엔드의 숫자 데이터를 리스트 화면용 한글로 변환해주는 로직
              let displayAge = "20대"; // 혹시 모를 예외 대비 기본값
              if (item.age_group === "0") {
                displayAge = "10대 미만";
              } else if (item.age_group === "80") {
                displayAge = "80대 이상";
              } else if (item.age_group) {
                displayAge = `${item.age_group}대`;
              }

              return (
                <View key={item.id} style={styles.networkCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.avatarBox}>
                      <Text style={{ fontSize: 22 }}>
                        {getGenderEmoji(item.gender)}
                      </Text>
                    </View>
                    <View style={styles.mainInfoSide}>
                      <Text style={styles.recipientName}>{item.name}</Text>
                      <Text style={styles.recipientMeta}>
                        {/* 🆕 변환된 한글 나이대(displayAge)를 여기에 쏙 넣어줍니다! */}
                        {displayAge} ·{" "}
                        {item.gender === "M"
                          ? "남성"
                          : item.gender === "F"
                            ? "여성"
                            : "미정"}
                        {item.mbti ? ` · ${item.mbti}` : ""}
                      </Text>
                    </View>
                    {/* 🛠️ 잘렸던 버튼 영역 복구 완료 */}
                    <View style={styles.actionButtonGroup}>
                      <TouchableOpacity
                        style={styles.iconMiniButton}
                        onPress={() => openEditModal(item)}
                      >
                        <Edit2 size={15} color="#AEAEB2" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconMiniButton, { marginLeft: 8 }]}
                        onPress={() => handleDeleteCheck(item.id, item.name)}
                      >
                        <Trash2 size={15} color="#FF7096" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 취미 및 특이사항 조건부 노출 */}
                  {(item.hobbies || item.notes) && (
                    <>
                      <View style={styles.cardDivider} />
                      {item.hobbies && (
                        <Text style={styles.subInfoText} numberOfLines={1}>
                          🎨 <Text style={{ fontWeight: "700" }}>취미:</Text>{" "}
                          {item.hobbies}
                        </Text>
                      )}
                      {item.notes && (
                        <Text
                          style={[styles.subInfoText, { marginTop: 4 }]}
                          numberOfLines={2}
                        >
                          ⭐️{" "}
                          <Text style={{ fontWeight: "700" }}>특이사항:</Text>{" "}
                          {item.notes}
                        </Text>
                      )}
                    </>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <User size={40} color="#E5E5EA" />
              <Text style={styles.emptyText}>아직 등록된 지인이 없어요.</Text>
              <Text style={[styles.emptyText, { marginTop: -12 }]}>
                {"\n"}우측 상단 [+] 버튼을 눌러 지인을 추가해 보세요!
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* 지인 등록 및 수정 통합 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isFormModalVisible}
        onRequestClose={closeFormModal}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>
                  {editingRecipient ? "지인 정보 변경하기 " : "지인 등록하기 "}
                </Text>
                <TouchableOpacity onPress={closeFormModal}>
                  <X size={20} color="#AEAEB2" />
                </TouchableOpacity>
              </View>

              {/* 필드 1: 이름 */}
              <Text style={styles.inputLabel}>이름</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="지인의 이름을 적어주세요"
                  placeholderTextColor="#AEAEB2"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* 필드 2: 성별 */}
              <Text style={styles.inputLabel}>성별</Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[
                    styles.choiceBadge,
                    gender === "M" && styles.choiceBadgeSelected,
                  ]}
                  onPress={() => setGender("M")}
                >
                  <Text
                    style={[
                      styles.choiceBadgeText,
                      gender === "M" && { color: "white" },
                    ]}
                  >
                    👦🏻 남성
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.choiceBadge,
                    gender === "F" && styles.choiceBadgeSelected,
                  ]}
                  onPress={() => setGender("F")}
                >
                  <Text
                    style={[
                      styles.choiceBadgeText,
                      gender === "F" && { color: "white" },
                    ]}
                  >
                    👧🏻 여성
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 필드 3: 나이대 (한눈에 보이는 Grid 3x3 구조) */}
              <Text style={styles.inputLabel}>나이대</Text>
              <View style={styles.gridContainer}>
                {ageGroups.map((age) => (
                  <TouchableOpacity
                    key={age}
                    style={[
                      styles.gridBadge,
                      ageGroup === age && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setAgeGroup(age)}
                  >
                    <Text
                      style={[
                        styles.gridBadgeText,
                        ageGroup === age && { color: "white" },
                      ]}
                    >
                      {age}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 필드 4: MBTI 선택 UI (4지선다 조합형) */}
              <Text style={[styles.inputLabel, { marginTop: 8 }]}>
                MBTI (선택)
              </Text>
              <View style={styles.mbtiContainer}>
                {/* E vs I */}
                <View style={styles.mbtiColumn}>
                  <TouchableOpacity
                    style={[
                      styles.mbtiCell,
                      mbtiEI === "E" && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setMbtiEI(mbtiEI === "E" ? null : "E")}
                  >
                    <Text
                      style={[
                        styles.mbtiCellText,
                        mbtiEI === "E" && { color: "white" },
                      ]}
                    >
                      E
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.mbtiCell,
                      mbtiEI === "I" && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setMbtiEI(mbtiEI === "I" ? null : "I")}
                  >
                    <Text
                      style={[
                        styles.mbtiCellText,
                        mbtiEI === "I" && { color: "white" },
                      ]}
                    >
                      I
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* S vs N */}
                <View style={styles.mbtiColumn}>
                  <TouchableOpacity
                    style={[
                      styles.mbtiCell,
                      mbtiSN === "S" && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setMbtiSN(mbtiSN === "S" ? null : "S")}
                  >
                    <Text
                      style={[
                        styles.mbtiCellText,
                        mbtiSN === "S" && { color: "white" },
                      ]}
                    >
                      S
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.mbtiCell,
                      mbtiSN === "N" && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setMbtiSN(mbtiSN === "N" ? null : "N")}
                  >
                    <Text
                      style={[
                        styles.mbtiCellText,
                        mbtiSN === "N" && { color: "white" },
                      ]}
                    >
                      N
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* T vs F */}
                <View style={styles.mbtiColumn}>
                  <TouchableOpacity
                    style={[
                      styles.mbtiCell,
                      mbtiTF === "T" && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setMbtiTF(mbtiTF === "T" ? null : "T")}
                  >
                    <Text
                      style={[
                        styles.mbtiCellText,
                        mbtiTF === "T" && { color: "white" },
                      ]}
                    >
                      T
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.mbtiCell,
                      mbtiTF === "F" && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setMbtiTF(mbtiTF === "F" ? null : "F")}
                  >
                    <Text
                      style={[
                        styles.mbtiCellText,
                        mbtiTF === "F" && { color: "white" },
                      ]}
                    >
                      F
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* J vs P */}
                <View style={styles.mbtiColumn}>
                  <TouchableOpacity
                    style={[
                      styles.mbtiCell,
                      mbtiJP === "J" && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setMbtiJP(mbtiJP === "J" ? null : "J")}
                  >
                    <Text
                      style={[
                        styles.mbtiCellText,
                        mbtiJP === "J" && { color: "white" },
                      ]}
                    >
                      J
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.mbtiCell,
                      mbtiJP === "P" && styles.choiceBadgeSelected,
                    ]}
                    onPress={() => setMbtiJP(mbtiJP === "P" ? null : "P")}
                  >
                    <Text
                      style={[
                        styles.mbtiCellText,
                        mbtiJP === "P" && { color: "white" },
                      ]}
                    >
                      P
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 필드 5: 취미 */}
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                취미 (선택)
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="예) 독서, 축구, 요리 등"
                  placeholderTextColor="#AEAEB2"
                  value={hobbies}
                  onChangeText={setHobbies}
                />
              </View>

              {/* 필드 6: 특이사항 */}
              <Text style={styles.inputLabel}>특이사항 (선택)</Text>
              <View
                style={[
                  styles.inputWrapper,
                  { height: 80, alignItems: "flex-start", paddingTop: 12 },
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder="핑크색을 좋아함, 파란색을 싫어함 등"
                  placeholderTextColor="#AEAEB2"
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              {/* 최종 제출 버튼 */}
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSave}
              >
                <Text style={styles.modalSubmitButtonText}>
                  {editingRecipient ? "변경사항 저장하기" : "지인 추가하기"}
                </Text>
                <UserPlus size={16} color="white" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
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
  addButton: {
    padding: 8,
    backgroundColor: "#FF7096",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
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
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#AEAEB2",
    textAlign: "center",
    lineHeight: 18,
  },

  /* 지인 카드 레이아웃 */
  networkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#F6F6FA",
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center" },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#FFF0F3",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE3EB",
  },
  mainInfoSide: { flex: 1, marginLeft: 14 },
  recipientName: { fontSize: 16, fontWeight: "800", color: "#2D2D3A" },
  recipientMeta: {
    fontSize: 12,
    color: "#AEAEB2",
    fontWeight: "600",
    marginTop: 2,
  },
  actionButtonGroup: { flexDirection: "row", alignItems: "center" },
  iconMiniButton: {
    padding: 8,
    backgroundColor: "#FFFBFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F6F6FA",
  },
  cardDivider: { height: 1, backgroundColor: "#F6F6FA", marginVertical: 12 },
  subInfoText: {
    fontSize: 12,
    color: "#757580",
    fontWeight: "500",
    lineHeight: 16,
  },

  /* 모달 레이아웃 */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(45, 45, 58, 0.4)",
    justifyContent: "center",
  },
  modalScrollContainer: { paddingVertical: 40, paddingHorizontal: 20 },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "100%",
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
    paddingLeft: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBFB",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F6F6FA",
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  textInput: { flex: 1, fontSize: 13, fontWeight: "600", color: "#2D2D3A" },

  choiceRow: { flexDirection: "row", marginBottom: 16 },
  choiceBadge: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0F3",
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#FFE3EB",
  },
  choiceBadgeSelected: { backgroundColor: "#FF7096", borderColor: "#FF7096" },
  choiceBadgeText: { fontSize: 13, fontWeight: "700", color: "#FF7096" },

  /* 🆕 나이대 Grid 레이아웃 (3열 배치) */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  gridBadge: {
    width: "31%", // 3열 배치 목적
    backgroundColor: "#FFF0F3",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFE3EB",
  },
  gridBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF7096",
  },

  /* 🆕 MBTI 조합 선택 UI 레이아웃 */
  mbtiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFBFB",
    padding: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F6F6FA",
  },
  mbtiColumn: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  mbtiCell: {
    width: "100%",
    height: 38,
    backgroundColor: "#FFF0F3",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#FFE3EB",
  },
  mbtiCellText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF7096",
  },

  modalSubmitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF7096",
    height: 52,
    borderRadius: 20,
    marginTop: 10,
  },
  modalSubmitButtonText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
});
