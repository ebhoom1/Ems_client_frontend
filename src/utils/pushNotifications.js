import { API_URL } from "./apiConfig";

const VAPID_PUBLIC_KEY = "BKjIcWecFbfkpOTxHF0AfPz83AqhbJXBvRttuR3YMtyNr_uHdI_2Q8tCEl9EsCnmv3sz2w6PebtR-7OqlnfJtgQ";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Subscribe user for push
export async function subscribeUser() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (subscription === null) {
        // User is not subscribed, create a new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log("✅ New subscription created:", subscription);
      } else {
        console.log("ℹ️ User already subscribed:", subscription);
      }

      return subscription;
    } catch (error) {
      console.error("❌ Failed to subscribe the user:", error);
      throw error;
    }
  } else {
    throw new Error("Service workers or Push messaging not supported");
  }
}

// Save subscription to backend
export async function saveSubscriptionToBackend(subscription, userName) {
  try {
    const token =
      localStorage.getItem("userdatatoken") ||
      sessionStorage.getItem("userdatatoken") ||
      document.cookie.match(/userdatatoken=([^;]+)/)?.[1];
    console.log("Token being sent to backend:", token);
    const response = await fetch(`${API_URL}/api/save-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      // body: JSON.stringify({
      //   subscription,
      //   userName,   // ✅ include this
      // }),
      body: JSON.stringify({
        subscription: subscription.toJSON(), // safer
        userName,
      }),

    });

    if (!response.ok) {
      throw new Error(`Failed to save subscription: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Subscription saved successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Error saving subscription:", error);
    throw error;
  }
}
