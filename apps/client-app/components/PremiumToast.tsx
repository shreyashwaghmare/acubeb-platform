import React, { createContext, useContext, useState } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";

type ToastType = "success" | "error" | "info";

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function PremiumToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <Animated.View
          entering={FadeInDown.duration(250)}
          exiting={FadeOutUp.duration(250)}
          style={[
            styles.toast,
            toast.type === "success" && styles.success,
            toast.type === "error" && styles.error,
          ]}
        >
          <Text style={styles.title}>
            {toast.type === "success" ? "Success" : toast.type === "error" ? "Attention" : "A Cube B"}
          </Text>
          <Text style={styles.message}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function usePremiumToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("usePremiumToast must be used inside PremiumToastProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 55,
    backgroundColor: "#151515",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D4AF37",
    zIndex: 9999,
    elevation: 20,
  },
  success: {
    borderColor: "#4CAF50",
  },
  error: {
    borderColor: "#FF5252",
  },
  title: {
    color: "#D4AF37",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
    letterSpacing: 1,
  },
  message: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
});