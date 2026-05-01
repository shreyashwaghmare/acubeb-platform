import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <SafeAreaProvider>
          <MainLayout />
        </SafeAreaProvider>
      </AppProvider>
    </AuthProvider>
  );
}

function MainLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="login" />
        ) : (
          <>
            <Stack.Screen name="(tabs)" />

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
          </>
        )}
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}