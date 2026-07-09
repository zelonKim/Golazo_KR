import { client } from "@/api/client";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Lock, Mail } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
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

interface LoginData {
  email: string;
  password: string;
}

interface SocialLoginData {
  provider: "google" | "apple";
  token: string; // 구글은 idToken, 애플은 identityToken
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1. 구글 SDK 초기화 (앱 실행 시 최초 1회 동작)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "98991306295-v4vpr6ecbiu0k29umjm70h01g1d9jis0.apps.googleusercontent.com",
      iosClientId:
        "98991306295-lovlqprpttnq8j8cnnmubtqjmgtofr1o.apps.googleusercontent.com",
      offlineAccess: true,
    });
  }, []);

  const handleLoginSuccess = async (data: any) => {
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
      Alert.alert("인증 오류", "토큰 처리에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  //  일반 로그인
  const loginMutation = useMutation({
    mutationFn: async (loginData: LoginData) => {
      const response = await client.post("user/login/", loginData);
      return response.data;
    },
    onSuccess: handleLoginSuccess,
    onError: (error: any) => {
      console.error("로그인 실패 원인:", error.response?.data);
      const serverError = error.response?.data?.error;
      const errorMsg =
        serverError || "이메일 혹은 비밀번호를 다시 확인해 주세요.";
      Alert.alert("로그인 실패", errorMsg);
    },
  });

  // 소셜 로그인 (구글, 애플 공용)
  const socialLoginMutation = useMutation({
    mutationFn: async (socialData: SocialLoginData) => {
      const response = await client.post(`user/${socialData.provider}/login/`, {
        token: socialData.token,
      });
      return response.data;
    },
    onSuccess: handleLoginSuccess,
    onError: (error: any) => {
      console.error("소셜 로그인 실패 원인:", error.response?.data);
      Alert.alert("로그인 실패", "소셜 로그인 인증에 실패했습니다.");
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  // 🌐 구글 로그인 연동
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // 최신 라이브러리 버전에 따라 데이터 구조가 userInfo.data.idToken 일 수 있습니다.
      const idToken = userInfo.idToken || userInfo.data?.idToken;

      if (idToken) {
        // 백엔드로 전달
        socialLoginMutation.mutate({
          provider: "google",
          token: idToken,
        });
      } else {
        Alert.alert("오류", "구글 인증 토큰을 가져오지 못했습니다.");
      }
    } catch (error: any) {
      console.error("구글 로그인 에러:", error);
      // 사용자가 취소한 게 아니라면 에러 알림
      if (error.code !== "ASYNC_OP_IN_PROGRESS") {
        Alert.alert("구글 로그인 실패", "로그인 도중 오류가 발생했습니다.");
      }
    }
  };

  // 🍏 애플 로그인 연동
  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        // 백엔드로 전달
        socialLoginMutation.mutate({
          provider: "apple",
          token: credential.identityToken,
        });
      } else {
        Alert.alert("오류", "애플 인증 토큰을 가져오지 못했습니다.");
      }
    } catch (error: any) {
      console.error("애플 로그인 에러:", error);
      if (error.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("애플 로그인 실패", "로그인 도중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#FFFBFB" }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 10 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
            {/* 🪄 1. 상단 인트로 타이틀 */}
            <View style={styles.welcomeSection}>
              <Text style={styles.subTitle}>좋아할만한 선물 좀 골라줘</Text>
              <Text style={styles.mainTitle}>Golazo AI</Text>
            </View>

            {/* 폼 영역 */}
            <View style={styles.formContainer}>
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
                (loginMutation.isPending || socialLoginMutation.isPending) &&
                  styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={
                loginMutation.isPending || socialLoginMutation.isPending
              }
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.cuteButtonText}>로그인하기</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupLink}>
              <Text style={styles.signupLinkText}>아직 계정이 없으신가요?</Text>
              <TouchableOpacity onPress={() => router.push("./signup")}>
                <Text style={styles.signupLinkTextBold}> 가입하기 </Text>
              </TouchableOpacity>
            </View>

            {/* 🌟 소셜 로그인 버튼 영역 */}
            <View style={styles.socialSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>간편 로그인</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* 통신 중일 때는 인디케이터 표시, 아닐 때는 버튼 노출 */}
              {socialLoginMutation.isPending ? (
                <ActivityIndicator color="#FF7096" size="large" />
              ) : (
                <View style={styles.socialButtonRow}>
                  {/* 구글 로그인 버튼 */}
                  <TouchableOpacity onPress={handleGoogleLogin}>
                    <Image
                      source={require("@/assets/images/google_login.png")}
                      style={styles.googleIcon}
                    />
                  </TouchableOpacity>

                  {/* 애플 로그인 버튼  */}
                  <TouchableOpacity
                    onPress={
                      Platform.OS === "ios"
                        ? handleAppleLogin
                        : () =>
                            Alert.alert(
                              "안내",
                              "애플 로그인은 iOS 기기에서만 가능합니다.",
                            )
                    }
                  >
                    <Image
                      source={require("@/assets/images/apple_login.png")}
                      style={styles.appleIcon}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... 스타일시트 코드는 질문자님의 기존 코드와 동일하므로 생략합니다.
const styles = StyleSheet.create({
  // (기존 스타일 코드와 동일)
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
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
  formContainer: { marginBottom: 28 },
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
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 15, fontWeight: "600", color: "#2D2D3A" },
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
  disabledButton: { backgroundColor: "#FFAEC4" },
  cuteButtonText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  socialSection: { marginTop: 32, marginBottom: 16, alignItems: "center" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#F2F2F7" },
  dividerText: {
    fontSize: 12,
    color: "#AEAEB2",
    paddingHorizontal: 12,
    fontWeight: "600",
  },
  socialButtonRow: { flexDirection: "row", justifyContent: "center", gap: 20 },
  googleIcon: { width: 48, height: 48 },
  appleIcon: { width: 48, height: 48 },
  signupLink: {
    marginTop: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  signupLinkText: { fontSize: 13, color: "#AEAEB2", fontWeight: "600" },
  signupLinkTextBold: {
    fontSize: 13,
    color: "#fb89a7",
    fontWeight: Platform.OS === "ios" ? "900" : "700",
  },
});
