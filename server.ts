import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VAPID keys should be generated once and stored in .env
const vapidPublicKey = process.env.VITE_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:ttt146159@gmail.com",
    vapidPublicKey,
    vapidPrivateKey
  );
  console.log(">>> [System] VAPID Keys Loaded Successfully.");
} else {
  console.warn(">>> [System] Warning: VAPID Keys missing in .env.");
}

// In-memory storage for local testing
let subscriptions: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log all requests
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });

  // API for Push Notifications Subscription
  app.post("/api/subscribe", (req, res) => {
    const subscription = req.body;
    console.log(`>>> [System] Subscription Request Received for user: ${subscription.userId}`);
    
    // Check if subscription already exists
    const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      subscriptions.push(subscription);
      console.log(`>>> [System] NEW subscription added. Total active: ${subscriptions.length}`);
    } else {
      console.log(`>>> [System] Subscription already exists. Total active: ${subscriptions.length}`);
    }
    res.status(201).json({ status: "ok" });
  });

  // API for Sending Targeted Notification
  app.post("/api/send-notification", async (req, res) => {
    const { title, body, type, data } = req.body;
    console.log(`>>> [System] Attempting to send notification: "${title}"`);

    const payload = JSON.stringify({
      title: title || "Shadow Sovereign",
      body: body || "لديك تنبيه جديد من النظام",
      type: type || "system",
      ...(data || {}),
    });

    if (subscriptions.length === 0) {
      console.warn(">>> [System] No active subscriptions found.");
      return res.status(200).json({ status: "no_subscribers", sent: 0 });
    }

    let sent = 0;
    let failed = 0;

    const promises = subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).then(() => {
        sent++;
      }).catch((err) => {
        console.error(`>>> [System] Push error: ${err.statusCode || err.message}`);
        if (err.statusCode === 410 || err.statusCode === 404) {
          subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
        failed++;
      })
    );

    await Promise.all(promises);
    console.log(`>>> [System] Push Result: ${sent} sent, ${failed} failed.`);
    res.status(200).json({ status: "ok", sent, failed });
  });

  // Legacy Test Endpoint
  app.post("/api/test-push", async (req, res) => {
    const { message } = req.body;
    const payload = JSON.stringify({ 
      title: "Shadow Sovereign Test", 
      body: message || "اختبار نظام الإشعارات",
      type: "system" 
    });

    let sent = 0;
    const promises = subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).then(() => sent++).catch(err => console.error(err))
    );

    await Promise.all(promises);
    res.status(200).json({ status: "ok", sent });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> System Online: Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
