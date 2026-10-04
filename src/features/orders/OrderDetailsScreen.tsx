import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { confirmMaterialReceived } from "../buyer/buyer.api";

const OrderDetailsScreen = ({ navigation, route }: any) => {
  const order = route?.params?.order;
  const [confirmingReceived, setConfirmingReceived] = React.useState(false);

  const handleMaterialReceived = () => {
    Alert.alert(
      "Confirm Material Received",
      "Have you received the material successfully?",
      [
        {
          text: "Not Yet",
          style: "cancel",
        },
        {
          text: "Yes, Received",
          onPress: async () => {
            try {
              setConfirmingReceived(true);

              const response = await confirmMaterialReceived(order.id);

              console.log("Material received:", response);

              Alert.alert("Success", "Material received successfully.", [
                {
                  text: "OK",
                  onPress: () => {
                    navigation.navigate("Buyer", {
                      screen: "Orders",
                    });
                  },
                },
              ]);
            } catch (error: any) {
              console.error("Material received error:", error);

              Alert.alert(
                "Error",
                error?.message || "Failed to confirm material received."
              );
            } finally {
              setConfirmingReceived(false);
            }
          },
        },
      ]
    );
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

        <View style={styles.header}>
          <Pressable
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color="#0A0A0A" />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Order Details</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="document-text-outline" size={35} color="#FF7A00" />
          </View>

          <Text style={styles.emptyTitle}>Order details not found</Text>

          <Text style={styles.emptyText}>
            We could not find the selected order.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================
     BASIC DATA
  ========================= */

  const rawStatus = String(order?.status ?? "").toUpperCase();

  const supplierName =
    order?.seller?.sellerProfile?.businessName ||
    order?.seller?.sellerProfile?.ownerName ||
    order?.seller?.name ||
    "Supplier";

  const supplierPhone =
    order?.seller?.sellerProfile?.phone || order?.seller?.phone || "";

  const supplierLocation = order?.seller?.sellerProfile?.businessType ?? "N/A";

  console.log("dfsfs", order);

  const materialName = order?.material?.name || "Construction Material";

  const quantity = order?.quantity ?? "";
  const unit = order?.unit || order?.material?.unit || "";

  const quantityText = `${quantity}${unit ? ` ${unit}` : ""}`;

  const pricePerUnit = Number(
    order?.pricePerUnit ?? order?.quote?.pricePerUnit ?? 0
  );

  const materialAmount = Number(
    order?.materialAmount ?? order?.quote?.materialAmount ?? 0
  );

  const deliveryCharges = Number(
    order?.deliveryCharges ?? order?.quote?.deliveryCharges ?? 0
  );

  const totalAmount = Number(
    order?.totalAmount ?? order?.quote?.totalAmount ?? 0
  );

  /* =========================
     DELIVERY ADDRESS
  ========================= */

  const deliveryAddress = order?.deliveryAddress;

  const deliveryLocation =
    [
      deliveryAddress?.addressLine1,
      deliveryAddress?.addressLine2,
      deliveryAddress?.landmark,
      deliveryAddress?.city,
      deliveryAddress?.state,
      deliveryAddress?.pincode,
    ]
      .filter(Boolean)
      .join(", ") || "Delivery address not available";

  const deliveryCity =
    [deliveryAddress?.city, deliveryAddress?.state]
      .filter(Boolean)
      .join(", ") || "N/A";

  /* =========================
     DRIVER DATA
  ========================= */

  const driverName = order?.driverName || "";

  const driverPhone = order?.driverPhone || "";

  const vehicleNumber = order?.vehicleNumber || "";

  const deliveryNotes = order?.deliveryNotes || "";

  const hasDriverDetails = Boolean(driverName || driverPhone || vehicleNumber);

  /* =========================
     STATUS
  ========================= */

  const isPending = rawStatus === "PENDING";

  const isAccepted = rawStatus === "ACCEPTED";

  const isDispatched = rawStatus === "DISPATCHED";

  const isDelivered = rawStatus === "DELIVERED";

  const isCompleted = rawStatus === "COMPLETED";

  const isCancelled = rawStatus === "CANCELLED";

  const isDeliveredOrCompleted = isDelivered || isCompleted;

  const statusColor = isCancelled
    ? "#D94B4B"
    : isDeliveredOrCompleted
    ? "#2E9D5B"
    : "#FF7A00";

  const statusBg = isCancelled
    ? "#FDECEC"
    : isDeliveredOrCompleted
    ? "#EAF8EF"
    : "#FFF0DF";

  const getStatusIcon = () => {
    if (isCancelled) {
      return "close-circle-outline";
    }

    if (isDeliveredOrCompleted) {
      return "checkmark-circle-outline";
    }

    if (isDispatched) {
      return "car-outline";
    }

    return "time-outline";
  };

  const getStatusTitle = () => {
    if (isCancelled) {
      return "Order Cancelled";
    }

    if (isCompleted) {
      return "Order Completed";
    }

    if (isDelivered) {
      return "Order Delivered";
    }

    if (isDispatched) {
      return "Order Dispatched";
    }

    if (isAccepted) {
      return "Order Accepted";
    }

    return "Order Confirmed";
  };

  const getStatusSubtitle = () => {
    if (isCancelled) {
      return "This order is no longer active.";
    }

    if (isCompleted) {
      return "Your order has been completed successfully.";
    }

    if (isDelivered) {
      return "Your material has been successfully delivered.";
    }

    if (isDispatched) {
      return "Your material has been dispatched and is on the way.";
    }

    if (isAccepted) {
      return "Your supplier has accepted the order and is preparing your material.";
    }

    return "Your order has been confirmed successfully.";
  };

  /* =========================
     DATE FORMAT
  ========================= */

  const formatDate = (date?: string) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date?: string) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================
     CALL HANDLER
  ========================= */

  const handleCall = (phone?: string) => {
    if (!phone) {
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  /* =========================
     SUPPLIER INITIALS
  ========================= */

  const supplierInitials =
    supplierName
      .trim()
      .split(/\s+/)
      .map((word: string) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

      {/* =========================
          HEADER
      ========================= */}

      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#0A0A0A" />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =========================
            STATUS HERO
        ========================= */}

        <LinearGradient
          colors={
            isCancelled
              ? ["#FFF4F4", "#FDE7E7"]
              : isDeliveredOrCompleted
              ? ["#F2FFF6", "#E4F7EB"]
              : ["#FFF8EA", "#FFE3B3"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusHero}
        >
          <View style={styles.statusHeroInner}>
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: statusBg,
                },
              ]}
            >
              <Ionicons name={getStatusIcon()} size={28} color={statusColor} />
            </View>

            <View style={styles.statusHeroText}>
              <Text
                style={[
                  styles.statusTitle,
                  {
                    color: statusColor,
                  },
                ]}
              >
                {getStatusTitle()}
              </Text>

              <Text style={styles.statusSubtitle}>{getStatusSubtitle()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* =========================
            ORDER META
        ========================= */}

        <View style={styles.orderMetaCard}>
          <View style={styles.orderMetaLeft}>
            <Text style={styles.metaLabel}>ORDER ID</Text>

            <Text style={styles.orderId} numberOfLines={1}>
              {order?.orderNumber || order?.id || "N/A"}
            </Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.dateContainer}>
            <Text style={styles.metaLabel}>PLACED ON</Text>

            <Text style={styles.metaValue}>
              {formatDateTime(order?.createdAt)}
            </Text>
          </View>
        </View>

        {/* =========================
            SUPPLIER
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplier</Text>

          <View style={styles.supplierCard}>
            <View style={styles.supplierAvatar}>
              <Text style={styles.supplierInitials}>{supplierInitials}</Text>
            </View>

            <View style={styles.supplierInfo}>
              <View style={styles.supplierNameRow}>
                <Text style={styles.supplierName} numberOfLines={1}>
                  {supplierName}
                </Text>

                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#2E9D5B" />

                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              <View style={styles.supplierMetaRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#8C8175" />

                <Text style={styles.supplierMeta} numberOfLines={1}>
                  {supplierLocation}
                </Text>
              </View>

              {!!supplierPhone && (
                <View style={styles.supplierMetaRow}>
                  <Ionicons name="call-outline" size={13} color="#8C8175" />

                  <Text style={styles.supplierMeta}>{supplierPhone}</Text>
                </View>
              )}
            </View>

            {!!supplierPhone && (
              <Pressable
                style={styles.callButton}
                onPress={() => handleCall(supplierPhone)}
              >
                <Ionicons name="call-outline" size={19} color="#FF7A00" />
              </Pressable>
            )}
          </View>
        </View>

        {/* =========================
            ORDER SUMMARY
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.materialCard}>
            <View style={styles.materialIcon}>
              <Ionicons name="cube-outline" size={25} color="#B8860B" />
            </View>

            <View style={styles.materialInfo}>
              <Text style={styles.materialName} numberOfLines={2}>
                {materialName}
              </Text>

              <Text style={styles.materialQuantity}>
                Quantity: {quantityText}
              </Text>

              {pricePerUnit > 0 && (
                <Text style={styles.materialQuantity}>
                  Price: ₹{pricePerUnit.toLocaleString("en-IN")} /{" "}
                  {unit || "unit"}
                </Text>
              )}
            </View>
          </View>

          {/* PRICE BREAKDOWN */}

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Material Amount</Text>

              <Text style={styles.priceValue}>
                ₹{materialAmount.toLocaleString("en-IN")}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Charges</Text>

              <Text
                style={
                  deliveryCharges > 0 ? styles.priceValue : styles.freeText
                }
              >
                {deliveryCharges > 0
                  ? `₹${deliveryCharges.toLocaleString("en-IN")}`
                  : "Included"}
              </Text>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>

              <Text style={styles.totalAmount}>
                ₹{totalAmount.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </View>

        {/* =========================
            DELIVERY ADDRESS
        ========================= */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>

          <View style={styles.deliveryCard}>
            <View style={styles.deliveryIcon}>
              <Ionicons name="location" size={20} color="#FF7A00" />
            </View>

            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryLabel}>Delivery Location</Text>

              <Text style={styles.deliveryAddress}>{deliveryCity}</Text>

              <Text style={styles.fullAddress}>
                {deliveryAddress?.addressLine1 || "Address not available"}
              </Text>

              {!!deliveryAddress?.addressLine2 && (
                <Text style={styles.fullAddress}>
                  {deliveryAddress.addressLine2}
                </Text>
              )}

              {!!deliveryAddress?.landmark && (
                <Text style={styles.fullAddress}>
                  Landmark: {deliveryAddress.landmark}
                </Text>
              )}

              {!!deliveryAddress?.pincode && (
                <Text style={styles.fullAddress}>
                  Pincode: {deliveryAddress.pincode}
                </Text>
              )}
            </View>
          </View>

          {/* EXPECTED DELIVERY */}

          <View style={styles.deliveryTimeCard}>
            <View style={styles.deliveryTimeIcon}>
              <Ionicons name="calendar-outline" size={19} color="#B8860B" />
            </View>

            <View style={styles.deliveryTimeInfo}>
              <Text style={styles.deliveryLabel}>Expected Delivery</Text>

              <Text style={styles.deliveryTime}>
                {order?.expectedDeliveryDate
                  ? formatDate(order.expectedDeliveryDate)
                  : order?.quote?.deliveryTime || "Not available"}
              </Text>
            </View>
          </View>
        </View>

        {/* =========================
            DRIVER DETAILS
        ========================= */}

        {hasDriverDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver & Vehicle Details</Text>

            <View style={styles.driverCard}>
              <View style={styles.driverTopRow}>
                <View style={styles.driverAvatar}>
                  <Ionicons name="person" size={23} color="#FF7A00" />
                </View>

                <View style={styles.driverInfo}>
                  <Text style={styles.driverLabel}>DRIVER</Text>

                  <Text style={styles.driverName}>
                    {driverName || "Driver assigned"}
                  </Text>
                </View>

                {!!driverPhone && (
                  <Pressable
                    style={styles.driverCallButton}
                    onPress={() => handleCall(driverPhone)}
                  >
                    <Ionicons name="call" size={18} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>

              <View style={styles.driverDivider} />

              <View style={styles.driverDetailsRow}>
                <View style={styles.driverDetailBox}>
                  <View style={styles.driverDetailIcon}>
                    <Ionicons name="call-outline" size={16} color="#FF7A00" />
                  </View>

                  <View style={styles.driverDetailContent}>
                    <Text style={styles.driverDetailLabel}>Phone</Text>

                    <Text style={styles.driverDetailValue}>
                      {driverPhone || "Not available"}
                    </Text>
                  </View>
                </View>

                <View style={styles.driverDetailBox}>
                  <View style={styles.driverDetailIcon}>
                    <Ionicons name="car-outline" size={17} color="#FF7A00" />
                  </View>

                  <View style={styles.driverDetailContent}>
                    <Text style={styles.driverDetailLabel}>Vehicle</Text>

                    <Text style={styles.driverDetailValue}>
                      {vehicleNumber || "Not available"}
                    </Text>
                  </View>
                </View>
              </View>

              {!!order?.dispatchDate && (
                <View style={styles.dispatchInfo}>
                  <Ionicons name="navigate-outline" size={15} color="#2E9D5B" />

                  <Text style={styles.dispatchText}>
                    Dispatched on {formatDateTime(order.dispatchDate)}
                  </Text>
                </View>
              )}

              {!!deliveryNotes && (
                <View style={styles.deliveryNotes}>
                  <Text style={styles.deliveryNotesLabel}>Delivery Notes</Text>

                  <Text style={styles.deliveryNotesText}>{deliveryNotes}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* =========================
            TIMELINE
        ========================= */}

        {!isCancelled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Timeline</Text>

            <View style={styles.timelineCard}>
              <TimelineItem
                icon="checkmark"
                title="Order Confirmed"
                subtitle={
                  order?.createdAt
                    ? formatDateTime(order.createdAt)
                    : "Order placed"
                }
                completed
                active={false}
                last={false}
              />

              <TimelineItem
                icon="cube-outline"
                title="Supplier Preparing"
                subtitle={
                  isAccepted || isDispatched || isDelivered || isCompleted
                    ? "Supplier accepted the order"
                    : "Waiting for supplier confirmation"
                }
                completed={isDispatched || isDelivered || isCompleted}
                active={isAccepted}
                last={false}
              />

              <TimelineItem
                icon="car-outline"
                title="Out for Delivery"
                subtitle={
                  isDispatched || isDelivered || isCompleted
                    ? order?.dispatchDate
                      ? `Dispatched ${formatDateTime(order.dispatchDate)}`
                      : "Material dispatched"
                    : "Will update when dispatched"
                }
                completed={isDispatched || isDelivered || isCompleted}
                active={isDispatched}
                last={false}
              />

              <TimelineItem
                icon="home-outline"
                title="Delivered"
                subtitle={
                  isDelivered || isCompleted
                    ? "Successfully delivered"
                    : "Pending"
                }
                completed={isDelivered || isCompleted}
                active={false}
                last
              />

              {/* <TimelineItem
                icon="checkmark-circle-outline"
                title="Completed"
                subtitle={
                  isCompleted ? "Order completed successfully" : "Pending"
                }
                completed={isCompleted}
                active={false}
                last */}
            </View>
          </View>
        )}

        {/* =========================
            CANCELLED INFO
        ========================= */}

        {isCancelled && (
          <View style={styles.cancelledCard}>
            <View style={styles.cancelledIcon}>
              <Ionicons name="close-circle" size={23} color="#D94B4B" />
            </View>

            <View style={styles.cancelledContent}>
              <Text style={styles.cancelledTitle}>Order Cancelled</Text>

              <Text style={styles.cancelledText}>
                This order has been cancelled and is no longer active.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* =========================
          BOTTOM ACTION
      ========================= */}

      <View style={styles.bottomBar}>
        {isDispatched ? (
          <Pressable
            style={styles.trackButtonWrapper}
            onPress={handleMaterialReceived}
            disabled={confirmingReceived}
          >
            <LinearGradient
              colors={["#2E9D5B", "#42B96F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.trackButton}
            >
              {confirmingReceived ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text style={styles.trackButtonText}>Material Received</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            style={styles.trackButtonWrapper}
            onPress={() => {
              navigation.navigate("Buyer", {
                screen: "Orders",
              });
            }}
          >
            <LinearGradient
              colors={["#FF7A00", "#FF9F1C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.trackButton}
            >
              <Ionicons name="arrow-back" size={19} color="#FFFFFF" />

              <Text style={styles.trackButtonText}>Back to Orders</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

/* =========================================================
   TIMELINE ITEM
========================================================= */

const TimelineItem = ({
  icon,
  title,
  subtitle,
  completed,
  active,
  last,
}: any) => {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineIcon,
            completed && styles.timelineIconCompleted,
            active && styles.timelineIconActive,
          ]}
        >
          <Ionicons
            name={icon}
            size={16}
            color={completed ? "#FFFFFF" : active ? "#FF7A00" : "#B9AA98"}
          />
        </View>

        {!last && (
          <View
            style={[
              styles.timelineLine,
              completed && styles.timelineLineCompleted,
            ]}
          />
        )}
      </View>

      <View style={styles.timelineContent}>
        <Text
          style={[styles.timelineTitle, active && styles.timelineTitleActive]}
        >
          {title}
        </Text>

        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

export default OrderDetailsScreen;

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  headerSpacer: {
    width: 42,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  /* EMPTY */

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    borderWidth: 1,
    borderColor: "#FFD6AE",
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "900",
    color: "#17120B",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 12,
    color: "#8C8175",
    textAlign: "center",
  },

  /* STATUS */

  statusHero: {
    minHeight: 105,
    borderRadius: 18,
    overflow: "hidden",
  },

  statusHeroInner: {
    flex: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,160,23,0.18)",
  },

  statusHeroText: {
    flex: 1,
    marginLeft: 14,
  },

  statusTitle: {
    fontSize: 17,
    fontWeight: "900",
  },

  statusSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#665C51",
  },

  /* META */

  orderMetaCard: {
    marginTop: 12,
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  orderMetaLeft: {
    flexShrink: 1,
  },

  metaLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#A29483",
  },

  orderId: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "900",
    color: "#17120B",
  },

  metaDivider: {
    width: 1,
    height: 35,
    marginHorizontal: 15,
    backgroundColor: "#F1E2D0",
  },

  dateContainer: {
    flex: 1,
  },

  metaValue: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "700",
    color: "#665C51",
  },

  /* SECTION */

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "900",
    color: "#17120B",
  },

  /* SUPPLIER */

  supplierCard: {
    padding: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    shadowColor: "#B8860B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  supplierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A0A",
  },

  supplierInitials: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFD76A",
  },

  supplierInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  supplierNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  supplierName: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "900",
    color: "#17120B",
  },

  verifiedBadge: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8EF",
  },

  verifiedText: {
    marginLeft: 3,
    fontSize: 8,
    fontWeight: "800",
    color: "#2E9D5B",
  },

  supplierMetaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  supplierMeta: {
    flex: 1,
    marginLeft: 4,
    fontSize: 10,
    color: "#8C8175",
  },

  callButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#FFF0DF",
    borderWidth: 1,
    borderColor: "#FFD6AE",
  },

  /* MATERIAL */

  materialCard: {
    padding: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  materialIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3D6",
    borderWidth: 1,
    borderColor: "#E8C979",
  },

  materialInfo: {
    flex: 1,
    marginLeft: 12,
  },

  materialName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#17120B",
  },

  materialQuantity: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "600",
    color: "#8C8175",
  },

  /* PRICE */

  priceCard: {
    marginTop: 9,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  priceLabel: {
    fontSize: 11,
    color: "#8C8175",
  },

  priceValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#17120B",
  },

  freeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2E9D5B",
  },

  priceDivider: {
    height: 1,
    marginVertical: 4,
    backgroundColor: "#F1E2D0",
  },

  totalRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#17120B",
  },

  totalAmount: {
    fontSize: 19,
    fontWeight: "900",
    color: "#FF7A00",
  },

  /* DELIVERY */

  deliveryCard: {
    padding: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  deliveryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
  },

  deliveryInfo: {
    flex: 1,
    marginLeft: 11,
  },

  deliveryLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#A29483",
  },

  deliveryAddress: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "900",
    color: "#17120B",
  },

  fullAddress: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: "#8C8175",
  },

  deliveryTimeCard: {
    marginTop: 9,
    padding: 13,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  deliveryTimeIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3D6",
  },

  deliveryTimeInfo: {
    flex: 1,
    marginLeft: 11,
  },

  deliveryTime: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "900",
    color: "#17120B",
  },

  /* DRIVER */

  driverCard: {
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  driverTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
    borderWidth: 1,
    borderColor: "#FFD6AE",
  },

  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },

  driverLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#A29483",
  },

  driverName: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "900",
    color: "#17120B",
  },

  driverCallButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E9D5B",
  },

  driverDivider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#F1E2D0",
  },

  driverDetailsRow: {
    flexDirection: "row",
    gap: 10,
  },

  driverDetailBox: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF9",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  driverDetailIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DF",
  },

  driverDetailContent: {
    flex: 1,
    marginLeft: 8,
  },

  driverDetailLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#A29483",
  },

  driverDetailValue: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "900",
    color: "#17120B",
  },

  dispatchInfo: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8EF",
  },

  dispatchText: {
    marginLeft: 7,
    fontSize: 10,
    fontWeight: "700",
    color: "#2E9D5B",
    flex: 1,
  },

  deliveryNotes: {
    marginTop: 10,
    padding: 11,
    borderRadius: 13,
    backgroundColor: "#FFF8EA",
    borderWidth: 1,
    borderColor: "#F1D99D",
  },

  deliveryNotesLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#8C6A20",
  },

  deliveryNotesText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: "#665C51",
  },

  /* TIMELINE */

  timelineCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  timelineItem: {
    minHeight: 68,
    flexDirection: "row",
  },

  timelineLeft: {
    width: 38,
    alignItems: "center",
  },

  timelineIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3EDE4",
  },

  timelineIconCompleted: {
    backgroundColor: "#D4A017",
  },

  timelineIconActive: {
    backgroundColor: "#FFF0DF",
    borderWidth: 1,
    borderColor: "#FFB15C",
  },

  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 3,
    backgroundColor: "#EDE3D6",
  },

  timelineLineCompleted: {
    backgroundColor: "#E5C96D",
  },

  timelineContent: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 1,
  },

  timelineTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8C8175",
  },

  timelineTitleActive: {
    color: "#FF7A00",
    fontWeight: "900",
  },

  timelineSubtitle: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 14,
    color: "#A29483",
  },

  /* CANCELLED */

  cancelledCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F4CACA",
  },

  cancelledIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  cancelledContent: {
    flex: 1,
    marginLeft: 11,
  },

  cancelledTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#A83232",
  },

  cancelledText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: "#8C5555",
  },

  /* PROTECTION */

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
  },

  trustContent: {
    flex: 1,
    marginLeft: 11,
    minWidth: 0,
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
  },

  bottomSpace: {
    height: 110,
  },

  /* BOTTOM BAR */

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    minHeight: 82,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF9",
    borderTopWidth: 1,
    borderTopColor: "#F1E2D0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },

  trackButtonWrapper: {
    flex: 1,
  },

  trackButton: {
    height: 50,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  trackButtonText: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});
