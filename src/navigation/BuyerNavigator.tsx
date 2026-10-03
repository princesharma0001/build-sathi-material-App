import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import BuyerHomeScreen from '../features/buyer/screens/BuyerHomeScreen';
// import BuyerProfileScreen from '../features/buyer/screens/BuyerProfileScreen';
// import LocationScreen from '../features/buyer/screens/LocationScreen';

// import CreateRequirementScreen from '../features/buyer/screens/CreateRequirementScreen';
// import MyRequirementsScreen from '../features/buyer/screens/MyRequirementsScreen';
// import QuotesScreen from '../features/buyer/screens/QuotesScreen';
// import SellerDetailsScreen from '../features/buyer/screens/SellerDetailsScreen';

// import OrderDetailsScreen from '../features/orders/screens/OrderDetailsScreen';

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
          title: 'BuildSathi',
        }}
      />
      
    

      {/* Buyer Features */}

      {/* <Stack.Screen
        name="CreateRequirement"
        component={CreateRequirementScreen}
        options={{
          title: 'Create Requirement',
        }}
      /> */}

      {/* <Stack.Screen
        name="MyRequirements"
        component={MyRequirementsScreen}
        options={{
          title: 'My Requirements',
        }}
      />

      <Stack.Screen
        name="Quotes"
        component={QuotesScreen}
        options={{
          title: 'Quotes',
        }}
      /> */}

      {/* <Stack.Screen
        name="SellerDetails"
        component={SellerDetailsScreen}
        options={{
          title: 'Seller Details',
        }}
      />

      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{
          title: 'Order Details',
        }}
      /> */}
    </Stack.Navigator>
  );
};

export default BuyerNavigator;
