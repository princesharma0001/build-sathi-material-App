import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  error?: string;
}

const AuthInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  error,
}: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

export default AuthInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },

  inputError: {
    borderColor: '#EF4444',
  },

  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
  },
});