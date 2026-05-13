/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
  );
  event.waitUntil(self.clients.claim());
});

// ─── Notification Type Configurations ──────────────────────────────────────────
const NOTIFICATION_CONFIG: Record<string, {
  icon: string;
  badge: string;
  vibrate: number[];
  tag: string;
}> = {
  level_up: {
    icon: 'https://img.icons8.com/ios-filled/100/FFD700/star.png',
    badge: 'https://img.icons8.com/ios-filled/100/FFD700/star.png',
    vibrate: [200, 100, 200, 100, 400],
    tag: 'level-up'
  },
  rank_up: {
    icon: 'https://img.icons8.com/ios-filled/100/FF4500/crown.png',
    badge: 'https://img.icons8.com/ios-filled/100/FF4500/crown.png',
    vibrate: [300, 100, 300, 100, 300, 100, 600],
    tag: 'rank-up'
  },
  habit_reminder: {
    icon: 'https://img.icons8.com/ios-filled/100/3b82f6/sword.png',
    badge: 'https://img.icons8.com/ios-filled/100/3b82f6/sword.png',
    vibrate: [200, 100, 200],
    tag: 'habit-reminder'
  },
  mission_deadline: {
    icon: 'https://img.icons8.com/ios-filled/100/FF6347/hourglass.png',
    badge: 'https://img.icons8.com/ios-filled/100/FF6347/hourglass.png',
    vibrate: [100, 50, 100, 50, 100],
    tag: 'mission-deadline'
  },
  water_reminder: {
    icon: 'https://img.icons8.com/ios-filled/100/00BFFF/water.png',
    badge: 'https://img.icons8.com/ios-filled/100/00BFFF/water.png',
    vibrate: [150, 100, 150],
    tag: 'water-reminder'
  },
  ai_insight: {
    icon: 'https://img.icons8.com/ios-filled/100/9b59b6/brain.png',
    badge: 'https://img.icons8.com/ios-filled/100/9b59b6/brain.png',
    vibrate: [200, 200, 200],
    tag: 'ai-insight'
  },
  boss_defeated: {
    icon: 'https://img.icons8.com/ios-filled/100/e74c3c/skull.png',
    badge: 'https://img.icons8.com/ios-filled/100/e74c3c/skull.png',
    vibrate: [100, 50, 100, 50, 300, 100, 600],
    tag: 'boss-defeated'
  },
  streak_warning: {
    icon: 'https://img.icons8.com/ios-filled/100/f39c12/fire-element.png',
    badge: 'https://img.icons8.com/ios-filled/100/f39c12/fire-element.png',
    vibrate: [300, 200, 300],
    tag: 'streak-warning'
  },
  morning_briefing: {
    icon: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
    badge: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
    vibrate: [200, 100, 200],
    tag: 'morning-briefing'
  },
  dopamine_fast: {
    icon: 'https://img.icons8.com/ios-filled/100/8b5cf6/lock.png',
    badge: 'https://img.icons8.com/ios-filled/100/8b5cf6/lock.png',
    vibrate: [400, 200, 400],
    tag: 'dopamine-fast'
  },
  system: {
    icon: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
    badge: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
    vibrate: [200],
    tag: 'system'
  }
};

// ─── Action Buttons Per Type ───────────────────────────────────────────────────
function getActionsForType(type: string): NotificationAction[] {
  switch (type) {
    case 'habit_reminder':
      return [
        { action: 'open_habits', title: '⚔️ عرض الطقوس' },
        { action: 'dismiss', title: 'لاحقاً' }
      ];
    case 'mission_deadline':
      return [
        { action: 'open_missions', title: '📜 عرض المهمة' },
        { action: 'dismiss', title: 'تجاهل' }
      ];
    case 'level_up':
    case 'rank_up':
      return [
        { action: 'open_profile', title: '👤 الملف الشخصي' }
      ];
    case 'morning_briefing':
      return [
        { action: 'open_dashboard', title: '🏠 لوحة القيادة' },
        { action: 'dismiss', title: 'لاحقاً' }
      ];
    case 'water_reminder':
      return [
        { action: 'open_dashboard', title: '💧 تسجيل شرب' },
        { action: 'dismiss', title: 'تجاهل' }
      ];
    case 'streak_warning':
      return [
        { action: 'open_habits', title: '🔥 حافظ على السلسلة' }
      ];
    default:
      return [
        { action: 'open_dashboard', title: 'فتح التطبيق' }
      ];
  }
}

// ─── Push Event Handler ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {
    title: 'Shadow Sovereign',
    body: 'لديك تنبيه جديد من النظام',
    type: 'system'
  };

  const type = data.type || 'system';
  const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.system;

  const promiseChain = self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then((clients) => {
      const focusedClient = clients.find(
        (c) => (c as WindowClient).focused
      );

      if (focusedClient) {
        // ── App is open & focused → send to foreground toast handler ──
        focusedClient.postMessage({
          type: 'FOREGROUND_NOTIFICATION',
          payload: data
        });
        // Show a silent native notification too (so it appears in notification tray)
        return self.registration.showNotification(data.title, {
          body: data.body,
          icon: config.icon,
          badge: config.badge,
          tag: config.tag,
          silent: true,
          data: { url: self.location.origin, notificationType: type, ...data }
        } as any);
      } else {
        // ── App is in background or closed → full rich notification ──
        return self.registration.showNotification(data.title, {
          body: data.body,
          icon: config.icon,
          badge: config.badge,
          tag: config.tag,
          vibrate: config.vibrate,
          requireInteraction: type === 'level_up' || type === 'rank_up',
          actions: getActionsForType(type),
          data: { url: self.location.origin, notificationType: type, ...data }
        } as any);
      }
    });

  event.waitUntil(promiseChain);
});

// ─── Notification Click Handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  if (action === 'dismiss') return;

  // Map action to a specific tab/route (communicated via postMessage)
  const tabMap: Record<string, string> = {
    'open_habits': 'habits',
    'open_missions': 'missions',
    'open_profile': 'dashboard',
    'open_dashboard': 'dashboard',
  };
  const targetTab = tabMap[action] || 'dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Try to focus an existing window and navigate it
      for (const client of clients) {
        const wc = client as WindowClient;
        if (wc.url.includes(self.location.origin)) {
          wc.postMessage({ type: 'NAVIGATE_TAB', tab: targetTab });
          return wc.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(
        event.notification.data?.url || self.location.origin
      );
    })
  );
});
