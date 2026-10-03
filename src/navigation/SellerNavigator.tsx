import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SellerDashboardScreen from '../features/seller/screens/SellerDashboardScreen';
import RequirementsScreen from '../features/seller/screens/RequirementsScreen';
import RequirementDetailsScreen from '../features/seller/screens/RequirementDetailsScreen';
import SubmitQuoteScreen from '../features/seller/screens/SubmitQuoteScreen';
import SubscriptionScreen from '../features/subscription/screens/SubscriptionScreen';

import { SellerStackParamList } from './types';

const Stack = createNativeStackNavigator<SellerStackParamList>();

const SellerNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SellerDashboard"
        component={SellerDashboardScreen}
        options={{ title: 'BuildSathi' }}
      />

      <Stack.Screen
        name="Requirements"
        component={RequirementsScreen}
        options={{ title: 'Requirements' }}
      />

      <Stack.Screen
        name="RequirementDetails"
        component={RequirementDetailsScreen}
        options={{ title: 'Requirement Details' }}
      />

      <Stack.Screen
        name="SubmitQuote"
        component={SubmitQuoteScreen}
        options={{ title: 'Submit Quote' }}
      />

      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
    </Stack.Navigator>
  );
};

export default SellerNavigator;
