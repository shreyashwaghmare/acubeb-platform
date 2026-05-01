import React, { createContext, useContext, useState } from "react";
import { api } from "../services/api";

type User = {
  name: string;
  mobile: string;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  login: (mobile: string, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (mobile: string, token: string) => {
  setUser({
    name: "Client",
    mobile,
    token,
  });
};

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}