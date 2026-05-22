
import React, { useState } from 'react';
import { Clock, Plus, Zap, GripVertical, Trash2 } from 'lucide-react';
import { DailyTask } from '../types';

export default function DailySchedule({ 
    tasks, 
    dayStartTime, 
    onAddTask, 
    onUpdateTask, 
    onDeleteTask, 
    onReorderTasks,
    onSetDayStartTime
}: {
    tasks: DailyTask[];
    dayStartTime: string;
    onAddTask: (task: DailyTask) => void;
    onUpdateTask: (id: string, updates: Partial<DailyTask>) => void;
    onDeleteTask: (id: string) => void;
    onReorderTasks: (tasks: DailyTask[]) => void;
    onSetDayStartTime: (time: string) => void;
}) {
    const [draggedTask, setDraggedTask] = useState<DailyTask | null>(null);

    const handleDragStart = (e: React.DragEvent, task: DailyTask) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (!draggedTask) return;

        const newTasks = [...tasks];
        const currentIndex = newTasks.findIndex(t => t.id === draggedTask.id);
        newTasks.splice(currentIndex, 1);
        newTasks.splice(targetIndex, 0, draggedTask);
        
        onReorderTasks(newTasks.map((t, i) => ({ ...t, order: i })));
        setDraggedTask(null);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">جدولي اليومي</h2>
                <div className="flex items-center gap-2">
                    <label>ابدأ من:</label>
                    <input 
                        type="time" 
                        value={dayStartTime} 
                        onChange={(e) => onSetDayStartTime(e.target.value)}
                        className="bg-neutral-800 p-1 rounded"
                    />
                    <button className="bg-blue-600 p-2 rounded flex items-center gap-1">
                        <Zap size={16} /> ترتيب ذكي
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {tasks.map((task, index) => (
                    <div 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center gap-3 p-3 bg-neutral-900 rounded border border-neutral-700 cursor-move"
                    >
                        <GripVertical className="text-neutral-500" />
                        <div className="flex-1">
                            <div className="font-semibold">{task.title}</div>
                            <div className="text-sm text-neutral-400">{task.startTime} - {task.durationMinutes} دقيقة</div>
                        </div>
                        <button onClick={() => onDeleteTask(task.id)} className="text-red-500">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={() => onAddTask({ 
                    id: Date.now().toString(), 
                    title: "مهمة جديدة", 
                    durationMinutes: 30, 
                    priority: 'Medium', 
                    startTime: '08:00', 
                    endTime: '08:30', 
                    completed: false, 
                    order: tasks.length 
                })}
                className="w-full py-2 border-2 border-dashed border-neutral-700 rounded flex items-center justify-center gap-2"
            >
                <Plus size={16} /> إضافة مهمة
            </button>
        </div>
    );
}
