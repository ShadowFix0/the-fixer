/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Timer, LogOut, Lock, Ban, Loader2, Sparkles } from 'lucide-react';
import { getDopamineFastGuidance } from '../services/geminiService';

interface Props {
  isActive: boolean;
  onDeactivate: () => void;
}

interface Guidance {
  prohibitedActions: string[];
  systemMotivation: string;
}

export default function DopamineFast({ isActive, onDeactivate }: Props) {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour default
  const [guidance, setGuidance] = useState<Guidance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onDeactivate();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onDeactivate]);

  useEffect(() => {
    if (isActive && !guidance) {
      const fetchGuidance = async () => {
        setIsLoading(true);
        const data = await getDopamineFastGuidance();
        setGuidance(data);
        setIsLoading(false);
      };
      fetchGuidance();
    } else if (!isActive) {
      setGuidance(null);
      setTimeLeft(3600);
    }
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black transition-all"
        >
          {/* Subtle noise effect */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center relative z-10 px-6 py-12 h-full overflow-y-auto custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-8">
                <Lock size={12} />
                تم تفعيل بروتوكول التركيز
              </div>

              <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 w-full">
                {/* Timer Section */}
                <div className="flex-1 text-center space-y-8">
                  <h2 className="text-xs font-bold text-gray-600 uppercase tracking-[0.5em]">الوقت المتبقي لانتهاء البروتوكول</h2>
                  <div className="text-7xl md:text-9xl font-black text-white tracking-tighter font-mono filter drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    {formatTime(timeLeft)}
                  </div>

                  <div className="space-y-4 max-w-xs mx-auto">
                    <p className="text-[10px] text-gray-500 font-light leading-relaxed uppercase tracking-widest">
                      بمجرد الانتهاء من العزلة، سيعيد النظام تخصيص الموارد لرفع سماتك الدائمة.
                    </p>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500"
                            animate={{ x: i === 1 ? [-32, 32] : 0 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Guidance Section */}
                <div className="flex-1 w-full max-w-md">
                   <div className="pro-card p-6 lg:p-8 bg-blue-500/5 border-blue-500/10 space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                      
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Sparkles size={16} className="text-blue-500" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">توجيهات النظام</h3>
                         </div>
                         {isLoading && <Loader2 size={14} className="animate-spin text-blue-500/50" />}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                           <Ban size={14} className="text-red-500/70" />
                           <span className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest">الأفعال المحظورة (الطقوس المحرمة)</span>
                        </div>
                        
                        <div className="space-y-2.5">
                          {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                            ))
                          ) : guidance?.prohibitedActions.map((action, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + (i * 0.1) }}
                              className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3 group/item border-r-2 border-r-red-500/0 hover:border-r-red-500/50 transition-all"
                            >
                               <span className="text-[10px] font-mono text-gray-700">0{i+1}</span>
                               <span className="text-xs text-gray-300 font-medium">{action}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {!isLoading && guidance && (
                        <div className="pt-4 border-t border-white/5 italic">
                           <p className="text-[11px] text-blue-500/80 leading-relaxed font-bold">
                             "{guidance.systemMotivation}"
                           </p>
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="mt-16">
                <button 
                  onClick={onDeactivate}
                  className="px-12 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 hover:text-red-500 hover:border-red-500 transition-all group overflow-hidden relative"
                >
                  <span className="relative z-10">إنهاء بروتوكول التركيز</span>
                  <div className="absolute inset-0 bg-red-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          </div>

          <footer className="absolute bottom-8 left-0 right-0 text-center opacity-30">
             <span className="text-[10px] font-mono text-gray-800 uppercase tracking-widest">
                Logic: Sovereign_OS v.2.4.12 | وحدة التركيز المتكيف نشطة
             </span>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
