import { Tabs } from "expo-router";
import { Home, PlusCircle, ClipboardList, FileText, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0B0B0B" },
        headerTintColor: "#D4AF37",
        tabBarStyle: { backgroundColor: "#0B0B0B", borderTopColor: "#222", height: 70, paddingBottom: 10, },
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="services" options={{ title: "Services", tabBarIcon: ({ color }) => <PlusCircle color={color} size={22} /> }} />
      <Tabs.Screen name="requests" options={{ title: "Requests", tabBarIcon: ({ color }) => <ClipboardList color={color} size={22} /> }} />
      <Tabs.Screen name="reports" options={{ title: "Reports", tabBarIcon: ({ color }) => <FileText color={color} size={22} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color }) => <User color={color} size={22} /> }} />
    </Tabs>
  );
}