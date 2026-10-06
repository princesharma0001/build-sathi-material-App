import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../notification/notificationApi';

// import {
//   getNotifications,
//   markAllNotificationsAsRead,
//   markNotificationAsRead,
//   BackendNotification,
// } from '../api/notificationApi';

interface NotificationItem {
  id: string;
  type: 'quote' | 'requirement' | 'order' | 'subscription' | 'system';
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

const getNotificationType = (
  type: string,
): NotificationItem['type'] => {
  switch (type) {
    case 'NEW_REQUIREMENT':
      return 'requirement';

    case 'QUOTE_ACCEPTED':
    case 'QUOTE_REJECTED':
      return 'quote';

    case 'ORDER_DELIVERED':
    case 'ORDER_CONFIRMED':
    case 'ORDER_CANCELLED':
      return 'order';

    case 'SUBSCRIPTION_ACTIVATED':
    case 'SUBSCRIPTION_EXPIRING':
    case 'QUOTA_LOW':
    case 'QUOTA_EXHAUSTED':
      return 'subscription';

    default:
      return 'system';
  }
};

const formatNotificationTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const mapNotification = (
  notification: BackendNotification,
): NotificationItem => {
  const data = notification.data ?? {};

  return {
    id: notification.id,
    type: getNotificationType(notification.type),
    title: notification.title,
    message: notification.body,
    time: formatNotificationTime(notification.createdAt),
    unread: !notification.isRead,
    action: data.screen,
    data,
  };
};

const getIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'requirement':
      return 'document-text-outline';

    case 'quote':
      return 'pricetag-outline';

    case 'order':
      return 'cube-outline';

    case 'subscription':
      return 'diamond-outline';

    default:
      return 'notifications-outline';
  }
};

const SellerNotificationsScreen = ({navigation}: any) => {
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedFilter, setSelectedFilter] = useState<
    'All' | 'Requirements' | 'Quotes' | 'Orders' | 'Updates'
  >('All');

  const loadNotifications = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const response = await getNotifications();

        const mapped =
          response.data.notifications.map(mapNotification);

        setNotifications(mapped);
        setUnreadCount(response.data.unreadCount);
      } catch (error: any) {
        console.error(
          '❌ GET SELLER NOTIFICATIONS ERROR:',
          error,
        );

        Alert.alert(
          'Notifications',
          error?.message ||
            'Failed to load notifications.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };

  const markAsRead = async (id: string) => {
    try {
      const notification = notifications.find(
        item => item.id === id,
      );

      if (!notification?.unread) {
        return;
      }

      // Optimistic UI update
      setNotifications(prev =>
        prev.map(item =>
          item.id === id
            ? {...item, unread: false}
            : item,
        ),
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));

      await markNotificationAsRead(id);
    } catch (error) {
      console.error(
        '❌ MARK SELLER NOTIFICATION READ ERROR:',
        error,
      );

      loadNotifications(false);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setNotifications(prev =>
        prev.map(item => ({
          ...item,
          unread: false,
        })),
      );

      setUnreadCount(0);

      await markAllNotificationsAsRead();
    } catch (error) {
      console.error(
        '❌ MARK ALL SELLER NOTIFICATIONS READ ERROR:',
        error,
      );

      loadNotifications(false);
    }
  };

  const handleNotificationPress = async (
    notification: NotificationItem,
  ) => {
    await markAsRead(notification.id);

    if (!notification.action) {
      return;
    }

    try {
      navigation.navigate(
        notification.action,
        notification.data ?? undefined,
      );
    } catch (error) {
      console.log(
        'Seller notification navigation error:',
        error,
      );
    }
  };

  const getFilteredNotifications = () => {
    switch (selectedFilter) {
      case 'Requirements':
        return notifications.filter(
          item => item.type === 'requirement',
        );

      case 'Quotes':
        return notifications.filter(
          item => item.type === 'quote',
        );

      case 'Orders':
        return notifications.filter(
          item => item.type === 'order',
        );

      case 'Updates':
        return notifications.filter(
          item =>
            item.type === 'subscription' ||
            item.type === 'system',
        );

      default:
        return notifications;
    }
  };

  const filteredNotifications =
    getFilteredNotifications();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF4E8', '#FFFFFF']}
        style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>
              Notifications
            </Text>

            <Text style={styles.subtitle}>
              Stay updated with your business
            </Text>
          </View>

          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <Text
            onPress={markAllAsRead}
            style={styles.markAll}>
            Mark all as read
          </Text>
        )}
      </LinearGradient>

      <View style={styles.filters}>
        {[
          'All',
          'Requirements',
          'Quotes',
          'Orders',
          'Updates',
        ].map(filter => (
          <Text
            key={filter}
            onPress={() =>
              setSelectedFilter(filter as any)
            }
            style={[
              styles.filterText,
              selectedFilter === filter &&
                styles.filterTextActive,
            ]}>
            {filter}
          </Text>
        ))}
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
        contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color="#FF7A00"
            />

            <Text style={styles.loadingText}>
              Loading notifications...
            </Text>
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={42}
              color="#C8BDB2"
            />

            <Text style={styles.emptyTitle}>
              No notifications
            </Text>

            <Text style={styles.emptyText}>
              You're all caught up!
            </Text>
          </View>
        ) : (
          <View>
            {filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() =>
                  handleNotificationPress(notification)
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const NotificationCard = ({
  notification,
  onPress,
}: {
  notification: NotificationItem;
  onPress: () => void;
}) => {
  const icon = getIcon(notification.type);

  return (
    <View
      style={[
        styles.card,
        notification.unread && styles.unreadCard,
      ]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon as any}
          size={22}
          color="#FF7A00"
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {notification.title}
        </Text>

        <Text style={styles.cardMessage}>
          {notification.message}
        </Text>

        <Text style={styles.time}>
          {notification.time}
        </Text>
      </View>

      {notification.unread && (
        <View style={styles.unreadDot} />
      )}

      <Text
        onPress={onPress}
        style={styles.openButton}>
        View
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F3',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#201A16',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8B7D72',
  },

  unreadBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
  },

  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  markAll: {
    alignSelf: 'flex-end',
    marginTop: 12,
    color: '#FF7A00',
    fontSize: 12,
    fontWeight: '700',
  },

  filters: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1E8DF',
  },

  filterText: {
    marginHorizontal: 7,
    fontSize: 11,
    fontWeight: '700',
    color: '#9A8B7D',
  },

  filterTextActive: {
    color: '#FF7A00',
  },

  scrollContent: {
    padding: 14,
    paddingBottom: 30,
  },

  loadingContainer: {
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '700',
    color: '#9A8B7D',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E8DF',
  },

  unreadCard: {
    borderColor: '#FFD5B0',
    backgroundColor: '#FFF9F2',
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0E1',
  },

  cardContent: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#201A16',
  },

  cardMessage: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: '#75685E',
  },

  time: {
    marginTop: 6,
    fontSize: 9,
    color: '#A79A90',
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF7A00',
    marginHorizontal: 8,
  },

  openButton: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7A00',
  },

  emptyContainer: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '800',
    color: '#40362F',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 11,
    color: '#9A8B7D',
  },
});

export default SellerNotificationsScreen;