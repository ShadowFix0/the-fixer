/**
 * NotificationToast — RPG-themed foreground notification toasts.
 * Displayed when the app is open and focused.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Crown,
  Swords,
  Hourglass,
  Droplets,
  Brain,
  Skull,
  Flame,
  Ghost,
  Lock,
  X,
  Volume2
} from 'lucide-react';

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  timestamp: number;
}

interface NotificationToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

const TOAST_DURATION = 6000; // 6 seconds

// ─── Type → Visual Config ──────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  border: string;
  glow: string;
  accent: string;
  sound?: boolean;
}> = {
  level_up: {
    icon: <Star size={22} />,
    gradient: 'from-amber-500/20 via-yellow-900/10 to-transparent',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.25)]',
    accent: 'text-amber-400',
    sound: true,
  },
  rank_up: {
    icon: <Crown size={22} />,
    gradient: 'from-orange-600/25 via-red-900/10 to-transparent',
    border: 'border-orange-500/50',
    glow: 'shadow-[0_0_50px_rgba(249,115,22,0.3)]',
    accent: 'text-orange-400',
    sound: true,
  },
  habit_reminder: {
    icon: <Swords size={22} />,
    gradient: 'from-blue-500/15 via-blue-900/10 to-transparent',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    accent: 'text-blue-400',
  },
  mission_deadline: {
    icon: <Hourglass size={22} />,
    gradient: 'from-red-500/15 via-red-900/10 to-transparent',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    accent: 'text-red-400',
  },
  water_reminder: {
    icon: <Droplets size={22} />,
    gradient: 'from-cyan-500/15 via-cyan-900/10 to-transparent',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    accent: 'text-cyan-400',
  },
  ai_insight: {
    icon: <Brain size={22} />,
    gradient: 'from-purple-500/15 via-purple-900/10 to-transparent',
    border: 'border-purple-500/30',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    accent: 'text-purple-400',
  },
  boss_defeated: {
    icon: <Skull size={22} />,
    gradient: 'from-red-600/20 via-red-950/10 to-transparent',
    border: 'border-red-600/40',
    glow: 'shadow-[0_0_40px_rgba(220,38,38,0.25)]',
    accent: 'text-red-500',
    sound: true,
  },
  streak_warning: {
    icon: <Flame size={22} />,
    gradient: 'from-amber-600/15 via-amber-950/10 to-transparent',
    border: 'border-amber-600/30',
    glow: 'shadow-[0_0_30px_rgba(217,119,6,0.15)]',
    accent: 'text-amber-500',
  },
  morning_briefing: {
    icon: <Ghost size={22} />,
    gradient: 'from-blue-500/15 via-indigo-900/10 to-transparent',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    accent: 'text-blue-400',
  },
  dopamine_fast: {
    icon: <Lock size={22} />,
    gradient: 'from-violet-500/15 via-violet-900/10 to-transparent',
    border: 'border-violet-500/30',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.15)]',
    accent: 'text-violet-400',
  },
  system: {
    icon: <Ghost size={22} />,
    gradient: 'from-blue-500/10 via-slate-900/10 to-transparent',
    border: 'border-blue-500/20',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    accent: 'text-blue-400',
  },
};

// ─── Type Labels (Arabic) ──────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  level_up: 'ارتقاء المستوى',
  rank_up: 'ارتقاء الرتبة',
  habit_reminder: 'تذكير الطقوس',
  mission_deadline: 'موعد المهمة',
  water_reminder: 'تذكير الارتواء',
  ai_insight: 'رؤية النظام',
  boss_defeated: 'هُزم الزعيم',
  streak_warning: 'تحذير السلسلة',
  morning_briefing: 'إحاطة الصباح',
  dopamine_fast: 'وضع التركيز',
  system: 'إشعار النظام',
};

function SingleToast({ toast, onDismiss }: { toast: ToastNotification; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.system;
  const label = TYPE_LABELS[toast.type] || TYPE_LABELS.system;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        relative overflow-hidden w-[360px] max-w-[calc(100vw-2rem)]
        bg-gradient-to-l ${config.gradient}
        bg-[#13131a]/95 backdrop-blur-xl
        border ${config.border} rounded-2xl
        ${config.glow}
        cursor-pointer group
      `}
      onClick={() => onDismiss(toast.id)}
      onMouseEnter={() => setProgress(prev => prev)} // Pause on hover (effect handled by clearing interval)
    >
      {/* Content */}
      <div className="p-4 flex items-start gap-3.5">
        {/* Icon */}
        <div className={`
          w-11 h-11 rounded-xl shrink-0 flex items-center justify-center
          bg-white/5 border border-white/5
          ${config.accent}
        `}>
          {config.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${config.accent}`}>
              {label}
            </span>
            {config.sound && (
              <Volume2 size={10} className={`${config.accent} animate-pulse`} />
            )}
          </div>
          <h4 className="text-sm font-bold text-white leading-tight mb-0.5 truncate">
            {toast.title}
          </h4>
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
            {toast.body}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
        >
          <X size={12} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-[2px] w-full bg-white/5">
        <motion.div
          className={`h-full ${config.accent.replace('text-', 'bg-')} opacity-60`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>

      {/* Decorative glow pulse for high-priority types */}
      {(toast.type === 'level_up' || toast.type === 'rank_up' || toast.type === 'boss_defeated') && (
        <div className={`absolute inset-0 rounded-2xl ${config.accent.replace('text-', 'bg-')} opacity-[0.03] animate-pulse pointer-events-none`} />
      )}
    </motion.div>
  );
}

export default function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  // Show max 4 toasts at once
  const visibleToasts = toasts.slice(0, 4);

  return (
    <div className="fixed top-24 left-4 z-[90] flex flex-col gap-3 pointer-events-none" dir="rtl">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <SingleToast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>

      {/* Overflow indicator */}
      <AnimatePresence>
        {toasts.length > 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-gray-500 font-mono text-center pointer-events-auto"
          >
            +{toasts.length - 4} إشعارات أخرى
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
