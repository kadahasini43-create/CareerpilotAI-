"use client";
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Zap, Award, Sparkles } from 'lucide-react';

export default function GamificationToast() {
  const { gamificationAlert } = useAuth();

  if (!gamificationAlert || !gamificationAlert.show) return null;

  const getIcon = () => {
    switch (gamificationAlert.type) {
      case 'xp':
        return <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 'badge':
        return <Award className="w-6 h-6 text-cyan-400 animate-bounce" />;
      case 'level':
        return <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />;
    }
  };

  const getThemeClass = () => {
    switch (gamificationAlert.type) {
      case 'xp':
        return 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)] bg-yellow-950/20';
      case 'badge':
        return 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] bg-cyan-950/20';
      case 'level':
        return 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-purple-950/20';
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-4 px-5 py-4 rounded-xl border backdrop-blur-md transition-all duration-500 transform translate-y-0 scale-100 ${getThemeClass()} glass-panel`}>
      <div className="flex-shrink-0 p-2 rounded-lg bg-black/40 border border-white/5">
        {getIcon()}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white tracking-wide uppercase">
          {gamificationAlert.title}
        </h4>
        <p className="text-xs text-gray-300 mt-0.5 max-w-[240px]">
          {gamificationAlert.message}
        </p>
      </div>
    </div>
  );
}
