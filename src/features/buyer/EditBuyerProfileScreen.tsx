import React, { useEffect, useState } from "react";
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
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons } from '@react-native-vector-icons/ionicons';
// import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

import { getBuyerProfileApi, updateBuyerProfileApi } from "./buyer.api";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormErrors {
  phoneNumber?: string;
  companyName?: string;
  state?: string;
  city?: string;
  pincode?: string;
  completeAddress?: string;
}

const EditBuyerProfileScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  console.log("company---", companyName);
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadProfile();
  }, []);

  // ================================
  // GET EXISTING PROFILE
  // ================================

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await getBuyerProfileApi();
      console.log("fsdfsds", response);

      const profileData = response?.data?.profile;
      setEmail(profileData?.email || "");
      setPhoneNumber(
        profileData?.phoneNumber
          ? profileData.phoneNumber.replace(/^\+91/, "")
          : ""
      );
      setFullName(profileData?.name || "");
      setCompanyName(profileData.companyName || "");
      setState(profileData.state || "");
      setCity(profileData.city || "");
      setPincode(profileData.pincode || "");
      setCompleteAddress(profileData.completeAddress || "");
    } catch (error: any) {
      console.log("GET BUYER PROFILE ERROR:", error);

      Toast.show({
        type: "error",
        text1: "Unable to load profile",
        text2: error?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // VALIDATION
  // ================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const cleanPhone = phoneNumber.replace(/\D/g, "").trim();

    const cleanCompany = companyName.trim();
    const cleanState = state.trim();
    const cleanCity = city.trim();
    const cleanPincode = pincode.trim();
    const cleanAddress = completeAddress.trim();

    // PHONE
    if (!cleanPhone) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (cleanPhone.length !== 10) {
      newErrors.phoneNumber = "Phone number must be 10 digits.";
    }

    // COMPANY
    if (cleanCompany.length > 0 && cleanCompany.length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters.";
    }

    // STATE
    if (!cleanState) {
      newErrors.state = "State is required.";
    } else if (cleanState.length < 2) {
      newErrors.state = "Please enter a valid state.";
    }

    // CITY
    if (!cleanCity) {
      newErrors.city = "City is required.";
    } else if (cleanCity.length < 2) {
      newErrors.city = "Please enter a valid city.";
    }

    // PINCODE
    if (!cleanPincode) {
      newErrors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(cleanPincode)) {
      newErrors.pincode = "Pincode must contain exactly 6 digits.";
    }

    // ADDRESS
    if (!cleanAddress) {
      newErrors.completeAddress = "Complete address is required.";
    } else if (cleanAddress.length < 10) {
      newErrors.completeAddress = "Please enter a complete address.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ================================
  // CLEAR INDIVIDUAL ERROR
  // ================================

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    }
  };

  // ================================
  // SAVE PROFILE
  // ================================

  const handleSave = async () => {
    const isValid = validateForm();

    if (!isValid) {
      Toast.show({
        type: "error",
        text1: "Please check your details",
        text2: "Fix the highlighted fields and try again.",
      });

      return;
    }

    try {
      setSaving(true);

      const cleanPhone = phoneNumber.replace(/\D/g, "").trim();

      const response = await updateBuyerProfileApi({
        name: fullName.trim(),
        phoneNumber: cleanPhone ? `+91${cleanPhone}` : undefined,
        companyName: companyName.trim() || undefined,
        state: state.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        completeAddress: completeAddress.trim(),
      });

      console.log("BUYER PROFILE UPDATED:", response);

      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile has been updated successfully.",
      });

      navigation.goBack();
    } catch (error: any) {
      console.log("UPDATE BUYER PROFILE ERROR:", error);

      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error?.message || "Unable to update your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // LOADING SCREEN
  // ================================

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF7A00" />

        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  // ================================
  // SCREEN
  // ================================

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#FFF3D6", "#FFF8EE", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#0A0A0A" />
            </Pressable>

            <Text style={styles.headerTitle}>Edit Profile</Text>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {/* PROFILE ICON */}

            <View style={styles.profileIcon}>
              <Ionicons name="person" size={34} color="#FF7A00" />
            </View>

            <Text style={styles.title}>Personal & Business Details</Text>

            <Text style={styles.subtitle}>
              Update your information for a better BuildSathi experience.
            </Text>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name</Text>

              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#8C8175" />

                <TextInput
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setErrors((prev) => ({
                      ...prev,
                      fullName: "",
                    }));
                  }}
                  // editable={true}
                  // selectTextOnFocus={false}
                  placeholder="Full name"
                  placeholderTextColor="#A99F95"
                  style={[styles.input, styles.disabledInput]}
                />
              </View>
            </View>

            {/* PHONE */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number *</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={errors.phoneNumber ? "#DC2626" : "#8C8175"}
                />

                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text.replace(/\D/g, "").slice(0, 10));

                    clearError("phoneNumber");
                  }}
                  editable={false}
                  placeholder="Enter 10 digit phone number"
                  placeholderTextColor="#A99F95"
                  keyboardType="number-pad"
                  maxLength={10}
                  style={styles.input}
                />
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color="#A99F95"
                />
              </View>

              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>

            {/* EMAIL */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email Address</Text>

              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#8C8175" />

                <TextInput
                  value={email}
                  editable={false}
                  selectTextOnFocus={false}
                  placeholder="Email address"
                  placeholderTextColor="#A99F95"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, styles.disabledInput]}
                />

                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color="#A99F95"
                />
              </View>

              <Text style={styles.emailHint}>
                Email cannot be changed here.
              </Text>
            </View>

            {/* COMPANY */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Company / Business Name</Text>

              <View
                style={[
                  styles.inputWrapper,
                  errors.companyName && styles.inputError,
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={errors.companyName ? "#DC2626" : "#8C8175"}
                />

                <TextInput
                  value={companyName}
                  onChangeText={(text) => {
                    setCompanyName(text);
                    clearError("companyName");
                  }}
                  placeholder="Enter company name"
                  placeholderTextColor="#A99F95"
                  style={styles.input}
                  maxLength={100}
                />
              </View>

              {errors.companyName && (
                <Text style={styles.errorText}>{errors.companyName}</Text>
              )}
            </View>

            {/* STATE */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>State *</Text>

              <View
                style={[styles.inputWrapper, errors.state && styles.inputError]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={errors.state ? "#DC2626" : "#8C8175"}
                />

                <TextInput
                  value={state}
                  onChangeText={(text) => {
                    setState(text);
                    clearError("state");
                  }}
                  placeholder="Enter state"
                  placeholderTextColor="#A99F95"
                  style={styles.input}
                  maxLength={50}
                />
              </View>

              {errors.state && (
                <Text style={styles.errorText}>{errors.state}</Text>
              )}
            </View>

            {/* CITY */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>City *</Text>

              <View
                style={[styles.inputWrapper, errors.city && styles.inputError]}
              >
                <Ionicons
                  name="navigate-outline"
                  size={20}
                  color={errors.city ? "#DC2626" : "#8C8175"}
                />

                <TextInput
                  value={city}
                  onChangeText={(text) => {
                    setCity(text);
                    clearError("city");
                  }}
                  placeholder="Enter city"
                  placeholderTextColor="#A99F95"
                  style={styles.input}
                  maxLength={50}
                />
              </View>

              {errors.city && (
                <Text style={styles.errorText}>{errors.city}</Text>
              )}
            </View>

            {/* PINCODE */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Pincode *</Text>

              <View
                style={[
                  styles.inputWrapper,
                  errors.pincode && styles.inputError,
                ]}
              >
                <Ionicons
                  name="keypad-outline"
                  size={20}
                  color={errors.pincode ? "#DC2626" : "#8C8175"}
                />

                <TextInput
                  value={pincode}
                  onChangeText={(text) => {
                    setPincode(text.replace(/\D/g, "").slice(0, 6));

                    clearError("pincode");
                  }}
                  placeholder="Enter 6 digit pincode"
                  placeholderTextColor="#A99F95"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                />
              </View>

              {errors.pincode && (
                <Text style={styles.errorText}>{errors.pincode}</Text>
              )}
            </View>

            {/* COMPLETE ADDRESS */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Complete Address *</Text>

              <View
                style={[
                  styles.inputWrapper,
                  styles.addressWrapper,
                  errors.completeAddress && styles.inputError,
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={20}
                  color={errors.completeAddress ? "#DC2626" : "#8C8175"}
                />

                <TextInput
                  value={completeAddress}
                  onChangeText={(text) => {
                    setCompleteAddress(text);
                    clearError("completeAddress");
                  }}
                  placeholder="House / Plot / Street / Area"
                  placeholderTextColor="#A99F95"
                  multiline
                  textAlignVertical="top"
                  maxLength={300}
                  style={[styles.input, styles.addressInput]}
                />
              </View>

              {errors.completeAddress && (
                <Text style={styles.errorText}>{errors.completeAddress}</Text>
              )}
            </View>

            {/* SAVE BUTTON */}

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            >
              <LinearGradient
                colors={["#FF7A00", "#FF9F1C", "#FFC43D"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.saveGradient}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.saveText}>Save Changes</Text>

                    <Ionicons
                      name="checkmark-circle-outline"
                      size={22}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default EditBuyerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    flex: 1,
  },

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  headerSpacer: {
    width: 44,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  profileIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#FFF0DD",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#0A0A0A",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#8C8175",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },

  fieldContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0A0A0A",
    marginBottom: 8,
  },
  keyboardAvoidingView: {
    flex: 1,
  },

  inputWrapper: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    backgroundColor: "#FFFCF7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FFF7F7",
  },

  addressWrapper: {
    alignItems: "flex-start",
    paddingTop: 15,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#0A0A0A",
    marginLeft: 10,
    paddingVertical: 10,
  },

  addressInput: {
    minHeight: 90,
    paddingTop: 0,
  },
  disabledInput: {
    color: "#77706A",
  },

  emailHint: {
    fontSize: 12,
    color: "#A99F95",
    marginTop: 6,
    marginLeft: 4,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 4,
  },

  saveButton: {
    marginTop: 8,
    borderRadius: 18,
    overflow: "hidden",
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveGradient: {
    minHeight: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8EE",
  },

  loaderText: {
    marginTop: 12,
    color: "#8C8175",
    fontSize: 14,
  },
});
