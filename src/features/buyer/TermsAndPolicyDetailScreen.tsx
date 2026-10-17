
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

type ContentPage = {
  id: string;
  type: "TERMS" | "PRIVACY" | "ABOUT";
  title: string;
  slug: string;
  content: string;
  version?: number;
  publishedAt?: string | null;
};

type Props = {
  navigation: any;
  route: {
    params?: {
      contentPage?: ContentPage;
    };
  };
};

const TermsAndPolicyDetailScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const page = route.params?.contentPage;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#FFF8EE"
        barStyle="dark-content"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {page?.title || "Details"}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!page ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={42}
              color="#F97316"
            />
            <Text style={styles.emptyTitle}>
              Content unavailable
            </Text>
            <Text style={styles.emptyText}>
              Please go back and open this section again.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.titleCard}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={
                    page.type === "TERMS"
                      ? "document-text-outline"
                      : page.type === "PRIVACY"
                        ? "shield-checkmark-outline"
                        : "information-circle-outline"
                  }
                  size={28}
                  color="#F97316"
                />
              </View>

              <Text style={styles.title}>{page.title}</Text>

              {page.publishedAt ? (
                <Text style={styles.date}>
                  Last updated:{" "}
                  {new Date(page.publishedAt).toLocaleDateString()}
                </Text>
              ) : null}
            </View>

            <View style={styles.contentCard}>
              <Text style={styles.body}>{page.content}</Text>
            </View>

            <Text style={styles.footer}>
              NeevSathi © {new Date().getFullYear()}
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndPolicyDetailScreen;

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
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0DEC4",
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  content: {
    padding: 18,
    paddingBottom: 32,
    flexGrow: 1,
  },
  titleCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  date: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 10,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F0DEC4",
  },
  body: {
    fontSize: 15,
    lineHeight: 25,
    color: "#374151",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  footer: {
    textAlign: "center",
    marginTop: 24,
    color: "#9CA3AF",
    fontSize: 12,
  },
});
