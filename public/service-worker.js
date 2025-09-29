// service-worker.js

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error("[Service Worker] Invalid push data:", e);
  }

  const title = data.title || "Fuel Alert";
  const body = data.body || "Diesel level is low. Please check.";

  const options = {
    body,
    icon: "/icons/company-logo.png",
    badge: "/icons/fault-icon.png",
    vibrate: [200, 100, 200],
  };

  // Add .then() and .catch() to see the result
  const notificationPromise = self.registration.showNotification(title, options);
  event.waitUntil(
    notificationPromise
      .then(() => {
        console.log("[Service Worker] Notification shown successfully!");
      })
      .catch((err) => {
        console.error("[Service Worker] Error showing notification:", err);
      })
  );
});
/* 

icon: "/icons/company-logo.png",   // E logo
  badge: "/icons/fault-icon.png",
  image: "/icons/alert-bg.png",    */