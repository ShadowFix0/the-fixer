/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Shadow Sovereign', body: 'لديك تنبيه جديد من النظام' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
      badge: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
      data: {
        url: self.location.origin
      }
    } as any)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
  );
});
