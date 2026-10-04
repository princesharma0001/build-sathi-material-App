import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../../navigation/types";
import { clearAuthSession2, getToken, getUser } from "../auth.store";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

const SplashScreen = ({ navigation }: Props) => {
  // Logo animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-15)).current;

  // Text animations
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslate = useRef(new Animated.Value(25)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslate = useRef(new Animated.Value(15)).current;

  // Bottom animation
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  // Glow animation
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 70,
          friction: 6,
          useNativeDriver: true,
        }),

        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),

      // App name
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),

        Animated.spring(nameTranslate, {
          toValue: 0,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // Tagline
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),

        Animated.timing(taglineTranslate, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      // Bottom text
      Animated.timing(bottomOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 1.08,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 0.8,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(glowOpacity, {
            toValue: 0.18,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    glowAnimation.start();

    // --------------------------------
    // CHECK AUTH AFTER SPLASH
    // --------------------------------

    const checkAuthentication = async () => {
      try {
        const token = await getToken();
        const user = await getUser();

        console.log("🔐 Splash Token:", token);
        console.log("👤 Splash User:", user);
        console.log("🎭 Splash Role:", user?.role);

        // --------------------------------
        // NO TOKEN
        // --------------------------------

        if (!token) {
          console.log("❌ No token → Login");

          navigation.replace("Login");

          return;
        }

        // --------------------------------
        // TOKEN EXISTS BUT USER MISSING
        // --------------------------------

        if (!user || !user.role) {
          console.log("❌ Token exists but user/role missing → Login");

          await clearAuthSession2();

          navigation.replace("Login");

          return;
        }

        // --------------------------------
        // USER STATUS CHECK
        // --------------------------------

        if (user.status !== "ACTIVE") {
          console.log(`⚠️ User status ${user.status} → Login`);

          await clearAuthSession2();

          navigation.replace("Login");

          return;
        }

        // --------------------------------
        // ROLE BASED NAVIGATION
        // --------------------------------

        switch (user.role) {
          case "BUYER":
            console.log("🛒 BUYER → BuyerHome");
            navigation.replace("Buyer");
            break;

          case "SELLER":
            console.log("🏪 SELLER → SellerHome");

            navigation.replace("Seller");
            break;

          default:
            console.log("❌ Unknown role → Login");

            await clearAuthSession2();

            navigation.replace("Login");
        }
      } catch (error) {
        console.log("❌ Splash authentication error:", error);

        await clearAuthSession2();

        navigation.replace("Login");
      }
    };

    // Wait for splash animation
    const timer = setTimeout(() => {
      checkAuthentication();
    }, 3000);

    return () => {
      clearTimeout(timer);
      glowAnimation.stop();
    };
  }, [navigation]);

  const rotate = logoRotate.interpolate({
    inputRange: [-15, 0],
    outputRange: ["-15deg", "0deg"],
  });

  return (
    <LinearGradient
      colors={["#FFFDF9", "#FFF8EE", "#FFE8C7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Decorative circles */}
          <View style={styles.topCircle} />
          <View style={styles.bottomCircle} />

          {/* Main Content */}
          <View style={styles.content}>
            {/* Logo + Glow */}
            <View style={styles.logoArea}>
              <Animated.View
                style={[
                  styles.logoGlow,
                  {
                    opacity: glowOpacity,
                    transform: [{ scale: glowScale }],
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }, { rotate }],
                  },
                ]}
              >
                <LinearGradient
                  colors={["#FF7A00", "#FF9F1C", "#FFC43D"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradient}
                >
                  <Text style={styles.logoText}>N</Text>

                  <View style={styles.logoSmallDot} />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* App Name */}
            <Animated.Text
              style={[
                styles.appName,
                {
                  opacity: nameOpacity,
                  transform: [{ translateY: nameTranslate }],
                },
              ]}
            >
              Neev<Text style={styles.appNameAccent}>Sathi</Text>
            </Animated.Text>

            {/* Tagline */}
            <Animated.View
              style={{
                opacity: taglineOpacity,
                transform: [{ translateY: taglineTranslate }],
              }}
            >
              <Text style={styles.tagline}>
                Your Construction Material Sathi
              </Text>

              <View style={styles.taglineLine}>
                <View style={styles.line} />

                <Ionicons name="construct-outline" size={14} color="#D4A017" />

                <View style={styles.line} />
              </View>
            </Animated.View>
          </View>

          {/* Bottom */}
          <Animated.View
            style={[
              styles.bottomContainer,
              {
                opacity: bottomOpacity,
              },
            ]}
          >
            <Text style={styles.bottomText}>Build Smarter. Buy Better.</Text>

            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={13} color="#D4A017" />

              <Text style={styles.verifiedText}>
                Trusted Construction Marketplace
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    overflow: "hidden",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
  },

  /* Decorative Background */

  topCircle: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,159,28,0.08)",
    top: -130,
    right: -80,
  },

  bottomCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,122,0,0.06)",
    bottom: -120,
    left: -90,
  },

  /* Logo */

  logoArea: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  logoGlow: {
    position: "absolute",
    width: 125,
    height: 125,
    borderRadius: 38,
    backgroundColor: "#FF9F1C",

    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 35,
    elevation: 15,
  },

  logoContainer: {
    width: 105,
    height: 105,
    borderRadius: 30,

    shadowColor: "#FF7A00",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },

  logoGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
  },

  logoText: {
    fontSize: 62,
    lineHeight: 70,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: -3,
  },

  logoSmallDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    right: 22,
    bottom: 22,
  },

  /* App Name */

  appName: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.2,
    color: "#172554",
  },

  appNameAccent: {
    color: "#FF7A00",
  },

  /* Tagline */

  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: "#8C8175",
    fontWeight: "600",
    textAlign: "center",
  },

  taglineLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 9,
  },

  line: {
    width: 35,
    height: 1,
    backgroundColor: "#E6C98D",
  },

  /* Bottom */

  bottomContainer: {
    alignItems: "center",
    paddingBottom: 30,
  },

  bottomText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6F6256",
    letterSpacing: 0.4,
  },

  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  verifiedText: {
    marginLeft: 5,
    fontSize: 10,
    color: "#A29486",
    fontWeight: "600",
  },
});
