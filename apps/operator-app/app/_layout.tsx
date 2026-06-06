import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { PremiumToastProvider } from '../components/PremiumToast';

export const unstable_settings = {
  anchor: '(tabs)',
};

function NavigationRoot() {
  const colorScheme = useColorScheme();
  
  // Track whether the hardware UI container has finished painting on screen
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // Separate layout hook handler logic to execute safety checks cleanly
  const { user, loading } = useAuth();

useEffect(() => {
  if (loading) return;

  if (isLayoutReady && !user?.token) {
    router.replace("/auth");
  }

  if (isLayoutReady && user?.token) {
    router.replace("/(tabs)");
  }
}, [user?.token, loading, isLayoutReady]);

  // Fired instantly when the underlying native container component mounts completely
  const handleOnLayoutContainer = useCallback(() => {
    setIsLayoutReady(true);
  }, []);

  return (
    <View style={styles.appContainerGate} onLayout={handleOnLayoutContainer}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="task-detail" options={{ presentation: 'card' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <PremiumToastProvider>
          <NavigationRoot />
        </PremiumToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainerGate: {
    flex: 1,
    backgroundColor: '#080808',
  },
});