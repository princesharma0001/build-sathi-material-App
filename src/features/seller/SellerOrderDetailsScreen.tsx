import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Linking,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

const SellerOrderDetailsScreen = ({ navigation, route }: any) => {
  const { order } = route.params || {};

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#FF7A00" />

        <Text style={styles.emptyTitle}>Order not found</Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = String(order.status ?? "").toUpperCase();

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
  }[status] || {
    label: order.status ?? "Unknown",
    color: "#8C8175",
    bg: "#F5F1EC",
    icon: "cube-outline",
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string | null | undefined) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string | number | null | undefined) => {
    const value = Number(amount ?? 0);

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const buyerPhone =
    order.buyer?.buyerProfile?.phoneNumber ||
    order.buyer?.phone ||
    order.deliveryAddress?.phone;

  const buyerCompany =
    order.buyer?.buyerProfile?.companyName || "Individual Buyer";

  const deliveryAddress = order.deliveryAddress;

  const fullAddress = [
    deliveryAddress?.addressLine1,
    deliveryAddress?.addressLine2,
    deliveryAddress?.landmark,
    deliveryAddress?.city,
    deliveryAddress?.state,
    deliveryAddress?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const callNumber = (phone: string) => {
    if (!phone) {
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  const shareOrderOnWhatsApp = async () => {
    const driverPhone = String(order.driverPhone || "").replace(/\D/g, "");

    if (!driverPhone) {
      return;
    }

    const message = `
  *BuildSathi - Delivery Receipt* 🧾
  
  *Order Details*
  Order No: ${order.orderNumber || "N/A"}
  Order Status: ${statusConfig.label}
  Order Date: ${formatDate(order.createdAt)}
  
  *Material Details* 🧱
  Material: ${order.material?.name || "N/A"}
  Quantity: ${order.quantity || "N/A"} ${order.unit || ""}
  Price/Unit: ${formatAmount(order.pricePerUnit)}
  Material Amount: ${formatAmount(order.materialAmount)}
  Delivery Charges: ${formatAmount(order.deliveryCharges)}
  *Total Order Value: ${formatAmount(order.totalAmount)}*
  
  *Buyer Details* 👤
  Buyer: ${order.buyer?.name || "N/A"}
  Company: ${buyerCompany}
  Phone: ${buyerPhone || "N/A"}
  
  *Delivery Address* 📍
  ${fullAddress || "Address not available"}
  
  *Driver Details* 🚚
  Driver: ${order.driverName || "N/A"}
  Driver Phone: ${order.driverPhone || "N/A"}
  Vehicle: ${order.vehicleNumber || "N/A"}
  
  *Expected Delivery:* ${formatDate(order.expectedDeliveryDate)}
  
  ${order.deliveryNotes ? `*Delivery Notes:* ${order.deliveryNotes}` : ""}
  
  Thank you for using *BuildSathi*.
    `.trim();

    // India country code
    const phone = `91${driverPhone}`;

    // WhatsApp standard URL
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    console.log("WhatsApp URL:", whatsappUrl);

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);

      console.log("Can open WhatsApp URL:", supported);

      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        console.log("WhatsApp is not available on this device");
      }
    } catch (error) {
      console.log("WhatsApp open error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8EE" />

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={23} color="#172554" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Order Details</Text>

            <Text style={styles.headerSubtitle}>{order.orderNumber}</Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              if (buyerPhone) {
                callNumber(buyerPhone);
              }
            }}
          >
            <Ionicons name="call-outline" size={21} color="#FF7A00" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* ORDER STATUS */}
          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusIcon,
                  {
                    backgroundColor: statusConfig.bg,
                  },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon as any}
                  size={25}
                  color={statusConfig.color}
                />
              </View>

              <View>
                <Text style={styles.statusLabel}>Order Status</Text>

                <Text
                  style={[
                    styles.statusValue,
                    {
                      color: statusConfig.color,
                    },
                  ]}
                >
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <View style={styles.orderDate}>
              <Text style={styles.orderDateLabel}>Ordered</Text>

              <Text style={styles.orderDateValue}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
          </View>

          {/* MATERIAL DETAILS */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="cube-outline" size={19} color="#FF7A00" />
              </View>

              <Text style={styles.sectionTitle}>Material Details</Text>
            </View>

            <View style={styles.materialMain}>
              <View style={styles.materialEmojiBox}>
                <Text style={styles.materialEmoji}>
                  {order.material?.name === "Brick" ? "🧱" : "🏗️"}
                </Text>
              </View>

              <View style={styles.materialInfo}>
                <Text style={styles.materialName}>
                  {order.material?.name || "Material"}
                </Text>

                <Text style={styles.materialId}>
                  Material ID: {order.materialId}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <DetailRow
              icon="layers-outline"
              label="Quantity"
              value={`${order.quantity} ${order.unit}`}
            />

            <DetailRow
              icon="pricetag-outline"
              label="Price per Unit"
              value={formatAmount(order.pricePerUnit)}
            />

            <DetailRow
              icon="cash-outline"
              label="Material Amount"
              value={formatAmount(order.materialAmount)}
            />

            <DetailRow
              icon="car-outline"
              label="Delivery Charges"
              value={formatAmount(order.deliveryCharges)}
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Order Value</Text>

              <Text style={styles.totalValue}>
                {formatAmount(order.totalAmount)}
              </Text>
            </View>
          </View>

          {/* BUYER DETAILS */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="person-outline" size={19} color="#FF7A00" />
              </View>

              <Text style={styles.sectionTitle}>Buyer Details</Text>
            </View>

            <View style={styles.profileRow}>
              <View style={styles.profileAvatar}>
                <Ionicons name="business-outline" size={25} color="#FF7A00" />
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {order.buyer?.name || "Buyer"}
                </Text>

                <Text style={styles.profileCompany}>{buyerCompany}</Text>
              </View>

              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />

                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <DetailRow
              icon="mail-outline"
              label="Email"
              value={order.buyer?.email || "Not available"}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => buyerPhone && callNumber(buyerPhone)}
            >
              <DetailRow
                icon="call-outline"
                label="Phone"
                value={buyerPhone || "Not available"}
                valueColor={buyerPhone ? "#FF7A00" : undefined}
              />
            </TouchableOpacity>

            <DetailRow
              icon="location-outline"
              label="City"
              value={order.buyer?.buyerProfile?.city || "Not available"}
            />

            <DetailRow
              icon="map-outline"
              label="State"
              value={order.buyer?.buyerProfile?.state || "Not available"}
            />

            <DetailRow
              icon="mail-outline"
              label="Pincode"
              value={order.buyer?.buyerProfile?.pincode || "Not available"}
            />
          </View>

          {/* DELIVERY ADDRESS */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="location-outline" size={19} color="#FF7A00" />
              </View>

              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>

            <View style={styles.addressHeader}>
              <View>
                <Text style={styles.addressLabel}>
                  {deliveryAddress?.label || "Delivery Address"}
                </Text>

                <Text style={styles.addressName}>
                  {deliveryAddress?.name || "Not available"}
                </Text>
              </View>

              {deliveryAddress?.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>

            <View style={styles.addressBox}>
              <Ionicons name="location" size={18} color="#FF7A00" />

              <Text style={styles.addressText}>
                {fullAddress || "Address not available"}
              </Text>
            </View>

            {deliveryAddress?.phone && (
              <TouchableOpacity
                style={styles.contactBox}
                onPress={() => callNumber(deliveryAddress.phone)}
              >
                <Ionicons name="call-outline" size={17} color="#16A34A" />

                <Text style={styles.contactText}>{deliveryAddress.phone}</Text>

                <Ionicons name="chevron-forward" size={17} color="#16A34A" />
              </TouchableOpacity>
            )}
          </View>

          {/* DISPATCH DETAILS */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="car-outline" size={19} color="#FF7A00" />
              </View>

              <Text style={styles.sectionTitle}>Dispatch & Delivery</Text>
            </View>

            <DetailRow
              icon="person-outline"
              label="Driver Name"
              value={order.driverName || "Not assigned"}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => order.driverPhone && callNumber(order.driverPhone)}
            >
              <DetailRow
                icon="call-outline"
                label="Driver Phone"
                value={order.driverPhone || "Not available"}
                valueColor={order.driverPhone ? "#FF7A00" : undefined}
              />
            </TouchableOpacity>

            <DetailRow
              icon="car-outline"
              label="Vehicle Number"
              value={order.vehicleNumber || "Not available"}
            />

            <DetailRow
              icon="calendar-outline"
              label="Dispatch Date"
              value={formatDateTime(order.dispatchDate)}
            />

            <DetailRow
              icon="calendar-number-outline"
              label="Expected Delivery"
              value={formatDate(order.expectedDeliveryDate)}
            />

            {order.deliveryNotes && (
              <>
                <View style={styles.divider} />

                <Text style={styles.notesLabel}>Delivery Notes</Text>

                <View style={styles.notesBox}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#8C8175"
                  />

                  <Text style={styles.notesText}>{order.deliveryNotes}</Text>
                </View>
              </>
            )}
          </View>

          {/* QUOTE DETAILS */}
          {order.quote && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={19}
                    color="#FF7A00"
                  />
                </View>

                <Text style={styles.sectionTitle}>Quote Details</Text>
              </View>

              <DetailRow
                icon="pricetag-outline"
                label="Price per Unit"
                value={formatAmount(order.quote.pricePerUnit)}
              />

              <DetailRow
                icon="cash-outline"
                label="Material Amount"
                value={formatAmount(order.quote.materialAmount)}
              />

              <DetailRow
                icon="car-outline"
                label="Delivery Charges"
                value={formatAmount(order.quote.deliveryCharges)}
              />

              <DetailRow
                icon="wallet-outline"
                label="Quote Total"
                value={formatAmount(order.quote.totalAmount)}
              />

              <DetailRow
                icon="time-outline"
                label="Delivery Time"
                value={order.quote.deliveryTime || "Not specified"}
              />

              <DetailRow
                icon="calendar-outline"
                label="Quote Validity"
                value={order.quote.validity || "Not specified"}
              />

              <View style={styles.quoteStatus}>
                <Text style={styles.quoteStatusLabel}>Quote Status</Text>

                <Text style={styles.quoteStatusValue}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>
          )}

          {/* BOTTOM ACTION */}

          <View style={styles.bottomSpace} />
        </ScrollView>
        {order.driverPhone && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.whatsappButton}
              onPress={shareOrderOnWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={21} color="#FFFFFF" />

              <Text style={styles.whatsappButtonText}>Share Receipt</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const DetailRow = ({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) => {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon as any} size={17} color="#8C8175" />

        <Text numberOfLines={1} style={styles.detailLabel}>
          {label}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.detailValue,
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF3D6",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFF3D6",
  },

  headerGradient: {
    paddingTop: 8,
  },

  header: {
    height: 68,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF3D6",
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleContainer: {
    alignItems: "center",
    flex: 1,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: "#8C8175",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  statusLabel: {
    fontSize: 11,
    color: "#8C8175",
    fontWeight: "600",
  },
  bottomActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
    paddingBottom: 20,
    paddingHorizontal: 22,
  },

  whatsappButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  whatsappButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },

  callDriverButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  callDriverText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 7,
  },

  statusValue: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 3,
  },

  orderDate: {
    alignItems: "flex-end",
  },

  orderDateLabel: {
    fontSize: 10,
    color: "#A69A8C",
    fontWeight: "600",
  },

  orderDateValue: {
    fontSize: 12,
    color: "#172554",
    fontWeight: "700",
    marginTop: 3,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  materialMain: {
    flexDirection: "row",
    alignItems: "center",
  },

  materialEmojiBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  materialEmoji: {
    fontSize: 29,
  },

  materialInfo: {
    flex: 1,
  },

  materialName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172554",
  },

  materialId: {
    fontSize: 10,
    color: "#A69A8C",
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1ECE6",
    marginVertical: 14,
  },

  detailRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 0.9,
  },

  detailLabel: {
    marginLeft: 9,
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
  },

  detailValue: {
    flex: 1.1,
    textAlign: "right",
    fontSize: 12,
    color: "#172554",
    fontWeight: "700",
  },

  totalRow: {
    marginTop: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1ECE6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#172554",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FF7A00",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172554",
  },

  profileCompany: {
    fontSize: 12,
    color: "#8C8175",
    marginTop: 3,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  verifiedText: {
    marginLeft: 3,
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  addressLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#172554",
  },

  addressName: {
    fontSize: 11,
    color: "#8C8175",
    marginTop: 4,
  },

  defaultBadge: {
    backgroundColor: "#EAF8EF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },

  defaultBadgeText: {
    color: "#16A34A",
    fontSize: 9,
    fontWeight: "800",
  },

  addressBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    padding: 13,
    marginTop: 14,
  },

  addressText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    lineHeight: 19,
    color: "#4B433B",
    fontWeight: "600",
  },

  contactBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#EAF8EF",
    flexDirection: "row",
    alignItems: "center",
  },

  contactText: {
    flex: 1,
    marginLeft: 8,
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "800",
  },

  notesLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#172554",
    marginBottom: 9,
  },

  notesBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8F5F1",
    borderRadius: 13,
    padding: 12,
  },

  notesText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    lineHeight: 18,
    color: "#5F554B",
  },

  quoteStatus: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF0DF",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  quoteStatusLabel: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
  },

  quoteStatusValue: {
    fontSize: 12,
    color: "#FF7A00",
    fontWeight: "900",
  },

  callDriverButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FF7A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  callDriverText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  bottomSpace: {
    height: 20,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#FFF8EE",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "800",
    color: "#172554",
  },

  backButton: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
  },

  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});

export default SellerOrderDetailsScreen;
