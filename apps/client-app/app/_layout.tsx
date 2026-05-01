import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "../context/AuthContext";
import { AppProvider } from "../context/AppContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

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
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {!user ? (
          <Stack.Screen name="login" options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
              name="apply-service"
              options={{
                title: "Apply Service",
                headerStyle: { backgroundColor: "#0B0B0B" },
                headerTintColor: "#D4AF37",
              }}
            />

            <Stack.Screen
              name="request-detail"
              options={{
                title: "Request Details",
                headerStyle: { backgroundColor: "#0B0B0B" },
                headerTintColor: "#D4AF37",
              }}
            />
            <Stack.Screen
  name="edit-profile"
  options={{
    title: "Edit Profile",
    headerStyle: { backgroundColor: "#0B0B0B" },
    headerTintColor: "#D4AF37",
  }}
/>

            <Stack.Screen
              name="report-detail"
              options={{
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