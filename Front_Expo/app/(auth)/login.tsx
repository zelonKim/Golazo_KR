import { client } from "@/api/client"; // 💡 아까 만드신 axios 인스턴스 경로와 맞춰주세요!
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface LoginData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🚀 장고 LoginView API 연동을 위한 useMutation 세팅
  const loginMutation = useMutation({
    mutationFn: async (loginData: LoginData) => {
      const response = await client.post("user/login/", loginData);
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        const accessToken = data.tokens?.access || data.tokens;

        if (accessToken) {
          await SecureStore.setItemAsync("userToken", accessToken);
          router.replace("/(tabs)");
        } else {
          throw new Error("발급된 인증 토큰이 존재하지 않습니다.");
        }
      } catch (error) {
        console.error("로그인 토큰 저장 중 에러:", error);
        Alert.alert(
          "인증 오류",
          "토큰 처리에 실패했습니다. 다시 시도해 주세요.",
        );
      }
    },
    onError: (error: any) => {
      console.error("로그인 실패 원인:", error.response?.data);
      const serverError = error.response?.data?.error;
      const errorMsg =
        serverError || "이메일 혹은 비밀번호를 다시 확인해 주세요.";
      Alert.alert("로그인 실패", errorMsg);
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    loginMutation.mutate({
      email,
      password,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FFFBFB" }]}>
      <View style={styles.content}>
        {/* 🪄 1. 상단 인트로 타이틀 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.subTitle}>좋아할만한 선물 좀 골라줘</Text>
          <Text style={styles.mainTitle}>Golazo AI</Text>
        </View>

        {/* 폼 영역 */}
        <View style={styles.formContainer}>
          {/* ✉ 이메일 입력창 */}
          <View style={styles.inputWrapper}>
            <Mail size={18} color="#FF7096" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="이메일 주소를 입력해주세요"
              placeholderTextColor="#AEAEB2"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* 🔒 비밀번호 입력창 */}
          <View style={styles.inputWrapper}>
            <Lock size={18} color="#FF7096" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor="#AEAEB2"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {/* 🚀 3. 로그인 하기 매직 버튼 */}
        <TouchableOpacity
          style={[
            styles.cuteButton,
            loginMutation.isPending && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.cuteButtonText}>로그인하기</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.signupLink}>
          <Text style={styles.signupLinkText}>아직 계정이 없으신가요?</Text>
          <TouchableOpacity onPress={() => router.push("./signup")}>
            <Text style={styles.signupLinkTextBold}> 가입하기 </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  welcomeSection: {
    marginBottom: 36,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  subTitle: {
    fontSize: 14,
    color: "#FF7096",
    fontWeight: "700",
    marginBottom: 6,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FF7096",
    letterSpacing: -0.5,
  },
  formContainer: {
    marginBottom: 28,
  },
  /* 둥글둥글하고 예쁜 파스텔 입력창 인풋 */
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F6F6FA",
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#2D2D3A",
  },
  /* 로그인 제출 버튼 */
  cuteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF7096",
    height: 58,
    borderRadius: 24,
    shadowColor: "#FFCCD8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#FFAEC4",
  },
  cuteButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  signupLink: {
    marginTop: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  signupLinkText: {
    fontSize: 13,
    color: "#AEAEB2",
    fontWeight: "600",
  },
  signupLinkTextBold: {
    fontSize: 13,
    color: "#fb89a7",
    fontWeight: Platform.OS === "ios" ? "900" : "700",
  },
});
