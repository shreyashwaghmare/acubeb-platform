exports.sendNotification = async (
  expoPushToken,
  message,
  options = {}
) => {
  try {
    if (!expoPushToken) {
      console.log("❌ Missing Expo Push Token");
      return null;
    }

    const {
      title = "A Cube B Consultants",
      screen = "request-detail",
      requestId = null,
      reportId = null,
    } = options;

    const payload = {
      to: expoPushToken,
      sound: "default",
      title,
      body: message,
      data: {
        screen,
        requestId,
        reportId,
      },
    };

    console.log("📤 Sending Notification:", payload);

    const response = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("✅ Expo Notification Response:", data);

    return data;
  } catch (error) {
    console.log("🔥 Notification Error:", error);
    return null;
  }
};