import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Layout, BookOpen, Dumbbell, Utensils, Target, Sparkles, Loader2, MessageSquare, Send } from 'lucide-react';
import { Plan } from '../types';
import { generateAIPlan, refineAIPlan } from '../services/geminiService';

interface Props {
  plans: Plan[];
  onAddPlan: (plan: Plan) => void;
  onDeletePlan: (id: string) => void;
  onUpdatePlan: (id: string, content: string) => void;
}

export default function Plans({ plans, onAddPlan, onDeletePlan, onUpdatePlan }: Props) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plans[0]?.id || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [refinementText, setRefinementText] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const content = await generateAIPlan(topic);
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        title: topic,
        content: content,
        category: 'الخطة المقترحة',
        createdAt: Date.now()
      };
      onAddPlan(newPlan);
      setSelectedPlanId(newPlan.id);
      setShowInput(false);
      setTopic('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!selectedPlan || !refinementText.trim() || isRefining) return;

    setIsRefining(true);
    try {
      const updatedContent = await refineAIPlan(selectedPlan.content, refinementText);
      onUpdatePlan(selectedPlan.id, updatedContent);
      setRefinementText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefining(false);
    }
  };

  const categories = [
    { label: 'تمارين', icon: <Dumbbell size={16} /> },
    { label: 'دراسة', icon: <BookOpen size={16} /> },
    { label: 'تغذية', icon: <Utensils size={16} /> },
    { label: 'أهداف', icon: <Target size={16} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
      {/* Sidebar - Plans List */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <button 
          onClick={() => setShowInput(true)}
          className="pro-card p-4 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40"
        >
          <Plus size={18} />
          <span className="font-bold text-sm">صياغة خطة جديدة</span>
        </button>

        <div className="pro-card flex-1 bg-[#121216]/50 border-white/5 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">سجل الخطط</span>
            <Layout size={14} className="text-gray-500" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {plans.map(plan => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`w-full text-right p-3 rounded-xl transition-all flex items-center justify-between group ${
                  selectedPlanId === plan.id ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' : 'hover:bg-white/5 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className={`w-2 h-2 rounded-full ${selectedPlanId === plan.id ? 'bg-blue-500 animate-pulse' : 'bg-gray-700'}`} />
                  <span className="text-xs font-medium truncate">{plan.title}</span>
                </div>
                <Trash2 
                  size={14} 
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:scale-125 transition-all" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePlan(plan.id);
                    if (selectedPlanId === plan.id) setSelectedPlanId(null);
                  }}
                />
              </button>
            ))}
            {plans.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600 opacity-50">
                <Sparkles size={30} className="mb-2" />
                <p className="text-[10px] uppercase tracking-widest font-bold">لا توجد خطط حالية</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Plan Display */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {showInput ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pro-card p-10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-blue-500/30 h-full flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black mb-2">ما هي خطتك القادمة؟</h2>
              <p className="text-blue-100/60 text-sm mb-10 max-w-sm">أخبر النظام بما تريد تحقيقه (مثلاً: خطة تمارين للمبتدئين، أو خطة مذاكرة مكثفة) وسيقوم الذكاء الاصطناعي بصياغتها لك.</p>
              
              <div className="w-full max-w-md space-y-6">
                <input 
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: خطة تمارين منزلية لمدة شهر"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500 transition-all text-center"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.map((c, i) => (
                    <button 
                      key={i}
                      onClick={() => setTopic(c.label + ' ')}
                      className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowInput(false)}
                    className="flex-1 py-4 bg-white/5 rounded-xl text-xs font-bold hover:bg-white/10 transition-all text-gray-500"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={handleGenerate}
                    disabled={!topic.trim() || isGenerating}
                    className="flex-3 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {isGenerating ? 'جاري صياغة الخطة...' : 'ابدأ الصياغة'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : selectedPlan ? (
            <motion.div
              key={selectedPlan.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pro-card h-full bg-[#121216]/50 border-white/5 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">{selectedPlan.title}</h3>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">
                    تم الإنشاء: {new Date(selectedPlan.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                <button 
                  onClick={() => setShowInput(true)}
                  className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar content-display">
                <div className="prose prose-invert max-w-none pb-20">
                  {selectedPlan.content.split('\n').map((line, i) => {
                    if (line.startsWith('#')) {
                      return <h4 key={i} className="text-xl font-black text-blue-500 mt-6 mb-4">{line.replace(/#/g, '').trim()}</h4>;
                    }
                    if (line.startsWith('*') || line.startsWith('-')) {
                      return <li key={i} className="text-sm text-gray-300 mb-2 list-none flex items-start gap-3">
                        <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
                        {line.replace(/^[*|-]\s*/, '')}
                      </li>;
                    }
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} className="text-sm text-gray-400 leading-relaxed mb-4">{line}</p>;
                  })}
                </div>
              </div>

              {/* Refinement Area */}
              <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
                <div className="flex gap-2 max-w-4xl mx-auto">
                   <div className="flex-1 relative">
                    <input 
                      type="text"
                      value={refinementText}
                      onChange={(e) => setRefinementText(e.target.value)}
                      placeholder="ناقش الخطة مع النظام.. (مثلاً: تعمق في النقطة الثانية)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pr-4 pl-10 py-3 text-xs focus:outline-none focus:border-blue-500/50 transition-all font-light"
                      onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                    />
                    <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                   </div>
                   <button 
                    onClick={handleRefine}
                    disabled={!refinementText.trim() || isRefining}
                    className="aspect-square bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-900/40 disabled:opacity-30"
                   >
                     {isRefining ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                   </button>
                </div>
                <p className="text-[9px] text-gray-600 mt-2 text-center uppercase tracking-widest font-black">قنوات اتصال النظام مفتوحة للتعديل</p>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
               <div className="w-20 h-20 border-2 border-dashed border-gray-600 rounded-3xl flex items-center justify-center mb-6">
                  <Layout size={40} className="text-gray-600" />
               </div>
               <h3 className="text-xl font-bold text-gray-300">لم يتم اختيار أي خطة</h3>
               <p className="text-sm text-gray-500 mt-2">اختر خطة من القائمة الجانبية أو ابدأ بصياغة واحدة جديدة.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
