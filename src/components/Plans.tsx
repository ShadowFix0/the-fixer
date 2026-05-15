/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plan, PlanStep } from '../types';
import { generatePlanStages } from '../services/geminiService';
import { 
  Compass, 
  Map as MapIcon, 
  Plus, 
  Trash2, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  Star, 
  Zap, 
  Target,
  Trophy,
  ChevronLeft,
  X,
  Sparkles,
  Loader2,
  MapPin,
  ListChecks
} from 'lucide-react';

interface Props {
  plans: Plan[];
  onAdd: (plan: Plan) => void;
  onDelete: (id: string) => void;
  onToggleStep: (planId: string, stepId: string) => void;
}

export default function Plans({ plans, onAdd, onDelete, onToggleStep }: Props) {
  const [activePlanId, setActivePlanId] = useState<string | null>(plans[0]?.id || null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    category: 'Strategic',
    stepTitle: ''
  });
  const [tempSteps, setTempSteps] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [showStagesPrompt, setShowStagesPrompt] = useState(false);
  const [stagesCount, setStagesCount] = useState(5);
  const [pendingTopic, setPendingTopic] = useState('');

  const activePlan = plans.find(p => p.id === activePlanId);

  const initiateAIPlan = () => {
    if (!aiTopic.trim()) return;
    setPendingTopic(aiTopic);
    setShowStagesPrompt(true);
  };

  const confirmAIPlan = async () => {
    setShowStagesPrompt(false);
    setAiLoading(true);
    try {
      const stages = await generatePlanStages(pendingTopic, stagesCount);
      if (stages.length === 0) return;

      const plan: Plan = {
        id: `plan-${Date.now()}`,
        title: pendingTopic,
        description: `خطة ذكية مولدة وفقاً لهدف: ${pendingTopic}`,
        category: 'Strategic',
        steps: stages.map((s: any, index: number) => ({
          id: `step-${Date.now()}-${index}`,
          title: s.title,
          isCompleted: false,
          type: index === stages.length - 1 ? 'boss' : (index % 3 === 0 ? 'milestone' : 'mission'),
          tasks: s.tasks || [],
          location: s.location || ''
        })),
        currentStepIndex: 0,
        createdAt: Date.now()
      };

      onAdd(plan);
      setAiTopic('');
      setPendingTopic('');
      setActivePlanId(plan.id);
    } catch (error) {
      console.error('AI Generation Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title || tempSteps.length === 0) return;

    const plan: Plan = {
      id: `plan-${Date.now()}`,
      title: newPlan.title,
      description: newPlan.description,
      category: newPlan.category,
      steps: tempSteps.map((title, index) => ({
        id: `step-${Date.now()}-${index}`,
        title,
        isCompleted: false,
        type: index === tempSteps.length - 1 ? 'boss' : (index % 3 === 0 ? 'milestone' : 'mission'),
        tasks: [],
        location: ''
      })),
      currentStepIndex: 0,
      createdAt: Date.now()
    };

    onAdd(plan);
    setNewPlan({ title: '', description: '', category: 'Strategic', stepTitle: '' });
    setTempSteps([]);
    setShowCreateForm(false);
    setActivePlanId(plan.id);
  };

  const addTempStep = () => {
    if (!newPlan.stepTitle) return;
    setTempSteps([...tempSteps, newPlan.stepTitle]);
    setNewPlan({ ...newPlan, stepTitle: '' });
  };

  const calculateProgress = (plan: Plan) => {
    const completed = plan.steps.filter(s => s.isCompleted).length;
    return Math.round((completed / plan.steps.length) * 100);
  };

  return (
    <div className="min-h-[600px] flex flex-col lg:flex-row gap-6 p-4 lg:p-0">
      {/* Sidebar: Plans List */}
      <div className="w-full lg:w-72 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
              <Compass className="text-blue-500" size={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">خرائط الطريق</h3>
           </div>
           <button 
             onClick={() => setShowCreateForm(true)}
             className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all"
           >
             <Plus size={16} />
           </button>
        </div>

        <div className="flex flex-col gap-3">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setActivePlanId(plan.id)}
              className={`p-4 rounded-2xl border transition-all text-right relative overflow-hidden group ${
                activePlanId === plan.id 
                ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-900/20' 
                : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                  plan.category === 'Strategic' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'
                }`}>
                  {plan.category}
                </span>
                {activePlanId === plan.id && (
                  <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-3 truncate">{plan.title}</h4>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress(plan)}%` }}
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                />
              </div>
            </button>
          ))}
          
          {plans.length === 0 && (
            <div className="py-10 text-center border border-dashed border-white/5 rounded-2xl">
              <p className="text-[10px] text-gray-600 uppercase font-bold">لا يوجد خطط نشطة</p>
            </div>
          )}
        </div>
      </div>

      {/* Main View: Level Map */}
      <div className="flex-1 bg-[#121216]/50 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col shadow-2xl">
        <AnimatePresence mode="wait">
          {activePlan ? (
            <motion.div 
              key={activePlan.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight mb-1">{activePlan.title}</h2>
                  <p className="text-xs text-gray-500 italic">{activePlan.description || 'رحلة استراتيجية لتطوير الذات'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">إجمالي التقدم</span>
                    <span className="text-xl font-black text-white">{calculateProgress(activePlan)}%</span>
                  </div>
                  <button 
                    onClick={() => onDelete(activePlan.id)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Map Scroll Area */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                {/* SVG Connections Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
                  <path 
                    d={generateMapPath(activePlan.steps.length)}
                    fill="none" 
                    stroke="url(#lineGradient)" 
                    strokeWidth="4" 
                    strokeDasharray="12 12"
                    className="animate-pulse"
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="flex flex-col items-center gap-16 pb-20 pt-10">
                  {activePlan.steps.map((step, index) => {
                    const isLocked = index > activePlan.currentStepIndex;
                    const isCurrent = index === activePlan.currentStepIndex;
                    const isCompleted = step.isCompleted;
                    
                    // Zig-zag logic
                    const xOffset = index % 2 === 0 ? 'translateX(60px)' : 'translateX(-60px)';
                    
                    return (
                      <div 
                        key={step.id} 
                        className="relative z-10 flex flex-col items-center"
                        style={{ transform: xOffset }}
                      >
                        <motion.button
                          whileHover={{ scale: isLocked ? 1 : 1.1 }}
                          whileTap={{ scale: isLocked ? 1 : 0.9 }}
                          onClick={() => !isLocked && onToggleStep(activePlan.id, step.id)}
                          className={`
                            w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all relative
                            ${isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-900/40' : 
                              isCurrent ? 'bg-gradient-to-br from-blue-600 to-cyan-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] ring-4 ring-blue-500/30' : 
                              'bg-[#1A1A20] border border-white/10 opacity-50'}
                          `}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="text-white" size={32} />
                          ) : isLocked ? (
                            <Lock className="text-gray-600" size={24} />
                          ) : (
                            getStepIcon(step.type, 32)
                          )}

                          {/* Level Badge */}
                          <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 border-[#121216] flex items-center justify-center text-[10px] font-black ${
                            isCompleted ? 'bg-green-500 text-white' : 
                            isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'
                          }`}>
                            {index + 1}
                          </div>
                          
                          {isCurrent && (
                            <motion.div 
                              layoutId="current-glow"
                              className="absolute inset-0 rounded-[2rem] bg-blue-500/20 animate-ping pointer-events-none" 
                            />
                          )}
                        </motion.button>

                        <div className="mt-4 text-center">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${
                             isLocked ? 'text-gray-700' : isCurrent ? 'text-blue-400' : 'text-green-500'
                           }`}>
                             {step.type === 'boss' ? '🏆 التحدي الأخير' : step.type === 'milestone' ? '✨ نقطة تحول' : '⚔️ مهمة'}
                           </span>
                           <h5 className={`text-xs font-bold mt-1 max-w-[160px] ${isLocked ? 'text-gray-600' : 'text-white'}`}>
                             {step.title}
                           </h5>
                           {!isLocked && step.tasks && step.tasks.length > 0 && (
                             <div className="mt-3 text-right max-w-[200px]">
                               <div className="flex items-center gap-1.5 mb-1">
                                 <ListChecks size={10} className="text-blue-500" />
                                 <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">المتطلبات</span>
                               </div>
                               <ul className="space-y-1">
                                 {step.tasks.map((task, ti) => (
                                   <li key={ti} className="text-[9px] text-gray-400 leading-relaxed flex items-start gap-1.5">
                                     <span className="text-blue-500/50 mt-0.5">•</span>
                                     {task}
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           )}
                           {!isLocked && step.location && (
                             <div className="mt-2 flex items-center gap-1.5 justify-center">
                               <MapPin size={10} className="text-amber-500" />
                               <span className="text-[8px] text-amber-500/70 font-bold">{step.location}</span>
                             </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-blue-600/5 flex items-center justify-center mb-6">
                <MapIcon className="text-blue-500/20" size={48} />
              </div>
              <h2 className="text-xl font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">اختر خريطة طريق</h2>
              <p className="text-xs text-gray-600 max-w-xs leading-relaxed italic">
                "كل رحلة تبدأ بخطوة، وكل سيادة تبدأ بخطة محكمة. اختر استراتيجيتك الآن."
              </p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="mt-8 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                إنشاء أول خريطة طريق
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Form Overlay */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-[#121216] border border-white/10 rounded-[3rem] p-8 relative z-110 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <button 
                onClick={() => setShowCreateForm(false)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">رسم خريطة جديدة</h3>
                  <p className="text-xs text-gray-500">صمم رحلة تطويرك القادمة</p>
                </div>
              </div>

              {/* AI Generation */}
              <div className="mb-8 p-5 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-[2rem]">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={18} className="text-blue-500" />
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">توليد ذكي بالذكاء الاصطناعي</h4>
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="اكتب هدفك... مثلاً: تعلم البرمجة"
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && initiateAIPlan()}
                  />
                  <button 
                    type="button"
                    onClick={initiateAIPlan}
                    disabled={aiLoading || !aiTopic.trim()}
                    className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    توليد
                  </button>
                </div>

                <AnimatePresence>
                  {showStagesPrompt && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-blue-400" />
                          <span className="text-xs font-bold text-blue-400">حدد عدد المراحل</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {[3, 5, 7, 10].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setStagesCount(n)}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                                stagesCount === n 
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                              }`}
                            >
                              {n} مراحل
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setShowStagesPrompt(false); setPendingTopic(''); setAiTopic(''); }}
                            className="px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-white transition-colors"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={confirmAIPlan}
                            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
                          >
                            <Sparkles size={14} />
                            تأكيد التوليد
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest bg-[#121216]">أو أنشئ يدوياً</span>
                </div>
              </div>

              <form onSubmit={handleAddPlan} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">عنوان الخطة</label>
                    <input 
                      required
                      type="text" 
                      placeholder="مثلاً: اتقان البرمجة..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
                      value={newPlan.title}
                      onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">التصنيف</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 transition-all appearance-none"
                      value={newPlan.category}
                      onChange={(e) => setNewPlan({...newPlan, category: e.target.value})}
                    >
                      <option value="Strategic">استراتيجية</option>
                      <option value="Training">تدريب</option>
                      <option value="Knowledge">معرفة</option>
                      <option value="Project">مشروع</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">الوصف (اختياري)</label>
                  <textarea 
                    placeholder="ما هو الهدف النهائي من هذه الرحلة؟"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 transition-all h-24 resize-none"
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">مراحل الرحلة ({tempSteps.length})</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="عنوان المرحلة..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
                      value={newPlan.stepTitle}
                      onChange={(e) => setNewPlan({...newPlan, stepTitle: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTempStep())}
                    />
                    <button 
                      type="button"
                      onClick={addTempStep}
                      className="px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all"
                    >
                      أضف
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {tempSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-[10px] font-black text-blue-400">{idx + 1}</span>
                          <span className="text-xs text-white">{step}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setTempSteps(tempSteps.filter((_, i) => i !== idx))}
                          className="text-gray-600 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!newPlan.title || tempSteps.length === 0}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/40 disabled:opacity-50 disabled:grayscale"
                >
                  تفعيل خريطة الطريق الجديدة
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helpers
function getStepIcon(type: 'mission' | 'milestone' | 'boss', size: number) {
  switch (type) {
    case 'boss': return <Trophy className="text-white" size={size} />;
    case 'milestone': return <Star className="text-white" size={size} />;
    default: return <Zap className="text-white" size={size} />;
  }
}

function generateMapPath(stepsCount: number) {
  if (stepsCount === 0) return "";
  let path = "M 50% 50";
  for (let i = 1; i < stepsCount; i++) {
    const y = i * 140 + 50;
    const x = i % 2 === 0 ? "calc(50% + 60px)" : "calc(50% - 60px)";
    path += ` L ${x} ${y}`;
  }
  return ""; // SVG path in React with dynamic values is tricky, using a simpler approach
}
