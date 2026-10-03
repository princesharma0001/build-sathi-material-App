import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import AuthHeader from '../components/AuthHeader';
import AuthInput from '../components/AuthInput';
import {AuthStackParamList} from '../../../navigation/types';
import {registerApi} from '../auth.api';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({navigation}: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // =========================
    // NAME VALIDATION
    // =========================

    if (!trimmedName) {
      Toast.show({
        type: 'error',
        text1: 'Name Required',
        text2: 'Please enter your full name.',
      });
      return;
    }

    if (trimmedName.length < 2) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Name',
        text2: 'Please enter a valid name.',
      });
      return;
    }

    // =========================
    // EMAIL VALIDATION
    // =========================

    if (!trimmedEmail) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Please enter your email address.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================

    if (!password) {
      Toast.show({
        type: 'error',
        text1: 'Password Required',
        text2: 'Please create a password.',
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 8 characters.',
      });
      return;
    }

    // =========================
    // CONFIRM PASSWORD
    // =========================

    if (!confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Confirm Password',
        text2: 'Please confirm your password.',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match.',
      });
      return;
    }

    // =========================
    // API CALL
    // =========================

    try {
      setLoading(true);

      const response = await registerApi({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (!response.success) {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.message || 'Unable to create your account.',
        });
        return;
      }

      // =========================
      // SUCCESS
      // =========================

      Toast.show({
        type: 'success',
        text1: 'Account Created 🎉',
        text2: 'We have sent a verification OTP to your email.',
        position: 'top',
        visibilityTime: 2000,
      });

      // IMPORTANT:
      // Do NOT login here.
      // User still needs to verify OTP.

      navigation.navigate('OTP', {
        email: trimmedEmail,
      });
    } catch (error: any) {
      console.log('REGISTER ERROR:', error);

      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2:
          error?.message ||
          'Unable to create your account. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF8EE', '#FFF1D6', '#FFE4BF']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>

            <View style={styles.container}>

              <AuthHeader />

              <View style={styles.content}>

                <Text style={styles.heading}>
                  Create Account
                </Text>

                <Text style={styles.description}>
                  Join BuildSathi and start building smarter.
                </Text>

                {/* Full Name */}

                <AuthInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />

                {/* Email */}

                <AuthInput
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Password */}

                <AuthInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Confirm Password */}

                <AuthInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Text style={styles.passwordHint}>
                  Password must be at least 8 characters.
                </Text>

                {/* Register Button */}

                <Pressable
                  style={[
                    styles.button,
                    loading && styles.disabled,
                  ]}
                  onPress={handleRegister}
                  disabled={loading}>

                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>
                      Create Account
                    </Text>
                  )}

                </Pressable>

                {/* Login */}

                <Pressable
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Login')}
                  disabled={loading}>

                  <Text style={styles.loginText}>
                    Already have an account?{' '}
                    <Text style={styles.loginLink}>
                      Login
                    </Text>
                  </Text>

                </Pressable>

              </View>
            </View>

          </ScrollView>

        </KeyboardAvoidingView>
      </SafeAreaView>

    </LinearGradient>
  );
};

export default RegisterScreen;

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
    justifyContent: 'center',
  },

  content: {
    marginTop: 20,
    paddingBottom: 30,
  },

  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A0A0A',
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    color: '#8C8175',
    marginBottom: 28,
  },

  passwordHint: {
    fontSize: 12,
    color: '#8C8175',
    marginTop: -10,
    marginBottom: 20,
  },

  button: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#FF7A00',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  disabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  loginButton: {
    alignItems: 'center',
    marginTop: 24,
  },

  loginText: {
    color: '#8C8175',
    fontSize: 14,
    fontWeight: '600',
  },

  loginLink: {
    color: '#FF7A00',
    fontWeight: '800',
  },
});