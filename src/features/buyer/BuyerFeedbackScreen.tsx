
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { createFeedbackApi } from './feedback.api';
import { SafeAreaView } from 'react-native-safe-area-context';


type Props = {
  navigation: any;
  route: {
    params: {
      orderId: string;
    };
  };
};

const BuyerFeedbackScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const { orderId } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!orderId) {
      Alert.alert('Error', 'Order ID is missing.');
      return;
    }

    if (rating < 1 || rating > 5) {
      Alert.alert(
        'Rating Required',
        'Please select a rating from 1 to 5 stars.',
      );
      return;
    }

    try {
      setSubmitting(true);

      await createFeedbackApi({
        orderId,
        rating,
        comment: comment.trim() || undefined,
      });

      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      const status = error?.response?.status;
console.log("dgsfgs",status);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to submit feedback. Please try again.';

      if (
        error?.message === 'SESSION_EXPIRED' ||
        status === 401
      ) {
        Alert.alert(
          'Session Expired',
          'Please log in again to submit feedback.',
        );
        return;
      }

      Alert.alert('Feedback Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#000"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Rate Your Experience
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={36}
              color="#F97316"
            />
          </View>

          <Text style={styles.title}>
            How was your experience?
          </Text>

          <Text style={styles.subtitle}>
            Your feedback helps NeevSathi improve the
            buying experience.
          </Text>

          <View style={styles.ratingContainer}>
            {([1, 2, 3, 4, 5] as const).map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                disabled={submitting}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${star} star rating`}
                style={styles.starButton}
              >
                <Ionicons
                  name={
                    star <= rating
                      ? 'star'
                      : 'star-outline'
                  }
                  size={38}
                  color={
                    star <= rating ? '#F59E0B' : '#D1D5DB'
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingLabel}>
            {rating > 0
              ? ratingLabels[rating]
              : 'Tap a star to rate'}
          </Text>

          <Text style={styles.inputLabel}>
            Share your feedback (optional)
          </Text>

          <TextInput
            style={styles.commentInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            editable={!submitting}
          />

          <Text style={styles.characterCount}>
            {comment.length}/1000
          </Text>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (submitting || rating === 0) &&
                styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={submitting || rating === 0}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>
                Submit Feedback
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Thank you for helping build a better NeevSathi.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BuyerFeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 60,
    // backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 14,
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#F1E2D0",
  },
  headerTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 22,
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 26,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  ratingLabel: {
    color: '#F97316',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 30,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  commentInput: {
    width: '100%',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 14,
    fontSize: 14,
    color: '#111827',
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 7,
  },
  submitButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#F97316',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 18,
  },
});
