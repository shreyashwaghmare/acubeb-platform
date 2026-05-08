import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
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
  const { user, loading } = useAuth();
  const segments = useSegments();

  const isLoggedIn = !!user?.token;
  const currentRoute = segments[0];
  const isAuthScreen = currentRoute === "login";

  useEffect(() => {
    if (loading) return;

    if (!isLoggedIn && !isAuthScreen) {
      router.replace("/login");
      return;
    }

    if (isLoggedIn && isAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [loading, isLoggedIn, isAuthScreen]);

  useEffect(() => {
    const openFromNotification = (data: any) => {
      console.log("NOTIFICATION CLICK DATA:", data);

      if (data?.screen === "request-detail" && data?.requestId) {
        router.push({
          pathname: "/request-detail",
          params: {
            id: String(data.requestId),
          },
        });
        return;
      }

      if (data?.screen === "report-detail" && data?.reportId) {
        router.push({
          pathname: "/report-detail",
          params: {
            id: String(data.reportId),
          },
        });
      }
    };

    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        openFromNotification(data);
      }
    );

    Notifications.getLastNotificationResponseAsync().then((response) => {
      const data = response?.notification.request.content.data;
      if (data) {
        openFromNotification(data);
      }
    });

    return () => sub.remove();
  }, []);

  if (loading) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
          contentStyle: { backgroundColor: "#080808" },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="apply-service" />
        <Stack.Screen name="request-detail" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="report-detail" />
      </Stack>

      <StatusBar style="light" />
    </ThemeProvider>
  );
}