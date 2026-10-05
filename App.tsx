import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import notifee, {
  AndroidImportance,
} from '@notifee/react-native';

import AppNavigator from './src/navigation/AppNavigator';
import {navigationRef} from './src/navigation/navigationRef';

import {
  requestNotificationPermission,
  getFCMToken,
} from './src/services/notificationService';

import {
  getMessaging,
  onMessage,
} from '@react-native-firebase/messaging';

const App = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // 🔔 Request notification permission
        const permission =
          await requestNotificationPermission();

        console.log(
          'Notification permission:',
          permission,
        );

        // 🔔 Create Android notification channel
        await notifee.createChannel({
          id: 'default',
          name: 'BuildSathi Notifications',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });

        console.log(
          '✅ Notification channel created',
        );

        // 🔥 Get FCM token
        const token = await getFCMToken();

        console.log(
          '🔥 DEVICE FCM TOKEN:',
          token,
        );
      } catch (error) {
        console.error(
          '❌ Notification setup error:',
          error,
        );
      }
    };

    setupNotifications();

    // 🔔 Foreground FCM notification
    const messagingInstance = getMessaging();

    const unsubscribe = onMessage(
      messagingInstance,
      async remoteMessage => {
        console.log(
          '📩 PUSH NOTIFICATION RECEIVED:',
          remoteMessage,
        );

        const title =
          remoteMessage.notification?.title ||
          'BuildSathi';

        const body =
          remoteMessage.notification?.body ||
          'New notification';

        // 🔊 Show local notification with sound
        await notifee.displayNotification({
          title,
          body,

          data: remoteMessage.data,

          android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            pressAction: {
              id: 'default',
            },
          },
        });

        // Optional Toast
        Toast.show({
          type: 'info',
          text1: title,
          text2: body,
        });
      },
    );

    return unsubscribe;
  }, []);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
      </NavigationContainer>

      <Toast />
    </>
  );
};

export default App;