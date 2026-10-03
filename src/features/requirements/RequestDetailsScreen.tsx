import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

import { getRequirementByIdApi, Requirement } from "../buyer/requirement.api";
import { SafeAreaView } from "react-native-safe-area-context";

const RequestDetailsScreen = ({ navigation, route }: any) => {
  const requestId = route?.params?.requestId;

  const [request, setRequest] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequirement = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!requestId) {
        throw new Error("Requirement ID is missing");
      }

      console.log("📌 REQUEST DETAILS ID:", requestId);

      const data = await getRequirementByIdApi(requestId);

      console.log("✅ REQUEST DETAILS:", data);

      setRequest(data);
    } catch (err: any) {
      console.log(
        "❌ REQUEST DETAILS ERROR:",
        err?.response?.data || err?.message || err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load requirement"
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequirement();
  }, [loadRequirement]);

  const getStatusLabel = (status: Requirement["status"]) => {
    switch (status) {
      case "OPEN":
        return "Active";

      case "QUOTED":
        return "Quotes Received";

      case "ACCEPTED":
        return "Accepted";

      case "ORDERED":
        return "Ordered";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status;
    }
  };

  const getStatusIcon = (status: Requirement["status"]) => {
    switch (status) {
      case "OPEN":
        return "time-outline";

      case "QUOTED":
        return "chatbubbles-outline";

      case "ACCEPTED":
        return "checkmark-circle-outline";

      case "ORDERED":
        return "cube-outline";

      case "COMPLETED":
        return "checkmark-done-circle-outline";

      case "CANCELLED":
        return "close-circle-outline";

      default:
        return "information-circle-outline";
    }
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  const formatDateTime = (date: string) => {
    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return date;
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons name="document-text-outline" size={30} color="#FF7A00" />
        </View>

        <ActivityIndicator
          size="large"
          color="#FF7A00"
          style={{ marginTop: 18 }}
        />

        <Text style={styles.loadingTitle}>Loading requirement...</Text>

        <Text style={styles.loadingSubtitle}>
          Please wait while we fetch your requirement details.
        </Text>
      </View>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error || !request) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={34} color="#DC2626" />
        </View>

        <Text style={styles.errorTitle}>Unable to load requirement</Text>

        <Text style={styles.errorMessage}>
          {error || "Requirement not found."}
        </Text>

        <Pressable
          onPress={loadRequirement}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />

          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  /* =========================
     REAL API DATA
  ========================= */

  const statusLabel = getStatusLabel(request.status);

  const quantity = `${request.quantity} ${request.unit}`;

  const address = request.deliveryAddress;

  const location = `${address.city}, ${address.state}`;

  const fullAddress = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const postedDate = formatDate(request.createdAt);

  const postedDateTime = formatDateTime(request.createdAt);

  const isActive = request.status === "OPEN" || request.status === "QUOTED";

  /*
   * Current Requirement API does not return quote count.
   * So keep a safe fallback until Quote API is connected.
   */
  const quoteCount =
    (request as any).quoteCount ?? (request as any).quotesCount ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color="#000" />
        </Pressable>

        <Text style={styles.headerTitle}>Request Details</Text>

        <Pressable
          onPress={loadRequirement}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="refresh-outline" size={21} color="#172554" />
        </Pressable>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <LinearGradient
          colors={["#0A0A0A", "#21170C", "#3A2608"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.materialIcon}>
              <Text style={styles.materialEmoji}>🧱</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                request.status === "CANCELLED" && styles.cancelledBadge,
                request.status === "COMPLETED" && styles.completedBadge,
              ]}
            >
              <Ionicons
                name={getStatusIcon(request.status) as any}
                size={14}
                color="#FFFFFF"
              />

              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            {request.material?.name || "Construction Material"}
          </Text>

          <View style={styles.heroQuantityRow}>
            <Ionicons name="cube-outline" size={17} color="#FFD76A" />

            <Text style={styles.heroQuantity}>{quantity}</Text>
          </View>

          <View style={styles.heroBottomRow}>
            <View style={styles.heroMeta}>
              <Ionicons name="calendar-outline" size={15} color="#CBD5E1" />

              <Text style={styles.heroMetaText}>Posted {postedDateTime}</Text>
            </View>

            {request.material?.category?.name ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {request.material.category.name}
                </Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>

        {/* =========================
            QUOTE SUMMARY
        ========================= */}

        <View style={styles.quoteSummaryCard}>
          <View style={styles.quoteSummaryIcon}>
            <Ionicons name="chatbubbles-outline" size={23} color="#FF7A00" />
          </View>

          <View style={styles.quoteSummaryContent}>
            <Text style={styles.quoteSummaryTitle}>Supplier Quotes</Text>

            <Text style={styles.quoteSummarySubtitle}>
              {quoteCount > 0
                ? `${quoteCount} supplier ${
                    quoteCount === 1 ? "quote" : "quotes"
                  } received`
                : isActive
                ? "Waiting for supplier quotes"
                : "No quotes available yet"}
            </Text>
          </View>

          <View style={styles.quoteCountCircle}>
            <Text style={styles.quoteCountText}>{quoteCount}</Text>
          </View>
        </View>

        {/* =========================
            REQUIREMENT INFORMATION
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirement Information</Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="cube-outline"
              label="Material"
              value={request.material?.name || "N/A"}
            />

            <InfoDivider />

            <InfoRow icon="layers-outline" label="Quantity" value={quantity} />

            <InfoDivider />

            <InfoRow
              icon="location-outline"
              label="Delivery Location"
              value={location}
            />

            <InfoDivider />

            <InfoRow
              icon="navigate-outline"
              label="Delivery Preference"
              value={request.deliveryPreference || "Not specified"}
            />

            <InfoDivider />

            <InfoRow
              icon="calendar-outline"
              label="Posted On"
              value={postedDate}
            />

            <InfoDivider />

            <InfoRow icon="flag-outline" label="Status" value={statusLabel} />
          </View>
        </View>

        {/* =========================
            DELIVERY ADDRESS
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          <View style={styles.addressCard}>
            <View style={styles.addressIcon}>
              <Ionicons name="location" size={22} color="#FF7A00" />
            </View>

            <View style={styles.addressContent}>
              <Text style={styles.addressName}>
                {address.name || "Delivery Location"}
              </Text>

              <Text style={styles.addressText}>{fullAddress}</Text>

              {address.phone ? (
                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={14} color="#8C8175" />

                  <Text style={styles.phoneText}>{address.phone}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* =========================
            NOTES
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>

          <View style={styles.notesCard}>
            <View style={styles.notesIcon}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#D4A017"
              />
            </View>

            <Text style={styles.notesText}>
              {request?.notes?.trim()
                ? request.notes
                : "No additional notes were added for this requirement."}
            </Text>
          </View>
        </View>

        {/* =========================
            MATERIAL DESCRIPTION
        ========================= */}

        {request.material?.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Material Details</Text>

            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {request.material.description}
              </Text>
            </View>
          </View>
        ) : null}

        {/* =========================
            SUPPLIER QUOTES
        ========================= */}

        <View style={styles.quotesCard}>
          <View style={styles.quotesIconWrapper}>
            <Ionicons name="pricetags-outline" size={25} color="#FFFFFF" />
          </View>

          <View style={styles.quotesContent}>
            <Text style={styles.quotesTitle}>Compare Supplier Quotes</Text>

            <Text style={styles.quotesSubtitle}>
              Check prices, delivery time and supplier details.
            </Text>
          </View>

          {/* <Pressable
            onPress={() =>
              navigation.navigate("Quotes", {
                requirementId: request.id,
              })
            }
            style={({ pressed }) => [
              styles.viewQuotesButton,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.viewQuotesText}>View</Text>

            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
          </Pressable> */}
        </View>

        {/* =========================
            BUYER PROTECTION
        ========================= */}

        <View style={styles.protectionCard}>
          <View style={styles.protectionIcon}>
            <Ionicons name="shield-checkmark" size={24} color="#16A34A" />
          </View>

          <View style={styles.protectionContent}>
            <Text style={styles.protectionTitle}>
              BuildSathi Buyer Protection
            </Text>

            <Text style={styles.protectionText}>
              Your requirement is shared only with relevant suppliers. Compare
              quotes before placing an order.
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* =========================
   INFO ROW
========================= */

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={19} color="#FF7A00" />
      </View>

      <View style={styles.infoTextWrapper}>
        <Text style={styles.infoLabel}>{label}</Text>

        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

/* =========================
   INFO DIVIDER
========================= */

const InfoDivider = () => {
  return <View style={styles.infoDivider} />;
};

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },

  /* LOADING */

  centerContainer: {
    flex: 1,
    backgroundColor: "#FFF8EE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DD",
  },

  loadingTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "800",
    color: "#172554",
  },

  loadingSubtitle: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#8C8175",
  },

  /* ERROR */

  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  errorTitle: {
    marginTop: 18,
    fontSize: 19,
    fontWeight: "800",
    color: "#172554",
    textAlign: "center",
  },

  errorMessage: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#8C8175",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 22,
    minWidth: 135,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  retryText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  backButton: {
    marginTop: 13,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172554",
  },

  /* HERO */

  heroCard: {
    marginTop: 8,
    borderRadius: 22,
    // padding: 20,
    overflow: "hidden",
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 14,
    marginTop: 14,
  },

  materialIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  materialEmoji: {
    fontSize: 29,
  },

  statusBadge: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#16A34A",
    marginRight: 14,
  },

  cancelledBadge: {
    backgroundColor: "#DC2626",
  },

  completedBadge: {
    backgroundColor: "#2563EB",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroTitle: {
    marginTop: 20,
    fontSize: 22,
    lineHeight: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    paddingLeft: 14,
  },

  heroQuantityRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingLeft: 14,
  },

  heroQuantity: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFD76A",
  },

  heroBottomRow: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 16,
    paddingLeft: 14,
  },

  heroMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  heroMetaText: {
    flex: 1,
    fontSize: 11,
    color: "#CBD5E1",
  },

  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,215,106,0.14)",
    marginRight: 16,
  },

  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFD76A",
  },

  /* QUOTE SUMMARY */

  quoteSummaryCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    flexDirection: "row",
    alignItems: "center",
  },

  quoteSummaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DD",
  },

  quoteSummaryContent: {
    flex: 1,
    marginLeft: 12,
  },

  quoteSummaryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  quoteSummarySubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#8C8175",
  },

  quoteCountCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3D6",
  },

  quoteCountText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#D97706",
  },

  /* SECTION */

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 17,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  /* INFO CARD */

  infoCard: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  infoRow: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3E7",
  },

  infoTextWrapper: {
    flex: 1,
    marginLeft: 12,
  },

  infoLabel: {
    fontSize: 13,
    color: "#9A8F83",
    fontWeight: "600",
  },

  infoValue: {
    marginTop: 3,
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "600",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#F5EBDD",
  },

  /* ADDRESS */

  addressCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    flexDirection: "row",
  },

  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DD",
  },

  addressContent: {
    flex: 1,
    marginLeft: 12,
  },

  addressName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  addressText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    color: "#6F665E",
  },

  phoneRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  phoneText: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
  },

  /* NOTES */

  notesCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFDF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  notesIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3D6",
  },

  notesText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    lineHeight: 21,
    color: "#625A52",
  },

  /* DESCRIPTION */

  descriptionCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  descriptionText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#625A52",
  },

  /* QUOTES */

  quotesCard: {
    marginTop: 24,
    padding: 13,
    borderRadius: 20,
    backgroundColor: "#21170C",
    flexDirection: "row",
    alignItems: "center",
  },

  quotesIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7A00",
  },

  quotesContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  quotesTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  quotesSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#CBD5E1",
  },

  viewQuotesButton: {
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  viewQuotesText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  /* PROTECTION */

  protectionCard: {
    marginTop: 14,
    padding: 15,
    borderRadius: 19,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  protectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCFCE7",
  },

  protectionContent: {
    flex: 1,
    marginLeft: 11,
  },

  protectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#166534",
  },

  protectionText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#4D6B56",
  },
});

export default RequestDetailsScreen;
