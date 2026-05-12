/**
 * test-push — Manual test endpoint for push notifications.
 *
 * POST /api/test-push
 * Body: { message, type? }
 *
 * Sends a push notification to ALL subscribed devices.
 * Automatically cleans up expired subscriptions.
 */

import type { Context, Config } from "@netlify/functions";
import webpush from "web-push";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gdgd-6b43a",
  appId: "1:334224533010:web:c4906eaea0855f8f799acb",
  storageBucket: "gdgd-6b43a.firebasestorage.app",
  apiKey: "AIzaSyD86s82pUm9wNEcC9K7NwoZj0bXh3ipmz0",
  authDomain: "gdgd-6b43a.firebaseapp.com",
  messagingSenderId: "334224533010",
  measurementId: "G-LN87KE3FCB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use Netlify.env for secrets
const vapidPublicKey = Netlify.env.get("VITE_VAPID_PUBLIC_KEY") || "";
const vapidPrivateKey = Netlify.env.get("VAPID_PRIVATE_KEY") || "";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:ttt146159@gmail.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { message, type } = await req.json();
    const payload = JSON.stringify({
      title: "Shadow Sovereign",
      body: message,
      type: type || "system"
    });

    const querySnapshot = await getDocs(collection(db, "push_subscriptions"));
    let sent = 0;
    let cleaned = 0;

    const promises = querySnapshot.docs.map(async (d) => {
      const sub = d.data();
      try {
        await webpush.sendNotification(sub as any, payload);
        sent++;
      } catch (err: any) {
        console.error("Error sending notification:", err.statusCode || err.message);
        // If the subscription is expired or invalid, remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          await deleteDoc(doc(db, "push_subscriptions", d.id));
          cleaned++;
        }
      }
    });

    await Promise.all(promises);

    return new Response(JSON.stringify({ status: "ok", sent, cleaned }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Test Push Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/test-push"
};
