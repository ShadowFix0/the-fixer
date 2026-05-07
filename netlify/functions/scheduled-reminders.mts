import type { Config } from "@netlify/functions";
import webpush from "web-push";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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

export default async (req: Request) => {
  console.log("Running scheduled reminders...");

  try {
    // 1. Get all users
    const usersSnapshot = await getDocs(collection(db, "users"));
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const timezone = userData.timezone || "UTC";

      // 2. Check current time in user's timezone
      const userTime = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false
      }).format(new Date());

      const hour = parseInt(userTime);

      // 3. Habit Reminder at 8 PM (20:00)
      if (hour === 20) {
        const uncompleted = (userData.habits || []).filter((h: any) => h.isPositive && !h.completedToday);
        
        if (uncompleted.length > 0) {
          await sendPushToUser(userId, {
            title: "تذكير المساء",
            body: `لديك ${uncompleted.length} عادات إيجابية لم تكتمل بعد اليوم. لا تستسلم!`
          });
        }
      }
      
      // 4. Mission Reminders (optional: could add more logic here)
    }

    return new Response("Reminders processed");
  } catch (error) {
    console.error("Scheduled Reminder Error:", error);
    return new Response("Error processing reminders", { status: 500 });
  }
};

async function sendPushToUser(userId: string, payloadObj: any) {
  const q = query(collection(db, "push_subscriptions"), where("userId", "==", userId));
  const subsSnapshot = await getDocs(q);
  
  const payload = JSON.stringify(payloadObj);

  const promises = subsSnapshot.docs.map(d => {
    const sub = d.data();
    return webpush.sendNotification(sub as any, payload).catch(err => {
      console.error(`Error sending push to user ${userId}:`, err);
    });
  });

  await Promise.all(promises);
}

export const config: Config = {
  schedule: "0 * * * *" // Every hour
};
