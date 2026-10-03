import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { deleteDeliveryAddressApi, getDeliveryAddressesApi, setDefaultDeliveryAddressApi } from './address.api';
import { SafeAreaView } from 'react-native-safe-area-context';



type DeliveryAddress = {
  id: string;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

const DeliveryAddressesScreen = ({navigation}: any) => {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAddresses = async () => {
    try {
      const response = await getDeliveryAddressesApi();

      /*
       * Expected API response:
       *
       * {
       *   success: true,
       *   data: {
       *     addresses: [...]
       *   }
       * }
       */
      console.log("adddresss",response);
      

      const list =
        response ||
        response ||
        [];

      setAddresses(list);
    } catch (error: any) {
      console.log('Load addresses error:', error);

      Alert.alert(
        'Unable to load addresses',
        error?.message || 'Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadAddresses();
  };

  const handleAddAddress = () => {
    navigation.navigate('EditDeliveryAddress', {
      address: null,
    });
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    navigation.navigate('EditDeliveryAddress', {
      address,
    });
  };

  const handleDeleteAddress = (address: DeliveryAddress) => {
    Alert.alert(
      'Delete address',
      `Are you sure you want to delete "${address.label}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(address.id);

              await deleteDeliveryAddressApi(address.id);

              setAddresses(prev =>
                prev.filter(item => item.id !== address.id),
              );

              Alert.alert(
                'Address deleted',
                'Delivery address has been deleted.',
              );
            } catch (error: any) {
              console.log('Delete address error:', error);

              Alert.alert(
                'Unable to delete',
                error?.message || 'Please try again.',
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (address: DeliveryAddress) => {
    if (address.isDefault) {
      return;
    }

    try {
      setActionLoading(address.id);

      await setDefaultDeliveryAddressApi(address.id);

      setAddresses(prev =>
        prev.map(item => ({
          ...item,
          isDefault: item.id === address.id,
        })),
      );
    } catch (error: any) {
      console.log('Set default address error:', error);

      Alert.alert(
        'Unable to update',
        error?.message || 'Please try again.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getFullAddress = (address: DeliveryAddress) => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ].filter(Boolean);

    return parts.join(', ');
  };

  const renderAddress = (address: DeliveryAddress) => {
    const isBusy = actionLoading === address.id;

    return (
      <View key={address.id} style={styles.addressCard}>
        <View style={styles.cardTop}>
          <View style={styles.labelRow}>
            <View style={styles.homeIcon}>
              <Ionicons
                name={
                  address.label?.toLowerCase() === 'home'
                    ? 'home-outline'
                    : 'business-outline'
                }
                size={19}
                color="#FF7A00"
              />
            </View>

            <View style={styles.labelContainer}>
              <Text style={styles.addressLabel}>
                {address.label || 'Delivery Address'}
              </Text>

              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={13}
                    color="#16803A"
                  />
                  <Text style={styles.defaultText}>
                    Default
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Pressable
            onPress={() => handleEditAddress(address)}
            style={styles.editButton}>
            <Ionicons
              name="create-outline"
              size={19}
              color="#172554"
            />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <Text style={styles.name}>{address.name}</Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="call-outline"
            size={16}
            color="#8C8175"
          />
          <Text style={styles.infoText}>
            {address.phone}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={17}
            color="#8C8175"
          />
          <Text style={styles.addressText}>
            {getFullAddress(address)}
          </Text>
        </View>

        <View style={styles.cardActions}>
          {!address.isDefault ? (
            <Pressable
              disabled={isBusy}
              onPress={() => handleSetDefault(address)}
              style={styles.defaultAction}>
              {isBusy ? (
                <ActivityIndicator
                  size="small"
                  color="#FF7A00"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={17}
                    color="#FF7A00"
                  />
                  <Text style={styles.defaultActionText}>
                    Set as default
                  </Text>
                </>
              )}
            </Pressable>
          ) : (
            <View style={styles.defaultPlaceholder} />
          )}

          <Pressable
            disabled={isBusy}
            onPress={() => handleDeleteAddress(address)}
            style={styles.deleteButton}>
            <Ionicons
              name="trash-outline"
              size={17}
              color="#D92D20"
            />
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex:1}}>

   
    <LinearGradient
      colors={['#FFF3D6', '#FFF8EE', '#FFFFFF']}
      locations={[0, 0.3, 1]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerButton}>
            <Ionicons
              name="arrow-back"
              size={23}
              color="#172554"
            />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              Delivery Addresses
            </Text>
            <Text style={styles.headerSubtitle}>
              Manage your delivery locations
            </Text>
          </View>

          <Pressable
            onPress={handleAddAddress}
            style={styles.headerButton}>
            <Ionicons
              name="add"
              size={25}
              color="#FF7A00"
            />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="large"
              color="#FF7A00"
            />
            <Text style={styles.loadingText}>
              Loading addresses...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#FF7A00"
              />
            }>
            {/* Intro */}
            <View style={styles.intro}>
              <View style={styles.introIcon}>
                <Ionicons
                  name="location"
                  size={22}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.introTextContainer}>
                <Text style={styles.introTitle}>
                  Your delivery locations
                </Text>
                <Text style={styles.introText}>
                  Choose where you want your construction
                  materials delivered.
                </Text>
              </View>
            </View>

            {addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="location-outline"
                    size={42}
                    color="#FF9F1C"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No delivery addresses
                </Text>

                <Text style={styles.emptyText}>
                  Add your construction site or other
                  delivery location to get started.
                </Text>

                <Pressable
                  onPress={handleAddAddress}
                  style={styles.emptyButton}>
                  <Ionicons
                    name="add"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.emptyButtonText}>
                    Add Address
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                {addresses.map(renderAddress)}

                <Pressable
                  onPress={handleAddAddress}
                  style={styles.addAddressButton}>
                  <Ionicons
                    name="add-circle-outline"
                    size={21}
                    color="#FF7A00"
                  />
                  <Text style={styles.addAddressText}>
                    Add another address
                  </Text>
                </Pressable>
              </>
            )}

            <View style={{height: 30}} />
          </ScrollView>
        )}
      </View>
    </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  header: {
    height: 78,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 14,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172554',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: '#8C8175',
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 35,
  },

  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF0DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  introTextContainer: {
    flex: 1,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172554',
  },

  introText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#8C8175',
  },

  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1E2D0',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  homeIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFF0DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  labelContainer: {
    flex: 1,
  },

  addressLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172554',
  },

  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#EAF8EF',
  },

  defaultText: {
    marginLeft: 3,
    fontSize: 10,
    fontWeight: '700',
    color: '#16803A',
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F6F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#F1E8DE',
    marginVertical: 13,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#5F574F',
  },

  addressText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 19,
    color: '#5F574F',
  },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F1E8DE',
  },

  defaultAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },

  defaultActionText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A00',
  },

  defaultPlaceholder: {
    flex: 1,
  },

  deleteButton: {
    minHeight: 40,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  deleteText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: '#D92D20',
  },

  addAddressButton: {
    height: 55,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#FFB45C',
    borderStyle: 'dashed',
    backgroundColor: '#FFF9F1',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },

  addAddressText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#FF7A00',
  },

  emptyContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 25,
    paddingVertical: 38,
    borderWidth: 1,
    borderColor: '#F1E2D0',
    marginTop: 8,
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: '#FFF0DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 19,
    fontWeight: '800',
    color: '#172554',
  },

  emptyText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: '#8C8175',
  },

  emptyButton: {
    marginTop: 20,
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 15,
    backgroundColor: '#FF7A00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#8C8175',
  },
});

export default DeliveryAddressesScreen;
