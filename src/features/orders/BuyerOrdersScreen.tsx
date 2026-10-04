import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Image,
  FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getBuyerOrders } from "../buyer/buyer.api";

type OrderStatus = "Active" | "Delivered" | "Cancelled";

interface BuyerOrder {
  id: string;
  orderNumber?: string;

  quantity?: string | number;
  unit?: string;

  pricePerUnit?: string | number;
  materialAmount?: string | number;
  deliveryCharges?: string | number;
  totalAmount?: string | number;

  status?: string;

  createdAt?: string;
  dispatchDate?: string;
  expectedDeliveryDate?: string;
  deliveryNotes?: string;

  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;

  material?: {
    id?: string;
    name?: string;
    unit?: string;
    imageUrl?: string;
  };

  seller?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string | null;

    sellerProfile?: {
      id?: string;
      ownerName?: string;
      businessName?: string;
      businessType?: string;
      phone?: string;
      email?: string;
    };
  };

  deliveryAddress?: {
    city?: string;
    state?: string;
    pincode?: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
  };

  quote?: {
    pricePerUnit?: string | number;
    materialAmount?: string | number;
    deliveryCharges?: string | number;
    totalAmount?: string | number;
    deliveryTime?: string;
    validity?: string;
    status?: string;
  };
}

const BuyerOrdersScreen = ({ navigation }: any) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const filters = ["All", "Dispatched", "Delivered", "Completed", "Cancelled"];
  type OrderStatus =
    | "PENDING"
    | "ACCEPTED"
    | "DISPATCHED"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED";
  const fetchBuyerOrders = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getBuyerOrders();

      console.log("buyer------", response);

      if (response?.success) {
        setOrders(Array.isArray(response.data) ? response.data : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log("Buyer orders API error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuyerOrders();
  }, [fetchBuyerOrders]);

  const activeCount = orders.filter((order) =>
    ["PENDING", "ACCEPTED", "DISPATCHED"].includes(
      String(order?.status ?? "").toUpperCase()
    )
  ).length;

  const deliveredCount = orders.filter((order) =>
    ["DELIVERED", "COMPLETED"].includes(
      String(order?.status ?? "").toUpperCase()
    )
  ).length;

  const totalSpent = orders
    .filter((order) =>
      ["DELIVERED", "COMPLETED"].includes(
        String(order?.status ?? "").toUpperCase()
      )
    )
    .reduce((sum, order) => {
      return sum + Number(order?.totalAmount ?? 0);
    }, 0);

  const getStatusIcon = (status?: string) => {
    switch (String(status ?? "").toUpperCase()) {
      case "DELIVERED":
      case "COMPLETED":
        return "checkmark-circle";

      case "CANCELLED":
        return "close-circle";

      default:
        return "time";
    }
  };

  const getStatusBackground = (status?: string) => {
    switch (String(status ?? "").toUpperCase()) {
      case "DELIVERED":
      case "COMPLETED":
        return "#EAF8EF";

      case "CANCELLED":
        return "#FDECEC";

      default:
        return "#FFF0DF";
    }
  };

  const getFilterStatus = (filter: string) => {
    switch (filter) {
      case "Dispatched":
        return "DISPATCHED";

      case "Delivered":
        return "DELIVERED";

      case "Completed":
        return "COMPLETED";

      case "Cancelled":
        return "CANCELLED";

      default:
        return null;
    }
  };

  const getSupplierName = (order: BuyerOrder) => {
    return (
      order.seller?.sellerProfile?.businessName ||
      order.seller?.sellerProfile?.ownerName ||
      order.seller?.name ||
      "Supplier"
    );
  };

  const getLocation = (order: BuyerOrder) => {
    return (
      order.deliveryAddress?.city ||
      order.seller?.sellerProfile?.businessName ||
      "N/A"
    );
  };

  const getQuantity = (order: BuyerOrder) => {
    const quantity = order.quantity ?? "";
    const unit = order.unit || order.material?.unit || "";

    return `${quantity}${unit ? ` ${unit}` : ""}`;
  };

  const getAmount = (order: BuyerOrder) => {
    return Number(order.totalAmount ?? 0);
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status?: string) => {
    switch (String(status ?? "").toUpperCase()) {
      case "PENDING":
        return "Pending";

      case "ACCEPTED":
        return "Accepted";

      case "DISPATCHED":
        return "Dispatched";

      case "DELIVERED":
        return "Delivered";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status || "Unknown";
    }
  };

  const filteredOrders = useMemo(() => {
    const status = getFilterStatus(selectedFilter);

    if (!status) {
      return orders;
    }

    return orders.filter(
      (order) => String(order?.status ?? "").toUpperCase() === status
    );
  }, [orders, selectedFilter]);

  const getStatusColor = (status?: string) => {
    switch (String(status ?? "").toUpperCase()) {
      case "DELIVERED":
      case "COMPLETED":
        return "#2E9D5B";

      case "CANCELLED":
        return "#C94B4B";

      default:
        return "#FF7A00";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* MENU */}

          <Image
            source={require("../../assets/profile.jpeg")}
            style={styles.profile}
          />

          {/* LOGO */}

          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
            />

            <Text style={styles.logoText}>
              Neev<Text style={styles.logoOrange}>Sathi</Text>
            </Text>
          </View>

          {/* NOTIFICATION */}

          <Pressable
            style={styles.headerButton}
            onPress={() => {
              console.log("Notifications");
            }}
          >
            <Ionicons name="notifications-outline" size={21} color="#0A0A0A" />

            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </Pressable>
        </View>

        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled
          /* ============================================================
     HEADER
  ============================================================ */

          ListHeaderComponent={
            <>
              {/* INTRO */}

              <LinearGradient
                colors={["#FF7A00", "#FF9F1C", "#FFC43D"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.requirementCard}
              >
                <View style={styles.introSection}>
                  <View style={styles.introTextContainer}>
                    <Text style={styles.introTitle}>Track your purchases</Text>

                    <Text style={styles.introSubtitle}>
                      Manage your material orders and deliveries in one place.
                    </Text>
                  </View>

                  <View style={styles.introIcon}>
                    <Text style={styles.requirementEmoji}>🧱</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* STATS */}

              <View style={styles.statsRow}>
                {/* Active */}

                <View style={styles.statCard}>
                  <View
                    style={[
                      styles.statIcon,
                      {
                        backgroundColor: "#FFF0DF",
                      },
                    ]}
                  >
                    <Ionicons name="time-outline" size={17} color="#FF7A00" />
                  </View>

                  <Text style={styles.statNumber}>{activeCount}</Text>

                  <Text style={styles.statLabel}>Active</Text>
                </View>

                {/* Delivered */}

                <View style={styles.statCard}>
                  <View
                    style={[
                      styles.statIcon,
                      {
                        backgroundColor: "#EAF8EF",
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={17}
                      color="#2E9D5B"
                    />
                  </View>

                  <Text style={styles.statNumber}>{deliveredCount}</Text>

                  <Text style={styles.statLabel}>Delivered</Text>
                </View>

                {/* Spent */}

                <View style={styles.statCard}>
                  <View
                    style={[
                      styles.statIcon,
                      {
                        backgroundColor: "#FFF7D9",
                      },
                    ]}
                  >
                    <Ionicons name="wallet-outline" size={17} color="#D4A017" />
                  </View>

                  <Text
                    style={styles.statNumber}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    ₹{(totalSpent / 1000).toFixed(1)}k
                  </Text>

                  <Text style={styles.statLabel}>Spent</Text>
                </View>
              </View>

              {/* FILTER */}

              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Your Orders</Text>

                <FlatList
                  data={filters}
                  horizontal
                  keyExtractor={(item) => item}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterScroll}
                  nestedScrollEnabled
                  renderItem={({ item: filter }) => {
                    const active = selectedFilter === filter;

                    return (
                      <Pressable
                        onPress={() => setSelectedFilter(filter)}
                        style={[
                          styles.filterButton,
                          active && styles.filterButtonActive,
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
              </View>
            </>
          }
          /* ============================================================
     ORDER ITEM
  ============================================================ */

          renderItem={({ item: order }) => {
            const rawStatus = String(order.status ?? "").toUpperCase();

            const statusColor = getStatusColor(rawStatus);

            const statusBackground = getStatusBackground(rawStatus);

            const supplierName = getSupplierName(order);

            const location = getLocation(order);

            const quantity = getQuantity(order);

            const amount = getAmount(order);

            const isActive = ["PENDING", "ACCEPTED", "DISPATCHED"].includes(
              rawStatus
            );

            const isDelivered = ["DELIVERED", "COMPLETED"].includes(rawStatus);

            const isCancelled = rawStatus === "CANCELLED";

            return (
              <Pressable
                onPress={() => {
                  navigation.navigate("OrderDetails", {
                    order,
                  });
                }}
                style={styles.orderCard}
              >
                {/* ORDER HEADER */}

                <View style={styles.orderHeader}>
                  <View style={styles.orderIdContainer}>
                    <Text style={styles.orderIdLabel}>ORDER ID</Text>

                    <Text style={styles.orderId}>
                      {order.orderNumber || order.id}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusBackground,
                      },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(rawStatus)}
                      size={13}
                      color={statusColor}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: statusColor,
                        },
                      ]}
                    >
                      {getStatusLabel(rawStatus)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* SUPPLIER */}

                <View style={styles.supplierRow}>
                  <View style={styles.supplierAvatar}>
                    <Text style={styles.avatarText}>
                      {supplierName
                        .split(" ")
                        .map((word) => word.charAt(0))
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.supplierInfo}>
                    <View style={styles.supplierNameRow}>
                      <Text style={styles.supplierName} numberOfLines={1}>
                        {supplierName}
                      </Text>

                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color="#2E9D5B"
                      />
                    </View>

                    <View style={styles.supplierMeta}>
                      <Ionicons
                        name="location-outline"
                        size={11}
                        color="#8C8175"
                      />

                      <Text style={styles.location} numberOfLines={1}>
                        {location}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* MATERIAL */}

                <View style={styles.materialCard}>
                  <View style={styles.materialIcon}>
                    <Ionicons name="cube-outline" size={19} color="#FF7A00" />
                  </View>

                  <View style={styles.materialInfo}>
                    <Text style={styles.materialName} numberOfLines={2}>
                      {order.material?.name || "Material"}
                    </Text>

                    <Text style={styles.quantity}>{quantity}</Text>
                  </View>

                  <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Amount</Text>

                    <Text style={styles.amount}>
                      ₹{amount.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                {/* DELIVERY PROGRESS */}

                {isActive && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>
                        Delivery Progress
                      </Text>

                      <Text style={styles.progressStatus}>
                        {getStatusLabel(rawStatus)}
                      </Text>
                    </View>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width:
                              rawStatus === "DISPATCHED"
                                ? "75%"
                                : rawStatus === "ACCEPTED"
                                ? "45%"
                                : "25%",
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.progressLabels}>
                      <Text style={styles.progressLabelActive}>Confirmed</Text>

                      <Text style={styles.progressLabel}>Preparing</Text>

                      <Text style={styles.progressLabel}>Delivery</Text>
                    </View>
                  </View>
                )}

                {/* DELIVERED */}

                {isDelivered && (
                  <View style={styles.deliveredRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={17}
                      color="#2E9D5B"
                    />

                    <Text style={styles.deliveredText}>
                      {rawStatus === "COMPLETED"
                        ? "Order completed successfully"
                        : "Delivered successfully"}
                    </Text>

                    <Text style={styles.placedDate}>
                      {formatDate(order.dispatchDate || order.createdAt)}
                    </Text>
                  </View>
                )}

                {/* CANCELLED */}

                {isCancelled && (
                  <View style={styles.cancelledRow}>
                    <Ionicons name="close-circle" size={17} color="#C94B4B" />

                    <Text style={styles.cancelledText}>Order cancelled</Text>
                  </View>
                )}

                {/* FOOTER */}

                <View style={styles.cardFooter}>
                  <View style={styles.deliveryInfo}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#8C8175"
                    />

                    <Text style={styles.deliveryText}>
                      {order.expectedDeliveryDate
                        ? `Delivery: ${formatDate(order.expectedDeliveryDate)}`
                        : `Placed: ${formatDate(order.createdAt)}`}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.viewButton}
                    onPress={() => {
                      navigation.navigate("OrderDetails", {
                        order,
                      });
                    }}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>

                    <Ionicons name="arrow-forward" size={15} color="#FF7A00" />
                  </Pressable>
                </View>

                {/* TRACK */}

                {isActive && (
                  <View style={styles.trackWrapper}>
                    <LinearGradient
                      colors={["#FF7A00", "#FF8F0A", "#FF9F1C"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.trackGradient}
                    >
                      <Pressable
                        style={styles.trackButton}
                        onPress={() => {
                          navigation.navigate("OrderDetails", {
                            order,
                          });
                        }}
                      >
                        <Ionicons
                          name="navigate-outline"
                          size={17}
                          color="#FFFFFF"
                        />

                        <Text style={styles.trackButtonText}>Track Order</Text>
                      </Pressable>
                    </LinearGradient>
                  </View>
                )}
              </Pressable>
            );
          }}
          /* ============================================================
     EMPTY STATE
  ============================================================ */

          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="cube-outline" size={32} color="#FF7A00" />
                </View>

                <Text style={styles.emptyTitle}>No Orders Found</Text>

                <Text style={styles.emptyText}>
                  You don't have any {selectedFilter.toLowerCase()} orders yet.
                </Text>

                <Pressable
                  style={styles.shopButton}
                  onPress={() => {
                    navigation.navigate("BuyerHome");
                  }}
                >
                  <Text style={styles.shopButtonText}>Browse Materials</Text>

                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : null
          }
          /* ============================================================
     FOOTER
  ============================================================ */

          ListFooterComponent={
            filteredOrders.length > 0 ? (
              <>
                <View style={styles.protectionCard}>
                  <View style={styles.protectionIcon}>
                    <Ionicons
                      name="shield-checkmark"
                      size={20}
                      color="#2E9D5B"
                    />
                  </View>

                  <View style={styles.protectionContent}>
                    <Text style={styles.protectionTitle}>
                      Every Order is Protected
                    </Text>

                    <Text style={styles.protectionText}>
                      Your payment stays protected until you receive and confirm
                      your material.
                    </Text>
                  </View>
                </View>

                <View style={styles.bottomSpace} />
              </>
            ) : (
              <View style={styles.bottomSpace} />
            )
          }
          ListHeaderComponentStyle={{
            paddingBottom: 0,
          }}
        />
      </SafeAreaView>
    </View>
  );
};

export default BuyerOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#1E3A8A",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
    position: "relative",
  },

  menuIcon: {
    fontSize: 22,
    color: "#172554",
    fontWeight: "700",
  },

  bellIcon: {
    fontSize: 18,
  },
  profile: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    borderRadius: 50,
  },
  notificationBadge: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  requirementCard: {
    height: 88,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",

    elevation: 5,

    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
  },
  requirementEmoji: {
    fontSize: 25,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FF8A00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  logoIconText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#172554",
  },

  logoOrange: {
    color: "#F97316",
  },

  headerSmall: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#FF7A00",
    marginBottom: 2,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: "#242424",
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  notificationIcon: {
    fontSize: 19,
  },

  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 5,
  },

  badge: {
    position: "absolute",
    right: -2,
    top: -3,

    width: 18,
    height: 18,
    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FF7A00",
  },

  headerTextContainer: {
    flex: 1,
  },

  brandText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.6,
    color: "#FF7A00",
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 9,

    width: 7,
    height: 7,
    borderRadius: 4,

    backgroundColor: "#FF7A00",

    borderWidth: 1,
    borderColor: "#FFFDF9",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
  },

  introSection: {
    padding: 16,
    borderRadius: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  introTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  introTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#fff",
  },

  introSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
    color: "#f6f6f6",
  },

  introIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFF0DF",
  },

  statsRow: {
    marginTop: 14,

    flexDirection: "row",
    gap: 9,
  },

  statCard: {
    flex: 1,

    minHeight: 91,

    padding: 11,

    borderRadius: 17,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  statIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",
  },

  statNumber: {
    marginTop: 7,

    fontSize: 17,
    lineHeight: 20,
    fontWeight: "900",

    color: "#0A0A0A",
  },

  statLabel: {
    marginTop: 1,

    fontSize: 9,
    fontWeight: "600",

    color: "#8C8175",
  },

  filterSection: {
    marginTop: 22,
    paddingBottom: 18,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  filterScroll: {
    paddingTop: 10,
    paddingBottom: 2,
    gap: 8,
  },

  filterButton: {
    height: 34,
    paddingHorizontal: 15,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  filterButtonActive: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },

  filterText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8C8175",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  ordersContainer: {
    marginTop: 13,
  },

  orderCard: {
    marginBottom: 14,

    padding: 14,

    borderRadius: 21,

    backgroundColor: "#FFFFFF",

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

  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderIdContainer: {
    flex: 1,
  },

  orderIdLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: "#A09387",
  },

  orderId: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "900",
    color: "#332D27",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,

    borderRadius: 10,

    flexDirection: "row",
    alignItems: "center",
  },

  statusText: {
    marginLeft: 4,
    fontSize: 9,
    fontWeight: "900",
  },

  cardDivider: {
    height: 1,
    marginVertical: 13,

    backgroundColor: "#F3E9DD",
  },

  supplierRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  supplierAvatar: {
    width: 43,
    height: 43,
    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFF0DF",

    borderWidth: 1,
    borderColor: "#FFD6AE",
  },

  avatarText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FF7A00",
  },

  supplierInfo: {
    flex: 1,
    marginLeft: 10,
  },

  supplierNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  supplierName: {
    flexShrink: 1,

    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",

    color: "#0A0A0A",
  },

  supplierMeta: {
    marginTop: 4,

    flexDirection: "row",
    alignItems: "center",
  },

  rating: {
    marginLeft: 3,

    fontSize: 9,
    fontWeight: "800",
    color: "#665C51",
  },

  metaDot: {
    marginHorizontal: 5,

    fontSize: 9,
    color: "#B8AA9C",
  },

  location: {
    marginLeft: 3,

    fontSize: 9,
    fontWeight: "600",
    color: "#8C8175",
  },

  materialCard: {
    marginTop: 13,

    padding: 11,

    borderRadius: 15,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFF9F1",

    borderWidth: 1,
    borderColor: "#F6E6D3",
  },

  materialIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFF0DF",
  },

  materialInfo: {
    flex: 1,
    marginLeft: 9,
  },

  materialName: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
    color: "#332D27",
  },

  quantity: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "600",
    color: "#8C8175",
  },

  amountContainer: {
    alignItems: "flex-end",
  },

  amountLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#9A8E82",
  },

  amount: {
    marginTop: 2,

    fontSize: 14,
    fontWeight: "900",

    color: "#0A0A0A",
  },

  progressSection: {
    marginTop: 14,
    paddingTop: 12,

    borderTopWidth: 1,
    borderTopColor: "#F3E9DD",
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#332D27",
  },

  progressStatus: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FF7A00",
  },

  progressTrack: {
    height: 5,
    marginTop: 9,

    borderRadius: 5,

    backgroundColor: "#F3E9DD",

    overflow: "hidden",
  },

  progressFill: {
    width: "43%",
    height: "100%",

    borderRadius: 5,

    backgroundColor: "#FF7A00",
  },

  progressLabels: {
    marginTop: 5,

    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "#B0A398",
  },

  progressLabelActive: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FF7A00",
  },

  deliveredRow: {
    marginTop: 13,
    paddingVertical: 9,
    paddingHorizontal: 10,

    borderRadius: 12,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#EFF9F2",
  },

  deliveredText: {
    marginLeft: 6,

    fontSize: 10,
    fontWeight: "800",

    color: "#237A47",
  },

  placedDate: {
    marginLeft: "auto",

    fontSize: 8,
    fontWeight: "600",

    color: "#6B8A75",
  },

  cancelledRow: {
    marginTop: 13,
    paddingVertical: 9,
    paddingHorizontal: 10,

    borderRadius: 12,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FDECEC",
  },

  cancelledText: {
    marginLeft: 6,

    fontSize: 10,
    fontWeight: "800",

    color: "#A63D3D",
  },

  cardFooter: {
    marginTop: 14,

    paddingTop: 12,

    borderTopWidth: 1,
    borderTopColor: "#F3E9DD",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  deliveryInfo: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
  },

  deliveryText: {
    marginLeft: 5,

    fontSize: 9,
    fontWeight: "600",

    color: "#8C8175",
  },

  viewButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  viewButtonText: {
    marginRight: 4,

    fontSize: 10,
    fontWeight: "900",

    color: "#FF7A00",
  },

  trackWrapper: {
    marginTop: 10,

    borderRadius: 13,

    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 7,

    elevation: 5,
  },

  trackGradient: {
    height: 42,
    borderRadius: 13,
    overflow: "hidden",
  },

  trackButton: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  trackButtonText: {
    marginLeft: 7,

    fontSize: 11,
    fontWeight: "900",

    color: "#FFFFFF",
  },

  emptyState: {
    marginTop: 20,
    padding: 30,

    alignItems: "center",

    borderRadius: 21,

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

    backgroundColor: "#FFF0DF",
  },

  emptyTitle: {
    marginTop: 13,

    fontSize: 16,
    fontWeight: "900",

    color: "#0A0A0A",
  },

  emptyText: {
    marginTop: 5,

    textAlign: "center",

    fontSize: 11,
    lineHeight: 17,
    fontWeight: "500",

    color: "#8C8175",
  },

  shopButton: {
    marginTop: 15,

    height: 42,
    paddingHorizontal: 18,

    borderRadius: 13,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FF7A00",
  },

  shopButtonText: {
    marginRight: 7,

    fontSize: 11,
    fontWeight: "900",

    color: "#FFFFFF",
  },

  protectionCard: {
    marginTop: 6,

    padding: 13,

    borderRadius: 17,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#EFF9F2",

    borderWidth: 1,
    borderColor: "#D5EFDD",
  },

  protectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#DDF3E4",
  },

  protectionContent: {
    flex: 1,
    marginLeft: 10,
  },

  protectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#237A47",
  },

  protectionText: {
    marginTop: 2,

    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",

    color: "#4E755D",
  },

  bottomSpace: {
    height: 20,
  },
});
