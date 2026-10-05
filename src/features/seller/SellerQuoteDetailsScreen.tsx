import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
// import Ionicons from "react-native-vector-icons/Ionicons";
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSellerQuoteByIdApi } from "./quoteApi";

const SellerQuoteDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const routeQuote = route.params?.quote;
  const quoteId = route.params?.quoteId || routeQuote?.id;

  const [quote, setQuote] = useState<any>(routeQuote || null);
  console.log("dfasdf", quote);

  const [loading, setLoading] = useState(!routeQuote);
  const [error, setError] = useState("");

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) {
      return "Recently";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    const now = new Date();

    const diffMs = now.getTime() - date.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return "Just now";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `${diffHours} hr ago`;
    }

    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchQuoteDetails = useCallback(async () => {
    if (!quoteId) {
      setError("Quote ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getSellerQuoteByIdApi(quoteId);

      const quoteData = response?.data?.quote || response?.quote || null;

      if (!quoteData) {
        throw new Error("Quote details not found");
      }

      setQuote(quoteData);
    } catch (err: any) {
      console.error(
        "GET SELLER QUOTE DETAILS ERROR:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch quote details"
      );
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  React.useEffect(() => {
    fetchQuoteDetails();
  }, [fetchQuoteDetails]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7A00" />

          <Text style={styles.loadingText}>Loading quote details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quote) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="document-text-outline" size={28} color="#FF7A00" />
          </View>

          <Text style={styles.errorTitle}>Quote not found</Text>

          <Text style={styles.errorText}>
            {error || "Unable to load quote details."}
          </Text>

          <Pressable style={styles.retryButton} onPress={fetchQuoteDetails}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // API DATA MAPPING
  // =====================================================

  const materialName = quote?.requirement?.material?.name || "Material";
  const materialIcon = quote.requirement?.material.imageUrl;


  // const materialIcon = materialName.toLowerCase().includes("cement")
  //   ? "🧱"
  //   : materialName.toLowerCase().includes("sand")
  //   ? "🏖️"
  //   : materialName.toLowerCase().includes("aggregate")
  //   ? "🪨"
  //   : materialName.toLowerCase().includes("brick")
  //   ? "🧱"
  //   : "📦";

  const quantity = `${quote?.requirement?.quantity || 0} ${
    quote?.requirement?.unit || ""
  }`.trim();

  const buyerName =
    quote?.requirement?.buyer?.name || quote?.buyer?.name || "Buyer";

  const buyerType = quote?.requirement?.buyer?.role || "Buyer";

  const address = quote?.requirement?.deliveryAddress;

  const location =
    [address?.city, address?.state].filter(Boolean).join(", ") ||
    "Location not available";

  const fullAddress = [
    address?.addressLine1,
    address?.addressLine2,
    address?.landmark,
    address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const amount = Number(quote?.totalAmount || 0);

  const pricePerUnit = Number(quote?.pricePerUnit || 0);

  const materialAmount = Number(quote?.materialAmount || 0);

  const deliveryCharges = Number(quote?.deliveryCharges || 0);

  const deliveryTime = quote?.deliveryTime || "Not specified";

  const validity = quote?.validity
    ? quote.validity.toLowerCase().includes("valid")
      ? quote.validity
      : `Valid for ${quote.validity}`
    : "Not specified";

  const quoteStatus = quote?.status || "PENDING";

  const message = quote?.message || "No message added by seller.";

  const buyerNote = quote?.requirement?.notes || "No additional buyer notes.";

  const sentAt = getTimeAgo(quote?.createdAt);

  const displayQuoteId = `QT-${quote.id.slice(0, 8).toUpperCase()}`;

  const displayRequirementId = `REQ-${quote.requirementId
    .slice(0, 8)
    .toUpperCase()}`;

  const displayQuote = {
    ...quote,

    id: displayQuoteId,
    requirementId: displayRequirementId,

    material: materialName,
    materialIcon,

    quantity,

    buyerName,
    buyerType,

    location,
    fullAddress,

    amount,
    pricePerUnit,
    materialAmount,
    deliveryCharges,

    deliveryTime,
    validity,

    status: quoteStatus,

    sentAt,

    message,
    buyerNote,
  };

  const handleCall = async () => {
    const phoneNumber =
      quote?.requirement?.buyer?.buyerProfile?.phoneNumber ||
      quote?.requirement?.buyer?.phone;

    if (!phoneNumber) {
      Alert.alert(
        "Phone number unavailable",
        "Seller phone number is not available."
      );
      return;
    }

    const phoneUrl = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);

      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          "Unable to call",
          "Phone calling is not available on this device."
        );
      }
    } catch (error) {
      console.log("Call error:", error);

      Alert.alert(
        "Unable to call",
        "Something went wrong while opening the phone app."
      );
    }
  };
  const formatCurrency = (amount: number | string | null | undefined) => {
    const value = Number(amount ?? 0);

    if (!Number.isFinite(value)) {
      return "₹0";
    }

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const getStatusConfig = () => {
    switch (String(displayQuote.status).toUpperCase()) {
      case "ACCEPTED":
        return {
          color: "#3B8A58",
          bg: "#EAF5EE",
          icon: "checkmark-circle",
          title: "Quote Accepted",
          subtitle: "The buyer has accepted your quotation.",
        };

      case "VIEWED":
        return {
          color: "#D4A017",
          bg: "#FFF8DD",
          icon: "eye",
          title: "Quote Viewed",
          subtitle: "The buyer has viewed your quotation.",
        };

      case "EXPIRED":
        return {
          color: "#A36A6A",
          bg: "#F6EAEA",
          icon: "time-outline",
          title: "Quote Expired",
          subtitle: "This quotation is no longer active.",
        };

      case "REJECTED":
        return {
          color: "#C94A4A",
          bg: "#FCECEC",
          icon: "close-circle",
          title: "Quote Rejected",
          subtitle: "The buyer has rejected your quotation.",
        };

      default:
        return {
          color: "#FF7A00",
          bg: "#FFF0DF",
          icon: "send",
          title: "Quote Sent",
          subtitle: "Your quotation is waiting for the buyer response.",
        };
    }
  };

  const status = getStatusConfig();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={21} color="#0A0A0A" />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Quote Details</Text>

            <Text style={styles.headerSubtitle}>{displayQuote.id}</Text>
          </View>

          <Pressable style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={21} color="#0A0A0A" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* STATUS HERO */}
          <LinearGradient
            colors={
              quote.status === "Accepted"
                ? ["#183B25", "#245C39"]
                : quote.status === "Expired"
                ? ["#3A2929", "#563B3B"]
                : ["#0A0A0A", "#1D1D1D", "#33230B"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <View
                style={[
                  styles.statusHeroBadge,
                  {
                    backgroundColor: status.bg,
                  },
                ]}
              >
                <Ionicons
                  name={status.icon as any}
                  size={18}
                  color={status.color}
                />

                <Text
                  style={[
                    styles.statusHeroText,
                    {
                      color: status.color,
                    },
                  ]}
                >
                  {quote.status}
                </Text>
              </View>

              <Text style={styles.sentTime}>{quote.deliveryTime}</Text>
            </View>

            <View style={styles.heroMaterial}>
              <View style={styles.heroMaterialIcon}>
              <Image
              source={{ uri: materialIcon }}
              style={styles.materialImage}
              resizeMode="cover"
            />
                {/* <Ionicons name="pricetag-outline" size={21} color="#FFD76A" /> */}
                {/* <Text style={styles.heroEmoji}>{quote.materialIcon}</Text> */}
              </View>

              <View style={styles.heroMaterialInfo}>
                <Text style={styles.heroMaterialName}>{quote.material}</Text>

                <Text style={styles.heroQuantity}>{quote.quantity}</Text>
              </View>
            </View>

            <Text style={styles.heroLabel}>YOUR QUOTATION</Text>

            <Text style={styles.heroAmount}>
              {formatCurrency(quote.totalAmount)}
            </Text>

            <Text style={styles.heroStatusTitle}>{status.title}</Text>

            <Text style={styles.heroStatusSubtitle}>{status.subtitle}</Text>

            <View style={styles.heroIds}>
              <View>
                <Text style={styles.heroIdLabel}>Per unit</Text>

                <Text style={styles.heroIdValue}>{quote.pricePerUnit}</Text>
              </View>

              <View style={styles.heroIdDivider} />

              <View>
                <Text style={styles.heroIdLabel}>Validity</Text>

                <Text style={styles.heroIdValue}>{quote.validity}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* BUYER */}
          <SectionTitle
            title="Buyer Information"
            subtitle="Customer who received your quote"
          />

          <View style={styles.buyerCard}>
            <View style={styles.buyerTop}>
              <View style={styles.buyerAvatar}>
                <Text style={styles.buyerAvatarText}>
                  {quote?.requirement?.buyer?.name?.charAt(0)}
                </Text>
              </View>

              <View style={styles.buyerInfo}>
                <View style={styles.buyerNameRow}>
                  <Text style={styles.buyerName}>
                    {quote?.requirement?.buyer?.name}
                  </Text>

                  <Ionicons name="checkmark-circle" size={15} color="#3B8A58" />
                </View>

                <Text style={styles.buyerType}>
                  {quote.requirement?.buyer?.email}
                </Text>
              </View>

              {/* <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#3B8A58" />

                <Text style={styles.verifiedText}>Verified</Text>
              </View> */}
            </View>

            {/* <View style={styles.buyerLocation}>
              <Ionicons name="location-outline" size={22} color="#FF7A00" />

              <Text style={styles.locationText}>{quote.location}</Text>
            </View> */}
            {quote.status === "ACCEPTED" && (
              <Pressable style={styles.chatBuyerButton}>
                <Ionicons name="call" size={17} color="#FF7A00" />
                <Text style={styles.chatBuyerText}>
                  {" "}
                  {quote?.requirement?.buyer?.buyerProfile?.phoneNumber ||
                    quote?.requirement?.buyer?.phone ||
                    "Phone unavailable"}
                </Text>
              </Pressable>
            )}
          </View>

          {/* PRICING */}
          <SectionTitle
            title="Quotation Breakdown"
            subtitle="Pricing shared with the buyer"
          />

          <View style={styles.pricingCard}>
            <PriceRow
              label="Material"
              value={quote?.requirement?.material?.name}
            />

            <PriceRow
              label="Quantity"
              value={`${quote?.requirement?.quantity ?? 0} ${
                quote?.requirement?.unit ?? ""
              }`}
            />
            <View style={styles.priceDivider} />

            <PriceRow
              label="Price per unit"
              value={formatCurrency(quote.pricePerUnit)}
            />

            <PriceRow
              label="Material Amount"
              value={formatCurrency(
                quote.materialAmount ??
                  quote.amount - (quote.deliveryCharges || 0)
              )}
            />

            <PriceRow
              label="Delivery Charges"
              value={formatCurrency(quote.deliveryCharges || 0)}
            />

            <View style={styles.totalDivider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>TOTAL QUOTE</Text>

                <Text style={styles.totalSubtext}>
                  Inclusive of delivery charges
                </Text>
              </View>

              <Text style={styles.totalAmount}>
                {formatCurrency(quote?.totalAmount)}
              </Text>
            </View>
          </View>

          {/* DELIVERY */}
          <SectionTitle
            title="Delivery Details"
            subtitle="Commitments shared with buyer"
          />

          <View style={styles.deliveryCard}>
            <View style={styles.deliveryItem}>
              <View style={styles.deliveryIconOrange}>
                <Ionicons name="time-outline" size={19} color="#FF7A00" />
              </View>

              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Expected Delivery</Text>

                <Text style={styles.deliveryValue}>{quote.deliveryTime}</Text>
              </View>
            </View>

            <View style={styles.deliveryItem}>
              <View style={styles.deliveryIconGold}>
                <Ionicons name="calendar-outline" size={19} color="#D4A017" />
              </View>

              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Quote Validity</Text>

                <Text style={styles.deliveryValue}>{quote.validity}</Text>
              </View>
            </View>

            <View style={styles.deliveryItem}>
              <View style={styles.deliveryIconGreen}>
                <Ionicons name="location-outline" size={19} color="#3B8A58" />
              </View>

              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Delivery Location</Text>

                <Text style={styles.deliveryValue}>
                  {[
                    quote?.requirement?.deliveryAddress?.addressLine1,
                    quote?.requirement?.deliveryAddress?.addressLine2,
                    quote?.requirement?.deliveryAddress?.landmark,
                    quote?.requirement?.deliveryAddress?.city,
                    quote?.requirement?.deliveryAddress?.state,
                    quote?.requirement?.deliveryAddress?.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Address not available"}
                </Text>
              </View>
            </View>
          </View>

          {/* BUYER REQUIREMENT */}
          <SectionTitle
            title="Buyer Requirement"
            subtitle="Original requirement details"
          />

          <View style={styles.requirementCard}>
            <View style={styles.requirementHeader}>
              <View style={styles.requirementIcon}>
                <Text style={styles.requirementEmoji}>
                  {quote?.requirement?.buyer?.name?.charAt(0)}
                </Text>
              </View>

              <View>
                <Text style={styles.requirementMaterial}>
                  {quote.requirement?.buyer?.name}
                </Text>

                <Text style={styles.requirementId}>
                  {quote.requirement?.buyer?.email}
                </Text>
              </View>
            </View>

            <View style={styles.requirementDetails}>
              <RequirementItem
                icon="cube-outline"
                label="Required Quantity"
                value={quote?.requirement?.quantity}
              />

              <RequirementItem
                icon="location-outline"
                label="Delivery Location"
                value={[
                  quote?.requirement?.deliveryAddress?.addressLine1,
                  quote?.requirement?.deliveryAddress?.addressLine2,
                  quote?.requirement?.deliveryAddress?.landmark,
                  quote?.requirement?.deliveryAddress?.city,
                  quote?.requirement?.deliveryAddress?.state,
                  quote?.requirement?.deliveryAddress?.pincode,
                ]}
              />

              <RequirementItem
                icon="time-outline"
                label="Required Timeline"
                value={quote?.requirement?.deliveryPreference}
              />
            </View>

            {/* <View style={styles.buyerNote}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color="#A48B62"
              />

              <Text style={styles.buyerNoteText}>This is prefect material</Text>
            </View> */}
          </View>

          {/* SELLER MESSAGE */}
          <SectionTitle
            title="Message to Buyer"
            subtitle="Message included with your quotation"
          />

          <View style={styles.messageCard}>
            <View style={styles.messageIcon}>
              <Ionicons name="chatbubble-outline" size={18} color="#D4A017" />
            </View>

            <Text style={styles.messageText}>{quote?.message}</Text>
          </View>

          {/* PROTECTION */}
          <View style={styles.protectionCard}>
            <LinearGradient
              colors={["#FFF8E8", "#FFF0D2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.protectionGradient}
            >
              <View style={styles.protectionIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#D4A017"
                />
              </View>

              <View style={styles.protectionContent}>
                <Text style={styles.protectionTitle}>
                  BuildSathi Seller Protection
                </Text>

                <Text style={styles.protectionText}>
                  Your quotation and agreed terms are recorded securely on
                  BuildSathi.
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* BOTTOM ACTIONS */}
        <View style={styles.bottomBar}>
          {quote.status === "ACCEPTED" && (
            <Pressable style={styles.callButton} onPress={handleCall}>
              <View style={styles.callIconContainer}>
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </View>

              <View style={styles.callInfo}>
                <Text style={styles.callLabel}>Call Supplier</Text>

                <Text style={styles.callPhone}>
                  {quote?.requirement?.buyer?.buyerProfile?.phoneNumber ||
                    quote?.requirement?.buyer?.phone ||
                    "Phone unavailable"}
                </Text>
              </View>
            </Pressable>
          )}
          {quote.status === "ACCEPTED" && (
            <Pressable
              style={[
                styles.bottomPrimary,
                quote.status === "EXPIRED" && styles.bottomPrimaryDisabled,
              ]}
              onPress={() =>
                navigation.navigate("SellerDispatchMaterial", {
                  quoteId: quote?.id,
                })
              }
            >
              <Text style={styles.bottomPrimaryText}>Dispatch</Text>

              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          )}
          {quote.status === "DISPATCHED" && (
            <Pressable
              style={[styles.bottomPrimary]}
              onPress={() =>
                navigation.navigate("Seller", {
                  screen: "SellerOrders",
                })
              }
            >
              <Text style={styles.bottomPrimaryText}>Track Order</Text>

              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

/* =========================================================
   COMPONENTS
========================================================= */

const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
};

const PriceRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>

      <Text style={styles.priceValue}>{value}</Text>
    </View>
  );
};

const RequirementItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => {
  return (
    <View style={styles.requirementItem}>
      <View style={styles.requirementItemIcon}>
        <Ionicons name={icon as any} size={20} color="#FF7A00" />
      </View>

      <View style={styles.requirementItemInfo}>
        <Text style={styles.requirementItemLabel}>{label}</Text>

        <Text style={styles.requirementItemValue}>{value}</Text>
      </View>
    </View>
  );
};

export default SellerQuoteDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  /* HEADER */

  header: {
    height: 68,
    paddingHorizontal: 16,
    // backgroundColor: '#FFF3D6',
    borderBottomWidth: 1,
    borderBottomColor: "#F1E2D0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 15,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#9B8F82",
    fontWeight: "700",
    marginTop: 2,
  },

  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    justifyContent: "center",
  },

  /* HERO */

  hero: {
    borderRadius: 24,
    // padding: 17,
    marginTop: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#33280F",
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 16,
  },

  statusHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
  },

  statusHeroText: {
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 5,
  },

  sentTime: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },

  heroMaterial: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginLeft: 16,
  },

  heroMaterialIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    backgroundColor: "#FFF1D8",
    alignItems: "center",
    justifyContent: "center",
  },

  heroEmoji: {
    fontSize: 26,
  },

  heroMaterialInfo: {
    marginLeft: 14,
  },

  heroMaterialName: {
    fontSize: 17,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  heroQuantity: {
    fontSize: 12,
    color: "#BDB4A6",
    fontWeight: "700",
    marginTop: 3,
  },

  heroLabel: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 18,
    marginLeft: 16,
  },

  heroAmount: {
    fontSize: 29,
    color: "#FFD76A",
    fontWeight: "900",
    marginTop: 3,
    marginLeft: 16,
  },

  heroStatusTitle: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "800",
    marginTop: 5,
    marginLeft: 16,
  },

  heroStatusSubtitle: {
    fontSize: 12,
    color: "#AAA297",
    fontWeight: "600",
    marginTop: 3,
    lineHeight: 13,
    marginLeft: 16,
  },

  heroIds: {
    marginTop: 17,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingBottom: 16,
  },

  heroIdLabel: {
    fontSize: 13,
    color: "#8F887D",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  heroIdValue: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "800",
    marginTop: 3,
  },

  heroIdDivider: {
    width: 1,
    height: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 25,
  },
  materialImage: {
    width: 47,
    height: 47,
    resizeMode: "cover",
    borderRadius:12
  },

  /* SECTION */

  sectionTitleContainer: {
    marginTop: 20,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 15,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#9B8F82",
    fontWeight: "600",
    marginTop: 3,
  },

  /* BUYER */

  buyerCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 14,
  },

  buyerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  buyerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },

  buyerAvatarText: {
    color: "#FFD76A",
    fontSize: 15,
    fontWeight: "900",
  },

  buyerInfo: {
    flex: 1,
    marginLeft: 10,
  },

  buyerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  buyerName: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  buyerType: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 3,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF5EE",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },

  verifiedText: {
    fontSize: 10,
    color: "#3B8A58",
    fontWeight: "900",
    marginLeft: 3,
  },

  buyerLocation: {
    marginTop: 13,
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  locationText: {
    fontSize: 12,
    color: "#0A0A0A",
    fontWeight: "700",
    marginLeft: 7,
  },

  chatBuyerButton: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD0A1",
    backgroundColor: "#FFF5E8",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
  },

  chatBuyerText: {
    fontSize: 14,
    color: "#FF7A00",
    fontWeight: "700",
    marginLeft: 6,
  },

  /* PRICING */

  pricingCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 15,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  priceLabel: {
    fontSize: 13,
    color: "#8C8175",
    fontWeight: "600",
  },

  priceValue: {
    fontSize: 12,
    color: "#0A0A0A",
    fontWeight: "800",
  },

  priceDivider: {
    height: 1,
    backgroundColor: "#F1E8DD",
    marginVertical: 4,
  },

  totalDivider: {
    height: 1,
    backgroundColor: "#E8DCCF",
    marginVertical: 8,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "800",
  },

  totalSubtext: {
    fontSize: 12,
    color: "#9B8F82",
    fontWeight: "600",
    marginTop: 3,
  },

  totalAmount: {
    fontSize: 18,
    color: "#FF7A00",
    fontWeight: "900",
  },

  /* DELIVERY */

  deliveryCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 14,
    gap: 14,
  },

  deliveryItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  deliveryIconOrange: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryIconGold: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#FFF7D9",
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryIconGreen: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#EAF5EE",
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryInfo: {
    marginLeft: 10,
  },

  deliveryLabel: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "700",
  },

  // deliveryValue: {
  //   fontSize: 12,
  //   color: "#0A0A0A",
  //   fontWeight: "600",
  //   marginTop: 3,
  // },

  deliveryValue: {
    fontSize: 14,
    color: "#5F554B",
    lineHeight: 21,
    flexShrink: 1,
  },

  /* REQUIREMENT */

  requirementCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 14,
  },

  requirementHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1E8DD",
  },

  requirementIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF0D8",
    alignItems: "center",
    justifyContent: "center",
  },

  requirementEmoji: {
    fontSize: 22,
  },

  requirementMaterial: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "900",
    marginLeft: 10,
  },

  requirementId: {
    fontSize: 12,
    color: "#9B8F82",
    fontWeight: "600",
    marginLeft: 10,
    marginTop: 3,
  },

  requirementDetails: {
    paddingVertical: 12,
    gap: 12,
  },

  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  requirementItemIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#FFF3E5",
    alignItems: "center",
    justifyContent: "center",
  },

  requirementItemInfo: {
    marginLeft: 9,
  },

  requirementItemLabel: {
    fontSize: 13,
    color: "#0A0A0A",
    fontWeight: "700",
  },

  requirementItemValue: {
    // fontSize: 14,
    // color: "#9B8F82",
    // fontWeight: "600",
    // marginTop: 2,

    fontSize: 14,
    color: "#5F554B",
    lineHeight: 21,
    flexShrink: 1,
  },

  buyerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E8",
    borderRadius: 12,
    padding: 10,
  },

  buyerNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 13,
    color: "#8C8175",
    fontWeight: "600",
    marginLeft: 7,
  },

  viewRequirementButton: {
    height: 42,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#FFF3E5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  viewRequirementText: {
    fontSize: 9,
    color: "#FF7A00",
    fontWeight: "900",
  },

  /* MESSAGE */

  messageCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  messageIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#FFF7D9",
    alignItems: "center",
    justifyContent: "center",
  },

  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 15,
    color: "#5F554A",
    fontWeight: "600",
    marginLeft: 10,
  },

  /* PROTECTION */

  protectionCard: {
    marginTop: 19,
    borderRadius: 19,
    overflow: "hidden",
  },

  protectionGradient: {
    // padding: 13,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#F0DDAF",
    flexDirection: "row",
    alignItems: "center",
    height: 80,
  },

  protectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFDF8",
    alignItems: "center",
    justifyContent: "center",
  },

  protectionContent: {
    flex: 1,
    marginLeft: 10,
  },

  protectionTitle: {
    fontSize: 13,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  protectionText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 3,
  },

  /* BOTTOM */

  callButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 15,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginRight: 10,
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
    marginLeft: 10,
  },

  callLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },

  callPhone: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
  },

  bottomPrimary: {
    flex: 1,
    minHeight: 58,
    borderRadius: 15,
    backgroundColor: "#FF8A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  bottomPrimaryDisabled: {
    opacity: 0.5,
  },

  bottomPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  // bottomBar: {
  //   position: "absolute",
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   backgroundColor: "#FFFCF7",
  //   borderTopWidth: 1,
  //   borderTopColor: "#F1E2D0",
  //   paddingHorizontal: 16,
  //   paddingTop: 10,
  //   paddingBottom: 12,
  //   flexDirection: "row",
  //   gap: 10,
  // },

  // bottomChat: {
  //   width: 82,
  //   height: 51,
  //   borderRadius: 15,
  //   backgroundColor: "#FFF3E5",
  //   borderWidth: 1,
  //   borderColor: "#FFD0A1",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   flexDirection: "row",
  //   gap: 6,
  // },

  // bottomChatText: {
  //   fontSize: 9,
  //   color: "#FF7A00",
  //   fontWeight: "900",
  // },

  // bottomPrimary: {
  //   flex: 1,
  //   height: 51,
  //   borderRadius: 15,
  //   backgroundColor: "#FF7A00",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   flexDirection: "row",
  //   gap: 7,
  // },

  // bottomPrimaryDisabled: {
  //   backgroundColor: "#B9AEA1",
  // },

  // bottomPrimaryText: {
  //   fontSize: 16,
  //   color: "#FFFFFF",
  //   fontWeight: "700",
  // },
});
