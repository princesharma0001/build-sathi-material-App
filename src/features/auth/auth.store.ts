import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@buildsathi_token";
const USER_KEY = "@buildsathi_user";

export type UserRole = "buyer" | "seller" | "contractor" | "admin";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "SELLER" | "CONTRACTOR" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
}

interface AuthState {
  activeRole: UserRole | null;
  user: StoredUser | null;
  token: string | null;

  setActiveRole: (role: UserRole) => void;
  setUser: (user: StoredUser) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  activeRole: null,
  user: null,
  token: null,

  setActiveRole: (role: UserRole) => {
    set({
      activeRole: role,
    });
  },

  setUser: (user: StoredUser) => {
    set({
      user,
    });
  },

  setToken: (token: string) => {
    set({
      token,
    });
  },

  logout: async () => {
    console.log("🔐 Clearing BuildSathi auth session...");

    try {
      // Clear all persisted authentication data
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);

      // Clear Zustand state
      set({
        activeRole: null,
        user: null,
        token: null,
      });

      console.log("✅ BuildSathi auth session cleared");
    } catch (error) {
      console.error("❌ Failed to clear auth session:", error);

      throw error;
    }
  },
}));

// =========================
// TOKEN
// =========================

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

// =========================
// USER
// =========================

export const saveUser = async (user: StoredUser) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async (): Promise<StoredUser | null> => {
  const user = await AsyncStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

// =========================
// AUTH SESSION
// =========================

export const saveAuthSession = async (token: string, user: StoredUser) => {
  await Promise.all([saveToken(token), saveUser(user)]);

  // Update Zustand
  useAuthStore.getState().setToken(token);
  useAuthStore.getState().setUser(user);

  const roleMap: Record<StoredUser["role"], UserRole> = {
    BUYER: "buyer",
    SELLER: "seller",
    CONTRACTOR: "contractor",
    ADMIN: "admin",
  };

  useAuthStore.getState().setActiveRole(roleMap[user.role]);
};

// =========================
// CLEAR SESSION
// =========================

export const clearAuthSession2 = async () => {
  console.log("🚪 LOGOUT START");

  try {
    // Token delete
    await AsyncStorage.removeItem(TOKEN_KEY);

    // User data delete
    await AsyncStorage.removeItem(USER_KEY);

    console.log("✅ TOKEN CLEARED");
    console.log("✅ USER DATA CLEARED");

    // Verify
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const user = await AsyncStorage.getItem(USER_KEY);

    console.log("TOKEN AFTER LOGOUT:", token);
    console.log("USER AFTER LOGOUT:", user);
  } catch (error) {
    console.log("❌ CLEAR STORAGE ERROR:", error);
    throw error;
  }
};

export const clearAuthSession = async () => {
  console.log("🚪 Logout started");

  await useAuthStore.getState().logout();

  console.log("🚪 Logout completed");
};
// =========================
// LOGIN CHECK
// =========================

export const isLoggedIn = async (): Promise<boolean> => {
  const token = await getToken();

  return !!token;
};
