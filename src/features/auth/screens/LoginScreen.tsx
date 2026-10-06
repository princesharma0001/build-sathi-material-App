import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import messaging from "@react-native-firebase/messaging";

import AuthHeader from "../components/AuthHeader";
import AuthInput from "../components/AuthInput";
import { AuthStackParamList } from "../../../navigation/types";

import { loginApi } from "../auth.api";
import { saveAuthSession } from "../auth.store";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { registerFCMToken } from "./notification.api";
import { getFCMToken } from "../../../services/notificationService";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const [loading, setLoading] = useState(false);

  // const handleLogin = async () => {
  //   const trimmedEmail = email.trim();
  //   const trimmedPassword = password.trim();

  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  //   let isValid = true;

  //   setApiError("");

  //   // Email validation
  //   if (!trimmedEmail) {
  //     setEmailError("Please enter your email address");
  //     isValid = false;
  //   } else if (!emailRegex.test(trimmedEmail)) {
  //     setEmailError("Please enter a valid email address");
  //     isValid = false;
  //   } else {
  //     setEmailError("");
  //   }

  //   // Password validation
  //   if (!trimmedPassword) {
  //     setPasswordError("Please enter your password");
  //     isValid = false;
  //   } else if (trimmedPassword.length < 8) {
  //     setPasswordError("Password must be at least 8 characters");
  //     isValid = false;
  //   } else {
  //     setPasswordError("");
  //   }

  //   if (!isValid) {
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const response = await loginApi(trimmedEmail, trimmedPassword);

  //     const { user, token } = response.data;

  //     console.log("dfsdfs",user,token);
      

  //     // Save JWT + user in AsyncStorage
  //     await saveAuthSession(token, user);

  //     Toast.show({
  //       type: "success",
  //       text1: "Welcome back 👋",
  //       text2: "Login successful",
  //       position: "top",
  //       visibilityTime: 1800,
  //       topOffset: 60,
  //     });

  //     // Role based navigation
  //     if (user.role === "BUYER") {
  //       navigation.replace("Buyer");
  //       return;
  //     }

  //     if (user.role === "SELLER") {
  //       navigation.replace("Seller");
  //       return;
  //     }

  //     if (user.role === "CONTRACTOR") {
  //       setApiError("Contractor account is not available yet.");
  //       return;
  //     }

  //     if (user.role === "ADMIN") {
  //       setApiError("Admin login is not available in the mobile app.");
  //       return;
  //     }

  //     setApiError("Invalid user role.");
  //   } catch (error: any) {
  //     console.log("❌ Login error:", error);
  //     Toast.show({
  //       type: "error",
  //       text1: "Login Failed",
  //       text2: error?.message || "Invalid email or password",
  //       position: "top",
  //       visibilityTime: 3000,
  //       topOffset: 60,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isValid = true;

    setApiError("");

    // =========================
    // EMAIL VALIDATION
    // =========================
    if (!trimmedEmail) {
      setEmailError("Please enter your email address");
      isValid = false;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================
    if (!trimmedPassword) {
      setPasswordError("Please enter your password");
      isValid = false;
    } else if (trimmedPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) {
      return;
    }

    try {
      setLoading(true);

      // =========================
      // LOGIN API
      // =========================
      const response = await loginApi(
        trimmedEmail,
        trimmedPassword,
      );

      const { user, token } = response.data;

      console.log("✅ LOGIN USER:", user);
      console.log("🔐 LOGIN TOKEN RECEIVED");

      // =========================
      // SAVE AUTH SESSION
      // =========================
      await saveAuthSession(token, user);

      // =========================
      // FCM TOKEN REGISTRATION
      // =========================
      try {
        console.log("🔥 Getting FCM token...");
              const fcmToken = await getFCMToken();
        

        // const fcmToken = await messaging().getToken();

        console.log("🔥 FCM TOKEN:", fcmToken);

        if (fcmToken) {
          await registerFCMToken(fcmToken, token);

          console.log(
            "✅ FCM token successfully registered with backend",
          );
        } else {
          console.log("⚠️ FCM token not available");
        }
      } catch (fcmError) {
        // FCM failure should NOT stop login
        console.error(
          "❌ FCM registration error:",
          fcmError,
        );
      }

      // =========================
      // LOGIN SUCCESS TOAST
      // =========================
      Toast.show({
        type: "success",
        text1: "Welcome back 👋",
        text2: "Login successful",
        position: "top",
        visibilityTime: 1800,
        topOffset: 60,
      });

      // =========================
      // ROLE BASED NAVIGATION
      // =========================
      if (user.role === "BUYER") {
        navigation.replace("Buyer");
        return;
      }

      if (user.role === "SELLER") {
        navigation.replace("Seller");
        return;
      }

      if (user.role === "CONTRACTOR") {
        setApiError(
          "Contractor account is not available yet.",
        );
        return;
      }

      if (user.role === "ADMIN") {
        setApiError(
          "Admin login is not available in the mobile app.",
        );
        return;
      }

      setApiError("Invalid user role.");
    } catch (error: any) {
      console.log("❌ Login error:", error);

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          error?.message ||
          "Invalid email or password",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFF8EE", "#FFF1D6", "#FFE4BF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.container}>
              <AuthHeader />

              <View style={styles.content}>
                <Text style={styles.heading}>Welcome Back 👋</Text>

                <Text style={styles.description}>
                  Login to continue with NeevSathi
                </Text>

                {/* Email */}
                <AuthInput
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError("");
                    setApiError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={emailError}
                />

                {/* Password */}
                <AuthInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                    setApiError("");
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={passwordError}
                />

                {/* API Error */}
                {!!apiError && (
                  <View style={styles.apiErrorBox}>
                    <Text style={styles.apiErrorText}>{apiError}</Text>
                  </View>
                )}
                <View style={styles.registerRow1}>
                  <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
                    <Text style={styles.registerLink}>Forgot Password</Text>
                  </Pressable>
                </View>

                {/* Login */}
                <Pressable
                  style={[styles.button, loading && styles.disabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )}
                </Pressable>

                {/* Register */}
                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>
                    Don't have an account?{" "}
                  </Text>

                  <Pressable onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.registerLink}>Register</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  content: {
    marginTop: 20,
    paddingBottom: 30,
  },

  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0A0A0A",
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    color: "#8C8175",
    marginBottom: 28,
  },

  apiErrorBox: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFD1D1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 4,
    marginBottom: 12,
  },

  apiErrorText: {
    color: "#D32F2F",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  button: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#FF7A00",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,

    marginTop: 8,
  },

  disabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerRow1: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingBottom:20
    // marginTop: 10,
  },

  registerText: {
    color: "#8C8175",
    fontSize: 14,
  },

  registerLink: {
    color: "#FF7A00",
    fontWeight: "800",
    fontSize: 14,
  },
});
