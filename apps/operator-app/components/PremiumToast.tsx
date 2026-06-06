import React, { createContext, useContext, useState, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function PremiumToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  }, []);

  // 🌟 BYPASS FORMATTER: Using createElement guarantees no stray spaces can be injected into the JSX tree
  const providerElement = React.createElement(
    ToastContext.Provider,
    { value: { showToast } },
    children
  );

  return (
    <View style={styles.rootWrapper}>
      {providerElement}
      {toast && (
        <Animated.View entering={FadeInUp.springify().damping(15)} exiting={FadeOutUp.duration(200)} style={[styles.toastCard, { backgroundColor: getBgColor(toast.type) }]}><Ionicons name={getIcon(toast.type)} size={16} color={getIconColor(toast.type)} /><Text style={styles.toastText}>{toast.message}</Text></Animated.View>
      )}
    </View>
  );
}

export function usePremiumToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: (msg: string) => console.log("Fallback Toast View:", msg) };
  }
  return context;
}

function getBgColor(type: ToastType) {
  if (type === 'success') return '#0E1611';
  if (type === 'error') return '#1A0F10';
  return '#0F131A';
}

function getIcon(type: ToastType): any {
  if (type === 'success') return 'checkmark-circle';
  if (type === 'error') return 'alert-circle';
  return 'information-circle';
}

function getIconColor(type: ToastType) {
  if (type === 'success') return '#4CAF50';
  if (type === 'error') return '#F44336';
  return '#2196F3';
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  toastCard: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5
  },
  toastText: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 }
});