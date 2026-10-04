import { create } from "zustand";
import { getSellerProfileApi, SellerProfile } from "./seller.api";

interface SellerStore {
  seller: SellerProfile | null;
  loading: boolean;
  error: string | null;

  fetchSellerProfile: () => Promise<SellerProfile | null>;
  clearSellerProfile: () => void;
}

export const useSellerStore = create<SellerStore>((set) => ({
  seller: null,
  loading: false,
  error: null,

  fetchSellerProfile: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const profile = await getSellerProfileApi();

      console.log("SELLER PROFILE STORE:", profile);

      set({
        seller: profile,
        loading: false,
        error: null,
      });

      return profile;
    } catch (error: any) {
      console.log(
        "GET SELLER PROFILE STORE ERROR:",
        error?.response?.data || error?.message
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load seller profile.";

      set({
        loading: false,
        error: message,
      });

      return null;
    }
  },

  clearSellerProfile: () => {
    set({
      seller: null,
      loading: false,
      error: null,
    });
  },
}));

