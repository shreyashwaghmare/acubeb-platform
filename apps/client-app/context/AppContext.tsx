import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";

export type RequestItem = {
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
  refreshClient: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [client, setClient] = useState<ClientType>({
    name: "Client",
    mobile: "",
  });

  const refreshClient = useCallback(async () => {
    try {
      if (!user?.token) {
        setClient({ name: "Client", mobile: "" });
        return;
      }

      const res = await api.getProfile(user.token);
      console.log("GET REQUESTS RESPONSE:", res);
      if (res?.success && res?.data) {
        setClient({
          name: res.data.name || "Client",
          mobile: res.data.mobile || "",
          email: res.data.email || "",
          gst: res.data.gst || "",
          address: res.data.address || "",
        });
      }
    } catch (error) {
      console.log("REFRESH CLIENT ERROR:", error);
    }
  }, [user?.token]);

  const refreshRequests = useCallback(async () => {
    try {
      if (!user?.token) {
        setRequests([]);
        return;
      }

      const res = await api.getRequests(user.token);

      if (res?.success && Array.isArray(res.data)) {
        const formatted: RequestItem[] = res.data.map((item: any) => ({
          id: String(item?.id || ""),
          requestNo: String(item?.requestNo || item?.request_no || "ACB-REQ"),
          service: String(item?.service || "Service Request"),
          project: String(item?.project || "Unnamed Project"),
          site: String(item?.site || "Pending Update"),
          status: String(item?.status || "NEW_REQUEST"),
          date: String(
            item?.date
              ? String(item.date).split("T")[0]
              : item?.created_at
              ? String(item.created_at).split("T")[0]
              : new Date().toISOString().split("T")[0]
          ),
          timeline: ["Request Submitted"],
        }));

        setRequests(formatted);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.log("REFRESH REQUESTS ERROR:", error);
      setRequests([]);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) {
      refreshClient();
      refreshRequests();
    } else {
      setClient({ name: "Client", mobile: "" });
      setRequests([]);
    }
  }, [user?.token, refreshClient, refreshRequests]);

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
        refreshClient,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}