import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {
  useAuthStore,
  saveAuthSession,
} from '../auth.store';import {UserRole} from '../auth.types';
import {selectRoleApi} from '../auth.api';
import {AuthStackParamList} from '../../../navigation/types';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'SelectRole'
>;

const SelectRoleScreen = ({route, navigation}: Props) => {
  const {email} = route.params;

  const [selectedRole, setSelectedRole] =
    useState<UserRole>('buyer');

  const [loading, setLoading] = useState(false);

  const setActiveRole = useAuthStore(
    state => state.setActiveRole,
  );

  const handleContinue = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      // Convert frontend role to backend role
      const apiRole =
        selectedRole === 'buyer'
          ? 'BUYER'
          : 'SELLER';

      // =========================
      // SELECT ROLE API
      // =========================

      const response = await selectRoleApi(
        email,
        apiRole,
      );

      if (!response.success || !response.data) {
        Toast.show({
          type: 'error',
          text1: 'Role Selection Failed',
          text2:
            response.message ||
            'Unable to select your role.',
          position: 'top',
        });

        return;
      }

      const {user, token} = response.data;

      // =========================
      // SAVE AUTH SESSION
      // =========================

      await saveAuthSession(token, user);

      // =========================
      // UPDATE LOCAL ROLE
      // =========================

      setActiveRole(selectedRole);

      // =========================
      // SUCCESS
      // =========================

      Toast.show({
        type: 'success',
        text1: 'Account Created 🎉',
        text2:
          selectedRole === 'buyer'
            ? 'Welcome to BuildSathi Buyer.'
            : 'Welcome to BuildSathi Seller.',
        position: 'top',
        visibilityTime: 1800,
      });

      // =========================
      // NAVIGATION
      // =========================

      setTimeout(() => {
        if (selectedRole === 'buyer') {
          navigation.navigate('BuyerProfileBasic');
          return;
        }

        if (selectedRole === 'seller') {
          navigation.navigate('SellerProfileBasic');
          return;
        }
      }, 500);
    } catch (error: any) {
      console.log(
        'SELECT ROLE ERROR:',
        error,
      );

      Toast.show({
        type: 'error',
        text1: 'Something Went Wrong',
        text2:
          error?.message ||
          'Unable to complete registration.',
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
        '#FFF8EE',
        '#FFF1D6',
        '#FFE4BF',
      ]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* Heading */}

          <Text style={styles.heading}>
            How will you use BuildSathi?
          </Text>

          <Text style={styles.description}>
            Select your role to get started
          </Text>

          {/* ========================= */}
          {/* BUYER */}
          {/* ========================= */}

          <Pressable
            style={[
              styles.roleCard,
              selectedRole === 'buyer' &&
                styles.selectedCard,
            ]}
            onPress={() =>
              setSelectedRole('buyer')
            }
            disabled={loading}>

            <View
              style={[
                styles.iconContainer,
                selectedRole === 'buyer' &&
                  styles.iconContainerSelected,
              ]}>

              <Text style={styles.icon}>
                🏗️
              </Text>

            </View>

            <View style={styles.roleContent}>

              <Text style={styles.roleTitle}>
                I am a Buyer
              </Text>

              <Text style={styles.roleDescription}>
                I want to buy construction materials
              </Text>

            </View>

            <View
              style={[
                styles.radio,
                selectedRole === 'buyer' &&
                  styles.radioSelected,
              ]}>

              {selectedRole === 'buyer' && (
                <View style={styles.radioDot} />
              )}

            </View>

          </Pressable>

          {/* ========================= */}
          {/* SELLER */}
          {/* ========================= */}

          <Pressable
            style={[
              styles.roleCard,
              selectedRole === 'seller' &&
                styles.selectedCard,
            ]}
            onPress={() =>
              setSelectedRole('seller')
            }
            disabled={loading}>

            <View
              style={[
                styles.iconContainer,
                selectedRole === 'seller' &&
                  styles.iconContainerSelected,
              ]}>

              <Text style={styles.icon}>
                🏪
              </Text>

            </View>

            <View style={styles.roleContent}>

              <Text style={styles.roleTitle}>
                I am a Seller
              </Text>

              <Text style={styles.roleDescription}>
                I want to sell construction materials
              </Text>

            </View>

            <View
              style={[
                styles.radio,
                selectedRole === 'seller' &&
                  styles.radioSelected,
              ]}>

              {selectedRole === 'seller' && (
                <View style={styles.radioDot} />
              )}

            </View>

          </Pressable>

          {/* ========================= */}
          {/* CONTINUE */}
          {/* ========================= */}

          <Pressable
            style={[
              styles.button,
              loading && styles.buttonDisabled,
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
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SelectRoleScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0A0A0A',
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    color: '#8C8175',
    marginBottom: 30,
  },

  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1E2D0',
    backgroundColor:
      'rgba(255,255,255,0.82)',
    marginBottom: 15,

    shadowColor: '#8C5A2B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  selectedCard: {
    borderColor: '#FF7A00',
    borderWidth: 2,
    backgroundColor: '#FFF8EE',

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },

  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E5',
    marginRight: 14,
  },

  iconContainerSelected: {
    backgroundColor: '#FFE1C2',
  },

  icon: {
    fontSize: 29,
  },

  roleContent: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  roleDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8C8175',
    marginTop: 4,
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D8CFC4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioSelected: {
    borderColor: '#FF7A00',
  },

  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF7A00',
  },

  button: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#FF7A00',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,

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
    fontWeight: '800',
  },
});