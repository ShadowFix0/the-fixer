import type { Context, Config } from "@netlify/functions";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

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

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await req.json();
    const { userId, ...subscription } = data;
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "UserId is required" }), { status: 400 });
    }

    // Check if subscription already exists for this user and endpoint
    const q = query(
      collection(db, "push_subscriptions"), 
      where("endpoint", "==", subscription.endpoint),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(collection(db, "push_subscriptions"), {
        ...subscription,
        userId,
        createdAt: new Date().toISOString()
      });
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/subscribe"
};
