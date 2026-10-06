import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../notification/notificationApi";
interface NotificationItem {
  id: string;
  type: "quote" | "order" | "requirement" | "delivery" | "system";

  title: string;
  message: string;
  time: string;
  unread: boolean;

  action?: string;
  data?: Record<string, string | undefined> | null;
}

export interface BackendNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string | undefined> | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const BuyerNotificationsScreen = ({ navigation }: any) => {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const filters = ["All", "Quotes", "Orders", "Updates"];

  const getFilteredNotifications = () => {
    if (selectedFilter === "All") {
      return notifications;
    }

    if (selectedFilter === "Quotes") {
      return notifications.filter((item) => item.type === "quote");
    }

    if (selectedFilter === "Orders") {
      return notifications.filter(
        (item) => item.type === "order" || item.type === "delivery"
      );
    }

    return notifications.filter(
      (item) => item.type === "requirement" || item.type === "system"
    );
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);

    const now = new Date();

    const diffMs = now.getTime() - date.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return "Just now";
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 1) {
      return "Yesterday";
    }

    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const loadNotifications = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await getNotifications();
      console.log("jhjghd",response);
      const mappedNotifications =
        response.data.notifications.map(mapNotification);

      setNotifications(mappedNotifications);

      setUnreadCount(response.data.unreadCount);
    } catch (error: any) {
      console.error("❌ GET NOTIFICATIONS ERROR:", error);

      Alert.alert(
        "Notifications",
        error?.message || "Failed to load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const mapNotification = (
    notification: BackendNotification
  ): NotificationItem => {
    const data = notification.data ?? {};

    let action: string | undefined;

    if (data.screen) {
      action = data.screen;
    }

    return {
      id: notification.id,

      type: getNotificationType(notification.type),

      title: notification.title,

      message: notification.body,

      time: formatNotificationTime(notification.createdAt),

      unread: !notification.isRead,

      action,

      data,
    };
  };
  const getNotificationType = (type: string): NotificationItem["type"] => {
    switch (type) {
      case "NEW_QUOTE":
      case "QUOTE_ACCEPTED":
      case "QUOTE_REJECTED":
        return "quote";

      case "ORDER_CONFIRMED":
      case "ORDER_CANCELLED":
        return "order";

      case "ORDER_DISPATCHED":
      case "ORDER_DELIVERED":
        return "delivery";

      case "NEW_REQUIREMENT":
        return "requirement";

      default:
        return "system";
    }
  };

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };

  // const unreadCount = notifications.filter(item => item.unread).length;

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      // Optimistic UI
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          unread: false,
        }))
      );

      setUnreadCount(0);

      await markAllNotificationsAsRead();
    } catch (error) {
      console.error("❌ MARK ALL READ ERROR:", error);

      loadNotifications(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const notification = notifications.find((item) => item.id === id);

      if (!notification?.unread) {
        return;
      }

      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                unread: false,
              }
            : item
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));

      await markNotificationAsRead(id);
    } catch (error) {
      console.error("❌ MARK NOTIFICATION READ ERROR:", error);

      // Reload from backend if API fails
      loadNotifications(false);
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    await markAsRead(notification.id);

    if (!notification.action) {
      return;
    }

    try {
      navigation.navigate(notification.action, notification.data ?? undefined);
    } catch (error) {
      console.log("Navigation error:", error);
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={21} color="#0A0A0A" />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <Pressable style={styles.headerButton} onPress={markAllAsRead}>
          <Ionicons name="checkmark-done-outline" size={20} color="#FF7A00" />
        </Pressable>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF7A00"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* SUMMARY */}
        <LinearGradient
          colors={["#FFF3D6", "#FFE5BD", "#FFD39B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryIcon}>
            <Ionicons name="notifications" size={23} color="#FF7A00" />
          </View>

          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>Stay updated</Text>

            <Text style={styles.summarySubtitle}>
              Get updates about quotes, orders and deliveries.
            </Text>
          </View>

          <View style={styles.unreadBadge}>
            <Text style={styles.unreadNumber}>{unreadCount}</Text>

            <Text style={styles.unreadLabel}>NEW</Text>
          </View>
        </LinearGradient>

        {/* FILTER */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filters.map((filter) => {
              const active = selectedFilter === filter;

              return (
                <Pressable
                  key={filter}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      active && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* NOTIFICATION HEADER */}
        <View style={styles.notificationHeader}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>

          {unreadCount > 0 && (
            <Pressable onPress={markAllAsRead}>
              <Text style={styles.markReadText}>Mark all read</Text>
            </Pressable>
          )}
        </View>

        {/* NOTIFICATIONS */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF7A00" />

            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : (
          <>
            <View style={styles.notificationList}>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleNotificationPress(notification)}
                  />
                ))
              ) : (
                <EmptyNotifications />
              )}
            </View>
          </>
        )}

        {/* FOOTER TRUST CARD */}
        <View style={styles.protectionCard}>
          <View style={styles.protectionIcon}>
            <Ionicons name="shield-checkmark" size={20} color="#2E9D5B" />
          </View>

          <View style={styles.protectionText}>
            <Text style={styles.protectionTitle}>
              BuildSathi Buyer Protection
            </Text>

            <Text style={styles.protectionSubtitle}>
              Important purchase and payment updates will always appear here.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* ------------------------------------------------ */
/* NOTIFICATION CARD */
/* ------------------------------------------------ */

const NotificationCard = ({
  notification,
  onPress,
}: {
  notification: NotificationItem;
  onPress: () => void;
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "quote":
        return "pricetag-outline";

      case "order":
        return "cube-outline";

      case "delivery":
        return "car-outline";

      case "requirement":
        return "document-text-outline";

      default:
        return "shield-checkmark-outline";
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case "quote":
        return "#D4A017";

      case "order":
        return "#FF7A00";

      case "delivery":
        return "#7C5CFC";

      case "requirement":
        return "#E85D75";

      default:
        return "#2E9D5B";
    }
  };

  const getIconBackground = () => {
    switch (notification.type) {
      case "quote":
        return "#FFF7D9";

      case "order":
        return "#FFF0DF";

      case "delivery":
        return "#F1EDFF";

      case "requirement":
        return "#FFF0F3";

      default:
        return "#EAF8EF";
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.notificationCard,
        notification.unread && styles.notificationCardUnread,
        pressed && styles.notificationPressed,
      ]}
      onPress={onPress}
    >
      {/* UNREAD DOT */}
      {notification.unread && <View style={styles.unreadDot} />}

      {/* ICON */}
      <View
        style={[
          styles.notificationIcon,
          {
            backgroundColor: getIconBackground(),
          },
        ]}
      >
        <Ionicons name={getIcon()} size={20} color={getIconColor()} />
      </View>

      {/* CONTENT */}
      <View style={styles.notificationContent}>
        <View style={styles.notificationTitleRow}>
          <Text
            style={[
              styles.notificationTitle,
              notification.unread && styles.notificationTitleUnread,
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>

          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>

        <Text style={styles.notificationMessage} numberOfLines={3}>
          {notification.message}
        </Text>

        {notification.action && (
          <View style={styles.notificationAction}>
            <Text style={styles.notificationActionText}>View details</Text>

            <Ionicons name="arrow-forward" size={13} color="#FF7A00" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

/* ------------------------------------------------ */
/* EMPTY STATE */
/* ------------------------------------------------ */

const EmptyNotifications = () => {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Ionicons name="notifications-off-outline" size={30} color="#B2A69A" />
      </View>

      <Text style={styles.emptyTitle}>No notifications</Text>

      <Text style={styles.emptySubtitle}>
        You're all caught up. New updates will appear here.
      </Text>
    </View>
  );
};

export default BuyerNotificationsScreen;

/* ------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8EE",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* HEADER */

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loadingContainer: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '700',
    color: '#9A8B7D',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#F0DEC4",
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  brand: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2.4,
    color: "#FF7A00",
  },

  headerTitle: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  /* SUMMARY */

  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 84,
    // padding: 14,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3D4A8",
    overflow: "hidden",
  },

  summaryIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    marginLeft: 12,
  },

  summaryText: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  summaryTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0A0A0A",
  },

  summarySubtitle: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 14,
    color: "#665C51",
  },

  unreadBadge: {
    minWidth: 43,
    height: 43,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7A00",
    marginRight: 12,
  },

  unreadNumber: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  unreadLabel: {
    marginTop: 1,
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "#FFE6CA",
  },

  /* FILTER */

  filterSection: {
    marginTop: 17,
  },

  filterScroll: {
    paddingHorizontal: 16,
  },

  filterChip: {
    marginRight: 8,
    paddingHorizontal: 15,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  filterChipActive: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },

  filterText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#8C8175",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  /* HEADER */

  notificationHeader: {
    marginTop: 22,
    paddingHorizontal: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#9A8B7D",
  },

  markReadText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FF7A00",
  },

  /* LIST */

  notificationList: {
    marginTop: 9,
    paddingHorizontal: 16,
  },

  notificationCard: {
    position: "relative",
    minHeight: 91,
    marginBottom: 9,
    padding: 12,
    paddingLeft: 14,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  notificationCardUnread: {
    backgroundColor: "#FFFDF9",
    borderColor: "#F5D8B5",
  },

  notificationPressed: {
    backgroundColor: "#FFF7EF",
  },

  unreadDot: {
    position: "absolute",
    top: 13,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF7A00",
  },

  notificationIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationContent: {
    flex: 1,
    marginLeft: 11,
  },

  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    color: "#40372F",
  },

  notificationTitleUnread: {
    fontWeight: "900",
    color: "#211C17",
  },

  notificationTime: {
    marginLeft: 7,
    fontSize: 10,
    fontWeight: "600",
    color: "#A19589",
  },

  notificationMessage: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 14,
    color: "#8C8175",
  },

  notificationAction: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  notificationActionText: {
    marginRight: 4,
    fontSize: 8.5,
    fontWeight: "900",
    color: "#FF7A00",
  },

  /* EMPTY */

  emptyCard: {
    minHeight: 210,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F1EC",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 13,
    fontWeight: "900",
    color: "#40372F",
  },

  emptySubtitle: {
    width: "72%",
    marginTop: 5,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
    color: "#9A8B7D",
  },

  /* PROTECTION */

  protectionCard: {
    marginHorizontal: 16,
    marginTop: 21,
    padding: 14,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8EF",
    borderWidth: 1,
    borderColor: "#CDEBD8",
  },

  protectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  protectionText: {
    flex: 1,
    marginLeft: 11,
  },

  protectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#226B3E",
  },

  protectionSubtitle: {
    marginTop: 3,
    fontSize: 8.5,
    lineHeight: 14,
    color: "#568267",
  },

  bottomSpace: {
    height: 100,
  },
});
