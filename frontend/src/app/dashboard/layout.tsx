"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Compass, LayoutDashboard, MessageSquare, Map, FileCheck, 
  Target, Mic, Code, ListTodo, Award, Settings, LogOut, 
  Menu, X, Zap, ShieldAlert, Sparkles, User
} from 'lucide-react';

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Mentor", href: "/dashboard/mentor", icon: MessageSquare },
  { label: "Career Paths", href: "/dashboard/paths", icon: Compass },
  { label: "Roadmaps", href: "/dashboard/roadmaps", icon: Map },
  { label: "Resume Analyzer", href: "/dashboard/resume", icon: FileCheck },
  { label: "Skill Gap", href: "/dashboard/skills", icon: Target },
  { label: "Interview Prep", href: "/dashboard/interviews", icon: Mic },
  { label: "Coding Arena", href: "/dashboard/challenges", icon: Code },
  { label: "To Do List", href: "/dashboard/todos", icon: ListTodo }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout, token } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!token) return null;

  // Check if admin to show admin button
  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin@');

  const getActiveXpProgress = () => {
    if (!profile) return 0;
    const xp = profile.xp || 0;
    // Level is calculated as Math.floor(xp / 500) + 1
    const baseLevelXp = (profile.level - 1) * 500;
    const currentLevelProgressXp = xp - baseLevelXp;
    return Math.min(Math.round((currentLevelProgressXp / 500) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-[#030308] text-white flex flex-col lg:flex-row relative">
      {/* Background neon blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none -z-10" />

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-white/5 min-h-screen px-4 py-6 justify-between flex-shrink-0 z-30 sticky top-0">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide">CareerPilot AI</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    active 
                      ? 'bg-blue-600/20 text-white border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
                  {item.label}
                </Link>
              );
            })}

            {/* Profile Settings */}
            <Link
              href="/dashboard/profile"
              className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all group ${
                pathname === '/dashboard/profile'
                  ? 'bg-blue-600/20 text-white border border-blue-500/20'
                  : 'text-gray-400 border border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <User className="w-4.5 h-4.5 text-gray-400 group-hover:text-white" />
              My Profile
            </Link>

            {/* Admin Panel (Conditional) */}
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className={`flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all group border border-purple-500/10 ${
                  pathname === '/dashboard/admin'
                    ? 'bg-purple-600/20 text-white border-purple-500/30'
                    : 'text-purple-400 hover:bg-purple-950/15'
                }`}
              >
                <ShieldAlert className="w-4.5 h-4.5" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* User profile details & Logout */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{user?.name || 'User'}</h4>
              <p className="text-[10px] text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/10 hover:text-red-300 transition-all border border-transparent hover:border-red-950/30"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Status Header */}
        <header className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h2 className="hidden sm:inline-block text-sm font-bold text-gray-400">
              Target Pathway: <span className="text-blue-400">{profile?.dreamRole || 'Not Selected'}</span>
            </h2>
          </div>

          {/* Gamification statistics widgets */}
          {profile && (
            <div className="flex items-center gap-6">
              {/* Level Progress */}
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="text-[10px] uppercase font-extrabold tracking-widest text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Level {profile.level}
                </div>
                <div className="w-32 h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" 
                    style={{ width: `${getActiveXpProgress()}%` }}
                  />
                </div>
              </div>

              {/* Learning Streak */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-yellow-500">
                <Zap className="w-4.5 h-4.5 fill-current animate-pulse" />
                <span className="text-xs font-bold">{profile.streakCount} Day Streak</span>
              </div>

              {/* XP */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-400">
                <Award className="w-4.5 h-4.5 text-purple-400" />
                <span className="text-xs font-bold">{profile.xp} XP</span>
              </div>
            </div>
          )}
        </header>

        {/* Page contents renderer */}
        <main className="flex-1 p-6 relative z-10">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          
          <aside className="relative flex flex-col w-64 max-w-xs bg-[#090a14] border-r border-white/10 p-5 justify-between min-h-screen z-50">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 px-2" onClick={() => setSidebarOpen(false)}>
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <Compass className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-base font-bold text-white">CareerPilot AI</span>
                </Link>
                <button className="text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active 
                          ? 'bg-blue-600/20 text-white border border-blue-500/10' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}

                <Link
                  href="/dashboard/profile"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname === '/dashboard/profile'
                      ? 'bg-blue-600/20 text-white border border-blue-500/10'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>

                {isAdmin && (
                  <Link
                    href="/dashboard/admin"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-purple-400 ${
                      pathname === '/dashboard/admin'
                        ? 'bg-purple-600/20 text-white border-purple-500/25'
                        : 'hover:bg-purple-950/10'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </nav>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{user?.name || 'User'}</h4>
                </div>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-950/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
