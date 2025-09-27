// public/service-worker.js

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");
  
  // The data comes from your backend server
  const data = event.data.json();
  
  const title = data.title || "Fuel Alert";
  const options = {
  body: `Diesel at ${fuelLevel}%. Fault Alert!`,
  icon: "/icons/company-logo.png",   // E logo
  badge: "/icons/badge.png",
  image: "/icons/alert-bg.png",      // optional banner-style
  vibrate: [200, 100, 200],          // optional
  actions: [
    { action: "open", title: "View Dashboard" }
  ]
};


  event.waitUntil(self.registration.showNotification(title, options));
});

// Optional: handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://ems.ebhoom.com/diesel') // Or your app's URL
  );
});