import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getToken } from "../auth/auth.store";
import { API_BASE_URL } from "../../config/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MySupportTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  console.log("asfadf",tickets);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Please log in again.");

      const response = await fetch(`${API_BASE_URL}/support/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load tickets.");
      }

      setTickets(result.data?.tickets ?? []);
    } catch (error: any) {
      // Replace with your app's standard toast/alert if needed.
      console.error("LOAD SUPPORT TICKETS:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const statusColor: Record<string, string> = {
    OPEN: "#D97706",
    IN_PROGRESS: "#2563EB",
    RESOLVED: "#15803D",
    CLOSED: "#6B7280",
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={{ marginTop: 10, color: "#777" }}>
          Loading your issues...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex:1,backgroundColor: "#FFF8EE"}}>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={tickets}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadTickets();
            }}
            colors={["#F97316"]}
          />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.heading}>My Support Issues</Text>
            <Text style={styles.subtitle}>
              Track your reported problems here.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>You haven't reported any issues yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.ticketTitle}>{item.subject}</Text>
              <Text
                style={{
                  color: statusColor[item.status] || "#777",
                  fontSize: 11,
                  fontWeight: "800",
                }}
              >
                {String(item.status).replace("_", " ")}
              </Text>
            </View>
            <Text style={styles.category}>
              {item.category?.replace("_", " ")}
            </Text>
            <Text style={styles.description}>{item.description}</Text>
            {!!item.adminReply && (
              <View style={styles.note}>
                <Text style={{ fontWeight: "700", color: "#9A3412" }}>
                  Support team response
                </Text>
                <Text style={{ color: "#7C2D12", marginTop: 4 }}>
                  {item.adminReply}
                </Text>
              </View>
            )}
            <Text style={styles.date}>
              Submitted: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.date1}>
              Ticket Number: {item.ticketNumber}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF8EE" },
  content: { padding: 16, flexGrow: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 23, fontWeight: "800", color: "#222" },
  subtitle: { fontSize: 13, color: "#777", marginTop: 5 },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1E5D8",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  ticketTitle: { fontSize: 15, fontWeight: "700", color: "#222", flex: 1 },
  category: { fontSize: 11, color: "#C2410C", marginTop: 9, fontWeight: "700" },
  description: { fontSize: 13, color: "#555", lineHeight: 20, marginTop: 8 },
  note: {
    backgroundColor: "#FFF3E8",
    borderRadius: 9,
    padding: 12,
    marginTop: 12,
  },
  date: { fontSize: 11, color: "#888", marginTop: 12 },
  date1: { fontSize: 14, color: "#000", marginTop: 12 },

  empty: { textAlign: "center", marginTop: 50, color: "#777" },
});
