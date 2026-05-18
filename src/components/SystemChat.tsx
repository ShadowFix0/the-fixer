/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Loader2, Zap, Target, Trash2, Play, Brain } from 'lucide-react';
import { chatWithSystem } from '../services/geminiService';
import { Mission, SystemMemory } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  missions?: Mission[];
}

interface Props {
  onAddMissions: (missions: Mission[]) => void;
  onStartMission: (id: string) => void;
  onDeleteMission: (id: string) => void;
  systemMemory?: SystemMemory;
  onUpdateMemory: (memory: Partial<SystemMemory>) => void;
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
  };
}

export default function SystemChat({ onAddMissions, onStartMission, onDeleteMission, systemMemory, onUpdateMemory, systemContext }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'أهلاً بك أيها العاهل. أنا ذاكرة النظام المستدامة. أخبرني عن خططك، أحلامك، عمرك، أو حتى مشاكلك.. سأقوم بتسجيل كل ما تقوله لأساعدك في رحلة الارتقاء للمستوى التالي.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customMsg?: string) => {
    const userMsg = (customMsg || input).trim();
    if (!userMsg || loading) return;

    if (!customMsg) setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const data = await chatWithSystem(userMsg, history, systemMemory, systemContext);
      
      let formattedMissions: Mission[] = [];
      if (data && data.missions && data.missions.length > 0) {
        formattedMissions = data.missions.map((m: any, i: number) => ({
          ...m,
          id: `ai-chat-${Date.now()}-${i}`,
          isCompleted: false
        }));
        onAddMissions(formattedMissions);
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: data?.message || "النظام استعاد توازنه. كيف يمكنني مساعدتك؟",
        missions: formattedMissions 
      }]);

      if (data?.memoryUpdate) {
        onUpdateMemory(data.memoryUpdate);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'حدث خطأ في قنوات الاتصال. جرب المحاولة لاحقاً.' }]);
    } finally {
      setLoading(false);
    }
  };

  const statusEmojis = [
    { emoji: '🔥', label: 'مستعد', text: 'أنا بشعور قتالي عالي ومستعد للعمل!' },
    { emoji: '😫', label: 'متعب', text: 'أشعر ببعض الإرهاق وأحتاج مهام خفيفة.' },
    { emoji: '🧠', label: 'تركيز', text: 'أنا في حالة تركيز عميق حالياً.' },
    { emoji: '🥊', label: 'تحدي', text: 'أريد تحدياً حقيقياً لليوم!' },
  ];

  return (
    <div className="pro-card h-[65vh] sm:h-[600px] flex flex-col bg-[#121216]/80 border-blue-500/20 overflow-hidden shadow-2xl relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="relative p-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all shadow-lg bg-blue-600 shadow-blue-500/20">
            <Bot size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-white/90">نظام الظل السيادي</h3>
            <p className="text-[9px] font-black uppercase tracking-widest mt-0.5 text-blue-400">
              قنوات الاتصال نشطة
            </p>
          </div>
        </div>
        <Sparkles size={16} className="text-blue-500 animate-pulse" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar scroll-smooth relative">



        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
              <div className="flex flex-col gap-3 max-w-[85%] sm:max-w-[80%]">
                <div className={`flex items-start gap-2.5 lg:gap-4 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-7 h-7 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                    msg.role === 'user' ? 'bg-white/5 text-gray-400 border border-white/5' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-3.5 lg:p-5 rounded-2xl text-[13px] lg:text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-white/5 border border-white/5 text-gray-300 rounded-tr-none' 
                      : 'bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-xl shadow-black/20 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>

                {msg.role === 'model' && msg.missions && msg.missions.length > 0 && (
                  <div className="mr-auto w-full space-y-2 mt-2">
                    <div className="flex items-center gap-2 mb-1 px-2">
                      <Target size={12} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">المهام المقترحة</span>
                    </div>
                    {msg.missions.map((mission) => (
                      <div key={mission.id} className="pro-card p-4 border-white/5 bg-white/5 flex items-center justify-between group">
                        <div className="flex flex-col gap-1">
                          <h5 className="text-[11px] font-bold text-white">{mission.title}</h5>
                          <p className="text-[9px] text-gray-500 italic line-clamp-1">{mission.description}</p>
                        </div>
                        <div className="flex gap-2">
                          {mission.durationMinutes && !mission.startTime && !mission.isCompleted && (
                            <button 
                              onClick={() => {
                                onStartMission(mission.id);
                                setMessages(prev => prev.map(m => ({
                                  ...m,
                                  missions: m.missions?.map(ms => ms.id === mission.id ? { ...ms, startTime: Date.now() } : ms)
                                })));
                              }}
                              className="p-2 rounded-lg bg-orange-500/10 text-orange-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-500 hover:text-white"
                              title="بدء المهمة"
                            >
                              <Play size={12} fill="currentColor" />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              onDeleteMission(mission.id);
                              setMessages(prev => prev.map(m => ({
                                ...m,
                                missions: m.missions?.filter(ms => ms.id !== mission.id)
                              })));
                            }}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                            title="حذف المهمة"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <Loader2 className="animate-spin text-blue-500" size={18} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 lg:p-6 border-t border-white/5 bg-black/40 shrink-0 space-y-4">
        {/* Quick Emojis */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar-hide">
          {statusEmojis.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s.text)}
              disabled={loading}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600/20 hover:border-blue-500/30 transition-all flex items-center gap-2 shrink-0 group"
            >
              <span className="text-base group-hover:scale-125 transition-transform">{s.emoji}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="أخبر النظام بخطتك..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 lg:py-4 pr-12 pl-4 text-xs lg:text-sm focus:outline-none focus:border-blue-500/50 transition-all font-light placeholder:text-gray-600"
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-11 lg:h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-500 transition-all disabled:opacity-30 shadow-lg shadow-blue-900/40"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[8px] lg:text-[9px] text-gray-500 text-center uppercase tracking-widest font-bold opacity-50">
          سيقوم النظام بتحليل حالتك وتخصيص مهامك القتالية
        </p>
      </div>
    </div>
  );
}
