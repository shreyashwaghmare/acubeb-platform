import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";
import { PremiumToastProvider } from "../components/PremiumToast";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <PremiumToastProvider>
          <SafeAreaProvider>
            <MainLayout />
          </SafeAreaProvider>
        </PremiumToastProvider>
      </AppProvider>
    </AuthProvider>
  );
}

function MainLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const segments = useSegments();

  const isLoggedIn = !!user?.token;
  const currentRoute = segments[0];

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn && currentRoute !== "login") {
      router.replace("/login");
    }

    if (isLoggedIn && currentRoute === "login") {
      router.replace("/(tabs)");
    }
  }, [loading, isLoggedIn, currentRoute]);
  
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.screen === "report-detail" && data?.reportId) {
          router.push(`/report-detail?id=${data.reportId}`);
        }
      }
    );
    return () => sub.remove();
  }, []);

  if (loading) return null;

  return (
    <ThemeProvider value={DarkTheme}> 
      {/* FORCE DarkTheme for the 'Dubai' look. 
        Standard grey system headers look cheap; 
        OLED black is luxury.
      */}
      <Stack
        screenOptions={{
          headerShown: false, // THIS REMOVES THE TOP NAMES (Home, Requests, etc.)
          animation: "fade_from_bottom", // Premium transition
          contentStyle: { backgroundColor: "#080808" } // Unified background
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* We set headerShown: false for ALL of these because 
          we built custom Gold headers inside the actual files.
        */}
        <Stack.Screen name="apply-service" />
        <Stack.Screen name="request-detail" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="report-detail" />
      </Stack>

      <StatusBar style="light" /> 
    </ThemeProvider>
  );
}