import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  StatusBar,
  FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getSellerQuotesApi } from "./quoteApi";

const SellerQuotesScreen = () => {
  const navigation = useNavigation<any>();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * ============================================================
   * FETCH SELLER QUOTES
   * ============================================================
   */

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getSellerQuotesApi();
      console.log("quotation send me", response);

      const quoteList = response?.data?.quotes || [];

      setQuotes(Array.isArray(quoteList) ? quoteList : []);
    } catch (error: any) {
      console.error("GET SELLER QUOTES ERROR:", error);

      Toast.show({
        type: "error",
        text1: "Unable to load quotes",
        text2:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      });

      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh every time screen gets focus
   */
  useFocusEffect(
    useCallback(() => {
      fetchQuotes();
    }, [fetchQuotes])
  );

  /**
   * Pull to refresh
   */
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await getSellerQuotesApi();

      const quoteList = response?.data?.quotes || [];

      setQuotes(Array.isArray(quoteList) ? quoteList : []);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Refresh failed",
        text2:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to refresh quotes",
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * ============================================================
   * FILTERS
   * ============================================================
   *
   * Backend statuses:
   *
   * PENDING
   * ACCEPTED
   * REJECTED
   * EXPIRED
   */

  const filters = ["All", "Pending", "Accepted", "Rejected", "Expired"];

  /**
   * ============================================================
   * STATUS HELPERS
   * ============================================================
   */

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "Pending";

      case "ACCEPTED":
        return "Accepted";

      case "REJECTED":
        return "Rejected";

      case "EXPIRED":
        return "Expired";

      default:
        return status || "Pending";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED":
        return "#3B8A58";

      case "REJECTED":
        return "#C05A5A";

      case "EXPIRED":
        return "#A36A6A";

      case "PENDING":
      default:
        return "#FF7A00";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED":
        return "#EAF5EE";

      case "REJECTED":
        return "#FCECEC";

      case "EXPIRED":
        return "#F6EAEA";

      case "PENDING":
      default:
        return "#FFF0DF";
    }
  };

  /**
   * ============================================================
   * MATERIAL ICON
   * ============================================================
   */

  const getMaterialIcon = (materialName: string) => {
    const name = materialName?.toLowerCase() || "";

    if (name.includes("cement")) {
      return "🧱";
    }

    if (name.includes("sand")) {
      return "🏖️";
    }

    if (name.includes("aggregate")) {
      return "🪨";
    }

    if (name.includes("brick")) {
      return "🧱";
    }

    if (name.includes("steel")) {
      return "🔩";
    }

    if (name.includes("tile")) {
      return "🔲";
    }

    return "📦";
  };

  /**
   * ============================================================
   * DATE / TIME
   * ============================================================
   */

  const getRelativeTime = (dateValue: string) => {
    if (!dateValue) {
      return "";
    }

    const createdAt = new Date(dateValue);

    if (Number.isNaN(createdAt.getTime())) {
      return "";
    }

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

  /**
   * ============================================================
   * CURRENCY
   * ============================================================
   */

  const formatCurrency = (amount: any) => {
    const numericAmount = Number(amount || 0);

    if (!Number.isFinite(numericAmount)) {
      return "₹0";
    }

    return `₹${numericAmount.toLocaleString("en-IN")}`;
  };

  /**
   * ============================================================
   * FILTERED QUOTES
   * ============================================================
   */

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const status = quote?.status?.toUpperCase() || "";

      let matchesFilter = true;

      if (activeFilter === "Pending") {
        matchesFilter = status === "PENDING";
      } else if (activeFilter === "Accepted") {
        matchesFilter = status === "ACCEPTED";
      } else if (activeFilter === "Rejected") {
        matchesFilter = status === "REJECTED";
      } else if (activeFilter === "Expired") {
        matchesFilter = status === "EXPIRED";
      }

      const materialName = quote?.requirement?.material?.name || "";

      const buyerName = quote?.requirement?.buyer?.name || "";

      const address = quote?.requirement?.deliveryAddress;

      const location = [address?.city, address?.state]
        .filter(Boolean)
        .join(", ");

      const quoteId = quote?.id || "";

      const requirementId = quote?.requirement?.id || "";

      const matchesSearch =
        !query ||
        materialName.toLowerCase().includes(query) ||
        buyerName.toLowerCase().includes(query) ||
        location.toLowerCase().includes(query) ||
        quoteId.toLowerCase().includes(query) ||
        requirementId.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [quotes, activeFilter, search]);

  /**
   * ============================================================
   * OVERVIEW STATS
   * ============================================================
   */

  const totalQuoteValue = useMemo(() => {
    return quotes.reduce((sum, quote) => {
      return sum + Number(quote?.totalAmount || 0);
    }, 0);
  }, [quotes]);

  const totalQuotes = quotes.length;

  const pendingQuotes = useMemo(() => {
    return quotes.filter((quote) => quote?.status?.toUpperCase() === "PENDING")
      .length;
  }, [quotes]);

  const acceptedQuotes = useMemo(() => {
    return quotes.filter((quote) => quote?.status?.toUpperCase() === "ACCEPTED")
      .length;
  }, [quotes]);

  const rejectedQuotes = useMemo(() => {
    return quotes.filter((quote) => quote?.status?.toUpperCase() === "REJECTED")
      .length;
  }, [quotes]);

  const expiredQuotes = useMemo(() => {
    return quotes.filter((quote) => quote?.status?.toUpperCase() === "EXPIRED")
      .length;
  }, [quotes]);

  /**
   * Response rate
   *
   * For now calculated from quotes that are
   * no longer pending.
   */

  const responseRate = useMemo(() => {
    if (totalQuotes === 0) {
      return 0;
    }

    const responded = acceptedQuotes + rejectedQuotes + expiredQuotes;

    return Math.round((responded / totalQuotes) * 100);
  }, [totalQuotes, acceptedQuotes, rejectedQuotes, expiredQuotes]);

  /**
   * Quick stats
   */

  const sentCount = totalQuotes;

  /**
   * ============================================================
   * OPEN QUOTE DETAILS
   * ============================================================
   */

  const openQuote = (quote: any) => {
    navigation.navigate("SellerQuoteDetails", {
      quoteId: quote?.id,
    });
  };

  /**
   * ============================================================
   * LOADING STATE
   * ============================================================
   */

  if (loading && quotes.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="dark-content"
        />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Ionicons name="pricetag-outline" size={30} color="#FF7A00" />
          </View>

          <ActivityIndicator
            size="small"
            color="#FF7A00"
            style={{ marginTop: 16 }}
          />

          <Text style={styles.loadingTitle}>Loading your quotes...</Text>

          <Text style={styles.loadingText}>
            Fetching your latest quotations.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <View>
            <Text style={styles.brand}>NEEVSATHI</Text>

            <Text style={styles.title}>My Quotes</Text>
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
          data={filteredQuotes}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF7A00"
              colors={["#FF7A00"]}
            />
          }
          ListHeaderComponent={
            <>
              {/* INTRO */}
              <View style={styles.intro}>
                <Text style={styles.introTitle}>Track your quotations</Text>

                <Text style={styles.introSubtitle}>
                  Manage quotes you've sent to buyers.
                </Text>
              </View>

              {/* OVERVIEW CARD */}
              <LinearGradient
                colors={["#0A0A0A", "#171717", "#30220A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.overviewCard}
              >
                <View style={styles.overviewTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.overviewLabel}>TOTAL QUOTE VALUE</Text>

                    <Text
                      style={styles.overviewAmount}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.6}
                    >
                      {formatCurrency(totalQuoteValue)}
                    </Text>
                  </View>

                  <View style={styles.overviewIcon}>
                    <Ionicons name="pricetag" size={21} color="#FFD76A" />
                  </View>
                </View>

                <View style={styles.overviewDivider} />

                <View style={styles.overviewStats}>
                  <View style={styles.overviewStat}>
                    <Text style={styles.overviewNumber}>
                      {String(totalQuotes).padStart(2, "0")}
                    </Text>

                    <Text style={styles.overviewStatLabel}>Total Quotes</Text>
                  </View>

                  <View style={styles.overviewStat}>
                    <Text style={styles.overviewNumber}>
                      {String(pendingQuotes).padStart(2, "0")}
                    </Text>

                    <Text style={styles.overviewStatLabel}>Awaiting Reply</Text>
                  </View>

                  <View style={styles.overviewStat}>
                    <Text style={styles.overviewNumber}>
                      {String(acceptedQuotes).padStart(2, "0")}
                    </Text>

                    <Text style={styles.overviewStatLabel}>Accepted</Text>
                  </View>

                  <View style={styles.overviewStat}>
                    <Text style={styles.overviewNumber}>{responseRate}%</Text>

                    <Text style={styles.overviewStatLabel}>Response Rate</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* QUICK STATS */}
              <View style={styles.quickStats}>
                <View style={styles.quickStatCard}>
                  <View style={styles.quickIconOrange}>
                    <Ionicons name="send-outline" size={17} color="#FF7A00" />
                  </View>

                  <Text style={styles.quickNumber}>
                    {String(sentCount).padStart(2, "0")}
                  </Text>

                  <Text style={styles.quickLabel}>Sent</Text>
                </View>

                <View style={styles.quickStatCard}>
                  <View style={styles.quickIconGold}>
                    <Ionicons name="time-outline" size={17} color="#D4A017" />
                  </View>

                  <Text style={styles.quickNumber}>
                    {String(pendingQuotes).padStart(2, "0")}
                  </Text>

                  <Text style={styles.quickLabel}>Pending</Text>
                </View>

                <View style={styles.quickStatCard}>
                  <View style={styles.quickIconGreen}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={17}
                      color="#3B8A58"
                    />
                  </View>

                  <Text style={styles.quickNumber}>
                    {String(acceptedQuotes).padStart(2, "0")}
                  </Text>

                  <Text style={styles.quickLabel}>Accepted</Text>
                </View>
              </View>

              {/* SEARCH */}
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={19} color="#9B8F82" />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search quotes, buyers or materials"
                  placeholderTextColor="#A79B8D"
                  style={styles.searchInput}
                  returnKeyType="search"
                />

                {search.length > 0 && (
                  <Pressable onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={18} color="#B5A99B" />
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

              {/* SECTION HEADER */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Your Quotations</Text>

                  <Text style={styles.sectionSubtitle}>
                    {filteredQuotes.length}{" "}
                    {filteredQuotes.length === 1 ? "quote" : "quotes"}
                  </Text>
                </View>

                <View style={styles.sortButton}>
                  <Ionicons
                    name="swap-vertical-outline"
                    size={15}
                    color="#FF7A00"
                  />

                  <Text style={styles.sortText}>Recent</Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item: quote }) => {
            const materialName =
              quote?.requirement?.material?.name || "Material";

            const materialIcon = getMaterialIcon(materialName);

            const buyerName = quote?.requirement?.buyer?.name || "Buyer";

            const buyerType = "Buyer";

            const address = quote?.requirement?.deliveryAddress;

            const location =
              [address?.city, address?.state].filter(Boolean).join(", ") ||
              "Location not available";

            const quantity = `${quote?.requirement?.quantity || 0} ${
              quote?.requirement?.unit || ""
            }`.trim();

            const quoteId = quote?.id
              ? `QT-${String(quote.id).slice(0, 8).toUpperCase()}`
              : "QT-0000";

            const requirementId = quote?.requirement?.id
              ? `REQ-${String(quote.requirement.id).slice(0, 8).toUpperCase()}`
              : "REQ-0000";

            const status = getStatusLabel(quote?.status);

            const statusColor = getStatusColor(quote?.status);

            const statusBg = getStatusBg(quote?.status);

            const amount = Number(quote?.totalAmount || 0);

            const pricePerUnit = Number(quote?.pricePerUnit || 0);

            const deliveryTime = quote?.deliveryTime || "Not specified";

            const validity = quote?.validity
              ? `Valid for ${quote.validity}`
              : "Validity not specified";

            const sentAt = getRelativeTime(quote?.createdAt);

            return (
              <Pressable
                onPress={() => openQuote(quote)}
                style={({ pressed }) => [
                  styles.quoteCard,
                  pressed && {
                    transform: [{ scale: 0.985 }],
                  },
                ]}
              >
                {/* CARD HEADER */}
                <View style={styles.cardHeader}>
                  <View style={styles.materialRow}>
                    <View style={styles.materialIcon}>
                      <Text style={styles.materialEmoji}>{materialIcon}</Text>
                    </View>

                    <View style={styles.materialInfo}>
                      <Text style={styles.materialName}>{materialName}</Text>

                      <Text style={styles.quoteId}>
                        {quoteId} • {requirementId}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusBg,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: statusColor,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: statusColor,
                        },
                      ]}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                {/* BUYER */}
                <View style={styles.buyerRow}>
                  <View style={styles.buyerAvatar}>
                    <Text style={styles.buyerAvatarText}>
                      {buyerName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.buyerInfo}>
                    <View style={styles.buyerNameRow}>
                      <Text style={styles.buyerName} numberOfLines={1}>
                        {buyerName}
                      </Text>

                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color="#3B8A58"
                      />
                    </View>

                    <Text style={styles.buyerMeta} numberOfLines={1}>
                      {buyerType} • {location}
                    </Text>
                  </View>
                </View>

                {/* QUOTE VALUE */}
                <View style={styles.quoteValueCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.valueLabel}>YOUR QUOTE</Text>

                    <Text
                      style={styles.quoteAmount}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.65}
                    >
                      {formatCurrency(amount)}
                    </Text>
                  </View>

                  <View style={styles.priceInfo}>
                    <Text style={styles.valueLabel}>PRICE / UNIT</Text>

                    <Text
                      style={styles.priceValue}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {formatCurrency(pricePerUnit)}
                    </Text>
                  </View>
                </View>

                {/* DETAILS */}
                <View style={styles.detailsRow}>
                  <View style={styles.detail}>
                    <Ionicons name="cube-outline" size={20} color="#FF7A00" />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Quantity</Text>

                      <Text style={styles.detailValue} numberOfLines={1}>
                        {quantity}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detail}>
                    <Ionicons name="time-outline" size={20} color="#D4A017" />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Delivery</Text>

                      <Text style={styles.detailValue} numberOfLines={1}>
                        {deliveryTime}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* FOOTER */}
                <View style={styles.cardFooter}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sentText}>Sent {sentAt}</Text>

                    <Text style={styles.validityText}>{validity}</Text>
                  </View>

                  <View style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>View Details</Text>

                    <Ionicons name="arrow-forward" size={15} color="#FF7A00" />
                  </View>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="pricetag-outline" size={30} color="#D4A017" />
              </View>

              <Text style={styles.emptyTitle}>
                {quotes.length === 0 ? "No quotes yet" : "No quotes found"}
              </Text>

              <Text style={styles.emptyText}>
                {quotes.length === 0
                  ? "Quotes you send to buyers will appear here."
                  : "Try another search or change the quote filter."}
              </Text>

              {quotes.length > 0 && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => {
                    setSearch("");
                    setActiveFilter("All");
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </Pressable>
              )}
            </View>
          }
          ListFooterComponent={
            <>
              {/* SELLER TIP */}
              <View style={styles.tipCard}>
                <View style={styles.tipIcon}>
                  <Ionicons name="bulb-outline" size={27} color="#D4A017" />
                </View>

                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>
                    Improve your quote response
                  </Text>

                  <Text style={styles.tipText}>
                    Add clear delivery timelines and competitive pricing to
                    increase buyer confidence.
                  </Text>
                </View>
              </View>

              <View style={{ height: 110 }} />
            </>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default SellerQuotesScreen;

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
    paddingTop: 6,
  },

  /* HEADER */

  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1E2D0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    fontSize: 9,
    letterSpacing: 2.2,
    fontWeight: "900",
    color: "#D4A017",
    marginBottom: 3,
  },

  title: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0A0A0A",
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

  intro: {
    paddingTop: 18,
    paddingBottom: 13,
  },

  introTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  introSubtitle: {
    fontSize: 10,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 4,
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#FFF3E5",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0A0A0A",
    marginTop: 14,
  },

  loadingText: {
    fontSize: 11,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 5,
  },

  /* OVERVIEW */

  overviewCard: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#33280F",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },

  overviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
  },

  overviewLabel: {
    color: "#BDB4A6",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1,
  },

  overviewAmount: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 5,
    flexShrink: 1,
    maxWidth: "100%",
  },

  overviewIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "rgba(255,215,106,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  overviewDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 15,
  },

  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 16,
  },

  overviewStat: {
    flex: 1,
  },

  overviewNumber: {
    fontSize: 15,
    color: "#FFD76A",
    fontWeight: "900",
  },

  overviewStatLabel: {
    fontSize: 10,
    color: "#BDB4A6",
    fontWeight: "600",
    marginTop: 3,
  },

  /* QUICK STATS */

  quickStats: {
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
    marginBottom: 18,
  },

  quickStatCard: {
    flex: 1,
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    borderRadius: 17,
    padding: 10,
  },

  quickIconOrange: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
  },

  quickIconGold: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#FFF7D9",
    alignItems: "center",
    justifyContent: "center",
  },

  quickIconGreen: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#EAF5EE",
    alignItems: "center",
    justifyContent: "center",
  },

  quickNumber: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0A0A0A",
    marginTop: 7,
  },

  quickLabel: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "700",
    marginTop: 2,
  },

  /* SEARCH */

  searchBox: {
    height: 52,
    backgroundColor: "#FFFCF7",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    height: "100%",
    color: "#0A0A0A",
    fontSize: 14,
    fontWeight: "600",
  },

  /* FILTER */

  filterScroll: {
    paddingTop: 12,
    paddingBottom: 18,
    gap: 8,
  },

  filterChip: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 17,
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    justifyContent: "center",
  },

  filterChipActive: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },

  filterText: {
    fontSize: 14,
    color: "#8C8175",
    fontWeight: "700",
  },

  filterTextActive: {
    color: "#FFFFFF",
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
    color: "#0A0A0A",
    fontWeight: "900",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#9B8F82",
    fontWeight: "600",
    marginTop: 3,
  },

  sortButton: {
    height: 31,
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

  /* QUOTE CARD */

  quoteCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 14,
    marginBottom: 13,
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  materialIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FFF0D8",
    alignItems: "center",
    justifyContent: "center",
  },

  materialEmoji: {
    fontSize: 23,
  },

  materialInfo: {
    marginLeft: 10,
    flex: 1,
    minWidth: 0,
  },

  materialName: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  quoteId: {
    fontSize: 12,
    color: "#A2978A",
    fontWeight: "600",
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
    marginLeft: 8,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },

  /* BUYER */

  buyerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1E8DD",
  },

  buyerAvatar: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
  },

  buyerAvatarText: {
    color: "#FFD76A",
    fontSize: 14,
    fontWeight: "900",
  },

  buyerInfo: {
    marginLeft: 9,
    flex: 1,
    minWidth: 0,
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
    flexShrink: 1,
  },

  buyerMeta: {
    fontSize: 10,
    color: "#958A7D",
    fontWeight: "600",
    marginTop: 2,
  },

  /* VALUE */

  quoteValueCard: {
    marginTop: 12,
    borderRadius: 15,
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F0DDAF",
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  valueLabel: {
    fontSize: 10,
    color: "#A29483",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  quoteAmount: {
    fontSize: 18,
    color: "#FF7A00",
    fontWeight: "900",
    marginTop: 3,
    flexShrink: 1,
    maxWidth: "100%",
  },

  priceInfo: {
    alignItems: "flex-end",
    maxWidth: "42%",
    marginLeft: 10,
  },

  priceValue: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "900",
    marginTop: 4,
  },

  /* DETAILS */

  detailsRow: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 20,
  },

  detail: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
    minWidth: 0,
  },

  detailLabel: {
    fontSize: 12,
    color: "#A2978A",
    fontWeight: "700",
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 12,
    color: "#0A0A0A",
    fontWeight: "800",
  },

  /* FOOTER */

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1E8DD",
    paddingTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sentText: {
    fontSize: 13,
    color: "#9B8F82",
    fontWeight: "600",
  },

  validityText: {
    fontSize: 10,
    color: "#3B8A58",
    fontWeight: "800",
    marginTop: 2,
  },

  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 10,
  },

  detailsButtonText: {
    fontSize: 12,
    color: "#FF7A00",
    fontWeight: "800",
  },

  /* EMPTY */

  emptyState: {
    backgroundColor: "#FFFCF7",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    paddingVertical: 35,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: "#FFF3E5",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "900",
    marginTop: 12,
  },

  emptyText: {
    fontSize: 9,
    color: "#8C8175",
    textAlign: "center",
    fontWeight: "600",
    marginTop: 5,
  },

  clearButton: {
    marginTop: 14,
    backgroundColor: "#FF7A00",
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },

  /* TIP */

  tipCard: {
    marginTop: 18,
    padding: 13,
    backgroundColor: "#FFF8E8",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0DDAF",
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  tipText: {
    fontSize: 10,
    lineHeight: 13,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 3,
  },
});
