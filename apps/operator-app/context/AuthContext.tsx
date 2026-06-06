import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

type UserType = {
  uid: string;
  mobile: string;
  token: string;
  role: "operator" | "admin";
  name?: string;
  email?: string;
};

type AuthContextType = {
  user: UserType | null;
  login: (
  token: string,
  mobile: string,
  uid: string,
  name?: string,
  email?: string
) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AUTH_KEY = "ACB_OPERATOR_SESSION_FIREBASE";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const saved = await SecureStore.getItemAsync(AUTH_KEY);

        if (saved) {
          const parsed: UserType = JSON.parse(saved);
          setUser(parsed);
        }
      } catch (e) {
        console.error("Session restoration failed", e);
        await SecureStore.deleteItemAsync(AUTH_KEY);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (
  token: string,
  mobile: string,
  uid: string,
  name?: string,
  email?: string
) => {
const operatorSession: UserType = {
  uid,
  mobile,
  token,
  role: "operator",
  name,
  email,
};

    setUser(operatorSession);
    await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(operatorSession));
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}