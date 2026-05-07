import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

type User = {
  name: string;
  mobile: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (mobile: string, token: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);
const TOKEN_KEY = "ACUBEB_TOKEN";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        setUser(null);
        return;
      }

      const res = await api.getProfile(token);

      if (res.success && res.data) {
        setUser({
          token,
          mobile: res.data.mobile || "",
          name: res.data.name || "Client",
        });
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    } catch (error) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (mobile: string, token: string, name = "Client") => {
    console.log("JWT TOKEN:", token);
    console.log("🔐 LOGIN STARTED");
    

    try {
      // 1. Save Token to Storage
      await AsyncStorage.setItem(TOKEN_KEY, token);

      // 2. Update User State (This is what updates the UI)
      const userData = { mobile, token, name };
      setUser(userData);

      // 3. Handle Push Notifications (Silent background process)
      try {
        const { registerForPushNotifications } = await import("../services/notifications");
        const pushToken = await registerForPushNotifications();

        if (pushToken) {
          await api.savePushToken(token, pushToken);
          console.log("✅ Push token saved successfully");
        }
      } catch (pushError) {
        // We log it but DON'T alert, so the user can still use the app
        console.log("⚠️ Push registration skipped:", pushError);
      }

      console.log("✅ LOGIN SUCCESSFUL");
    } catch (e) {
      console.error("🔥 Critical Login Error:", e);
      // Re-throw so the Login screen's 'Something went wrong' shows only on REAL failures
      throw e; 
    }
  };
  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}