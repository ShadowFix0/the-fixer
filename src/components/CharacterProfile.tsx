/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { CharacterStats } from '../types';
import { Sparkles, ArrowUpCircle } from 'lucide-react';
import { RANK_THRESHOLDS } from '../constants';

interface Props {
  stats: CharacterStats;
  onAscend?: () => void;
}

export default function CharacterProfile({ stats, onAscend }: Props) {
  const xpPercentage = (stats.xp / stats.maxXp) * 100;
  const hpPercentage = (stats.hp / stats.maxHp) * 100;

  const ranks = ['E', 'D', 'C', 'B', 'A', 'S'] as const;
  const currentIndex = ranks.indexOf(stats.rank);
  const nextRank = currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
  const threshold = nextRank ? RANK_THRESHOLDS[nextRank] : Infinity;
  const canAscend = stats.level >= threshold;

  return (
    <div className="relative group">
      <AnimatePresence>
        {canAscend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-4 -left-4 z-20"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={onAscend}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center gap-3 border border-amber-400/50 group/btn overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              <ArrowUpCircle size={20} className="animate-bounce" />
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">طقوس الارتقاء</p>
                <p className="text-xs font-bold leading-none mt-1">الرتبة {nextRank} متاحة</p>
              </div>
              <Sparkles size={16} className="text-amber-200 animate-pulse" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pro-card p-6 lg:p-10 flex flex-col xl:flex-row items-center justify-between gap-8 xl:gap-0 relative overflow-hidden">
        {/* Animated Background for Ritual */}
        {canAscend && (
          <motion.div 
            animate={{ 
              opacity: [0.05, 0.1, 0.05],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-amber-500/5 pointer-events-none"
          />
        )}

        <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-10 text-center sm:text-right w-full xl:w-auto relative z-10">
        <div className="relative group shrink-0">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
             <span className="text-3xl lg:text-4xl font-black text-white italic">S</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-black border-4 border-[#18181F] flex items-center justify-center text-blue-500 font-bold text-xs ring-2 ring-blue-500/20">
            {stats.level}
          </div>
        </div>

        <div className="space-y-2 lg:space-y-1">
          <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
             <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight uppercase">{stats.name || "العاهل المستذئب"}</h1>
             <div className="badge-rank">{stats.rank}</div>
          </div>
          <p className="text-[10px] lg:text-xs font-bold text-blue-500/80 uppercase tracking-[0.2em] max-w-[200px] sm:max-w-none">المسار: {stats.job || "سيد الظلال الهجين"}</p>
        </div>
      </div>

      <div className="w-full xl:w-72 space-y-5 lg:space-y-6">
        {/* HP Bar */}
        <div className="space-y-1.5 lg:space-y-2">
           <div className="flex justify-between items-end">
              <span className="label-caps !text-[8px] lg:!text-[9px] !text-red-500/80">نقاط الحيوية</span>
              <span className="text-xs lg:text-sm font-mono font-bold text-white leading-none">{stats.hp}<span className="text-gray-600"> / {stats.maxHp}</span></span>
           </div>
           <div className="progress-bg h-2 overflow-hidden">
              <motion.div 
                className="progress-fill-danger h-full"
                initial={{ width: 0 }}
                animate={{ width: `${hpPercentage}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
           </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-1.5 lg:space-y-2">
           <div className="flex justify-between items-end">
              <span className="label-caps !text-[8px] lg:!text-[9px] !text-blue-500/80">مستوى الخبرة</span>
              <span className="text-xs lg:text-sm font-mono font-bold text-white leading-none">{stats.xp}<span className="text-gray-600"> / {stats.maxXp}</span></span>
           </div>
           <div className="progress-bg h-1.5 border border-white/5 overflow-hidden">
              <motion.div 
                className="progress-fill-accent h-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8 lg:gap-12 w-full xl:w-auto xl:border-r border-white/5 xl:pr-12 pt-6 xl:pt-0 border-t xl:border-t-0 border-white/5">
         <div className="text-center w-full sm:w-auto">
            <span className="label-caps block mb-2">رصيد النظام</span>
            <div className="flex items-center justify-center sm:justify-end gap-2">
               <span className="text-xl lg:text-2xl font-black text-amber-500 font-mono tracking-tighter">{stats.gold.toLocaleString()}</span>
               <span className="text-[10px] lg:text-xs font-bold text-amber-500/50 uppercase">ذهب</span>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-x-8 gap-y-3 lg:gap-x-6 lg:gap-y-2 w-full sm:w-auto place-items-center sm:place-items-start">
             <SmallStat label="قوة" value={stats.strength} color="text-red-500" />
             <SmallStat label="ذكاء" value={stats.intelligence} color="text-blue-500" />
             <SmallStat label="سرعة" value={stats.agility} color="text-emerald-500" />
             <SmallStat label="حيوية" value={stats.vitality} color="text-orange-500" />
         </div>
      </div>
    </div>
  </div>
  );
}

function SmallStat({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold text-gray-600 w-8">{label}</span>
      <span className={`text-xs font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}
