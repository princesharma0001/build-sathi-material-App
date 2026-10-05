import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BuyerHomeScreen from '../features/buyer/BuyerHomeScreen';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import BuyerRequestsScreen from '../features/buyer/BuyerRequestsScreen';
import BuyerQuotesScreen from '../features/buyer/BuyerQuotesScreen';
import BuyerOrdersScreen from '../features/orders/BuyerOrdersScreen';
import MainMBuyerProfileScreen from '../features/buyer/MainBuyerProfileScreen';

const Tab = createBottomTabNavigator();

const BuyerTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="BuyerHome"
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

          // elevation: 8,

          // shadowColor: '#8C5A2B',
          // shadowOffset: {
          //   width: 0,
          //   height: 5,
          // },
          // shadowOpacity: 0.12,
          // shadowRadius: 12,
        },

        tabBarActiveTintColor: '#FF7A00',
        tabBarInactiveTintColor: '#000',

        tabBarItemStyle: {
          height: 55,
        },
      }}
    >
      {/* ================= REQUESTS ================= */}

      <Tab.Screen
        name="MyRequirements"
        component={BuyerRequestsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View style={[styles.normalIcon]}>
                <Ionicons
                  name={focused ? 'document-text' : 'document-text-outline'}
                  size={21}
                  color={focused ? '#FF7A00' : '#8C8175'}
                />
              </View>

              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Requests
              </Text>
            </View>
          ),
        }}
      />

      {/* ================= QUOTES ================= */}

      <Tab.Screen
        name="Quotes"
        component={BuyerQuotesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View style={[styles.normalIcon]}>
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

      {/* ================= HOME ================= */}

      <Tab.Screen
        name="BuyerHome"
        component={BuyerHomeScreen}
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

      {/* ================= ORDERS ================= */}

      <Tab.Screen
        name="Orders"
        component={BuyerOrdersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View style={[styles.normalIcon]}>
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

      {/* ================= PROFILE ================= */}

      <Tab.Screen
        name="Profile"
        component={MainMBuyerProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <View style={[styles.normalIcon]}>
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

const styles = StyleSheet.create({
  // =========================================
  // NORMAL TABS
  // =========================================

  tabItem: {
    width: 65,
    height: 58,

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
    backgroundColor: '#FFE1C2',
  },

  normalIconText: {
    fontSize: 17,
    opacity: 0.65,
  },

  normalIconTextActive: {
    opacity: 1,
  },

  tabLabel: {
    marginTop: 3,

    fontSize: 11,

    fontWeight: '600',

    color: '#8C8175',
  },

  tabLabelActive: {
    color: '#FF7A00',

    fontWeight: '800',
  },

  // =========================================
  // CENTER HOME
  // =========================================

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

export default BuyerTabNavigator;
