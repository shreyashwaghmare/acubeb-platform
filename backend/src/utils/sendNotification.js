const fetch = require("node-fetch");

exports.sendNotification = async (expoPushToken, message) => {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        title: "A Cube B Consultants",
        body: message,
      }),
    });
  } catch (e) {
    console.log("Notification error:", e);
  }
};