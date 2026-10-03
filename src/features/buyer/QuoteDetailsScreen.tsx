import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { acceptBuyerQuoteApi, getBuyerQuoteByIdApi } from "../seller/quoteApi";
import Toast from "react-native-toast-message";

const QuoteDetailsScreen = ({ navigation, route }: any) => {
  const quoteId = route?.params?.quoteId;
  const [isAccepting, setIsAccepting] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuoteDetails();
  }, [quoteId]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      setError("");

      if (!quoteId) {
        throw new Error("Quote ID is missing");
      }

      const response = await getBuyerQuoteByIdApi(quoteId);

      console.log(
        "BUYER QUOTE DETAILS RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const quoteData = response?.data?.quote;

      if (!quoteData) {
        throw new Error("Quote details not found");
      }

      setQuote(quoteData);
    } catch (error: any) {
      console.error("BUYER QUOTE DETAILS ERROR:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load quote details"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7A00" />

          <Text style={styles.loadingText}>Loading quote details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !quote) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={32} color="#FF7A00" />
          </View>

          <Text style={styles.errorTitle}>Unable to load quote</Text>

          <Text style={styles.errorText}>
            {error || "Quote details not available"}
          </Text>

          <Pressable style={styles.retryButton} onPress={fetchQuoteDetails}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================================================
     SELLER DETAILS
  ========================================================= */

  const seller = quote?.seller || {};
  console.log("dfsgsfg", seller);

  const sellerName = seller?.name || "Supplier";

  const sellerEmail = seller?.email || "Email not available";

  const sellerPhone = seller?.sellerProfile?.phone || "Phone not available";

  const sellerRole = seller?.role || "SELLER";

  const initials = sellerName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item: string) => item.charAt(0).toUpperCase())
    .join("");

  /* =========================================================
     REQUIREMENT
  ========================================================= */

  const requirement = quote?.requirement || {};

  const material = requirement?.material || {};

  const category = material?.category || {};

  const materialName = material?.name || "Material";

  const materialDescription =
    material?.description || "No material description available.";

  const materialUnit = material?.unit || "";

  const quantity = `${requirement?.quantity || 0} ${
    requirement?.unit || ""
  }`.trim();

  const buyerNotes = requirement?.notes || "No additional notes provided.";

  const deliveryPreference = requirement?.deliveryPreference || "STANDARD";

  /* =========================================================
     DELIVERY ADDRESS
  ========================================================= */

  const address = requirement?.deliveryAddress || {};

  const city = address?.city || "";

  const state = address?.state || "";

  const pincode = address?.pincode || "";

  const addressLine1 = address?.addressLine1 || "";

  const addressLine2 = address?.addressLine2 || "";

  const landmark = address?.landmark || "";

  const location =
    [city, state].filter(Boolean).join(", ") || "Location not available";

  const fullAddress = [
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pincode,
  ]
    .filter(Boolean)
    .join(", ");

  /* =========================================================
     QUOTE PRICE
  ========================================================= */

  const totalAmount = Number(quote?.totalAmount || 0);

  const pricePerUnit = Number(quote?.pricePerUnit || 0);

  const materialAmount = Number(quote?.materialAmount || 0);

  const deliveryCharges = Number(quote?.deliveryCharges || 0);

  const formatCurrency = (amount: number | string | null | undefined) => {
    const value = Number(amount ?? 0);

    if (!Number.isFinite(value)) {
      return "₹0";
    }

    return `₹${value.toLocaleString("en-IN")}`;
  };

  /* =========================================================
     DELIVERY / VALIDITY
  ========================================================= */

  const deliveryTime = quote?.deliveryTime || "Not specified";

  const validity = quote?.validity || "Not specified";

  const deliveryChargeText =
    deliveryCharges === 0 ? "FREE" : formatCurrency(deliveryCharges);

  /* =========================================================
     MESSAGE
  ========================================================= */

  const message = quote?.message || "No message added by supplier.";

  /* =========================================================
     STATUS
  ========================================================= */

  const status = quote?.status || "PENDING";

  const statusLabel =
    status === "PENDING"
      ? "New"
      : status === "ACCEPTED"
      ? "Accepted"
      : status === "REJECTED"
      ? "Rejected"
      : status === "EXPIRED"
      ? "Expired"
      : status;

  const isPending = status === "PENDING";

  /* =========================================================
     TIME AGO
  ========================================================= */

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) {
      return "Recently";
    }

    const created = new Date(dateString).getTime();

    const now = Date.now();

    const diffMinutes = Math.floor((now - created) / 60000);

    if (diffMinutes < 1) {
      return "Just now";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };
  const handleCall = async () => {
    if (!sellerPhone) {
      Alert.alert("Phone number unavailable");
      return;
    }

    const phoneNumber = sellerPhone.replace(/\s/g, "");
    const phoneUrl = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);

      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          "Unable to make call",
          "Phone calling is not available on this device."
        );
      }
    } catch (error) {
      console.log("Call error:", error);

      Alert.alert(
        "Unable to make call",
        "Something went wrong while opening the phone app."
      );
    }
  };
  const handleAcceptQuote = async () => {
    if (!quote?.id) {
      Toast.show({
        type: "error",
        text1: "Quote not found",
        text2: "Unable to accept this quotation.",
      });
      return;
    }

    try {
      setIsAccepting(true);

      const response = await acceptBuyerQuoteApi(quote.id);

      console.log("ACCEPT QUOTE RESPONSE:", JSON.stringify(response, null, 2));

      Toast.show({
        type: "success",
        text1: "Quotation Accepted",
        text2: "The supplier quotation has been accepted successfully.",
      });

      // Update local UI immediately
      setQuote((prev: any) =>
        prev
          ? {
              ...prev,
              status: "ACCEPTED",
            }
          : prev
      );
    } catch (error: any) {
      console.error("ACCEPT QUOTE ERROR:", error?.response?.data || error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to accept quotation";

      Toast.show({
        type: "error",
        text1: "Unable to Accept",
        text2: message,
      });
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={21} color="#0A0A0A" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Quote Details</Text>
        </View>

        <View style={styles.headerButtonPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =================================================
            SELLER HERO
        ================================================= */}

        <LinearGradient
          colors={["#0A0A0A", "#1B1B1B", "#332507"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.supplierHero}
        >
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "S"}</Text>
            </View>

            <View style={styles.heroSupplierInfo}>
              <View style={styles.supplierNameRow}>
                <Text style={styles.supplierName} numberOfLines={2}>
                  {sellerName}
                </Text>

                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={11} color="#0A0A0A" />
                </View>
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#FFD76A" />

                <Text style={styles.supplierLocation} numberOfLines={2}>
                  {location}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sellerHeroBottom}>
            <View style={styles.heroInfoItem}>
              <Ionicons name="business-outline" size={14} color="#FFD76A" />

              <Text style={styles.heroInfoText}>{sellerRole}</Text>
            </View>

            <View style={styles.heroInfoItem}>
              <Ionicons name="shield-checkmark" size={14} color="#FFD76A" />

              <Text style={styles.heroInfoText}>Supplier</Text>
            </View>
          </View>
        </LinearGradient>

        {/* =================================================
            STATUS
        ================================================= */}

        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>{statusLabel} Quote</Text>
          </View>

          <Text style={styles.updatedText}>
            Received {getTimeAgo(quote?.createdAt)}
          </Text>
        </View>

        {/* =================================================
            SELLER DETAILS
        ================================================= */}

        <Text style={styles.sectionTitle}>Seller Details</Text>

        <View style={styles.sellerDetailsCard}>
          <View style={styles.sellerDetailRow}>
            <View style={styles.sellerDetailIcon}>
              <Ionicons name="person-outline" size={19} color="#FF7A00" />
            </View>

            <View style={styles.sellerDetailContent}>
              <Text style={styles.detailLabel}>Seller Name</Text>

              <Text style={styles.detailValue}>{sellerName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.sellerDetailRow}>
            <View style={styles.sellerDetailIcon}>
              <Ionicons name="mail-outline" size={19} color="#FF7A00" />
            </View>

            <View style={styles.sellerDetailContent}>
              <Text style={styles.detailLabel}>Email</Text>

              <Text style={styles.detailValue} numberOfLines={2}>
                {sellerEmail}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          {statusLabel === "Accepted" && (
            <View style={styles.sellerDetailRow}>
              <View style={styles.sellerDetailIcon}>
                <Ionicons name="call-outline" size={19} color="#FF7A00" />
              </View>

              <View style={styles.sellerDetailContent}>
                <Text style={styles.detailLabel}>Phone</Text>

                <Text style={styles.detailValue}>{sellerPhone}</Text>
              </View>
            </View>
          )}
          <View style={styles.divider} />

          <View style={styles.sellerDetailRow}>
            <View style={styles.sellerDetailIcon}>
              <Ionicons name="business-outline" size={19} color="#FF7A00" />
            </View>

            <View style={styles.sellerDetailContent}>
              <Text style={styles.detailLabel}>Seller Type</Text>

              <Text style={styles.detailValue}>{sellerRole}</Text>
            </View>
          </View>
        </View>

        {/* =================================================
            YOUR REQUIREMENT
        ================================================= */}

        <Text style={styles.sectionTitle}>Your Requirement</Text>

        <View style={styles.card}>
          <View style={styles.materialIcon}>
            <Ionicons name="cube-outline" size={25} color="#FF7A00" />
          </View>

          <View style={styles.materialInfo}>
            <Text style={styles.materialName} numberOfLines={2}>
              {materialName}
            </Text>

            <Text style={styles.categoryText}>
              {category?.name || "Construction Material"}
            </Text>

            <Text style={styles.materialSub}>Quantity requested</Text>

            <Text style={styles.quantity}>{quantity}</Text>
          </View>
        </View>

        {/* MATERIAL DESCRIPTION */}

        <View style={styles.descriptionCard}>
          <View style={styles.descriptionHeader}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#FF7A00"
            />

            <Text style={styles.descriptionTitle}>Material Details</Text>
          </View>

          <Text style={styles.descriptionText}>{materialDescription}</Text>

          {!!materialUnit && (
            <View style={styles.unitRow}>
              <Text style={styles.unitLabel}>Material Unit</Text>

              <Text style={styles.unitValue}>{materialUnit}</Text>
            </View>
          )}
        </View>

        {/* =================================================
            BUYER NOTES
        ================================================= */}

        <Text style={styles.sectionTitle}>Your Notes</Text>

        <View style={styles.notesCard}>
          <View style={styles.notesIcon}>
            <Ionicons name="document-text-outline" size={19} color="#FF7A00" />
          </View>

          <Text style={styles.notesText}>{buyerNotes}</Text>
        </View>

        {/* =================================================
            QUOTE PRICE
        ================================================= */}

        {/* =================================================
    QUOTE PRICE
================================================= */}

        <Text style={styles.sectionTitle}>Quote Price</Text>

        <View style={styles.priceCard}>
          {/* Price Per Unit */}
          <View style={styles.priceRow}>
            <View style={styles.priceRowLeft}>
              <View style={styles.priceSmallIcon}>
                <Ionicons name="pricetag-outline" size={16} color="#FF7A00" />
              </View>

              <View>
                <Text style={styles.priceRowLabel}>Price per unit</Text>

                <Text style={styles.priceRowSub}>
                  {quote?.requirement?.unit || "Unit"}
                </Text>
              </View>
            </View>

            <Text style={styles.priceRowValue}>
              {formatCurrency(pricePerUnit)}
            </Text>
          </View>

          <View style={styles.priceDivider} />

          {/* Material Amount */}
          <View style={styles.priceRow}>
            <View style={styles.priceRowLeft}>
              <View style={styles.priceSmallIcon}>
                <Ionicons name="cube-outline" size={16} color="#FF7A00" />
              </View>

              <View>
                <Text style={styles.priceRowLabel}>Material amount</Text>

                <Text style={styles.priceRowSub}>{quantity}</Text>
              </View>
            </View>

            <Text style={styles.priceRowValue}>
              {formatCurrency(materialAmount)}
            </Text>
          </View>

          <View style={styles.priceDivider} />

          {/* Delivery Charges */}
          <View style={styles.priceRow}>
            <View style={styles.priceRowLeft}>
              <View style={styles.priceSmallIcon}>
                <Ionicons name="car-outline" size={16} color="#FF7A00" />
              </View>

              <View>
                <Text style={styles.priceRowLabel}>Delivery charges</Text>

                <Text style={styles.priceRowSub}>
                  Delivery to {city || "your location"}
                </Text>
              </View>
            </View>

            <Text
              style={
                deliveryCharges === 0
                  ? styles.freePriceValue
                  : styles.priceRowValue
              }
            >
              {deliveryCharges === 0 ? "FREE" : formatCurrency(deliveryCharges)}
            </Text>
          </View>

          {/* Total */}
          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <View style={styles.totalLeft}>
              <Text style={styles.totalLabel}>Total Quote</Text>

              <Text style={styles.totalSubText}>Final quoted amount</Text>
            </View>

            <Text style={styles.totalPrice}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* =================================================
            DELIVERY DETAILS
        ================================================= */}

        <Text style={styles.sectionTitle}>Delivery Details</Text>

        <View style={styles.detailsCard}>
          {/* Delivery Time */}

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color="#FF7A00" />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Estimated Delivery</Text>

              <Text style={styles.detailValue}>{deliveryTime}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Validity */}

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color="#FF7A00" />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Quote Validity</Text>

              <Text style={styles.detailValue}>{validity}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Delivery Preference */}

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="flash-outline" size={20} color="#FF7A00" />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Delivery Preference</Text>

              <Text style={styles.detailValue}>{deliveryPreference}</Text>
            </View>
          </View>
        </View>

        {/* =================================================
            COMPLETE DELIVERY ADDRESS
        ================================================= */}

        <Text style={styles.sectionTitle}>Delivery Address</Text>

        <View style={styles.addressCard}>
          <View style={styles.addressTop}>
            <View style={styles.addressIcon}>
              <Ionicons name="location" size={21} color="#FF7A00" />
            </View>

            <View style={styles.addressHeading}>
              <Text style={styles.addressTitle}>Delivering To</Text>

              <Text style={styles.addressLocation}>{location}</Text>
            </View>
          </View>

          <View style={styles.addressDivider} />

          {!!addressLine1 && (
            <View style={styles.addressLineRow}>
              <Text style={styles.addressLineLabel}>Address</Text>

              <Text style={styles.addressLineValue}>{addressLine1}</Text>
            </View>
          )}

          {!!addressLine2 && (
            <View style={styles.addressLineRow}>
              <Text style={styles.addressLineLabel}>Address 2</Text>

              <Text style={styles.addressLineValue}>{addressLine2}</Text>
            </View>
          )}

          {!!landmark && (
            <View style={styles.addressLineRow}>
              <Text style={styles.addressLineLabel}>Landmark</Text>

              <Text style={styles.addressLineValue}>{landmark}</Text>
            </View>
          )}

          <View style={styles.addressLineRow}>
            <Text style={styles.addressLineLabel}>City</Text>

            <Text style={styles.addressLineValue}>{city || "—"}</Text>
          </View>

          <View style={styles.addressLineRow}>
            <Text style={styles.addressLineLabel}>State</Text>

            <Text style={styles.addressLineValue}>{state || "—"}</Text>
          </View>

          <View style={styles.addressLineRow}>
            <Text style={styles.addressLineLabel}>Pincode</Text>

            <Text style={styles.addressLineValue}>{pincode || "—"}</Text>
          </View>
        </View>

        {/* =================================================
            SUPPLIER MESSAGE
        ================================================= */}

        <Text style={styles.sectionTitle}>Supplier Message</Text>

        <View style={styles.messageCard}>
          <View style={styles.quoteIcon}>
            <Ionicons name="chatbubble-ellipses" size={18} color="#FF7A00" />
          </View>

          <View style={styles.messageContent}>
            <Text style={styles.messageFrom}>Message from {sellerName}</Text>

            <Text style={styles.messageText}>“{message}”</Text>
          </View>
        </View>

        {/* =================================================
            BUYER PROTECTION
        ================================================= */}

        <LinearGradient
          colors={["#FFF3D6", "#FFF9EF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.trustCard}
        >
          <View style={styles.trustIcon}>
            <Ionicons name="shield-checkmark" size={22} color="#D4A017" />
          </View>

          <View style={styles.trustContent}>
            <Text style={styles.trustTitle}>BuildSathi Buyer Protection</Text>

            <Text style={styles.trustText}>
              Review the seller, pricing, delivery details and message before
              accepting this quotation.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* =====================================================
          FIXED BOTTOM BAR
      ===================================================== */}

      <View style={styles.bottomBar}>
        {statusLabel === "Accepted" ? (
          <View style={styles.acceptedContainer}>
            {/* Success Header */}
            <View style={styles.acceptedHeader}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={28} color="#16A34A" />
              </View>

              <View style={styles.acceptedTextContainer}>
                <Text style={styles.acceptedTitle}>Quotation Accepted</Text>

                <Text style={styles.acceptedSubtitle}>
                  You can now contact the supplier
                </Text>
              </View>
            </View>

            {/* Call Supplier */}
            {sellerPhone && (
              <Pressable
                style={({ pressed }) => [
                  styles.callButton,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={handleCall}
              >
                <View style={styles.callIconContainer}>
                  <Ionicons name="call" size={21} color="#FFFFFF" />
                </View>

                <View style={styles.callInfo}>
                  <Text style={styles.callLabel}>Call Supplier</Text>

                  <Text style={styles.phoneText}>{sellerPhone}</Text>
                </View>

                <View style={styles.callArrow}>
                  <Ionicons name="chevron-forward" size={20} color="#16A34A" />
                </View>
              </Pressable>
            )}
          </View>
        ) : (
          <Pressable
            disabled={isAccepting || quote?.status !== "PENDING"}
            style={[
              styles.acceptButtonWrapper,
              !isPending && {
                opacity: 0.5,
              },
            ]}
            onPress={handleAcceptQuote}
          >
            <LinearGradient
              colors={["#FF7A00", "#FF9F1C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.acceptButton}
            >
              {isAccepting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={
                      quote?.status === "REJECTED"
                        ? "close-circle-outline"
                        : "checkmark-circle-outline"
                    }
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text style={styles.acceptText}>
                    {quote?.status === "REJECTED"
                      ? "Quotation Rejected"
                      : "Accept Quote"}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};
export default QuoteDetailsScreen;

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  /* ================= HEADER ================= */
  sellerHeroBottom: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  heroInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroInfoText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: "800",
    color: "#FFD76A",
  },
  callButton: {
    marginTop: 12,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    flexDirection: "row",
    alignItems: "center",
  },

  callInfo: {
    flex: 1,
    marginLeft: 12,
  },

  callLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 3,
  },

  phoneText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
  },

  sellerDetailsCard: {
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  sellerDetailRow: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  sellerDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 12,
    flexShrink: 0,
  },

  sellerDetailContent: {
    flex: 1,
    minWidth: 0,
  },

  categoryText: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: "#FF7A00",
  },

  descriptionCard: {
    marginTop: 10,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  descriptionTitle: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: "800",
    color: "#17120D",
  },

  descriptionText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: "#665C51",
  },

  unitRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F4E9DD",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  unitLabel: {
    fontSize: 12,
    color: "#9A8F83",
  },

  unitValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17120D",
  },

  notesCard: {
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  notesIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 11,
  },

  notesText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#665C51",
  },

  priceDivider: {
    height: 1,
    backgroundColor: "#F4E9DD",
  },

  totalDivider: {
    marginTop: 8,
    marginBottom: 10,
    height: 1,
    backgroundColor: "#EBDCCB",
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  totalSubText: {
    marginTop: 2,
    fontSize: 9,
    color: "#9A8F83",
  },

  addressCard: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  addressTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
  },

  addressHeading: {
    flex: 1,
    marginLeft: 11,
  },

  addressTitle: {
    fontSize: 11,
    color: "#9A8F83",
  },

  addressLocation: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
    color: "#17120D",
  },

  addressDivider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#F4E9DD",
  },

  addressLineRow: {
    marginBottom: 11,
  },

  addressLineLabel: {
    fontSize: 14,
    color: "#9A8F83",
  },

  addressLineValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
    color: "#17120D",
  },

  messageContent: {
    flex: 1,
    minWidth: 0,
  },

  messageFrom: {
    marginBottom: 6,
    fontSize: 11,
    fontWeight: "900",
    color: "#17120D",
  },

  quoteInfoCard: {
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  quoteInfoRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  quoteInfoLabel: {
    fontSize: 11,
    color: "#9A8F83",
  },

  quoteInfoValue: {
    flex: 1,
    marginLeft: 20,
    fontSize: 10,
    fontWeight: "700",
    color: "#17120D",
    textAlign: "right",
  },

  quoteStatusValue: {
    fontSize: 11,
    fontWeight: "900",
    color: "#16803C",
  },

  header: {
    // minHeight: 88,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: '#FFF3D6',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#FF7A00",
  },

  headerTitle: {
    // marginTop: 2,
    fontSize: 18,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  /* ================= SCROLL ================= */

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  /* ================= SUPPLIER HERO ================= */

  supplierHero: {
    borderRadius: 24,
    // padding: 19,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 7,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7A00",
    borderWidth: 2,
    borderColor: "#FFD76A",
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 19,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroSupplierInfo: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },

  supplierNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  supplierName: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD76A",
    flexShrink: 0,
  },

  locationRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  supplierLocation: {
    flex: 1,
    marginLeft: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#E7DED2",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#8C8175",
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  errorText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "#8C8175",
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FF7A00",
  },

  retryText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  headerButtonPlaceholder: {
    width: 42,
    height: 42,
  },

  addressText: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: "#8C8175",
  },

  /* ================= RATING ================= */

  ratingRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  ratingBox: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  ratingText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  reviewText: {
    marginLeft: 9,
    fontSize: 11,
    color: "#BDB5AA",
  },

  verifiedText: {
    marginLeft: 12,
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  verifiedLabel: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFD76A",
    flexShrink: 1,
  },

  /* ================= STATUS ================= */

  statusRow: {
    marginTop: 14,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8EF",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
    backgroundColor: "#16803C",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#16803C",
  },

  updatedText: {
    fontSize: 10,
    color: "#9A8F83",
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  /* ================= REQUIREMENT ================= */

  card: {
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  materialIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    flexShrink: 0,
  },

  materialInfo: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },

  materialName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: "#17120D",
  },

  materialSub: {
    marginTop: 4,
    fontSize: 11,
    color: "#9A8F83",
  },

  quantity: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "800",
    color: "#FF7A00",
  },

  /* ================= PRICE ================= */

  priceCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  priceRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  priceRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  priceSmallIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 11,
    flexShrink: 0,
  },

  priceRowLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17120D",
  },

  priceRowSub: {
    marginTop: 2,
    fontSize: 14,
    color: "#9A8F83",
  },

  priceRowValue: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "900",
    color: "#17120D",
    textAlign: "right",
    flexShrink: 0,
  },

  freePriceValue: {
    marginLeft: 12,
    fontSize: 13,
    fontWeight: "900",
    color: "#16803C",
    textAlign: "right",
    flexShrink: 0,
  },

  totalLeft: {
    flex: 1,
    minWidth: 0,
  },

  totalPrice: {
    marginLeft: 12,
    fontSize: 23,
    fontWeight: "900",
    color: "#FF7A00",
    textAlign: "right",
    flexShrink: 0,
  },

  saveBadge: {
    marginLeft: 10,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8EF",
    flexShrink: 0,
  },

  saveText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "800",
    color: "#16803C",
  },

  /* ================= DELIVERY ================= */

  detailsCard: {
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  detailItem: {
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 12,
    flexShrink: 0,
  },

  detailContent: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    fontSize: 11,
    color: "#9A8F83",
  },

  detailValue: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#17120D",
  },

  freeText: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "900",
    color: "#16803C",
  },

  divider: {
    height: 1,
    backgroundColor: "#F4E9DD",
  },

  /* ================= MESSAGE ================= */

  messageCard: {
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  quoteIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 11,
    flexShrink: 0,
  },

  messageText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#665C51",
    flexShrink: 1,
  },

  /* ================= BUYER PROTECTION ================= */

  trustCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#F1D99D",
  },

  trustIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1C8",
    flexShrink: 0,
  },

  trustContent: {
    flex: 1,
    marginLeft: 11,
    minWidth: 0,
    height: 80,
  },

  trustTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    color: "#4A3710",
  },

  trustText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#756342",
    flex: 1,
    flexShrink: 1,
  },

  /* ================= BOTTOM SPACE ================= */

  bottomSpace: {
    height: 115,
  },

  /* ================= BOTTOM BAR ================= */

  bottomBar: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  acceptedContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },

  acceptedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  acceptedTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  acceptedTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#166534",
  },

  acceptedSubtitle: {
    fontSize: 12,
    color: "#4B7A5B",
    marginTop: 3,
  },

  callButton: {
    height: 62,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  callIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },

  callInfo: {
    flex: 1,
    marginLeft: 11,
  },

  callLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },

  phoneText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    marginTop: 2,
  },

  callArrow: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },

  acceptButtonWrapper: {
    borderRadius: 15,
    overflow: "hidden",
  },

  acceptButton: {
    height: 56,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  acceptText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  // bottomBar: {
  //   position: "absolute",
  //   left: 0,
  //   right: 0,
  //   bottom: 0,

  //   minHeight: 82,

  //   paddingHorizontal: 14,
  //   paddingTop: 10,
  //   paddingBottom: 22,

  //   flexDirection: "row",
  //   alignItems: "center",

  //   backgroundColor: "#FFFDF9",

  //   borderTopWidth: 1,
  //   borderTopColor: "#F1E2D0",

  //   shadowColor: "#000",
  //   shadowOffset: {
  //     width: 0,
  //     height: -3,
  //   },
  //   shadowOpacity: 0.06,
  //   shadowRadius: 8,

  //   elevation: 10,
  // },

  // chatButton: {
  //   width: 82,
  //   height: 50,
  //   borderRadius: 15,

  //   alignItems: "center",
  //   justifyContent: "center",
  //   flexDirection: "row",

  //   backgroundColor: "#FFF0DF",

  //   borderWidth: 1,
  //   borderColor: "#FFD6AE",
  // },

  // chatText: {
  //   marginLeft: 6,
  //   fontSize: 13,
  //   fontWeight: "800",
  //   color: "#FF7A00",
  // },

  // acceptButtonWrapper: {
  //   flex: 1,
  //   marginLeft: 10,
  // },

  // acceptButton: {
  //   height: 50,
  //   borderRadius: 15,

  //   paddingHorizontal: 14,

  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },

  // acceptText: {
  //   marginRight: 10,
  //   fontSize: 14,
  //   fontWeight: "900",
  //   color: "#FFFFFF",
  // },
});
