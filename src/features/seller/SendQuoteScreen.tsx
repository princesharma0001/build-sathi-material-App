import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { createQuoteApi } from "./quoteApi";
import { useSubscriptionStore } from "../subscription/subscription.store";

const SendQuoteScreen = ({ navigation, route }: any) => {
  const requirement = route?.params?.requirement;
  const fetchSubscription = useSubscriptionStore(
    (state) => state.fetchSubscription
  );
  const materialName = requirement?.material?.name || "Material";

  const materialIcon = materialName.toLowerCase().includes("sand")
    ? "🏖️"
    : materialName.toLowerCase().includes("aggregate")
    ? "🪨"
    : materialName.toLowerCase().includes("brick")
    ? "🧱"
    : "🧱";

  const quantityNumber = useMemo(() => {
    const parsed = Number(
      String(requirement?.quantity ?? "").replace(/[^0-9.]/g, "")
    );

    return Number.isFinite(parsed) ? parsed : 0;
  }, [requirement?.quantity]);

  const quantityText = `${requirement?.quantity || 0} ${
    requirement?.unit || ""
  }`.trim();

  const location = [
    requirement?.deliveryAddress?.city,
    requirement?.deliveryAddress?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const buyerName = requirement?.buyer?.name || "Buyer";

  const requirementStatus = requirement?.status || "OPEN";

  const deliveryPreference = requirement?.deliveryPreference || "STANDARD";

  const [showSuccess, setShowSuccess] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  const [pricePerUnit, setPricePerUnit] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("3–5 days");
  const [validity, setValidity] = useState("3 days");
  const [message, setMessage] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const priceNumber = Number(pricePerUnit) || 0;
  const deliveryNumber = Number(deliveryCharges) || 0;

  const materialAmount = quantityNumber * priceNumber;

  const totalAmount = materialAmount + deliveryNumber;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const isValid =
    !!requirement?.id &&
    requirementStatus === "OPEN" &&
    pricePerUnit.trim().length > 0 &&
    priceNumber > 0 &&
    acceptedTerms;

  /**
   * -----------------------------
   * SEND QUOTE API
   * -----------------------------
   */

  const getTotalFontSize = (amount: number) => {
    const digits = Math.floor(Math.abs(amount)).toString().length;

    if (digits <= 6) return 19;
    if (digits <= 8) return 17;
    if (digits <= 10) return 15;
    if (digits <= 13) return 13;
    if (digits <= 16) return 11;
    return 9;
  };

  const handleSendQuote = async () => {
    if (!requirement?.id) {
      Toast.show({
        type: "error",
        text1: "Requirement not found",
        text2: "Please open the requirement again.",
      });

      return;
    }

    if (requirementStatus !== "OPEN") {
      Toast.show({
        type: "error",
        text1: "Requirement is not active",
        text2: "This requirement is no longer accepting quotes.",
      });

      return;
    }

    if (!pricePerUnit.trim() || priceNumber <= 0) {
      Toast.show({
        type: "error",
        text1: "Enter valid price",
        text2: "Please enter a price per unit.",
      });

      return;
    }

    if (!acceptedTerms) {
      Toast.show({
        type: "error",
        text1: "Please confirm the terms",
        text2: "Accept the confirmation before sending your quote.",
      });

      return;
    }

    if (sendingQuote) {
      return;
    }

    try {
      setSendingQuote(true);

      /**
       * DO NOT send sellerId.
       *
       * Backend gets sellerId from:
       * req.user.userId
       */

      const payload = {
        requirementId: requirement.id,
        pricePerUnit: priceNumber,
        deliveryCharges: deliveryNumber,
        deliveryTime,
        validity,
        message: message.trim(),
      };

      console.log("CREATE QUOTE PAYLOAD:", payload);

      const response = await createQuoteApi(payload);
      await fetchSubscription();

      console.log("CREATE QUOTE RESPONSE:", response);

      // Toast.show({
      //   type: 'success',
      //   text1: 'Quote sent successfully',
      //   text2: 'Your quotation has been shared with the buyer.',
      // });

      setShowSuccess(true);
    } catch (error: any) {
      console.error("SEND QUOTE ERROR:", error?.response?.data || error);

      const errorCode = error?.response?.data?.code;

      if (errorCode === "QUOTA_EXHAUSTED") {
        setShowQuotaModal(true);
        return;
      }

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send quote. Please try again.";

      Toast.show({
        type: "error",
        text1: "Unable to send quote",
        text2: errorMessage,
      });
    } finally {
      setSendingQuote(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

      <LinearGradient
        colors={["#FFF3D6", "#FFF8EE", "#FFFFFF"]}
        locations={[0, 0.35, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* HEADER */}

            <View style={styles.header}>
              <Pressable
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="chevron-back" size={23} color="#0A0A0A" />
              </Pressable>

              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Send Quote</Text>

                <Text style={styles.headerSubtitle}>
                  #
                  {requirement?.id?.slice?.(0, 8)?.toUpperCase() ||
                    "REQUIREMENT"}
                </Text>
              </View>

              <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* INTRO */}

              <View style={styles.introSection}>
                <Text style={styles.pageTitle}>Create your quotation</Text>

                <Text style={styles.pageSubtitle}>
                  Share your best price and delivery details with the buyer.
                </Text>
              </View>

              {/* REQUIREMENT SUMMARY */}

              <View style={styles.requirementCard}>
                <View style={styles.requirementIcon}>
                  <Text style={styles.requirementEmoji}>{materialIcon}</Text>
                </View>

                <View style={styles.requirementInfo}>
                  <Text style={styles.requirementLabel}>BUYER REQUIREMENT</Text>

                  <Text style={styles.requirementMaterial}>{materialName}</Text>

                  <Text style={styles.requirementQuantity}>
                    {quantityText}
                    {location ? ` · ${location}` : ""}
                  </Text>
                </View>

                <View style={styles.requirementStatus}>
                  <Ionicons
                    name={
                      requirementStatus === "OPEN"
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={15}
                    color={requirementStatus === "OPEN" ? "#D4A017" : "#C2410C"}
                  />

                  <Text style={styles.requirementStatusText}>
                    {requirementStatus}
                  </Text>
                </View>
              </View>

              {/* PRICE SECTION */}

              <View style={styles.section}>
                <View style={styles.sectionHeadingRow}>
                  <Text style={styles.sectionTitle}>Pricing Details</Text>

                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                </View>

                <View style={styles.formCard}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Price per {requirement?.unit || "unit"}
                    </Text>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.currencySymbol}>₹</Text>

                      <TextInput
                        value={pricePerUnit}
                        onChangeText={setPricePerUnit}
                        placeholder="Enter price"
                        placeholderTextColor="#B5A99C"
                        keyboardType="numeric"
                        style={styles.priceInput}
                      />

                      <Text style={styles.inputSuffix}>
                        / {requirement?.unit || "unit"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Delivery Charges</Text>

                    <View style={styles.inputWrapper}>
                      <Text style={styles.currencySymbol}>₹</Text>

                      <TextInput
                        value={deliveryCharges}
                        onChangeText={setDeliveryCharges}
                        placeholder="0"
                        placeholderTextColor="#B5A99C"
                        keyboardType="numeric"
                        style={styles.normalInput}
                      />

                      <Text style={styles.inputSuffix}>Optional</Text>
                    </View>
                  </View>

                  <View style={styles.calculationBox}>
                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>
                        Material Amount
                      </Text>

                      <Text style={styles.calculationValue}>
                        {formatCurrency(materialAmount)}
                      </Text>
                    </View>

                    <View style={styles.calculationRow}>
                      <Text style={styles.calculationLabel}>
                        Delivery Charges
                      </Text>

                      <Text style={styles.calculationValue}>
                        {formatCurrency(deliveryNumber)}
                      </Text>
                    </View>

                    <View style={styles.calculationDivider} />

                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Quote Amount</Text>

                      <Text
                        style={[
                          styles.totalValue,
                          {
                            fontSize: getTotalFontSize(totalAmount),
                          },
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.55}
                      >
                        {formatCurrency(totalAmount)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* DELIVERY SECTION */}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Details</Text>

                <View style={styles.formCard}>
                  <Text style={styles.inputLabel}>Expected Delivery Time</Text>

                  <View style={styles.optionRow}>
                    {["1–2 days", "3–5 days", "5–7 days"].map((option) => {
                      const selected = deliveryTime === option;

                      return (
                        <Pressable
                          key={option}
                          style={[
                            styles.optionChip,
                            selected && styles.optionChipActive,
                          ]}
                          onPress={() => setDeliveryTime(option)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              selected && styles.optionTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.fieldSpacing} />

                  <Text style={styles.inputLabel}>Quote Validity</Text>

                  <View style={styles.optionRow}>
                    {["1 day", "3 days", "7 days"].map((option) => {
                      const selected = validity === option;

                      return (
                        <Pressable
                          key={option}
                          style={[
                            styles.optionChip,
                            selected && styles.optionChipActive,
                          ]}
                          onPress={() => setValidity(option)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              selected && styles.optionTextActive,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* MESSAGE */}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Message to Buyer</Text>

                <View style={styles.messageCard}>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Mention quality, brand, availability, payment terms or any other details..."
                    placeholderTextColor="#B5A99C"
                    multiline
                    textAlignVertical="top"
                    style={styles.messageInput}
                    maxLength={500}
                  />

                  <Text style={styles.characterCount}>
                    {message.length}/500
                  </Text>
                </View>
              </View>

              {/* TERMS */}

              <Pressable
                style={styles.termsRow}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedTerms && styles.checkboxActive,
                  ]}
                >
                  {acceptedTerms && (
                    <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                  )}
                </View>

                <Text style={styles.termsText}>
                  I confirm that the pricing, material availability and delivery
                  details provided in this quote are accurate.
                </Text>
              </Pressable>

              {/* TRUST CARD */}

              <View style={styles.trustCard}>
                <View style={styles.trustIcon}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={21}
                    color="#D4A017"
                  />
                </View>

                <View style={styles.trustContent}>
                  <Text style={styles.trustTitle}>
                    Safe & Transparent Quoting
                  </Text>

                  <Text style={styles.trustText}>
                    Your quote will be shared with the buyer through BuildSathi.
                  </Text>
                </View>
              </View>

              <View style={{ height: 125 }} />
            </ScrollView>

            {/* BOTTOM CTA */}

            <View style={styles.bottomBar}>
              <View style={styles.bottomAmount}>
                <Text style={styles.bottomAmountLabel}>Total Quote</Text>

                <Text style={styles.bottomAmountValue}>
                  {formatCurrency(totalAmount)}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.sendButton,
                  (!isValid || sendingQuote) && styles.sendButtonDisabled,
                ]}
                disabled={!isValid || sendingQuote}
                onPress={handleSendQuote}
              >
                <LinearGradient
                  colors={
                    isValid && !sendingQuote
                      ? ["#FF7A00", "#FF9F1C"]
                      : ["#D8CFC4", "#C8BDB0"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sendGradient}
                >
                  {sendingQuote ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />

                      <Text style={styles.sendButtonText}>Sending...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.sendButtonText}>Send Quote</Text>

                      <Ionicons
                        name="arrow-forward"
                        size={19}
                        color="#FFFFFF"
                      />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </KeyboardAvoidingView>

          {/* SUCCESS MODAL */}

          {showSuccess && (
            <View style={styles.successOverlay}>
              <Pressable
                style={styles.successBackdrop}
                onPress={() => setShowSuccess(false)}
              />

              <View style={styles.successModal}>
                <LinearGradient
                  colors={["#FF7A00", "#FF9F1C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.successIcon}
                >
                  <Ionicons name="checkmark" size={34} color="#FFFFFF" />
                </LinearGradient>

                <Text style={styles.successTitle}>
                  Quote Sent Successfully!
                </Text>

                <Text style={styles.successMessage}>
                  Your quotation has been sent to{" "}
                  <Text style={styles.successBuyer}>{buyerName}</Text>.
                </Text>

                <View style={styles.successSummary}>
                  <View style={styles.successSummaryRow}>
                    <Text style={styles.successSummaryLabel}>Material</Text>

                    <Text style={styles.successSummaryValue}>
                      {materialName}
                    </Text>
                  </View>

                  <View style={styles.successSummaryRow}>
                    <Text style={styles.successSummaryLabel}>Quantity</Text>

                    <Text style={styles.successSummaryValue}>
                      {quantityText}
                    </Text>
                  </View>

                  <View style={styles.successSummaryRow}>
                    <Text style={styles.successSummaryLabel}>Quote Amount</Text>

                    <Text style={styles.successAmount}>
                      {formatCurrency(totalAmount)}
                    </Text>
                  </View>
                </View>

                <View style={styles.successInfo}>
                  <Ionicons
                    name="notifications-outline"
                    size={17}
                    color="#D4A017"
                  />

                  <Text style={styles.successInfoText}>
                    You'll be notified when the buyer responds.
                  </Text>
                </View>

                <Pressable
                  style={styles.successDoneButton}
                  onPress={() => {
                    setShowSuccess(false);
                    navigation.navigate("Seller", {
                      screen: "SellerQuotes",
                    });
                  }}
                >
                  <Text style={styles.successDoneText}>Done</Text>

                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  style={styles.viewQuotesButton}
                  onPress={() => {
                    setShowSuccess(false);
                    navigation.navigate("Seller", {
                      screen: "SellerQuotes",
                    });
                  }}
                >
                  <Text style={styles.viewQuotesText}>View My Quotes</Text>
                </Pressable>
              </View>
            </View>
          )}
          {/* QUOTA EXHAUSTED MODAL */}

          {showQuotaModal && (
            <View style={styles.quotaOverlay}>
              {/* Dark backdrop */}
              <Pressable
                style={styles.quotaBackdrop}
                onPress={() => setShowQuotaModal(false)}
              />

              <View style={styles.quotaModal}>
                {/* Close icon */}
                <Pressable
                  style={styles.quotaCloseButton}
                  onPress={() => setShowQuotaModal(false)}
                  hitSlop={10}
                >
                  <Ionicons name="close" size={22} color="#665D54" />
                </Pressable>

                {/* Icon */}
                <View style={styles.quotaIcon}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={30}
                    color="#FF7A00"
                  />
                </View>

                {/* Title */}
                <Text style={styles.quotaTitle}>Quotation Limit Reached</Text>

                {/* Message */}
                <Text style={styles.quotaMessage}>
                  Your free quotation limit is finished.
                </Text>

                <Text style={styles.quotaSubMessage}>
                  Please upgrade your subscription to continue sending
                  quotations.
                </Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default SendQuoteScreen;

const styles = StyleSheet.create({
  quotaOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  
  quotaBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,10,10,0.55)",
  },
  
  quotaModal: {
    width: "88%",
    maxWidth: 380,
    backgroundColor: "#FFFCF7",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  
    position: "relative",
  },
  
  quotaCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3E5",
  },
  
  quotaIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FFF0DC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
    borderWidth: 1,
    borderColor: "#FFD9AD",
  },
  
  quotaTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0A0A0A",
    textAlign: "center",
    marginBottom: 8,
  },
  
  quotaMessage: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#665D54",
    textAlign: "center",
  },
  
  quotaSubMessage: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#8C8175",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 8,
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 100,
  },

  successBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,10,10,0.48)",
  },

  successModal: {
    backgroundColor: "#FFFCF7",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 15,
  },

  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 5,
  },

  successTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0A0A0A",
    textAlign: "center",
  },

  successMessage: {
    fontSize: 13,
    lineHeight: 16,
    color: "#8C8175",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
  },

  successBuyer: {
    color: "#0A0A0A",
    fontWeight: "900",
  },

  successSummary: {
    width: "100%",
    backgroundColor: "#FFF8E8",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F0DDAF",
    padding: 13,
    marginTop: 19,
  },

  successSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },

  successSummaryLabel: {
    fontSize: 14,
    color: "#8C8175",
    fontWeight: "600",
  },

  successSummaryValue: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "800",
  },

  successAmount: {
    fontSize: 15,
    color: "#FF7A00",
    fontWeight: "900",
  },

  successInfo: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E5",
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginTop: 12,
  },

  successInfoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 14,
    color: "#8C8175",
    fontWeight: "600",
    marginLeft: 8,
  },

  successDoneButton: {
    width: "100%",
    height: 50,
    borderRadius: 15,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 17,
  },

  successDoneText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  viewQuotesButton: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  viewQuotesText: {
    color: "#FF7A00",
    fontSize: 13,
    fontWeight: "900",
  },
  root: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  background: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 7,
  },

  /* HEADER */

  header: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  headerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8C8175",
    marginTop: 2,
  },

  headerPlaceholder: {
    width: 40,
  },

  /* INTRO */

  introSection: {
    marginTop: 8,
    marginBottom: 17,
  },

  pageTitle: {
    fontSize: 25,
    lineHeight: 30,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  pageSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 5,
  },

  /* REQUIREMENT */

  requirementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  requirementIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: "#FFF0DC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  requirementEmoji: {
    fontSize: 25,
  },

  requirementInfo: {
    flex: 1,
  },

  requirementLabel: {
    fontSize: 12,
    color: "#D4A017",
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  requirementMaterial: {
    fontSize: 15,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  requirementQuantity: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 3,
  },

  requirementStatus: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E8",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },

  requirementStatusText: {
    fontSize: 12,
    color: "#B0830D",
    fontWeight: "800",
    marginTop: 2,
  },

  /* SECTIONS */

  section: {
    marginBottom: 23,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 16,
    color: "#0A0A0A",
    fontWeight: "800",
    marginBottom: 11,
  },

  requiredBadge: {
    backgroundColor: "#FFF0E8",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  requiredText: {
    fontSize: 12,
    color: "#EA580C",
    fontWeight: "800",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 14,
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    color: "#665D54",
    fontWeight: "800",
    marginBottom: 8,
  },

  inputWrapper: {
    height: 53,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EBDCCB",
    backgroundColor: "#FFFCF7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  currencySymbol: {
    fontSize: 20,
    color: "#FF7A00",
    fontWeight: "900",
    marginRight: 8,
  },

  priceInput: {
    flex: 1,
    fontSize: 18,
    color: "#0A0A0A",
    fontWeight: "700",
    paddingVertical: 0,
  },

  normalInput: {
    flex: 1,
    fontSize: 17,
    color: "#0A0A0A",
    fontWeight: "800",
    paddingVertical: 0,
  },

  inputSuffix: {
    fontSize: 11,
    color: "#8C8175",
    fontWeight: "700",
  },

  calculationBox: {
    backgroundColor: "#FFF8E8",
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: "#F1DDAA",
  },

  calculationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  calculationLabel: {
    fontSize: 15,
    color: "#8C8175",
    fontWeight: "600",
  },

  calculationValue: {
    fontSize: 13,
    color: "#665D54",
    fontWeight: "800",
  },

  calculationDivider: {
    height: 1,
    backgroundColor: "#EBD7A4",
    marginVertical: 10,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  totalValue: {
    flexShrink: 1,
    maxWidth: "55%",
    color: "#FF7A00",
    fontWeight: "900",
    textAlign: "right",
  },

  /* OPTIONS */

  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  optionChip: {
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#FFF8EE",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  optionChipActive: {
    backgroundColor: "#FFF0DC",
    borderColor: "#FF7A00",
  },

  optionText: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "700",
  },

  optionTextActive: {
    color: "#FF7A00",
    fontWeight: "900",
  },

  fieldSpacing: {
    height: 19,
  },

  /* MESSAGE */

  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 12,
  },

  messageInput: {
    minHeight: 115,
    fontSize: 14,
    lineHeight: 18,
    color: "#0A0A0A",
    fontWeight: "600",
  },

  characterCount: {
    textAlign: "right",
    fontSize: 9,
    color: "#B5A99C",
    fontWeight: "600",
    marginTop: 5,
  },

  /* TERMS */

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 17,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D8C7B5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    marginTop: 1,
  },

  checkboxActive: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },

  termsText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: "#8C8175",
    fontWeight: "600",
  },

  /* TRUST */

  trustCard: {
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F0DDAF",
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  trustIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  trustContent: {
    flex: 1,
  },

  trustTitle: {
    fontSize: 13,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  trustText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 3,
  },

  /* BOTTOM */

  bottomBar: {
    backgroundColor: "#FFFCF7",
    borderTopWidth: 1,
    borderTopColor: "#F1E2D0",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },

  bottomAmount: {
    width: 105,
  },

  bottomAmountLabel: {
    fontSize: 9,
    color: "#8C8175",
    fontWeight: "700",
  },

  bottomAmountValue: {
    fontSize: 17,
    color: "#0A0A0A",
    fontWeight: "900",
    marginTop: 3,
  },

  sendButton: {
    flex: 1,
    height: 53,
    borderRadius: 16,
    overflow: "hidden",
  },

  sendButtonDisabled: {
    opacity: 0.8,
  },

  sendGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  sendButtonText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "900",
  },
});
