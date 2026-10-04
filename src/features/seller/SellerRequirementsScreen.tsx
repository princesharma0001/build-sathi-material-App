import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
  FlatList,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getSellerRequirementsApi } from "./seller.api";

const SellerRequirementsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const initialMaterial = route.params?.material || "All";

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialMaterial);
  const [showFilters, setShowFilters] = useState(false);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const filters = ["All", "Cement", "Sand", "Aggregate", "Bricks"];

  const filteredRequirements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requirements.filter((item) => {
      const materialName = item?.material?.name || "";

      const location = [
        item?.deliveryAddress?.city,
        item?.deliveryAddress?.state,
      ]
        .filter(Boolean)
        .join(", ");

      const buyerName = item?.buyer?.name || "";

      const matchesFilter =
        activeFilter === "All" ||
        materialName.toLowerCase() === activeFilter.toLowerCase();

      const matchesSearch =
        !query ||
        materialName.toLowerCase().includes(query) ||
        location.toLowerCase().includes(query) ||
        buyerName.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [requirements, activeFilter, search]);

  const openRequirement = (requirement: any) => {
    navigation.navigate("SellerRequirementDetails", {
      requirementId: requirement.id,
    });
  };
  const todayRequirements = useMemo(() => {
    const today = new Date();

    return requirements.filter((item) => {
      if (!item?.createdAt) {
        return false;
      }

      const date = new Date(item.createdAt);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;
  }, [requirements]);

  const openRequirements = useMemo(() => {
    return requirements.filter((item) => item?.status === "OPEN").length;
  }, [requirements]);

  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getSellerRequirementsApi();

      console.log("✅ SELLER REQUIREMENTS:", data);

      setRequirements(data || []);
    } catch (error: any) {
      console.log(
        "❌ SELLER REQUIREMENTS ERROR:",
        error?.response?.data || error?.message
      );

      Toast.show({
        type: "error",
        text1: "Unable to load requirements",
        text2:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequirements();
    }, [fetchRequirements])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="#FFF8EE"
      />

      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>NEEVSATHI</Text>

            <View style={styles.titleRow}>
              <Text style={styles.title}>Buyer Requirements</Text>

              <View style={styles.liveDot}>
                <View style={styles.dot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.headerIcon}
            onPress={() => navigation.navigate("SellerNotifications")}
          >
            <Ionicons name="notifications-outline" size={21} color="#0A0A0A" />

            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <FlatList
          data={filteredRequirements}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* INTRO */}
              <View style={styles.introSection}>
                <Text style={styles.introTitle}>Find your next order</Text>

                <Text style={styles.introSubtitle}>
                  Discover buyer requirements and send competitive quotes.
                </Text>
              </View>

              {/* SEARCH */}
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#9B8F82" />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search material, location or buyer"
                  placeholderTextColor="#A79B8D"
                  style={styles.searchInput}
                  returnKeyType="search"
                />

                {search.length > 0 && (
                  <Pressable onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={19} color="#B6AA9D" />
                  </Pressable>
                )}
              </View>

              {/* FILTERS */}
              <FlatList
                data={filters}
                horizontal
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
                renderItem={({ item: filter }) => {
                  const active = activeFilter === filter;

                  return (
                    <Pressable
                      onPress={() => setActiveFilter(filter)}
                      style={[
                        styles.filterChip,
                        active && styles.filterChipActive,
                      ]}
                    >
                      {filter !== "All" && (
                        <View
                          style={[
                            styles.filterMiniIcon,
                            active && styles.filterMiniIconActive,
                          ]}
                        >
                          <Text style={styles.filterEmoji}>
                            {filter === "Cement"
                              ? "🧱"
                              : filter === "Sand"
                              ? "🏖️"
                              : filter === "Aggregate"
                              ? "🪨"
                              : "🧱"}
                          </Text>
                        </View>
                      )}

                      <Text
                        style={[
                          styles.filterText,
                          active && styles.filterTextActive,
                        ]}
                      >
                        {filter}
                      </Text>
                    </Pressable>
                  );
                }}
              />

              {/* STATS */}
              <View style={styles.statsRow}>
                <View style={styles.statCardLight}>
                  <View style={styles.statIconGold}>
                    <Ionicons name="flash" size={17} color="#D4A017" />
                  </View>

                  <Text style={styles.statNumber}>
                    {String(todayRequirements).padStart(2, "0")}
                  </Text>

                  <Text style={styles.statLabel}>New Todays</Text>
                </View>

                <View style={styles.statCardLight}>
                  <View style={styles.statIconGold}>
                    <Ionicons name="time-outline" size={17} color="#D4A017" />
                  </View>

                  <Text style={styles.statNumber}>
                    {String(openRequirements).padStart(2, "0")}
                  </Text>

                  <Text style={styles.statLabel}>Open Requests</Text>
                </View>

                <View style={styles.statCardLight}>
                  <View style={styles.statIconGreen}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={17}
                      color="#3B8A58"
                    />
                  </View>

                  <Text style={styles.statNumber}>05</Text>

                  <Text style={styles.statLabel}>Matching You</Text>
                </View>
              </View>

              {/* SECTION HEADER */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Available Requirements
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    {filteredRequirements.length} requirements found
                  </Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item, index }) => (
            <RequirementCard
              requirement={item}
              onPress={() => openRequirement(item)}
              isFirst={index === 0}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="search-outline" size={30} color="#D4A017" />
                </View>

                <Text style={styles.emptyTitle}>No requirements found</Text>

                <Text style={styles.emptyText}>
                  Try another material, location or buyer name.
                </Text>

                <Pressable
                  style={styles.clearButton}
                  onPress={() => {
                    setSearch("");
                    setActiveFilter("All");
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </Pressable>
              </View>
            ) : null
          }
          ListFooterComponent={<View style={{ height: 70 }} />}
        />
      </View>
    </SafeAreaView>
  );
};

/* =========================================================
   REQUIREMENT CARD
========================================================= */

const RequirementCard = ({
  requirement,
  onPress,
}: {
  requirement: any;
  onPress: () => void;
  isFirst?: boolean;
}) => {
  // ==============================
  // MATERIAL
  // ==============================

  console.log("sgsgs", requirement);

  const materialName = requirement?.material?.name || "Material";

  // const materialIcon = materialName.toLowerCase().includes("cement")
  //   ? "🧱"
  //   : materialName.toLowerCase().includes("sand")
  //   ? "🏖️"
  //   : materialName.toLowerCase().includes("aggregate")
  //   ? "🪨"
  //   : materialName.toLowerCase().includes("brick")
  //   ? "🧱"
  //   : "📦";

  const materialIcon = requirement?.material.imageUrl;

  const materialGradient = materialName.toLowerCase().includes("cement")
    ? ["#FFF0D8", "#FFE1B5"]
    : materialName.toLowerCase().includes("sand")
    ? ["#FFF8D8", "#F5E6A8"]
    : materialName.toLowerCase().includes("aggregate")
    ? ["#EEEEEE", "#DCDCDC"]
    : ["#FFE4D7", "#FFD0BC"];

  // ==============================
  // QUANTITY
  // ==============================

  const quantity = `${requirement?.quantity || 0} ${
    requirement?.unit || ""
  }`.trim();

  // ==============================
  // LOCATION
  // ==============================

  const address = requirement?.deliveryAddress;

  const location = [address?.city, address?.state].filter(Boolean).join(", ");

  const fullAddress = [
    address?.addressLine1,
    address?.addressLine2,
    address?.landmark,
    address?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  // ==============================
  // BUYER
  // ==============================

  const buyerName = requirement?.buyer?.name || "Buyer";

  const buyerInitial = buyerName.charAt(0).toUpperCase();

  // ==============================
  // DELIVERY
  // ==============================

  const deliveryPreference = requirement?.deliveryPreference || "Standard";

  const urgent = deliveryPreference.toUpperCase() === "URGENT";

  // ==============================
  // POSTED TIME
  // ==============================

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

  const posted = getPostedTime();

  // ==============================
  // NOTES
  // ==============================

  const notes = requirement?.notes || "No additional notes provided.";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.requirementCard,
        pressed && {
          transform: [{ scale: 0.985 }],
        },
      ]}
    >
      {/* TOP */}
      <View style={styles.requirementTop}>
        <View style={styles.materialRow}>
          <View style={styles.materialIcon}>
            <Image
              source={{ uri: materialIcon }}
              style={styles.materialImage}
              resizeMode="cover"
            />
            {/* <Text style={styles.materialEmoji}>{materialIcon}</Text> */}
          </View>

          <View style={styles.materialInfo}>
            <View style={styles.materialTitleRow}>
              <Text style={styles.materialName}>{materialName}</Text>

              {urgent && (
                <View style={styles.urgentBadge}>
                  <Ionicons name="flash" size={10} color="#FFFFFF" />

                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              )}
            </View>

            <Text style={styles.requirementId}>
              {requirement?.id
                ? `REQ-${requirement.id.slice(0, 8).toUpperCase()}`
                : "REQ"}
            </Text>
          </View>
        </View>

        <Pressable onPress={onPress} hitSlop={10} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={19} color="#8C8175" />
        </Pressable>
      </View>

      {/* QUANTITY */}
      <View style={styles.quantityBox}>
        <View>
          <Text style={styles.quantityLabel}>REQUIRED QUANTITY</Text>

          <Text style={styles.quantityValue}>{quantity}</Text>
        </View>

        <View style={styles.budgetBox}>
          <Text style={styles.quantityLabel}>STATUS</Text>

          <Text
            style={[
              styles.budgetValue,
              {
                color: requirement?.status === "OPEN" ? "#3B8A58" : "#D4A017",
              },
            ]}
          >
            {requirement?.status || "OPEN"}
          </Text>
        </View>
      </View>

      {/* DETAILS */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Ionicons name="location-outline" size={15} color="#FF7A00" />
          </View>

          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Delivery Location</Text>

            <Text style={styles.detailValue} numberOfLines={2}>
              {location || "Location not available"}
            </Text>

            {fullAddress ? (
              <Text
                style={{
                  fontSize: 11,
                  color: "#9B8F82",
                  fontWeight: "600",
                  marginTop: 2,
                }}
                numberOfLines={2}
              >
                {fullAddress}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Ionicons name="calendar-outline" size={15} color="#D4A017" />
          </View>

          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Delivery Needed</Text>

            <Text style={styles.detailValue}>{deliveryPreference}</Text>
          </View>
        </View>
      </View>

      {/* BUYER */}
      <View style={styles.buyerSection}>
        <View style={styles.buyerAvatar}>
          <Text style={styles.buyerAvatarText}>{buyerInitial}</Text>
        </View>

        <View style={styles.buyerInfo}>
          <View style={styles.buyerNameRow}>
            <Text style={styles.buyerName}>{buyerName}</Text>

            <Ionicons name="person-circle-outline" size={14} color="#8C8175" />
          </View>

          <Text style={styles.buyerType}>Buyer • {posted}</Text>
        </View>

        <View style={styles.verifiedPill}>
          <Text style={styles.verifiedText}>
            {requirement?.status || "OPEN"}
          </Text>
        </View>
      </View>

      {/* NOTES */}
      <View style={styles.noteBox}>
        <Ionicons name="information-circle-outline" size={15} color="#A48B62" />

        <Text numberOfLines={2} style={styles.noteText}>
          {notes}
        </Text>
      </View>

      {/* FOOTER */}
      <View style={styles.cardFooter}>
        <View style={styles.responseHint}>
          <Ionicons name="flash-outline" size={14} color="#D4A017" />

          <Text style={styles.responseText}>Respond quickly to stand out</Text>
        </View>

        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>

          <Ionicons name="arrow-forward" size={15} color="#FF7A00" />
        </View>
      </View>
    </Pressable>
  );
};

export default SellerRequirementsScreen;

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
    paddingTop: 4,
  },

  /* HEADER */

  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: '#FFF3D6',
    borderBottomWidth: 1,
    borderBottomColor: "#F1E2D0",
  },

  brand: {
    fontSize: 9,
    letterSpacing: 2.2,
    fontWeight: "900",
    color: "#D4A017",
    marginBottom: 3,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  liveDot: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF8",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#EEDFBF",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B8A58",
    marginRight: 4,
  },

  liveText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#3B8A58",
    letterSpacing: 0.5,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF7A00",
    borderWidth: 1.5,
    borderColor: "#FFFCF7",
  },

  /* INTRO */

  introSection: {
    paddingTop: 18,
    paddingBottom: 13,
  },

  introTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  introSubtitle: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 4,
    lineHeight: 15,
  },

  /* SEARCH */

  searchBox: {
    height: 52,
    borderRadius: 17,
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 5,
    shadowColor: "#8C5A2B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    fontSize: 11,
    color: "#0A0A0A",
    fontWeight: "600",
  },

  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FF7A00",
    alignItems: "center",
    justifyContent: "center",
  },

  materialImage: {
    width: 47,
    height: 47,
    resizeMode: "cover",
    borderRadius:12
  },

  /* FILTERS */

  filterScroll: {
    paddingTop: 12,
    paddingBottom: 17,
    gap: 8,
  },

  filterChip: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    flexDirection: "row",
    alignItems: "center",
  },

  filterChipActive: {
    backgroundColor: "#0A0A0A",
    borderColor: "#0A0A0A",
  },

  filterMiniIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: "#FFF3E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  filterMiniIconActive: {
    backgroundColor: "#2A2A2A",
  },

  filterEmoji: {
    fontSize: 14,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8C8175",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  /* STATS */

  statsRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 21,
  },

  statCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: 18,
    padding: 11,
    justifyContent: "space-between",
    overflow: "hidden",
  },

  statCardLight: {
    flex: 1,
    minHeight: 92,
    borderRadius: 18,
    padding: 11,
    justifyContent: "space-between",
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  statIconLight: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  statIconGold: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#FFF4D8",
    alignItems: "center",
    justifyContent: "center",
  },

  statIconGreen: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#EAF5EE",
    alignItems: "center",
    justifyContent: "center",
  },

  statNumberWhite: {
    fontSize: 19,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  statNumber: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  statLabelWhite: {
    fontSize: 8,
    color: "#FFF4E6",
    fontWeight: "700",
  },

  statLabel: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "700",
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#9B8F82",
    fontWeight: "600",
    marginTop: 3,
  },

  sortButton: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#FFF3E5",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  sortText: {
    fontSize: 12,
    color: "#FF7A00",
    fontWeight: "900",
  },

  /* FILTER PANEL */

  filterPanel: {
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    borderRadius: 18,
    padding: 14,
    marginBottom: 13,
  },

  filterPanelTitle: {
    fontSize: 13,
    color: "#0A0A0A",
    fontWeight: "900",
    marginBottom: 11,
  },

  filterPanelRow: {
    flexDirection: "row",
    gap: 8,
  },

  panelOption: {
    flex: 1,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#FFF8EE",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  panelOptionActive: {
    flex: 1,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#FFF0DF",
    borderWidth: 1,
    borderColor: "#FFD5A8",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  panelOptionText: {
    fontSize: 12,
    color: "#FF7A00",
    fontWeight: "900",
  },

  panelOptionTextMuted: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "800",
  },

  /* REQUIREMENT CARD */

  requirementCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 14,
    marginBottom: 13,
    shadowColor: "#8C5A2B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  requirementTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  materialIcon: {
    width: 47,
    height: 47,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  materialEmoji: {
    fontSize: 24,
  },

  materialInfo: {
    marginLeft: 10,
    flex: 1,
  },

  materialTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  materialName: {
    fontSize: 15,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A00",
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: 6,
  },

  urgentText: {
    fontSize: 6.5,
    color: "#FFFFFF",
    fontWeight: "900",
    marginLeft: 3,
    letterSpacing: 0.3,
  },

  requirementId: {
    fontSize: 8,
    color: "#A2978A",
    fontWeight: "600",
    marginTop: 3,
  },

  moreButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  /* QUANTITY */

  quantityBox: {
    marginTop: 14,
    backgroundColor: "#FFF8E8",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0DDAF",
  },

  quantityLabel: {
    fontSize: 11,
    color: "#A29483",
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 3,
  },

  quantityValue: {
    fontSize: 15,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  budgetBox: {
    alignItems: "flex-end",
  },

  budgetValue: {
    fontSize: 11,
    color: "#D4A017",
    fontWeight: "900",
  },

  /* DETAILS */

  detailsContainer: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1E8DD",
    gap: 11,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#FFF3E5",
    alignItems: "center",
    justifyContent: "center",
  },

  detailTextContainer: {
    marginLeft: 9,
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    color: "#A2978A",
    fontWeight: "700",
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "800",
  },

  /* BUYER */

  buyerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  buyerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },

  buyerAvatarText: {
    color: "#FFD76A",
    fontSize: 13,
    fontWeight: "900",
  },

  buyerInfo: {
    flex: 1,
    marginLeft: 9,
  },

  buyerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  buyerName: {
    fontSize: 13,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  buyerType: {
    fontSize: 12,
    color: "#958A7D",
    fontWeight: "600",
    marginTop: 2,
  },

  verifiedPill: {
    backgroundColor: "#EAF5EE",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },

  verifiedText: {
    fontSize: 10,
    color: "#3B8A58",
    fontWeight: "900",
  },

  /* NOTE */

  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF9F0",
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginBottom: 12,
  },

  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: "#8C8175",
    fontWeight: "600",
    marginLeft: 6,
  },

  /* FOOTER */

  cardFooter: {
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1E8DD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  responseHint: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  responseText: {
    fontSize: 12,
    color: "#9B8F82",
    fontWeight: "600",
    marginLeft: 4,
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  viewButtonText: {
    fontSize: 12,
    color: "#FF7A00",
    fontWeight: "900",
  },

  /* EMPTY */

  emptyState: {
    backgroundColor: "#FFFCF7",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: "#FFF3E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  emptyText: {
    fontSize: 9,
    color: "#8C8175",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 5,
  },

  clearButton: {
    marginTop: 14,
    backgroundColor: "#FF7A00",
    borderRadius: 11,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },

  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },

  /* TIP */

  tipCard: {
    borderRadius: 19,
    overflow: "hidden",
    marginTop: 5,
  },

  tipGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderWidth: 1,
    borderColor: "#F0DDAF",
    borderRadius: 19,
  },

  tipIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFDF8",
    alignItems: "center",
    justifyContent: "center",
  },

  tipContent: {
    flex: 1,
    marginLeft: 10,
  },

  tipTitle: {
    fontSize: 9,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  tipText: {
    fontSize: 8,
    lineHeight: 13,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 3,
  },
});
