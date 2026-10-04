import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Pressable,
  FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getSellerOrders } from "./seller.api";
import { SafeAreaView } from "react-native-safe-area-context";

const SellerOrdersScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const filters = [
    "All",
    "Pending",
    "Accepted",
    "Dispatched",
    "Completed",
    "Cancelled",
  ];
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getSellerOrders();

      console.log("SELLER ORDERS RESPONSE:", response);

      if (response?.success) {
        setOrders(response.data ?? []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log("Seller orders API error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const orderStats = useMemo(() => {
    const orderList = Array.isArray(orders) ? orders : [];

    return {
      totalOrders: orderList.length,

      inTransit: orderList.filter(
        (order) => String(order?.status ?? "").toUpperCase() === "DISPATCHED"
      ).length,

      delivered: orderList.filter((order) =>
        ["DELIVERED", "COMPLETED"].includes(
          String(order?.status ?? "").toUpperCase()
        )
      ).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const orderList = Array.isArray(orders) ? orders : [];

    const searchText = search.trim().toLowerCase();

    const getFilterStatus = (filter: string) => {
      switch (filter) {
        case "Pending":
          return "PENDING";

        case "Accepted":
          return "ACCEPTED";

        case "Dispatched":
          return "DISPATCHED";

        case "Completed":
          return "COMPLETED";

        case "Cancelled":
          return "CANCELLED";

        default:
          return null;
      }
    };

    const filterStatus = getFilterStatus(activeFilter);

    return orderList.filter((order) => {
      const status = String(order?.status ?? "").toUpperCase();

      const matchesFilter = !filterStatus || status === filterStatus;

      const matchesSearch =
        !searchText ||
        String(order?.orderNumber ?? "")
          .toLowerCase()
          .includes(searchText) ||
        String(order?.material?.name ?? "")
          .toLowerCase()
          .includes(searchText) ||
        String(order?.buyer?.name ?? "")
          .toLowerCase()
          .includes(searchText) ||
        String(order?.buyer?.buyerProfile?.companyName ?? "")
          .toLowerCase()
          .includes(searchText) ||
        String(order?.deliveryAddress?.city ?? "")
          .toLowerCase()
          .includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [orders, search, activeFilter]);

  return (
    <SafeAreaView style={styles.root}>
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

            <Text style={styles.headerTitle}>My Orders</Text>
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
          data={filteredOrders}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: order }) => {
            const status = String(order?.status ?? "").toUpperCase();

            const statusConfig = {
              PENDING: {
                label: "Pending",
                color: "#D4A017",
                bg: "#FFF7D6",
                icon: "time-outline",
              },
              ACCEPTED: {
                label: "Accepted",
                color: "#FF7A00",
                bg: "#FFF0DF",
                icon: "checkmark-circle-outline",
              },
              DISPATCHED: {
                label: "Dispatched",
                color: "#2563EB",
                bg: "#EAF2FF",
                icon: "bicycle-outline",
              },
              DELIVERED: {
                label: "Delivered",
                color: "#16A34A",
                bg: "#EAF8EF",
                icon: "checkmark-circle-outline",
              },
              COMPLETED: {
                label: "Completed",
                color: "#16A34A",
                bg: "#EAF8EF",
                icon: "checkmark-circle-outline",
              },
              CANCELLED: {
                label: "Cancelled",
                color: "#DC2626",
                bg: "#FDECEC",
                icon: "close-circle-outline",
              },
            }[status] ?? {
              label: order?.status ?? "Unknown",
              color: "#8C8175",
              bg: "#F5F1EC",
              icon: "cube-outline",
            };

            const totalAmount = Number(order?.totalAmount ?? 0);

            const expectedDate = order?.expectedDeliveryDate
              ? new Date(order.expectedDeliveryDate).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "Not specified";

            const orderedDate = order?.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "";

            const location = [
              order?.deliveryAddress?.city,
              order?.deliveryAddress?.state,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <TouchableOpacity
                activeOpacity={0.92}
                style={styles.orderCard}
                onPress={() =>
                  navigation.navigate("SellerOrderDetails", {
                    order,
                  })
                }
              >
                {/* TOP */}
                <View style={styles.orderTop}>
                  <View style={styles.orderIdRow}>
                    <View style={styles.orderIcon}>
                      <Text style={styles.orderEmoji}>
                        {order?.material?.name === "Brick" ? "🧱" : "🏗️"}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.orderId}>
                        {order?.orderNumber ?? "Order"}
                      </Text>

                      <Text style={styles.orderTime}>{orderedDate}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusConfig.bg,
                      },
                    ]}
                  >
                    <Ionicons
                      name={statusConfig.icon as any}
                      size={13}
                      color={statusConfig.color}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: statusConfig.color,
                        },
                      ]}
                    >
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* MATERIAL */}
                <View style={styles.materialSection}>
                  <View>
                    <Text style={styles.materialName}>
                      {order?.material?.name ?? "Material"}
                    </Text>

                    <Text style={styles.materialQuantity}>
                      {order?.quantity} {order?.unit}
                    </Text>
                  </View>

                  <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Order Value</Text>

                    <Text style={styles.amount}>
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                {/* BUYER */}
                <View style={styles.buyerRow}>
                  <View style={styles.buyerAvatar}>
                    <Ionicons
                      name="business-outline"
                      size={17}
                      color="#FF7A00"
                    />
                  </View>

                  <View style={styles.buyerInfo}>
                    <View style={styles.buyerNameRow}>
                      <Text style={styles.buyerName}>
                        {order?.buyer?.name ?? "Buyer"}
                      </Text>

                      <View style={styles.verifiedSmall}>
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      </View>
                    </View>

                    <Text style={styles.buyerType}>
                      {order?.buyer?.buyerProfile?.companyName ??
                        "Individual Buyer"}
                    </Text>
                  </View>
                </View>

                {/* LOCATION */}
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#8C8175" />

                  <Text style={styles.infoText}>
                    {location || "Location not available"}
                  </Text>
                </View>

                {/* DELIVERY */}
                <View style={styles.deliveryBox}>
                  <View style={styles.deliveryLeft}>
                    <Ionicons name="cube-outline" size={17} color="#FF7A00" />

                    <View>
                      <Text style={styles.deliveryLabel}>Delivery</Text>

                      <Text style={styles.deliveryStatus}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.deliveryRight}>
                    <Text style={styles.deliveryDateLabel}>Expected</Text>

                    <Text style={styles.deliveryDate}>{expectedDate}</Text>
                  </View>
                </View>

                {/* FOOTER */}
                <View style={styles.orderFooter}>
                  <View style={styles.paymentRow}>
                    <Ionicons
                      name={
                        order?.quote?.status === "DISPATCHED"
                          ? "checkmark-circle"
                          : order?.quote?.status === "ACCEPTED"
                          ? "checkmark-circle"
                          : "time-outline"
                      }
                      size={15}
                      color={
                        order?.quote?.status === "DISPATCHED" ||
                        order?.quote?.status === "ACCEPTED"
                          ? "#16A34A"
                          : "#D4A017"
                      }
                    />

                    <Text
                      style={[
                        styles.paymentText,
                        {
                          color:
                            order?.quote?.status === "DISPATCHED" ||
                            order?.quote?.status === "ACCEPTED"
                              ? "#16A34A"
                              : "#D4A017",
                        },
                      ]}
                    >
                      {order?.quote?.status === "DISPATCHED"
                        ? "Dispatched"
                        : order?.quote?.status === "ACCEPTED"
                        ? "Accepted"
                        : order?.quote?.status ?? "Pending"}
                    </Text>
                  </View>

                  <View style={styles.viewDetails}>
                    <Text style={styles.viewDetailsText}>View Details</Text>

                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#FF7A00"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListHeaderComponent={
            <>
              {/* INTRO */}
              <View style={styles.introSection}>
                <Text style={styles.pageHeading}>Manage your orders</Text>

                <Text style={styles.pageSubtitle}>
                  Track deliveries, payments and buyer orders
                </Text>
              </View>

              {/* QUICK STATS */}
              <View style={styles.quickStatsRow}>
                <View style={styles.quickStatCard}>
                  <View
                    style={[
                      styles.quickStatIcon,
                      { backgroundColor: "#FFF7D6" },
                    ]}
                  >
                    <Ionicons name="time-outline" size={18} color="#D4A017" />
                  </View>

                  <Text style={styles.quickStatValue}>
                    {orderStats?.totalOrders ?? 0}
                  </Text>

                  <Text style={styles.quickStatLabel}>Total Orders</Text>
                </View>

                <View style={styles.quickStatCard}>
                  <View
                    style={[
                      styles.quickStatIcon,
                      { backgroundColor: "#FFF0DF" },
                    ]}
                  >
                    <Ionicons
                      name="bicycle-outline"
                      size={18}
                      color="#FF7A00"
                    />
                  </View>

                  <Text style={styles.quickStatValue}>
                    {orderStats?.inTransit ?? 0}
                  </Text>

                  <Text style={styles.quickStatLabel}>In Transit</Text>
                </View>

                <View style={styles.quickStatCard}>
                  <View
                    style={[
                      styles.quickStatIcon,
                      { backgroundColor: "#EAF8EF" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#16A34A"
                    />
                  </View>

                  <Text style={styles.quickStatValue}>
                    {orderStats?.delivered ?? 0}
                  </Text>

                  <Text style={styles.quickStatLabel}>Delivered</Text>
                </View>
              </View>

              {/* SEARCH */}
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color="#9A8F83" />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search orders, buyers or materials"
                  placeholderTextColor="#A79B8D"
                  style={styles.searchInput}
                />

                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={20} color="#B8AFA4" />
                  </TouchableOpacity>
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
                    <TouchableOpacity
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
                    </TouchableOpacity>
                  );
                }}
              />

              {/* SECTION HEADER */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    {activeFilter === "All"
                      ? "Recent Orders"
                      : `${activeFilter} Orders`}
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    {filteredOrders.length} orders found
                  </Text>
                </View>

                <TouchableOpacity>
                  <Ionicons name="options-outline" size={21} color="#FF7A00" />
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="cube-outline" size={32} color="#FF7A00" />
              </View>

              <Text style={styles.emptyTitle}>No orders found</Text>

              <Text style={styles.emptySubtitle}>
                Try changing the filter or search something else.
              </Text>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearch("");
                  setActiveFilter("All");
                }}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={<View style={{ height: 110 }} />}
        />
      </View>
    </SafeAreaView>
  );
};

export default SellerOrdersScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  background: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },

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

  headerTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  headerProfile: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    borderWidth: 1,
    borderColor: "#FFD7AE",
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#FF7A00",
  },

  introSection: {
    marginTop: 8,
    marginBottom: 17,
  },

  pageHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  pageSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#8C8175",
    lineHeight: 19,
  },

  overviewCard: {
    borderRadius: 24,
    // padding: 19,
    borderWidth: 1,
    borderColor: "#3C310F",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.14,
    shadowRadius: 13,
    elevation: 7,
  },

  overviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
  },

  overviewLabel: {
    fontSize: 12,
    color: "#D7D0C5",
    fontWeight: "600",
  },

  overviewAmount: {
    marginTop: 5,
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,215,106,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,215,106,0.25)",
  },

  overviewDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 17,
  },

  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    paddingBottom: 16,
  },

  overviewStat: {
    flex: 1,
  },

  overviewStatValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFD76A",
  },

  overviewStatLabel: {
    marginTop: 3,
    fontSize: 9,
    color: "#C9C0B4",
    fontWeight: "600",
  },

  quickStatsRow: {
    flexDirection: "row",
    gap: 9,
    // marginTop: 12,
  },

  quickStatCard: {
    flex: 1,
    backgroundColor: "#FFFCF7",
    borderRadius: 18,
    padding: 11,
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  quickStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  quickStatValue: {
    marginTop: 8,
    fontSize: 19,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  quickStatLabel: {
    marginTop: 2,
    fontSize: 9,
    color: "#8C8175",
    fontWeight: "600",
  },

  searchBox: {
    height: 52,
    marginTop: 18,
    paddingHorizontal: 15,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 13,
    color: "#0A0A0A",
    paddingVertical: 0,
  },

  filterScroll: {
    paddingVertical: 13,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 16,
    height: 37,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFCF7",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  filterChipActive: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },

  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8C8175",
  },

  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#9A8F83",
  },

  orderCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 22,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1E2D0",
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 3,
  },

  orderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  orderIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    marginRight: 10,
  },

  orderEmoji: {
    fontSize: 21,
  },

  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A0A0A",
  },

  orderTime: {
    marginTop: 3,
    fontSize: 12,
    color: "#9A8F83",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  materialSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F3E9DD",
  },

  materialName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  materialQuantity: {
    marginTop: 4,
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
  },

  amountContainer: {
    alignItems: "flex-end",
  },

  amountLabel: {
    fontSize: 12,
    color: "#9A8F83",
  },

  amount: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "900",
    color: "#FF7A00",
  },

  buyerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
  },

  buyerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  buyerInfo: {
    flex: 1,
  },

  buyerNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  buyerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  verifiedSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: 5,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },

  buyerType: {
    marginTop: 2,
    fontSize: 12,
    color: "#8C8175",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 7,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#6F655B",
  },

  deliveryBox: {
    marginTop: 13,
    padding: 11,
    borderRadius: 14,
    backgroundColor: "#FFF8EE",
    borderWidth: 1,
    borderColor: "#F3E6D6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  deliveryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  deliveryLabel: {
    fontSize: 13,
    color: "#9A8F83",
  },

  deliveryStatus: {
    marginTop: 2,
    fontSize: 13,
    color: "#0A0A0A",
    fontWeight: "800",
  },

  deliveryRight: {
    alignItems: "flex-end",
  },

  deliveryDateLabel: {
    fontSize: 12,
    color: "#9A8F83",
  },

  deliveryDate: {
    marginTop: 2,
    fontSize: 12,
    color: "#0A0A0A",
    fontWeight: "800",
  },

  orderFooter: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3E9DD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  paymentText: {
    fontSize: 13,
    fontWeight: "800",
  },

  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  viewDetailsText: {
    fontSize: 13,
    color: "#FF7A00",
    fontWeight: "800",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 45,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  emptySubtitle: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#8C8175",
  },

  clearButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
  },

  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  tipCard: {
    marginTop: 8,
    borderRadius: 20,
    // padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#F2DFA7",
    height: 70,
  },

  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FFFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    marginLeft: 14,
  },

  tipContent: {
    flex: 1,
    marginLeft: 11,
  },

  tipTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  tipText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: "#6F5C32",
  },
});
