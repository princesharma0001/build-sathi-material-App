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
import { getBuyerQuotesApi, getSellerQuotesApi } from "../seller/quoteApi";

const SellerQuotesScreen = () => {
  const navigation = useNavigation<any>();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ============================================================
     FETCH QUOTES
  ============================================================ */

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getBuyerQuotesApi();

      console.log("SELLER QUOTES RESPONSE:", JSON.stringify(response, null, 2));

      const quoteList = response?.data?.quotes;

      setQuotes(Array.isArray(quoteList) ? quoteList : []);
    } catch (error: any) {
      console.error("GET SELLER QUOTES ERROR:", error?.response?.data || error);

      setQuotes([]);

      Toast.show({
        type: "error",
        text1: "Unable to load quotes",
        text2:
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /* ============================================================
     SCREEN FOCUS
  ============================================================ */

  useFocusEffect(
    useCallback(() => {
      fetchQuotes();
    }, [fetchQuotes])
  );

  /* ============================================================
     PULL TO REFRESH
  ============================================================ */

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      const response = await getBuyerQuotesApi();

      console.log("REFRESH SELLER QUOTES:", JSON.stringify(response, null, 2));

      const quoteList = response?.data?.quotes;

      setQuotes(Array.isArray(quoteList) ? quoteList : []);
    } catch (error: any) {
      console.error("REFRESH QUOTES ERROR:", error?.response?.data || error);

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

  /* ============================================================
     FILTERS
  ============================================================ */

  const filters = ["All", "Pending", "Accepted", "Rejected", "Expired"];

  /* ============================================================
     STATUS
  ============================================================ */

  const getStatusLabel = (status?: string) => {
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

  const getStatusColor = (status?: string) => {
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

  const getStatusBg = (status?: string) => {
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

  /* ============================================================
     MATERIAL ICON
  ============================================================ */

  const getMaterialIcon = (materialName?: string) => {
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

    if (name.includes("wood")) {
      return "🪵";
    }

    if (name.includes("paint")) {
      return "🎨";
    }

    return "📦";
  };

  /* ============================================================
     RELATIVE TIME
  ============================================================ */

  const getRelativeTime = (dateValue?: string) => {
    if (!dateValue) {
      return "";
    }

    const createdAt = new Date(dateValue);

    if (Number.isNaN(createdAt.getTime())) {
      return "";
    }

    const now = new Date();

    const diffMs = now.getTime() - createdAt.getTime();

    if (diffMs < 0) {
      return "Just now";
    }

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

  /* ============================================================
     CURRENCY
  ============================================================ */

  const formatCurrency = (amount: any) => {
    const numericAmount = Number(amount ?? 0);

    if (!Number.isFinite(numericAmount)) {
      return "₹0";
    }

    return `₹${numericAmount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const getRequirementComparison = useMemo(() => {
    const comparisonMap: Record<
      string,
      {
        lowestAmount: number;
        highestAmount: number;
        quoteCount: number;
        lowestQuoteId: string;
      }
    > = {};

    quotes.forEach((quote) => {
      const requirementId = quote?.requirement?.id;

      if (!requirementId) return;

      const amount = Number(quote?.totalAmount ?? 0);

      if (!Number.isFinite(amount)) return;

      if (!comparisonMap[requirementId]) {
        comparisonMap[requirementId] = {
          lowestAmount: amount,
          highestAmount: amount,
          quoteCount: 1,
          lowestQuoteId: quote?.id || "",
        };

        return;
      }

      comparisonMap[requirementId].quoteCount += 1;

      if (amount < comparisonMap[requirementId].lowestAmount) {
        comparisonMap[requirementId].lowestAmount = amount;

        comparisonMap[requirementId].lowestQuoteId = quote?.id || "";
      }

      if (amount > comparisonMap[requirementId].highestAmount) {
        comparisonMap[requirementId].highestAmount = amount;
      }
    });

    return comparisonMap;
  }, [quotes]);

  /* ============================================================
     FILTERED QUOTES
  ============================================================ */

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const status = quote?.status?.toUpperCase() || "";

      let matchesFilter = true;

      if (activeFilter === "Pending") {
        matchesFilter = status === "PENDING";
      }

      if (activeFilter === "Accepted") {
        matchesFilter = status === "ACCEPTED";
      }

      if (activeFilter === "Rejected") {
        matchesFilter = status === "REJECTED";
      }

      if (activeFilter === "Expired") {
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

  /* ============================================================
     STATS
  ============================================================ */

  const totalQuotes = quotes.length;

  const totalQuoteValue = useMemo(() => {
    return quotes.reduce(
      (sum, quote) => sum + Number(quote?.totalAmount ?? 0),
      0
    );
  }, [quotes]);

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

  /*
   * Response rate:
   * Accepted + Rejected / Total
   */
  const responseRate = useMemo(() => {
    if (totalQuotes === 0) {
      return 0;
    }

    const responded = acceptedQuotes + rejectedQuotes;

    return Math.round((responded / totalQuotes) * 100);
  }, [totalQuotes, acceptedQuotes, rejectedQuotes]);

  const sentCount = totalQuotes;

  /* ============================================================
     OPEN QUOTE
  ============================================================ */

  const openQuote = (quote: any) => {
    if (!quote?.id) {
      Toast.show({
        type: "error",
        text1: "Quote not found",
        text2: "Unable to open quote details.",
      });

      return;
    }

    navigation.navigate("QuoteDetails", {
      quoteId: quote.id,
    });
  };

  /* ============================================================
     LOADING
  ============================================================ */

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
            style={{
              marginTop: 16,
            }}
          />

          <Text style={styles.loadingTitle}>Loading your quotes...</Text>

          <Text style={styles.loadingText}>
            Fetching your latest quotations.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <LinearGradient
      colors={["#FFF3D6", "#FFF8EE", "#FFFFFF", "#FFFFFF"]}
      locations={[0, 0.38, 0.72, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

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
              <Ionicons
                name="notifications-outline"
                size={21}
                color="#0A0A0A"
              />

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
            /* ============================================================
     HEADER CONTENT
  ============================================================ */

            ListHeaderComponent={
              <>
                {/* INTRO */}

                <View style={styles.intro}>
                  <Text style={styles.introTitle}>Track your quotations</Text>

                  <Text style={styles.introSubtitle}>
                    Manage quotes you've sent to buyers.
                  </Text>
                </View>

                {/* OVERVIEW */}

                <LinearGradient
                  colors={["#0A0A0A", "#171717", "#30220A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.overviewCard}
                >
                  <View style={styles.overviewTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.overviewLabel}>
                        TOTAL QUOTE VALUE
                      </Text>

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

                      <Text style={styles.overviewStatLabel}>
                        Awaiting Reply
                      </Text>
                    </View>

                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewNumber}>
                        {String(acceptedQuotes).padStart(2, "0")}
                      </Text>

                      <Text style={styles.overviewStatLabel}>Accepted</Text>
                    </View>

                    <View style={styles.overviewStat}>
                      <Text style={styles.overviewNumber}>{responseRate}%</Text>

                      <Text style={styles.overviewStatLabel}>
                        Response Rate
                      </Text>
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
                  nestedScrollEnabled
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
            /* ============================================================
     QUOTE CARD
  ============================================================ */

            renderItem={({ item: quote }) => {
              const requirementIdRaw = quote?.requirement?.id || "";

              const comparison = getRequirementComparison[requirementIdRaw];

              const amount = Number(quote?.totalAmount ?? 0);

              const isLowestPrice =
                !!comparison &&
                comparison.quoteCount > 1 &&
                quote?.id === comparison.lowestQuoteId;

              const savingsVsHighest =
                comparison && comparison.highestAmount > amount
                  ? comparison.highestAmount - amount
                  : 0;

              const quoteCount = comparison?.quoteCount || 1;

              const materialName =
                quote?.requirement?.material?.name || "Material";

              const materialIcon = getMaterialIcon(materialName);

              const buyerName = quote?.seller?.name || "Seller";

              const buyerType = quote?.seller?.role || "Seller";

              const address = quote?.requirement?.deliveryAddress;

              const location =
                [address?.city, address?.state].filter(Boolean).join(", ") ||
                "Location not available";

              const quantity = `${quote?.requirement?.quantity ?? 0} ${
                quote?.requirement?.unit ?? ""
              }`.trim();

              const quoteId = quote?.id
                ? `QT-${String(quote.id).slice(0, 8).toUpperCase()}`
                : "QT-0000";

              const requirementId = quote?.requirement?.id
                ? `REQ-${String(quote.requirement.id)
                    .slice(0, 8)
                    .toUpperCase()}`
                : "REQ-0000";

              const status = getStatusLabel(quote?.status);

              const statusColor = getStatusColor(quote?.status);

              const statusBg = getStatusBg(quote?.status);

              const pricePerUnit = Number(quote?.pricePerUnit ?? 0);

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

                  {/* LOWEST PRICE */}

                  {isLowestPrice && (
                    <View style={styles.lowestPriceBanner}>
                      <View style={styles.lowestPriceLeft}>
                        <View style={styles.lowestPriceIcon}>
                          <Ionicons
                            name="trending-down"
                            size={15}
                            color="#16803C"
                          />
                        </View>

                        <View>
                          <Text style={styles.lowestPriceTitle}>
                            LOWEST PRICE
                          </Text>

                          <Text style={styles.lowestPriceSubtitle}>
                            Lowest quoted total for this requirement
                          </Text>
                        </View>
                      </View>

                      {savingsVsHighest > 0 && (
                        <View style={styles.savingsBadge}>
                          <Text style={styles.savingsBadgeText}>
                            Save {formatCurrency(savingsVsHighest)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

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

                  {/* COMPARISON */}

                  {quoteCount > 1 && (
                    <View style={styles.comparisonRow}>
                      <View style={styles.comparisonLeft}>
                        <Ionicons
                          name="git-compare-outline"
                          size={16}
                          color="#8C8175"
                        />

                        <Text style={styles.comparisonText}>
                          {quoteCount} quotes received for this requirement
                        </Text>
                      </View>

                      {!isLowestPrice && comparison && (
                        <Text style={styles.moreThanLowestText}>
                          {formatCurrency(amount - comparison.lowestAmount)}{" "}
                          higher
                        </Text>
                      )}
                    </View>
                  )}

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

                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color="#FF7A00"
                      />
                    </View>
                  </View>
                </Pressable>
              );
            }}
            /* ============================================================
     EMPTY STATE
  ============================================================ */

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
            /* ============================================================
     FOOTER
  ============================================================ */

            ListFooterComponent={
              <>
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
    </LinearGradient>
  );
};

export default SellerQuotesScreen;

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: "#FFF3D6",
  },

  brand: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#D4A017",
    marginBottom: 2,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#0A0A0A",
    letterSpacing: -0.5,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF7A00",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  /* INTRO */

  intro: {
    paddingTop: 22,
    paddingBottom: 17,
  },

  introTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  introSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#8C8175",
  },

  /* OVERVIEW */

  overviewCard: {
    borderRadius: 23,
    // padding: 19,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#3D321D",
  },

  overviewTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  overviewLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#BDB4A8",
    letterSpacing: 1.2,
  },

  overviewAmount: {
    marginTop: 5,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  overviewIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#3A2A0E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#59451D",
  },

  overviewDivider: {
    height: 1,
    backgroundColor: "#3C3428",
    marginVertical: 17,
  },

  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 18,
    paddingHorizontal: 18,
  },

  overviewStat: {
    flex: 1,
  },

  overviewNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  overviewStatLabel: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 13,
    color: "#A9A095",
  },

  /* QUICK STATS */

  quickStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  quickStatCard: {
    flex: 1,
    minHeight: 108,
    borderRadius: 18,
    padding: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  quickIconOrange: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
  },

  quickIconGold: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6D9",
  },

  quickIconGreen: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5EE",
  },

  quickNumber: {
    marginTop: 9,
    fontSize: 19,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  background: {
    flex: 1,
  },
  quickLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "700",
    color: "#8C8175",
  },

  /* SEARCH */

  searchBox: {
    minHeight: 50,
    marginTop: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: 13,
    color: "#0A0A0A",
  },

  /* FILTER */

  filterScroll: {
    paddingTop: 12,
    paddingBottom: 3,
    paddingRight: 5,
    gap: 8,
  },

  filterChip: {
    minHeight: 38,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  filterChipActive: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },

  filterText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8C8175",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 22,
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#9B8F82",
  },

  sortButton: {
    height: 35,
    paddingHorizontal: 11,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF4E8",
    borderWidth: 1,
    borderColor: "#F4DEC4",
  },

  sortText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FF7A00",
  },

  /* QUOTE CARD */

  quoteCard: {
    marginBottom: 13,
    padding: 15,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  materialRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  materialIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4E8",
  },

  materialEmoji: {
    fontSize: 22,
  },

  materialInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  materialName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  quoteId: {
    marginTop: 3,
    fontSize: 9,
    color: "#A09385",
    fontWeight: "700",
  },

  statusBadge: {
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  /* BUYER */

  buyerRow: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F5EBDD",
    flexDirection: "row",
    alignItems: "center",
  },

  buyerAvatar: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#172554",
  },

  buyerAvatarText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  buyerInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  buyerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  buyerName: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  buyerMeta: {
    marginTop: 3,
    fontSize: 10,
    color: "#8C8175",
  },

  /* VALUE */

  quoteValueCard: {
    marginTop: 14,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#FFF9F0",
    borderWidth: 1,
    borderColor: "#F3E3CE",
    flexDirection: "row",
    alignItems: "center",
  },

  valueLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#9C8F80",
  },

  quoteAmount: {
    marginTop: 3,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  priceInfo: {
    width: 105,
    paddingLeft: 12,
    marginLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#E9DAC7",
  },

  priceValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "900",
    color: "#D4A017",
  },

  /* DETAILS */

  detailsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 12,
  },

  detail: {
    flex: 1,
    minWidth: 0,
    padding: 11,
    borderRadius: 14,
    backgroundColor: "#FCFAF7",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#A09385",
  },

  detailValue: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "800",
    color: "#2B241E",
  },

  /* FOOTER */

  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3E7D9",
    flexDirection: "row",
    alignItems: "center",
  },

  sentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9B8F82",
  },

  validityText: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "800",
    color: "#D4A017",
  },

  detailsButton: {
    minHeight: 35,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: "#FFF4E8",
    borderWidth: 1,
    borderColor: "#F4DEC4",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  detailsButtonText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FF7A00",
  },

  /* EMPTY */

  emptyState: {
    marginTop: 12,
    paddingHorizontal: 25,
    paddingVertical: 35,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5DC",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    color: "#8C8175",
  },

  clearButton: {
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
  },

  clearButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  /* TIP */

  tipCard: {
    marginTop: 18,
    padding: 15,
    borderRadius: 19,
    backgroundColor: "#FFF7E6",
    borderWidth: 1,
    borderColor: "#F0D9A6",
    flexDirection: "row",
  },

  tipIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0C9",
  },

  tipContent: {
    flex: 1,
    marginLeft: 11,
  },

  tipTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2A2117",
  },

  tipText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: "#8A7656",
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#FFF8EE",
  },

  loadingIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
  },

  loadingTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  loadingText: {
    marginTop: 5,
    fontSize: 11,
    color: "#8C8175",
  },

  lowestPriceBanner: {
    marginTop: 14,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderRadius: 14,
    backgroundColor: "#EDF8F0",
    borderWidth: 1,
    borderColor: "#CBE8D2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lowestPriceLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  lowestPriceIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#DDF2E3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  lowestPriceTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#16803C",
    letterSpacing: 0.5,
  },

  lowestPriceSubtitle: {
    marginTop: 2,
    fontSize: 9,
    color: "#5F7867",
  },

  savingsBadge: {
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#16803C",
  },

  savingsBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  comparisonRow: {
    marginTop: 10,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  comparisonLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  comparisonText: {
    marginLeft: 6,
    fontSize: 10,
    color: "#8C8175",
    fontWeight: "700",
  },

  moreThanLowestText: {
    marginLeft: 8,
    fontSize: 10,
    color: "#C05A5A",
    fontWeight: "900",
  },
});
