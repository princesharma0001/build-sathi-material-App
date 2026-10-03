import React, {useState} from 'react';
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
  resetPasswordApi,
} from '../../api/auth.api';

const ResetPasswordScreen = ({
  navigation,
  route,
}: any) => {
  const email = route?.params?.email || '';
  const otp = route?.params?.otp || '';

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleResetPassword = async () => {
    if (!password) {
      Toast.show({
        type: 'error',
        text1: 'Password Required',
        text2:
          'Please enter a new password.',
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2:
          'Password must be at least 8 characters.',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords Do Not Match',
        text2:
          'Please enter the same password.',
      });
      return;
    }

    try {
      setLoading(true);

      await resetPasswordApi(
        email,
        otp,
        password,
      );

      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2:
          'Your password has been reset successfully.',
      });

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Login',
            },
          ],
        });
      }, 700);
    } catch (error: any) {
      console.log(
        'RESET PASSWORD ERROR:',
        error,
      );

      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2:
          error?.response?.data?.message ||
          'Unable to reset password.',
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
                name="lock-closed-outline"
                size={38}
                color="#FFFFFF"
              />
            </LinearGradient>
          </View>

          <Text style={styles.title}>
            Create New Password
          </Text>

          <Text style={styles.subtitle}>
            Your new password must be at least
            8 characters long.
          </Text>

          {/* Password */}
          <Text style={styles.label}>
            New Password
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#8C8175"
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              placeholderTextColor="#A79B8D"
              secureTextEntry={!showPassword}
              style={styles.input}
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword(
                  previous => !previous,
                )
              }>
              <Ionicons
                name={
                  showPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={21}
                color="#8C8175"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <Text
            style={[
              styles.label,
              {
                marginTop: 20,
              },
            ]}>
            Confirm Password
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#8C8175"
            />

            <TextInput
              value={confirmPassword}
              onChangeText={
                setConfirmPassword
              }
              placeholder="Confirm new password"
              placeholderTextColor="#A79B8D"
              secureTextEntry={
                !showConfirmPassword
              }
              style={styles.input}
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() =>
                setShowConfirmPassword(
                  previous => !previous,
                )
              }>
              <Ionicons
                name={
                  showConfirmPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={21}
                color="#8C8175"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={
              handleResetPassword
            }
            disabled={loading}
            style={styles.buttonWrapper}>

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
                    Reset Password
                  </Text>

                  <Ionicons
                    name="checkmark"
                    size={21}
                    color="#FFFFFF"
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

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
    marginTop: 40,
    marginBottom: 22,
  },

  iconContainer: {
    width: 82,
    height: 82,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A0A0A',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#8C8175',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
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
    marginRight: 10,
    fontSize: 16,
    color: '#0A0A0A',
  },

  buttonWrapper: {
    marginTop: 30,
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
});