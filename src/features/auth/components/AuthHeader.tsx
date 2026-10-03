import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const AuthHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>B</Text>
      </View>

      <Text style={styles.title}>BuildSathi</Text>

      <Text style={styles.subtitle}>
        Construction Material Marketplace
      </Text>
    </View>
  );
};

export default AuthHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 35,
  },

  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  logo: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
  },
});