/**
 * Pictaria push messaging worker.
 *
 * This worker exists ONLY to show notifications that arrive from the Pictaria
 * server (Web Push). It never caches, never intercepts fetches, and holds no
 * app shell — so it cannot serve stale pages.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Pictaria", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "A new Pictaria has arrived";
  const options = {
    body: payload.body || "Tap to play today's peace of paradise.",
    icon: payload.icon || "/icon-192.png",
    badge: "/icon-maskable-192.png",
    image: payload.image || undefined,
    tag: payload.tag || "pictaria",
    renotify: true,
    data: { url: payload.url || "/" },
    vibrate: [18, 40, 18],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus();
          if ("navigate" in client) await client.navigate(target);
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
