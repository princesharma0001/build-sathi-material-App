import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {createBuyerProfileApi} from './buyer.api';

const BuyerProfileBasicScreen = () => {
  const navigation = useNavigation<any>();

  // =========================
  // FORM STATE
  // =========================

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);

  // =========================
  // CONTINUE
  // =========================

  const handleContinue = async () => {
    if (loading) {
      return;
    }

    const trimmedFullName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedCompanyName = companyName.trim();
    const trimmedState = state.trim();
    const trimmedCity = city.trim();
    const trimmedPincode = pincode.trim();
    const trimmedAddress = address.trim();

    // =========================
    // FULL NAME VALIDATION
    // =========================

    if (!trimmedFullName) {
      Toast.show({
        type: 'error',
        text1: 'Full Name Required',
        text2: 'Please enter your full name.',
        position: 'top',
      });
      return;
    }

    if (trimmedFullName.length < 2) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Full Name',
        text2: 'Name must be at least 2 characters.',
        position: 'top',
      });
      return;
    }

    // =========================
    // PHONE VALIDATION
    // =========================

    if (!trimmedPhone) {
      Toast.show({
        type: 'error',
        text1: 'Phone Number Required',
        text2: 'Please enter your phone number.',
        position: 'top',
      });
      return;
    }

    const phoneDigits = trimmedPhone.replace(/\D/g, '');

    if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid phone number.',
        position: 'top',
      });
      return;
    }

    // =========================
    // STATE
    // =========================

    if (!trimmedState) {
      Toast.show({
        type: 'error',
        text1: 'State Required',
        text2: 'Please enter your state.',
        position: 'top',
      });
      return;
    }

    // =========================
    // CITY
    // =========================

    if (!trimmedCity) {
      Toast.show({
        type: 'error',
        text1: 'City Required',
        text2: 'Please enter your city.',
        position: 'top',
      });
      return;
    }

    // =========================
    // PINCODE
    // =========================

    if (!trimmedPincode) {
      Toast.show({
        type: 'error',
        text1: 'Pincode Required',
        text2: 'Please enter your pincode.',
        position: 'top',
      });
      return;
    }

    if (!/^\d{6}$/.test(trimmedPincode)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Pincode',
        text2: 'Pincode must be exactly 6 digits.',
        position: 'top',
      });
      return;
    }

    // =========================
    // ADDRESS
    // =========================

    if (!trimmedAddress) {
      Toast.show({
        type: 'error',
        text1: 'Address Required',
        text2: 'Please enter your complete address.',
        position: 'top',
      });
      return;
    }

    // =========================
    // API
    // =========================

    try {
      setLoading(true);

      const response = await createBuyerProfileApi({
        // 👇 Full name sent as "name"
        name: trimmedFullName,

        phoneNumber: phoneDigits,

        companyName:
          trimmedCompanyName || undefined,

        state: trimmedState,

        city: trimmedCity,

        pincode: trimmedPincode,

        completeAddress: trimmedAddress,
      });

      console.log(
        'CREATE BUYER PROFILE RESPONSE:',
        response,
      );

      if (!response.success) {
        Toast.show({
          type: 'error',
          text1: 'Profile Not Saved',
          text2:
            response.message ||
            'Unable to save your profile.',
          position: 'top',
        });

        return;
      }

      // =========================
      // SUCCESS
      // =========================

      Toast.show({
        type: 'success',
        text1: 'Profile Saved 🎉',
        text2:
          'Your buyer profile has been created successfully.',
        position: 'top',
        visibilityTime: 1800,
      });

      setTimeout(() => {
        navigation.replace('Buyer');
      }, 500);
    } catch (error: any) {
      console.log(
        'BUYER PROFILE ERROR:',
        error,
      );

      Toast.show({
        type: 'error',
        text1: 'Unable to Save Profile',
        text2:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[
        '#FFFDF9',
        '#FFF8EE',
        '#FFE8C7',
      ]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? 10 : 0
          }>

          <ScrollView
            contentContainerStyle={
              styles.scrollContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}>

            <View style={styles.container}>

              {/* Header */}

              <Text style={styles.badge}>
                BUYER PROFILE
              </Text>

              <Text style={styles.heading}>
                Tell us about yourself
              </Text>

              <Text style={styles.description}>
                Add your basic details to start
                buying construction materials.
              </Text>

              {/* =========================
                  FULL NAME
              ========================= */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Full Name{' '}
                  <Text style={styles.required}>
                    *
                  </Text>
                </Text>

                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#A79B8D"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              {/* =========================
                  PHONE
              ========================= */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Phone Number{' '}
                  <Text style={styles.required}>
                    *
                  </Text>
                </Text>

                <TextInput
                  value={phone}
                  onChangeText={text =>
                    setPhone(
                      text
                        .replace(/\D/g, '')
                        .slice(0, 15),
                    )
                  }
                  placeholder="Enter phone number"
                  placeholderTextColor="#A79B8D"
                  keyboardType="phone-pad"
                  maxLength={15}
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              {/* =========================
                  COMPANY
              ========================= */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Company / Business Name
                </Text>

                <TextInput
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="Enter company or business name"
                  placeholderTextColor="#A79B8D"
                  autoCapitalize="words"
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              {/* =========================
                  STATE
              ========================= */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  State{' '}
                  <Text style={styles.required}>
                    *
                  </Text>
                </Text>

                <TextInput
                  value={state}
                  onChangeText={setState}
                  placeholder="e.g. Uttar Pradesh"
                  placeholderTextColor="#A79B8D"
                  autoCapitalize="words"
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              {/* =========================
                  CITY
              ========================= */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  City{' '}
                  <Text style={styles.required}>
                    *
                  </Text>
                </Text>

                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Noida"
                  placeholderTextColor="#A79B8D"
                  autoCapitalize="words"
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              {/* =========================
                  PINCODE
              ========================= */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Pincode{' '}
                  <Text style={styles.required}>
                    *
                  </Text>
                </Text>

                <TextInput
                  value={pincode}
                  onChangeText={text =>
                    setPincode(
                      text
                        .replace(/\D/g, '')
                        .slice(0, 6),
                    )
                  }
                  placeholder="Enter 6-digit pincode"
                  placeholderTextColor="#A79B8D"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                  style={styles.input}
                />
              </View>

              {/* =========================
                  ADDRESS
              ========================= */}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Complete Address{' '}
                  <Text style={styles.required}>
                    *
                  </Text>
                </Text>

                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your complete address"
                  placeholderTextColor="#A79B8D"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!loading}
                  style={[
                    styles.input,
                    styles.addressInput,
                  ]}
                />
              </View>

              {/* =========================
                  CONTINUE
              ========================= */}

              <Pressable
                style={[
                  styles.button,
                  loading &&
                    styles.buttonDisabled,
                ]}
                onPress={handleContinue}
                disabled={loading}>

                {loading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text style={styles.buttonText}>
                    Continue
                  </Text>
                )}
              </Pressable>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BuyerProfileBasicScreen;

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
    paddingBottom: 40,
  },

  badge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF7A00',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#8C8175',
    marginTop: 8,
    marginBottom: 30,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A3128',
    marginBottom: 7,
  },

  required: {
    color: '#FF3B30',
  },

  input: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F1E2D0',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0A0A0A',
  },

  addressInput: {
    height: 100,
    paddingTop: 14,
    paddingBottom: 14,
  },

  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});