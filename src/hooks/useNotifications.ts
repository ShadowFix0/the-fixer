/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * useNotifications — Full notification system hook.
 *
 * Handles:
 * - Push subscription management (VAPID → Netlify → Firestore)
 * - Foreground toast queue (via Service Worker postMessage)
 * - Local notification dispatch (via SW showNotification)
 * - Navigation commands from notification actions
 * - Event-driven notification triggers (level-up, boss-defeated, etc.)
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ToastNotification } from '../components/NotificationToast';

const VAPID_PUBLIC_KEY = (import.meta as any).env.VITE_VAPID_PUBLIC_KEY;

// ─── Notification Types ────────────────────────────────────────────────────────
export type NotificationType =
  | 'level_up'
  | 'rank_up'
  | 'habit_reminder'
  | 'mission_deadline'
  | 'water_reminder'
  | 'ai_insight'
  | 'boss_defeated'
  | 'streak_warning'
  | 'morning_briefing'
  | 'dopamine_fast'
  | 'system';

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
}

export function useNotifications(onNavigateTab?: (tab: string) => void) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const toastIdCounter = useRef(0);

  // ─── Auto-Subscribe When Permission Granted ────────────────────────────────
  useEffect(() => {
    if ('serviceWorker' in navigator && permission === 'granted' && VAPID_PUBLIC_KEY && user) {
      subscribeUser();
    }
  }, [permission, user]);

  // ─── Foreground Message Listener (from Service Worker) ─────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event: MessageEvent) => {
      const { type, payload, tab } = event.data || {};

      if (type === 'FOREGROUND_NOTIFICATION' && payload) {
        // Service Worker detected app is focused → show toast instead of native notification
        addToast({
          title: payload.title,
          body: payload.body,
          type: payload.type || 'system',
        });
      }

      if (type === 'NAVIGATE_TAB' && tab && onNavigateTab) {
        // User clicked a notification action button → navigate to specific tab
        onNavigateTab(tab);
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [onNavigateTab]);

  // ─── Permission Request ────────────────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('[System] This browser does not support notifications.');
      return 'denied' as NotificationPermission;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  // ─── Push Subscription ─────────────────────────────────────────────────────
  const subscribeUser = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        setIsSubscribed(true);
        // Still register with backend in case it was lost
        await registerSubscription(existing);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await registerSubscription(subscription);
      setIsSubscribed(true);
      console.log('[System] Push subscription active.');
    } catch (error) {
      console.error('[System] Failed to subscribe:', error);
    }
  }, [user]);

  const registerSubscription = useCallback(async (subscription: PushSubscription) => {
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...JSON.parse(JSON.stringify(subscription)),
          userId: user?.uid,
        }),
      });
    } catch (error) {
      console.error('[System] Failed to register subscription:', error);
    }
  }, [user]);

  // ─── Toast Queue Management ────────────────────────────────────────────────
  const addToast = useCallback((payload: NotificationPayload) => {
    const id = `toast-${Date.now()}-${++toastIdCounter.current}`;
    const toast: ToastNotification = {
      id,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      timestamp: Date.now(),
    };
    setToasts(prev => [toast, ...prev]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Local Notification (via Service Worker) ───────────────────────────────
  const sendLocalNotification = useCallback((title: string, options?: NotificationOptions & { type?: NotificationType }) => {
    if (permission !== 'granted') return;

    const type = options?.type || 'system';

    // If the document is visible (app is open), show a toast instead
    if (document.visibilityState === 'visible') {
      addToast({
        title,
        body: options?.body || '',
        type,
      });
    }

    // Also show native notification via service worker
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
        badge: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
        ...options,
        tag: options?.tag || type,
        silent: document.visibilityState === 'visible', // Silent if app is focused
      });
    });
  }, [permission, addToast]);

  // ─── Event-Driven Notification Triggers ────────────────────────────────────

  const notifyLevelUp = useCallback((newLevel: number) => {
    sendLocalNotification('⬆️ ارتقاء المستوى!', {
      body: `تهانينا! لقد وصلت إلى المستوى ${newLevel}. قوتك تتزايد أيها العاهل.`,
      type: 'level_up',
      tag: 'level-up',
    });
  }, [sendLocalNotification]);

  const notifyRankUp = useCallback((newRank: string) => {
    const rankNames: Record<string, string> = {
      'E': 'الرتبة E',
      'D': 'الرتبة D',
      'C': 'الرتبة C',
      'B': 'الرتبة B',
      'A': 'الرتبة A',
      'S': 'الرتبة S — عاهل الظلال',
    };
    sendLocalNotification('👑 ارتقاء الرتبة!', {
      body: `لقد ارتقيت إلى ${rankNames[newRank] || newRank}! أنت تقترب من القمة.`,
      type: 'rank_up',
      tag: 'rank-up',
    });
  }, [sendLocalNotification]);

  const notifyBossDefeated = useCallback((bossName: string) => {
    sendLocalNotification('💀 تم هزيمة الزعيم!', {
      body: `لقد تغلبت على "${bossName}"! مكافآتك بانتظارك.`,
      type: 'boss_defeated',
      tag: 'boss-defeated',
    });
  }, [sendLocalNotification]);

  const notifyStreakWarning = useCallback((habitTitle: string, streak: number) => {
    sendLocalNotification('🔥 تحذير السلسلة!', {
      body: `عادتك "${habitTitle}" لديها سلسلة ${streak} أيام. لا تكسرها اليوم!`,
      type: 'streak_warning',
      tag: 'streak-warning',
    });
  }, [sendLocalNotification]);

  const notifyMissionDeadline = useCallback((missionTitle: string, minutesLeft: number) => {
    sendLocalNotification('⏳ موعد المهمة يقترب!', {
      body: `مهمتك "${missionTitle}" تنتهي خلال ${minutesLeft} دقيقة.`,
      type: 'mission_deadline',
      tag: 'mission-deadline',
    });
  }, [sendLocalNotification]);

  const notifyWaterReminder = useCallback(() => {
    sendLocalNotification('💧 تذكير الارتواء', {
      body: 'لقد مر وقت طويل منذ آخر شرب. النظام ينصحك بشرب كوب الآن لزيادة حيويتك.',
      type: 'water_reminder',
      tag: 'water-reminder',
    });
  }, [sendLocalNotification]);

  const notifyAIInsight = useCallback((message: string) => {
    sendLocalNotification('🧠 رؤية النظام', {
      body: message,
      type: 'ai_insight',
      tag: 'ai-insight',
    });
  }, [sendLocalNotification]);

  const notifyDopamineFast = useCallback((action: 'start' | 'end') => {
    const titles = {
      start: '🔒 بدء صيام الدوبامين',
      end: '🔓 انتهاء صيام الدوبامين',
    };
    const bodies = {
      start: 'تم تفعيل وضع التركيز المطلق. ابتعد عن كل مصدر تشتيت.',
      end: 'لقد أنهيت جلسة التركيز بنجاح. النظام فخور بإرادتك.',
    };
    sendLocalNotification(titles[action], {
      body: bodies[action],
      type: 'dopamine_fast',
      tag: 'dopamine-fast',
    });
  }, [sendLocalNotification]);

  // ─── Send Server Push (via Netlify Function) ───────────────────────────────
  const sendServerPush = useCallback(async (payload: NotificationPayload & { targetUserId?: string }) => {
    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: payload.targetUserId || user?.uid,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          data: payload.data,
        }),
      });
    } catch (error) {
      console.error('[System] Failed to send server push:', error);
    }
  }, [user]);

  return {
    // State
    permission,
    isSubscribed,
    toasts,

    // Core
    requestPermission,
    sendLocalNotification,
    sendServerPush,

    // Toast
    addToast,
    dismissToast,

    // Event Triggers
    notifyLevelUp,
    notifyRankUp,
    notifyBossDefeated,
    notifyStreakWarning,
    notifyMissionDeadline,
    notifyWaterReminder,
    notifyAIInsight,
    notifyDopamineFast,
    testPush: () => sendServerPush({
      title: '🛡️ اختبار النظام',
      body: 'إذا رأيت هذا، فنظام إشعارات سيد الظلال يعمل بكفاءة عالية.',
      type: 'system'
    })
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
