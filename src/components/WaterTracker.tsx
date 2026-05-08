import { useState } from 'react';
import { motion } from 'motion/react';
import { Droplets, Plus, Settings2, CheckCircle2 } from 'lucide-react';
import { WaterIntake } from '../types';

interface Props {
  data: WaterIntake;
  onAdd: (ml: number) => void;
  onSetGoal: (liters: number) => void;
}

export default function WaterTracker({ data, onAdd, onSetGoal }: Props) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(data.targetLiters.toString());
  
  // Custom amount logic
  const [customAmount, setCustomAmount] = useState(() => {
    const saved = localStorage.getItem('water_tracker_custom_amount');
    return saved ? parseInt(saved) : 250;
  });

  const handleCustomAmountChange = (val: string) => {
    const num = parseInt(val) || 0;
    setCustomAmount(num);
    localStorage.setItem('water_tracker_custom_amount', num.toString());
  };

  const progress = Math.min(100, (data.currentMl / (data.targetLiters * 1000)) * 100);
  const isGoalReached = progress >= 100;

  return (
    <div className="pro-card p-6 bg-[#121216]/60 border-blue-500/20 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5">
            <Droplets size={20} className={data.currentMl > 0 ? "animate-bounce" : ""} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white/90 uppercase tracking-tight">مستوى الارتواء</h3>
            <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">تتبع استلاك المياه اليومي</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsEditingGoal(!isEditingGoal)}
          className="p-2 text-gray-500 hover:text-blue-400 transition-colors bg-white/5 rounded-lg border border-white/5 hover:border-blue-500/30"
        >
          <Settings2 size={16} />
        </button>
      </div>

      <div className="space-y-8 relative z-10">
        {/* Progress Bar & Stats */}
        <div>
          <div className="flex justify-between items-end mb-4 font-mono">
            <div className="space-y-1">
                 <motion.span 
                   key={data.currentMl}
                   initial={{ scale: 0.8, opacity: 0.5 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="text-3xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)] inline-block"
                 >
                   {(data.currentMl / 1000).toFixed(1)}
                 </motion.span>
                 <span className="text-[10px] font-bold text-gray-500 ml-2 uppercase">لتر</span>
              </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-500 block mb-1">الهدف اليومي</span>
              <span className="text-white font-bold">{data.targetLiters}L</span>
            </div>
          </div>

          <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 40, damping: 12 }}
              className={`h-full rounded-full relative overflow-hidden ${isGoalReached ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}
            >
              {/* Ultra Smooth Wave Effect */}
              <motion.div 
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        {isEditingGoal ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-600/5 rounded-xl border border-blue-500/20 space-y-3"
          >
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block text-center">ضبط الهدف اليومي (لتر)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                step="0.5"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-center focus:border-blue-500 transition-all outline-none text-white"
              />
              <button 
                onClick={() => {
                  onSetGoal(parseFloat(newGoal) || 2);
                  setIsEditingGoal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition-all"
              >
                تطبيق
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-1.5 bg-white/5 border border-white/5 rounded-2xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <input 
                  type="number" 
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold focus:outline-none text-blue-400 placeholder:text-gray-600"
                  placeholder="الكمية..."
                />
                <span className="text-[10px] font-bold text-gray-600 uppercase">مل</span>
              </div>
              <button
                onClick={() => onAdd(customAmount)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 shadow-lg shadow-blue-900/40 font-bold text-xs"
              >
                <Plus size={16} />
                إضافة
              </button>
            </div>
            <p className="text-[9px] text-center text-gray-500 font-bold uppercase tracking-widest">
              قم بتعديل الكمية وسيتم حفظها تلقائياً
            </p>
          </div>
        )}

        {isGoalReached && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-3 py-2 text-emerald-400 font-bold text-xs"
          >
            <CheckCircle2 size={16} />
            تم تحقيق هدف اليوم! جسمك شاكر لك.
          </motion.div>
        )}
      </div>
    </div>
  );
}
