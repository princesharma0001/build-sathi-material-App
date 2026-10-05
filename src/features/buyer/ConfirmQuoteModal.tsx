import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  StyleSheet as RNStyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// import Ionicons from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { BlurView } from '@react-native-community/blur';

interface Quote {
  supplier?: string;
  supplierName?: string;
  material?: string;
  quantity?: string;
  price?: number;
  totalPrice?: number;
  delivery?: string;
  location?: string;
  rating?: number;
  reviews?: number;
  verified?: boolean;
}

interface ConfirmQuoteModalProps {
  visible: boolean;
  quote: Quote | null;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmQuoteModal = ({
  visible,
  quote,
  onClose,
  onConfirm,
}: ConfirmQuoteModalProps) => {
  if (!quote) {
    return null;
  }

  const supplierName =
    quote.supplierName || quote.supplier || 'Verified Supplier';

  const material = quote.material || 'Construction Material';

  const price = quote.totalPrice || quote.price || 0;

  const delivery = quote.delivery || '2–3 Days';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Background Blur */}
        <BlurView
          style={RNStyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.55)"
        />

        {/* Extra dark layer for premium look */}
        <View style={styles.darkOverlay} />

        {/* Close when tapping outside */}
        <Pressable
          style={styles.backdropPressable}
          onPress={onClose}
        />

        {/* Bottom Sheet */}
        <View style={styles.modalContainer}>
          {/* Drag Handle */}
          <View style={styles.handle} />

          {/* Top Icon */}
          <View style={styles.iconCircle}>
            <Ionicons
              name="checkmark"
              size={27}
              color="#FFFFFF"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Accept this Quote?
          </Text>

          <Text style={styles.subtitle}>
            You're about to place an order with this supplier.
          </Text>

          {/* Quote Summary */}
          <View style={styles.quoteCard}>
            {/* Supplier Row */}
            <View style={styles.supplierRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {supplierName
                    .split(' ')
                    .map(word => word.charAt(0))
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

                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#2E9D5B"
                    />
                  </View>
                </View>

                <View style={styles.supplierMeta}>
                  <Ionicons
                    name="star"
                    size={12}
                    color="#D4A017"
                  />

                  <Text style={styles.ratingText}>
                    {quote.rating || 4.8}
                  </Text>

                  <Text style={styles.dot}>•</Text>

                  <Text style={styles.reviewText}>
                    {quote.reviews || 126} reviews
                  </Text>
                </View>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Material */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="cube-outline"
                  size={17}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  Material
                </Text>

                <Text
                  style={styles.detailValue}
                  numberOfLines={2}
                >
                  {material}
                  {quote.quantity
                    ? ` • ${quote.quantity}`
                    : ''}
                </Text>
              </View>
            </View>

            {/* Delivery */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="time-outline"
                  size={17}
                  color="#FF7A00"
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  Delivery
                </Text>

                <Text style={styles.detailValue}>
                  {delivery}
                  {quote.location
                    ? ` • ${quote.location}`
                    : ''}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>
                  Total Quote
                </Text>

                <Text style={styles.price}>
                  {price.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.priceIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={22}
                  color="#FF7A00"
                />
              </View>
            </View>
          </View>

          {/* Protection */}
          <View style={styles.protectionCard}>
            <View style={styles.protectionIcon}>
              <Ionicons
                name="shield-checkmark"
                size={19}
                color="#2E9D5B"
              />
            </View>

            <View style={styles.protectionContent}>
              <Text style={styles.protectionTitle}>
                Buyer Protection
              </Text>

              <Text style={styles.protectionText}>
                Your payment is protected until delivery.
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>

            <View style={styles.confirmButtonWrapper}>
              <LinearGradient
                colors={[
                  '#FF7A00',
                  '#FF8F0A',
                  '#FF9F1C',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmButtonGradient}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.confirmButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={onConfirm}
                >
                  <Text style={styles.confirmButtonText}>
                    Confirm Quote
                  </Text>

                  <Ionicons
                    name="checkmark-circle-outline"
                    size={19}
                    color="#FFFFFF"
                  />
                </Pressable>
              </LinearGradient>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmQuoteModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
  },

  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },

  modalContainer: {
    zIndex: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    backgroundColor: '#FFFDF9',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 15,

    elevation: 20,
  },

  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#E4D8CA',
    marginBottom: 18,
  },

  iconCircle: {
    alignSelf: 'center',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FF7A00',

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9,
    elevation: 8,
  },

  title: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  subtitle: {
    marginTop: 6,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    color: '#8C8175',
  },

  quoteCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 20,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#F1E2D0',
  },

  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,

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
    marginLeft: 12,
  },

  supplierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  supplierName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  verifiedBadge: {
    marginLeft: 6,
  },

  supplierMeta: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#665C51',
  },

  dot: {
    marginHorizontal: 6,
    fontSize: 10,
    color: '#B8AA9C',
  },

  reviewText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8C8175',
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: '#F3E9DD',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF3E5',
  },

  detailContent: {
    flex: 1,
    marginLeft: 10,
  },

  detailLabel: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    color: '#9A8E82',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  detailValue: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    color: '#332D27',
  },

  priceRow: {
    marginTop: 3,
    paddingTop: 13,

    borderTopWidth: 1,
    borderTopColor: '#F3E9DD',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C8175',
  },

  price: {
    marginTop: 2,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
    color: '#0A0A0A',
  },

  priceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF3E5',
  },

  protectionCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#EFF9F2',
    borderWidth: 1,
    borderColor: '#D5EFDD',
  },

  protectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,

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

  buttonRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cancelButton: {
    width: 90,
    height: 52,
    borderRadius: 16,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFF4E8',
    borderWidth: 1,
    borderColor: '#FFD8B2',
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8C8175',
  },

  confirmButtonWrapper: {
    flex: 1,
    marginLeft: 10,

    borderRadius: 16,

    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.20,
    shadowRadius: 9,
    elevation: 7,
  },

  confirmButtonGradient: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },

  confirmButton: {
    flex: 1,

    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmButtonText: {
    marginRight: 8,
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  buttonPressed: {
    opacity: 0.75,
  },
});