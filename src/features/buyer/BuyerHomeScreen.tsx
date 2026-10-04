import React, { useCallback, useEffect, useState } from "react";
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
import Ionicons from "react-native-vector-icons/Ionicons";
import { getMaterialsApi, Material } from "./material.api";
import { getGreeting } from "../../utils/greeting";
const BuyerHomeScreen = ({ navigation }: any) => {
  const quickActions = [
    {
      id: "requirements",
      title: "Requirements",
      subtitle: "Track your requests",
      icon: "document-text-outline",
      route: "MyRequirements",

      colors: ["#FF7A00", "#FF9F1C", "#FFC43D"],

      iconColor: "#FFFFFF",
      titleColor: "#FFFFFF",
      subtitleColor: "#FFF4E6",
      arrowColor: "#FF7A00",

      iconBackground: "rgba(255,255,255,0.18)",
      arrowBackground: "#FFFFFF",
    },

    {
      id: "quotes",
      title: "Quotes",
      subtitle: "Compare prices",
      icon: "pricetag-outline",
      route: "Quotes",

      colors: ["#FFF8E8", "#FFE8B5", "#FFD76A"],

      iconColor: "#D4A017",
      titleColor: "#0A0A0A",
      subtitleColor: "#8C8175",
      arrowColor: "#D4A017",

      iconBackground: "#FFFDF9",
      arrowBackground: "#FFFDF9",
    },

    {
      id: "orders",
      title: "Orders",
      subtitle: "Track your orders",
      icon: "cube-outline",
      route: "Orders",

      colors: ["#FF7A00", "#FF8F1F", "#FFB347"],

      iconColor: "#FFFFFF",
      titleColor: "#FFFFFF",
      subtitleColor: "#FFF4E6",
      arrowColor: "#FF7A00",

      iconBackground: "rgba(255,255,255,0.18)",
      arrowBackground: "#FFFFFF",
    },

    {
      id: "profile",
      title: "My Profile",
      subtitle: "Manage your account",
      icon: "person-outline",
      route: "Profile",

      colors: ["#0A0A0A", "#1C1C1C", "#3A2A08"],

      iconColor: "#FFD76A",
      titleColor: "#FFFFFF",
      subtitleColor: "#D7D0C5",
      arrowColor: "#0A0A0A",

      iconBackground: "rgba(255,215,106,0.12)",
      arrowBackground: "#FFD76A",
    },
  ];

  // const popularMaterials = [
  //   {
  //     id: 'cement',
  //     name: 'Cement',
  //     icon: '🧱',
  //     hint: 'Bags',
  //     colors: ['#FFF8ED', '#FFE7C2'],
  //     iconBackground: '#FFF0D8',
  //     arrowColor: '#FF7A00',
  //   },
  //   {
  //     id: 'sand',
  //     name: 'Sand',
  //     icon: '🏖️',
  //     hint: 'Ton / CFT',
  //     colors: ['#FFFDF4', '#F6E8B8'],
  //     iconBackground: '#FFF7D6',
  //     arrowColor: '#D4A017',
  //   },
  //   {
  //     id: 'aggregate',
  //     name: 'Aggregate',
  //     icon: '🪨',
  //     hint: 'Ton / CFT',
  //     colors: ['#F7F7F7', '#E5E5E5'],
  //     iconBackground: '#EEEEEE',
  //     arrowColor: '#555555',
  //   },
  //   {
  //     id: 'bricks',
  //     name: 'Bricks',
  //     icon: '🧱',
  //     hint: 'Pieces',
  //     colors: ['#FFF1EA', '#FFD8C5'],
  //     iconBackground: '#FFE1D2',
  //     arrowColor: '#EA580C',
  //   },
  // ];

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [refreshingMaterials, setRefreshingMaterials] = useState(false);

  const loadMaterials = useCallback(async () => {
    try {
      setLoadingMaterials(true);

      const data = await getMaterialsApi();
      console.log("material list", data);

      setMaterials(data);
    } catch (error: any) {
      console.log(
        "❌ MATERIAL LIST ERROR:",
        error?.response?.data || error?.message
      );

      Alert.alert(
        "Unable to load materials",
        "Please check your internet connection and try again."
      );
    } finally {
      setLoadingMaterials(false);
    }
  }, []);

  const refreshMaterials = useCallback(async () => {
    try {
      setRefreshingMaterials(true);

      const data = await getMaterialsApi();

      setMaterials(data);
    } catch (error: any) {
      console.log(
        "❌ MATERIAL REFRESH ERROR:",
        error?.response?.data || error?.message
      );
    } finally {
      setRefreshingMaterials(false);
    }
  }, []);

  const getMaterialIcon = (name: string) => {
    const value = name.toLowerCase();

    if (value.includes("cement")) return "🪣";
    if (value.includes("steel") || value.includes("tmt")) return "🔩";
    if (value.includes("brick")) return "🧱";
    if (value.includes("sand")) return "🏖️";
    if (value.includes("aggregate")) return "🪨";

    return "📦";
  };

  const popularMaterials = materials.map((material) => ({
    id: material.id,
    name: material.name,
    hint: `Per ${material.unit}`,
    icon: getMaterialIcon(material.name),
    colors: ["#FFF3D6", "#FFE4B5"],
    iconBackground: "#FFFFFF",
    arrowColor: "#F97316",
  }));

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  return (
    <LinearGradient
      colors={["#FFF3D6", "#FFF8EE", "#FFF", "#FFF"]}
      locations={[0, 0.38, 0.72, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF3D6" />

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
            <Ionicons name="notifications-outline" size={21} color="#0A0A0A" />

            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </Pressable>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* ========================================= */}
          {/* HEADER */}
          {/* ========================================= */}

          {/* ========================================= */}
          {/* HERO */}
          {/* ========================================= */}

          <View style={styles.heroSection}>
            <Text style={styles.goodMorning}>{getGreeting()} 👋</Text>

            <Text style={styles.heroTitle}>
              What are you{"\n"}
              <Text style={styles.heroOrange}>building today?</Text>
            </Text>

            <Text style={styles.heroSubtitle}>
              Find trusted suppliers and get the best material quotes near you.
            </Text>
          </View>

          {/* ========================================= */}
          {/* CITY / LOCATION */}
          {/* ========================================= */}

          <Pressable style={styles.locationCard}>
            <View style={styles.locationIconContainer}>
              <Text style={styles.locationIcon}>📍</Text>
            </View>

            <View style={styles.locationContent}>
              <Text style={styles.locationLabel}>DELIVERING TO</Text>

              <Text style={styles.locationText}>Noida, Uttar Pradesh</Text>
            </View>

            <Text style={styles.locationArrow}>›</Text>
          </Pressable>

          {/* ========================================= */}
          {/* MAIN REQUIREMENT CARD */}
          {/* ========================================= */}

          <Pressable
            style={styles.requirementWrapper}
            onPress={() => navigation.navigate("CreateRequirement")}
          >
            <LinearGradient
              colors={["#FF7A00", "#FF9F1C", "#FFC43D"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.requirementCard}
            >
              {/* Decorative circles */}

              <View style={styles.circleOne} />
              <View style={styles.circleTwo} />

              <View style={styles.requirementContent}>
                <View style={styles.brickContainer}>
                  <Text style={styles.brickEmoji}>🧱</Text>
                </View>

                <Text style={styles.requirementSmall}>
                  Need construction material?
                </Text>

                <Text style={styles.requirementTitle}>
                  Post Material Requirement
                </Text>

                <Text style={styles.requirementSubtitle}>
                  Get quotes from multiple suppliers
                </Text>

                <View style={styles.postButton}>
                  <Text style={styles.postButtonText}>Post Requirement</Text>

                  <Text style={styles.postButtonArrow}>→</Text>
                </View>
              </View>

              {/* Construction decoration */}

              <View style={styles.buildingDecoration}>
                <Text style={styles.crane}>🏗️</Text>
              </View>
            </LinearGradient>
          </Pressable>

          {/* ========================================= */}
          {/* POPULAR MATERIALS */}
          {/* ========================================= */}

          <View style={styles.materialSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitleNoMargin}>
                  Popular Materials
                </Text>

                <Text style={styles.materialSubtitle}>
                  Start a requirement quickly
                </Text>
              </View>

              <Pressable
                onPress={() => navigation.navigate("CreateRequirement")}
              >
                <Text style={styles.viewAll}>View all →</Text>
              </Pressable>
            </View>

            <View style={styles.materialGrid}>
              {popularMaterials.map((material) => (
                <Pressable
                  key={material.id}
                  style={styles.materialCard}
                  onPress={() =>
                    navigation.navigate("CreateRequirement", {
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
                      <Text style={styles.materialEmoji}>{material.icon}</Text>
                    </View>

                    <Text style={styles.materialName}>{material.name}</Text>

                    <Text style={styles.materialHint}>{material.hint}</Text>

                    <View
                      style={[
                        styles.materialArrow,
                        {
                          backgroundColor: "#FFFFFF",
                        },
                      ]}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={material.arrowColor}
                      />
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ========================================= */}
          {/* QUICK ACTIONS */}
          {/* ========================================= */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleNoMargin}>Quick Actions</Text>

            <Pressable>
              <Text style={styles.viewAll}>View all →</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionScroll}
          >
            {quickActions.map((action) => (
              <Pressable
                key={action.id}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.route)}
              >
                <LinearGradient
                  colors={action.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionCardGradient}
                >
                  {/* Icon */}
                  <View style={styles.actionIcon}>
                    <Ionicons
                      name={action.icon}
                      size={30}
                      color={action.iconColor}
                    />
                  </View>

                  {/* Text */}
                  <View style={styles.actionTextContainer}>
                    <Text
                      style={[
                        styles.actionTitle,
                        {
                          color: action.titleColor,
                        },
                      ]}
                    >
                      {action.title}
                    </Text>

                    <Text
                      style={[
                        styles.actionSubtitle,
                        {
                          color: action.subtitleColor,
                        },
                      ]}
                    >
                      {action.subtitle}
                    </Text>
                  </View>

                  {/* Arrow */}
                  <View style={styles.actionArrow}>
                    <Ionicons
                      name="chevron-forward"
                      size={17}
                      color={action.iconColor}
                    />
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>

          {/* ========================================= */}
          {/* HOW BUILDSATHI WORKS */}
          {/* ========================================= */}

          <View style={styles.howCard}>
            <View style={styles.howHeader}>
              <View>
                <Text style={styles.howTitle}>How BuildSathi works</Text>
                <Text style={styles.howSubtitle}>
                  Buy construction materials smarter
                </Text>
              </View>

              <View style={styles.rocketContainer}>
                <Text style={styles.rocket}>🚀</Text>
              </View>
            </View>

            {/* STEPS */}

            <View style={styles.stepsRow}>
              {/* STEP 1 */}

              <View style={styles.step}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={styles.stepIcon}>📋</Text>
                <Text style={styles.stepText}>Post{"\n"}requirement</Text>
              </View>

              <View style={styles.stepArrow}>→</View>
              {/* STEP 2 */}
              <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepBlue]}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>

                <Text style={styles.stepIcon}>👥</Text>

                <Text style={styles.stepText}>Get supplier{"\n"}quotes</Text>
              </View>

              <View style={styles.stepArrow}>→</View>

              {/* STEP 3 */}

              <View style={styles.step}>
                <View style={[styles.stepCircle, styles.stepGreen]}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>

                <Text style={styles.stepIcon}>✓</Text>

                <Text style={styles.stepText}>Compare{"\n"}& choose</Text>
              </View>
            </View>
          </View>

          {/* ========================================= */}
          {/* VERIFIED SUPPLIERS */}
          {/* ========================================= */}

          <Pressable style={styles.verifiedCard}>
            <View style={styles.verifiedIcon}>
              <Text style={styles.verifiedCheck}>✓</Text>
            </View>

            <View style={styles.verifiedContent}>
              <Text style={styles.verifiedTitle}>Verified suppliers</Text>

              <Text style={styles.verifiedText}>
                Connect with trusted construction material suppliers near you.
              </Text>
            </View>

            <Text style={styles.verifiedArrow}>›</Text>
          </Pressable>

          {/* Bottom spacing */}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BuyerHomeScreen;

const styles = StyleSheet.create({
  /* ========================================= */
  /* MAIN */
  /* ========================================= */

  background: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 80,
  },

  /* ========================================= */
  /* HEADER */
  /* ========================================= */

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

  /* ========================================= */
  /* HERO */
  /* ========================================= */

  heroSection: {
    paddingTop: 15,
    paddingBottom: 22,
  },

  goodMorning: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },

  heroTitle: {
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "900",
    color: "#172554",
    marginTop: 7,
    letterSpacing: -0.5,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginRight: 5,
  },
  profile: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    borderRadius: 50,
  },

  heroOrange: {
    color: "#F97316",
  },

  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    marginTop: 9,
    maxWidth: 320,
  },

  actionScroll: {
    paddingRight: 16,
    paddingBottom: 8,
    gap: 12,
  },

  actionCard: {
    width: 235,
    // height: 92,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0D8B8",

    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  actionCardGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 70,
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 11,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  actionSubtitle: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 14,
    color: "#8C8175",
    fontWeight: "600",
  },

  actionArrow: {
    width: 28,
    height: 28,
    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    // backgroundColor: 'rgba(255,255,255,0.7)',
    marginRight: 10,
  },

  /* ========================================= */
  /* LOCATION */
  /* ========================================= */

  locationCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#1E3A8A",
    shadowOpacity: 0.1,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  locationIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#FFF0E3",
    alignItems: "center",
    justifyContent: "center",
  },

  locationIcon: {
    fontSize: 20,
  },

  locationContent: {
    flex: 1,
    marginLeft: 11,
  },

  locationLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },

  locationText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#172554",
    marginTop: 3,
  },

  locationArrow: {
    fontSize: 29,
    color: "#64748B",
    marginRight: 3,
  },

  /* ========================================= */
  /* SECTION */
  /* ========================================= */

  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#172554",
    marginTop: 25,
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitleNoMargin: {
    fontSize: 17,
    fontWeight: "900",
    color: "#172554",
    marginTop: 26,
    marginBottom: 12,
  },

  viewAll: {
    fontSize: 11,
    fontWeight: "800",
    color: "#F97316",
    marginTop: 15,
  },

  /* ========================================= */
  /* REQUIREMENT CARD */
  /* ========================================= */

  requirementWrapper: {
    borderRadius: 18,
    paddingTop: 18,
    shadowColor: "#F97316",
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 6,
  },

  requirementCard: {
    minHeight: 220,
    borderRadius: 18,
    // padding: 18,
    overflow: "hidden",
    position: "relative",
  },

  circleOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.10)",
    right: -55,
    bottom: -70,
  },

  circleTwo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    right: 40,
    top: -55,
  },

  requirementContent: {
    zIndex: 2,
    padding: 15,
  },

  brickContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  brickEmoji: {
    fontSize: 27,
  },

  requirementSmall: {
    color: "#FFF7ED",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 13,
  },

  requirementTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "900",
    marginTop: 3,
  },

  requirementSubtitle: {
    color: "#FFF7ED",
    fontSize: 12,
    marginTop: 5,
  },

  postButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
  },

  postButtonText: {
    color: "#EA580C",
    fontSize: 12,
    fontWeight: "600",
  },

  postButtonArrow: {
    color: "#EA580C",
    fontSize: 17,
    fontWeight: "900",
    marginLeft: 7,
  },

  buildingDecoration: {
    position: "absolute",
    right: 15,
    bottom: 12,
    opacity: 0.75,
  },

  crane: {
    fontSize: 70,
  },

  /* ========================================= */
  /* QUICK ACTIONS */
  /* ========================================= */

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  blueCard: {
    backgroundColor: "rgba(239,246,255,0.90)",
    borderColor: "#BFDBFE",
  },

  greenCard: {
    backgroundColor: "rgba(240,253,244,0.90)",
    borderColor: "#BBF7D0",
  },

  purpleCard: {
    backgroundColor: "rgba(250,245,255,0.90)",
    borderColor: "#E9D5FF",
  },

  cyanCard: {
    backgroundColor: "rgba(236,254,255,0.90)",
    borderColor: "#A5F3FC",
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  blueIcon: {
    backgroundColor: "#DBEAFE",
  },

  greenIcon: {
    backgroundColor: "#DCFCE7",
  },

  purpleIcon: {
    backgroundColor: "#F3E8FF",
  },

  cyanIcon: {
    backgroundColor: "#CFFAFE",
  },

  actionEmoji: {
    fontSize: 20,
    fontWeight: "900",
  },

  /* ========================================= */
  /* HOW IT WORKS */
  /* ========================================= */

  howCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    padding: 17,
    marginTop: 15,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",

    shadowColor: "#1E3A8A",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  howHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  howTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#172554",
  },

  howSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },

  rocketContainer: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFF1E8",
    alignItems: "center",
    justifyContent: "center",
  },

  rocket: {
    fontSize: 23,
  },

  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  step: {
    flex: 1,
    alignItems: "center",
  },

  stepCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    borderWidth: 2,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },

  stepBlue: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },

  stepGreen: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  stepNumber: {
    fontSize: 11,
    fontWeight: "900",
    color: "#EA580C",
  },

  stepIcon: {
    fontSize: 16,
    marginTop: 7,
  },

  stepText: {
    textAlign: "center",
    fontSize: 9,
    lineHeight: 13,
    color: "#334155",
    fontWeight: "700",
    marginTop: 4,
  },

  stepArrow: {
    fontSize: 17,
    color: "#CBD5E1",
    marginHorizontal: 2,
    marginTop: -20,
  },

  /* ========================================= */
  /* VERIFIED SUPPLIERS */
  /* ========================================= */

  verifiedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(236,253,245,0.94)",
    borderRadius: 17,
    padding: 14,
    marginTop: 14,

    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  verifiedIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedCheck: {
    fontSize: 20,
    color: "#059669",
    fontWeight: "900",
  },

  verifiedContent: {
    flex: 1,
    marginLeft: 10,
  },

  verifiedTitle: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "900",
  },

  verifiedText: {
    color: "#64748B",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  verifiedArrow: {
    fontSize: 25,
    color: "#059669",
    marginLeft: 5,
  },

  bottomSpace: {
    height: 15,
  },
  materialSection: {
    // marginTop: 22,
  },

  materialSubtitle: {
    fontSize: 10,
    color: "#8C8175",
    fontWeight: "600",
    marginTop: -7,
    marginBottom: 12,
  },

  materialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  materialCard: {
    width: "48.5%",
    height: 125,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0D8B8",
    shadowColor: "#8C5A2B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  materialGradient: {
    flex: 1,
    // padding: 12,
    position: "relative",
  },

  materialIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 14,
    marginTop: 14,
  },

  materialEmoji: {
    fontSize: 23,
  },

  materialName: {
    marginTop: 9,
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 14,
    color: "#0A0A0A",
  },

  materialHint: {
    marginTop: 2,
    marginLeft: 14,
    fontSize: 9,
    fontWeight: "600",

    color: "#8C8175",
  },

  materialArrow: {
    position: "absolute",

    right: 10,
    bottom: 10,

    width: 27,
    height: 27,
    borderRadius: 9,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
