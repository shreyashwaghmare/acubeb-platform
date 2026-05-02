exports.sendNotification = async (expoPushToken, message) => {
  try {
    if (!expoPushToken) return;

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title: "A Cube B Consultants",
        body: message,
      }),
    });

    const data = await response.json();
    console.log("Expo notification response:", data);
  } catch (error) {
    console.log("Notification error:", error);
  }
};