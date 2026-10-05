import { API_BASE_URL } from "../../../config/api";

export const registerFCMToken = async (
  token: string,
  authToken: string,
) => {
  try {
    if (!token) {
      console.log("⚠️ FCM token is empty");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications/device-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token,
          platform: "android", // Platform.OS bhi use kar sakte hain
          deviceName: "Android",
        }),
      },
    );

    const data = await response.json();

    console.log("📲 FCM REGISTER RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data?.message || "Failed to register FCM token",
      );
    }

    return data;
  } catch (error) {
    console.error("❌ FCM TOKEN REGISTER ERROR:", error);
    throw error;
  }
};