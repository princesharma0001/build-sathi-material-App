import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { forgotPasswordApi } from '../auth.api';

const ForgotPasswordScreen = ({
  navigation,
}: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2:
          'Please enter your registered email.',
      });
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2:
          'Please enter a valid email address.',
      });
      return;
    }

    try {
      setLoading(true);

      await forgotPasswordApi(cleanEmail);

      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2:
          'Please check your email for the OTP.',
      });

      navigation.navigate(
        'VerifyForgotPasswordOtp',
        {
          email: cleanEmail,
        },
      );
    } catch (error: any) {
      console.log(
        'FORGOT PASSWORD ERROR:',
        error,
      );

      Toast.show({
        type: 'error',
        text1: 'Unable to Send OTP',
        text2:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong.',
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
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

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
                name="lock-open-outline"
                size={38}
                color="#FFFFFF"
              />
            </LinearGradient>
          </View>

          <Text style={styles.title}>
            Forgot Password?
          </Text>

          <Text style={styles.subtitle}>
            Enter your registered email address
            and we'll send you a verification OTP.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email Address
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#8C8175"
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#A79B8D"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={styles.input}
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSendOtp}
            disabled={loading}>
            <LinearGradient
              colors={[
                '#FF7A00',
                '#FF9F1C',
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.button}>

              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    Send OTP
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
            style={styles.loginButton}
            onPress={() =>
              navigation.navigate('Login')
            }>
            <Ionicons
              name="arrow-back-outline"
              size={17}
              color="#F97316"
            />

            <Text style={styles.loginText}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8EE',
  },

  flex: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 35,
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
    fontSize: 15,
    lineHeight: 23,
    color: '#8C8175',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 38,
    paddingHorizontal: 10,
  },

  inputGroup: {
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A0A0A',
    marginBottom: 9,
  },

  inputWrapper: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1E2D0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    marginLeft: 11,
    fontSize: 16,
    color: '#0A0A0A',
  },

  button: {
    height: 56,
    borderRadius: 17,
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

  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 25,
    padding: 10,
  },

  loginText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '800',
  },
});