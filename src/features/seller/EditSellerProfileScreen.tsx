import React, {useCallback, useEffect, useState} from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  getSellerProfileApi,
  updateSellerProfileApi,
  SellerProfile,
} from './seller.api';

const EditSellerProfileScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [seller, setSeller] = useState<SellerProfile | null>(null);

  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');

  const [gstRegistered, setGstRegistered] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const businessTypes = [
    'Manufacturer',
    'Distributor',
    'Wholesaler',
    'Retailer',
    'Contractor',
  ];

  // -----------------------------------------
  // GET SELLER PROFILE
  // -----------------------------------------

  const fetchSellerProfile = useCallback(async () => {
    try {
      setLoading(true);

      const profile = await getSellerProfileApi();

      console.log('✅ SELLER PROFILE:', profile);

      setSeller(profile);

      // Bind API response to UI
      setOwnerName(profile.ownerName || '');
      setBusinessName(profile.businessName || '');
      setBusinessType(profile.businessType || '');

      setGstRegistered(profile.gstRegistered ?? false);
      setGstNumber(profile.gstNumber || '');
      setPanNumber(profile.panNumber || '');

      setPhone(profile.phone || '');
      setEmail(profile.email || '');
    } catch (error: any) {
      console.log(
        '❌ GET SELLER PROFILE ERROR:',
        error?.response?.data || error?.message,
      );

      Toast.show({
        type: 'error',
        text1: 'Unable to load profile',
        text2:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellerProfile();
  }, [fetchSellerProfile]);

  // -----------------------------------------
  // UPDATE SELLER PROFILE
  // -----------------------------------------

  const handleSave = async () => {
    // Validation
    if (!ownerName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Owner name required',
        text2: 'Please enter owner/contact person name.',
      });
      return;
    }

    if (!businessName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Business name required',
        text2: 'Please enter your business name.',
      });
      return;
    }

    if (!businessType) {
      Toast.show({
        type: 'error',
        text1: 'Business type required',
        text2: 'Please select your business type.',
      });
      return;
    }

    if (!phone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Phone number required',
        text2: 'Please enter your business phone number.',
      });
      return;
    }

    if (gstRegistered && !gstNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'GST number required',
        text2: 'Please enter your GST number.',
      });
      return;
    }

    try {
      setSaving(true);

      const updatedProfile = await updateSellerProfileApi({
        ownerName: ownerName.trim(),
        businessName: businessName.trim(),
        businessType: businessType.trim(),
        gstRegistered,
        gstNumber: gstRegistered ? gstNumber.trim() : '',
        panNumber: panNumber.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });

      console.log('✅ UPDATED SELLER PROFILE:', updatedProfile);

      setSeller(updatedProfile);

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your seller profile has been updated successfully.',
      });

      setTimeout(() => {
        navigation.goBack();
      }, 800);
    } catch (error: any) {
      console.log(
        '❌ UPDATE SELLER PROFILE ERROR:',
        error?.response?.data || error?.message,
      );

      Toast.show({
        type: 'error',
        text1: 'Unable to update profile',
        text2:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong.',
      });
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="business-outline"
            size={30}
            color="#FF7A00"
          />
        </View>

        <ActivityIndicator
          size="small"
          color="#FF7A00"
          style={{marginTop: 18}}
        />

        <Text style={styles.loadingText}>
          Loading your business profile...
        </Text>
      </View>
    );
  }

  // -----------------------------------------
  // PROFILE NOT FOUND
  // -----------------------------------------

  if (!seller) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="person-circle-outline"
            size={34}
            color="#D4A017"
          />
        </View>

        <Text style={styles.loadingText}>
          Seller profile not found
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={fetchSellerProfile}>
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <LinearGradient
      colors={['#FFFDF9', '#FFF8EE', '#FFE8C7']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          
          {/* HEADER */}

          <View style={styles.topHeader}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Ionicons
                name="arrow-back"
                size={22}
                color="#0A0A0A"
              />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                Edit Business Profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Update your seller information
              </Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>

            <View style={styles.container}>
              {/* BUSINESS INFORMATION */}

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Business Information
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                      Basic information about your business
                    </Text>
                  </View>

                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="business-outline"
                      size={18}
                      color="#FF7A00"
                    />
                  </View>
                </View>

                {/* OWNER */}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Owner / Contact Person
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color="#A79B8D"
                    />

                    <TextInput
                      value={ownerName}
                      onChangeText={setOwnerName}
                      placeholder="Enter owner name"
                      placeholderTextColor="#A79B8D"
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* BUSINESS */}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Company / Business Name
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="storefront-outline"
                      size={18}
                      color="#A79B8D"
                    />

                    <TextInput
                      value={businessName}
                      onChangeText={setBusinessName}
                      placeholder="Enter business name"
                      placeholderTextColor="#A79B8D"
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* BUSINESS TYPE */}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Business Type
                  </Text>

                  <View style={styles.typeGrid}>
                    {businessTypes.map(type => {
                      const selected =
                        businessType === type;

                      return (
                        <Pressable
                          key={type}
                          onPress={() =>
                            setBusinessType(type)
                          }
                          style={[
                            styles.typeChip,
                            selected &&
                              styles.typeChipSelected,
                          ]}>

                          {selected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={15}
                              color="#E65F00"
                            />
                          )}

                          <Text
                            style={[
                              styles.typeChipText,
                              selected &&
                                styles.typeChipTextSelected,
                            ]}>
                            {type}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* GST & TAX */}

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      GST & Tax Details
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                      Keep your business verification details updated
                    </Text>
                  </View>

                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={13}
                      color="#D97706"
                    />

                    <Text style={styles.verifiedBadgeText}>
                      TAX
                    </Text>
                  </View>
                </View>

                <Text style={styles.label}>
                  Are you GST registered?
                </Text>

                <View style={styles.gstOptions}>

                  {/* YES */}

                  <Pressable
                    onPress={() => setGstRegistered(true)}
                    style={[
                      styles.gstOption,
                      gstRegistered &&
                        styles.gstOptionSelected,
                    ]}>

                    <View
                      style={[
                        styles.radio,
                        gstRegistered &&
                          styles.radioSelected,
                      ]}>
                      {gstRegistered && (
                        <View style={styles.radioDot} />
                      )}
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.gstOptionTitle,
                          gstRegistered &&
                            styles.gstOptionTitleSelected,
                        ]}>
                        Yes
                      </Text>

                      <Text style={styles.gstOptionSubtitle}>
                        I have a GSTIN
                      </Text>
                    </View>
                  </Pressable>

                  {/* NO */}

                  <Pressable
                    onPress={() => {
                      setGstRegistered(false);
                      setGstNumber('');
                    }}
                    style={[
                      styles.gstOption,
                      !gstRegistered &&
                        styles.gstOptionSelected,
                    ]}>

                    <View
                      style={[
                        styles.radio,
                        !gstRegistered &&
                          styles.radioSelected,
                      ]}>
                      {!gstRegistered && (
                        <View style={styles.radioDot} />
                      )}
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.gstOptionTitle,
                          !gstRegistered &&
                            styles.gstOptionTitleSelected,
                        ]}>
                        No
                      </Text>

                      <Text style={styles.gstOptionSubtitle}>
                        Not registered
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* GST */}

                {gstRegistered && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      GST Number
                    </Text>

                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color="#A79B8D"
                      />

                      <TextInput
                        value={gstNumber}
                        onChangeText={text =>
                          setGstNumber(
                            text
                              .toUpperCase()
                              .replace(/\s/g, ''),
                          )
                        }
                        placeholder="09ABCDE1234F1Z5"
                        placeholderTextColor="#A79B8D"
                        autoCapitalize="characters"
                        maxLength={15}
                        style={styles.input}
                      />
                    </View>
                  </View>
                )}

                {/* PAN */}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    PAN Number
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="card-outline"
                      size={18}
                      color="#A79B8D"
                    />

                    <TextInput
                      value={panNumber}
                      onChangeText={text =>
                        setPanNumber(
                          text
                            .toUpperCase()
                            .replace(/\s/g, ''),
                        )
                      }
                      placeholder="ABCDE1234F"
                      placeholderTextColor="#A79B8D"
                      autoCapitalize="characters"
                      maxLength={10}
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>

              {/* CONTACT DETAILS */}

              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Contact Details
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                      How buyers can reach your business
                    </Text>
                  </View>

                  <View style={styles.sectionIcon}>
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color="#FF7A00"
                    />
                  </View>
                </View>

                {/* PHONE */}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Business Phone
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="call-outline"
                      size={18}
                      color="#A79B8D"
                    />

                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Enter phone number"
                      placeholderTextColor="#A79B8D"
                      keyboardType="phone-pad"
                      maxLength={10}
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* EMAIL */}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Business Email
                    <Text style={styles.optional}>
                      {' '}
                      Optional
                    </Text>
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color="#A79B8D"
                    />

                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="business@example.com"
                      placeholderTextColor="#A79B8D"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>

              {/* SECURITY CARD */}

              <View style={styles.securityCard}>
                <View style={styles.securityIcon}>
                  <Ionicons
                    name="shield-checkmark"
                    size={21}
                    color="#D97706"
                  />
                </View>

                <View style={styles.securityContent}>
                  <Text style={styles.securityTitle}>
                    Your information is secure
                  </Text>

                  <Text style={styles.securityText}>
                    Your business details are securely stored
                    and used for your BuildSathi seller profile.
                  </Text>
                </View>
              </View>

              {/* SAVE BUTTON */}

              <Pressable
                onPress={handleSave}
                disabled={saving}
                style={[
                  styles.saveButton,
                  saving && styles.saveButtonDisabled,
                ]}>

                {saving ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text style={styles.saveButtonText}>
                      Saving...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text style={styles.saveButtonText}>
                      Save Changes
                    </Text>
                  </>
                )}
              </Pressable>

              <Text style={styles.bottomNote}>
                Your updated information will be reflected
                across your BuildSathi seller profile.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default EditSellerProfileScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  container: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  // HEADER

  topHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E2D0',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  headerSubtitle: {
    fontSize: 11,
    color: '#8C8175',
    marginTop: 3,
    fontWeight: '600',
  },

  headerSpacer: {
    width: 44,
  },

  // HERO

  profileHero: {
    marginTop: 18,
    marginBottom: 16,
    borderRadius: 22,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3D7A4',
  },

  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD9A8',
  },

  profileHeroContent: {
    flex: 1,
    marginLeft: 13,
  },

  profileHeroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  profileHeroSubtitle: {
    fontSize: 12,
    color: '#8C7046',
    marginTop: 4,
    fontWeight: '600',
  },

  editBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFF8EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // SECTION

  section: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1E2D0',
    padding: 17,
    marginBottom: 15,
    marginTop:14,

    shadowColor: '#8C5A2B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 9,
    elevation: 2,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#8C8175',
    marginTop: 4,
    maxWidth: 270,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF0DF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // INPUT

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#3A3128',
    marginBottom: 7,
  },

  optional: {
    fontSize: 9,
    color: '#A79B8D',
    fontWeight: '600',
  },

  inputWrapper: {
    height: 51,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBDCCB',
    backgroundColor: '#FFFCF8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#0A0A0A',
  },

  // BUSINESS TYPE

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBDCCB',
    backgroundColor: '#FFFCF8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  typeChipSelected: {
    backgroundColor: '#FFF0DF',
    borderColor: '#FF7A00',
  },

  typeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6F655B',
  },

  typeChipTextSelected: {
    color: '#E65F00',
    fontWeight: '900',
  },

  // GST

  verifiedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFF0DF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  verifiedBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: 0.6,
  },

  gstOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 17,
  },

  gstOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBDCCB',
    backgroundColor: '#FFFCF8',
  },

  gstOptionSelected: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF5E8',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D8CFC4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  radioSelected: {
    borderColor: '#FF7A00',
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7A00',
  },

  gstOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3A3128',
  },

  gstOptionTitleSelected: {
    color: '#E65F00',
  },

  gstOptionSubtitle: {
    fontSize: 10,
    color: '#8C8175',
    marginTop: 2,
  },

  // SECURITY

  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF4DE',
    borderWidth: 1,
    borderColor: '#F3D7A4',
    marginBottom: 16,
  },

  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFE6B5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#5B421C',
  },

  securityText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8C7046',
    marginTop: 3,
  },

  // SAVE

  saveButton: {
    height: 56,
    borderRadius: 17,
    backgroundColor: '#FF7A00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  bottomNote: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    color: '#9A8E82',
    marginTop: 11,
    paddingHorizontal: 20,
  },

  // LOADING

  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF8EE',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: '#FFF0DF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#8C8175',
    fontWeight: '600',
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: '#FF7A00',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});

