import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
const USER_KEY = "ACUBEB_USER";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
  try {
    const savedUser = await AsyncStorage.getItem(USER_KEY);

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);

      if (parsedUser?.token) {
        setUser(parsedUser);
      } else {
        await AsyncStorage.removeItem(USER_KEY);
        await AsyncStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  } catch (error) {
    console.log("Restore session error:", error);
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
    setUser(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (mobile: string, token: string, name = "Client") => {
    const loggedInUser: User = {
      name,
      mobile,
      token,
    };

    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));

    setUser(loggedInUser);
  };

  const logout = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
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

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}