import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

// import Ionicons from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  clearAuthSession,
  clearAuthSession2,
} from '../auth/auth.store';

import {
  getBuyerProfileApi,
} from '../buyer/buyer.api';

/* ====================================================== */
/* TYPES */
/* ====================================================== */

interface BuyerProfile {
  id: string | null;
  name: string;
  phoneNumber: string | null;
  email: string;
  companyName: string | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
  completeAddress: string | null;
}

interface ProfileMenuItemProps {
  icon: string;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

/* ====================================================== */
/* MAIN SCREEN */
/* ====================================================== */

const MainBuyerProfileScreen = ({
  navigation,
}: any) => {
  const [profile, setProfile] =
    useState<BuyerProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  /* ================================================== */
  /* GET PROFILE */
  /* ================================================== */

  const loadProfile = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const response =
          await getBuyerProfileApi();

        console.log(
          'BUYER PROFILE RESPONSE:',
          response,
        );

        const profileData =
          response?.data?.profile;

          if (!profileData) {
            console.log(
              '❌ Buyer profile/user not found → Login',
            );
            await clearAuthSession();
            navigation.replace('Login');
    
            return;
          }

        setProfile(profileData);
      } catch (err) {
        console.log(
          'GET BUYER PROFILE ERROR:',
          err,
        );
        const status =
        err?.response?.status;

      const message =
        err?.response?.data?.message ||
        err?.message ||
        '';
        if (
          status === 401 ||
          status === 403 ||
          message
            .toLowerCase()
            .includes('User not found') ||
          message
            .toLowerCase()
            .includes('unauthorized')
        ) {
          console.log(
            '🔐 Session invalid → clearing auth',
          );
  
          await clearAuthSession();
  
          navigation.replace('Login');
  
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load profile',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  /* ================================================== */
  /* LOAD WHEN SCREEN IS FOCUSED */
  /* ================================================== */

  useFocusEffect(
    useCallback(() => {
      loadProfile();

      return undefined;
    }, [loadProfile]),
  );

  /* ================================================== */
  /* NAVIGATION */
  /* ================================================== */

  const goTo = (screen: string) => {
    navigation.navigate(screen);
  };

  /* ================================================== */
  /* LOGOUT */
  /* ================================================== */

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Starting logout...');
  
              await clearAuthSession2();
  
              console.log(
                '✅ Local session cleared',
              );
  
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Auth',
                    params: {
                      screen: 'Login',
                    },
                  },
                ],
              });
            } catch (error) {
              console.error(
                '❌ LOGOUT ERROR:',
                error,
              );
  
              Alert.alert(
                'Logout Failed',
                'Unable to clear your session. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  /* ================================================== */
  /* AVATAR INITIALS */
  /* ================================================== */

  const getInitials = (
    name?: string | null,
  ) => {
    if (!name?.trim()) {
      return 'U';
    }

    const words =
      name.trim().split(/\s+/);

    return words
      .slice(0, 2)
      .map(word =>
        word
          .charAt(0)
          .toUpperCase(),
      )
      .join('');
  };

  /* ================================================== */
  /* LOCATION */
  /* ================================================== */

  const getLocation = () => {
    if (
      profile?.city &&
      profile?.state
    ) {
      return `${profile.city}, ${profile.state}`;
    }

    if (profile?.city) {
      return profile.city;
    }

    if (profile?.state) {
      return profile.state;
    }

    return 'Location not added';
  };

  /* ================================================== */
  /* ADDRESS */
  /* ================================================== */

  const getAddress = () => {
    const addressParts = [
      profile?.completeAddress,
      profile?.city,
      profile?.state,
      profile?.pincode,
    ].filter(Boolean);

    if (!addressParts.length) {
      return 'Address not added';
    }

    return addressParts.join(', ');
  };

  /* ================================================== */
  /* LOADING SCREEN */
/* ================================================== */

  if (loading && !profile) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerTop}>
            <Pressable
              style={styles.headerBackButton}
              onPress={() =>
                navigation.goBack()
              }
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color="#0A0A0A"
              />
            </Pressable>

            <View
              style={
                styles.headerTitleContainer
              }
            >
              <Text
                style={styles.headerTitle}
              >
                My Profile
              </Text>
            </View>

            <View
              style={
                styles.headerSettingsButton
              }
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color="#0A0A0A"
              />
            </View>
          </View>

          <View
            style={
              styles.loadingContainer
            }
          >
            <View
              style={
                styles.loadingIcon
              }
            >
              <ActivityIndicator
                size="large"
                color="#FF7A00"
              />
            </View>

            <Text
              style={styles.loadingTitle}
            >
              Loading profile
            </Text>

            <Text
              style={
                styles.loadingSubtitle
              }
            >
              Please wait...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  /* ================================================== */
  /* ERROR SCREEN */
/* ================================================== */

  if (error && !profile) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerTop}>
            <Pressable
              style={styles.headerBackButton}
              onPress={() =>
                navigation.goBack()
              }
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color="#0A0A0A"
              />
            </Pressable>

            <View
              style={
                styles.headerTitleContainer
              }
            >
              <Text
                style={styles.headerTitle}
              >
                My Profile
              </Text>
            </View>

            <View
              style={
                styles.headerSettingsButton
              }
            >
              <Ionicons
                name="settings-outline"
                size={20}
                color="#0A0A0A"
              />
            </View>
          </View>

          <View
            style={
              styles.errorContainer
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={32}
                color="#D94C3D"
              />
            </View>

            <Text
              style={styles.errorTitle}
            >
              Unable to load profile
            </Text>

            <Text
              style={styles.errorMessage}
            >
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() =>
                loadProfile()
              }
            >
              <Ionicons
                name="refresh"
                size={17}
                color="#FFFFFF"
              />

              <Text
                style={styles.retryText}
              >
                Try Again
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={styles.safeArea}
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <View style={styles.headerTop}>
          <Pressable
            style={
              styles.headerBackButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#0A0A0A"
            />
          </Pressable>

          <View
            style={
              styles.headerTitleContainer
            }
          >
            <Text
              style={styles.headerTitle}
            >
              My Profile
            </Text>
          </View>

          <Pressable
            style={
              styles.headerSettingsButton
            }
            onPress={() => {}}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color="#0A0A0A"
            />
          </Pressable>
        </View>

        {/* ================================================== */}
        {/* SCROLL */}
        {/* ================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                loadProfile(true)
              }
              tintColor="#FF7A00"
              colors={['#FF7A00']}
            />
          }
        >
          {/* ================================================== */}
          {/* PROFILE HEADER */}
          {/* ================================================== */}

          <View
            style={styles.profileHeader}
          >
            <View
              style={styles.identityCard}
            >
              {/* AVATAR */}

              <View
                style={styles.avatarWrapper}
              >
                <LinearGradient
                  colors={[
                    '#FF7A00',
                    '#FFB12E',
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 1,
                  }}
                  style={styles.avatar}
                >
                  <Text
                    style={
                      styles.avatarText
                    }
                  >
                    {getInitials(
                      profile?.name,
                    )}
                  </Text>
                </LinearGradient>

                <View
                  style={
                    styles.verifiedDot
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              {/* IDENTITY */}

              <View
                style={styles.identityInfo}
              >
                <View
                  style={styles.nameRow}
                >
                  <Text
                    style={
                      styles.profileName
                    }
                    numberOfLines={1}
                  >
                    {profile?.name ||
                      'User'}
                  </Text>

                  <View
                    style={
                      styles.verifiedBadge
                    }
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={11}
                      color="#D4A017"
                    />

                    <Text
                      style={
                        styles.verifiedText
                      }
                    >
                      Verified
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.locationRow
                  }
                >
                  <Ionicons
                    name="location"
                    size={13}
                    color="#FF7A00"
                  />

                  <Text
                    style={
                      styles.locationText
                    }
                    numberOfLines={1}
                  >
                    {getLocation()}
                  </Text>
                </View>

                <Text
                  style={
                    styles.memberText
                  }
                >
                  Member since 2026
                </Text>
              </View>

              {/* EDIT */}

              <Pressable
                style={
                  styles.editProfileButton
                }
                onPress={() =>
                  navigation.navigate(
                    'EditBuyerProfile',
                  )
                }
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color="#FF7A00"
                />
              </Pressable>
            </View>
          </View>

         

          {/* ================================================== */}
          {/* PERSONAL INFORMATION */}
          {/* ================================================== */}

          <View
            style={styles.section}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              PERSONAL INFORMATION
            </Text>

            <View
              style={
                styles.personalCard
              }
            >
              {/* FULL NAME */}

              <View
                style={
                  styles.personalRow
                }
              >
                <View
                  style={[
                    styles.personalIcon,
                    {
                      backgroundColor:
                        '#FFF0DF',
                    },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color="#FF7A00"
                  />
                </View>

                <View
                  style={
                    styles.personalInfo
                  }
                >
                  <Text
                    style={
                      styles.personalLabel
                    }
                  >
                    Full Name
                  </Text>

                  <Text
                    style={
                      styles.personalValue
                    }
                  >
                    {profile?.name ||
                      'Not added'}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.personalDivider
                }
              />

              {/* EMAIL */}

              <View
                style={
                  styles.personalRow
                }
              >
                <View
                  style={[
                    styles.personalIcon,
                    {
                      backgroundColor:
                        '#F1EDFF',
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#7C5CFC"
                  />
                </View>

                <View
                  style={
                    styles.personalInfo
                  }
                >
                  <Text
                    style={
                      styles.personalLabel
                    }
                  >
                    Email
                  </Text>

                  <Text
                    style={
                      styles.personalValue
                    }
                    numberOfLines={1}
                  >
                    {profile?.email ||
                      'Not added'}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.personalDivider
                }
              />

              {/* PHONE */}

              <View
                style={
                  styles.personalRow
                }
              >
                <View
                  style={[
                    styles.personalIcon,
                    {
                      backgroundColor:
                        '#EAF8EF',
                    },
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color="#2E9D5B"
                  />
                </View>

                <View
                  style={
                    styles.personalInfo
                  }
                >
                  <Text
                    style={
                      styles.personalLabel
                    }
                  >
                    Phone Number
                  </Text>

                  <Text
                    style={
                      styles.personalValue
                    }
                  >
                    {profile?.phoneNumber ||
                      'Not added'}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.personalDivider
                }
              />

              {/* COMPANY */}

              <View
                style={
                  styles.personalRow
                }
              >
                <View
                  style={[
                    styles.personalIcon,
                    {
                      backgroundColor:
                        '#FFF7D9',
                    },
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={18}
                    color="#D4A017"
                  />
                </View>

                <View
                  style={
                    styles.personalInfo
                  }
                >
                  <Text
                    style={
                      styles.personalLabel
                    }
                  >
                    Company / Business
                  </Text>

                  <Text
                    style={
                      styles.personalValue
                    }
                  >
                    {profile?.companyName ||
                      'Not added'}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.personalDivider
                }
              />

              {/* ADDRESS */}

              <View
                style={
                  styles.personalRow
                }
              >
                <View
                  style={[
                    styles.personalIcon,
                    {
                      backgroundColor:
                        '#FFF0DF',
                    },
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color="#FF7A00"
                  />
                </View>

                <View
                  style={
                    styles.personalInfo
                  }
                >
                  <Text
                    style={
                      styles.personalLabel
                    }
                  >
                    Complete Address
                  </Text>

                  <Text
                    style={
                      styles.personalValue
                    }
                  >
                    {profile?.completeAddress ||
                      'Not added'}
                  </Text>

                  {(profile?.city ||
                    profile?.state ||
                    profile?.pincode) && (
                    <Text
                      style={
                        styles.personalSecondary
                      }
                    >
                      {[
                        profile?.city,
                        profile?.state,
                        profile?.pincode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* ================================================== */}
          {/* ACCOUNT */}
          {/* ================================================== */}

          <View
            style={styles.section}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              ACCOUNT
            </Text>

            <View
              style={styles.menuCard}
            >
              <ProfileMenuItem
                icon="person-outline"
                iconColor="#FF7A00"
                iconBackground="#FFF0DF"
                title="Edit Profile"
                subtitle="Update your personal details"
                onPress={() =>
                  navigation.navigate(
                    'EditBuyerProfile',
                  )
                }
              />

              <MenuDivider />

              <ProfileMenuItem
                icon="location-outline"
                iconColor="#D4A017"
                iconBackground="#FFF7D9"
                title="Delivery Addresses"
                subtitle="Manage your construction site addresses"
                onPress={() =>
                  navigation.navigate(
                    'DeliveryAddresses',
                  )
                }
              />

              <MenuDivider />

              <ProfileMenuItem
                icon="notifications-outline"
                iconColor="#7C5CFC"
                iconBackground="#F1EDFF"
                title="Notifications"
                subtitle="Manage alerts and updates"
                onPress={() =>
                  navigation.navigate(
                    'Notifications',
                  )
                }
                rightElement={
                  <View
                    style={
                      styles.notificationBadge
                    }
                  >
                    <Text
                      style={
                        styles.notificationBadgeText
                      }
                    >
                      3
                    </Text>
                  </View>
                }
              />

              <MenuDivider />

              <ProfileMenuItem
                icon="heart-outline"
                iconColor="#E85D75"
                iconBackground="#FFF0F3"
                title="Saved Suppliers"
                subtitle="Your trusted suppliers"
                onPress={() => {}}
                rightElement={
                  <View
                    style={
                      styles.comingSoonBadge
                    }
                  >
                    <Text
                      style={
                        styles.comingSoonText
                      }
                    >
                      Coming soon
                    </Text>
                  </View>
                }
                showArrow={false}
              />
            </View>
          </View>

          {/* ================================================== */}
          {/* SUPPORT & SAFETY */}
          {/* ================================================== */}

          <View
            style={styles.section}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              SUPPORT & SAFETY
            </Text>

            <View
              style={styles.menuCard}
            >
              <ProfileMenuItem
                icon="shield-checkmark-outline"
                iconColor="#2E9D5B"
                iconBackground="#EAF8EF"
                title="Buyer Protection"
                subtitle="Learn how your purchases are protected"
                onPress={() => {}}
                showArrow
              />

              <MenuDivider />

              <ProfileMenuItem
                icon="help-circle-outline"
                iconColor="#FF7A00"
                iconBackground="#FFF0DF"
                title="Help & Support"
                subtitle="Get help from BuildSathi"
                onPress={() => {}}
                showArrow
              />

              <MenuDivider />

              <ProfileMenuItem
                icon="document-text-outline"
                iconColor="#6D6258"
                iconBackground="#F5F1EC"
                title="Terms & Privacy"
                subtitle="Terms of service and privacy policy"
                onPress={() => {}}
                showArrow
              />
            </View>
          </View>

          {/* ================================================== */}
          {/* PREMIUM TRUST CARD */}
          {/* ================================================== */}

          <LinearGradient
            colors={[
              '#0A0A0A',
              '#21170C',
              '#3A2608',
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={
              styles.premiumCard
            }
          >
            <View
              style={
                styles.premiumIcon
              }
            >
              <Ionicons
                name="diamond"
                size={20}
                color="#FFD76A"
              />
            </View>

            <View
              style={
                styles.premiumText
              }
            >
              <Text
                style={
                  styles.premiumTitle
                }
              >
                Build with confidence
              </Text>

              <Text
                style={
                  styles.premiumSubtitle
                }
              >
                Verified suppliers.
                Transparent quotes.
                Protected purchases.
              </Text>
            </View>
          </LinearGradient>

          {/* ================================================== */}
          {/* LOGOUT */}
          {/* ================================================== */}

          <Pressable
            style={({pressed}) => [
              styles.logoutButton,
              pressed &&
                styles.logoutPressed,
            ]}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={19}
              color="#D94C3D"
            />

            <Text
              style={styles.logoutText}
            >
              Logout
            </Text>
          </Pressable>

          {/* ================================================== */}
          {/* VERSION */}
          {/* ================================================== */}

          <Text
            style={styles.version}
          >
            BuildSathi • Version 1.0.0
          </Text>

          <View
            style={styles.bottomSpace}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

/* ====================================================== */
/* PROFILE MENU ITEM */
/* ====================================================== */

const ProfileMenuItem = ({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightElement,
}: ProfileMenuItemProps) => {
  return (
    <Pressable
      style={({pressed}) => [
        styles.menuItem,
        pressed &&
          styles.menuItemPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={19}
          color={iconColor}
        />
      </View>

      <View
        style={styles.menuText}
      >
        <Text
          style={styles.menuTitle}
        >
          {title}
        </Text>

        <Text
          style={styles.menuSubtitle}
        >
          {subtitle}
        </Text>
      </View>

      {rightElement}

      {showArrow &&
        !rightElement && (
          <Ionicons
            name="chevron-forward"
            size={17}
            color="#B2A69A"
          />
        )}
    </Pressable>
  );
};

/* ====================================================== */
/* DIVIDER */
/* ====================================================== */

const MenuDivider = () => {
  return (
    <View
      style={styles.menuDivider}
    />
  );
};

export default MainBuyerProfileScreen;

/* ====================================================== */
/* STYLES */
/* ====================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8EE',
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* ================================================== */
  /* LOADING */
  /* ================================================== */

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0DF',
  },

  loadingTitle: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: '900',
    color: '#211C17',
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: '600',
    color: '#998E83',
  },

  /* ================================================== */
  /* ERROR */
  /* ================================================== */

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0EE',
  },

  errorTitle: {
    marginTop: 15,
    fontSize: 15,
    fontWeight: '900',
    color: '#211C17',
  },

  errorMessage: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '500',
    color: '#998E83',
  },

  retryButton: {
    marginTop: 18,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
  },

  retryText: {
    marginLeft: 7,
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ================================================== */
  /* HEADER */
  /* ================================================== */

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#F0DEC4',
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  headerSettingsButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#F0DEC4',
  },

  /* ================================================== */
  /* PROFILE HEADER */
  /* ================================================== */

  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 18,
  },

  identityCard: {
    marginTop: 18,
    padding: 13,
    minHeight: 92,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0DEC4',
    shadowColor: '#9A6429',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  avatarWrapper: {
    position: 'relative',
  },

  avatar: {
    width: 66,
    height: 66,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF3D6',
  },

  avatarText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  verifiedDot: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E9D5B',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  identityInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 7,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  profileName: {
    maxWidth: '65%',
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  verifiedBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    borderWidth: 1,
    borderColor: '#F0D98D',
  },

  verifiedText: {
    marginLeft: 3,
    fontSize: 7.5,
    fontWeight: '900',
    color: '#A57A00',
  },

  locationRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    flex: 1,
    marginLeft: 4,
    fontSize: 9.5,
    fontWeight: '600',
    color: '#77695C',
  },

  memberText: {
    marginTop: 4,
    fontSize: 8.5,
    fontWeight: '500',
    color: '#A19589',
  },

  editProfileButton: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFD6AE',
  },

  /* ================================================== */
  /* QUICK STATS */
  /* ================================================== */

  statsCard: {
    marginHorizontal: 16,
    marginTop: 14,
    minHeight: 105,
    paddingVertical: 12,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E2D0',
    shadowColor: '#8C5A2B',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statNumber: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  statLabel: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#95897D',
  },

  statDivider: {
    width: 1,
    height: 43,
    backgroundColor: '#F0E5DA',
  },

  /* ================================================== */
  /* SECTION */
  /* ================================================== */

  section: {
    marginTop: 10,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    marginBottom: 9,
    marginLeft: 3,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: '#0A0A0A',
  },

  /* ================================================== */
  /* PERSONAL INFORMATION */
  /* ================================================== */

  personalCard: {
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E2D0',
    shadowColor: '#8C5A2B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  personalRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  personalIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  personalInfo: {
    flex: 1,
    marginLeft: 12,
  },

  personalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A8B7D',
  },

  personalValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '700',
    color: '#211C17',
  },

  personalSecondary: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: '#998E83',
  },

  personalDivider: {
    height: 1,
    marginLeft: 68,
    backgroundColor: '#F5EDE5',
  },

  /* ================================================== */
  /* MENU */
  /* ================================================== */

  menuCard: {
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E2D0',
    shadowColor: '#8C5A2B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  menuItem: {
    minHeight: 72,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemPressed: {
    backgroundColor: '#FFF9F2',
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#211C17',
  },

  menuSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 13,
    fontWeight: '500',
    color: '#998E83',
  },

  menuDivider: {
    height: 1,
    marginLeft: 67,
    backgroundColor: '#F5EDE5',
  },

  notificationBadge: {
    minWidth: 23,
    height: 23,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
  },

  notificationBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  comingSoonBadge: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F1EC',
  },

  comingSoonText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8C8175',
  },

  /* ================================================== */
  /* PREMIUM */
  /* ================================================== */

  premiumCard: {
    marginHorizontal: 16,
    marginTop: 22,
    minHeight: 88,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  premiumIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,215,106,0.12)',
    borderWidth: 1,
    borderColor:
      'rgba(255,215,106,0.2)',
    marginLeft: 14,
  },

  premiumText: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  premiumTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  premiumSubtitle: {
    marginTop: 4,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '500',
    color: '#C9BDAF',
  },

  /* ================================================== */
  /* LOGOUT */
  /* ================================================== */

  logoutButton: {
    marginHorizontal: 16,
    marginTop: 18,
    height: 51,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFF5F3',
    borderWidth: 1,
    borderColor: '#F2D3CE',
  },

  logoutPressed: {
    backgroundColor: '#FDEBE8',
  },

  logoutText: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: '800',
    color: '#D94C3D',
  },

  /* ================================================== */
  /* FOOTER */
  /* ================================================== */

  version: {
    marginTop: 13,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: '600',
    color: '#B1A59A',
  },

  bottomSpace: {
    height: 110,
  },
});
