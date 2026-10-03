import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MainBuyerProfileScreen from '../features/buyer/MainBuyerProfileScreen';
import SellerHomeScreen from '../features/seller/SellerHomeScreen';
import SellerRequirementsScreen from '../features/seller/SellerRequirementsScreen';
import SellerQuotesScreen from '../features/seller/SellerQuotesScreen';
import SellerOrdersScreen from '../features/seller/SellerOrdersScreen';
import SellerProfileScreen from '../features/seller/SellerProfileScreen';

const Tab = createBottomTabNavigator();

const SellerTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="SellerHome"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: 'absolute',

          left: 16,
          right: 16,
          bottom: 16,

          height: 72,

          backgroundColor: '#FFFCF7',

          borderRadius: 24,

          // Very subtle warm border
          // borderWidth: 1,
          // borderColor: '#F1E2D0',

          paddingTop: 8,
          paddingBottom: 8,
        },

        tabBarActiveTintColor: '#FF7A00',
        tabBarInactiveTintColor: '#000',

        tabBarItemStyle: {
          height: 55,
        },
      }}
    >
      {/* REQUIREMENTS */}
      <Tab.Screen
        name="SellerRequirements"
        component={SellerRequirementsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View
                style={[styles.normalIcon, focused && styles.normalIconActive]}
              >
                <Ionicons
                  name={focused ? 'document-text' : 'document-text-outline'}
                  size={21}
                  color={focused ? '#FF7A00' : '#8C8175'}
                />
              </View>

              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Requirement
              </Text>
            </View>
          ),
        }}
      />

      {/* QUOTES */}
      <Tab.Screen
        name="SellerQuotes"
        component={SellerQuotesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View
                style={[styles.normalIcon, focused && styles.normalIconActive]}
              >
                <Ionicons
                  name={focused ? 'pricetag' : 'pricetag-outline'}
                  size={21}
                  color={focused ? '#FF7A00' : '#8C8175'}
                />
              </View>

              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Quotes
              </Text>
            </View>
          ),
        }}
      />
      {/* HOME */}
      <Tab.Screen
        name="SellerHome"
        component={SellerHomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.homeTabContainer}>
              <View style={[styles.homeButton]}>
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={28}
                  color={focused ? '#FF7A00' : '#FF7A00'}
                />
              </View>

              <Text
                style={[styles.homeLabel, focused && styles.homeLabelActive]}
              >
                Home
              </Text>
            </View>
          ),
        }}
      />
      {/* ORDERS */}
      <Tab.Screen
        name="SellerOrders"
        component={SellerOrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View
                style={[styles.normalIcon, focused && styles.normalIconActive]}
              >
                <Ionicons
                  name={focused ? 'cube' : 'cube-outline'}
                  size={21}
                  color={focused ? '#FF7A00' : '#8C8175'}
                />
              </View>

              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Orders
              </Text>
            </View>
          ),
        }}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="SellerProfile"
        component={SellerProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View
                style={[styles.normalIcon, focused && styles.normalIconActive]}
              >
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={21}
                  color={focused ? '#FF7A00' : '#8C8175'}
                />
              </View>

              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default SellerTabNavigator;

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',

    left: 16,
    right: 16,
    bottom: 16,

    height: 72,

    backgroundColor: '#FFFCF7',

    borderRadius: 24,

    borderWidth: 1,
    borderColor: '#F1E2D0',

    paddingTop: 6,
    paddingBottom: 7,

    elevation: 8,

    shadowColor: '#8C5A2B',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  tabItem: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  normalIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',

    // backgroundColor: '#FFF3E5',
  },

  normalIconActive: {
    // backgroundColor: '#FFE1C2',
  },

  tabLabel: {
    marginTop: 3,

    fontSize: 9,

    fontWeight: '600',

    color: '#8C8175',
  },

  tabLabelActive: {
    color: '#FF7A00',

    fontWeight: '900',
  },
  homeTabContainer: {
    width: 82,
    height: 90,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: -27,
  },

  homeButton: {
    width: 64,
    height: 64,

    borderRadius: 32,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF3E5',

    borderWidth: 3,
    borderColor: '#FFB15C',

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,

    elevation: 8,
  },

  homeButtonActive: {
    backgroundColor: '#FF7A00',

    borderColor: '#FFB15C',

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,

    elevation: 12,
  },

  homeIcon: {
    fontSize: 32,

    color: '#FF7A00',

    fontWeight: '900',

    marginTop: -3,
  },

  homeLabel: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: '#8C8175',
  },

  homeLabelActive: {
    color: '#FF7A00',

    fontWeight: '900',
  },
});
