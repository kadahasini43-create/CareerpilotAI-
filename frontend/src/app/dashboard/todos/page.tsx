"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckSquare, Square, Trash2, Plus, Sparkles, 
  Loader2, AlertCircle, Filter, Calendar, CheckCircle2 
} from 'lucide-react';

interface TodoItem {
  _id: string;
  text: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
}

export default function TodosPage() {
  const { refreshProfile, triggerAlert } = useAuth();
  
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const data = await api.getTodos();
      setTodos(data);
    } catch (e) {
      console.error("Failed to load todos", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setActionLoading('add');
    try {
      const newTodo = await api.createTodo({
        text: inputText.trim(),
        priority
      });
      setTodos(prev => [...prev, newTodo]);
      setInputText('');
      setPriority('Medium');
      
      // Grant small reward for adding tasks
      triggerAlert("Task Created!", "Added new item to your learning track (+5 XP).", "xp");
      await refreshProfile();
    } catch (error) {
      console.error("Failed to create todo", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
    setActionLoading(id);
    try {
      const updated = await api.updateTodo(id, { completed: !currentCompleted });
      setTodos(todos.map(t => t._id === id ? updated : t));
      
      if (!currentCompleted) {
        triggerAlert("Task Finished!", "Career milestone checkmark completed (+15 XP).", "xp");
      }
      await refreshProfile();
    } catch (error) {
      console.error("Failed to toggle task", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setActionLoading(id);
    try {
      await api.deleteTodo(id);
      setTodos(todos.filter(t => t._id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredTodos = () => {
    switch (filter) {
      case 'Pending':
        return todos.filter(t => !t.completed);
      case 'Completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Synchronizing task logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">To Do List Tracking</h1>
        <p className="text-sm text-gray-400 mt-1">Manage and audit your custom career prep tasks, DSA challenges, and study milestones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Add task form */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Add Todo Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-extrabold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
              Add Custom Task
            </h3>
            
            <form onSubmit={handleAddTodo} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Task Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Study React Server Components"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Priority Rating</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        priority === p 
                          ? p === 'Low' ? 'bg-blue-600/20 border-blue-500 text-blue-300' :
                            p === 'Medium' ? 'bg-yellow-600/20 border-yellow-500 text-yellow-300' :
                            'bg-red-600/20 border-red-500 text-red-300'
                          : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/15'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading === 'add' || !inputText.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.25)] flex items-center justify-center gap-2"
              >
                {actionLoading === 'add' ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4.5 h-4.5" />
                    Insert Task Item
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Progress gauge card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[140px] bg-gradient-to-br from-indigo-950/15 via-black/45 to-black/40">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-1">Milestone Completion</span>
              <h3 className="text-2xl font-black text-white">{completedCount} / {totalCount} Tasks Done</h3>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>{progressPercent}% Complete</span>
                <span>Active Track</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Tasks List */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 space-y-6">
          
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-blue-400" />
              Tasks Checklist
            </h3>

            <div className="flex gap-2">
              {(['All', 'Pending', 'Completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    filter === f 
                      ? 'bg-blue-600/20 border-blue-500 text-white' 
                      : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2.5">
            {getFilteredTodos().map((todo) => {
              const isActioning = actionLoading === todo._id;
              
              return (
                <div 
                  key={todo._id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    todo.completed 
                      ? 'bg-black/15 border-white/5 opacity-60' 
                      : 'bg-black/35 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggleTodo(todo._id, todo.completed)}
                      disabled={isActioning}
                      className="text-gray-400 hover:text-blue-400 transition-colors shrink-0"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-5.5 h-5.5 text-green-400" />
                      ) : (
                        <Square className="w-5.5 h-5.5 text-gray-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className={`text-xs leading-relaxed truncate max-w-[280px] md:max-w-[360px] ${todo.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {todo.text}
                      </p>
                      <span className={`inline-block text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md mt-1.5 border ${
                        todo.priority === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        todo.priority === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}>
                        {todo.priority} Priority
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTodo(todo._id)}
                    disabled={isActioning}
                    className="p-2.5 rounded-lg bg-red-950/10 hover:bg-red-950/20 border border-transparent hover:border-red-950/40 text-gray-500 hover:text-red-400 transition-all shrink-0"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {getFilteredTodos().length === 0 && (
              <div className="text-center py-12 text-xs text-gray-500 font-medium">
                No tasks found matching this filter criteria.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
