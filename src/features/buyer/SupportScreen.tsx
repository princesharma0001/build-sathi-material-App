import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getToken } from "../auth/auth.store";
import { API_BASE_URL } from "../../config/api";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";

const categories = [
  { label: "Account Issue", value: "ACCOUNT" },
  { label: "Order Issue", value: "ORDER" },
  { label: "Payment Issue", value: "PAYMENT" },
  { label: "Subscription Issue", value: "SUBSCRIPTION" },
  { label: "App Bug / Technical Issue", value: "APP_BUG" },
  { label: "Other", value: "OTHER" },
];

export default function SupportScreen({ navigation }: any) {
  const [category, setCategory] = useState("APP_BUG");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitIssue = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Required", "Please enter a title and describe your issue.");
      return;
    }

    if (title.trim().length > 120) {
      Alert.alert("Invalid Title", "Title must not exceed 120 characters.");
      return;
    }

    try {
      setSubmitting(true);

      const token = await getToken();

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const url = `${API_BASE_URL}/support`;

      const payload = {
        category,
        title: title.trim(),
        description: description.trim(),
      };

      console.log("Support API URL:", url);
      console.log("Support payload:", payload);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      console.log("Support HTTP status:", response.status);
      console.log("Support raw response:", responseText);

      let result: any;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || `Request failed (${response.status}).`
        );
      }

      Alert.alert(
        "Issue Submitted",
        "Your support ticket has been created successfully.",
        [
          {
            text: "View My Issues",
            onPress: () => navigation.navigate("MySupportTickets"),
          },
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ]
      );

      setTitle("");
      setDescription("");
    } catch (error: any) {
      console.log("Support API error:", error);

      Alert.alert("Support", error?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8EE" }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#222222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Support</Text>
      </View>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>How can we help?</Text>
        <Text style={styles.subtitle}>
          Describe your problem and our support team will review it.
        </Text>

        <Text style={styles.label}>Issue Category</Text>

        <View style={styles.categories}>
          {categories.map((item) => {
            const selected = category === item.value;

            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setCategory(item.value)}
                style={[styles.category, selected && styles.selectedCategory]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.selectedCategoryText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Issue Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Payment deducted but order failed"
          maxLength={120}
          style={styles.input}
        />

        <Text style={styles.label}>Describe Your Issue</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Tell us what happened and what you need help with..."
          multiline
          maxLength={5000}
          textAlignVertical="top"
          style={[styles.input, styles.description]}
        />

        <Text style={styles.counter}>{description.length}/5000</Text>

        <TouchableOpacity
          disabled={submitting}
          onPress={submitIssue}
          style={[styles.submitButton, submitting && { opacity: 0.7 }]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Submit Issue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate("MySupportTickets")}
        >
          <Text style={styles.historyText}>View My Previous Issues</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF8EE" },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 25, fontWeight: "800", color: "#222" },
  subtitle: { fontSize: 14, color: "#777", lineHeight: 21, marginTop: 8 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginTop: 22,
    marginBottom: 9,
  },
  categories: { gap: 9 },
  category: {
    padding: 13,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E8DCCF",
    backgroundColor: "#FFFFFF",
  },
  selectedCategory: {
    borderColor: "#F97316",
    backgroundColor: "#FFF0E5",
  },
  categoryText: { fontSize: 14, color: "#555" },
  selectedCategoryText: { fontWeight: "700", color: "#C2410C" },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8DCCF",
    borderRadius: 12,
    padding: 14,
    color: "#222",
    fontSize: 14,
  },
  description: { height: 150 },
  counter: { textAlign: "right", color: "#888", fontSize: 12, marginTop: 5 },
  submitButton: {
    marginTop: 25,
    backgroundColor: "#F97316",
    padding: 16,
    alignItems: "center",
    borderRadius: 12,
  },
  submitText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  historyButton: { alignItems: "center", padding: 16 },
  historyText: { color: "#C2410C", fontWeight: "700" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF8EE",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8DCCF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222222",
    marginLeft: 12,
  },
});
