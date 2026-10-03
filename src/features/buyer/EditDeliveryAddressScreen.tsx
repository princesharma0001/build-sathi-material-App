import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  createDeliveryAddressApi,
  getDeliveryAddressApi,
  updateDeliveryAddressApi,
} from './address.api';

const EditDeliveryAddressScreen = ({
  navigation,
  route,
}: any) => {
  const addressId =
    route?.params?.addressId ||
    route?.params?.address?.id ||
    null;

  const isEditing = !!addressId;

  const [label, setLabel] = useState(
    route?.params?.address?.label ||
      'Construction Site',
  );

  const [name, setName] = useState(
    route?.params?.address?.name || '',
  );

  const [phone, setPhone] = useState(
    route?.params?.address?.phone || '',
  );

  const [addressLine1, setAddressLine1] =
    useState(
      route?.params?.address?.addressLine1 ||
        '',
    );

  const [addressLine2, setAddressLine2] =
    useState(
      route?.params?.address?.addressLine2 ||
        '',
    );

  const [landmark, setLandmark] =
    useState(
      route?.params?.address?.landmark || '',
    );

  const [city, setCity] = useState(
    route?.params?.address?.city || '',
  );

  const [state, setState] = useState(
    route?.params?.address?.state || '',
  );

  const [pincode, setPincode] = useState(
    route?.params?.address?.pincode || '',
  );

  const [isDefault, setIsDefault] =
    useState(
      route?.params?.address?.isDefault ??
        false,
    );

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(isEditing);

  /* =====================================================
     LOAD ADDRESS WHEN EDITING
  ===================================================== */

  useEffect(() => {
    if (!addressId) {
      return;
    }

    loadAddress();
  }, [addressId]);

  const loadAddress = async () => {
    try {
      setLoading(true);

      const data =
        await getDeliveryAddressApi(
          addressId,
        );
        console.log("datatatta",data);
        

      setLabel(
        data?.label ||
          'Construction Site',
      );

      setName(data?.name || '');

      setPhone(data?.phone || '');

      setAddressLine1(
        data?.addressLine1 || '',
      );

      setAddressLine2(
        data?.addressLine2 || '',
      );

      setLandmark(
        data?.landmark || '',
      );

      setCity(data?.city || '');

      setState(data?.state || '');

      setPincode(data?.pincode || '');

      setIsDefault(
        data?.isDefault ?? false,
      );
    } catch (error) {
      console.log(
        'LOAD ADDRESS ERROR:',
        error,
      );

      Alert.alert(
        'Unable to load address',
        error instanceof Error
          ? error.message
          : 'Something went wrong.',
        [
          {
            text: 'Go Back',
            onPress: () =>
              navigation.goBack(),
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validate = () => {
    const newErrors: Record<
      string,
      string
    > = {};

    if (!name.trim()) {
      newErrors.name =
        'Enter recipient name';
    }

    if (!phone.trim()) {
      newErrors.phone =
        'Enter phone number';
    } else if (
      phone.replace(/\D/g, '').length <
      10
    ) {
      newErrors.phone =
        'Enter a valid phone number';
    }

    if (!addressLine1.trim()) {
      newErrors.addressLine1 =
        'Enter your complete address';
    }

    if (!city.trim()) {
      newErrors.city =
        'Enter city';
    }

    if (!state.trim()) {
      newErrors.state =
        'Enter state';
    }

    if (!pincode.trim()) {
      newErrors.pincode =
        'Enter PIN code';
    } else if (
      !/^\d{6}$/.test(
        pincode.trim(),
      )
    ) {
      newErrors.pincode =
        'Enter a valid 6-digit PIN code';
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  /* =====================================================
     SAVE ADDRESS
  ===================================================== */

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        label:
          label.trim() ||
          'Construction Site',

        name: name.trim(),

        phone: phone
          .replace(/\s/g, '')
          .trim(),

        addressLine1:
          addressLine1.trim(),

        addressLine2:
          addressLine2.trim(),

        landmark:
          landmark.trim(),

        city: city.trim(),

        state: state.trim(),

        pincode: pincode.trim(),

        isDefault,
      };

      if (isEditing) {
        await updateDeliveryAddressApi(
          addressId,
          payload,
        );
      } else {
        await createDeliveryAddressApi(
          payload,
        );
      }

      Alert.alert(
        isEditing
          ? 'Address Updated'
          : 'Address Added',

        isEditing
          ? 'Your delivery address has been updated successfully.'
          : 'Your delivery address has been saved successfully.',

        [
          {
            text: 'Done',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      console.log(
        'SAVE ADDRESS ERROR:',
        error,
      );

      Alert.alert(
        'Unable to save address',
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     CURRENT LOCATION
  ===================================================== */

  const handleUseCurrentLocation =
    () => {
      // Temporary static data.
      // Later this can be connected to GPS/Google Maps.

      setAddressLine1(
        'Sector 62, Noida',
      );

      setCity('Noida');

      setState(
        'Uttar Pradesh',
      );

      setPincode('201301');

      setErrors(prev => {
        const updated = {...prev};

        delete updated.addressLine1;
        delete updated.city;
        delete updated.state;
        delete updated.pincode;

        return updated;
      });
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#FF7A00"
        />

        <Text style={styles.loadingText}>
          Loading address...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <SafeAreaView
        style={styles.container}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#0A0A0A"
            />
          </Pressable>

          <View
            style={styles.headerCenter}
          >
            <Text
              style={styles.headerTitle}
            >
              {isEditing
                ? 'Edit Address'
                : 'Add Address'}
            </Text>
          </View>

          <View
            style={styles.headerButton}
          >
            <Ionicons
              name="location-outline"
              size={21}
              color="#FF7A00"
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* HERO */}

          <LinearGradient
            colors={[
              '#0A0A0A',
              '#1C1C1C',
              '#3A2A08',
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.hero}
          >
            <View
              style={styles.heroIcon}
            >
              <Ionicons
                name="location"
                size={25}
                color="#FFD76A"
              />
            </View>

            <View
              style={styles.heroContent}
            >
              <Text
                style={styles.heroTitle}
              >
                Delivery Address
              </Text>

              <Text
                style={styles.heroSubtitle}
              >
                Add your construction site
                location for delivery.
              </Text>
            </View>
          </LinearGradient>

          {/* ADDRESS TYPE */}

          <Text
            style={styles.sectionTitle}
          >
            Address Type
          </Text>

          <View
            style={styles.labelRow}
          >
            {[
              'Construction Site',
              'Home',
              'Office',
            ].map(item => {
              const selected =
                label === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.labelChip,
                    selected &&
                      styles.labelChipActive,
                  ]}
                  onPress={() =>
                    setLabel(item)
                  }
                >
                  <Ionicons
                    name={
                      item ===
                      'Construction Site'
                        ? 'business-outline'
                        : item === 'Home'
                        ? 'home-outline'
                        : 'briefcase-outline'
                    }
                    size={16}
                    color={
                      selected
                        ? '#FF7A00'
                        : '#8C8175'
                    }
                  />

                  <Text
                    style={[
                      styles.labelChipText,
                      selected &&
                        styles.labelChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* RECIPIENT */}

          <View style={styles.card}>
            <View
              style={styles.cardHeader}
            >
              <View
                style={styles.cardIcon}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#FF7A00"
                />
              </View>

              <View>
                <Text
                  style={styles.cardTitle}
                >
                  Recipient Details
                </Text>

                <Text
                  style={styles.cardSubtitle}
                >
                  Who should receive the
                  delivery?
                </Text>
              </View>
            </View>

            <InputField
              label="Full Name"
              value={name}
              onChangeText={text => {
                setName(text);

                setErrors(prev => ({
                  ...prev,
                  name: '',
                }));
              }}
              placeholder="Enter full name"
              error={errors.name}
            />

            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={text => {
                setPhone(text);

                setErrors(prev => ({
                  ...prev,
                  phone: '',
                }));
              }}
              placeholder="+91 XXXXX XXXXX"
              keyboardType="phone-pad"
              error={errors.phone}
            />
          </View>

          {/* SITE ADDRESS */}

          <View style={styles.card}>
            <View
              style={styles.cardHeader}
            >
              <View
                style={styles.cardIcon}
              >
                <Ionicons
                  name="navigate-outline"
                  size={18}
                  color="#FF7A00"
                />
              </View>

              <View
                style={{flex: 1}}
              >
                <Text
                  style={styles.cardTitle}
                >
                  Site Address
                </Text>

                <Text
                  style={styles.cardSubtitle}
                >
                  Provide the complete
                  delivery location
                </Text>
              </View>

              <Pressable
                style={
                  styles.locationButton
                }
                onPress={
                  handleUseCurrentLocation
                }
              >
                <Ionicons
                  name="locate-outline"
                  size={16}
                  color="#FF7A00"
                />

                <Text
                  style={
                    styles.locationButtonText
                  }
                >
                  Current
                </Text>
              </Pressable>
            </View>

            <InputField
              label="Address Line 1"
              value={addressLine1}
              onChangeText={text => {
                setAddressLine1(text);

                setErrors(prev => ({
                  ...prev,
                  addressLine1: '',
                }));
              }}
              placeholder="House / Plot / Building / Sector"
              error={
                errors.addressLine1
              }
            />

            <InputField
              label="Address Line 2"
              value={addressLine2}
              onChangeText={
                setAddressLine2
              }
              placeholder="Street, Road, Area (optional)"
            />

            <InputField
              label="Landmark"
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Nearby landmark (optional)"
            />

            <View style={styles.row}>
              <View
                style={styles.halfInput}
              >
                <InputField
                  label="City"
                  value={city}
                  onChangeText={text => {
                    setCity(text);

                    setErrors(prev => ({
                      ...prev,
                      city: '',
                    }));
                  }}
                  placeholder="City"
                  error={errors.city}
                />
              </View>

              <View
                style={styles.halfInput}
              >
                <InputField
                  label="PIN Code"
                  value={pincode}
                  onChangeText={text => {
                    setPincode(
                      text
                        .replace(
                          /\D/g,
                          '',
                        )
                        .slice(0, 6),
                    );

                    setErrors(prev => ({
                      ...prev,
                      pincode: '',
                    }));
                  }}
                  placeholder="201301"
                  keyboardType="number-pad"
                  error={
                    errors.pincode
                  }
                />
              </View>
            </View>

            <InputField
              label="State"
              value={state}
              onChangeText={text => {
                setState(text);

                setErrors(prev => ({
                  ...prev,
                  state: '',
                }));
              }}
              placeholder="State"
              error={errors.state}
            />
          </View>

          {/* DEFAULT */}

          <Pressable
            style={styles.defaultCard}
            onPress={() =>
              setIsDefault(
                prev => !prev,
              )
            }
          >
            <View
              style={[
                styles.checkbox,
                isDefault &&
                  styles.checkboxActive,
              ]}
            >
              {isDefault && (
                <Ionicons
                  name="checkmark"
                  size={15}
                  color="#FFFFFF"
                />
              )}
            </View>

            <View
              style={styles.defaultContent}
            >
              <Text
                style={styles.defaultTitle}
              >
                Make this my default
                address
              </Text>

              <Text
                style={
                  styles.defaultSubtitle
                }
              >
                Use this address
                automatically for new
                requirements.
              </Text>
            </View>
          </Pressable>

          {/* INFO */}

          <View style={styles.infoCard}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color="#2E9B5B"
            />

            <View
              style={styles.infoContent}
            >
              <Text
                style={styles.infoTitle}
              >
                Safe & Verified Delivery
              </Text>

              <Text
                style={styles.infoText}
              >
                Your address is only shared
                with suppliers after you
                request a quote or place an
                order.
              </Text>
            </View>
          </View>

          <View
            style={{height: 125}}
          />
        </ScrollView>

        {/* BOTTOM */}

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.cancelButton}
            onPress={() =>
              navigation.goBack()
            }
            disabled={saving}
          >
            <Text
              style={styles.cancelText}
            >
              Cancel
            </Text>
          </Pressable>

          <Pressable
            style={styles.saveWrapper}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={[
                '#FF7A00',
                '#FF9F1C',
              ]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.saveButton}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name={
                    isEditing
                      ? 'save-outline'
                      : 'checkmark-circle-outline'
                  }
                  size={20}
                  color="#FFFFFF"
                />
              )}

              <Text
                style={styles.saveText}
              >
                {saving
                  ? 'Saving...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Add Address'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

/* =====================================================
   INPUT
===================================================== */

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  multiline,
}: any) => {
  return (
    <View
      style={styles.inputContainer}
    >
      <Text
        style={styles.inputLabel}
      >
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B4A89C"
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }
        style={[
          styles.input,
          multiline &&
            styles.multilineInput,
          error &&
            styles.inputError,
        ]}
      />

      {error ? (
        <Text
          style={styles.errorText}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default EditDeliveryAddressScreen;

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8EE',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8EE',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#8C8175',
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9F0',
    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: '800',
    color: '#0A0A0A',
  },

  scrollContent: {
    padding: 16,
  },

  hero: {
    minHeight: 118,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,215,106,0.12)',
    borderWidth: 1,
    borderColor:
      'rgba(255,215,106,0.3)',
    marginRight: 14,
    marginLeft: 14,
  },

  heroContent: {
    flex: 1,
    paddingRight: 14,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },

  heroSubtitle: {
    color: '#D7D0C5',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0A0A0A',
    marginBottom: 10,
  },

  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },

  labelChip: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  labelChipActive: {
    backgroundColor: '#FFF0DF',
    borderColor: '#FFB15C',
  },

  labelChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C8175',
  },

  labelChipTextActive: {
    color: '#FF7A00',
    fontWeight: '800',
  },

  card: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1E2D0',
    shadowColor: '#8C5A2B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFF0DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  cardSubtitle: {
    fontSize: 11,
    color: '#8C8175',
    marginTop: 3,
  },

  locationButton: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF0DF',
    borderWidth: 1,
    borderColor: '#FFD2A0',
  },

  locationButtonText: {
    color: '#FF7A00',
    fontSize: 11,
    fontWeight: '800',
  },

  inputContainer: {
    marginBottom: 14,
  },

  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#51483F',
    marginBottom: 7,
  },

  input: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#EADBC9',
    backgroundColor: '#FFFBF5',
    paddingHorizontal: 13,
    color: '#0A0A0A',
    fontSize: 13,
    fontWeight: '500',
  },

  multilineInput: {
    minHeight: 85,
    paddingTop: 13,
  },

  inputError: {
    borderColor: '#E45858',
  },

  errorText: {
    marginTop: 5,
    fontSize: 10,
    color: '#D64545',
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  halfInput: {
    flex: 1,
  },

  defaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#FFF3E5',
    borderWidth: 1,
    borderColor: '#FFD9B0',
    marginBottom: 14,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D7C5B1',
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  checkboxActive: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },

  defaultContent: {
    flex: 1,
  },

  defaultTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0A0A0A',
  },

  defaultSubtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: '#8C8175',
  },

  infoCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 18,
    backgroundColor: '#EFFAF3',
    borderWidth: 1,
    borderColor: '#CFEAD8',
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#217744',
  },

  infoText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: '#5D7766',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 82,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderTopWidth: 1,
    borderTopColor: '#F1E2D0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },

  cancelButton: {
    width: 92,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E5',
    borderWidth: 1,
    borderColor: '#FFD5A6',
  },

  cancelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8C8175',
  },

  saveWrapper: {
    flex: 1,
    marginLeft: 10,
  },

  saveButton: {
    height: 50,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});