import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Modal,
} from "react-native";

import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getMySubscription,
  getSubscriptionPlans,
  purchaseSubscription,
  verifySubscriptionPayment,
} from "./subscriptionApi";
import WebView from "react-native-webview";
import { useSubscriptionStore } from "./subscription.store";

interface ActiveSubscription {
  id: string;
  plan: {
    id: string;
    code: string;
    name: string;
  };
  state: "ACTIVE" | "EXPIRED" | "EXHAUSTED" | "CANCELLED";
  source: "PURCHASE" | "ADMIN_GRANT";
  quotationsTotal: number;
  quotationsRemaining: number;
  hasTrustedBadge: boolean;
  startsAt: string;
  expiresAt: string | null;
}

interface MySubscriptionResponse {
  activeSubscriptions: ActiveSubscription[];
  paidQuotationsRemaining: number;
  totalQuotationsRemaining: number;
  canSendQuotation: boolean;
  isTrustedSeller: boolean;
}
interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  quotationLimit: number;
  validityDays: number | null;
  hasTrustedBadge: boolean;
  features: string[];
  sortOrder?: number;
  isActive?: boolean;
}

const SellerSubscriptionScreen = ({ navigation }: any) => {  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [purchasing, setPurchasing] = useState(false);
  const {
    subscription,
    loading: subscriptionLoading,
    fetchSubscription,
    isPlanActive,
  } = useSubscriptionStore();
  
  const activeSubscription =
    subscription?.activeSubscriptions?.find(
      sub => sub.state === "ACTIVE"
    ) ?? null;
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState("");
  const [paymentChecking, setPaymentChecking] = useState(false);
  const [mySubscription, setMySubscription] =
    useState<MySubscriptionResponse | null>(null);
  // const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // const activeSubscription = mySubscription?.activeSubscriptions?.find(
  //   (subscription) => subscription.state === "ACTIVE"
  // );

  const activePlanId = activeSubscription?.plan?.id;
  const activePlanCode = activeSubscription?.plan?.code;
  // const isPlanActive = (planId: string) => {
  //   return activePlanId === planId;
  // };
  const activePlan = plans.find((plan) => plan.code === selectedPlan);

  useEffect(() => {
    loadSubscriptionPlans();
    fetchSubscription();
  }, []);
  /**
   * GET SUBSCRIPTION PLANS
   */
  const loadSubscriptionPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getSubscriptionPlans();

      console.log(
        "SUBSCRIPTION PLANS API RESPONSE:",
        JSON.stringify(result, null, 2)
      );

      const apiPlans: SubscriptionPlan[] = Array.isArray(result?.data?.plans)
        ? result.data.plans
        : [];

      console.log("FINAL PLANS:", apiPlans);

      setPlans(apiPlans);

      if (apiPlans.length > 0) {
        setSelectedPlan(apiPlans[0].code);
      }
    } catch (err: any) {
      console.log("SUBSCRIPTION PLANS ERROR:", err?.message || err);

      setError(err?.message || "Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!activePlan) {
      Alert.alert("Select Plan", "Please select a subscription plan.");
      return;
    }

    if (activePlan.price <= 0) {
      Alert.alert("Free Plan", "This plan does not require payment.");
      return;
    }

    try {
      setPurchasing(true);

      console.log("PURCHASING PLAN:", activePlan.id);

      const result = await purchaseSubscription(activePlan.id);

      console.log("PURCHASE RESPONSE:", JSON.stringify(result, null, 2));

      const orderId = result?.data?.orderId;
      const devCheckoutUrl = result?.data?.devCheckoutUrl;

      if (!orderId) {
        throw new Error("Order ID was not returned by server.");
      }

      if (!devCheckoutUrl) {
        throw new Error("Payment checkout URL was not returned by server.");
      }

      console.log("ORDER ID:", orderId);
      console.log("DEV CHECKOUT URL:", devCheckoutUrl);

      setCurrentOrderId(orderId);
      setCheckoutUrl(devCheckoutUrl);
      setWebViewVisible(true);
    } catch (error: any) {
      console.error("PURCHASE ERROR:", error);

      Alert.alert(
        "Payment Error",
        error?.message || "Unable to start payment. Please try again."
      );
    } finally {
      setPurchasing(false);
    }
  };

  const verifyPayment = async (orderId: string) => {
    try {
      setPaymentChecking(true);

      console.log("VERIFYING PAYMENT:", orderId);

      const result = await verifySubscriptionPayment(orderId);

      console.log("VERIFY RESPONSE:", JSON.stringify(result, null, 2));

      const status = result?.data?.status;

      if (status === "PAID") {
        await fetchSubscription();
        setWebViewVisible(false);
        setCheckoutUrl("");
        setCurrentOrderId("");

        Alert.alert(
          "Payment Successful",
          `${
            activePlan?.name || "Subscription"
          } has been activated successfully.`,
          [
            {
              text: "OK",
              onPress: async () => {
                await loadSubscriptionPlans();
              },
            },
          ]
        );

        return;
      }

      if (status === "CREATED" || status === "PENDING") {
        Alert.alert(
          "Payment Pending",
          "Your payment is still being processed. Please try again in a moment."
        );

        return;
      }

      Alert.alert("Payment Failed", "The payment was not completed.");
    } catch (error: any) {
      console.error("VERIFY PAYMENT ERROR:", error);

      Alert.alert(
        "Verification Error",
        error?.message || "Unable to verify your payment."
      );
    } finally {
      setPaymentChecking(false);
    }
  };

  const handleWebViewNavigation = async (navState: any) => {
    const url = navState?.url || "";

    console.log("WEBVIEW URL:", url);

    if (!currentOrderId) {
      return;
    }

    /*
     * Your backend devPaymentResultPage should
     * redirect to this page after Cashfree payment.
     */
    if (url.includes("/api/v1/subscriptions/dev/payment-result")) {
      console.log("PAYMENT RESULT PAGE DETECTED");

      await verifyPayment(currentOrderId);
    }
  };
  /**
   * PLAN ICON
   */
  const getPlanIcon = (code: string) => {
    switch (code.toUpperCase()) {
      case "FREE":
        return "leaf-outline";

      case "PLUS":
      case "BASIC":
        return "flash";

      case "PRO":
      case "PREMIUM":
        return "diamond";

      default:
        return "card-outline";
    }
  };

  /**
   * CONTINUE
   */
  const handleContinue = () => {
    if (!activePlan) {
      Alert.alert("Plan unavailable", "Please select a subscription plan.");
      return;
    }

    Alert.alert(
      `Choose ${activePlan.name}`,
      activePlan.price === 0
        ? `Continue with the ${activePlan.name} plan?`
        : `Continue with ${activePlan.name} for ₹${activePlan.price}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            console.log("Selected Plan:", activePlan);

            /**
             * NEXT STEP:
             *
             * POST /subscriptions/purchase
             *
             * {
             *   planId: activePlan.id
             * }
             *
             * Example:
             *
             * await purchaseSubscription({
             *   planId: activePlan.id,
             * });
             */
          },
        },
      ]
    );
  };

  /**
   * ================= LOADING =================
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#F04424" />

        <View style={styles.header}>
          <Pressable
            onPress={() => {
              console.log("BACK PRESSED");
        
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Seller");
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.headerTitle}>Subscription</Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F04435" />

          <Text style={styles.loadingText}>Loading subscription plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * ================= ERROR =================
   */
  if (error || plans.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#F04424" />

        <View style={styles.header}>
          <Pressable
             onPress={() => {
              console.log("BACK PRESSED");
        
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("Seller");
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.headerTitle}>Subscription</Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.centerContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={40} color="#F04435" />
          </View>

          <Text style={styles.errorTitle}>Unable to load plans</Text>

          <Text style={styles.errorText}>
            {error || "No subscription plans available."}
          </Text>

          <Pressable onPress={loadSubscriptionPlans} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>TRY AGAIN</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Safety check
   */
  if (!activePlan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#F04424" />

        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Plan not found</Text>

          <Pressable
            onPress={() => {
              if (plans.length > 0) {
                setSelectedPlan(plans[0].code);
              }
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>SELECT PLAN</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#F04424" />

      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>Subscription</Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <View style={styles.darkContent}>
          {activeSubscription && (
            <View style={styles.activeSubscriptionCard}>
              <View style={styles.activeSubscriptionHeader}>
                <View>
                  <Text style={styles.activeSubscriptionLabel}>
                    CURRENT PLAN
                  </Text>

                  <Text style={styles.activeSubscriptionName}>
                    {activeSubscription.plan.name}
                  </Text>
                </View>

                <View style={styles.activeBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#15803D" />

                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              </View>

              <View style={styles.subscriptionStats}>
                <View style={styles.subscriptionStat}>
                  <Text style={styles.subscriptionStatValue}>
                    {activeSubscription.quotationsRemaining}
                  </Text>

                  <Text style={styles.subscriptionStatLabel}>
                    Quotes Remaining
                  </Text>
                </View>

                <View style={styles.subscriptionStat}>
                  <Text style={styles.subscriptionStatValue}>
                    {activeSubscription.quotationsTotal}
                  </Text>

                  <Text style={styles.subscriptionStatLabel}>Total Quotes</Text>
                </View>

                <View style={styles.subscriptionStat}>
                  <Text style={styles.subscriptionStatValue}>
                    {activeSubscription.expiresAt
                      ? new Date(
                          activeSubscription.expiresAt
                        ).toLocaleDateString()
                      : "No expiry"}
                  </Text>

                  <Text style={styles.subscriptionStatLabel}>Valid Until</Text>
                </View>
              </View>

              {activeSubscription.hasTrustedBadge && (
                <View style={styles.trustedRow}>
                  <Ionicons name="shield-checkmark" size={18} color="#15803D" />

                  <Text style={styles.trustedText}>
                    Trusted Seller badge is active
                  </Text>
                </View>
              )}
            </View>
          )}
          {/* ================= PLAN SELECTOR ================= */}

          <View style={styles.planSelector}>
            {plans.map((plan) => {
              const active = selectedPlan === plan.code;

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.code)}
                  style={[styles.planTab, active && styles.activePlanTab]}
                >
                  <View style={styles.planTabContent}>
                    <Ionicons
                      name={getPlanIcon(plan.code)}
                      size={15}
                      color={active ? "#FFFFFF" : "#8E8E93"}
                    />

                    <Text
                      style={[
                        styles.planTabTitle,
                        active && styles.activePlanTabTitle,
                      ]}
                    >
                      {plan.name}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.planTabPrice,
                      active && styles.activePlanTabPrice,
                    ]}
                  >
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ================= PRICE ================= */}

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.selectedPlanLabel}>
                {activePlan.name.toUpperCase()} PLAN
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{activePlan.price}</Text>

                <Text style={styles.pricePeriod}>
                  {activePlan.validityDays
                    ? `/ ${activePlan.validityDays} days`
                    : "/ No expiry"}
                </Text>
              </View>

              {!!activePlan.description && (
                <Text style={styles.planDescription}>
                  {activePlan.description}
                </Text>
              )}
            </View>

            {activePlan.code.toUpperCase() === "PLUS" && (
              <View style={styles.bestValueBadge}>
                <Ionicons name="star" size={12} color="#FFFFFF" />

                <Text style={styles.bestValueText}>POPULAR</Text>
              </View>
            )}

            {activePlan.code.toUpperCase() === "PRO" && (
              <View style={styles.proPlanBadge}>
                <Ionicons name="diamond" size={12} color="#FFFFFF" />

                <Text style={styles.bestValueText}>PREMIUM</Text>
              </View>
            )}
          </View>

          {/* ================= QUOTATION SUMMARY ================= */}

          <View style={styles.quotaCard}>
            <View style={styles.quotaIcon}>
              <Ionicons name="document-text" size={20} color="#FF7043" />
            </View>

            <View style={styles.quotaContent}>
              <Text style={styles.quotaTitle}>Quotations</Text>

              <Text style={styles.quotaSubtitle}>
                Send quotes to potential buyers
              </Text>
            </View>

            <View style={styles.quotaNumberContainer}>
              <Text style={styles.quotaNumber}>
                {activePlan.quotationLimit}
              </Text>

              <Text style={styles.quotaUnit}>quotes</Text>
            </View>
          </View>

          {/* ================= FEATURES ================= */}

          <Text style={styles.sectionLabel}>WHAT'S INCLUDED</Text>

          <View style={styles.featuresContainer}>
            {activePlan.features?.map((feature, index) => {
              const isBadge = feature.toLowerCase().includes("trusted");

              return (
                <View key={`${feature}-${index}`} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Ionicons
                      name={isBadge ? "shield-checkmark" : "checkmark"}
                      size={15}
                      color="#FFFFFF"
                    />
                  </View>

                  <Text style={styles.featureText}>{feature}</Text>

                  {isBadge && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>TRUSTED</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* ================= TRUSTED SELLER ================= */}

          {activePlan.hasTrustedBadge && (
            <View style={styles.trustedCard}>
              <View style={styles.trustedCardIcon}>
                <Ionicons name="shield-checkmark" size={22} color="#F97316" />
              </View>

              <View style={styles.trustedCardContent}>
                <Text style={styles.trustedCardTitle}>Trusted Seller</Text>

                <Text style={styles.trustedCardSubtitle}>
                  Build more trust with buyers
                </Text>
              </View>

              <Ionicons name="checkmark-circle" size={21} color="#22C55E" />
            </View>
          )}

          {/* ================= CTA ================= */}
          {isPlanActive(activePlan.id) ? (
            <View style={styles.activePlanButton}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />

              <Text style={styles.activePlanButtonText}>ALREADY PURCHASED</Text>
            </View>
          ) : (
            <Pressable
              onPress={handlePurchase}
              disabled={purchasing}
              style={styles.ctaWrapper}
            >
              <LinearGradient
                colors={
                  activePlan.code.toUpperCase() === "PRO"
                    ? ["#F97316", "#EF4444"]
                    : ["#FF7139", "#F04435"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Ionicons
                  name={
                    activePlan.price === 0
                      ? "arrow-forward-circle-outline"
                      : "lock-open-outline"
                  }
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.ctaText}>
                  {activePlan.price === 0
                    ? `CONTINUE WITH ${activePlan.name.toUpperCase()}`
                    : `GET ${activePlan.name.toUpperCase()}`}
                </Text>

                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          )}
          {/* ================= FOOTER ================= */}

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color="#71717A"
            />

            <Text style={styles.footerText}>
              Secure payment • Cancel anytime
            </Text>
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={webViewVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          if (!paymentChecking) {
            setWebViewVisible(false);
          }
        }}
      >
        <SafeAreaView style={styles.webViewContainer}>
          {/* WebView Header */}

          <View style={styles.webViewHeader}>
            <Pressable
              onPress={() => {
                if (paymentChecking) {
                  return;
                }

                Alert.alert(
                  "Cancel Payment?",
                  "Are you sure you want to close the payment screen?",
                  [
                    {
                      text: "Continue Payment",
                      style: "cancel",
                    },
                    {
                      text: "Close",
                      style: "destructive",
                      onPress: () => {
                        setWebViewVisible(false);
                        setCheckoutUrl("");
                      },
                    },
                  ]
                );
              }}
              style={styles.webViewCloseButton}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>

            <Text style={styles.webViewTitle}>Secure Payment</Text>

            <View style={{ width: 42 }} />
          </View>

          {/* Loading overlay */}

          {paymentChecking && (
            <View style={styles.paymentLoadingOverlay}>
              <View style={styles.paymentLoadingCard}>
                <ActivityIndicator size="large" color="#F04435" />

                <Text style={styles.paymentLoadingTitle}>
                  Verifying Payment
                </Text>

                <Text style={styles.paymentLoadingText}>
                  Please wait while we confirm your payment.
                </Text>
              </View>
            </View>
          )}

          {checkoutUrl ? (
            <WebView
              source={{
                uri: checkoutUrl,
              }}
              style={styles.webView}
              javaScriptEnabled
              domStorageEnabled
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              startInLoadingState
              originWhitelist={["*"]}
              onNavigationStateChange={handleWebViewNavigation}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="#F04435" />

                  <Text style={styles.webViewLoadingText}>
                    Loading payment...
                  </Text>
                </View>
              )}
              onError={(event) => {
                console.error("WEBVIEW ERROR:", event.nativeEvent);

                Alert.alert(
                  "Payment Page Error",
                  "Unable to load the payment page. Please try again."
                );
              }}
              onHttpError={(event) => {
                console.error("WEBVIEW HTTP ERROR:", event.nativeEvent);
              }}
            />
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default SellerSubscriptionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F04424",
  },

  /* ================= CENTER ================= */

  centerContainer: {
    flex: 1,
    backgroundColor: "#050505",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  webViewHeader: {
    height: 58,
    backgroundColor: "#F04435",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },

  webViewCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  webViewTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  webView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  webViewLoading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 58,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  webViewLoadingText: {
    marginTop: 12,
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
  },

  paymentLoadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 58,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  paymentLoadingCard: {
    width: "82%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
  },

  paymentLoadingTitle: {
    marginTop: 16,
    color: "#111111",
    fontSize: 18,
    fontWeight: "900",
  },

  paymentLoadingText: {
    marginTop: 8,
    color: "#666666",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
  },

  errorIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#241414",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  errorText: {
    color: "#8E8E93",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#F04435",
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  /* ================= HEADER ================= */

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    backgroundColor: "#F04435",
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  headerRight: {
    width: 38,
  },

  /* ================= SCROLL ================= */

  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#050505",
    paddingTop: 10,
  },

  darkContent: {
    backgroundColor: "#050505",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },

  /* ================= TABS ================= */

  planSelector: {
    flexDirection: "row",
    backgroundColor: "#1D1D1F",
    borderRadius: 17,
    padding: 4,
    marginTop: -1,
  },

  planTab: {
    flex: 1,
    minHeight: 54,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  activePlanTab: {
    backgroundColor: "#303033",
  },

  planTabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  planTabTitle: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "800",
  },

  activePlanTabTitle: {
    color: "#FFFFFF",
  },

  planTabPrice: {
    color: "#66666B",
    fontSize: 10,
    marginTop: 3,
    fontWeight: "600",
  },

  activePlanTabPrice: {
    color: "#FF7043",
  },

  /* ================= PRICE ================= */

  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 21,
  },

  selectedPlanLabel: {
    color: "#77777C",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  price: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },

  pricePeriod: {
    color: "#8E8E93",
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 5,
  },

  planDescription: {
    color: "#77777C",
    fontSize: 11,
    marginTop: 5,
    maxWidth: 230,
  },

  bestValueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0446B",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
  },

  proPlanBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
  },

  bestValueText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },

  /* ================= QUOTA ================= */

  quotaCard: {
    backgroundColor: "#1D1D1F",
    borderRadius: 17,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  quotaIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#30201C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  quotaContent: {
    flex: 1,
  },

  quotaTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  quotaSubtitle: {
    color: "#77777C",
    fontSize: 10,
    marginTop: 4,
  },

  quotaNumberContainer: {
    alignItems: "flex-end",
  },

  quotaNumber: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  quotaUnit: {
    color: "#77777C",
    fontSize: 9,
  },

  /* ================= FEATURES ================= */

  sectionLabel: {
    color: "#77777C",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  featuresContainer: {
    marginBottom: 18,
  },

  featureRow: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
  },

  featureIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#28282B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  featureText: {
    flex: 1,
    color: "#E5E5E7",
    fontSize: 15,
    fontWeight: "600",
  },

  newBadge: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
  },

  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "900",
  },

  /* ================= TRUSTED ================= */

  trustedCard: {
    backgroundColor: "#1D1D1F",
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2A2A2D",
  },

  trustedCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#30201C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  trustedCardContent: {
    flex: 1,
  },

  trustedCardTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  trustedCardSubtitle: {
    color: "#77777C",
    fontSize: 10,
    marginTop: 3,
  },

  /* ================= CTA ================= */

  ctaWrapper: {
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 2,
  },

  ctaButton: {
    height: 54,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  ctaText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  /* ================= FOOTER ================= */

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 13,
  },

  footerText: {
    color: "#66666B",
    fontSize: 12,
  },
  activeSubscriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  activeSubscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  activeSubscriptionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
  },

  activeSubscriptionName: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "900",
    color: "#172554",
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#15803D",
  },

  subscriptionStats: {
    flexDirection: "row",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  subscriptionStat: {
    flex: 1,
  },

  subscriptionStatValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#172554",
  },

  subscriptionStatLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },

  trustedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#DCFCE7",
  },

  trustedText: {
    marginLeft: 7,
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },

  activePlanButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  activePlanButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});
