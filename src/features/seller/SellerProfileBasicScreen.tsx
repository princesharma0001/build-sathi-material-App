import React, { useState } from "react";
import {
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
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { createSellerBasicProfileApi } from "./seller.api";

const SellerProfileBasicScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [gstRegistered, setGstRegistered] = useState(true);
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const businessTypes = [
    "Manufacturer",
    "Distributor",
    "Wholesaler",
    "Retailer",
    "Contractor",
  ];

  const handleContinue = async () => {
    try {
      if (!ownerName.trim()) {
        Toast.show({
          type: "error",
          text1: "Owner name required",
          text2: "Please enter owner/contact person name.",
        });
        return;
      }

      if (!businessName.trim()) {
        Toast.show({
          type: "error",
          text1: "Business name required",
          text2: "Please enter your company/business name.",
        });
        return;
      }

      if (!businessType) {
        Toast.show({
          type: "error",
          text1: "Business type required",
          text2: "Please select your business type.",
        });
        return;
      }

      if (!phone.trim()) {
        Toast.show({
          type: "error",
          text1: "Phone number required",
          text2: "Please enter your business phone number.",
        });
        return;
      }

      if (gstRegistered && !gstNumber.trim()) {
        Toast.show({
          type: "error",
          text1: "GST number required",
          text2: "Please enter GST number or select No.",
        });
        return;
      }

      setLoading(true);

      const response = await createSellerBasicProfileApi({
        ownerName,
        businessName,
        businessType,
        gstRegistered,
        gstNumber,
        panNumber,
        phone,
        email,
      });

      console.log("✅ SELLER PROFILE RESPONSE:", response);

      Toast.show({
        type: "success",
        text1: "Profile Saved",
        text2: "Your seller business profile has been saved.",
      });

      setTimeout(() => {
        navigation.navigate("Seller");
      }, 800);
    } catch (error: any) {
      console.log(
        "❌ SELLER PROFILE ERROR:",
        error?.response?.data || error?.message
      );

      Toast.show({
        type: "error",
        text1: "Unable to save profile",
        text2:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#FFFDF9", "#FFF8EE", "#FFE8C7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.badge}>SELLER PROFILE</Text>

                <Text style={styles.heading}>Set up your business</Text>

                <Text style={styles.description}>
                  Add your business details to start selling construction
                  materials on BuildSathi.
                </Text>
              </View>

              {/* Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={styles.progressActive} />
                </View>

                <Text style={styles.progressText}>
                  Step 1 of 2 · Business details
                </Text>
              </View>

              {/* Business Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Business Information</Text>

                <Text style={styles.sectionSubtitle}>
                  Tell buyers about your business
                </Text>

                {/* Owner Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Owner / Contact Person</Text>

                  <TextInput
                    value={ownerName}
                    onChangeText={setOwnerName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#A79B8D"
                    style={styles.input}
                  />
                </View>

                {/* Business Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Company / Business Name</Text>

                  <TextInput
                    value={businessName}
                    onChangeText={setBusinessName}
                    placeholder="e.g. Sharma Building Materials"
                    placeholderTextColor="#A79B8D"
                    style={styles.input}
                  />
                </View>

                {/* Business Type */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Business Type</Text>

                  <View style={styles.typeGrid}>
                    {businessTypes.map((type) => {
                      const selected = businessType === type;

                      return (
                        <Pressable
                          key={type}
                          onPress={() => setBusinessType(type)}
                          style={[
                            styles.typeChip,
                            selected && styles.typeChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.typeChipText,
                              selected && styles.typeChipTextSelected,
                            ]}
                          >
                            {type}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* GST Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeaderText}>
                    <Text style={styles.sectionTitle}>GST & Tax Details</Text>

                    <Text style={styles.sectionSubtitle}>
                      Helps us verify your business
                    </Text>
                  </View>

                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>BUSINESS</Text>
                  </View>
                </View>

                {/* GST Registered */}
                <Text style={styles.label}>Are you GST registered?</Text>

                <View style={styles.gstOptions}>
                  <Pressable
                    onPress={() => setGstRegistered(true)}
                    style={[
                      styles.gstOption,
                      gstRegistered && styles.gstOptionSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.radio,
                        gstRegistered && styles.radioSelected,
                      ]}
                    >
                      {gstRegistered && <View style={styles.radioDot} />}
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.gstOptionTitle,
                          gstRegistered && styles.gstOptionTitleSelected,
                        ]}
                      >
                        Yes
                      </Text>

                      <Text style={styles.gstOptionSubtitle}>
                        I have a GSTIN
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setGstRegistered(false);
                      setGstNumber("");
                    }}
                    style={[
                      styles.gstOption,
                      !gstRegistered && styles.gstOptionSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.radio,
                        !gstRegistered && styles.radioSelected,
                      ]}
                    >
                      {!gstRegistered && <View style={styles.radioDot} />}
                    </View>

                    <View>
                      <Text
                        style={[
                          styles.gstOptionTitle,
                          !gstRegistered && styles.gstOptionTitleSelected,
                        ]}
                      >
                        No
                      </Text>

                      <Text style={styles.gstOptionSubtitle}>
                        Not registered
                      </Text>
                    </View>
                  </Pressable>
                </View>

                {/* GST Number */}
                {gstRegistered && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>GST Number</Text>

                    <TextInput
                      value={gstNumber}
                      onChangeText={(text) =>
                        setGstNumber(text.toUpperCase().replace(/\s/g, ""))
                      }
                      placeholder="e.g. 09ABCDE1234F1Z5"
                      placeholderTextColor="#A79B8D"
                      autoCapitalize="characters"
                      maxLength={15}
                      style={styles.input}
                    />

                    <Text style={styles.helperText}>
                      Your GSTIN will be used for business verification.
                    </Text>
                  </View>
                )}

                {/* PAN */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PAN Number</Text>

                  <TextInput
                    value={panNumber}
                    onChangeText={(text) =>
                      setPanNumber(text.toUpperCase().replace(/\s/g, ""))
                    }
                    placeholder="e.g. ABCDE1234F"
                    placeholderTextColor="#A79B8D"
                    autoCapitalize="characters"
                    maxLength={10}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Contact */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Details</Text>

                <Text style={styles.sectionSubtitle}>
                  How buyers and BuildSathi can reach you
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Business Phone</Text>

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

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Business Email
                    <Text style={styles.optional}> Optional</Text>
                  </Text>

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

              {/* Trust Card */}
              <View style={styles.trustCard}>
                <View style={styles.trustIcon}>
                  <Text style={styles.trustEmoji}>🛡️</Text>
                </View>

                <View style={styles.trustContent}>
                  <Text style={styles.trustTitle}>
                    Your information is secure
                  </Text>

                  <Text style={styles.trustText}>
                    Business details are used for verification and your
                    BuildSathi seller profile.
                  </Text>
                </View>
              </View>

              {/* Continue */}
              <Pressable
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={handleContinue}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Saving..." : "Continue"}
                </Text>

                {!loading && <Text style={styles.buttonArrow}>→</Text>}
              </Pressable>

              <Text style={styles.bottomNote}>
                You can update these details later from your business profile.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SellerProfileBasicScreen;

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
    paddingHorizontal: 22,
    paddingTop: 12,
  },

  header: {
    marginBottom: 20,
  },

  badge: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FF7A00",
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: "#8C8175",
    marginTop: 7,
    maxWidth: 340,
  },

  progressContainer: {
    marginBottom: 24,
  },

  progressTrack: {
    height: 5,
    borderRadius: 5,
    backgroundColor: "#F0DDC6",
    overflow: "hidden",
  },

  progressActive: {
    width: "50%",
    height: "100%",
    backgroundColor: "#FF7A00",
    borderRadius: 5,
  },

  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8C8175",
    marginTop: 7,
  },

  section: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 17,
    marginBottom: 15,

    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 9,
    elevation: 2,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#8C8175",
    marginTop: 3,
    marginBottom: 17,
  },

  verifiedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#FFF0DF",
  },

  verifiedBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#D97706",
    letterSpacing: 0.6,
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#3A3128",
    marginBottom: 7,
  },

  optional: {
    fontSize: 9,
    fontWeight: "600",
    color: "#A79B8D",
  },

  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBDCCB",
    backgroundColor: "#FFFCF8",
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#0A0A0A",
  },

  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EBDCCB",
    backgroundColor: "#FFFCF8",
  },

  typeChipSelected: {
    backgroundColor: "#FFF0DF",
    borderColor: "#FF7A00",
  },

  typeChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6F655B",
  },

  typeChipTextSelected: {
    color: "#E65F00",
    fontWeight: "900",
  },

  gstOptions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 17,
  },

  gstOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBDCCB",
    backgroundColor: "#FFFCF8",
  },

  gstOptionSelected: {
    borderColor: "#FF7A00",
    backgroundColor: "#FFF5E8",
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D8CFC4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  radioSelected: {
    borderColor: "#FF7A00",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF7A00",
  },

  gstOptionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#3A3128",
  },

  gstOptionTitleSelected: {
    color: "#E65F00",
  },

  gstOptionSubtitle: {
    fontSize: 11,
    color: "#8C8175",
    marginTop: 2,
  },

  helperText: {
    fontSize: 9,
    color: "#9A8E82",
    marginTop: 6,
    lineHeight: 14,
  },

  trustCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFF4DE",
    borderWidth: 1,
    borderColor: "#F3D7A4",
    marginBottom: 16,
  },

  trustIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFE6B5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  trustEmoji: {
    fontSize: 21,
  },

  trustContent: {
    flex: 1,
  },

  trustTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#5B421C",
  },

  trustText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#8C7046",
    marginTop: 3,
  },

  button: {
    height: 55,
    borderRadius: 16,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    marginLeft: 10,
    marginTop: -2,
  },

  bottomNote: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 14,
    color: "#9A8E82",
    marginTop: 11,
    paddingHorizontal: 20,
  },
});
