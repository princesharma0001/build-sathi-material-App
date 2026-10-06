import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/api';
import { getToken } from '../auth/auth.store';


/* =========================================================
   TYPES
========================================================= */

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;

  data?: {
    [key: string]: string | undefined;
  } | null;

  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  message: string;

  data: {
    notifications: NotificationItem[];
    unreadCount: number;
  };
}

/* =========================================================
   GET AUTH TOKEN
========================================================= */


/* =========================================================
   GET NOTIFICATIONS
========================================================= */

export const getNotifications =
  async (): Promise<NotificationListResponse> => {
    const token = await getToken();

    const response = await fetch(
      `${API_BASE_URL}/notifications`,
      {
        method: 'GET',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          'Failed to fetch notifications',
      );
    }

    return result;
  };

/* =========================================================
   MARK ONE NOTIFICATION AS READ
========================================================= */

export const markNotificationAsRead = async (
  notificationId: string,
) => {
  const token = await getToken();

  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        'Failed to mark notification as read',
    );
  }

  return result;
};

/* =========================================================
   MARK ALL AS READ
========================================================= */

export const markAllNotificationsAsRead =
  async () => {
    const token = await getToken();

    const response = await fetch(
      `${API_BASE_URL}/notifications/read-all`,
      {
        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message ||
          'Failed to mark notifications as read',
      );
    }

    return result;
  };