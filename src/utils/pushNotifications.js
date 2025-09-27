// src/utils/pushNotifications.js

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

export async function subscribeUser() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (subscription === null) {
        // User is not subscribed, create a new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log("User subscribed:", subscription);
      } else {
        console.log("User is already subscribed:", subscription);
      }
      
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe the user: ", error);
      throw error;
    }
  } else {
    throw new Error('Service workers or Push messaging not supported');
  }
}

// Helper function to save subscription to backend
export async function saveSubscriptionToBackend(subscription, userName) {
  try {
    const response = await fetch('/api/save-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}` // Adjust based on your auth system
      },
      body: JSON.stringify({
        subscription: subscription,
        userName: userName
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }

    const result = await response.json();
    console.log('Subscription saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
}