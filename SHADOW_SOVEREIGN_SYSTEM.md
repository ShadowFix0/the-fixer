# Shadow Sovereign System: Project Overview

## 1. Concept & Theme
**Shadow Sovereign** is a high-end, gamified personal productivity and habit-tracking ecosystem inspired by the "Solo Leveling" manhwa. It transforms real-life self-improvement into a professional RPG experience where a "System" monitors, guides, and motivates the user's growth.

## 2. Advanced Notification & Automation Architecture
The system is built on a robust full-stack foundation to ensure persistence and engagement:
*   **Multi-Channel Triggers:**
    *   **Cron Jobs:** Automated daily scheduling for recurring "Daily Rites."
    *   **Firestore Triggers:** Real-time reactions to data changes (e.g., instant alerts upon "Level Up").
    *   **AI-Powered Triggers:** Gemini AI initiates contextual notifications based on user behavior or specific goals.
    *   **HTTP Callables:** Custom manual triggers initiated directly from the application.
*   **Logic & Delivery Layer:**
    *   **Backend Functions:** Managed via Netlify/Firebase Functions to handle business logic and security.
    *   **FCM (Firebase Cloud Messaging):** The core engine for routing notifications across platforms.
*   **Cross-Platform Client Handling:**
    *   **Service Workers:** Enables background sync and push notifications even when the browser is closed.
    *   **Foreground Handler:** Custom, immersive RPG-style "Toast" notifications for active sessions.
    *   **Native Push Support:** Compatible with Android and iOS.

## 3. Core Functional Modules
*   **Character Engine:** Tracks Level, XP, Gold, and Rank (E to S). Manages attributes: Strength, Intelligence, Agility, Vitality, and Sense.
*   **Habit Combat System:**
    *   **Daily Rites:** Positive habits that grant rewards.
    *   **Bosses:** Bad habits manifested as enemies; overcoming them "defeats" the boss for major XP.
*   **AI Mission System:** Dynamically generated missions (Quick/Fated) tailored by Gemini AI based on user mood and performance.
*   **Dopamine Fast Mode:** A specialized focus mode with AI-guided "Forbidden Rites" to eliminate modern distractions.
*   **System Memory:** Persistent user context (Bio, Dreams, Mistakes) for hyper-personalized AI interactions.
*   **Shadow System:** Unlockable entities and rewards that track the user's progression path.

## 4. Technical Stack
*   **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion.
*   **Backend & Persistence:** Firebase (Auth, Firestore, FCM), Netlify Functions.
*   **AI Integration:** Google Gemini (Flash 1.5/2.0/3.0) with stable fallback mechanisms.
*   **PWA:** Service Workers for offline capability and persistent notifications.

## 5. Instructions for Developer AIs
> "This project is a sophisticated integration of AI and real-time automation. Maintain the 'Shadow Sovereign' persona—authoritative, cold, and supportive of growth. Ensure all new features integrate with the notification architecture and respect the existing data schemas (CharacterStats, Habits, Missions)."

---
*Generated for the Shadow Sovereign System Development Team.*
