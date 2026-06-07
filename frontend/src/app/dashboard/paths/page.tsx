"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Compass, Map, Briefcase, TrendingUp, Clock, 
  ChevronRight, Sparkles, Loader2, Star 
} from 'lucide-react';

export default function CareerPathsPage() {
  const { refreshProfile } = useAuth();
  const router = useRouter();
  
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      const data = await api.getPaths();
      setPaths(data);
    } catch (e) {
      console.error("Failed to fetch paths", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (roleTitle: string) => {
    setGeneratingFor(roleTitle);
    try {
      await api.generateRoadmap(roleTitle);
      await refreshProfile();
      router.push('/dashboard/roadmaps');
    } catch (e) {
      console.error("Failed to generate roadmap", e);
      setGeneratingFor(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading career matrices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Career Paths Explorer</h1>
        <p className="text-sm text-gray-400 mt-1">
          Select an industry domain below to discover market metrics, skill sets, and trigger AI-generated roadmaps.
        </p>
      </div>

      {/* Grid of paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((p) => {
          const isGenerating = generatingFor === p.title;
          
          return (
            <div 
              key={p.id} 
              className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01]"
            >
              <div>
                {/* Header title */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {p.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    p.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    p.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {p.difficulty}
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  {p.description}
                </p>

                {/* Details list */}
                <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Average Salary: <strong className="text-white">{p.salary}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Market Growth: <strong className="text-white">{p.growth}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Study Timeline: <strong className="text-white">{p.timeline}</strong></span>
                  </div>
                </div>

                {/* Required Skills Badges */}
                <div className="space-y-2 mb-6">
                  <span className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Required Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.skills?.slice(0, 4).map((skill: string) => (
                      <span key={skill} className="px-2 py-1 rounded bg-black/40 border border-white/5 text-[10px] text-gray-300 font-medium">
                        {skill}
                      </span>
                    ))}
                    {p.skills?.length > 4 && (
                      <span className="px-2 py-1 rounded bg-black/40 border border-white/5 text-[10px] text-gray-500 font-medium">
                        +{p.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleGenerateRoadmap(p.title)}
                disabled={generatingFor !== null}
                className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 hover:text-white text-xs font-semibold text-gray-300 transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Building AI Roadmap...
                  </>
                ) : (
                  <>
                    Generate AI Roadmap
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
