// // service-worker.js

// // This event handles incoming push notifications
// self.addEventListener("push", (event) => {
//   console.log("[Service Worker] Push Received.");

//   let payload;
//   try {
//     // Check if data exists before trying to parse it as JSON
//     if (event.data) {
//       payload = event.data.json();
//       console.log("[Service Worker] Push data parsed:", payload);
//     } else {
//       console.log("[Service Worker] Push event arrived with no data.");
//       // If no data is sent, create a default payload to show a meaningful alert
//       payload = {
//         title: 'Fault alert',
//         body: 'Please check the system status.',
//       };
//     }
//   } catch (e) {
//     console.error("[Service Worker] Failed to parse push data:", e);
//     // If data is broken, create an error payload
//     payload = { title: 'Fault alert', body: 'Error receiving data.' };
//   }

//   // Use the title from the push data, or "Fault alert" from your drawing
//   const title = payload.title || "Fault alert";

//   // Use the body from the push data (e.g., where you send "20 %")
//   const body = payload.body || "A new event has occurred.";

//   const options = {
//     body: body,
//     // IMPORTANT: Make sure this path points to your 'E' logo
//     icon: '/icons/company-logo.png',
//     // This makes the notification stay on screen until the user dismisses it
//     requireInteraction: true,
//     // Add custom buttons
//     actions: [
//       { action: 'view_dashboard', title: 'View Dashboard' }
//     ]
//   };

//   event.waitUntil(self.registration.showNotification(title, options));
// });

// // This event handles clicks on the notification
// self.addEventListener("notificationclick", (event) => {
//   console.log("[Service Worker] Notification click received.");
//   event.notification.close(); // Close the notification

//   // Open the dashboard when the user clicks the button or the notification itself
//   event.waitUntil(
//     clients.openWindow("https://ems.ebhoom.com/diesel")
//   );
// });
// /* 

// icon: "/icons/company-logo.png",   // E logo
//   badge: "/icons/fault-icon.png",
//   image: "/icons/alert-bg.png",    */


// service-worker.js

// Handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");

  let payload;
  try {
    if (event.data) {
      payload = event.data.json();
      console.log("[Service Worker] Push data parsed:", payload);
    } else {
      console.log("[Service Worker] Push event arrived with no data.");
      payload = {
        title: "Fault alert",
        body: "Please check the system status.",
      };
    }
  } catch (e) {
    console.error("[Service Worker] Failed to parse push data:", e);
    payload = { title: "Fault alert", body: "Error receiving data." };
  }

  const title = payload.title || "Fault alert";
  const body = payload.body || "A new event has occurred.";

  const options = {
    body,
    icon: "/icons/company-logo.png",  // ✅ E logo
    badge: "/icons/fault-icon.png",   // ✅ small badge icon
    image: "/icons/alert-bg.png",     // ✅ optional background image
    requireInteraction: true,         // Notification stays until user interacts
    vibrate: [200, 100, 200],         // Vibration pattern for phones
    actions: [
      { action: "view_dashboard", title: "View Dashboard" }
    ],
    data: {
      url: payload.url || "https://ems.ebhoom.com/diesel" // fallback if no custom URL sent
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle clicks on notifications
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click received.");
  event.notification.close();

  let targetUrl = "https://ems.ebhoom.com/diesel";

  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }

  // If action button clicked
  if (event.action === "view_dashboard") {
    event.waitUntil(clients.openWindow(targetUrl));
  } else {
    // Click anywhere else on notification
    event.waitUntil(clients.openWindow(targetUrl));
  }
});
