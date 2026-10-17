import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@react-native-vector-icons/ionicons";
import { API_BASE_URL } from "../../config/api";
import { getToken } from "../auth/auth.store";

type Feedback = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  user?: { name?: string };
  customer?: { name?: string };
  reviewer?: { name?: string };
};

export default function SellerFeedbackScreen() {
  const [summary, setSummary] = useState<{
    averageRating: number;
    totalRatings: number;
    distribution: Record<string, number>;
  } | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchFeedback = useCallback(async () => {
    try {
      setError("");

      const token = await getToken();

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(
        `${API_BASE_URL}/feedback/received?page=1&limit=20`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      console.log("Seller feedback response:", result);

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Unable to load feedback.");
      }

      // Correct response structure: result.data.feedback
      const data = result?.data;

      setFeedbacks(Array.isArray(data?.feedback) ? data.feedback : []);

      // Optional: save summary for rating display
      setSummary(data?.summary ?? null);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const renderFeedback = ({ item }: { item: Feedback }) => {
    const rating = Math.max(0, Math.min(5, Number(item.rating) || 0));
    const customerName =
      item.customer?.name ||
      item.user?.name ||
      item.reviewer?.name ||
      "Customer";

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={22} color="#F97316" />
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customerName}</Text>
            <View style={styles.stars}>
              {Array.from({ length: 5 }, (_, index) => (
                <Ionicons
                  key={index}
                  name={index < rating ? "star" : "star-outline"}
                  size={17}
                  color="#F59E0B"
                />
              ))}
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.comment}>
          {item.comment?.trim() || "Customer did not leave a comment."}
        </Text>

        {!!item.createdAt && (
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.muted}>Loading customer feedback...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Feedback</Text>
        <Text style={styles.subtitle}>
          Ratings and reviews received from your customers
        </Text>
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={feedbacks}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={renderFeedback}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.ratingCard}>
            <Text style={styles.ratingHeading}>Seller Rating</Text>
            <Text style={styles.ratingSubtitle}>
              What customers think about you
            </Text>

            <View style={styles.ratingMain}>
              <View style={styles.ratingScoreBox}>
                <Text style={styles.ratingScore}>
                  {Number(summary?.averageRating ?? 0).toFixed(1)}
                </Text>

                <View style={styles.ratingStars}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Ionicons
                      key={index}
                      name={
                        index < Math.round(summary?.averageRating ?? 0)
                          ? "star"
                          : "star-outline"
                      }
                      size={17}
                      color="#F59E0B"
                    />
                  ))}
                </View>

                <Text style={styles.ratingTotal}>
                  {summary?.totalRatings ?? 0} ratings
                </Text>
              </View>

              <View style={styles.ratingDivider} />

              <View style={styles.ratingDistribution}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary?.distribution?.[String(star)] ?? 0;
                  const total = summary?.totalRatings ?? 0;
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <View key={star} style={styles.ratingBarRow}>
                      <Text style={styles.ratingBarLabel}>{star}</Text>

                      <Ionicons name="star" size={12} color="#F59E0B" />

                      <View style={styles.ratingBarTrack}>
                        <View
                          style={[
                            styles.ratingBarFill,
                            { width: `${percentage}%` },
                          ]}
                        />
                      </View>

                      <Text style={styles.ratingBarCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.ratingFooter}>
              <Ionicons name="chatbubbles-outline" size={17} color="#C2410C" />
              <Text style={styles.ratingFooterText}>
                {summary?.totalRatings
                  ? "Thank you for building trust with customers!"
                  : "Your customer reviews will appear here."}
              </Text>
            </View>

            <Text style={styles.reviewsHeading}>Customer Reviews</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchFeedback();
            }}
            colors={["#F97316"]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8EE" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8EE",
  },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 23, fontWeight: "700", color: "#222" },
  subtitle: { fontSize: 13, color: "#777", marginTop: 5 },
  list: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3E7D8",
  },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0E5",
    alignItems: "center",
    justifyContent: "center",
  },
  customerInfo: { marginLeft: 12, flex: 1 },
  customerName: { fontSize: 15, fontWeight: "700", color: "#222" },
  stars: { flexDirection: "row", alignItems: "center", marginTop: 5, gap: 2 },
  ratingText: { marginLeft: 5, fontSize: 12, color: "#777" },
  comment: { fontSize: 14, color: "#444", lineHeight: 21, marginTop: 14 },
  date: { fontSize: 12, color: "#888", marginTop: 10 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    flex: 1,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },
  muted: { fontSize: 13, color: "#777", marginTop: 8, textAlign: "center" },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  errorText: { color: "#B91C1C", fontSize: 13 },

  ratingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F5E6D5",
    elevation: 3,
    shadowColor: "#9A5B2B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  ratingHeading: {
    fontSize: 21,
    fontWeight: "800",
    color: "#222222",
  },
  ratingSubtitle: {
    fontSize: 13,
    color: "#888888",
    marginTop: 5,
  },
  ratingMain: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 18,
  },
  ratingScoreBox: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 105,
  },
  ratingScore: {
    fontSize: 43,
    fontWeight: "800",
    color: "#F97316",
    lineHeight: 50,
  },
  ratingStars: {
    flexDirection: "row",
    marginTop: 4,
    gap: 2,
  },
  ratingTotal: {
    fontSize: 12,
    color: "#777777",
    marginTop: 7,
  },
  ratingDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#F0E6DB",
    marginHorizontal: 15,
  },
  ratingDistribution: {
    flex: 1,
    gap: 9,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ratingBarLabel: {
    width: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#555555",
  },
  ratingBarTrack: {
    flex: 1,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#F2EEE8",
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#F59E0B",
  },
  ratingBarCount: {
    width: 18,
    textAlign: "right",
    fontSize: 11,
    color: "#777777",
  },
  ratingFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3E8",
    padding: 12,
    borderRadius: 12,
  },
  ratingFooterText: {
    flex: 1,
    fontSize: 12,
    color: "#9A3412",
    lineHeight: 18,
  },
  reviewsHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222222",
    marginTop: 24,
    marginBottom: 4,
  },
});
