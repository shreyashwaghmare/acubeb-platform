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

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="apply-service"
          options={{
            headerShown: true,
            title: "Apply Service",
            headerStyle: { backgroundColor: "#0B0B0B" },
            headerTintColor: "#D4AF37",
          }}
        />

        <Stack.Screen
          name="request-detail"
          options={{
            headerShown: true,
            title: "Request Details",
            headerStyle: { backgroundColor: "#0B0B0B" },
            headerTintColor: "#D4AF37",
          }}
        />

        <Stack.Screen
          name="edit-profile"
          options={{
            headerShown: true,
            title: "Edit Profile",
            headerStyle: { backgroundColor: "#0B0B0B" },
            headerTintColor: "#D4AF37",
          }}
        />

        <Stack.Screen
          name="report-detail"
          options={{
            headerShown: true,
            title: "Report Details",
            headerStyle: { backgroundColor: "#0B0B0B" },
            headerTintColor: "#D4AF37",
          }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}