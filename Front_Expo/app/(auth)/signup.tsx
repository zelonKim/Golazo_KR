import { client } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Platform,
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

interface SignupData {
  email: string;
  password: string;
  password_confirm: string;
}

export default function SignUpScreen() {
  const router = useRouter();

  // 📝 입력 필드 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 🚀 장고 SignUpView API 연동을 위한 useMutation 세팅
  const signupMutation = useMutation({
    mutationFn: async (signupData: SignupData) => {
      // 장고 서버의 SignUpView(post) API로 요청을 날립니다.
      const response = await client.post("user/signup/", signupData);
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        const accessToken = data.tokens?.access || data.tokens;

        if (accessToken) {
          await SecureStore.setItemAsync("userToken", accessToken);

          Alert.alert(`회원가입이 완료되었습니다. 환영합니다! 🎉`);

          router.replace("/(tabs)");
        } else {
          throw new Error("서버로부터 발급된 토큰이 없습니다.");
        }
      } catch (error) {
        console.error("토큰 자동 로그인 처리 중 에러:", error);
        Alert.alert("알림", "회원가입은 되었으나 자동 로그인에 실패했습니다.");
        router.replace("./login");
      }
    },
    onError: (error: any) => {
      console.error("회원가입 실패 원인:", error.response?.data);

      const serverData = error.response?.data;
      let errorMsg = "입력 정보를 다시 확인해 주세요. 🥲";

      if (serverData) {
        if (
          serverData.non_field_errors &&
          Array.isArray(serverData.non_field_errors) &&
          serverData.non_field_errors.length > 0
        ) {
          errorMsg = serverData.non_field_errors[0];
        }

        // 2순위: 우리가 백엔드에서 에러 키를 직접 "error"로 커스텀해서 보낸 경우
        else if (serverData.error) {
          errorMsg = serverData.error;
        }

        // 3순위: {"email": ["..."]} 이나 {"password": ["..."]} 처럼 특정 필드에 에러 배열이 꽂힌 경우
        else if (typeof serverData === "object") {
          const errorKeys = Object.keys(serverData);
          if (errorKeys.length > 0) {
            const firstKey = errorKeys[0];
            const firstErrorArray = serverData[firstKey];

            if (Array.isArray(firstErrorArray) && firstErrorArray.length > 0) {
              errorMsg = firstErrorArray[0]; // 장고가 준 실제 한글 텍스트만 쏙!
            } else if (typeof firstErrorArray === "string") {
              errorMsg = firstErrorArray;
            }
          }
        }

        // 4순위: 예외적으로 텍스트 통문장으로 에러가 넘어온 경우
        else if (typeof serverData === "string") {
          errorMsg = serverData;
        }
      }

      Alert.alert("가입 실패 ", errorMsg);
    },
  });

  const handleSignUp = () => {
    if (!email || !password || !passwordConfirm) {
      Alert.alert("알림", "모든 항목을 입력해주세요!");
      return;
    }

    // 2. 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("안내", "올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    // 3. 비밀번호 규칙 검증
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "안내",
        "비밀번호는 영문과 숫자를 포함하여 8자리 이상이어야 해요!",
      );
      return;
    }

    // 4. 비밀번호 일치 검증
    if (password !== passwordConfirm) {
      Alert.alert("안내", "비밀번호와 비밀번호 확인이 서로 일치하지 않아요.");
      return;
    }

    signupMutation.mutate({
      email,
      password,
      password_confirm: passwordConfirm,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FFFBFB" }]}>
      <KeyboardAvoidingView
        // 🌟 [수정 2] iOS는 padding, 안드로이드는 네이티브 매커니즘(height 또는 생략) 분기 슛!
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({
          ios: 0, // 헤더나 탭바 높이에 맞춰 오프셋 보정
          android: 10,
        })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
            {/* 🪄 1. 상단 인트로 타이틀 */}
            <View style={styles.welcomeSection}>
              <Text style={styles.subTitle}>소중한 사람들을 위한 선물</Text>
              <Text style={styles.mainTitle}>여기서 골라줘 🎁</Text>
            </View>

            {/* 폼 영역 */}
            <View style={styles.formContainer}>
              {/* ✉ 이메일 입력창 */}
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#FF7096" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="이메일 주소"
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
                  placeholder="비밀번호 (영문 + 숫자 8자 이상)"
                  placeholderTextColor="#AEAEB2"
                  secureTextEntry
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* 🔒 비밀번호 확인 입력창 */}
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#FF7096" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="비밀번호 확인"
                  placeholderTextColor="#AEAEB2"
                  secureTextEntry
                  autoCapitalize="none"
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                />
              </View>
            </View>

            {/* 🚀 3. 회원가입 매직 버튼 */}
            <TouchableOpacity
              style={[
                styles.cuteButton,
                signupMutation.isPending && styles.disabledButton,
              ]}
              onPress={handleSignUp}
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.cuteButtonText}>시작하기</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.loginLink}>
              <Text style={styles.loginLinkText}>이미 계정이 있으신가요? </Text>
              <TouchableOpacity onPress={() => router.push("./login")}>
                <Text style={styles.loginLinkTextBold}> 로그인하기 </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  /* 회원가입 제출 버튼 */
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
  loginLink: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 13,
    color: "#AEAEB2",
    fontWeight: "600",
  },
  loginLinkTextBold: {
    fontSize: 13,
    color: "#fb89a7",
    fontWeight: Platform.OS === "ios" ? "900" : "700",
  },
});
