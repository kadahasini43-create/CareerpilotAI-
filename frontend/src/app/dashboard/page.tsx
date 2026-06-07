"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { 
  Zap, Award, FileCheck, Target, ArrowUpRight, 
  BookOpen, Sparkles, Plus, CheckSquare, Square, CheckCircle2 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function MainDashboard() {
  const { profile, refreshProfile } = useAuth();
  
  const [gamification, setGamification] = useState<any>(null);
  const [resumeReports, setResumeReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [goals, setGoals] = useState([
    { id: 1, text: "Upload latest resume for ATS scoring", done: false },
    { id: 2, text: "Begin technical mock interview preparation", done: false },
    { id: 3, text: "Complete first coding challenge", done: false },
    { id: 4, text: "Generate personalized career roadmap", done: false }
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      await refreshProfile();
      const gam = await api.getGamification();
      setGamification(gam);
      
      const resReports = await api.getResumeHistory();
      setResumeReports(resReports);

      // Dynamically mark goals as done based on activity
      const hasResume = resReports.length > 0;
      const roadmaps = await api.getUserRoadmaps();
      const hasRoadmap = roadmaps.length > 0;
      const interviews = await api.getInterviewHistory();
      const hasInterview = interviews.length > 0;

      setGoals(g => g.map(item => {
        if (item.id === 1 && hasResume) return { ...item, done: true };
        if (item.id === 2 && hasInterview) return { ...item, done: true };
        if (item.id === 4 && hasRoadmap) return { ...item, done: true };
        if (item.id === 3 && (profile?.xp && profile.xp >= 150)) return { ...item, done: true };
        return item;
      }));
    } catch (e) {
      console.error("Failed to load dashboard metrics", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (id: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Booting dashboard diagnostics...</p>
      </div>
    );
  }

  // Calculate Progress Score: average of Resume ATS Score (or 50 if none), Level Progress, and Completed Goals
  const latestResumeScore = resumeReports[0]?.analysis?.atsScore || 0;
  const completedGoalsCount = goals.filter(g => g.done).length;
  const goalScore = (completedGoalsCount / goals.length) * 100;
  const progressScore = Math.round(((profile?.level || 1) * 10 + latestResumeScore + goalScore) / 3);

  // Mock chart data representing study hours / XP gains over the past week
  const studyData = [
    { name: 'Mon', xp: (profile?.xp || 100) - 80 },
    { name: 'Tue', xp: (profile?.xp || 100) - 70 },
    { name: 'Wed', xp: (profile?.xp || 100) - 55 },
    { name: 'Thu', xp: (profile?.xp || 100) - 40 },
    { name: 'Fri', xp: (profile?.xp || 100) - 20 },
    { name: 'Sat', xp: (profile?.xp || 100) - 10 },
    { name: 'Sun', xp: (profile?.xp || 100) }
  ];

  return (
    <div className="space-y-6">
      {/* Header welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Onboarding Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">AI Mentor diagnostic: <span className="text-cyan-400 font-semibold">Active</span>. Complete tasks to level up.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/mentor" className="px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            Talk to AI Mentor
          </Link>
        </div>
      </div>

      {/* Primary widgets row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Career Progress */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Career Progress Score</span>
              <h3 className="text-3xl font-black text-white mt-1.5">{progressScore}%</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progressScore}%` }} />
          </div>
        </div>

        {/* Widget 2: Learning Streak */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Streak</span>
              <h3 className="text-3xl font-black text-white mt-1.5">{profile?.streakCount || 0} Days</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-yellow-600/10 border border-yellow-500/20 text-yellow-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-4">
            {profile?.streakCount && profile.streakCount > 0 ? "You're doing great! Log in daily to maintain." : "Start your streak by engaging in activities."}
          </p>
        </div>

        {/* Widget 3: Resume Score */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Latest Resume ATS</span>
              <h3 className="text-3xl font-black text-white mt-1.5">
                {latestResumeScore > 0 ? `${latestResumeScore}/100` : "N/A"}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-4 flex items-center gap-1.5">
            {latestResumeScore > 0 ? (
              <span className="text-green-400 font-semibold">Ready for applications</span>
            ) : (
              <Link href="/dashboard/resume" className="text-blue-400 hover:underline flex items-center gap-1">
                Upload resume now <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </p>
        </div>

        {/* Widget 4: Level Progress */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Milestone Achievements</span>
              <h3 className="text-3xl font-black text-white mt-1.5">
                {gamification?.badges?.filter((b: any) => b.unlocked).length || 0} Badges
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex gap-1 mt-4">
            {gamification?.badges?.slice(0, 5).map((badge: any) => (
              <div 
                key={badge.id}
                title={`${badge.title}: ${badge.description}`}
                className={`w-6 h-6 rounded flex items-center justify-center border text-[10px] ${
                  badge.unlocked 
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.3)]' 
                    : 'bg-white/5 border-white/5 text-gray-600'
                }`}
              >
                ★
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main double column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Analytics Graph */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">XP Progression Curve</h3>
            <p className="text-xs text-gray-500">Visualization of your skill acquisition activity over the past 7 days.</p>
          </div>
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(9, 10, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                  labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#60a5fa', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="xp" name="XP Gained" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorXp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column: Goals checklist */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Goals Checklist Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 flex-1">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
              Career Roadmap Checklist
              <span className="text-xs px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/20">
                {goals.filter(g => g.done).length}/{goals.length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-black/25 hover:bg-black/45 border border-white/5 text-left transition-all group"
                >
                  {g.done ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-500 group-hover:text-blue-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs ${g.done ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                    {g.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestions Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-950/15 via-[#0f1123] to-[#0a0b16]">
            <h3 className="text-sm font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" />
              AI Recommendations
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              "Based on your dream role of **{profile?.dreamRole || 'Software Professional'}**, I suggest starting with our **Resume Analyzer**. Aligning your credentials with ATS standards boosts application callback rates by 42%."
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="/dashboard/resume" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Analyze Resume <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
