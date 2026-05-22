/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameState } from './hooks/useGameState';
import { useNotifications } from './hooks/useNotifications';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import CharacterProfile from './components/CharacterProfile';
import HabitList from './components/HabitList';
import MissionBoard from './components/MissionBoard';
import ShadowArmy from './components/ShadowArmy';
import DopamineFast from './components/DopamineFast';
import Store from './components/Store';
import SystemChat from './components/SystemChat';
import SystemMemoryDisplay from './components/SystemMemoryDisplay';
import Plans from './components/Plans';
import DailySchedule from './components/DailySchedule';
import WaterTracker from './components/WaterTracker';
import NotificationToast from './components/NotificationToast';
import { 
  LayoutDashboard, 
  Swords, 
  ScrollText, 
  Ghost, 
  Lock, 
  ShoppingBag, 
  Bell,
  Search,
  Settings,
  CircleUser,
  MessageSquare,
  X,
  Menu,
  Clock,
  BellRing,
  LogOut,
  FileText,
  Map as MapIcon,
  Sun,
  Moon,
  Calendar,
} from 'lucide-react';

class ErrorBoundary extends Component<{children: React.ReactNode}, {error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-8" dir="rtl">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold mb-2">النظام واجه خللاً</h2>
            <p className="text-sm text-gray-500 mb-6 font-mono break-all">{this.state.error.message}</p>
            <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              className="px-6 py-3 bg-blue-600 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all">
              إعادة تحميل النظام
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <ErrorBoundary>
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center gap-6">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            rotate: [0, 10, -10, 0],
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)]"
        >
          <span className="text-white font-black text-5xl italic">S</span>
        </motion.div>
        <div className="text-center">
          <p className="text-blue-500 font-bold tracking-[0.3em] uppercase text-xs animate-pulse">Initializing System...</p>
          <p className="text-gray-600 text-[10px] mt-2 font-mono">Verifying Hunter Credentials</p>
        </div>
        
        {/* Fallback button if stuck for too long */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 8 }}
          onClick={() => {
            localStorage.removeItem('firebase_redirect_pending');
            localStorage.removeItem('shadow_sovereign_guest_user');
            window.location.reload();
          }}
          className="mt-8 px-4 py-2 border border-white/10 rounded-lg text-gray-500 text-[10px] hover:text-white transition-colors"
        >
          النظام عالق؟ اضغط لإعادة الضبط
        </motion.button>
      </div>
    </ErrorBoundary>
    );
  }

  if (!user) {
    return <ErrorBoundary><Login /></ErrorBoundary>;
  }

  return <ErrorBoundary><HunterSystem /></ErrorBoundary>;
}

function HunterSystem() {
  const { user, logout } = useAuth();
  const { 
    state, 
    completeHabit, 
    failHabit, 
    addMission, 
    startMission,
    completeMission, 
    setDopamineFast,
    buyItem,
    addShadow,
    addHabit,
    deleteHabit,
    deleteMission,
    updateSystemMemory,
    ascend,
    recordSync,
    setupNames,
    addPlan,
    deletePlan,
    togglePlanStep,
    updateWaterIntake,
    setWaterGoal,
    markMissionReminderSent,
    setTheme,
    addDailyTask,
    updateDailyTask,
    deleteDailyTask,
    setDayStartTime,
    reorderDailyTasks,
  } = useGameState();

  const [activeTab, setActiveTab] = useState('dashboard');

  const getSystemName = (name: string) => {
    if (state.theme === 'poetry') {
      return name.replace(/النظام/g, 'الشعر');
    }
    return name;
  };

  const handleNavigateTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const {
    permission,
    requestPermission,
    sendLocalNotification,
    toasts,
    dismissToast,
    notifyLevelUp,
    notifyRankUp,
    notifyBossDefeated,
    notifyStreakWarning,
    notifyWaterReminder,
    notifyMissionDeadline,
    notifyDopamineFast,
    testPush,
  } = useNotifications(handleNavigateTab);

  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  
  // ─── Level-Up / Rank-Up / Boss Detection via Refs ──────────────────────────
  const prevLevelRef = useRef(state.character.level);
  const prevRankRef = useRef(state.character.rank);
  const prevBossCountRef = useRef(state.activeBosses.length);

  useEffect(() => {
    if (state.character.level > prevLevelRef.current) {
      notifyLevelUp(state.character.level);
    }
    prevLevelRef.current = state.character.level;
  }, [state.character.level, notifyLevelUp]);

  useEffect(() => {
    if (prevRankRef.current !== state.character.rank && prevRankRef.current !== 'E') {
      notifyRankUp(state.character.rank);
    }
    prevRankRef.current = state.character.rank;
  }, [state.character.rank, notifyRankUp]);

  useEffect(() => {
    // If a boss was removed (defeated), fire notification
    if (prevBossCountRef.current > state.activeBosses.length && prevBossCountRef.current > 0) {
      notifyBossDefeated('زعيم العادة السيئة');
    }
    prevBossCountRef.current = state.activeBosses.length;
  }, [state.activeBosses.length, notifyBossDefeated]);

  const [showSetup, setShowSetup] = useState(false);
  const [playerInput, setPlayerInput] = useState('');
  const [systemInput, setSystemInput] = useState('');

  useEffect(() => {
    if (user && !state.character.name && !showSetup) {
      setShowSetup(true);
    }
  }, [user, state.character.name]);

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerInput.trim() && systemInput.trim()) {
      setupNames(playerInput, systemInput);
      setShowSetup(false);
    }
  };

  // activeTab is now declared above (before useNotifications)
  const [searchTerm, setSearchTerm] = useState('');

  const activeTimedMission = state.missions.find(m => m.startTime && !m.isCompleted);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (permission === 'default') {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [permission]);

  useEffect(() => {
    if (!activeTimedMission) {
      setGlobalTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (activeTimedMission.startTime || 0);
      const remaining = (activeTimedMission.durationMinutes! * 60 * 1000) - elapsed;

      if (remaining <= 0) {
        setGlobalTimeLeft('انتهى الوقت');
        if (remaining > -2000) {
          sendLocalNotification('انتهت المهمة!', {
            body: `لقد انتهى الوقت المخصص لمهمة: ${activeTimedMission.title}`,
            tag: 'mission-end',
            type: 'mission_deadline',
          } as any);
        }
        clearInterval(timer);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setGlobalTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        if (minutes === 1 && seconds === 0) {
          notifyMissionDeadline(activeTimedMission.title, 1);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimedMission, sendLocalNotification, notifyMissionDeadline]);

  // Water Reminder Logic
  useEffect(() => {
    if (!state.waterIntake?.lastWaterTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const lastIntake = state.waterIntake.lastWaterTime;
      const hourInMs = 60 * 60 * 1000;
      const elapsed = now - lastIntake;
      
      // Remind every hour if not drinking
      if (elapsed >= hourInMs && Math.floor(elapsed / 60000) % 60 === 0) {
        if (state.waterIntake.currentMl < (state.waterIntake.targetLiters * 1000)) {
          notifyWaterReminder();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.waterIntake, notifyWaterReminder]);

  // Mission Reminder Check (runs every minute)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      state.missions.forEach(mission => {
        if (mission.isCompleted || mission.reminderSent) return;

        // 1. Timed Missions (using startTime and durationMinutes)
        if (mission.startTime && mission.durationMinutes && mission.reminderTimeMinutes) {
          const deadline = mission.startTime + (mission.durationMinutes * 60 * 1000);
          const reminderThreshold = deadline - (mission.reminderTimeMinutes * 60 * 1000);
          
          if (Date.now() >= reminderThreshold && Date.now() < deadline) {
            notifyMissionDeadline(mission.title, mission.reminderTimeMinutes);
            markMissionReminderSent(mission.id);
          }
        }

        // 2. Scheduled Missions (using dueDate and dueTime)
        if (mission.dueDate && mission.dueTime) {
          try {
            const [year, month, day] = mission.dueDate.split('-').map(Number);
            const [hour, minute] = mission.dueTime.split(':').map(Number);
            const deadline = new Date(year, month - 1, day, hour, minute);
            
            const diffMs = deadline.getTime() - now.getTime();
            const diffMin = Math.floor(diffMs / 60000);

            // Reminder before deadline (if user set reminderTimeMinutes)
            if (mission.reminderTimeMinutes && diffMin <= mission.reminderTimeMinutes && diffMin > 0) {
              notifyMissionDeadline(mission.title, diffMin);
              markMissionReminderSent(mission.id);
            }

            // Overdue notification when deadline passes
            if (diffMs <= 0 && Math.abs(diffMin) === 0) {
              sendLocalNotification('موعد المهمة انتهى!', {
                body: `لقد انتهى الوقت المخصص لمهمة: ${mission.title}`,
                tag: 'mission-overdue',
                type: 'mission_deadline',
              } as any);
              markMissionReminderSent(mission.id);
            }
          } catch (e) {
            console.error("Error parsing mission date:", e);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [state.missions, notifyMissionDeadline, markMissionReminderSent]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredHabits = state.habits.filter(h => 
    h.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredBosses = state.activeBosses.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredMissions = state.missions.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <CharacterProfile stats={state.character} onAscend={ascend} />
              </div>
              <div className="pro-card p-8 flex flex-col justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-blue-500/20 shadow-xl shadow-blue-900/10 hidden lg:flex">
<div className="flex items-center gap-3 mb-6">
  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
    <Ghost size={20} />
  </div>
  <h3 className="text-lg font-bold tracking-tight">إرشادات {getSystemName('النظام')}</h3>
</div>
                <p className="text-sm leading-relaxed text-blue-100/70 italic font-light">
                  "بصفتك ملك الظلال المستقبلي، فإن كل عادة تلتزم بها اليوم تزيد من قوة جيشك غداً. المماطلة هي العدو الأول، فالعالم لا ينتظر الضعفاء."
                </p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="label-caps">معدل الانضباط</span>
                  <span className="text-xl font-bold font-mono text-blue-400">88%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 lg:gap-8">
              <div className="col-span-12 xl:col-span-8 space-y-8 lg:space-y-10">
                 <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-bold tracking-tight">النشاط القتالي</h2>
                      <p className="text-[10px] lg:text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">الطقوس اليومية ومواجهة الزعماء</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="badge-rank hidden sm:block">وضع المعركة: نشط</div>
                    </div>
                 </div>

                 <HabitList 
                  habits={filteredHabits} 
                  activeBosses={filteredBosses}
                  onComplete={completeHabit} 
                  onFail={failHabit} 
                  onAdd={addHabit}
                  onDelete={deleteHabit}
                 />
              </div>

              <div className="col-span-12 xl:col-span-4 space-y-6 lg:space-y-8">
                 <WaterTracker 
                   data={state.waterIntake || { targetLiters: 2, currentMl: 0 }} 
                   onAdd={updateWaterIntake} 
                   onSetGoal={setWaterGoal} 
                 />
                 <ShadowArmy shadows={state.shadows} />
                 
                 <div className="pro-card p-6 border-amber-500/20 bg-amber-950/5">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-4 text-center lg:text-right">أكثر المهمات تأثيراً</h4>
                   {filteredMissions.filter(m => m.type === 'Fated').slice(0, 2).map(m => (
                     <div key={m.id} className="mb-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                       <p className="text-sm font-medium mb-1">{m.title}</p>
                       <p className="text-[10px] text-gray-500 italic">المكافأة: +{m.xpReward} XP</p>
                     </div>
                   ))}
                   {filteredMissions.filter(m => m.type === 'Fated').length === 0 && (
                     <p className="text-[10px] text-gray-600 text-center italic py-4">لا توجد مهمات مصيرية حالية</p>
                   )}
                 </div>
              </div>
            </div>
          </>
        );
      case 'habits':
        return (
          <div className="max-w-4xl mx-auto">
            <HabitList 
              habits={filteredHabits} 
              activeBosses={filteredBosses}
              onComplete={completeHabit} 
              onFail={failHabit} 
              onAdd={addHabit}
              onDelete={deleteHabit}
            />
          </div>
        );
      case 'missions':
        return (
          <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-center w-full lg:text-right">لوحة المهمات</h2>
              </div>
              <MissionBoard 
                missions={filteredMissions} 
                onComplete={completeMission} 
                onStart={startMission}
                onDelete={deleteMission}
                onAddMissions={(newMissions) => newMissions.forEach(addMission)} 
                characterLevel={state.character.level}
                lastSyncDate={state.lastSyncDate}
                onRecordSync={recordSync}
              />
          </div>
        );
      case 'shadows':
        return (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-8 text-center lg:text-right">جيش الظلال الخاص بك</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <ShadowArmy shadows={state.shadows} />
               <div className="pro-card p-8 flex flex-col justify-center border-dashed bg-transparent text-center lg:text-right">
                  <Ghost className="mx-auto lg:mx-0 text-gray-700 mb-4" size={40} />
                  <h4 className="text-lg font-bold mb-2">استخلاص الظلال</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">عندما تهزم زعيماً قوياً (زعيم رتبة S) أو تنهي مهمة مصيرية، يمكنك استخلاص ظله لضمه إلى جيشك.</p>
               </div>
            </div>
          </div>
        );
      case 'store':
        return (
          <div className="max-w-5xl mx-auto">
            <Store 
              gold={state.character.gold} 
              onPurchase={(item) => {
                buyItem(item.price, item.effect);
                if (item.name.includes('استدعاء')) {
                  addShadow({
                    id: `shadow-${Date.now()}`,
                    name: 'جندي عادي',
                    rank: 'E',
                    ability: 'حماية أساسية',
                    image: 'https://img.icons8.com/ios-filled/100/3b82f6/ghost.png',
                    isActive: true
                  });
                }
              }} 
            />
          </div>
        );
      case 'chat':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
<div className="text-center lg:text-right">
  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">{getSystemName('نظام')} التواصل المباشر</h2>
  <p className="text-sm text-gray-500 mt-1">تحدث مع {getSystemName('النظام')} للحصول على مهام مخصصة حسب حالتك</p>
</div>
            <SystemChat 
              onAddMissions={(newMissions) => newMissions.forEach(addMission)} 
              onStartMission={startMission}
              onDeleteMission={deleteMission}
              systemMemory={state.systemMemory}
              onUpdateMemory={updateSystemMemory}
              systemContext={{
                pendingTasks: state.missions.filter(m => !m.isCompleted).length,
                activePlans: state.plans?.length || 0,
                incompletePlans: state.plans?.filter(p => p.steps.some(s => !s.isCompleted)).length || 0,
                waterIntakeMl: state.waterIntake?.currentMl || 0,
                waterTargetMl: (state.waterIntake?.targetLiters || 2) * 1000,
                habitsCompletedToday: state.habits.filter(h => h.completedToday).length,
                habitsTotal: state.habits.length,
                activeBosses: state.activeBosses.length,
                schedulerGoals: state.scheduler?.goals?.length || 0,
                schedulerTasks: state.scheduler?.tasks?.length || 0,
                energyMental: state.scheduler?.energy?.mental || 0,
                energyPhysical: state.scheduler?.energy?.physical || 0,
                burnoutRisk: state.scheduler?.burnoutRisk || 'Low',
              }}
            />
            <div className="mt-12 pt-12 border-t border-white/5">
<div className="mb-6">
  <h3 className="text-lg font-bold tracking-tight">سجل ذاكرة {getSystemName('النظام')}</h3>
  <p className="text-xs text-gray-500">البيانات التي جمعها {getSystemName('النظام')} عنك خلال محادثاتك</p>
</div>
              <SystemMemoryDisplay memory={state.systemMemory || { interests: [], priorities: [], passions: [], dreams: [], problems: [], mistakes: [], otherNotes: [] }} />
            </div>
          </div>
        );
      case 'scheduler':
        return (
          <div className="max-w-6xl mx-auto">
            <DailySchedule
              tasks={state.scheduler.dailySchedule.tasks}
              dayStartTime={state.scheduler.dailySchedule.dayStartTime}
              onAddTask={addDailyTask}
              onUpdateTask={updateDailyTask}
              onDeleteTask={deleteDailyTask}
              onReorderTasks={reorderDailyTasks}
              onSetDayStartTime={setDayStartTime}
            />
          </div>
        );
      case 'plans':
        return (
          <div className="max-w-6xl mx-auto h-full">
            <Plans 
              plans={state.plans || []} 
              onAdd={addPlan} 
              onDelete={deletePlan} 
              onToggleStep={togglePlanStep}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row overflow-hidden font-sans ${state.theme === 'light' ? 'light-theme' : state.theme === 'poetry' ? 'poetry-theme' : ''}`} dir="rtl" style={{ backgroundColor: 'var(--clr-bg)', color: 'var(--clr-text)' }}>
      {/* Initial Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="pro-card p-10 max-w-lg w-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-blue-500/40 shadow-2xl shadow-blue-500/10"
            >
              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40">
                  <Ghost size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">مرحباً بك في {getSystemName('النظام')}</h2>
                <p className="text-sm text-blue-100/60 leading-relaxed italic">"لبدء المزامنة، يحتاج النظام إلى معرفة هويتك وكيف ترغب في مناداتي."</p>
              </div>

              <form onSubmit={handleSetupSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block">اسم اللاعب (أنت)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="مثلاً: سونغ جين وو"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500 transition-all font-light"
                    value={playerInput}
                    onChange={(e) => setPlayerInput(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] block">اسم النظام (الرفيق)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="مثلاً: الخيميائي أو المساعد"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500 transition-all font-light"
                    value={systemInput}
                    onChange={(e) => setSystemInput(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/40 mt-4 active:scale-[0.98]"
                >
                  تأكيد البيانات والمزامنة
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast Overlay */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />

      {/* Dopamine Fast Overlay */}
      <DopamineFast 
        isActive={state.isDopamineFastActive} 
        onDeactivate={() => { setDopamineFast(false); notifyDopamineFast('end'); }} 
      />

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 z-[60] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Modern Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-[70] w-72 border-l flex flex-col backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0 overflow-y-auto
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `} style={{ backgroundColor: 'var(--clr-sidebar)', borderColor: 'var(--clr-border)' }}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                <span className="text-xl font-black text-white italic">S</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none uppercase">سيد الظلال</h1>
                <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">تحديث: طريق السيادة (V3.3)</span>
              </div>
            </div>
            <button className="lg:hidden text-gray-500 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1.5">
            <NavItem 
              icon={<LayoutDashboard size={18} />} 
              label="لوحة القيادة" 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<Swords size={18} />} 
              label="الطقوس اليومية" 
              active={activeTab === 'habits'} 
              onClick={() => { setActiveTab('habits'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<ScrollText size={18} />} 
              label="لوحة المهمات" 
              active={activeTab === 'missions'} 
              onClick={() => { setActiveTab('missions'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<Ghost size={18} />} 
              label="جيش الظلال" 
              active={activeTab === 'shadows'} 
              onClick={() => { setActiveTab('shadows'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<ShoppingBag size={18} />} 
              label="متجر النظام" 
              active={activeTab === 'store'} 
              onClick={() => { setActiveTab('store'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<MessageSquare size={18} />} 
              label="محادثة النظام" 
              active={activeTab === 'chat'} 
              onClick={() => { setActiveTab('chat'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<MapIcon size={18} />} 
              label="خرائط الطريق" 
              active={activeTab === 'plans'} 
              onClick={() => { setActiveTab('plans'); setIsSidebarOpen(false); }} 
            />
            <NavItem 
              icon={<Calendar size={18} />} 
              label="المخطط الذكي" 
              active={activeTab === 'scheduler'} 
              onClick={() => { setActiveTab('scheduler'); setIsSidebarOpen(false); }} 
            />
            <div className="pt-4 mt-4 border-t border-white/5">
              <NavItem 
                icon={<Bell size={18} className="text-amber-500" />} 
                label="اختبار الإشعارات" 
                active={false}
                onClick={() => { testPush(); setIsSidebarOpen(false); }} 
              />
            </div>
          </nav>
        </div>

        <div className="mt-auto p-8 pb-32 lg:pb-8">
          <div className="rounded-2xl p-4 border mb-6" style={{ backgroundColor: 'var(--clr-card)', borderColor: 'var(--clr-border)' }}>
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Lock size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--clr-text-secondary)' }}>صيام الدوبامين</span>
             </div>
             <button 
                onClick={() => { setDopamineFast(true); notifyDopamineFast('start'); }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/40"
             >
                تشغيل وضع التركيز
             </button>
          </div>

          <div className="rounded-2xl p-4 border mb-6" style={{ backgroundColor: 'var(--clr-card)', borderColor: 'var(--clr-border)' }}>
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Swords size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--clr-text-secondary)' }}>اختبار الإشعارات</span>
             </div>
             <button 
                onClick={() => testPush()}
                className="w-full py-2.5 border border-amber-500/30 hover:bg-amber-500/10 text-amber-400 rounded-xl text-xs font-bold transition-all"
             >
                فحص اتصال النظام
             </button>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10" />
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-tight">{state.character.name || state.character.rank}</span>
              <span className="text-[10px] text-gray-500">مستوى {state.character.level} {state.systemName && `| ${state.systemName}`}</span>
            </div>
            <div className="mr-auto flex gap-2">
              <button 
                onClick={() => {
                  if (state.theme === 'light') setTheme('dark');
                  else if (state.theme === 'dark') setTheme('poetry');
                  else setTheme('light');
                }} 
                className="text-gray-500 hover:text-blue-500 transition-colors" 
                title={state.theme === 'light' ? 'الوضع الليلي' : state.theme === 'dark' ? 'الوضع النهاري' : 'الوضع العادي'}
              >
                {state.theme === 'light' ? <Moon size={16} /> : state.theme === 'dark' ? <Sun size={16} /> : <Ghost size={16} />}
              </button>
              <button 
                onClick={logout}
                className="text-[10px] uppercase font-bold text-gray-600 hover:text-red-500 transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-w-0 relative transition-all duration-700 ${state.isDopamineFastActive ? 'blur-2xl grayscale brightness-50 pointer-events-none' : ''}`} style={{ backgroundColor: 'var(--clr-bg)' }}>
        
        {/* Top Header */}
        <header className="h-20 border-b flex items-center justify-between px-4 lg:px-10 sticky top-0 z-30 backdrop-blur-xl shrink-0" style={{ backgroundColor: 'var(--clr-glass)', borderColor: 'var(--clr-border)' }}>
          <div className="flex items-center gap-4 lg:gap-8">
            <button className="lg:hidden p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={14} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث..." 
                className="bg-white/5 border border-white/5 rounded-full py-2 pr-9 pl-4 text-[11px] w-full sm:w-64 focus:outline-none focus:border-blue-500/50 transition-all font-light focus:bg-white/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
             <div className="hidden md:flex items-center gap-4 text-sm text-gray-400 font-mono">
                <span className="text-blue-500 font-bold">نسخة بريمو</span>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center gap-2">
                   <Bell 
                     size={18} 
                     className={`${permission === 'granted' ? 'text-blue-500' : 'text-gray-500'} cursor-pointer hover:text-white transition-colors`} 
                     onClick={() => requestPermission()}
                   />
                   <div className={`w-2 h-2 ${permission === 'granted' ? 'bg-blue-500' : 'bg-red-500'} rounded-full animate-pulse`} />
                </div>
             </div>
             
             <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />

             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 overflow-hidden">
                 {user?.photoURL ? (
                   <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                 ) : (
                   <CircleUser size={18} />
                 )}
               </div>
               
               <button 
                 onClick={logout}
                 className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold transition-colors"
                 title="تسجيل الخروج"
               >
                 <LogOut size={14} />
                 <span className="hidden sm:inline">خروج</span>
               </button>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 pb-32 lg:pb-10 custom-scrollbar scroll-smooth bg-radial-gradient min-h-0">
          <AnimatePresence>
            {showNotificationPrompt && permission === 'default' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                      <BellRing size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">فعل الإشعارات</h4>
                      <p className="text-[10px] text-gray-500">ليقوم النظام بتنبيهك عند اقتراب نهاية المهام أو الأخبار الهامة.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowNotificationPrompt(false)}
                      className="px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors"
                    >
                      لاحقاً
                    </button>
                    <button 
                      onClick={() => {
                        requestPermission();
                        setShowNotificationPrompt(false);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black transition-all shadow-lg shadow-blue-900/40"
                    >
                      تفعيل الآن
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTimedMission && globalTimeLeft && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="mb-8 p-4 lg:p-6 rounded-2xl bg-[#1E293B]/80 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50 animate-pulse shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[.2em]">مهمة نشطة حالياً</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    </div>
                    <h4 className="text-base font-black text-white leading-none">{activeTimedMission.title}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-center sm:text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">الوقت المتبقي</p>
                    <p className="text-3xl font-black font-mono text-blue-400 tracking-tighter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                      {globalTimeLeft}
                    </p>
                  </div>
                  <button 
                    onClick={() => completeMission(activeTimedMission.id)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 shrink-0"
                  >
                    إكمال الآن
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {renderContent()}
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 inset-x-0 h-20 backdrop-blur-xl border-t flex items-center justify-around px-2 z-50 lg:hidden shadow-2xl" style={{ backgroundColor: 'var(--clr-sidebar)', borderColor: 'var(--clr-border)' }}>
        <BottomNavItem 
          icon={<LayoutDashboard size={20} />} 
          label="الرئيسية" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <BottomNavItem 
          icon={<Swords size={20} />} 
          label="القتال" 
          active={activeTab === 'habits'} 
          onClick={() => setActiveTab('habits')} 
        />
        <BottomNavItem 
          icon={<ScrollText size={20} />} 
          label="المهمات" 
          active={activeTab === 'missions'} 
          onClick={() => setActiveTab('missions')} 
        />
        <BottomNavItem 
          icon={<MessageSquare size={20} />} 
          label="النظام" 
          active={activeTab === 'chat'} 
          onClick={() => setActiveTab('chat')} 
        />
        <BottomNavItem 
          icon={<FileText size={20} />} 
          label="الخطط" 
          active={activeTab === 'plans'} 
          onClick={() => setActiveTab('plans')} 
        />
        <BottomNavItem 
          icon={<Calendar size={20} />} 
          label="المخطط" 
          active={activeTab === 'scheduler'} 
          onClick={() => setActiveTab('scheduler')} 
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
          : 'text-gray-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`transition-colors ${active ? 'text-white' : 'text-gray-600 group-hover:text-blue-400'}`}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeTabIndicator"
          className="mr-auto w-1.5 h-1.5 bg-white rounded-full" 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

function BottomNavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 px-3 py-1 rounded-xl transition-all relative ${
        active ? 'text-blue-500' : 'text-gray-500'
      }`}
    >
      <div className={`transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      {active && (
        <motion.div 
          layoutId="bottomNavIndicator"
          className="absolute -top-1 w-1 h-1 bg-blue-500 rounded-full" 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
