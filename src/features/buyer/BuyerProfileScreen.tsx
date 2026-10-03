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

const BuyerProfileScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');

  const [errors, setErrors] = useState({
    name: '',
    companyName: '',
    email: '',
    gstin: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      companyName: '',
      email: '',
      gstin: '',
    };
  
    let isValid = true;
  
    // Full Name - Required
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
      isValid = false;
    }
  
    // Company Name - Required
    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required';
      isValid = false;
    } else if (companyName.trim().length < 2) {
      newErrors.companyName =
        'Company name must be at least 2 characters';
      isValid = false;
    }
  
    // Email - Required
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }
  
    // GSTIN - Optional
    if (gstin.trim()) {
      const gstinRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  
      if (!gstinRegex.test(gstin.trim().toUpperCase())) {
        newErrors.gstin = 'Please enter a valid GSTIN';
        isValid = false;
      }
    }
  
    setErrors(newErrors);
  
    return isValid;
  };

  const handleContinue = () => {
    // const isValid = validateForm();

    // if (!isValid) {
    //   return;
    // }

    // Profile data later API/store mein save karenge
    const buyerProfile = {
      name: name.trim(),
      companyName: companyName.trim(),
      email: email.trim(),
      gstin: gstin.trim().toUpperCase(),
    };

    console.log('Buyer Profile:', buyerProfile);

    navigation.navigate('Location');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Complete Your Profile</Text>

          <Text style={styles.subtitle}>Tell us a little about yourself</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name *</Text>

          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Enter your full name"
            value={name}
            onChangeText={text => {
              setName(text);

              if (errors.name) {
                setErrors(prev => ({
                  ...prev,
                  name: '',
                }));
              }
            }}
            returnKeyType="next"
          />

          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}

          {/* Company Name */}
          <Text style={styles.label}>Company / Contractor Name</Text>

          <TextInput
            style={[styles.input, errors.companyName && styles.inputError]}
            placeholder="Enter company name"
            value={companyName}
            onChangeText={text => {
              setCompanyName(text);

              if (errors.companyName) {
                setErrors(prev => ({
                  ...prev,
                  companyName: '',
                }));
              }
            }}
            returnKeyType="next"
          />

          {errors.companyName ? (
            <Text style={styles.errorText}>{errors.companyName}</Text>
          ) : null}

          {/* Email */}
          <Text style={styles.label}>Email</Text>

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter email address"
            value={email}
            onChangeText={text => {
              setEmail(text);

              if (errors.email) {
                setErrors(prev => ({
                  ...prev,
                  email: '',
                }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

          {/* GSTIN */}
          <Text style={styles.label}>GSTIN</Text>

          <TextInput
            style={[styles.input, errors.gstin && styles.inputError]}
            placeholder="Enter GSTIN (Optional)"
            value={gstin}
            onChangeText={text => {
              setGstin(text.toUpperCase());

              if (errors.gstin) {
                setErrors(prev => ({
                  ...prev,
                  gstin: '',
                }));
              }
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={15}
            returnKeyType="done"
          />

          {errors.gstin ? (
            <Text style={styles.errorText}>{errors.gstin}</Text>
          ) : null}

          {/* GST Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>GSTIN is optional for buyers.</Text>
          </View>

          {/* Continue */}
          <Pressable style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BuyerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    padding: 24,
    paddingBottom: 60,
    flexGrow: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 30,
    lineHeight: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
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

  infoBox: {
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },

  infoText: {
    color: '#9A3412',
    fontSize: 13,
  },

  button: {
    height: 52,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
