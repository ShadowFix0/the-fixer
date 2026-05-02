/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Brain, UserCircle, Target, Flame, Box, ShieldAlert, Sparkles } from 'lucide-react';
import { SystemMemory } from '../types';

interface Props {
  memory: SystemMemory;
}

export default function SystemMemoryDisplay({ memory }: Props) {
  const hasData = memory.bio || memory.interests.length > 0 || memory.passions.length > 0 || memory.dreams.length > 0;

  if (!hasData) {
    return (
      <div className="pro-card p-6 bg-blue-500/5 border-dashed border-blue-500/20 text-center">
        <Brain className="mx-auto text-blue-500/30 mb-3" size={32} />
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">ذاكرة النظام قيد الانتظار</h3>
        <p className="text-[10px] text-gray-600 leading-relaxed italic">
          "تحدث مع النظام في قسم المحادثة ليتعرف على أهدافك، شغفك، وأحلامك. الذاكرة تراكمية وتساعد في تخصيص تجربتك."
        </p>
      </div>
    );
  }

  return (
    <div className="pro-card p-6 lg:p-8 bg-gradient-to-br from-[#121216] to-[#0A0A0C] border-blue-500/20 space-y-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Brain size={80} className="text-blue-500" />
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
          <UserCircle size={24} />
        </div>
        <div>
          <h3 className="text-sm lg:text-base font-black uppercase tracking-tight">سجل بيانات العاهل</h3>
          <p className="text-[10px] text-blue-500/60 font-bold uppercase tracking-widest">تحديثات الذاكرة التلقائية نشطة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Bio Section */}
        {memory.bio && (
          <div className="col-span-full bg-white/5 p-4 rounded-xl border border-white/5">
             <span className="label-caps !text-[9px] mb-2 block">السيرة الشخصية الأساسية</span>
             <p className="text-xs text-gray-300 leading-relaxed font-light">{memory.bio}</p>
          </div>
        )}

        <MemorySection 
          icon={<Target size={14} />} 
          title="الأحلام والأهداف" 
          items={memory.dreams} 
          color="text-amber-400"
          bg="bg-amber-400/10"
        />

        <MemorySection 
          icon={<Flame size={14} />} 
          title="الشغف والاهتمامات" 
          items={[...memory.interests, ...memory.passions]} 
          color="text-blue-400"
          bg="bg-blue-400/10"
        />

        <MemorySection 
          icon={<Box size={14} />} 
          title="الأولويات الحالية" 
          items={memory.priorities} 
          color="text-emerald-400"
          bg="bg-emerald-400/10"
        />

        <MemorySection 
          icon={<ShieldAlert size={14} />} 
          title="المشاكل والعقبات" 
          items={[...memory.problems, ...memory.mistakes]} 
          color="text-red-400"
          bg="bg-red-400/10"
        />
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-50">
         <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-blue-500" />
            <span className="text-[9px] font-bold text-gray-500 uppercase">النظام يحلل بياناتك باستمرار</span>
         </div>
      </div>
    </div>
  );
}

function MemorySection({ icon, title, items, color, bg }: { icon: any, title: string, items: string[], color: string, bg: string }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <motion.span 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-300 font-medium"
          >
            {item}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
