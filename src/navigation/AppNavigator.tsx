import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import BuyerTabNavigator from "./BuyerTabNavigator";
import QuoteDetailsScreen from "../features/buyer/QuoteDetailsScreen";
import OrderConfirmationScreen from "../features/buyer/OrderConfirmationScreen";
import OrderDetailsScreen from "../features/orders/OrderDetailsScreen";
import PostRequirementScreen from "../features/requirements/PostRequirementScreen";
import RequestDetailsScreen from "../features/requirements/RequestDetailsScreen";
import BuyerNotificationsScreen from "../features/buyer/BuyerNotificationsScreen";
import EditBuyerProfileScreen from "../features/buyer/EditBuyerProfileScreen";
import EditDeliveryAddressScreen from "../features/buyer/EditDeliveryAddressScreen";
import SellerTabNavigator from "./SellerTabNavigator";
import BuyerProfileBasicScreen from "../features/buyer/BuyerProfileBasicScreen";
import SellerProfileBasicScreen from "../features/seller/SellerProfileBasicScreen";
import SellerRequirementDetailsScreen from "../features/seller/SellerRequirementDetailsScreen";
import SendQuoteScreen from "../features/seller/SendQuoteScreen";
import SellerQuoteDetailsScreen from "../features/seller/SellerQuoteDetailsScreen";
import DeliveryAddressesScreen from "../features/buyer/DeliveryAddressesScreen";
import EditSellerProfileScreen from "../features/seller/EditSellerProfileScreen";
import SellerDispatchMaterialScreen from "../features/seller/SellerDispatchMaterialScreen";
import SellerOrderDetailsScreen from "../features/seller/SellerOrderDetailsScreen";
import SellerSubscriptionScreen from "../features/subscription/SellerSubscriptionScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Buyer" component={BuyerTabNavigator} />
      <Stack.Screen
        name="Seller"
        component={SellerTabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="QuoteDetails"
        component={QuoteDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
      />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen
        name="CreateRequirement"
        component={PostRequirementScreen}
      />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <Stack.Screen name="Notifications" component={BuyerNotificationsScreen} />
      <Stack.Screen
        name="EditBuyerProfile"
        component={EditBuyerProfileScreen}
      />
      <Stack.Screen
        name="EditDeliveryAddress"
        component={EditDeliveryAddressScreen}
      />
      <Stack.Screen
        name="DeliveryAddresses"
        component={DeliveryAddressesScreen}
      />
      <Stack.Screen
        name="BuyerProfileBasic"
        component={BuyerProfileBasicScreen}
      />

      <Stack.Screen
        name="SellerProfileBasic"
        component={SellerProfileBasicScreen}
      />
      <Stack.Screen
        name="EditSellerProfile"
        component={EditSellerProfileScreen}
      />
      <Stack.Screen
        name="SellerRequirementDetails"
        component={SellerRequirementDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SendQuote"
        component={SendQuoteScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SellerQuoteDetails"
        component={SellerQuoteDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SellerDispatchMaterial"
        component={SellerDispatchMaterialScreen}
      />
      <Stack.Screen
        name="SellerOrderDetails"
        component={SellerOrderDetailsScreen}
      />
      <Stack.Screen
        name="SellerSubscription"
        component={SellerSubscriptionScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
