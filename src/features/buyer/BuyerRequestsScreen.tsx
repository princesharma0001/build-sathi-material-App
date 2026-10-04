import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  StatusBar,
  Image,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getBuyerRequirementsApi, Requirement } from "./requirement.api";
const BuyerRequestsScreen = ({ navigation }: any) => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

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

  const getStatusStyle = (status: Requirement["status"]) => {
    if (status === "OPEN") {
      return {
        pill: styles.activePill,
        dot: styles.activeDot,
        text: styles.activeStatusText,
      };
    }

    if (status === "CANCELLED") {
      return {
        pill: styles.cancelledPill,
        dot: styles.cancelledDot,
        text: styles.cancelledStatusText,
      };
    }

    if (status === "COMPLETED" || status === "ACCEPTED") {
      return {
        pill: styles.completedPill,
        dot: styles.completedDot,
        text: styles.completedStatusText,
      };
    }

    return {
      pill: styles.pendingPill,
      dot: styles.pendingDot,
      text: styles.pendingStatusText,
    };
  };

  const activeCount = requirements.filter(
    (item) => item.status === "OPEN" || item.status === "QUOTED"
  ).length;

  const completedCount = requirements.filter(
    (item) => item.status === "COMPLETED"
  ).length;

  const loadRequirements = useCallback(async () => {
    try {
      setError("");

      const data = await getBuyerRequirementsApi();

      console.log("✅ BUYER REQUIREMENTS:", JSON.stringify(data, null, 2));

      setRequirements(data);
    } catch (error: any) {
      console.log("❌ GET REQUIREMENTS STATUS:", error?.response?.status);

      console.log(
        "❌ GET REQUIREMENTS DATA:",
        JSON.stringify(error?.response?.data, null, 2)
      );

      console.log("❌ GET REQUIREMENTS MESSAGE:", error?.message);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load requirements"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequirements();
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

      <SafeAreaView style={styles.container}>
        {/* HEADER */}
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
              navigation.navigate("Notifications");
            }}
          >
            <Ionicons name="notifications-outline" size={21} color="#0A0A0A" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </Pressable>
        </View>

        <FlatList
          data={loading || error ? [] : requirements}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#FF7A00"]}
              tintColor="#FF7A00"
            />
          }
          ListHeaderComponent={
            <>
              {/* INTRO */}
              <View style={styles.intro}>
                <Text style={styles.introTitle}>Your Requirements</Text>

                <Text style={styles.introSubtitle}>
                  Track your material requests and supplier quotes.
                </Text>
              </View>

              {/* POST REQUIREMENT */}
              <Pressable
                onPress={() => navigation.navigate("CreateRequirement")}
              >
                <LinearGradient
                  colors={["#FF7A00", "#FF9F1C", "#FFC43D"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.postCard}
                >
                  <View style={styles.postIconContainer}>
                    <Text style={styles.postIcon}>＋</Text>
                  </View>

                  <View style={styles.postContent}>
                    <Text style={styles.postTitle}>Post New Requirement</Text>

                    <Text style={styles.postSubtitle}>
                      Get quotes from trusted suppliers
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* SUMMARY */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{activeCount}</Text>

                  <Text style={styles.summaryLabel}>Active</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>0</Text>

                  <Text style={styles.summaryLabel}>Quotes</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>{completedCount}</Text>

                  <Text style={styles.summaryLabel}>Completed</Text>
                </View>
              </View>

              {/* SECTION */}
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Recent Requests</Text>

                  <Text style={styles.sectionSubtitle}>
                    Your latest material requirements
                  </Text>
                </View>

                <Pressable>
                  <Text style={styles.filterText}>Filter</Text>
                </Pressable>
              </View>
            </>
          }
          renderItem={({ item: requirement }) => {
            const statusStyle = getStatusStyle(requirement.status);

            const address = requirement.deliveryAddress;

            const location = [address?.city, address?.state]
              .filter(Boolean)
              .join(", ");

            const quantity = `${requirement.quantity} ${requirement.unit}`;

            const createdDate = new Date(requirement.createdAt);

            const time = createdDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <Pressable
                style={styles.requestCard}
                onPress={() =>
                  navigation.navigate("RequestDetails", {
                    requestId: requirement.id,
                  })
                }
              >
                {/* TOP */}
                <View style={styles.requestTop}>
                  <View style={styles.materialIcon}>
                    {requirement.material?.imageUrl ? (
                      <Image
                        source={{
                          uri: requirement.material.imageUrl,
                        }}
                        style={styles.materialImage}
                      />
                    ) : (
                      <Text style={styles.materialEmoji}>🧱</Text>
                    )}
                  </View>

                  <View style={styles.requestTitleContainer}>
                    <Text style={styles.requestTitle} numberOfLines={1}>
                      {requirement.material?.name ?? "Material"}
                    </Text>

                    <Text style={styles.requestQuantity}>{quantity}</Text>
                  </View>

                  <Text style={styles.cardArrow}>›</Text>
                </View>

                {/* LOCATION */}
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>

                  <Text style={styles.locationText} numberOfLines={1}>
                    {location || "Location not available"}
                  </Text>
                </View>

                {/* STATUS */}
                <View style={styles.requestBottom}>
                  <View style={[styles.statusPill, statusStyle.pill]}>
                    <View style={[styles.statusDot, statusStyle.dot]} />

                    <Text style={[styles.statusText, statusStyle.text]}>
                      {getStatusLabel(requirement.status)}
                    </Text>
                  </View>

                  <Text style={styles.quoteText}>
                    {requirement.material?.category?.name ||
                      "Construction Material"}
                  </Text>
                </View>

                {/* FOOTER */}
                <View style={styles.cardFooter}>
                  <Text style={styles.timeText}>Posted {time}</Text>

                  <Pressable
                    onPress={() =>
                      navigation.navigate("RequestDetails", {
                        requestId: requirement.id,
                      })
                    }
                  >
                    <Text style={styles.viewDetails}>View Details →</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF7A00" />

                <Text style={styles.loadingText}>
                  Loading your requirements...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={28}
                    color="#FF7A00"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  Unable to load requirements
                </Text>

                <Text style={styles.emptySubtitle}>{error}</Text>

                <Pressable
                  style={styles.retryButton}
                  onPress={loadRequirements}
                >
                  <Text style={styles.retryText}>Try Again</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={28}
                    color="#FF7A00"
                  />
                </View>

                <Text style={styles.emptyTitle}>No Requirements Yet</Text>

                <Text style={styles.emptySubtitle}>
                  Post your first material requirement and start receiving
                  supplier quotes.
                </Text>

                <Pressable
                  style={styles.retryButton}
                  onPress={() => navigation.navigate("CreateRequirement")}
                >
                  <Text style={styles.retryText}>Post Requirement</Text>
                </Pressable>
              </View>
            )
          }
          ListFooterComponent={<View style={styles.bottomSpace} />}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 110,
  },

  // =========================
  // HEADER
  // =========================

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

  // =========================
  // INTRO
  // =========================

  intro: {
    marginTop: 14,
    marginBottom: 15,
  },

  introTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#242424",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
  },

  emptyCard: {
    marginTop: 5,
    paddingHorizontal: 25,
    paddingVertical: 35,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#FFF1E1",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "900",
    color: "#242424",
  },

  emptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: "#8C8175",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  materialImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
  },

  cancelledPill: {
    backgroundColor: "#FDECEC",
  },

  cancelledDot: {
    backgroundColor: "#EF4444",
  },

  cancelledStatusText: {
    color: "#DC2626",
  },

  completedPill: {
    backgroundColor: "#EAF8EF",
  },

  completedDot: {
    backgroundColor: "#16A34A",
  },

  completedStatusText: {
    color: "#15803D",
  },

  introSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#817568",
    lineHeight: 19,
  },
  profile: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    borderRadius: 50,
  },

  // =========================
  // POST CARD
  // =========================

  postCard: {
    height: 82,
    borderRadius: 18,
    // paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 9,
  },

  postIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  postIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
  },

  postContent: {
    flex: 1,
    marginLeft: 13,
  },

  postTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  postSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#FFF4E7",
  },

  postArrow: {
    fontSize: 25,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // =========================
  // SUMMARY
  // =========================

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  summaryCard: {
    flex: 1,

    height: 78,

    borderRadius: 17,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  summaryNumber: {
    fontSize: 21,
    fontWeight: "900",
    color: "#FF7A00",
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "600",
    color: "#8C8175",
  },

  // =========================
  // SECTION
  // =========================

  sectionHeader: {
    marginTop: 27,
    marginBottom: 13,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#242424",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#8C8175",
  },

  filterText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF7A00",
  },

  // =========================
  // REQUEST CARD
  // =========================

  requestCard: {
    marginBottom: 13,

    padding: 15,

    borderRadius: 20,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#F1E2D0",

    elevation: 3,

    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
  },

  requestTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  materialIcon: {
    width: 50,
    height: 50,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFF1E1",
  },

  materialEmoji: {
    fontSize: 24,
  },

  requestTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  requestTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#242424",
  },

  requestQuantity: {
    marginTop: 4,
    fontSize: 12,
    color: "#7E746B",
    fontWeight: "600",
  },

  cardArrow: {
    fontSize: 27,
    color: "#C8BDB2",
    marginLeft: 8,
  },

  // =========================
  // LOCATION
  // =========================

  locationRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 13,
    paddingTop: 12,

    borderTopWidth: 1,
    borderTopColor: "#F5ECE3",
  },

  locationIcon: {
    fontSize: 14,
  },

  locationText: {
    marginLeft: 6,

    fontSize: 11,
    color: "#7E746B",
    fontWeight: "600",
  },

  // =========================
  // STATUS
  // =========================

  requestBottom: {
    marginTop: 13,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 20,
  },

  activePill: {
    backgroundColor: "#EAF8EF",
  },

  pendingPill: {
    backgroundColor: "#FFF4DF",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  activeDot: {
    backgroundColor: "#2FA45A",
  },

  pendingDot: {
    backgroundColor: "#F59E0B",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  activeStatusText: {
    color: "#238447",
  },

  pendingStatusText: {
    color: "#B87500",
  },

  quoteText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF7A00",
  },

  // =========================
  // FOOTER
  // =========================

  cardFooter: {
    marginTop: 13,

    paddingTop: 11,

    borderTopWidth: 1,
    borderTopColor: "#F5ECE3",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timeText: {
    fontSize: 10,
    color: "#9B9188",
  },

  viewDetails: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FF7A00",
  },

  bottomSpace: {
    height: 20,
  },
});

export default BuyerRequestsScreen;
