import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getSellerProfileApi, SellerProfile } from "./seller.api";
import { useFocusEffect } from "@react-navigation/native";
import { useSubscriptionStore } from "../subscription/subscription.store";
import { useSellerStore } from "./seller.store";

const SellerProfileScreen = ({ navigation }: any) => {
  const {
    subscription,
    loading: subscriptionLoading,
    fetchSubscription,
    getActiveSubscription,
    isPlanActive,
  } = useSubscriptionStore();
  // const [seller, setSeller] = useState<SellerProfile | null>(null);
  // console.log("dfsdgsd", seller);
  const activeSubscription = getActiveSubscription();
  const {
    seller,
    loading: sellerLoading,
    error: sellerError,
    fetchSellerProfile,
  } = useSellerStore();
  const [loading, setLoading] = useState(true);

  const menuItems = [
    {
      id: "business",
      title: "Business Profile",
      subtitle: "Business details, GST & contact information",
      icon: "business-outline",
      color: "#FF7A00",
      bg: "#FFF0DF",
      route: "EditSellerProfile",
    },
    {
      id: "subscription",
      title: "Subscription",
      subtitle: "Manage your subscription plan",
      icon: "card-outline",
      color: "#EA580C",
      bg: "#FFF0EA",
      route: "SellerSubscription",
    },
    {
      id: "verification",
      title: "Verification Documents",
      subtitle: "GST, PAN and business documents",
      icon: "shield-checkmark-outline",
      color: "#16A34A",
      bg: "#EAF8EF",
      route: "SellerVerification",
    },
    {
      id: "materials",
      title: "Materials & Pricing",
      subtitle: "Manage your products and prices",
      icon: "cube-outline",
      color: "#D4A017",
      bg: "#FFF7D6",
      route: "SellerProducts",
    },

    {
      id: "payments",
      title: "Bank & Payments",
      subtitle: "Manage payments and settlement details",
      icon: "card-outline",
      color: "#7C3AED",
      bg: "#F2ECFF",
      route: "SellerPayments",
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage alerts and preferences",
      icon: "notifications-outline",
      color: "#2563EB",
      bg: "#EAF2FF",
      route: "SellerNotifications",
    },
  ];

  const handleMenuPress = (item: any) => {
    navigation.navigate(item.route);
  };



  useFocusEffect(
    useCallback(() => {
      fetchSellerProfile();
      fetchSubscription();
    }, [fetchSellerProfile, fetchSubscription])
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "Auth",
                params: {
                  screen: "Login",
                },
              },
            ],
          });
        },
      },
    ]);
  };

  if (sellerLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />

        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-circle-outline" size={60} color="#D4A017" />

        <Text style={styles.loadingText}>
          {" "}
          {sellerError || "Seller profile not found"}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchSellerProfile}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <LinearGradient
        colors={["#FFF3D6", "#FFF8EE", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>NEEVSATHI</Text>
            <Text style={styles.headerTitle}>My Business</Text>
          </View>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate("SellerNotifications")}
          >
            <Ionicons name="notifications-outline" size={21} color="#0A0A0A" />

            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* BUSINESS HERO */}
          <LinearGradient
            colors={["#0A0A0A", "#181818", "#3A2A08"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHero}
          >
            <View style={styles.heroTop}>
              <View style={styles.businessAvatar}>
                <Ionicons name="business" size={31} color="#FFD76A" />
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate("SellerSubscription")}
              >
                {/* <Ionicons name="create-outline" size={15} color="#0A0A0A" /> */}

                <Text style={styles.editButtonText}>
                  {activeSubscription?.plan?.name ?? "No plan"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginHorizontal: 16, paddingBottom: 20 }}>
              <Text style={styles.businessName}>{seller.businessName}</Text>

              <View style={styles.ownerRow}>
                <Text style={styles.ownerName}>{seller.ownerName}</Text>

                <View style={styles.dotSeparator} />

                <Text style={styles.businessType}>{seller.businessType}</Text>
              </View>

              {seller.verified && (
                <View style={styles.verifiedBadge}>
                  <View style={styles.verifiedIcon}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>

                  <Text style={styles.verifiedText}>Verified Business</Text>
                </View>
              )}
            </View>

            {/* <View style={styles.heroDivider} /> */}

            {/* <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{seller.rating}</Text>

                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#FFD76A" />

                  <Text style={styles.heroStatLabel}>Rating</Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{seller.responseRate}</Text>

                <Text style={styles.heroStatLabel}>Response Rate</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{seller.experience}</Text>

                <Text style={styles.heroStatLabel}>Experience</Text>
              </View>
            </View> */}
          </LinearGradient>

          {/* BUSINESS INFO */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Business Information</Text>

              <Text style={styles.sectionSubtitle}>Your business details</Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("EditSellerProfile")}
            >
              <Text style={styles.manageText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: "#FFF0DF" }]}>
                <Ionicons name="call-outline" size={18} color="#FF7A00" />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>

                <Text style={styles.infoValue}>{seller.phone}</Text>
              </View>

              <View style={styles.smallVerified}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: "#EAF2FF" }]}>
                <Ionicons name="mail-outline" size={18} color="#2563EB" />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>

                <Text style={styles.infoValue}>{seller.email}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: "#FFF7D6" }]}>
                <Ionicons name="location-outline" size={18} color="#D4A017" />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Business Location</Text>

                <Text style={styles.infoValue}>Noida</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />
            {seller.gstNumber && (
              <>
                <View style={styles.infoRow}>
                  <View
                    style={[styles.infoIcon, { backgroundColor: "#EAF8EF" }]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color="#16A34A"
                    />
                  </View>

                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>GSTIN</Text>

                    <Text style={styles.infoValue}>{seller.gstNumber}</Text>
                  </View>

                  <View style={styles.gstVerified}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#16A34A"
                    />

                    <Text style={styles.gstVerifiedText}>Verified</Text>
                  </View>
                </View>
              </>
            )}
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: "#EAF8EF" }]}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#16A34A"
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>PAN Number</Text>

                <Text style={styles.infoValue}>{seller.panNumber}</Text>
              </View>

              <View style={styles.gstVerified}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />

                <Text style={styles.gstVerifiedText}>Verified</Text>
              </View>
            </View>
          </View>

          {/* BUSINESS MENU */}
          <View style={styles.sectionHeaderMenu}>
            <Text style={styles.sectionTitle}>Manage Business</Text>
          </View>

          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item)}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>

                  <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>

                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#B7ADA2" />
                </TouchableOpacity>

                {index !== menuItems.length - 1 && (
                  <View style={styles.menuDivider} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* PERFORMANCE CARD */}
          <Text style={styles.performanceTitle}>Seller Performance</Text>

          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <View style={styles.performanceLeft}>
                <View
                  style={[
                    styles.performanceIcon,
                    { backgroundColor: "#FFF7D6" },
                  ]}
                >
                  <Ionicons name="star" size={17} color="#D4A017" />
                </View>

                <View>
                  <Text style={styles.performanceLabel}>Seller Rating</Text>

                  <Text style={styles.performanceSub}>
                    Based on {seller.reviews} reviews
                  </Text>
                </View>
              </View>

              <Text style={styles.performanceValue}>{seller.rating} ★</Text>
            </View>

            <View style={styles.performanceDivider} />

            <View style={styles.performanceRow}>
              <View style={styles.performanceLeft}>
                <View
                  style={[
                    styles.performanceIcon,
                    { backgroundColor: "#EAF8EF" },
                  ]}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={17}
                    color="#16A34A"
                  />
                </View>

                <View>
                  <Text style={styles.performanceLabel}>Response Rate</Text>

                  <Text style={styles.performanceSub}>
                    Keep responding quickly
                  </Text>
                </View>
              </View>

              <Text style={styles.performanceValue}>{seller.responseRate}</Text>
            </View>

            <View style={styles.performanceDivider} />

            <View style={styles.performanceRow}>
              <View style={styles.performanceLeft}>
                <View
                  style={[
                    styles.performanceIcon,
                    { backgroundColor: "#FFF0DF" },
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={17}
                    color="#FF7A00"
                  />
                </View>

                <View>
                  <Text style={styles.performanceLabel}>Business Status</Text>

                  <Text style={styles.performanceSub}>
                    Your account is active
                  </Text>
                </View>
              </View>

              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          </View>

          {/* SUPPORT */}
          <View style={styles.supportCard}>
            <View style={styles.supportIcon}>
              <Ionicons name="headset-outline" size={21} color="#FF7A00" />
            </View>

            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Need help?</Text>

              <Text style={styles.supportText}>
                Contact BuildSathi Seller Support
              </Text>
            </View>

            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => navigation.navigate("SellerSupport")}
            >
              <Ionicons name="arrow-forward" size={17} color="#FF7A00" />
            </TouchableOpacity>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={19} color="#DC2626" />

            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.version}>BuildSathi Seller • Version 1.0.0</Text>

          <View style={{ height: 115 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default SellerProfileScreen;

const styles = StyleSheet.create({
  root: {
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
    paddingTop: 58,
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2.2,
    color: "#FF7A00",
  },

  headerTitle: {
    marginTop: 3,
    fontSize: 23,
    fontWeight: "900",
    color: "#0A0A0A",
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

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#FF7A00",
  },

  profileHero: {
    marginTop: 8,
    borderRadius: 26,
    // padding: 19,
    borderWidth: 1,
    borderColor: "#3C310F",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 7,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF8EE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#8C8175",
    fontWeight: "600",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: "#FF7A00",
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
  },

  businessAvatar: {
    width: 66,
    height: 66,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,215,106,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,215,106,0.3)",
  },

  editButton: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: "#FFD76A",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  editButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  businessName: {
    marginTop: 17,
    fontSize: 21,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  ownerRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  ownerName: {
    fontSize: 11,
    color: "#D7D0C5",
    fontWeight: "600",
  },

  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#8C8175",
    marginHorizontal: 7,
  },

  businessType: {
    fontSize: 11,
    color: "#FFD76A",
    fontWeight: "700",
  },

  verifiedBadge: {
    alignSelf: "flex-start",
    marginTop: 11,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(22,163,74,0.14)",
    borderWidth: 1,
    borderColor: "rgba(22,163,74,0.25)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  verifiedIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
  },

  verifiedText: {
    fontSize: 9,
    color: "#8BE0A8",
    fontWeight: "800",
  },

  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 18,
  },

  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
  },

  heroStat: {
    flex: 1,
    alignItems: "center",
  },

  heroStatValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroStatLabel: {
    marginTop: 4,
    fontSize: 9,
    color: "#BFB6A9",
    fontWeight: "600",
  },

  ratingRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.13)",
  },

  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 14,
    color: "#9A8F83",
  },

  manageText: {
    fontSize: 11,
    color: "#FF7A00",
    fontWeight: "800",
  },

  infoCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 21,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  infoRow: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoLabel: {
    fontSize: 12,
    color: "#9A8F83",
    fontWeight: "600",
  },

  infoValue: {
    marginTop: 4,
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "600",
  },

  smallVerified: {
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
  },

  gstVerified: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  gstVerifiedText: {
    fontSize: 9,
    color: "#16A34A",
    fontWeight: "800",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#F3E9DD",
  },

  sectionHeaderMenu: {
    marginTop: 23,
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 21,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  menuItem: {
    minHeight: 73,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  menuContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A0A0A",
  },

  menuSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#9A8F83",
    lineHeight: 14,
  },

  menuDivider: {
    height: 1,
    backgroundColor: "#F3E9DD",
    marginLeft: 54,
  },

  performanceTitle: {
    marginTop: 23,
    marginBottom: 10,
    fontSize: 17,
    fontWeight: "800",
    color: "#0A0A0A",
  },

  performanceCard: {
    backgroundColor: "#FFFCF7",
    borderRadius: 21,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  performanceRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  performanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  performanceIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  performanceLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: "#0A0A0A",
    fontWeight: "800",
  },

  performanceSub: {
    marginLeft: 10,
    marginTop: 3,
    fontSize: 12,
    color: "#9A8F83",
  },

  performanceValue: {
    fontSize: 13,
    color: "#D4A017",
    fontWeight: "900",
  },

  performanceDivider: {
    height: 1,
    backgroundColor: "#F3E9DD",
  },

  activeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EAF8EF",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },

  activeText: {
    fontSize: 9,
    color: "#16A34A",
    fontWeight: "800",
  },

  supportCard: {
    marginTop: 17,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#FFF8E8",
    borderWidth: 1,
    borderColor: "#F2DFA7",
    flexDirection: "row",
    alignItems: "center",
  },

  supportIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFDF5",
    alignItems: "center",
    justifyContent: "center",
  },

  supportContent: {
    flex: 1,
    marginLeft: 11,
  },

  supportTitle: {
    fontSize: 12,
    color: "#0A0A0A",
    fontWeight: "900",
  },

  supportText: {
    marginTop: 3,
    fontSize: 9,
    color: "#806F49",
  },

  supportButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButton: {
    marginTop: 18,
    height: 51,
    borderRadius: 16,
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#F6D6D6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  logoutText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "800",
  },

  version: {
    textAlign: "center",
    marginTop: 13,
    fontSize: 9,
    color: "#B0A69B",
  },
});
