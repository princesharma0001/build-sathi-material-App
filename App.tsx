// import React from 'react';
// import AppNavigator from './src/navigation/AppNavigator';

// const App = () => {
//   return <AppNavigator />;
// };

// export default App;

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { navigationRef } from './src/navigation/navigationRef';

const App = () => {
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