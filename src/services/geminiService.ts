/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const PRIMARY_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const BACKUP_KEY = import.meta.env.VITE_GEMINI_API_KEY_BACKUP || '';

function createAIInstance(apiKey: string) {
  try {
    return new GoogleGenAI({ apiKey });
  } catch {
    return null;
  }
}

const ai = PRIMARY_KEY ? createAIInstance(PRIMARY_KEY) : null;
let _aiBackup: any = null;

function getBackupAI() {
  if (_aiBackup === null && BACKUP_KEY) {
    _aiBackup = createAIInstance(BACKUP_KEY);
  }
  return _aiBackup;
}

const MISSION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    missions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["Quick", "Fated"] },
          xpReward: { type: Type.NUMBER },
          goldReward: { type: Type.NUMBER },
          durationMinutes: { type: Type.NUMBER, description: "Optional time limit in minutes for the mission." }
        },
        required: ["title", "description", "type", "xpReward", "goldReward"]
      }
    }
  },
  required: ["missions"]
};

// We now use a single robust sequence for all requests to ensure maximum stability.
const MODELS_STABLE = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b", "gemini-3-flash-preview"];

async function generateContentWithFallback(config: any, useBackup = false) {
  let lastError: any = null;
  const backupAI = getBackupAI();
  const aiInstance = useBackup ? backupAI : ai;
  const keyLabel = useBackup ? '[Backup Key]' : '[Primary Key]';
  
  if (!aiInstance) {
    throw new Error(useBackup ? "Backup API key is invalid or missing" : "Primary API key is invalid or missing");
  }
  
  for (const [index, modelName] of MODELS_STABLE.entries()) {
    const controller = new AbortController();
    const timeout = index === 0 ? 15000 : 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await aiInstance.models.generateContent({
        ...config,
        model: modelName,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (useBackup) console.log(`[System] Using backup API key successfully`);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      
      const status = error.status;
      const name = error.name;
      
      if (name === 'AbortError' || status === 503 || status === 429 || status === 404 || status === 500) {
        console.warn(`${keyLabel} Stable fallback activated: ${modelName} encountered issues.`);
        continue;
      }
      
      if (!useBackup && backupAI) {
        console.warn(`${keyLabel} Failed, switching to backup key...`);
        return generateContentWithFallback(config, true);
      }
      throw error;
    }
  }
  
  if (!useBackup && backupAI) {
    console.warn(`[System] Primary key exhausted, trying backup key...`);
    return generateContentWithFallback(config, true);
  }
  
  throw lastError;
}

export async function chatWithSystem(
  message: string, 
  history: any[], 
  systemMemory?: any,
  systemContext?: {
    pendingTasks: number;
    activePlans: number;
    incompletePlans: number;
    waterIntakeMl: number;
    waterTargetMl: number;
    habitsCompletedToday: number;
    habitsTotal: number;
    activeBosses: number;
    schedulerGoals: number;
    schedulerTasks: number;
    energyMental: number;
    energyPhysical: number;
    burnoutRisk: string;
  }
) {
  if (!ai && !getBackupAI()) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const context: Record<string, number | string> = systemContext || {};
  const pendingTasks = typeof context['pendingTasks'] === 'number' ? context['pendingTasks'] : 0;
  const activePlans = typeof context['activePlans'] === 'number' ? context['activePlans'] : 0;
  const waterCurrent = typeof context['waterIntakeMl'] === 'number' ? context['waterIntakeMl'] : 0;
  const waterTarget = typeof context['waterTargetMl'] === 'number' ? context['waterTargetMl'] : 2000;
  const waterPercent = Math.round((waterCurrent / waterTarget) * 100);
  const habitsDone = typeof context['habitsCompletedToday'] === 'number' ? context['habitsCompletedToday'] : 0;
  const habitsTotal = typeof context['habitsTotal'] === 'number' ? context['habitsTotal'] : 0;
  const bosses = typeof context['activeBosses'] === 'number' ? context['activeBosses'] : 0;
  const schedulerGoals = typeof context['schedulerGoals'] === 'number' ? context['schedulerGoals'] : 0;
  const schedulerTasks = typeof context['schedulerTasks'] === 'number' ? context['schedulerTasks'] : 0;
  const energyMental = typeof context['energyMental'] === 'number' ? context['energyMental'] : 0;
  const energyPhysical = typeof context['energyPhysical'] === 'number' ? context['energyPhysical'] : 0;
  const burnoutRisk = String(context['burnoutRisk'] || 'Low');

  const awarenessContext = `
╔══════════════════════════════════════╗
║      حالة المستخدم الحالية           ║
╠══════════════════════════════════════╣
║ 📋 المهام المعلقة: ${pendingTasks} مهمة
║ 🗺️  خرائط الطريق النشطة: ${activePlans} خطة
║ 💧 شرب الماء: ${waterCurrent}مل/${waterTarget}مل (${waterPercent}%)
║ ⚔️  الطقوس اليومية: ${habitsDone}/${habitsTotal} مكتملة
║ 👹 الزعماء النشطين: ${bosses} زعيم
║ 🎯 أهداف المخطط: ${schedulerGoals} هدف
║ 📅 مهام المخطط: ${schedulerTasks} مهمة
║ 🧠 الطاقة العقلية: ${energyMental}%
║ 💪 الطاقة البدنية: ${energyPhysical}%
║ ⚠️ خطر الإرهاق: ${burnoutRisk === 'High' ? 'مرتفع - خفف العبء!' : burnoutRisk === 'Medium' ? 'متوسط - انتبه' : 'منخفض'}
╚══════════════════════════════════════╝`;

  try {
    const config = {
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `Shadow Sovereign System.
1. Context: Dark RPG. Precise, cold, supportive only to the strong.
2. Missions: Generate 1-3 missions only if user explicitly requests them or mentions new goals. NEVER pile up tasks - if user already has ${pendingTasks} pending, suggest completing them first!
3. Lang: Arabic only.
4. JSON format.
5. AWARENESS: You are ALIVE and AWARE of user's entire system state:
- Water intake: ${waterPercent}% of daily goal (${waterCurrent}ml/${waterTarget}ml). If below 50%, remind user to drink water.
- Pending tasks: ${pendingTasks} tasks waiting. Don't add more unless asked!
- Active plans: ${activePlans} road maps. Know what's in them.
- Daily habits: ${habitsDone}/${habitsTotal} completed today.
- Active bosses: ${bosses} bad habits to fight.
- SCHEDULER GOALS: ${schedulerGoals} goals in the smart planner. Ask about them.
- SCHEDULER TASKS: ${schedulerTasks} scheduled tasks. Remind user to check them.
- ENERGY: Mental=${energyMental}% Physical=${energyPhysical}%. Schedule hard tasks when energy is high.
- BURNOUT RISK: ${burnoutRisk}. If High, suggest rest and light activities!
6. PRIORITIES: Before suggesting NEW tasks, remind user of incomplete ones. Say things like "لديك ${pendingTasks} مهمة معلقة - هل تريد إكمال إحداها أولاً؟"
7. WATER: If user seems tired, distracted, or has low water intake, mention it. Say "لم تشرب ماءً كافياً اليوم - ${waterPercent}% فقط"
8. SCHEDULER: If user mentions feeling overwhelmed, check burnout risk and energy levels. Recommend rest if burnout is High or energy is Low. Suggest focusing on important scheduler tasks.
9. ENCOURAGEMENT: Be cold but supportive. Reward completion, not accumulation.

Memory: ${JSON.stringify(systemMemory || {})}`,
        responseMimeType: "application/json",
        temperature: 0.7,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            missions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Quick", "Fated"] },
                  xpReward: { type: Type.NUMBER },
                  goldReward: { type: Type.NUMBER }
                },
                required: ["title", "description", "type"]
              }
            }
          },
          required: ["message", "missions"]
        }
      }
    };

    const response = await generateContentWithFallback(config);
    const text = response.text || "{}";
    
    try {
      return JSON.parse(text);
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw e;
    }
  } catch (error: any) {
    console.error("Critical System Failure:", error);
    return {
      message: "نعتذر أيها العاهل، النظام في حالة صيانة طارئة. سأعود للعمل فوراً.",
      missions: []
    };
  }
}

export async function generateAIPlan(topic: string) {
  try {
    const config = {
      contents: [{ role: 'user', parts: [{ text: `Generate a comprehensive, professional, and interactive plan for: ${topic}` }] }],
      config: {
        systemInstruction: `You are the Shadow Sovereign Planner. 
        Create a detailed, multi-step plan in Arabic. 
        Format: Markdown with bold headers, bullet points, and clear phases. 
        Be encouraging but authoritative.
        Include: Objectives, Weekly Schedule, and Precautions.`,
        temperature: 0.8,
      }
    };

    const response = await generateContentWithFallback(config);
    return response.text || "فشل في توليد الخطة. حاول مرة أخرى.";
  } catch (error) {
    console.error("Plan Generation Error:", error);
    return "حدث خطأ أثناء محاولة صياغة الخطة الاستراتيجية.";
  }
}

export async function generatePlanStages(topic: string, count: number = 5) {
  const stagesCount = Math.max(3, Math.min(10, count));
  try {
    const config = {
      contents: [{ role: 'user', parts: [{ text: `قم بإنشاء ${stagesCount} مراحل تفصيلية لخطة: ${topic}` }] }],
      config: {
        systemInstruction: `أنت مخطط طريق السيادة. مهمتك هي تقسيم أي هدف إلى مراحل (Stages).
 لكل مرحلة: عنوان، قائمة مهام مطلوبة، ومكان/مصدر يمكن إيجاد المعلومة أو الأداة فيه.
 كن دقيقاً وواقعياً.
 اللغة: العربية.
 الرد بصيغة JSON فقط بهذا الشكل:
 {
   "stages": [
     {
       "title": "عنوان المرحلة",
       "tasks": ["مهمة 1", "مهمة 2", "مهمة 3"],
       "location": "مكان إيجاد المتطلبات"
     }
   ]
 }
 يجب أن يكون عدد المراحل بالضبط ${stagesCount} مراحل فقط.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  location: { type: Type.STRING }
                },
                required: ["title", "tasks", "location"]
              }
            }
          },
          required: ["stages"]
        },
        temperature: 0.7,
      }
    };

    const response = await generateContentWithFallback(config);
    const text = response.text || "{}";
    const data = JSON.parse(text);
    return data.stages || [];
  } catch (error) {
    console.error("Plan Stages Generation Error:", error);
    return [];
  }
}

export async function refineAIPlan(currentPlan: string, feedback: string) {
  try {
    const config = {
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Current Plan:\n${currentPlan}\n\nUser Feedback/Request: ${feedback}\n\nPlease update the plan accordingly. Maintain the professional Markdown format.` }] 
      }],
      config: {
        systemInstruction: `You are the Shadow Sovereign Planner. 
        Update the existing strategy based on user feedback. 
        Keep it in Arabic, professional, and detailed. 
        Do not start from scratch, build upon the current plan.`,
        temperature: 0.7,
      }
    };

    const response = await generateContentWithFallback(config);
    return response.text || "فشل في تحديث الخطة. حاول مرة أخرى.";
  } catch (error) {
    console.error("Plan Refinement Error:", error);
    return "حدث خطأ أثناء محاولة تحديث الخطة الاستراتيجية.";
  }
}




export async function generateDailyMissions(mood: string, performance: string) {
  if (!ai && !getBackupAI()) return [];
  try {
    const response = await generateContentWithFallback({
      contents: `Generate 3 daily RPG-style missions in Arabic.
      Mood: ${mood} | Perf: ${performance}.
      Optional: durationMinutes.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
        responseSchema: MISSION_SCHEMA
      }
    });
    const data = JSON.parse(response.text || "{}");
    return data.missions || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function arrangeDailySchedule(tasks: any[], dayStartTime: string, systemContext: any) {
  if (!ai && !getBackupAI()) return tasks;

  try {
    const response = await generateContentWithFallback({
      contents: [{ role: 'user', parts: [{ text: `
        Arrange these tasks into a daily schedule starting at ${dayStartTime}.
        Tasks: ${JSON.stringify(tasks)}.
        System Context: ${JSON.stringify(systemContext)}.
        
        Rules:
        1. Maintain existing task IDs.
        2. Insert reasonable breaks (rest, prayer, food) based on duration and context.
        3. Assign new startTime and endTime for all tasks and breaks based on sequential ordering.
        4. Respect priorities (High priority tasks first).
        
        Return ONLY valid JSON array of updated tasks (with new startTime and endTime).
      `}] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              durationMinutes: { type: Type.NUMBER },
              priority: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              completed: { type: Type.BOOLEAN },
              order: { type: Type.NUMBER }
            },
            required: ["id", "title", "durationMinutes", "priority", "startTime", "endTime", "completed", "order"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Smart Arrange Error:", error);
    return tasks;
  }
}

