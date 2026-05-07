/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const VAPID_PUBLIC_KEY = (import.meta as any).env.VITE_VAPID_PUBLIC_KEY;

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && permission === 'granted' && VAPID_PUBLIC_KEY && user) {
      subscribeUser();
    }
  }, [permission, user]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...JSON.parse(JSON.stringify(subscription)),
          userId: user?.uid
        }),
      });

      setIsSubscribed(true);
      console.log('User is subscribed to Push Notifications');
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
    }
  };

  const sendLocalNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
          badge: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
          ...options,
        });
      });
    }
  };

  return { permission, requestPermission, isSubscribed, sendLocalNotification };
}

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
