import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BuyerStackParamList } from './types';
import BuyerProfileScreen from '../features/buyer/BuyerProfileScreen';
import LocationScreen from '../features/buyer/LocationScreen';
import BuyerHomeScreen from '../features/buyer/BuyerHomeScreen';
import QuoteDetailsScreen from '../features/buyer/QuoteDetailsScreen';

const Stack = createNativeStackNavigator<BuyerStackParamList>();

const BuyerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Buyer Onboarding */}

      <Stack.Screen
        name="BuyerProfile"
        component={BuyerProfileScreen}
        options={{
          title: 'Complete Profile',
        }}
      />

      <Stack.Screen
        name="Location"
        component={LocationScreen}
        options={{
          title: 'Your Location',
        }}
      />

      {/* Buyer Home */}

      <Stack.Screen
        name="BuyerHome"
        component={BuyerHomeScreen}
        options={{
          title: 'NeevSathi',
        }}
      />
      
    
    </Stack.Navigator>
  );
};

export default BuyerNavigator;
