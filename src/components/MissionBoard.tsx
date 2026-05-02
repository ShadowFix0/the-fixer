/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mission } from '../types';
import { Scroll, Sparkles, Target, Zap, Loader2, Trash2, Clock, Play, Plus, Calendar, X } from 'lucide-react';
import { generateDailyMissions } from '../services/geminiService';

interface Props {
  missions: Mission[];
  onComplete: (id: string) => void;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  onAddMissions: (newMissions: Mission[]) => void;
  characterLevel: number;
  lastSyncDate?: string;
  onRecordSync: () => void;
}

export default function MissionBoard({ missions, onComplete, onStart, onDelete, onAddMissions, characterLevel, lastSyncDate, onRecordSync }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    type: 'Quick' as 'Quick' | 'Fated',
    dueDate: '',
    dueTime: '',
    durationMinutes: 0
  });

  const today = new Date().toISOString().split('T')[0];
  const hasSyncedToday = lastSyncDate === today;

  const handleGenerate = async () => {
    if (hasSyncedToday) return;
    setLoading(true);
    setError(null);
    try {
      const performance = characterLevel > 10 ? 'High' : 'Improving';
      const aiMissions = await generateDailyMissions('Focused', performance);
      
      if (aiMissions.length === 0) {
        throw new Error("لم يتمكن النظام من توليد مهام، تأكد من إعدادات المفتاح.");
      }

      const formattedMissions: Mission[] = aiMissions.map((m: any, index: number) => ({
        ...m,
        id: `ai-${Date.now()}-${index}`,
        isCompleted: false
      }));
      onAddMissions(formattedMissions);
      onRecordSync();
    } catch (err) {
      console.error(err);
      setError("فشل الاتصال بالنظام. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMission.title) return;

    const mission: Mission = {
      id: `manual-${Date.now()}`,
      title: newMission.title,
      description: newMission.description || 'مهمة يدوية مضافة من قبل الصياد',
      type: newMission.type,
      isCompleted: false,
      xpReward: newMission.type === 'Fated' ? 150 : 50,
      goldReward: newMission.type === 'Fated' ? 100 : 20,
      dueDate: newMission.dueDate,
      dueTime: newMission.dueTime,
      durationMinutes: newMission.durationMinutes > 0 ? newMission.durationMinutes : undefined
    };

    onAddMissions([mission]);
    setNewMission({ title: '', description: '', type: 'Quick', dueDate: '', dueTime: '', durationMinutes: 0 });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Target size={18} />
           </div>
           <h3 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">لوحة المهمات الحالية</h3>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-[10px] text-red-500 font-bold animate-pulse">{error}</span>}
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all border ${
              showAddForm 
                ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {showAddForm ? <X size={12} /> : <Plus size={12} />}
            {showAddForm ? 'إلغاء' : 'إضافة مهمة'}
          </button>

          <button 
            onClick={handleGenerate}
            disabled={loading || hasSyncedToday || missions.filter(m => !m.isCompleted).length > 3}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600/10 border border-blue-500/30 text-blue-500 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative"
          >
            {loading ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
            {hasSyncedToday ? 'تم المزامنة اليوم' : 'تزامن مع النظام'}
            
            {hasSyncedToday && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 p-2 bg-black border border-white/10 rounded-lg text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
                لا يمكنك المزامنة أكثر من مرة في اليوم الواحد.
              </div>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddManual} className="pro-card p-6 bg-blue-500/5 border-blue-500/20 mb-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">عنوان المهمة</label>
                  <input 
                    required
                    type="text" 
                    placeholder="مثلاً: التمرين الصباحي المكثف..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-light"
                    value={newMission.title}
                    onChange={(e) => setNewMission({...newMission, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">نوع المهمة</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-light appearance-none"
                    value={newMission.type}
                    onChange={(e) => setNewMission({...newMission, type: e.target.value as any})}
                  >
                    <option value="Quick">مهمة سريعة (+50 XP)</option>
                    <option value="Fated">مهمة مصيرية (+150 XP)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">الوصف (اختياري)</label>
                <textarea 
                  placeholder="مالذي تنوي تحقيقه في هذه المهمة؟"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-light h-20 resize-none"
                  value={newMission.description}
                  onChange={(e) => setNewMission({...newMission, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">التاريخ</label>
                  <input 
                    type="date" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-light"
                    value={newMission.dueDate}
                    onChange={(e) => setNewMission({...newMission, dueDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">وقت التنفيذ</label>
                  <input 
                    type="time" 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-light"
                    value={newMission.dueTime}
                    onChange={(e) => setNewMission({...newMission, dueTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">المؤقت (بالدقائق)</label>
                  <input 
                    type="number" 
                    placeholder="مثلاً: 30"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-light"
                    value={newMission.durationMinutes || ''}
                    onChange={(e) => setNewMission({...newMission, durationMinutes: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Scroll size={18} />
                  تفعيل المهمة اليدوية
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {missions.map((mission) => (
            <MissionCard 
              key={mission.id} 
              mission={mission} 
              onComplete={() => onComplete(mission.id)} 
              onStart={() => onStart(mission.id)}
              onDelete={() => onDelete(mission.id)}
            />
          ))}
        </AnimatePresence>
        
        {missions.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center pro-card border-dashed bg-transparent">
            <Scroll className="mx-auto text-gray-700 mb-4" size={40} />
            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">النظام في حالة سكون</p>
            <p className="text-[10px] text-gray-600 italic mt-2">"تزامن مع النظام للحصول على مهام جديدة..."</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MissionCard({ mission, onComplete, onStart, onDelete }: { mission: Mission, onComplete: () => void, onStart: () => void, onDelete: () => void, key?: string }) {
  const isFated = mission.type === 'Fated';
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (!mission.startTime || !mission.durationMinutes || mission.isCompleted) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (mission.startTime || 0);
      const remaining = (mission.durationMinutes! * 60 * 1000) - elapsed;

      if (remaining <= 0) {
        setTimeLeft('انتهى الوقت');
        clearInterval(timer);
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [mission.startTime, mission.durationMinutes, mission.isCompleted]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`pro-card p-6 flex flex-col justify-between group cursor-default h-full ${
        mission.isCompleted ? 'opacity-30 grayscale' : 'pro-card-hover'
      } ${isFated ? 'border-amber-500/20 bg-gradient-to-br from-[#1E1E1F] to-[#251D0D]' : ''}`}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-2">
            <div className={`text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest ${
              isFated ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {isFated ? 'مهمة مصيرية' : 'مهمة سريعة'}
            </div>
            {mission.durationMinutes && !mission.startTime && !mission.isCompleted && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                <Clock size={10} />
                <span>المدة: {mission.durationMinutes} دقيقة</span>
              </div>
            )}
            {mission.startTime && !mission.isCompleted && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-tighter shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse">
                <Clock size={12} className="text-blue-400" />
                <span className="font-mono text-xs">{timeLeft || '...'}</span>
              </div>
            )}
            {(mission.dueDate || mission.dueTime) && !mission.isCompleted && (
              <div className="flex items-center gap-2 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-[8px] font-bold text-amber-500 uppercase tracking-widest">
                <Calendar size={10} />
                <span>{mission.dueDate || 'اليوم'} @ {mission.dueTime || '--:--'}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-900/10"
              title="حذف المهمة"
            >
              <Trash2 size={14} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-600 hover:text-white cursor-pointer">
              <Scroll size={14} />
            </div>
          </div>
        </div>

        <h4 className={`text-lg font-black tracking-tight mb-2 leading-tight ${mission.isCompleted ? 'line-through opacity-50' : 'text-white'}`}>
          {mission.title}
        </h4>
        <p className="text-xs text-gray-500 italic font-light leading-relaxed line-clamp-3">
          {mission.description}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex gap-4">
           <div className="flex flex-col">
              <span className="label-caps !text-[8px]">المكافأة</span>
              <span className="text-sm font-mono font-bold text-blue-400">+{mission.xpReward} XP</span>
           </div>
           <div className="flex flex-col">
              <span className="label-caps !text-[8px]">النظام</span>
              <span className="text-sm font-mono font-bold text-amber-500">+{mission.goldReward}G</span>
           </div>
        </div>
        
        <div className="flex gap-2">
          {mission.durationMinutes && !mission.startTime && !mission.isCompleted && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onStart}
              className="w-10 h-10 rounded-xl bg-orange-600 hover:bg-orange-500 flex items-center justify-center text-white transition-all shadow-lg shadow-orange-900/40"
              title="بدء المهمة"
            >
              <Play size={18} fill="currentColor" />
            </motion.button>
          )}
          
          {!mission.isCompleted && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onComplete}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-all shadow-lg shadow-blue-900/40"
              title="إكمال المهمة"
            >
              <Zap size={18} fill="currentColor" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}


