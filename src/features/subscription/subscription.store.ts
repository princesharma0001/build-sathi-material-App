import { create } from "zustand";
import { getMySubscription } from "./subscriptionApi";

interface ActiveSubscription {
  id: string;
  plan: {
    id: string;
    code: string;
    name: string;
  };
  state: "ACTIVE" | "EXPIRED" | "EXHAUSTED" | "CANCELLED";
  source: "PURCHASE" | "ADMIN_GRANT";
  quotationsTotal: number;
  quotationsRemaining: number;
  hasTrustedBadge: boolean;
  startsAt: string;
  expiresAt: string | null;
}

interface MySubscriptionResponse {
  activeSubscriptions: ActiveSubscription[];
  paidQuotationsRemaining: number;
  totalQuotationsRemaining: number;
  canSendQuotation: boolean;
  isTrustedSeller: boolean;
}

interface SubscriptionStore {
  subscription: MySubscriptionResponse | null;
  loading: boolean;
  error: string | null;

  fetchSubscription: () => Promise<void>;

  getActiveSubscription: () => ActiveSubscription | null;

  isPlanActive: (planId: string) => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscription: null,
  loading: false,
  error: null,

  fetchSubscription: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const result = await getMySubscription();

      console.log(
        "ZUSTAND SUBSCRIPTION RESPONSE:",
        JSON.stringify(result, null, 2)
      );

      const data = result?.data;

      set({
        subscription: data ?? null,
        loading: false,
      });
    } catch (error: any) {
      console.log(
        "ZUSTAND SUBSCRIPTION ERROR:",
        error?.message || error
      );

      set({
        subscription: null,
        loading: false,
        error: error?.message || "Failed to fetch subscription",
      });
    }
  },

  getActiveSubscription: () => {
    const subscription = get().subscription;

    if (!subscription?.activeSubscriptions?.length) {
      return null;
    }

    return (
      subscription.activeSubscriptions.find(
        sub => sub.state === "ACTIVE"
      ) ?? null
    );
  },

  isPlanActive: (planId: string) => {
    const subscription = get().subscription;

    if (!subscription?.activeSubscriptions?.length) {
      return false;
    }

    const activeSubscription =
      subscription.activeSubscriptions.find(
        sub => sub.state === "ACTIVE"
      );

    return activeSubscription?.plan?.id === planId;
  },
}));