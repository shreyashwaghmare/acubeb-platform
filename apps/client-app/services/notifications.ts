import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    alert("Use real device for notifications");
    return null;
  }

  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== "granted") {
    alert("Permission denied");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();

  return tokenData.data;
}