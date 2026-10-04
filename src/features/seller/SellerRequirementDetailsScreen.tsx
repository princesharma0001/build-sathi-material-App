import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
  StatusBar,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { getSellerRequirementByIdApi } from "./seller.api";

// 👆 change path if your API file is somewhere else

const SellerRequirementDetailsScreen = ({ navigation, route }: any) => {
  const requirementId =
    route?.params?.requirementId || route?.params?.requirement?.id;

  const [requirement, setRequirement] = useState<any>(
    route?.params?.requirement || null
  );

  const [loading, setLoading] = useState(true);

  const fetchRequirement = useCallback(async () => {
    if (!requirementId) {
      setLoading(false);

      Toast.show({
        type: "error",
        text1: "Requirement not found",
        text2: "Requirement ID is missing.",
      });

      return;
    }

    try {
      setLoading(true);

      const data = await getSellerRequirementByIdApi(requirementId);

      setRequirement(data);
    } catch (error: any) {
      console.error(
        "SELLER REQUIREMENT DETAILS ERROR:",
        error?.response?.data || error
      );

      Toast.show({
        type: "error",
        text1: "Unable to load requirement",
        text2: error?.response?.data?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [requirementId]);

  useEffect(() => {
    fetchRequirement();
  }, [fetchRequirement]);

  /* -----------------------------
     LOADING
  ----------------------------- */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

        <ActivityIndicator size="large" color="#FF7A00" />

        <Text style={styles.loadingText}>Loading requirement...</Text>
      </View>
    );
  }

  /* -----------------------------
     EMPTY
  ----------------------------- */

  if (!requirement) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

        <Ionicons name="document-text-outline" size={48} color="#D4A017" />

        <Text style={styles.emptyTitle}>Requirement not found</Text>

        <Pressable
          style={styles.emptyButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.emptyButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  /* -----------------------------
     API MAPPING
  ----------------------------- */

  const materialName = requirement?.material?.name || "Material";

  const materialNameLower = materialName.toLowerCase();
  const materialIcon = requirement?.material.imageUrl;

  // const materialIcon =
  //   materialNameLower.includes('cement')
  //     ? '🧱'
  //     : materialNameLower.includes('sand')
  //     ? '🏖️'
  //     : materialNameLower.includes('aggregate')
  //     ? '🪨'
  //     : materialNameLower.includes('brick')
  //     ? '🧱'
  //     : '📦';

  const quantity = requirement?.quantity
    ? `${requirement.quantity} ${requirement?.unit || ""}`.trim()
    : "—";

  const address = requirement?.deliveryAddress || {};

  const location = [address?.city, address?.state].filter(Boolean).join(", ");

  const fullAddress = [
    address?.addressLine1,
    address?.addressLine2,
    address?.landmark,
    address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const deliveryPreference = requirement?.deliveryPreference || "STANDARD";

  const isUrgent = deliveryPreference.toUpperCase() === "URGENT";

  const buyerName = requirement?.buyer?.name || "Buyer";

  const buyerPhone = requirement?.buyer?.phone || "";

  const buyerEmail = requirement?.buyer?.email || "";

  const notes = requirement?.notes || "No additional notes provided.";

  const status = requirement?.status || "OPEN";

  /* -----------------------------
     POSTED TIME
  ----------------------------- */

  const getPostedTime = () => {
    if (!requirement?.createdAt) {
      return "";
    }

    const createdAt = new Date(requirement.createdAt);

    const now = new Date();

    const diffMs = now.getTime() - createdAt.getTime();

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

    return createdAt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const postedTime = getPostedTime();

  /* -----------------------------
     STATUS
  ----------------------------- */

  const statusLabel =
    status === "OPEN"
      ? "Active"
      : status === "QUOTED"
      ? "Quoted"
      : status === "ACCEPTED"
      ? "Accepted"
      : status === "ORDERED"
      ? "Ordered"
      : status === "COMPLETED"
      ? "Completed"
      : status === "CANCELLED"
      ? "Cancelled"
      : status;

  const canSendQuote = status === "OPEN";

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
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={23} color="#0A0A0A" />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Requirement Details</Text>

              <Text style={styles.headerId}>
                #{requirement?.id?.slice(0, 8)?.toUpperCase()}
              </Text>
            </View>

            <Pressable style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={21} color="#0A0A0A" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* HERO */}

            <LinearGradient
              colors={["#FF7A00", "#FF9F1C", "#FFC43D"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <Image
                    source={{ uri: materialIcon }}
                    style={styles.materialImage}
                    resizeMode="cover"
                  />
                </View>

                {isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Ionicons name="flash" size={12} color="#EA580C" />

                    <Text style={styles.urgentText}>URGENT</Text>
                  </View>
                )}
              </View>

              <Text style={styles.heroLabel}>BUYER REQUIREMENT</Text>

              <Text style={styles.heroTitle}>{materialName}</Text>

              <View style={styles.heroQuantityRow}>
                <Text style={styles.heroQuantity}>{quantity}</Text>

                <View style={styles.heroDot} />

                <Text style={styles.heroUnit}>
                  {requirement?.unit || "Unit"}
                </Text>
              </View>

              <View style={styles.heroLocation}>
                <Ionicons name="location" size={15} color="#FFFFFF" />

                <Text style={styles.heroLocationText}>
                  {location || "Location not provided"}
                </Text>
              </View>
            </LinearGradient>

            {/* POSTED TIME */}

            <View style={styles.postedRow}>
              <View style={styles.postedLeft}>
                <Ionicons name="time-outline" size={15} color="#8C8175" />

                <Text style={styles.postedText}>Posted {postedTime}</Text>
              </View>

              <View
                style={[
                  styles.liveBadge,
                  status !== "OPEN" && {
                    backgroundColor: "#FFF4E5",
                  },
                ]}
              >
                <View
                  style={[
                    styles.liveDot,
                    status !== "OPEN" && {
                      backgroundColor: "#FF7A00",
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.liveText,
                    status !== "OPEN" && {
                      color: "#C56A00",
                    },
                  ]}
                >
                  {statusLabel}
                </Text>
              </View>
            </View>

            {/* REQUIREMENT SUMMARY */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirement Summary</Text>

              <View style={styles.summaryCard}>
                {/* MATERIAL */}

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="cube-outline" size={19} color="#FF7A00" />
                  </View>

                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Material</Text>

                    <Text style={styles.infoValue}>{materialName}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* QUANTITY */}

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="layers-outline" size={19} color="#D4A017" />
                  </View>

                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Quantity</Text>

                    <Text style={styles.infoValue}>{quantity}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* LOCATION */}

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons
                      name="location-outline"
                      size={19}
                      color="#EA580C"
                    />
                  </View>

                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Delivery Location</Text>

                    <Text style={styles.infoValue}>{location || "—"}</Text>

                    {!!fullAddress && (
                      <Text style={styles.infoSubValue}>{fullAddress}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.divider} />

                {/* DELIVERY */}

                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={19}
                      color="#7C5A16"
                    />
                  </View>

                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Delivery Requirement</Text>

                    <Text style={styles.infoValue}>{deliveryPreference}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* BUYER NOTE */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Buyer Notes</Text>

              <View style={styles.noteCard}>
                <View style={styles.noteIcon}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={19}
                    color="#D4A017"
                  />
                </View>

                <Text style={styles.noteText}>{notes}</Text>
              </View>
            </View>

            {/* BUYER */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Buyer Information</Text>

              <View style={styles.buyerCard}>
                <View style={styles.buyerAvatar}>
                  <Text style={styles.buyerAvatarText}>
                    {buyerName?.charAt(0)?.toUpperCase() || "B"}
                  </Text>
                </View>

                <View style={styles.buyerInfo}>
                  <Text style={styles.buyerName}>{buyerName}</Text>

                  {/* <Text
                    style={styles.buyerType}>
                    Buyer
                  </Text> */}

                  {/* {!!buyerPhone && (
                    <Text
                      style={
                        styles.buyerContact
                      }>
                      {buyerPhone}
                    </Text>
                  )} */}

                  {!!buyerEmail && (
                    <Text style={styles.buyerContact}>{buyerEmail}</Text>
                  )}

                  <View style={styles.buyerVerified}>
                    <Ionicons
                      name="shield-checkmark"
                      size={13}
                      color="#D4A017"
                    />

                    <Text style={styles.buyerVerifiedText}>Buyer</Text>
                  </View>
                </View>

                <Pressable style={styles.chatButton}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color="#FF7A00"
                  />
                </Pressable>
              </View>
            </View>

            {/* BEFORE QUOTE */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Before You Send a Quote</Text>

              <View style={styles.checkCard}>
                <View style={styles.checkRow}>
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>

                  <Text style={styles.checkText}>
                    Confirm material availability
                  </Text>
                </View>

                <View style={styles.checkRow}>
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>

                  <Text style={styles.checkText}>Include delivery charges</Text>
                </View>

                <View style={styles.checkRow}>
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  </View>

                  <Text style={styles.checkText}>
                    Mention expected delivery time
                  </Text>
                </View>
              </View>
            </View>

            {/* TRUST */}

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
                  BuildSathi Seller Protection
                </Text>

                <Text style={styles.trustText}>
                  Your quote and buyer communication stay protected through
                  BuildSathi.
                </Text>
              </View>
            </View>

            <View style={{ height: 130 }} />
          </ScrollView>

          {/* BOTTOM CTA */}

          <View style={styles.bottomBar}>
            <Pressable
              style={[
                styles.quoteButton,
                !canSendQuote && {
                  opacity: 0.5,
                },
              ]}
              disabled={!canSendQuote}
              onPress={() =>
                navigation.navigate("SendQuote", {
                  requirement,
                })
              }
            >
              <LinearGradient
                colors={["#FF7A00", "#FF9F1C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quoteGradient}
              >
                <Text style={styles.quoteButtonText}>
                  {canSendQuote ? "Send Quote" : statusLabel}
                </Text>

                {canSendQuote && (
                  <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default SellerRequirementDetailsScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF8EE",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#8C8175",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FF7A00",
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  infoSubValue: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#8C8175",
    fontWeight: "600",
  },

  buyerContact: {
    marginTop: 2,
    fontSize: 10,
    color: "#8C8175",
    fontWeight: "600",
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

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },

  /* HEADER */

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
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
    fontSize: 14,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  headerId: {
    fontSize: 9,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 2,
  },
  materialImage: {
    width: 47,
    height: 47,
    resizeMode: "cover",
    borderRadius: 12,
  },

  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    justifyContent: "center",
  },

  /* HERO */

  heroCard: {
    borderRadius: 18,
    // padding: 18,
    minHeight: 190,
    marginTop: 7,
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.16,
    shadowRadius: 13,
    elevation: 5,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingTop: 16,
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroEmoji: {
    fontSize: 25,
  },

  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  urgentText: {
    color: "#EA580C",
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 3,
    letterSpacing: 0.5,
  },

  heroLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFF3D6",
    letterSpacing: 1.2,
    marginTop: 20,
    paddingHorizontal: 14,
  },

  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2,
    paddingHorizontal: 14,
  },

  heroQuantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    paddingHorizontal: 14,
  },

  heroQuantity: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  heroUnit: {
    fontSize: 10,
    color: "#FFF3D6",
    fontWeight: "700",
  },

  heroDot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 7,
    opacity: 0.7,
  },

  heroLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    paddingHorizontal: 14,
  },

  heroLocationText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 5,
  },

  /* POSTED */

  postedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 11,
    marginBottom: 21,
    paddingHorizontal: 3,
  },

  postedLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  postedText: {
    color: "#8C8175",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFFAF1",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#22A447",
    marginRight: 5,
  },

  liveText: {
    color: "#228B3D",
    fontSize: 12,
    fontWeight: "800",
  },

  /* SECTION */

  section: {
    marginBottom: 21,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0A0A0A",
    marginBottom: 11,
  },

  /* SUMMARY */

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFF4E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 14,
    color: "#8C8175",
    fontWeight: "600",
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 13,
    color: "#0A0A0A",
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: "#F4ECE2",
  },

  /* NOTE */

  noteCard: {
    backgroundColor: "#FFF9ED",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1DEB5",
    flexDirection: "row",
  },

  noteIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 16,
    color: "#665D54",
    fontWeight: "600",
  },

  /* BUYER */

  buyerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  buyerAvatar: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: "#FFF0DC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  buyerAvatarText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FF7A00",
  },

  buyerInfo: {
    flex: 1,
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
    marginTop: 2,
  },

  buyerVerified: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  buyerVerifiedText: {
    fontSize: 10,
    color: "#B0830D",
    fontWeight: "800",
    marginLeft: 4,
  },

  chatButton: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#FFF3E5",
    alignItems: "center",
    justifyContent: "center",
  },

  /* CHECK */

  checkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },

  checkIcon: {
    width: 21,
    height: 21,
    borderRadius: 7,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  checkText: {
    fontSize: 13,
    color: "#665D54",
    fontWeight: "700",
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
    width: 41,
    height: 41,
    borderRadius: 13,
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
    fontWeight: "900",
    color: "#0A0A0A",
  },

  trustText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 2,
  },

  /* BOTTOM */

  bottomBar: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: "#FFFCF7",
    borderTopWidth: 1,
    borderTopColor: "#F1E2D0",
    paddingHorizontal: 18,
    paddingTop: 11,
    paddingBottom: 12,
    flexDirection: "row",
    gap: 10,
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },

  chatBottomButton: {
    width: 82,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFF3E5",
    borderWidth: 1,
    borderColor: "#FFD9B0",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  chatBottomText: {
    color: "#FF7A00",
    fontSize: 11,
    fontWeight: "900",
  },

  quoteButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
  },

  quoteGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },

  quoteButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
