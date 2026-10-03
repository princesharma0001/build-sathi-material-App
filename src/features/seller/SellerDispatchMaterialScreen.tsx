import React, { useState } from "react";
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
import Ionicons from "react-native-vector-icons/Ionicons";

import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../config/api";
import { dispatchMaterial } from "./seller.api";
import Toast from "react-native-toast-message";

const SellerDispatchMaterialScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { quoteId } = route.params;

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDispatch = async () => {
    setError("");

    if (!driverName.trim()) {
      Toast.show({
        type: "error",
        text1: "Driver Name Required",
        text2: "Please enter driver name.",
      });
      return;
    }

    if (!driverPhone.trim()) {
      Toast.show({
        type: "error",
        text1: "Driver Contact Required",
        text2: "Please enter driver contact number.",
      });
      return;
    }

    if (driverPhone.replace(/\D/g, "").length !== 10) {
      Toast.show({
        type: "error",
        text1: "Invalid Contact Number",
        text2: "Please enter a valid 10 digit driver contact.",
      });
      return;
    }

    if (!vehicleNumber.trim()) {
      Toast.show({
        type: "error",
        text1: "Vehicle Number Required",
        text2: "Please enter vehicle number.",
      });
      return;
    }

    try {
      setLoading(true);

      const result = await dispatchMaterial({
        quoteId,
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate).toISOString()
          : undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
      });

      Toast.show({
        type: "success",
        text1: "Material Dispatched",
        text2: result?.message || "Order created successfully.",
      });

      setTimeout(() => {
        navigation.navigate("Seller", {
          screen: "SellerOrders",
        });
      }, 1200);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Dispatch Failed",
        text2: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient colors={["#FFF7ED", "#FFFFFF"]} style={styles.background}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color="#172554" />
            </Pressable>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Dispatch Material</Text>

              <Text style={styles.headerSubtitle}>Add delivery details</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* INFO CARD */}
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="cube-outline" size={24} color="#FF7A00" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Ready to dispatch?</Text>

                <Text style={styles.infoText}>
                  Enter the driver and vehicle details. An order will be created
                  after submission.
                </Text>
              </View>
            </View>

            {/* DRIVER DETAILS */}
            <Text style={styles.sectionTitle}>Driver Details</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Driver Name *</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={19} color="#8C8175" />

                <TextInput
                  style={styles.input}
                  placeholder="Enter driver name"
                  placeholderTextColor="#A69B90"
                  value={driverName}
                  onChangeText={setDriverName}
                />
              </View>

              <Text style={styles.label}>Driver Contact *</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={19} color="#8C8175" />

                <TextInput
                  style={styles.input}
                  placeholder="Enter 10 digit mobile number"
                  placeholderTextColor="#A69B90"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={driverPhone}
                  onChangeText={setDriverPhone}
                />
              </View>
            </View>

            {/* VEHICLE DETAILS */}
            <Text style={styles.sectionTitle}>Vehicle Details</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Vehicle Number *</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="car-outline" size={19} color="#8C8175" />

                <TextInput
                  style={styles.input}
                  placeholder="e.g. UP16AB1234"
                  placeholderTextColor="#A69B90"
                  autoCapitalize="characters"
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                />
              </View>
            </View>

            {/* DELIVERY DETAILS */}
            <Text style={styles.sectionTitle}>Delivery Details</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Expected Delivery Date</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={19} color="#8C8175" />

                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#A69B90"
                  value={expectedDeliveryDate}
                  onChangeText={setExpectedDeliveryDate}
                />
              </View>

              <Text style={styles.label}>Delivery Notes</Text>

              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color="#8C8175"
                  style={{ marginTop: 3 }}
                />

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any special delivery instructions..."
                  placeholderTextColor="#A69B90"
                  multiline
                  textAlignVertical="top"
                  value={deliveryNotes}
                  onChangeText={setDeliveryNotes}
                />
              </View>
            </View>

            {/* ERROR */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color="#DC2626"
                />

                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* SUBMIT */}
            <Pressable
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleDispatch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#FFFFFF" />

                  <Text style={styles.submitButtonText}>
                    Dispatch & Create Order
                  </Text>
                </>
              )}
            </Pressable>

            <Text style={styles.bottomNote}>
              Please verify driver and vehicle details before submitting.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SellerDispatchMaterialScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },

  background: {
    flex: 1,
  },

  header: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1E8DE",
    backgroundColor: "transparent",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E8DE",
  },

  headerTextContainer: {
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172554",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#8C8175",
    marginTop: 2,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFF3E0",
    borderWidth: 1,
    borderColor: "#FFE0B2",
    marginBottom: 24,
  },

  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 13,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#172554",
    marginBottom: 4,
  },

  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#7C6F63",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172554",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#F0E6DB",
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#51483F",
    marginBottom: 7,
  },

  inputContainer: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: "#FAF8F5",
    borderWidth: 1,
    borderColor: "#EDE4DA",
    marginBottom: 16,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#172554",
    marginLeft: 10,
    paddingVertical: 12,
  },

  textAreaContainer: {
    alignItems: "flex-start",
    minHeight: 100,
  },

  textArea: {
    minHeight: 80,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 15,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#DC2626",
    marginLeft: 8,
  },

  submitButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 4,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginLeft: 9,
  },

  bottomNote: {
    fontSize: 11,
    color: "#9A8F84",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 17,
  },
});
