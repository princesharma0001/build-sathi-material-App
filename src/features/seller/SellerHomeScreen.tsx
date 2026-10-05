import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@react-native-vector-icons/ionicons';
// import Ionicons from "react-native-vector-icons/Ionicons";
import { getSellerDashboardApi } from "./seller.api";
import Toast from "react-native-toast-message";
import { getGreeting } from "../../utils/greeting";

const SellerHomeScreen = ({ navigation }: any) => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const stats = [
    {
      id: "requirements",
      title: "New Requirements",
      value: String(dashboard?.stats?.openRequirements ?? 0),
      subtitle: "Need your quote",
      icon: "document-text-outline",
      colors: ["#FF8A00", "#FFB347"], // Orange - new/action
      iconColor: "#FFFFFF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.75)",
    },
    {
      id: "totalRequirements",
      title: "Total Requirements",
      value: String(dashboard?.stats?.totalRequirements ?? 0),
      subtitle: "All requirements",
      icon: "documents-outline",
      colors: ["#2563EB", "#60A5FA"], // Blue - total
      iconColor: "#FFFFFF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.75)",
    },
    {
      id: "thisMonth",
      title: "This Month's Sales",
      value: String(dashboard?.stats?.thisMonthSales ?? 0),
      subtitle: "Sales this month",
      icon: "trending-up-outline",
      colors: ["#16A34A", "#4ADE80"], // Green - sales
      iconColor: "#FFFFFF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.8)",
    },
    {
      id: "quotes",
      title: "Pending Quotes",
      value: String(dashboard?.stats?.pendingQuotations ?? 0),
      subtitle: "Awaiting buyer",
      icon: "pricetag-outline",
      colors: ["#F59E0B", "#FBBF24"], // Amber - pending
      iconColor: "#274690",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.8)",
    },
    {
      id: "orders",
      title: "Active Orders",
      value: String(dashboard?.stats?.activeOrders ?? 0),
      subtitle: "In progress",
      icon: "cube-outline",
      colors: ["#172554", "#274690"], // Navy - active
      iconColor: "#FFFFFF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.7)",
    },
    {
      id: "complete",
      title: "Completed Orders",
      value: String(dashboard?.stats?.completedOrders ?? 0),
      subtitle: "Successfully completed",
      icon: "checkmark-circle-outline",
      colors: ["#059669", "#34D399"], // Emerald - completed
      iconColor: "#FFFFFF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.8)",
    },
    {
      id: "accepted",
      title: "Accepted Quotations",
      value: String(dashboard?.stats?.acceptedQuotations ?? 0),
      subtitle: "Accepted by buyers",
      icon: "checkmark-done-outline",
      colors: ["#0D9488", "#2DD4BF"], // Teal - accepted
      iconColor: "#FFFFFF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.8)",
    },
    {
      id: "rejected",
      title: "Rejected Quotations",
      value: String(dashboard?.stats?.rejectedQuotations ?? 0),
      subtitle: "Not accepted",
      icon: "close-circle-outline",
      colors: ["#DC2626", "#F87171"], // Red - rejected
      iconColor: "#FFFFFF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.8)",
    },
  ];

  const popularDemand = (dashboard?.popularMaterials || []).map(
    (material: any, index: number) => {
      const uiStyles = [
        {
          colors: ["#FFF3D6", "#FFE2A8"],
          iconBackground: "#FFF8E7",
          icon: "🏖️",
          accent: "#F97316",
        },
        {
          colors: ["#EAF5FF", "#D6EBFF"],
          iconBackground: "#F0F8FF",
          icon: "🧱",
          accent: "#2563EB",
        },
        {
          colors: ["#E8F7EE", "#D5F0DE"],
          iconBackground: "#F2FBF5",
          icon: "🧱",
          accent: "#16A34A",
        },
        {
          colors: ["#F3E8FF", "#E9D5FF"],
          iconBackground: "#FAF5FF",
          icon: "🏗️",
          accent: "#9333EA",
        },
      ];

      const style = uiStyles[index % uiStyles.length];

      return {
        ...material,
        ...style,
        requirement: `${material.requirementCount ?? 0} ${
          (material.requirementCount ?? 0) === 1
            ? "requirement"
            : "requirements"
        }`,
      };
    }
  );

  const recentRequirements = (dashboard?.recentRequirements || [])
    ?.slice(0, 5)
    ?.map((item: any) => {
      const isUrgent =
        String(item.deliveryPreference || "").toLowerCase() === "urgent";

      return {
        ...item,

        material: item.material?.name || "Material",

        quantity: `${item.quantity ?? 0} ${
          item.unit || item.material?.unit || ""
        }`,

        location:
          item.buyer?.city && item.buyer?.state
            ? `${item.buyer.city}, ${item.buyer.state}`
            : item.deliveryAddress?.city ||
              item.deliveryAddress?.state ||
              "Location not available",

        time: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })
          : "",

        urgent: isUrgent,
      };
    });

    console.log("asfdf",recentRequirements);
    

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await getSellerDashboardApi();
      console.log("sellerDash", response);

      console.log(
        "SELLER DASHBOARD RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      setDashboard(response?.data);
    } catch (error: any) {
      console.log("SELLER DASHBOARD ERROR:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      const response = await getSellerDashboardApi();

      setDashboard(response?.data);
    } catch (error: any) {
      console.log("REFRESH DASHBOARD ERROR:", error?.message || error);
    } finally {
      setRefreshing(false);
    }
  };



  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

      <LinearGradient
        colors={["#FFF3D6", "#FFF8EE", "#FFFFFF", "#FFFFFF"]}
        locations={[0, 0.34, 0.72, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <SafeAreaView style={styles.container}>
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
              <Text style={styles.bellIcon}>🔔</Text>

              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </Pressable>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* WELCOME HERO */}
            <View style={styles.welcomeSection}>
              <View>
                <Text style={styles.welcomeSmall}>{getGreeting()} 👋</Text>

                <Text style={styles.welcomeTitle}>Grow your business</Text>

                <Text style={styles.welcomeSubtitle}>
                  Find buyers. Send quotes. Get orders.
                </Text>
              </View>

              <Pressable
                style={styles.profileMini}
                onPress={() => navigation.navigate("SellerProfile")}
              >
                <Ionicons name="person-outline" size={21} color="#FF7A00" />
              </Pressable>
            </View>

            {/* BUSINESS STATUS */}
            {/* BUSINESS STATUS */}
            <LinearGradient
              colors={["#0A0A0A", "#201707", "#3A2708"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.businessCard}
            >
              <View style={styles.businessTop}>
                <View>
                  <Text style={styles.businessLabel}>BUSINESS STATUS</Text>

                  <Text style={styles.businessName}>
                    {dashboard?.seller?.profile?.businessName ||
                      dashboard?.seller?.name ||
                      "Your Business"}
                  </Text>
                </View>

                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={15} color="#FFD76A" />

                  <Text style={styles.verifiedText}>
                    {dashboard?.subscription?.hasTrustedBadge
                      ? "Verified"
                      : "Seller"}
                  </Text>
                </View>
              </View>

              <View style={styles.businessDivider} />

              <View style={styles.businessBottom}>
                <View>
                  <Text style={styles.businessStatLabel}>Response Rate</Text>

                  <Text style={styles.businessStatValue}>
                    {dashboard?.stats?.responseRate || "0%"}
                  </Text>
                </View>

                <View>
                  <Text style={styles.businessStatLabel}>Total Sales</Text>

                  <Text style={styles.businessStatValue}>
                    ₹
                    {Number(dashboard?.stats?.totalSales || 0).toLocaleString(
                      "en-IN"
                    )}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* STATS */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Your Business</Text>
                <Text style={styles.sectionSubtitle}>Today's activity</Text>
              </View>

              <Pressable onPress={() => navigation.navigate("SellerOrders")}>
                <Text style={styles.viewAll}>View all →</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScroll}
            >
              {stats.map((stat) => (
                <Pressable
                  key={stat.id}
                  style={styles.statCard}
                  onPress={() => {
                    if (stat.id === "requirements") {
                      navigation.navigate("SellerRequirements");
                    } else if (stat.id === "quotes") {
                      navigation.navigate("SellerQuotes");
                    } else {
                      navigation.navigate("SellerOrders");
                    }
                  }}
                >
                  <LinearGradient
                    colors={stat.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statGradient}
                  >
                    <View
                      style={[
                        styles.statIcon,
                        {
                          backgroundColor:
                            stat.id === "quotes"
                              ? "#FFFFFF"
                              : "rgba(255,255,255,0.16)",
                        },
                      ]}
                    >
                      <Ionicons
                        name={stat.icon}
                        size={20}
                        color={stat.iconColor}
                      />
                    </View>

                    <Text style={[styles.statTitle, { color: stat.textColor }]}>
                      {stat.title}
                    </Text>

                    <Text style={[styles.statValue, { color: stat.textColor }]}>
                      {stat.value}
                    </Text>

                    <Text
                      style={[styles.statSubtitle, { color: stat.subColor }]}
                    >
                      {stat.subtitle}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>

            {/* POPULAR DEMAND */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Popular Demand</Text>
                <Text style={styles.sectionSubtitle}>
                  Materials buyers need right now
                </Text>
              </View>

              <Pressable
                onPress={() => navigation.navigate("SellerRequirements")}
              >
                <Text style={styles.viewAll}>See all →</Text>
              </Pressable>
            </View>

            <View style={styles.materialGrid}>
              {popularDemand.length > 0 ? (
                popularDemand.map((material: any) => (
                  <Pressable
                    key={material.id}
                    style={styles.materialCard}
                    onPress={() =>
                      navigation.navigate("SellerRequirements", {
                        material: material.name,
                      })
                    }
                  >
                    <LinearGradient
                      colors={material.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.materialGradient}
                    >
                      <View
                        style={[
                          styles.materialIcon,
                          {
                            backgroundColor: material.iconBackground,
                          },
                        ]}
                      >
                        <Text style={styles.materialEmoji}>
                          {material.icon}
                        </Text>
                      </View>

                      <Text style={styles.materialName}>{material.name}</Text>

                      <Text style={styles.materialDemand}>
                        {material.requirement}
                      </Text>

                      <View style={styles.materialArrow}>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={material.accent}
                        />
                      </View>
                    </LinearGradient>
                  </Pressable>
                ))
              ) : (
                <View style={styles.emptyDemand}>
                  <Text style={styles.emptyDemandText}>
                    No popular materials yet
                  </Text>
                </View>
              )}
            </View>

            {/* RECENT REQUIREMENTS */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>New Buyer Requirements</Text>
                <Text style={styles.sectionSubtitle}>
                  Opportunities near you
                </Text>
              </View>

              <Pressable
                onPress={() => navigation.navigate("SellerRequirements")}
              >
                <Text style={styles.viewAll}>View all →</Text>
              </Pressable>
            </View>

            <View style={styles.requirementList}>
              {recentRequirements?.length > 0 ? (
                recentRequirements?.map((requirement: any) => (
                  <Pressable
                  key={requirement.id}
                  style={styles.requirementCard}
                  onPress={() => {
                    if (requirement.status === "ORDERED") {
                      Toast.show({
                        type: "info",
                        text1: "Already Ordered",
                        text2: "This requirement has already been converted into an order.",
                      });
                      return;
                    }
                  
                    navigation.navigate("SellerRequirementDetails", {
                      requirement,
                    });
                  }}
                >
                  
                    <View style={styles.requirementIcon}>
                      <Ionicons
                        name="document-text-outline"
                        size={21}
                        color="#FF7A00"
                      />
                    </View>

                    <View style={styles.requirementInfo}>
                      <View style={styles.requirementTitleRow}>
                        <Text style={styles.requirementMaterial}>
                          {requirement.material}
                        </Text>

                        {/* {requirement.urgent && ( */}
                          <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>{requirement?.deliveryPreference}</Text>
                          </View>
                          <View style={styles.urgentBadge1}>
                            <Text style={styles.urgentText}>{requirement?.status}</Text>
                          </View>
                        {/* )} */}
                      </View>

                      <Text style={styles.requirementQuantity}>
                        {requirement.quantity}
                      </Text>

                      <View style={styles.requirementMeta}>
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color="#8C8175"
                        />

                        <Text style={styles.metaText}>
                          {requirement.location}
                        </Text>

                        <View style={styles.metaDot} />

                        <Text style={styles.metaText}>{requirement.time}</Text>
                        
                      </View>
                      
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#B5A99C"
                    />
                  </Pressable>
                ))
              ) : (
                <View style={styles.emptyDemand}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons
                      name="document-text-outline"
                      size={28}
                      color="#FF8A00"
                    />
                  </View>

                  <Text style={styles.emptyDemandTitle}>
                    No Requirements Found
                  </Text>

                  <Text style={styles.emptyDemandText}>
                    There are no recent material requirements at the moment.
                  </Text>
                </View>
              )}
            </View>
            <View style={{ height: 70 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default SellerHomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  background: {
    flex: 1,
  },
  emptyDemand: {
    width: "100%",
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#FFF9F2",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F3E5D5",
    marginTop: 4,
  },

  emptyIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0DD",
    marginBottom: 12,
  },

  emptyDemandTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172554",
    marginBottom: 5,
    textAlign: "center",
  },

  emptyDemandText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#8C8175",
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 280,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
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

  logoOrange: {
    color: "#F97316",
  },

  profile: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    borderRadius: 50,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  brand: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: "#0A0A0A",
  },

  headerSubtitle: {
    fontSize: 10,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 2,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
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
    borderColor: "#FFFFFF",
  },

  /* WELCOME */

  welcomeSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  welcomeSmall: {
    fontSize: 11,
    color: "#8C8175",
    fontWeight: "700",
    marginBottom: 4,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 5,
  },

  welcomeTitle: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  welcomeSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#8C8175",
    fontWeight: "600",
  },

  profileMini: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#FFF0DC",
    borderWidth: 1,
    borderColor: "#F4D8B3",
    alignItems: "center",
    justifyContent: "center",
  },

  /* BUSINESS */

  businessCard: {
    borderRadius: 22,
    // padding: 18,
    marginBottom: 24,
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.15,
    shadowRadius: 13,
    elevation: 5,
  },

  businessTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 15,
  },

  businessLabel: {
    color: "#FFD76A",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  businessName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,215,106,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,215,106,0.22)",
  },

  verifiedText: {
    color: "#FFD76A",
    fontSize: 9,
    fontWeight: "800",
    marginLeft: 4,
  },

  businessDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginVertical: 16,
  },

  businessBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
  },

  businessStatLabel: {
    color: "#BEB6AA",
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 5,
  },

  businessStatValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  /* SECTIONS */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 14,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: 3,
  },

  viewAll: {
    fontSize: 12,
    color: "#FF7A00",
    fontWeight: "800",
  },

  /* STATS */

  statsScroll: {
    paddingBottom: 4,
    gap: 10,
  },

  statCard: {
    width: 145,
    height: 145,
    borderRadius: 19,
    overflow: "hidden",
    // shadowColor: '#8C5A2B',
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.08,
    // shadowRadius: 8,
    // elevation: 3,
  },

  statGradient: {
    flex: 1,
    // padding: 13,
  },

  statIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
    marginLeft: 14,
    marginTop: 14,
  },

  statTitle: {
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 14,
  },

  statValue: {
    fontSize: 25,
    fontWeight: "900",
    marginTop: 3,
    marginLeft: 14,
  },

  statSubtitle: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 1,
    marginLeft: 14,
  },

  /* QUICK ACTIONS */

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 24,
  },

  quickCard: {
    width: "48.5%",
    height: 116,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0D8B8",
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },

  quickGradient: {
    flex: 1,
    padding: 12,
    position: "relative",
  },

  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  quickTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  quickSubtitle: {
    fontSize: 9,
    fontWeight: "600",
    color: "#8C8175",
    marginTop: 2,
  },

  quickArrow: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* MATERIALS */

  materialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 24,
  },

  materialCard: {
    width: "48.5%",
    height: 122,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0D8B8",
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },

  materialGradient: {
    flex: 1,
    // padding: 12,
    position: "relative",
  },

  materialIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 14,
    paddingTop: 14,
  },

  materialEmoji: {
    fontSize: 21,
  },

  materialName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "900",
    color: "#0A0A0A",
    paddingLeft: 14,
  },

  materialDemand: {
    marginTop: 2,
    fontSize: 9,
    color: "#8C8175",
    fontWeight: "700",
    paddingLeft: 14,
  },

  materialArrow: {
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* REQUIREMENTS */

  requirementList: {
    gap: 10,
    marginBottom: 24,
  },

  requirementCard: {
    minHeight: 82,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  requirementIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF0DC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  requirementInfo: {
    flex: 1,
  },

  requirementTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  requirementMaterial: {
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  urgentBadge: {
    marginLeft: 7,
    backgroundColor: "#FFF0E8",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  urgentBadge1: {
    marginLeft: 7,
    // backgroundColor: "#FFF0E8",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  urgentText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#EA580C",
    textTransform: "uppercase",
  },

  requirementQuantity: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "700",
    marginTop: 3,
  },

  requirementMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  metaText: {
    fontSize: 12,
    color: "#8C8175",
    fontWeight: "600",
    marginLeft: 2,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#C5B9AB",
    marginHorizontal: 6,
  },

  /* TIP */

  tipCard: {
    borderRadius: 18,
    // padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1D9A8",
    height: 80,
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFDF8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0A0A0A",
    marginBottom: 3,
  },

  tipText: {
    fontSize: 9,
    lineHeight: 14,
    color: "#8C8175",
    fontWeight: "600",
  },
});
