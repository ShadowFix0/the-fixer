/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, Difficulty, Boss } from '../types';
import { Check, X, Swords, ShieldAlert, Plus, Trash2, Flame, TrendingUp } from 'lucide-react';

interface Props {
  habits: Habit[];
  activeBosses: Boss[];
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onAdd: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function HabitList({ habits, activeBosses, onComplete, onFail, onAdd, onDelete }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', difficulty: 'Normal' as Difficulty, isPositive: false });

  const rites = habits.filter(h => h.isPositive);
  // Defeated bosses are those that are not positive and don't have an active boss entity (fully removed)
  const defeatedHabits = habits.filter(h => !h.isPositive && h.streak > 0 && !activeBosses.some(b => b.habitId === h.id));

  const handleAddHabit = () => {
    if (!newHabit.title.trim()) return;
    onAdd({
      id: Date.now().toString(),
      title: newHabit.title,
      difficulty: newHabit.difficulty,
      isPositive: newHabit.isPositive,
      completedToday: false,
      failedToday: false,
      streak: 0
    });
    setNewHabit({ title: '', difficulty: 'Normal', isPositive: false });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight">إدارة الكيانات والطقوس</h2>
          <p className="text-[10px] lg:text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">تحكم في أعدائك وطقوسك اليومية</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-lg shadow-blue-900/40"
        >
          <Plus size={14} />
          إضافة كيان جديد
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pro-card p-6 lg:p-8 bg-blue-500/5 border-blue-500/20 overflow-hidden"
          >
            <h4 className="text-base lg:text-lg font-bold mb-6">تحديد كيان جديد في النظام</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 lg:space-y-4">
                <label className="label-caps !text-[9px] lg:!text-[10px]">اسم الكيان (أو القوة المعادية)</label>
                <input 
                  type="text" 
                  value={newHabit.title}
                  onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                  placeholder="مثلاً: المماطلة، الأكل غير الصحي..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs lg:text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-gray-700"
                />
              </div>
              <div className="space-y-3 lg:space-y-4">
                <label className="label-caps !text-[9px] lg:!text-[10px]">مستوى الخطورة (الصعوبة)</label>
                <div className="flex gap-2">
                  {(['Easy', 'Normal', 'Hardcore'] as any[]).map((d) => (
                    <button 
                      key={d}
                      onClick={() => setNewHabit({ ...newHabit, difficulty: d as Difficulty })}
                      className={`flex-1 py-3 rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        newHabit.difficulty === d 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {d === 'Easy' ? 'سهل' : d === 'Normal' ? 'عادي' : 'صارم'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 lg:space-y-4">
                <label className="label-caps !text-[9px] lg:!text-[10px]">تصنيف الكيان</label>
                <div className="flex gap-2">
                  {[
                    { label: 'عدو', val: false },
                    { label: 'طقس', val: true }
                  ].map((t) => (
                    <button 
                      key={t.label}
                      onClick={() => setNewHabit({ ...newHabit, isPositive: t.val })}
                      className={`flex-1 py-3 rounded-xl text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        newHabit.isPositive === t.val 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 lg:gap-4 mt-2 sm:mt-0">
                <button 
                  onClick={handleAddHabit}
                  className="flex-grow py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  تأكيد الإرسال
                </button>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all text-center"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boss Section - More Professional Focus */}
      {activeBosses.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2 sm:px-0">
             <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                <ShieldAlert size={18} />
             </div>
             <h3 className="text-[11px] lg:text-sm font-bold uppercase tracking-widest text-[#6B7280]">كيانات الظلال المعادية</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <AnimatePresence mode="popLayout">
              {activeBosses.map((boss) => {
                const habit = habits.find(h => h.id === boss.habitId);
                if (!habit) return null;
                return (
                  <motion.div
                    key={boss.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ 
                      scale: [1, 1.05, 0.8, 1.2, 0],
                      rotate: [0, -2, 2, -5, 10, 0],
                      filter: [
                        'brightness(1) contrast(1) blur(0px)',
                        'brightness(2) contrast(2) blur(2px)',
                        'brightness(10) contrast(5) blur(10px)',
                        'brightness(0) contrast(1) blur(20px)'
                      ],
                      opacity: [1, 1, 0.8, 0],
                      transition: { duration: 0.8, ease: "easeInOut" }
                    }}
                  >
                    <BossCard 
                      boss={boss} 
                      habit={habit}
                      onComplete={() => onComplete(habit.id)} 
                      onFail={() => onFail(habit.id)} 
                      onDelete={() => onDelete(habit.id)} 
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Defeated Bosses - Subtle acknowledgement */}
      {defeatedHabits.length > 0 && (
        <section className="space-y-4 opacity-40 grayscale group px-2 sm:px-0">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 rounded bg-gray-500/10 flex items-center justify-center text-gray-500">
                <Check size={12} />
             </div>
             <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">كيانات تم إخضاعها بالكامل</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {defeatedHabits.map(h => (
              <div key={h.id} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-bold text-gray-500 uppercase tracking-widest italic flex items-center gap-3 transition-all hover:bg-white/10 group">
                <span>{h.title}</span>
                <span className="text-[7px] bg-red-500/20 text-red-500/50 px-1 rounded">تم التطهير</span>
                <button 
                  onClick={() => onDelete(h.id)}
                  className="p-1 rounded hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rites Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2 sm:px-0">
           <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Swords size={18} />
           </div>
           <h3 className="text-[11px] lg:text-sm font-bold uppercase tracking-widest text-[#6B7280]">الطقوس التصاعدية</h3>
        </div>
        <div className="pro-card divide-y divide-white/5 overflow-hidden">
          {rites.map((rite) => (
            <HabitCard key={rite.id} habit={rite} onComplete={() => onComplete(rite.id)} onDelete={() => onDelete(rite.id)} />
          ))}
          {rites.length === 0 && (
            <div className="p-8 text-center text-gray-600 italic text-xs font-light">لا توجد طقوس نشطة لهذا اليوم</div>
          )}
        </div>
      </section>
    </div>
  );
}

function HabitCard({ habit, onComplete, onDelete }: { habit: Habit, onComplete: () => void, onDelete: () => void, key?: any }) {
  const isLocked = habit.completedToday || habit.failedToday;

  return (
    <div className={`flex items-center justify-between p-4 transition-all ${habit.completedToday ? 'bg-emerald-500/5 opacity-50' : habit.failedToday ? 'bg-red-500/5 opacity-50' : 'hover:bg-white/[0.02]'}`}>
      <div className="flex items-center gap-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${habit.completedToday ? 'bg-emerald-500/20 text-emerald-400' : habit.failedToday ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'}`}>
          {habit.failedToday ? <X size={20} /> : <Check size={20} />}
        </div>
        <div>
          <h4 className="text-sm font-bold tracking-tight mb-0.5">{habit.title}</h4>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              {habit.difficulty === 'Easy' ? 'سهل' : habit.difficulty === 'Normal' ? 'عادي' : 'صارم'}
            </span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  filter: [
                    'drop-shadow(0 0 2px rgba(239, 68, 68, 0.5))',
                    'drop-shadow(0 0 8px rgba(249, 115, 22, 0.8))',
                    'drop-shadow(0 0 2px rgba(239, 68, 68, 0.5))'
                  ]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-orange-500"
              >
                <Flame size={14} fill="currentColor" />
              </motion.div>
              <span className="text-[10px] font-mono text-orange-400 font-bold tracking-tight">{habit.streak}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isLocked && (
          <button 
            onClick={onComplete}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-900/40"
          >
            إنجاز الطقس
          </button>
        )}
        {habit.completedToday && <span className="text-[10px] text-emerald-500 font-bold uppercase">تم الإنجاز</span>}
        {habit.failedToday && <span className="text-[10px] text-red-500 font-bold uppercase">فشل المحاولة</span>}
        <button 
          onClick={onDelete}
          className="p-2.5 rounded-xl bg-white/5 text-gray-700 hover:text-red-500 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function BossCard({ boss, habit, onComplete, onFail, onDelete }: { boss: Boss, habit: Habit, onComplete: () => void, onFail: () => void, onDelete: () => void, key?: any }) {
  const hpPercentage = (boss.hp / boss.maxHp) * 100;
  const isLocked = habit.completedToday || habit.failedToday;

  return (
    <div className="pro-card p-6 pro-card-hover group border-red-500/10 bg-gradient-to-br from-[#1A1A1F] to-[#121216] relative overflow-hidden">
       {/* Phase Indicator Background */}
       {boss.phase > 1 && (
         <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
       )}

       <button 
         onClick={onDelete}
         className="absolute top-4 left-4 p-2 rounded-lg bg-white/5 text-gray-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
       >
         <Trash2 size={14} />
       </button>
       
       <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 ${boss.phase > 1 ? 'bg-orange-500/10 text-orange-500 shadow-orange-900/10' : 'bg-red-500/10 text-red-500 shadow-red-900/10'} rotate-3 group-hover:rotate-0`}>
                <span className="text-3xl">{boss.phase > 1 ? '👑' : '👹'}</span>
             </div>
             <div>
                <h4 className="text-lg font-bold text-white tracking-tight">{boss.name}</h4>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                    {boss.phase === 1 ? 'رتبة كشف' : 'رتبة عاهل'}
                  </p>
                  {boss.phase > 1 && (
                    <span className="flex items-center gap-1 text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                       تحدي أسبوعي
                    </span>
                  )}
                </div>
             </div>
          </div>
          <div className="text-[10px] font-mono font-bold text-gray-600 opacity-50 uppercase">PH-{boss.phase}</div>
       </div>

       <div className="space-y-3 mb-10 relative z-10">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
             <span>قوة المقاومة</span>
             <span className="font-mono">{Math.ceil(boss.hp)} / {boss.maxHp} HP</span>
          </div>
          <div className="boss-hp-container h-1.5 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
              className={`h-full ${boss.phase > 1 ? 'bg-gradient-to-l from-orange-600 to-red-600' : 'bg-red-600'}`}
              initial={{ width: '100%' }}
              animate={{ width: `${hpPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
             />
          </div>
          {boss.phase > 1 && (
            <div className="flex items-center gap-2 text-[9px] text-gray-500 font-medium">
              <TrendingUp size={10} />
              <span>يتطلب {Math.ceil(boss.hp / (boss.maxHp / 7))} ضربات يومية إضافية للإخضاع التام</span>
            </div>
          )}
       </div>

       <div className="flex gap-4 relative z-10">
          <button 
            onClick={onComplete}
            disabled={isLocked}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              habit.completedToday 
              ? 'bg-emerald-600 text-white' 
              : isLocked 
              ? 'bg-white/5 opacity-30 cursor-not-allowed'
              : 'bg-white/5 border border-white/5 hover:bg-emerald-600 hover:text-white'
            }`}
          >
            {habit.completedToday ? 'تمت الضربة اليوم' : 'توجيه ضربة'}
          </button>
          <button 
            onClick={onFail}
            disabled={isLocked}
            className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              habit.failedToday 
              ? 'bg-red-600 text-white shadow-lg' 
              : isLocked 
              ? 'bg-white/5 opacity-30 cursor-not-allowed'
              : 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
            }`}
          >
            {habit.failedToday ? 'تم الاستسلام' : 'استسلام'}
          </button>
       </div>
       
       {isLocked && (
         <p className="mt-4 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest italic animate-pulse">
            تم تسجيل نشاط هذا اليوم. عد غداً للمواصلة.
         </p>
       )}
    </div>
  );
}
