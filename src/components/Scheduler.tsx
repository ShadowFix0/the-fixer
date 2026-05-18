import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, Brain, Zap, Flame, Target, 
  Plus, Trash2, CheckCircle2, AlertTriangle, 
  Sparkles, Loader2, Sun, Moon, TrendingUp, 
  ChevronRight, ChevronLeft, X, ListChecks
} from 'lucide-react';
import { SchedulerGoal, SchedulerTask, SchedulerHabit, SchedulerEnergy, SchedulerPreferences } from '../types';

interface Props {
  goals: SchedulerGoal[];
  habits: SchedulerHabit[];
  tasks: SchedulerTask[];
  energy: SchedulerEnergy;
  preferences: SchedulerPreferences;
  burnoutRisk: 'Low' | 'Medium' | 'High';
  onAddGoal: (goal: SchedulerGoal) => void;
  onAddHabit: (habit: SchedulerHabit) => void;
  onAddTask: (task: SchedulerTask) => void;
  onUpdateGoal: (id: string, updates: Partial<SchedulerGoal>) => void;
  onUpdateTask: (id: string, updates: Partial<SchedulerTask>) => void;
  onDeleteGoal: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onDeleteHabit: (id: string) => void;
  onUpdateEnergy: (energy: Partial<SchedulerEnergy>) => void;
  onUpdatePreferences: (prefs: Partial<SchedulerPreferences>) => void;
  onUpdateBurnoutRisk: (risk: 'Low' | 'Medium' | 'High') => void;
}

export default function Scheduler({
  goals, habits, tasks, energy, preferences, burnoutRisk,
  onAddGoal, onAddHabit, onAddTask, onUpdateGoal, onUpdateTask,
  onDeleteGoal, onDeleteTask, onDeleteHabit,
  onUpdateEnergy, onUpdatePreferences, onUpdateBurnoutRisk
}: Props) {
  const [activeTab, setActiveTab] = useState<'goals' | 'tasks' | 'habits' | 'preferences'>('goals');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: '', description: '', category: 'Personal' as SchedulerGoal['category'],
    priority: 'Medium' as SchedulerGoal['priority'], targetDate: '', estimatedHours: 0
  });

  const [newTask, setNewTask] = useState({
    title: '', description: '', scheduledDate: '', scheduledTime: '',
    durationMinutes: 30, priority: 'Medium' as SchedulerTask['priority'],
    energyRequired: 'Medium' as SchedulerTask['energyRequired'],
    focusRequired: 'Medium' as SchedulerTask['focusRequired']
  });

  const [newHabit, setNewHabit] = useState({
    title: '', frequency: 'Daily' as SchedulerHabit['frequency'],
    preferredTime: '', durationMinutes: 15,
    energyCost: 'Medium' as SchedulerHabit['energyCost'],
    difficulty: 'Medium' as SchedulerHabit['difficulty']
  });

  const today = new Date().toISOString().split('T')[0];

  const handleAddGoal = (e: FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    onAddGoal({
      id: `sgoal-${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      targetDate: newGoal.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: newGoal.estimatedHours || 0,
      completed: false, progress: 0, createdAt: Date.now()
    });
    setNewGoal({ title: '', description: '', category: 'Personal', priority: 'Medium', targetDate: '', estimatedHours: 0 });
    setShowGoalForm(false);
  };

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.scheduledDate || !newTask.scheduledTime) return;
    onAddTask({
      id: `stask-${Date.now()}`,
      title: newTask.title, description: newTask.description,
      scheduledDate: newTask.scheduledDate, scheduledTime: newTask.scheduledTime,
      durationMinutes: newTask.durationMinutes, priority: newTask.priority,
      energyRequired: newTask.energyRequired, focusRequired: newTask.focusRequired,
      completed: false, createdAt: Date.now()
    });
    setNewTask({ title: '', description: '', scheduledDate: '', scheduledTime: '',
      durationMinutes: 30, priority: 'Medium', energyRequired: 'Medium', focusRequired: 'Medium' });
    setShowTaskForm(false);
  };

  const handleAddHabit = (e: FormEvent) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;
    onAddHabit({
      id: `shabit-${Date.now()}`,
      title: newHabit.title, frequency: newHabit.frequency,
      preferredTime: newHabit.preferredTime, durationMinutes: newHabit.durationMinutes,
      energyCost: newHabit.energyCost, difficulty: newHabit.difficulty,
      streak: 0, completedToday: false
    });
    setNewHabit({ title: '', frequency: 'Daily', preferredTime: '', durationMinutes: 15,
      energyCost: 'Medium', difficulty: 'Medium' });
    setShowHabitForm(false);
  };

  const todayTasks = tasks.filter(t => t.scheduledDate === today && !t.completed);
  const todayHabits = habits.filter(h => h.frequency === 'Daily');

  function DifficultyStars({ level }: { level: 'Low' | 'Medium' | 'High' | 'Easy' | 'Medium' | 'Hard' }) {
    const count = level === 'Low' || level === 'Easy' ? 1 : level === 'Medium' ? 2 : 3;
    return (
      <span className="text-[10px] font-mono">
        {'★'.repeat(count)}{'☆'.repeat(3 - count)}
      </span>
    );
  }

  function EnergyBar({ value }: { value: number }) {
    const color = value > 66 ? 'bg-green-500' : value > 33 ? 'bg-amber-500' : 'bg-red-500';
    return (
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all rounded-full`} style={{ width: `${value}%` }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">المخطط الذكي</h2>
          <p className="text-xs text-gray-500 mt-1">مدربك الذكي لتنظيم الوقت وتحقيق الأهداف</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-2 ${
            burnoutRisk === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' :
            burnoutRisk === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            'bg-green-500/10 text-green-400 border border-green-500/20'
          }`}>
            <AlertTriangle size={12} />
            {burnoutRisk === 'High' ? 'خطر الإرهاق: مرتفع' :
             burnoutRisk === 'Medium' ? 'خطر الإرهاق: متوسط' : 'حالة الطاقة: ممتازة'}
          </div>
          <Brain size={20} className="text-blue-500" />
        </div>
      </div>

      {/* Energy Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="pro-card p-6 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">الطاقة العقلية</span>
            </div>
            <span className="text-xl font-black text-blue-400">{energy.mental}%</span>
          </div>
          <EnergyBar value={energy.mental} />
        </div>

        <div className="pro-card p-6 bg-gradient-to-br from-green-600/10 to-emerald-600/10 border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-green-400" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">الطاقة البدنية</span>
            </div>
            <span className="text-xl font-black text-green-400">{energy.physical}%</span>
          </div>
          <EnergyBar value={energy.physical} />
        </div>

        <div className="pro-card p-6 bg-gradient-to-br from-amber-600/10 to-orange-600/10 border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">الأهداف النشطة</span>
            </div>
            <span className="text-xl font-black text-amber-400">{goals.filter(g => !g.completed).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{
                width: `${goals.length > 0 ? Math.round(goals.filter(g => g.completed).length / goals.length * 100) : 0}%`
              }} />
            </div>
            <span className="text-[9px] text-amber-500 font-bold">
              {goals.length > 0 ? Math.round(goals.filter(g => g.completed).length / goals.length * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="pro-card p-6 bg-gradient-to-r from-blue-600/5 to-transparent border-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" />
            <h3 className="text-sm font-bold">جدول اليوم</h3>
          </div>
          <span className="text-[10px] text-gray-500">{today} </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-2xl font-black text-blue-500">{todayTasks.length}</span>
            <p className="text-[10px] text-gray-500 mt-1 font-bold">مهام اليوم</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-2xl font-black text-green-500">{todayHabits.length}</span>
            <p className="text-[10px] text-gray-500 mt-1 font-bold">عادات اليوم</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-2xl font-black text-purple-500">{preferences.maxDailyHours}h</span>
            <p className="text-[10px] text-gray-500 mt-1 font-bold">الحد الأقصى اليومي</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'goals', label: 'الأهداف', icon: Target },
          { id: 'tasks', label: 'المهام', icon: ListChecks },
          { id: 'habits', label: 'العادات', icon: Flame },
          { id: 'preferences', label: 'الإعدادات', icon: Sun },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Goals Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'goals' && (
          <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-400">الأهداف ({goals.length})</h3>
              <button onClick={() => setShowGoalForm(!showGoalForm)}
                className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[10px] font-bold text-blue-500 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5">
                {showGoalForm ? <X size={12} /> : <Plus size={12} />}
                {showGoalForm ? 'إلغاء' : 'هدف جديد'}
              </button>
            </div>

            <AnimatePresence>
              {showGoalForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <form onSubmit={handleAddGoal} className="pro-card p-5 bg-blue-500/5 border-blue-500/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">عنوان الهدف</label>
                        <input required type="text" placeholder="مثلاً: تعلم البرمجة"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">التصنيف</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value as any})}>
                          <option value="Health">صحة</option>
                          <option value="Career">مهنة</option>
                          <option value="Learning">تعلم</option>
                          <option value="Relationships">علاقات</option>
                          <option value="Finance">مال</option>
                          <option value="Personal">شخصي</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">الأولوية</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newGoal.priority} onChange={e => setNewGoal({...newGoal, priority: e.target.value as any})}>
                          <option value="Low">منخفضة</option>
                          <option value="Medium">متوسطة</option>
                          <option value="High">عالية</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">عدد الساعات المطلوبة</label>
                        <input type="number" placeholder="مثلاً: 40"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newGoal.estimatedHours || ''} onChange={e => setNewGoal({...newGoal, estimatedHours: parseInt(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">الوصف</label>
                      <textarea placeholder="ما هو هدفك؟"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 h-20 resize-none"
                        value={newGoal.description} onChange={e => setNewGoal({...newGoal, description: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all">
                      إضافة الهدف
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map(goal => (
                <div key={goal.id} className={`pro-card p-5 border-r-4 ${goal.completed ? 'border-green-500 opacity-50' : goal.priority === 'High' ? 'border-red-500' : goal.priority === 'Medium' ? 'border-amber-500' : 'border-gray-500'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className={`text-sm font-bold ${goal.completed ? 'line-through opacity-50' : ''}`}>{goal.title}</h4>
                      <span className="text-[9px] text-gray-500">{goal.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onUpdateGoal(goal.id, { completed: !goal.completed })}
                        className={`p-2 rounded-lg ${goal.completed ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-500 hover:text-green-500'} transition-all`}>
                        <CheckCircle2 size={16} />
                      </button>
                      <button onClick={() => onDeleteGoal(goal.id)}
                        className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {goal.description && <p className="text-[11px] text-gray-500 mb-3">{goal.description}</p>}
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock size={12} />
                      <span>{goal.estimatedHours} ساعة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      <span>{goal.targetDate}</span>
                    </div>
                  </div>
                  <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-600 mt-1 block">{goal.progress}%</span>
                </div>
              ))}
              {goals.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-white/5 rounded-2xl">
                  <Target className="mx-auto text-gray-700 mb-3" size={32} />
                  <p className="text-[10px] text-gray-600 font-bold">لا توجد أهداف بعد</p>
                  <p className="text-[9px] text-gray-700 mt-1">أضف هدفك الأول لبدء التخطيط</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-400">المهام المجدولة ({tasks.length})</h3>
              <button onClick={() => setShowTaskForm(!showTaskForm)}
                className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[10px] font-bold text-blue-500 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5">
                {showTaskForm ? <X size={12} /> : <Plus size={12} />}
                {showTaskForm ? 'إلغاء' : 'مهمة جديدة'}
              </button>
            </div>

            <AnimatePresence>
              {showTaskForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <form onSubmit={handleAddTask} className="pro-card p-5 bg-blue-500/5 border-blue-500/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">عنوان المهمة</label>
                        <input required type="text" placeholder="مثلاً: حل تمارين الرياضيات"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">التاريخ</label>
                        <input required type="date"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newTask.scheduledDate} onChange={e => setNewTask({...newTask, scheduledDate: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">الوقت</label>
                        <input required type="time"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newTask.scheduledTime} onChange={e => setNewTask({...newTask, scheduledTime: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">المدة (دقائق)</label>
                        <input type="number" placeholder="30"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newTask.durationMinutes} onChange={e => setNewTask({...newTask, durationMinutes: parseInt(e.target.value) || 0})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">الأولوية</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                          <option value="Low">منخفضة</option>
                          <option value="Medium">متوسطة</option>
                          <option value="High">عالية</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all">
                      إضافة المهمة
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {tasks.slice().sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)).map(task => (
                <div key={task.id} className={`pro-card p-4 flex items-center justify-between border-r-4 ${task.completed ? 'border-green-500/30 opacity-50' : task.priority === 'High' ? 'border-red-500' : task.priority === 'Medium' ? 'border-amber-500' : 'border-gray-500'}`}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
                      className={`p-2 rounded-lg ${task.completed ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-500 hover:text-green-500'} transition-all`}>
                      <CheckCircle2 size={14} />
                    </button>
                    <div>
                      <h4 className={`text-xs font-bold ${task.completed ? 'line-through' : ''}`}>{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[9px] text-gray-500">
                        <span><Calendar size={10} className="inline" /> {task.scheduledDate}</span>
                        <span><Clock size={10} className="inline" /> {task.scheduledTime}</span>
                        <span><Zap size={10} className="inline" /> {task.durationMinutes}د</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-600"><DifficultyStars level={task.energyRequired} /></span>
                    <button onClick={() => onDeleteTask(task.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl">
                  <ListChecks className="mx-auto text-gray-700 mb-3" size={32} />
                  <p className="text-[10px] text-gray-600 font-bold">لا توجد مهام مجدولة</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <motion.div key="habits" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-400">عادات المخطط ({habits.length})</h3>
              <button onClick={() => setShowHabitForm(!showHabitForm)}
                className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[10px] font-bold text-blue-500 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5">
                {showHabitForm ? <X size={12} /> : <Plus size={12} />}
                {showHabitForm ? 'إلغاء' : 'عادة جديدة'}
              </button>
            </div>

            <AnimatePresence>
              {showHabitForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <form onSubmit={handleAddHabit} className="pro-card p-5 bg-blue-500/5 border-blue-500/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">العادة</label>
                        <input required type="text" placeholder="مثلاً: قراءة 10 صفحات"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newHabit.title} onChange={e => setNewHabit({...newHabit, title: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">التكرار</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newHabit.frequency} onChange={e => setNewHabit({...newHabit, frequency: e.target.value as any})}>
                          <option value="Daily">يومي</option>
                          <option value="Weekly">أسبوعي</option>
                          <option value="Monthly">شهري</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">الوقت المفضل</label>
                        <input type="time"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newHabit.preferredTime} onChange={e => setNewHabit({...newHabit, preferredTime: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">المدة (دقائق)</label>
                        <input type="number" placeholder="15"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                          value={newHabit.durationMinutes} onChange={e => setNewHabit({...newHabit, durationMinutes: parseInt(e.target.value) || 0})} />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all">
                      إضافة العادة
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map(habit => (
                <div key={habit.id} className="pro-card p-5 border-r-4 border-green-500/30 relative">
                  <button onClick={() => onDeleteHabit(habit.id)}
                    className="absolute top-3 left-3 p-1.5 rounded-lg bg-white/5 text-gray-600 hover:text-red-500 transition-all">
                    <Trash2 size={12} />
                  </button>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold">{habit.title}</h4>
                    <span className="text-[9px] font-bold text-green-500">{habit.frequency === 'Daily' ? 'يومي' : habit.frequency === 'Weekly' ? 'أسبوعي' : 'شهري'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <span><Clock size={10} className="inline" /> {habit.durationMinutes}د</span>
                    {habit.preferredTime && <span>{habit.preferredTime}</span>}
                    <span><DifficultyStars level={habit.difficulty} /></span>
                    {habit.streak > 0 && <span className="text-orange-500"><Flame size={10} className="inline" /> {habit.streak}</span>}
                  </div>
                </div>
              ))}
              {habits.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-white/5 rounded-2xl">
                  <Flame className="mx-auto text-gray-700 mb-3" size={32} />
                  <p className="text-[10px] text-gray-600 font-bold">لا توجد عادات مخططة</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div key="preferences" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400">إعدادات المخطط</h3>
            <div className="pro-card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <Moon size={12} /> وقت النوم
                  </label>
                  <input type="time" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                    value={preferences.sleepStart} onChange={e => onUpdatePreferences({ sleepStart: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                    <Sun size={12} /> وقت الاستيقاظ
                  </label>
                  <input type="time" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                    value={preferences.sleepEnd} onChange={e => onUpdatePreferences({ sleepEnd: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">بداية العمل/الدراسة</label>
                  <input type="time" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                    value={preferences.workStart} onChange={e => onUpdatePreferences({ workStart: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">نهاية العمل/الدراسة</label>
                  <input type="time" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                    value={preferences.workEnd} onChange={e => onUpdatePreferences({ workEnd: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">وقت الإنتاجية القصوى - البداية</label>
                  <input type="time" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                    value={preferences.productivityPeakStart} onChange={e => onUpdatePreferences({ productivityPeakStart: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">وقت الإنتاجية القصوى - النهاية</label>
                  <input type="time" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                    value={preferences.productivityPeakEnd} onChange={e => onUpdatePreferences({ productivityPeakEnd: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">مدة الاستراحة (دقائق)</label>
                  <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                    value={preferences.breakDuration} onChange={e => onUpdatePreferences({ breakDuration: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">الحد الأقصى اليومي (ساعات)</label>
                  <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm"
                    value={preferences.maxDailyHours} onChange={e => onUpdatePreferences({ maxDailyHours: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">تقييم الطاقة العقلية اليوم (%0-100)</label>
                <input type="range" min="0" max="100"
                  className="w-full accent-blue-500" value={energy.mental}
                  onChange={e => onUpdateEnergy({ mental: parseInt(e.target.value) })} />
                <div className="flex justify-between text-[9px] text-gray-600">
                  <span>0%</span>
                  <span className="text-blue-400 font-bold">{energy.mental}%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">تقييم الطاقة البدنية اليوم (%0-100)</label>
                <input type="range" min="0" max="100"
                  className="w-full accent-green-500" value={energy.physical}
                  onChange={e => onUpdateEnergy({ physical: parseInt(e.target.value) })} />
                <div className="flex justify-between text-[9px] text-gray-600">
                  <span>0%</span>
                  <span className="text-green-400 font-bold">{energy.physical}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
