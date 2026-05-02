/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Zap, Shield, TrendingUp, Ghost } from 'lucide-react';
import { CharacterStats } from '../types';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  effect: string;
}

const STORE_ITEMS: StoreItem[] = [
  {
    id: '1',
    name: 'جرعة تجديد الطاقة',
    description: 'تستعيد 50 نقطة من نقاط الحيوية فوراً.',
    price: 200,
    icon: <Zap className="text-blue-400" />,
    effect: 'تجديد حياة +50'
  },
  {
    id: '2',
    name: 'درع الظل المؤقت',
    description: 'يقلل الضرر المتلقى من الزعماء بنسبة 20% للمهمة القادمة.',
    price: 500,
    icon: <Shield className="text-amber-400" />,
    effect: 'دفاع +20%'
  },
  {
    id: '3',
    name: 'حجر التطوير العشوائي',
    description: 'يزيد إحدى خصائصك (STR/INT/AGI) بمقدار نقطه واحدة.',
    price: 1500,
    icon: <TrendingUp className="text-emerald-400" />,
    effect: 'خاصية +1'
  },
  {
    id: '4',
    name: 'استدعاء ظل مجهول',
    description: 'يضيف جندي ظل عشوائي إلى كتيبتك.',
    price: 5000,
    icon: <Ghost className="text-purple-400" />,
    effect: 'جندي ظل +1'
  }
];

interface Props {
  gold: number;
  onPurchase: (item: StoreItem) => void;
}

export default function Store({ gold, onPurchase }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">متجر النظام</h2>
          <p className="text-sm text-gray-500 mt-1">استبدل الذهب بمعدات وحلفاء أقوياء</p>
        </div>
        <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-500/70">رصيدك الحالي</span>
          <span className="text-2xl font-black text-amber-500 font-mono">{gold.toLocaleString()}G</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STORE_ITEMS.map((item) => (
          <div key={item.id} className="pro-card p-6 flex items-center justify-between pro-card-hover group">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white mb-1">{item.name}</h4>
                <p className="text-xs text-gray-500 max-w-xs">{item.description}</p>
                <div className="inline-block mt-3 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-blue-500/20">
                  {item.effect}
                </div>
              </div>
            </div>

            <button 
              onClick={() => onPurchase(item)}
              disabled={gold < item.price}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                gold >= item.price 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40' 
                  : 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5'
              }`}
            >
              شراء ({item.price}G)
            </button>
          </div>
        ))}
      </div>

      <div className="pro-card p-10 text-center border-dashed border-white/5 bg-transparent mt-12">
         <p className="text-xs text-gray-600 italic">"يتم تحديث المتجر عند كل ترقية للرتبة..."</p>
      </div>
    </div>
  );
}
