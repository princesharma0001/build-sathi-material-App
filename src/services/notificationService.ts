import {
  getMessaging,
  getToken,
} from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';

export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      console.log('Notification permission:', result);
    }

    return true;
  } catch (error) {
    console.log('Notification permission error:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    const messagingInstance = getMessaging();

    const token = await getToken(messagingInstance);

    console.log('🔥 FCM TOKEN:', token);

    return token;
  } catch (error) {
    console.log('FCM token error:', error);
    return null;
  }
};