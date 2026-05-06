import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotifications() {
  try {
    console.log("📲 Registering for push notifications...");

    if (!Device.isDevice) {
      console.log("❌ Not a physical device");
      return null;
    }

    // 🔐 Check permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    console.log("🔐 Existing permission:", existingStatus);

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("🔐 Requested permission:", status);
    }

    if (finalStatus !== "granted") {
      console.log("❌ Permission denied");
      return null;
    }

    // 🔥 ANDROID CHANNEL (REQUIRED)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
      console.log("📢 Android channel set");
    }

    // 🔥 GET PROJECT ID (IMPORTANT)
    // 🔥 GET PROJECT ID (STRICT SDK 54 WAY)
    const projectId = "b9f4efd4-168a-4803-bce0-52731da57b3e"; // Explicitly paste your ID from the build page

    console.log("📦 Using Project ID:", projectId);

    if (!projectId) {
      console.log("❌ Missing projectId");
      return null;
    }

    // 🔥 GET TOKEN
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log("📲 Expo Token Object:", tokenData);

    const token = tokenData.data;

    console.log("✅ Final Push Token:", token);

    return token;
  } catch (error: unknown) {
  // 1. Check if it's a standard Error object
  if (error instanceof Error) {
  } 
  // 2. Fallback for weird errors (like strings)
  
  console.log("🔥 Push registration error:", error);
  return null;
}
}