import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OrderConfirmationScreen = ({ navigation, route }: any) => {
  const quote = route?.params?.quote || {};

  const supplierName =
    quote.supplierName ||
    quote.supplier ||
    'Shree Ganesh Traders';

  const material =
    quote.material ||
    'OPC 53 Grade Cement';

  const quantity =
    quote.quantity ||
    '20 Bags';

  const price =
    quote.totalPrice ||
    quote.price ||
    8400;

  const delivery =
    quote.delivery ||
    '2–3 Days';

  const location =
    quote.location ||
    'Noida';

  const orderId =
    quote.orderId ||
    'BS-2026-10482';

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF3D6"
      />

      {/* Header */}
      <View style={styles.header}>
    
     

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Success Hero */}
        <View style={styles.successSection}>
          <LinearGradient
            colors={[
              '#8AFF8A',
              '#008000',
              '#8AFF8A',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successCircle}
          >
            <View style={styles.successInnerCircle}>
              <Image source={require("../../assets/done.png")}  style={styles.done}/>
            </View>
          </LinearGradient>

          <Text style={styles.successTitle}>
            Order Placed Successfully!
          </Text>

          <Text style={styles.successSubtitle}>
            Your material order has been confirmed
            with the supplier.
          </Text>

          {/* Order ID */}
          <View style={styles.orderIdCard}>
            <View>
              <Text style={styles.orderIdLabel}>
                ORDER ID
              </Text>

              <Text style={styles.orderId}>
                {orderId}
              </Text>
            </View>

            <Pressable
              style={styles.copyButton}
              onPress={() => {}}
            >
              <Ionicons
                name="copy-outline"
                size={16}
                color="#FF7A00"
              />

              <Text style={styles.copyText}>
                Copy
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Supplier Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Supplier
          </Text>

          <View style={styles.supplierCard}>
            <View style={styles.supplierAvatar}>
              <Text style={styles.avatarText}>
                {supplierName
                  .split(' ')
                  .map((word: string) =>
                    word.charAt(0)
                  )
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.supplierInfo}>
              <View style={styles.supplierNameRow}>
                <Text
                  style={styles.supplierName}
                  numberOfLines={1}
                >
                  {supplierName}
                </Text>

                <Ionicons
                  name="checkmark-circle"
                  size={17}
                  color="#2E9D5B"
                />
              </View>

              <View style={styles.ratingRow}>
                <Ionicons
                  name="star"
                  size={13}
                  color="#D4A017"
                />

                <Text style={styles.rating}>
                  {quote.rating || 4.8}
                </Text>

                <Text style={styles.ratingDot}>
                  •
                </Text>

                <Text style={styles.reviews}>
                  {quote.reviews || 126} reviews
                </Text>
              </View>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color="#8C8175"
                />

                <Text style={styles.locationText}>
                  {location}
                </Text>
              </View>
            </View>

            <View style={styles.verifiedBadge}>
              <Ionicons
                name="shield-checkmark"
                size={13}
                color="#2E9D5B"
              />

              <Text style={styles.verifiedText}>
                Verified
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Order Summary
          </Text>

          <View style={styles.summaryCard}>
            {/* Material */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="cube-outline"
                  size={19}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>
                  Material
                </Text>

                <Text style={styles.summaryValue}>
                  {material}
                </Text>
              </View>
            </View>

            {/* Quantity */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="layers-outline"
                  size={18}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>
                  Quantity
                </Text>

                <Text style={styles.summaryValue}>
                  {quantity}
                </Text>
              </View>
            </View>

            {/* Delivery */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="time-outline"
                  size={19}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>
                  Expected Delivery
                </Text>

                <Text style={styles.summaryValue}>
                  {delivery}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="location-outline"
                  size={19}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>
                  Delivery Location
                </Text>

                <Text style={styles.summaryValue}>
                  {location}
                </Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            {/* Total */}
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>
                  Total Amount
                </Text>

                <Text style={styles.totalSubtext}>
                  Inclusive of supplier quote
                </Text>
              </View>

              <Text style={styles.totalAmount}>
                ₹{price.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            What's Next?
          </Text>

          <View style={styles.timelineCard}>
            {/* Step 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconActive}>
                <Ionicons
                  name="checkmark"
                  size={15}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Order Confirmed
                </Text>

                <Text style={styles.timelineText}>
                  Your order has been placed with the
                  supplier.
                </Text>
              </View>
            </View>

            <View style={styles.timelineLineActive} />

            {/* Step 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                <Ionicons
                  name="cube-outline"
                  size={15}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Supplier Preparing
                </Text>

                <Text style={styles.timelineText}>
                  Supplier will prepare your material.
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            {/* Step 3 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                <Ionicons
                  name="car-outline"
                  size={15}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Out for Delivery
                </Text>

                <Text style={styles.timelineText}>
                  You'll be notified when your material
                  is dispatched.
                </Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            {/* Step 4 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                <Ionicons
                  name="home-outline"
                  size={15}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  Delivered
                </Text>

                <Text style={styles.timelineText}>
                  Confirm delivery after receiving the
                  material.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Buyer Protection */}
        <View style={styles.protectionCard}>
          <View style={styles.protectionIcon}>
            <Ionicons
              name="shield-checkmark"
              size={21}
              color="#2E9D5B"
            />
          </View>

          <View style={styles.protectionContent}>
            <Text style={styles.protectionTitle}>
              Your Order is Protected
            </Text>

            <Text style={styles.protectionText}>
              Payment protection remains active until
              your material is delivered and confirmed.
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
       

        <View style={styles.trackButtonWrapper}>
          <LinearGradient
            colors={[
              '#FF7A00',
              '#FF8F0A',
              '#FF9F1C',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.trackGradient}
          >
            <Pressable
              style={({ pressed }) => [
                styles.trackButton,
                pressed && styles.pressed,
              ]}
              onPress={() => {
                navigation.navigate('Buyer', {
                  screen: 'Orders',
                });
              }}
              
            >
              {/* <Ionicons
                name="navigate-outline"
                size={19}
                color="#FFFFFF"
              /> */}

              <Text style={styles.trackButtonText}>
               Done
              </Text>

              {/* <Ionicons
                name="arrow-forward"
                size={17}
                color="#FFFFFF"
              /> */}
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
};

export default OrderConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8EE',
  },

  header: {
    minHeight: 88,
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    // backgroundColor: '#FFF3D6',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  brandText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: '#FF7A00',
  },

  headerTitle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  headerSpacer: {
    width: 40,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },

  successSection: {
    alignItems: 'center',
  },

  successCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.22,
    shadowRadius: 13,
    elevation: 10,
  },

  done:{
    height:50,
    width:50,
    resizeMode:"contain"

  },
  successInnerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.18)',

    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },

  successTitle: {
    marginTop: 16,

    textAlign: 'center',

    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',

    color: '#0A0A0A',
  },

  successSubtitle: {
    marginTop: 6,
    maxWidth: 310,

    textAlign: 'center',

    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',

    color: '#8C8175',
  },

  orderIdCard: {
    width: '100%',
    marginTop: 17,

    padding: 13,
    paddingHorizontal: 15,

    borderRadius: 17,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  orderIdLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#9A8E82',
  },

  orderId: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
    color: '#0A0A0A',
  },

  copyButton: {
    height: 34,
    paddingHorizontal: 11,

    borderRadius: 11,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF3E5',
  },

  copyText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7A00',
  },

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    marginBottom: 9,

    fontSize: 14,
    fontWeight: '900',

    color: '#0A0A0A',
  },

  supplierCard: {
    padding: 14,

    borderRadius: 19,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  supplierAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF0DF',

    borderWidth: 1,
    borderColor: '#FFD5A8',
  },

  avatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FF7A00',
  },

  supplierInfo: {
    flex: 1,
    marginLeft: 11,
  },

  supplierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  supplierName: {
    flexShrink: 1,

    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',

    color: '#0A0A0A',
  },

  ratingRow: {
    marginTop: 4,

    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '800',
    color: '#665C51',
  },

  ratingDot: {
    marginHorizontal: 5,
    fontSize: 9,
    color: '#B8AA9C',
  },

  reviews: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8C8175',
  },

  locationRow: {
    marginTop: 4,

    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '600',
    color: '#8C8175',
  },

  verifiedBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 5,

    borderRadius: 9,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#EAF8EF',
  },

  verifiedText: {
    marginLeft: 3,
    fontSize: 8,
    fontWeight: '900',
    color: '#2E9D5B',
  },

  summaryCard: {
    padding: 15,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  summaryRow: {
    marginBottom: 14,

    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF3E5',
  },

  summaryContent: {
    flex: 1,
    marginLeft: 10,
  },

  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9A8E82',
  },

  summaryValue: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    color: '#332D27',
  },

  summaryDivider: {
    height: 1,
    marginTop: 0,
    marginBottom: 13,

    backgroundColor: '#F3E9DD',
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#332D27',
  },

  totalSubtext: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '500',
    color: '#9A8E82',
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF7A00',
  },

  timelineCard: {
    padding: 16,

    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  timelineItem: {
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  timelineIconActive: {
    width: 31,
    height: 31,
    borderRadius: 15.5,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FF7A00',
  },

  timelineIcon: {
    width: 31,
    height: 31,
    borderRadius: 15.5,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF3E5',

    borderWidth: 1,
    borderColor: '#FFD6AE',
  },

  timelineContent: {
    flex: 1,
    marginLeft: 11,
  },

  timelineTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#332D27',
  },

  timelineText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    color: '#8C8175',
  },

  timelineLineActive: {
    width: 1,
    height: 18,
    marginLeft: 15,

    backgroundColor: '#FF7A00',
  },

  timelineLine: {
    width: 1,
    height: 18,
    marginLeft: 15,

    backgroundColor: '#E8DCCF',
  },

  protectionCard: {
    marginTop: 20,
    padding: 13,

    borderRadius: 17,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#EFF9F2',

    borderWidth: 1,
    borderColor: '#D5EFDD',
  },

  protectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#DDF3E4',
  },

  protectionContent: {
    flex: 1,
    marginLeft: 10,
  },

  protectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#237A47',
  },

  protectionText: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '500',
    color: '#4E755D',
  },

  bottomSpace: {
    height: 105,
  },

  bottomBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    minHeight: 82,

    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFDF9',

    borderTopWidth: 1,
    borderTopColor: '#F1E2D0',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 10,
  },



  ordersButtonText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '900',
    color: '#FF7A00',
  },

  trackButtonWrapper: {
    flex: 1,
    marginLeft: 10,

    borderRadius: 15,

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.20,
    shadowRadius: 9,

    elevation: 7,
  },

  trackGradient: {
    height: 50,
    borderRadius: 15,
    overflow: 'hidden',
  },

  trackButton: {
    flex: 1,

    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  trackButtonText: {
    marginHorizontal: 8,

    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  pressed: {
    opacity: 0.75,
  },
});