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
// service-worker.js

self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push Received.");

  let payload;

  if (!event.data) {
    console.log("[Service Worker] Push event arrived with no data.");
    payload = {
      title: "Fault alert",
      body: "Please check the system status.",
    };
  } else {
    try {
      payload = event.data.json();
      console.log("[Service Worker] Push data parsed as JSON:", payload);
    } catch (e) {
      console.warn(
        "[Service Worker] Failed to parse push data as JSON, using text instead:",
        e
      );
      const text = event.data.text();
      payload = {
        title: "Fault alert",
        body: text || "Please check the system status.",
      };
    }
  }

  console.log("[Service Worker] FINAL payload object:", payload);

  const title = payload.title || "Fault alert";
  const body = payload.body || "A new event has occurred.";
  const url = payload.url || self.location.origin + "/"; // ✅ keep URL from backend or fallback

  const options = {
    body,
    icon: "/icons/company-logo.png",
    requireInteraction: true,
    actions: [
      { action: "view_dashboard", title: "View Dashboard" },
    ],
    data: {
      url, // ✅ store URL here so we can use it on click
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 🔔 Handle notification clicks and open the correct URL
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click:", event);

  event.notification.close();

  // URL that we stored in `data` above
  const targetUrl =
    (event.notification.data && event.notification.data.url) ||
    self.location.origin + "/";

  // Optional: handle action button separately if you want
  // const action = event.action; // e.g. "view_dashboard"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a tab with this URL is already open, focus it
      for (const client of clientList) {
        if (client.url.startsWith(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});


