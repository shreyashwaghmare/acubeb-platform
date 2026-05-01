import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";

/* ===================== TYPES ===================== */

type RequestItem = {
  id: string;
  requestNo: string;
  service: string;
  project: string;
  site: string;
  status: string;
  date: string;
  timeline: string[];
};

type ClientType = {
  name: string;
  mobile: string;
  email?: string;
  gst?: string;
  address?: string;
};

type AppContextType = {
  requests: RequestItem[];
  addRequest: () => void;
  refreshRequests: () => Promise<void>;

  client: ClientType;
  updateClient: (data: Partial<ClientType>) => void;
};

/* ===================== CONTEXT ===================== */

const AppContext = createContext<AppContextType | null>(null);

/* ===================== PROVIDER ===================== */

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [requests, setRequests] = useState<RequestItem[]>([]);

  const [client, setClient] = useState<ClientType>({
    name: "Client",
    mobile: "",
  });

  const refreshRequests = async () => {
    if (!user?.token) return;

    try {
      const res = await api.getRequests(user.token);

      if (res.success && Array.isArray(res.data)) {
        const formatted = res.data.map((item: any) => ({
          id: item.id,
          requestNo: item.request_no,
          service: item.service,
          project: item.project,
          site: item.site,
          status: item.status,
          date: item.created_at?.split("T")[0],
          timeline: ["Request Submitted"],
        }));

        setRequests(formatted);
      }
    } catch (error) {
      console.log("Refresh requests error:", error);
    }
  };

  useEffect(() => {
    refreshRequests();
  }, [user]);

  useEffect(() => {
    if (!user?.token) return;

    api.getProfile(user.token).then((res) => {
      if (res.success) {
        setClient(res.data);
      }
    });
  }, [user]);

  const addRequest = () => {
    // Backend-driven now
  };

  const updateClient = (data: Partial<ClientType>) => {
    setClient((prev) => ({
      ...prev,
      ...data,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        requests,
        addRequest,
        refreshRequests,
        client,
        updateClient,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* ===================== HOOK ===================== */

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}