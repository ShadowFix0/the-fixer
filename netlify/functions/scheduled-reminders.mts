/**
 * scheduled-reminders — Cron Job (runs every hour).
 *
 * Multi-schedule notification triggers based on user's local timezone:
 * - 07:00 → Morning Briefing (daily preview + motivation)
 * - 12:00 → Midday Check-in (streak warnings for at-risk habits)
 * - 20:00 → Evening Reminder (uncompleted habits)
 * - 22:00 → Night Summary (performance recap)
 *
 * Also handles:
 * - Mission deadline alerts
 * - Water intake reminders
 * - Level-up congratulations (Firestore trigger emulation)
 */

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

// ─── Helper: Get hour in user's timezone ─────────────────────────────────────
function getUserHour(timezone: string): number {
  try {
    const timeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false
    }).format(new Date());
    return parseInt(timeStr);
  } catch {
    return -1; // Invalid timezone
  }
}

// ─── Helper: Send push to a user ─────────────────────────────────────────────
async function sendPushToUser(userId: string, payloadObj: any) {
  const q = query(collection(db, "push_subscriptions"), where("userId", "==", userId));
  const subsSnapshot = await getDocs(q);

  if (subsSnapshot.empty) return 0;

  const payload = JSON.stringify(payloadObj);
  let sent = 0;

  const promises = subsSnapshot.docs.map(async (d) => {
    try {
      await webpush.sendNotification(d.data() as any, payload);
      sent++;
    } catch (err: any) {
      console.error(`[Cron] Push error for user ${userId}:`, err.statusCode || err.message);
    }
  });

  await Promise.all(promises);
  return sent;
}

// ─── Notification Templates ──────────────────────────────────────────────────
const MORNING_MESSAGES = [
  "صباح جديد، فرصة جديدة للارتقاء. النظام في انتظار أوامرك.",
  "استيقظ أيها العاهل. اليوم هو يوم آخر لإثبات قوتك.",
  "الصباح لمن يستحقه. ابدأ طقوسك اليومية الآن.",
  "النظام رصد بداية يوم جديد. هل أنت مستعد للقتال؟",
  "كل يوم تتجاهل فيه طقوسك، تقوى فيه ظلالك. ابدأ الآن.",
];

const NIGHT_MESSAGES = [
  "يقترب نهاية اليوم. راجع إنجازاتك قبل الراحة.",
  "النظام يسجل أداءك اليومي. هل أنت راضٍ عما حققت؟",
  "الليل وقت المراجعة. غداً ستكون أقوى.",
];

export default async (req: Request) => {
  console.log("[Cron] Running scheduled notifications...");

  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    let totalSent = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const timezone = userData.timezone || "UTC";
      const hour = getUserHour(timezone);

      if (hour === -1) continue; // Skip invalid timezones

      const habits = userData.habits || [];
      const missions = userData.missions || [];
      const character = userData.character || {};
      const waterIntake = userData.waterIntake || {};

      // ── 07:00 — Morning Briefing ──────────────────────────────────────
      if (hour === 7) {
        const positiveHabits = habits.filter((h: any) => h.isPositive);
        const totalHabits = positiveHabits.length;
        const randomMsg = MORNING_MESSAGES[Math.floor(Math.random() * MORNING_MESSAGES.length)];

        totalSent += await sendPushToUser(userId, {
          title: "☀️ إحاطة الصباح",
          body: totalHabits > 0
            ? `${randomMsg}\nلديك ${totalHabits} طقوس يومية بانتظارك.`
            : randomMsg,
          type: "morning_briefing"
        });

        // Streak warnings for habits with high streaks
        for (const habit of positiveHabits) {
          if (habit.streak >= 7) {
            totalSent += await sendPushToUser(userId, {
              title: "🔥 حافظ على سلسلتك!",
              body: `عادتك "${habit.title}" لديها سلسلة ${habit.streak} أيام. لا تكسرها اليوم!`,
              type: "streak_warning"
            });
          }
        }
      }

      // ── 12:00 — Midday Check-in ───────────────────────────────────────
      if (hour === 12) {
        const completed = habits.filter((h: any) => h.isPositive && h.completedToday).length;
        const total = habits.filter((h: any) => h.isPositive).length;

        if (total > 0 && completed < total) {
          const remaining = total - completed;
          totalSent += await sendPushToUser(userId, {
            title: "⚔️ تقرير منتصف اليوم",
            body: `أكملت ${completed}/${total} من طقوسك. لا يزال أمامك ${remaining} طقوس. لا تتراخى.`,
            type: "habit_reminder"
          });
        }

        // Water reminder at noon
        const currentMl = waterIntake.currentMl || 0;
        const targetMl = (waterIntake.targetLiters || 2) * 1000;
        if (currentMl < targetMl * 0.3) {
          totalSent += await sendPushToUser(userId, {
            title: "💧 تحذير الجفاف",
            body: `لم تشرب سوى ${currentMl}ml من أصل ${targetMl}ml. اشرب الماء الآن لتحافظ على حيويتك.`,
            type: "water_reminder"
          });
        }
      }

      // ── 20:00 — Evening Reminder ──────────────────────────────────────
      if (hour === 20) {
        const uncompleted = habits.filter((h: any) => h.isPositive && !h.completedToday);

        if (uncompleted.length > 0) {
          const habitNames = uncompleted.slice(0, 3).map((h: any) => h.title).join("، ");
          totalSent += await sendPushToUser(userId, {
            title: "🌙 تذكير المساء",
            body: `لديك ${uncompleted.length} طقوس لم تكتمل: ${habitNames}${uncompleted.length > 3 ? '...' : ''}`,
            type: "habit_reminder"
          });
        }

        // Mission deadline check (missions due today)
        const today = new Date().toISOString().split('T')[0];
        const dueMissions = missions.filter((m: any) => !m.isCompleted && m.dueDate === today);
        for (const mission of dueMissions) {
          totalSent += await sendPushToUser(userId, {
            title: "⏳ موعد المهمة اليوم!",
            body: `مهمتك "${mission.title}" تنتهي اليوم. أنجزها قبل فوات الأوان.`,
            type: "mission_deadline"
          });
        }
      }

      // ── 22:00 — Night Summary ─────────────────────────────────────────
      if (hour === 22) {
        const completedCount = habits.filter((h: any) => h.isPositive && h.completedToday).length;
        const totalCount = habits.filter((h: any) => h.isPositive).length;
        const completedMissions = missions.filter((m: any) => m.isCompleted).length;
        const randomNight = NIGHT_MESSAGES[Math.floor(Math.random() * NIGHT_MESSAGES.length)];

        if (totalCount > 0) {
          const percentage = Math.round((completedCount / totalCount) * 100);
          let grade = "F";
          if (percentage >= 90) grade = "S";
          else if (percentage >= 75) grade = "A";
          else if (percentage >= 60) grade = "B";
          else if (percentage >= 40) grade = "C";
          else if (percentage >= 20) grade = "D";

          totalSent += await sendPushToUser(userId, {
            title: `📊 ملخص اليوم — تقييم ${grade}`,
            body: `الطقوس: ${completedCount}/${totalCount} (${percentage}%) | المهمات المنجزة: ${completedMissions}\nالمستوى: ${character.level || 1} | ${randomNight}`,
            type: "system"
          });
        }
      }

      // ── Hourly — Water Reminder (every 3 hours if behind) ─────────────
      if (hour >= 9 && hour <= 21 && hour % 3 === 0 && hour !== 12) {
        const currentMl = waterIntake.currentMl || 0;
        const targetMl = (waterIntake.targetLiters || 2) * 1000;
        const expectedByNow = targetMl * ((hour - 7) / 14); // Linear progression from 7 AM to 9 PM

        if (currentMl < expectedByNow * 0.5) {
          totalSent += await sendPushToUser(userId, {
            title: "💧 تذكير الارتواء",
            body: "النظام يلاحظ أنك لم تشرب كفايتك من الماء. اشرب كوباً الآن.",
            type: "water_reminder"
          });
        }
      }
    }

    console.log(`[Cron] Total notifications sent: ${totalSent}`);
    return new Response(JSON.stringify({ status: "ok", totalSent }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return new Response(JSON.stringify({ error: "Error processing reminders" }), { status: 500 });
  }
};

export const config: Config = {
  schedule: "0 * * * *" // Every hour
};
