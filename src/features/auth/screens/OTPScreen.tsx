import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

import { AuthStackParamList } from "../../../navigation/types";
import { resendOtpApi, verifyOtpApi } from "../auth.api";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<AuthStackParamList, "OTP">;

const OTPScreen = ({ route, navigation }: Props) => {
  const { email } = route.params;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const handleVerify = async () => {
    const trimmedOtp = otp.trim();

    // =========================
    // OTP VALIDATION
    // =========================

    if (!trimmedOtp) {
      Toast.show({
        type: "error",
        text1: "OTP Required",
        text2: "Please enter the verification code.",
        position: "top",
      });
      return;
    }

    if (trimmedOtp.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter the 6-digit verification code.",
        position: "top",
      });
      return;
    }

    // =========================
    // VERIFY OTP API
    // =========================

    try {
      setLoading(true);

      Keyboard.dismiss();

      const response = await verifyOtpApi(email, trimmedOtp);

      if (!response.success) {
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: response.message || "Invalid verification code.",
          position: "top",
        });

        return;
      }

      // =========================
      // OTP VERIFIED
      // =========================

      Toast.show({
        type: "success",
        text1: "OTP Verified ✓",
        text2: "Your email has been verified successfully.",
        position: "top",
        visibilityTime: 1800,
      });

      // Give toast a moment to appear
      setTimeout(() => {
        navigation.navigate("SelectRole", {
          email,
        });
      }, 500);
    } catch (error: any) {
      console.log("OTP VERIFY ERROR:", error);

      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error?.message || "Unable to verify OTP. Please try again.",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Email missing",
        text2: "Please go back and enter your email.",
      });
      return;
    }

    try {
      setResending(true);

      const response = await resendOtpApi(email);

      console.log("RESEND OTP RESPONSE:", JSON.stringify(response, null, 2));

      Toast.show({
        type: "success",
        text1: "OTP Sent",
        text2: "A new OTP has been sent to your email.",
      });

      // Restart your countdown here
      setResendTimer(60);
    } catch (error: any) {
      console.error("RESEND OTP ERROR:", error?.response?.data || error);

      Toast.show({
        type: "error",
        text1: "OTP not sent",
        text2:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to resend OTP.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFFDF9", "#FFF8EE", "#FFF1DF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
     <SafeAreaView style={styles.safeArea}>
  <KeyboardAvoidingView
    style={styles.keyboardAvoidingView}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
  >
    <View style={styles.container}>
      {/* Icon */}

      <View style={styles.iconWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="shield-checkmark-outline"
            size={34}
            color="#FF7A00"
          />
        </View>
      </View>

      {/* Heading */}

      <Text style={styles.heading}>Verify OTP</Text>

      <Text style={styles.description}>
        We sent a 6-digit verification code to
      </Text>

      <Text style={styles.email}>{email}</Text>

      {/* OTP Input */}

      <View style={styles.otpContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.otpBox,
              otp.length === index && styles.otpBoxActive,
              otp.length > index && styles.otpBoxFilled,
            ]}
          >
            <Text style={styles.otpText}>
              {otp[index] || ""}
            </Text>
          </View>
        ))}

        <TextInput
          value={otp}
          onChangeText={(text) => {
            const numericOtp = text
              .replace(/\D/g, "")
              .slice(0, 6);

            setOtp(numericOtp);
          }}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.hiddenInput}
          autoFocus
          editable={!loading}
        />
      </View>

      {/* Verify Button */}

      <Pressable
        style={[
          styles.button,
          loading && styles.buttonDisabled,
        ]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <>
            <Text style={styles.buttonText}>
              Verify OTP
            </Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          </>
        )}
      </Pressable>

      {/* Resend */}

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Didn't receive the code?{" "}
        </Text>

        <Pressable
          onPress={handleResendOtp}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator
              size="small"
              color="#FF7A00"
            />
          ) : (
            <Text style={styles.resendLink}>
              Resend OTP
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  </KeyboardAvoidingView>
</SafeAreaView>
    </LinearGradient>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  iconWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    borderWidth: 1,
    borderColor: "#FFD3A3",

    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0A0A0A",
    textAlign: "center",
    marginBottom: 8,
  },

  keyboardAvoidingView: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#8C8175",
    textAlign: "center",
  },

  email: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0A0A0A",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 30,
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 28,
    position: "relative",
  },

  otpBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E6D8C8",
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  otpBoxActive: {
    borderColor: "#FF7A00",
    borderWidth: 2,
    backgroundColor: "#FFF8EE",
  },

  otpBoxFilled: {
    borderColor: "#FFB15C",
    backgroundColor: "#FFF3E5",
  },

  otpText: {
    fontSize: 23,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
  },

  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,

    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  resendText: {
    color: "#8C8175",
    fontSize: 13,
  },

  resendLink: {
    color: "#FF7A00",
    fontSize: 13,
    fontWeight: "800",
  },
});
