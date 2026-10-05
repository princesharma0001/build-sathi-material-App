import {AppRegistry} from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import App from './App';
import {name as appName} from './app.json';

const messagingInstance = getMessaging();

setBackgroundMessageHandler(
  messagingInstance,
  async remoteMessage => {
    console.log(
      '📩 BACKGROUND NOTIFICATION:',
      remoteMessage,
    );
  },
);

AppRegistry.registerComponent(appName, () => App);