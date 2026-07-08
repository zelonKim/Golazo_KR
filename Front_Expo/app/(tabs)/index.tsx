import { client } from "@/api/client";
import { useTheme } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import {
  Bell,
  CalendarDays,
  Calendar as CalendarIcon,
  Plus,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔔 알림이 들어왔을 때 OS가 알림을 화면에 어떻게 띄울지 핸들러 기본 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 📅 달력 한글화 글로벌 세팅
LocaleConfig.locales["ko"] = {
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};
LocaleConfig.defaultLocale = "ko";

const { width } = Dimensions.get("window");

interface DateMemo {
  id: number;
  content: string;
  target_date: string;
  d_day: number | null;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const todayStr = new Date().toISOString().split("T")[0];

  // 📝 모달 창 상태 및 인풋 필드 상태 관리
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [memoContent, setMemoContent] = useState("");
  const [memoDate, setMemoDate] = useState("");

  // 🔍 1. useQuery: 장고 백엔드로부터 로그인한 유저의 기념일 리스트 가져오기
  const { data: anniversaries = [], isLoading } = useQuery<DateMemo[]>({
    queryKey: ["dateMemos"],
    queryFn: async () => {
      const response = await client.get("gift/date-memo/");
      return response.data;
    },
  });

  // 🚀 2. useMutation: 새로운 기념일 저장(POST)하기
  const addMemoMutation = useMutation({
    mutationFn: async (newMemo: { content: string; target_date: string }) => {
      const response = await client.post("gift/date-memo/", newMemo);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dateMemos"] });
      Alert.alert("저장 완료 🎁", "새로운 특별한 날이 메모함에 저장되었어요.");
      setMemoContent("");
      setMemoDate("");
      setIsModalVisible(false);
    },
    onError: (error: any) => {
      console.error("기념일 등록 실패:", error.response?.data);
      Alert.alert("등록 실패", "입력 형식을 다시 한번 확인해 주세요.");
    },
  });

  // 🚀 3. 🆕 useMutation: 스마트폰 기기 푸시 토큰 백엔드로 전송 (POST)
  const savePushTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      // 엔드포인트 주소는 장고 백엔드 API 설계명에 맞게 편하게 커스텀하세요!
      return await client.post("user/push-token/", { token });
    },
    onSuccess: () => {
      console.log("🎯 FCM 디바이스 푸시 토큰이 장고 서버에 동기화되었습니다.");
    },
    onError: (err: any) => {
      console.error(
        "⚠️ 푸시 토큰 서버 전송 실패:",
        err.response?.data || err.message,
      );
    },
  });

  // 💡 🆕 초동 로드 시 알림 권한 획득 및 토큰 추출 프로세스 기동
  useEffect(() => {
    async function setupNotifications() {
      // 에뮬레이터나 시뮬레이터 브라우저 기기 격리 처리
      if (!Device.isDevice) {
        console.log("➡️ 시뮬레이터 환경에서는 푸시 토큰 발급이 제한됩니다.");
        return;
      }

      // 1. 기존 권한 검사
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 2. 최초 진입 시 권한이 없다면 스마트폰 상단 팝업 띄우기
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // 3. 유저가 끝내 거부했을 때 방어 코드
      if (finalStatus !== "granted") {
        console.log("➡️ 사용자가 푸시 알림을 거부했습니다.");
        return;
      }

      // 4. 기기 고유의 Expo Push Token 발급 받기
      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        const tokenData = await Notifications.getDevicePushTokenAsync();

        console.log("📡 구글/애플 공인 순수 디바이스 토큰:", tokenData.data);
        savePushTokenMutation.mutate(tokenData.data);


        // 안드로이드 기기일 경우 진동/소리 채널 최적화 마감
        if (Platform.OS === "android") {
          Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF7096",
          });
        }
      } catch (error) {
        console.error("❌ 토큰 발급 프로세스 도중 에러 발생:", error);
      }
    }

    setupNotifications();
  }, []);

  // 💾 등록하기 버튼 누를 때 검증 핸들러
  const handleCreateMemo = () => {
    if (!memoContent || !memoDate) {
      Alert.alert("알림", "기념일과 날짜를 모두 입력해 주세요.");
      return;
    }
    addMemoMutation.mutate({
      content: memoContent,
      target_date: memoDate,
    });
  };

  // 👑 목록 중 d_day가 가장 가까운 메인 디데이 타겟 설정
  const mainDDay = anniversaries.length > 0 ? anniversaries[0] : null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: "#FFFBFB" }]}
      edges={["top"]}
    >
      {/* 1. 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Special Day</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={20} color="#5C5C62" />
        </TouchableOpacity>
      </View>

      {/* 로딩 인디케이터 처리 */}
      {isLoading ? (
        <View style={styles.centerFlex}>
          <ActivityIndicator size="large" color="#FF7096" />
          <Text style={styles.loadingText}>특별한 날을 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={
            mainDDay ? styles.scrollContent : styles.centerScrollContent
          }
          showsVerticalScrollIndicator={false}
        >
          {mainDDay ? (
            <>
              {/* 데이터가 있을 때: 상단 카드 + 다가오는 목록 노출 */}
              <View style={styles.cloudCard}>
                <View style={styles.bubbleTag}>
                  <Text style={styles.bubbleTagText}>
                    곧 다가오는 특별한 날 🎉
                  </Text>
                </View>

                <Text style={styles.mainCardTitle}>{mainDDay.content} </Text>
                <Text style={styles.mainCardDDay}>
                  <Text style={{ color: "#FF7096" }}>
                    {mainDDay.d_day === 0 ? "D-Day 🎉" : `D-${mainDDay.d_day}`}
                  </Text>
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/recommend")}
                  style={styles.cuteButton}
                >
                  <Text style={styles.cuteButtonText}>
                    AI 맞춤 선물 추천받기
                  </Text>
                  <Text> 🎁</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🗓️ 다가오는 특별한 날</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsModalVisible(true)}
                  >
                    <Plus size={21} color="white" strokeWidth={3} />
                  </TouchableOpacity>
                </View>

                {anniversaries.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.cuteListItem}>
                    <View style={styles.listItemLeft}>
                      <View style={styles.heartIconBg}>
                        <CalendarIcon size={16} color="#FF7096" />
                      </View>
                      <View>
                        <Text style={styles.listItemName}>{item.content}</Text>
                        <Text style={styles.listItemDate}>
                          {item.target_date}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cuteDDayBadge}>
                      <Text style={styles.cuteDDayText}>
                        {item.d_day === 0 ? "D-Day" : `D-${item.d_day}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            /* 데이터가 없을 때: 전용 가로폭 카드 배치 */
            <View
              style={[styles.cloudCard, { width: "100%", marginBottom: 0 }]}
            >
              <View style={styles.bubbleTag}>
                <Text style={styles.bubbleTagText}>No Day</Text>
              </View>
              <Text style={styles.mainCardDDay}>
                <Text style={{ color: "#FF7096" }}>
                  아직 메모한 날이 없어요.
                </Text>
              </Text>
              <Text
                style={[
                  styles.mainCardTitle,
                  { fontSize: 14, color: "#AEAEB2", marginTop: 4 },
                ]}
              >
                아래 버튼을 눌러 지인들의{"\n"}특별한 날을 메모해보세요!
              </Text>
              <TouchableOpacity
                style={styles.cuteButton}
                onPress={() => setIsVisible(true)}
              >
                <Text style={styles.cuteButtonText}>특별한 날 메모하기</Text>
                <Text> 🗓️</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* 4. 기념일 등록 메인 모달 팝업 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setMemoContent("");
          setMemoDate("");
          setIsModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>특별한 날 메모하기 </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setMemoContent("");
                  setMemoDate("");
                }}
              >
                <X size={20} color="#AEAEB2" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>어떤 날인가요?</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="예) 엄마 생일, 100일 기념일"
                placeholderTextColor="#AEAEB2"
                value={memoContent}
                onChangeText={setMemoContent}
              />
            </View>

            <Text style={styles.inputLabel}>그 날은 언제인가요?</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => setIsCalendarVisible(true)}
            >
              <Text
                style={[
                  styles.dateTextValue,
                  !memoDate && { color: "#AEAEB2" },
                ]}
              >
                {memoDate || (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <CalendarDays size={18} color={"#AEAEB2"} />
                    <Text
                      style={{
                        color: "#AEAEB2",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {"  "}날짜를 선택해 주세요
                    </Text>
                  </View>
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalSubmitButton,
                addMemoMutation.isPending && styles.disabledButton,
              ]}
              onPress={handleCreateMemo}
              disabled={addMemoMutation.isPending}
            >
              {addMemoMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.modalSubmitButtonText}>
                  메모함에 저장하기
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 📅 5. 중첩 달력 모달 */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isCalendarVisible}
          onRequestClose={() => setIsCalendarVisible(false)}
        >
          <View style={styles.calendarModalOverlay}>
            <View style={styles.calendarContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>날짜 선택하기 🗓️</Text>
                <TouchableOpacity onPress={() => setIsCalendarVisible(false)}>
                  <X size={20} color="#AEAEB2" />
                </TouchableOpacity>
              </View>

              <Calendar
                current={memoDate || undefined}
                minDate={todayStr}
                onDayPress={(day) => {
                  setMemoDate(day.dateString);
                  setIsCalendarVisible(false);
                }}
                markedDates={{
                  [memoDate]: {
                    selected: true,
                    disableTouchEvent: true,
                    selectedColor: "#FF7096",
                  },
                }}
                theme={{
                  backgroundColor: "#ffffff",
                  calendarBackground: "#ffffff",
                  textSectionTitleColor: "#757580",
                  selectedDayBackgroundColor: "#FF7096",
                  selectedDayTextColor: "#ffffff",
                  todayTextColor: "#FF7096",
                  dayTextColor: "#2D2D3A",
                  arrowColor: "#FF7096",
                  monthTextColor: "#2D2D3A",
                  textDayFontWeight: "600",
                  textMonthFontWeight: "800",
                  textDayHeaderFontWeight: "700",
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDisabledColor: "#E5E5EA",
                }}
              />
            </View>
          </View>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
}

// 스타일 시트는 완전 동일하므로 하단부 보존 상태로 생략합니다!
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
  scrollContent: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 40 },
  centerScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
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
  bubbleTagText: { fontSize: 12, fontWeight: "700", color: "#FF7096" },
  mainCardTitle: {
    fontSize: 24,
    fontWeight: Platform.OS === "ios" ? "900" : "700",
    color: "#2D2D3A",
    textAlign: "center",
    marginTop: Platform.OS === "ios" ? 11 : 8,
  },
  mainCardDDay: {
    fontSize: 18,
    fontWeight: "700",
    color: "#757580",
    marginTop: Platform.OS === "ios" ? 14 : 10,
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
  cuteButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  sectionContainer: { marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#2D2D3A" },
  addButton: {
    padding: 8,
    backgroundColor: "#FF7096",
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
  listItemLeft: { flexDirection: "row", alignItems: "center" },
  heartIconBg: {
    backgroundColor: "#FFF0F3",
    padding: 10,
    borderRadius: 50,
    marginRight: 14,
  },
  listItemName: { fontSize: 15, fontWeight: "700", color: "#2D2D3A" },
  listItemDate: { fontSize: 12, color: "#AEAEB2", marginTop: 3 },
  cuteDDayBadge: {
    backgroundColor: "#FFF0F3",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
  },
  cuteDDayText: { fontSize: 14, fontWeight: "800", color: "#FF7096" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(45, 45, 58, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 32,
    padding: 24,
    borderWidth: 2,
    borderColor: "#FFE3EB",
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
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
    paddingLeft: 4,
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
    marginBottom: 16,
  },
  textInput: { flex: 1, fontSize: 14, fontWeight: "600", color: "#2D2D3A" },
  dateTextValue: { fontSize: 14, fontWeight: "600", color: "#2D2D3A" },
  modalSubmitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF7096",
    height: 54,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  modalSubmitButtonText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  disabledButton: { backgroundColor: "#FFAEC4" },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(45, 45, 58, 0.2)",
    justifyContent: "flex-end",
  },
  calendarContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    borderWidth: 2,
    borderColor: "#FFE3EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
});
