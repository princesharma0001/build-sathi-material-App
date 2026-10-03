import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import {
  verifyForgotPasswordOtpApi,
} from '../../api/auth.api';

const VerifyForgotPasswordOtpScreen = ({
  navigation,
  route,
}: any) => {
  const email = route?.params?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter the 6-digit OTP.',
      });
      return;
    }

    try {
      setLoading(true);

      await verifyForgotPasswordOtpApi(
        email,
        otp,
      );

      Toast.show({
        type: 'success',
        text1: 'OTP Verified',
        text2: 'You can now reset your password.',
      });

      navigation.replace(
        'ResetPassword',
        {
          email,
          otp,
        },
      );
    } catch (error: any) {
      console.log(
        'VERIFY FORGOT OTP ERROR:',
        error,
      );

      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2:
          error?.response?.data?.message ||
          'Invalid or expired OTP.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>
        <View style={styles.container}>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0A0A0A"
            />
          </TouchableOpacity>

          <View style={styles.iconWrapper}>
            <LinearGradient
              colors={[
                '#FF7A00',
                '#FF9F1C',
                '#FFD76A',
              ]}
              style={styles.iconContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={38}
                color="#FFFFFF"
              />
            </LinearGradient>
          </View>

          <Text style={styles.title}>
            Verify OTP
          </Text>

          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to
          </Text>

          <Text style={styles.email}>
            {email}
          </Text>

          <View style={styles.otpWrapper}>
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={value =>
                setOtp(
                  value
                    .replace(/\D/g, '')
                    .slice(0, 6),
                )
              }
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor="#C7B9A9"
              style={styles.otpInput}
              editable={!loading}
              autoFocus
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleVerify}
            disabled={loading}>

            <LinearGradient
              colors={[
                '#FF7A00',
                '#FF9F1C',
              ]}
              style={styles.button}>

              {loading ? (
                <ActivityIndicator
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
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeEmail}
            onPress={() =>
              navigation.goBack()
            }>
            <Text style={styles.changeEmailText}>
              Change email address
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyForgotPasswordOtpScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8EE',
  },

  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  iconWrapper: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 24,
  },

  iconContainer: {
    width: 82,
    height: 82,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0A0A0A',
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
    color: '#8C8175',
    fontSize: 15,
    marginTop: 12,
  },

  email: {
    textAlign: 'center',
    color: '#F97316',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 5,
    marginBottom: 35,
  },

  otpWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E2D0',
    borderRadius: 17,
    height: 65,
    justifyContent: 'center',
  },

  otpInput: {
    fontSize: 27,
    fontWeight: '900',
    color: '#0A0A0A',
    textAlign: 'center',
    letterSpacing: 9,
  },

  button: {
    height: 56,
    borderRadius: 17,
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  changeEmail: {
    alignItems: 'center',
    marginTop: 24,
  },

  changeEmailText: {
    color: '#F97316',
    fontWeight: '800',
  },
});