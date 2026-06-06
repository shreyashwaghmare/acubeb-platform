import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";

export type OperatorTaskItem = {
  id: string;
  requestNo: string;
  service: string;
  project: string;
  site: string;
  status: string;
  date: string;

  contact_person?: string;
  sample_qty?: string;

  site_latitude?: number;
  site_longitude?: number;
};

type AppContextType = {
  tasks: OperatorTaskItem[];
  refreshTasks: () => Promise<void>;
  loadingTasks: boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<OperatorTaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const refreshTasks = useCallback(async () => {
   if (!user?.token) {
  setTasks([]);
  return;
}

const activeToken = user.token;

    try {
      setLoadingTasks(true);
      const res = await api.getOperatorTasks(activeToken);
      
      if (res?.success && Array.isArray(res.data)){
        const formatted: OperatorTaskItem[] = res.data.map((item: any) => {
          let displayDate = new Date().toISOString().split("T")[0];
          const rawDate = item?.created_at || item?.date;
          if (rawDate && typeof rawDate === "string" && rawDate.includes("T")) {
            displayDate = rawDate.split("T")[0];
          } else if (rawDate && typeof rawDate === "string") {
            displayDate = rawDate;
          }

          return {
  id: String(item?.id || Math.random().toString()),
  requestNo: String(item?.requestNo || item?.request_no || ""),
  service: String(item?.service || ""),
  project: String(item?.project || ""),
  site: String(item?.site || ""),
  status: String(item?.status || ""),
  date: displayDate,

  site_latitude: item?.site_latitude
    ? Number(item.site_latitude)
    : undefined,

  site_longitude: item?.site_longitude
    ? Number(item.site_longitude)
    : undefined,

  contact_person: item?.contact_person,
  sample_qty: item?.sample_qty,
};
        });
        
        console.log(`✅ [AppProvider] State Synchronized: ${formatted.length} live tasks parsed successfully.`);
        setTasks(formatted);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("❌ Exception caught inside refreshTasks loop:", error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [user?.token]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshTasks();
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshTasks]);

  return (
    <AppContext.Provider value={{ tasks, refreshTasks, loadingTasks }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
}