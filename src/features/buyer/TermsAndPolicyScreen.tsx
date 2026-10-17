
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../config/api";

type ContentType = "TERMS" | "PRIVACY" | "ABOUT";

type ContentPage = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  version?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type PolicyItem = {
  id: ContentType;
  title: string;
  subtitle: string;
  icon: string;
  slug: string;
  route: string;
};

type Props = {
  navigation: any;
};

// Replace with your actual backend URL.
// Example: http://192.168.1.5:5000/api/v1
// For production, use your deployed HTTPS API URL.

const POLICY_CONFIG: PolicyItem[] = [
  {
    id: "TERMS",
    title: "Terms & Conditions",
    subtitle: "Rules for using NeevSathi",
    icon: "document-text-outline",
    slug: "terms-and-conditions",
    route: "TermsConditions",
  },
  {
    id: "PRIVACY",
    title: "Privacy Policy",
    subtitle: "How we collect and protect your data",
    icon: "shield-checkmark-outline",
    slug: "privacy-policy",
    route: "PrivacyPolicy",
  },
  {
    id: "ABOUT",
    title: "About NeevSathi",
    subtitle: "Learn more about our platform",
    icon: "information-circle-outline",
    slug: "about-neevsathi",
    route: "AboutNeevSathi",
  },
];

const TermsAndPolicyScreen: React.FC<Props> = ({ navigation }) => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Fetch all published policies
  const fetchPolicies = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_BASE_URL}/content`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to fetch policies.",
        );
      }

      const content: ContentPage[] = result?.data ?? [];

      if (!Array.isArray(content)) {
        throw new Error("Invalid content response from server.");
      }

      setPages(
        content.filter(
          (page) =>
            page.isPublished === true &&
            ["TERMS", "PRIVACY", "ABOUT"].includes(page.type),
        ),
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchPolicies();
  }, [fetchPolicies]);

  // Fetch the selected policy and open its detail screen
  const openPolicy = async (item: PolicyItem) => {
    if (openingSlug) return;

    const existingPage = pages.find(
      (page) =>
        page.type === item.id || page.slug === item.slug,
    );

    const slug = existingPage?.slug || item.slug;

    try {
      setOpeningSlug(item.slug);

      const response = await fetch(
        `${API_BASE_URL}/content/${encodeURIComponent(slug)}`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to load this policy.",
        );
      }

      const page: ContentPage | undefined = result?.data;

      if (!page || !page.content) {
        throw new Error("No published content is available.");
      }

      navigation.navigate(item.route, {
        contentPage: page,
      });
    } catch (err: unknown) {
      Alert.alert(
        "Unable to load policy",
        err instanceof Error
          ? err.message
          : "Please try again.",
      );
    } finally {
      setOpeningSlug(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#F97316"
        barStyle="dark-content"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Terms & Policies</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void fetchPolicies(true)}
            colors={["#F97316"]}
            tintColor="#F97316"
          />
        }
      >
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons
              name="shield-checkmark"
              size={32}
              color="#F97316"
            />
          </View>

          <Text style={styles.bannerTitle}>
            Your trust matters to us
          </Text>

          <Text style={styles.bannerSubtitle}>
            Please review our policies to understand how NeevSathi
            works and how we protect your information.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          LEGAL & INFORMATION
        </Text>

        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.stateText}>
              Loading policies...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Ionicons
              name="cloud-offline-outline"
              size={38}
              color="#9CA3AF"
            />

            <Text style={styles.stateTitle}>
              Unable to load policies
            </Text>

            <Text style={styles.stateText}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => void fetchPolicies()}
              activeOpacity={0.8}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {POLICY_CONFIG.map((item) => {
              const isOpening = openingSlug === item.slug;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.policyCard,
                    !!openingSlug && styles.disabledCard,
                  ]}
                  activeOpacity={0.75}
                  disabled={!!openingSlug}
                  onPress={() => void openPolicy(item)}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={item.icon as any}
                      size={23}
                      color="#F97316"
                    />
                  </View>

                  <View style={styles.policyText}>
                    <Text style={styles.policyTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.policySubtitle}>
                      {item.subtitle}
                    </Text>
                  </View>

                  {isOpening ? (
                    <ActivityIndicator
                      size="small"
                      color="#F97316"
                    />
                  ) : (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9CA3AF"
                    />
                  )}
                </TouchableOpacity>
              );
            })}

            {pages.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={32}
                  color="#9CA3AF"
                />
                <Text style={styles.stateTitle}>
                  No published policies
                </Text>
                <Text style={styles.stateText}>
                  Published content will appear here.
                </Text>
              </View>
            )}
          </>
        )}

        <Text style={styles.footer}>
          NeevSathi © {new Date().getFullYear()}
        </Text>

        <Text style={styles.footerSubtitle}>
          Building trust, one connection at a time.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 14,
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#F0DEC4",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#000",
  },
  content: {
    padding: 18,
    paddingBottom: 32,
    flexGrow: 1,
  },
  banner: {
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 28,
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  bannerSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 12,
  },
  policyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  disabledCard: {
    opacity: 0.65,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  policyText: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  policySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
    lineHeight: 17,
  },
  stateContainer: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
    marginTop: 10,
  },
  stateText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#F97316",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  footerSubtitle: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
  },
});
