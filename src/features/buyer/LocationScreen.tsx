import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const LocationScreen = ({ navigation }: any) => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const [errors, setErrors] = useState({
    address: '',
    city: '',
    pincode: '',
  });

  const validateForm = () => {
    const newErrors = {
      address: '',
      city: '',
      pincode: '',
    };

    let isValid = true;

    // Address - Required
    if (!address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    } else if (address.trim().length < 5) {
      newErrors.address = 'Please enter a valid address';
      isValid = false;
    }

    // City - Required
    if (!city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    } else if (city.trim().length < 2) {
      newErrors.city = 'Please enter a valid city';
      isValid = false;
    }

    // Pincode - Required
    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      isValid = false;
    } else if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      newErrors.pincode = 'Please enter a valid 6 digit pincode';
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  const handleContinue = () => {
    // if (!validateForm()) {
    //   return;
    // }

    const locationData = {
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
    };

    console.log('Location:', locationData);

    navigation.replace('BuyerHome');
  };

  const handleCurrentLocation = () => {
    // Later we will integrate GPS here.
    console.log('Current location clicked');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.locationIcon}>📍</Text>
            </View>

            <Text style={styles.title}>Where are you located?</Text>

            <Text style={styles.subtitle}>
              We’ll use your location to find nearby construction material
              suppliers.
            </Text>
          </View>

          {/* Current Location */}
          <Pressable
            style={styles.currentLocationCard}
            onPress={handleCurrentLocation}
          >
            <View style={styles.gpsIconContainer}>
              <Text style={styles.gpsIcon}>⌖</Text>
            </View>

            <View style={styles.currentLocationContent}>
              <Text style={styles.currentLocationTitle}>
                Use Current Location
              </Text>

              <Text style={styles.currentLocationSubtitle}>
                Automatically detect your location
              </Text>
            </View>

            <Text style={styles.chevron}>›</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>OR ENTER MANUALLY</Text>

            <View style={styles.divider} />
          </View>

          {/* Manual Address Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Enter your address</Text>

            {/* Address */}
            <Text style={styles.label}>Full Address *</Text>

            <TextInput
              style={[styles.textArea, errors.address && styles.inputError]}
              placeholder="House no., street, area..."
              placeholderTextColor="#9CA3AF"
              value={address}
              onChangeText={text => {
                setAddress(text);

                if (errors.address) {
                  setErrors(prev => ({
                    ...prev,
                    address: '',
                  }));
                }
              }}
              multiline
              textAlignVertical="top"
            />

            {errors.address ? (
              <Text style={styles.errorText}>{errors.address}</Text>
            ) : null}

            {/* City */}
            <Text style={styles.label}>City *</Text>

            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="e.g. Noida"
              placeholderTextColor="#9CA3AF"
              value={city}
              onChangeText={text => {
                setCity(text);

                if (errors.city) {
                  setErrors(prev => ({
                    ...prev,
                    city: '',
                  }));
                }
              }}
            />

            {errors.city ? (
              <Text style={styles.errorText}>{errors.city}</Text>
            ) : null}

            {/* Pincode */}
            <Text style={styles.label}>Pincode *</Text>

            <TextInput
              style={[styles.input, errors.pincode && styles.inputError]}
              placeholder="Enter 6 digit pincode"
              placeholderTextColor="#9CA3AF"
              value={pincode}
              onChangeText={text => {
                const numericValue = text.replace(/[^0-9]/g, '');

                setPincode(numericValue);

                if (errors.pincode) {
                  setErrors(prev => ({
                    ...prev,
                    pincode: '',
                  }));
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
            />

            {errors.pincode ? (
              <Text style={styles.errorText}>{errors.pincode}</Text>
            ) : null}
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>

            <Text style={styles.infoText}>
              Your location helps us connect you with suppliers who can deliver
              to your area.
            </Text>
          </View>

          {/* Continue */}
          <Pressable style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>

            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Header */

  header: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  locationIcon: {
    fontSize: 30,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 15,
  },

  /* Current Location */

  currentLocationCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  gpsIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  gpsIcon: {
    color: '#fff',
    fontSize: 27,
    fontWeight: '700',
  },

  currentLocationContent: {
    flex: 1,
    marginLeft: 13,
  },

  currentLocationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9A3412',
  },

  currentLocationSubtitle: {
    fontSize: 12,
    color: '#C2410C',
    marginTop: 3,
  },

  chevron: {
    fontSize: 28,
    color: '#D97706',
    marginLeft: 8,
  },

  /* Divider */

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  orText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginHorizontal: 10,
  },

  /* Form */

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 5,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 18,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },

  textArea: {
    height: 90,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
  },

  inputError: {
    borderColor: '#EF4444',
  },

  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
  },

  /* Info */

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 13,
    marginTop: 18,
    alignItems: 'flex-start',
  },

  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },

  /* Button */

  button: {
    height: 54,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 24,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  buttonArrow: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
  },
});
