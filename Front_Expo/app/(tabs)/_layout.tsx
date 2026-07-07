import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { Gift, History, Home, Settings2, UserPlus } from "lucide-react-native";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const { colors } = useTheme();

  const tabBarHeight =
    Platform.OS === "ios"
      ? 54 + insets.bottom
      : 62 + (insets.bottom > 0 ? insets.bottom : 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#D1D1D6",
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true, // ⭕ 글자 켜기

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F2F2F7",
          height: tabBarHeight,
          // 📐 글자가 들어왔으므로, 아이콘과 글자가 겹치지 않게 하단 패딩을 성진님 수식 기준으로 정밀 조정
          paddingBottom:
            Platform.OS === "ios"
              ? insets.bottom
              : insets.bottom > 0
                ? insets.bottom + 6
                : 12,
          paddingTop: 8, // 상단 여백을 살짝 늘려 아이콘 위치 안정화
          elevation: 4,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.03,
          shadowRadius: 4,
        },

        // ✍️ 한글 글자를 세련되게 다듬는 스타일 추가
        tabBarLabelStyle: {
          fontSize: Platform.OS === "ios" ? 12 : 9, // 글자 크기 조정
          fontWeight: Platform.OS === "ios" ? "700" : "600", // 글자 두께 조정
          marginTop: Platform.OS === "ios" ? 4 : 1, // 아이콘과 글자 사이 간격 확보
          marginBottom: Platform.OS === "android" ? 4 : 0,
        },
      }}
    >
      {/* 1. 홈 탭 */}
      <Tabs.Screen
        name="index"
        options={{
          title: "홈", // ⭕ 하단에 뜰 한글 이름 지정!
          tabBarIcon: ({ focused, color }) => (
            <Home
              size={25}
              color={focused ? colors.primary : color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      {/* 4. 지인 관리 탭 */}
      <Tabs.Screen
        name="recipient"
        options={{
          title: "나의 지인", // ⭕ 한글 이름 지정!
          tabBarIcon: ({ focused, color }) => (
            <UserPlus
              size={25}
              color={focused ? colors.primary : color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      {/* 2. AI 선물 추천 탭 */}
      <Tabs.Screen
        name="recommend"
        options={{
          title: "AI 추천", // ⭕ 한글 이름 지정!
          tabBarIcon: ({ focused, color }) => (
            <Gift
              size={25}
              color={focused ? colors.primary : color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      {/* 3. 히스토리 탭 */}
      <Tabs.Screen
        name="history"
        options={{
          title: "히스토리", // ⭕ 한글 이름 지정!
          tabBarIcon: ({ focused, color }) => (
            <History
              size={25}
              color={focused ? colors.primary : color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      {/* 5. 마이페이지 탭 */}
      <Tabs.Screen
        name="mypage"
        options={{
          title: "환경 설정", // ⭕ 한글 이름 지정!
          tabBarIcon: ({ focused, color }) => (
            <Settings2
              size={25}
              color={focused ? colors.primary : color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="recommendResult"
        options={{
          title: "추천 결과",
          href: null,
        }}
      />
    </Tabs>
  );
}
