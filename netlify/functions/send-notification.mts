/**
 * send-notification — HTTP Callable Netlify Function.
 *
 * Sends targeted push notifications to a specific user or all users.
 * Called from the app (manual trigger) or from other server functions.
 *
 * POST /api/send-notification
 * Body: { userId?, title, body, type, data? }
 */

import type { Context, Config } from "@netlify/functions";
import webpush from "web-push";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";

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
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers });
  }

  try {
    const { userId, title, body, type, data } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers }
      );
    }

    const payload = JSON.stringify({
      title,
      body,
      type: type || "system",
      ...(data || {}),
    });

    let subsQuery;
    if (userId) {
      // Send to specific user
      subsQuery = query(collection(db, "push_subscriptions"), where("userId", "==", userId));
    } else {
      // Broadcast to all users
      subsQuery = collection(db, "push_subscriptions");
    }

    const subsSnapshot = await getDocs(subsQuery);

    if (subsSnapshot.empty) {
      return new Response(
        JSON.stringify({ status: "no_subscribers", sent: 0 }),
        { status: 200, headers }
      );
    }

    let sent = 0;
    let failed = 0;

    const promises = subsSnapshot.docs.map(async (d) => {
      const sub = d.data();
      try {
        await webpush.sendNotification(sub as any, payload);
        sent++;
      } catch (err: any) {
        console.error(`[send-notification] Error for sub ${d.id}:`, err.statusCode || err.message);
        // Remove expired/invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          await deleteDoc(doc(db, "push_subscriptions", d.id));
          console.log(`[send-notification] Cleaned up expired subscription: ${d.id}`);
        }
        failed++;
      }
    });

    await Promise.all(promises);

    return new Response(
      JSON.stringify({ status: "ok", sent, failed }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("[send-notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

export const config: Config = {
  path: "/api/send-notification"
};
