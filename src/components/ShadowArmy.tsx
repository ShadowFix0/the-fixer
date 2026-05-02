/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Shadow } from '../types';
import { Ghost, Shield, UserPlus } from 'lucide-react';

interface Props {
  shadows: Shadow[];
}

export default function ShadowArmy({ shadows }: Props) {
  return (
    <div className="pro-card p-8 bg-gradient-to-br from-[#121216] to-[#0A0A0C]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Ghost size={18} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#6B7280]">كتيبة الظلال</h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-blue-500/50 uppercase tracking-widest">{shadows.length} Units</span>
      </div>

      {shadows.length === 0 ? (
        <div className="text-center py-10 opacity-20 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
           <Ghost className="mx-auto mb-3" size={32} />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em]">لا توجد ظلال مستدعاة</p>
           <p className="text-[10px] mt-1 italic text-blue-400">"أنهِ المهمات لاستخلاص الظلال..."</p>
        </div>
      ) : (
        <motion.div 
          className="flex flex-wrap gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {shadows.map((shadow) => (
            <motion.div 
              key={shadow.id}
              variants={{
                hidden: { scale: 0, opacity: 0 },
                visible: { scale: 1, opacity: 1 }
              }}
              whileHover={{ y: -4, scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-help transition-all shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30"
              title={`${shadow.name} - رتبة ${shadow.rank}`}
            >
              <img src={shadow.image} alt={shadow.name} className="w-8 h-8 opacity-40 grayscale group-hover:opacity-100 invert brightness-200" />
            </motion.div>
          ))}
        </motion.div>
      )}

      {shadows.length > 0 && (
        <div className="mt-10 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Shield size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">ميزة حماية الظل نشطة</span>
          </div>
          <p className="text-[10px] text-gray-600 italic leading-relaxed">كل جندي من جنود الظل يقلل من الضرر المتلقى بنسبة <span className="text-white font-bold">5%</span>.</p>
        </div>
      )}
    </div>


  );
}
