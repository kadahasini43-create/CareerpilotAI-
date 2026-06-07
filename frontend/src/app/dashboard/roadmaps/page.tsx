"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Map, Calendar, CheckCircle2, ChevronDown, ChevronUp, 
  ExternalLink, BookOpen, Code, Trophy, Sparkles, AlertCircle, Loader2
} from 'lucide-react';

export default function RoadmapsPage() {
  const { refreshProfile } = useAuth();
  
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [expandedStages, setExpandedStages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingStage, setCompletingStage] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const data = await api.getUserRoadmaps();
      setRoadmaps(data);
      if (data.length > 0) {
        setActiveRoadmap(data[0]);
        // Expand the first stage by default
        if (data[0].data?.stages?.length > 0) {
          setExpandedStages([data[0].data.stages[0].name]);
        }
      }
    } catch (e) {
      console.error("Failed to load roadmaps", e);
    } finally {
      setLoading(false);
    }
  };

  const selectRoadmap = (rm: any) => {
    setActiveRoadmap(rm);
    if (rm.data?.stages?.length > 0) {
      setExpandedStages([rm.data.stages[0].name]);
    }
  };

  const toggleStageExpand = (stageName: string) => {
    if (expandedStages.includes(stageName)) {
      setExpandedStages(expandedStages.filter(s => s !== stageName));
    } else {
      setExpandedStages([...expandedStages, stageName]);
    }
  };

  const handleCompleteStage = async (roadmapId: string, stageName: string) => {
    setCompletingStage(stageName);
    try {
      const result = await api.completeStage(roadmapId, stageName);
      
      // Update local state
      setActiveRoadmap(result.roadmap);
      setRoadmaps(roadmaps.map(r => r._id === roadmapId ? result.roadmap : r));
      
      await refreshProfile();
    } catch (e) {
      console.error("Failed to complete stage", e);
    } finally {
      setCompletingStage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Reconstructing learning timelines...</p>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto relative z-10 px-4">
        <div className="p-4 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-6 animate-float">
          <Map className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Active Roadmaps</h2>
        <p className="text-xs text-gray-400 leading-relaxed mb-6">
          Your personal learning pathway is currently blank. Head over to the Career Paths Explorer to initialize a dynamic timeline now.
        </p>
        <Link href="/dashboard/paths" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          Explore Career Paths
        </Link>
      </div>
    );
  }

  const stages = activeRoadmap?.data?.stages || [];
  const completedStages = activeRoadmap?.completedStages || [];

  return (
    <div className="space-y-6">
      {/* Page Header and Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Interactive Roadmaps</h1>
          <p className="text-sm text-gray-400 mt-1">Timeline for: <span className="text-blue-400 font-semibold">{activeRoadmap.role}</span></p>
        </div>

        {/* Roadmap Selector Dropdown */}
        {roadmaps.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Pathway:</label>
            <select
              value={activeRoadmap._id}
              onChange={(e) => {
                const selected = roadmaps.find(r => r._id === e.target.value);
                if (selected) selectRoadmap(selected);
              }}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
            >
              {roadmaps.map(r => (
                <option key={r._id} value={r._id}>{r.role}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Timeline Visual Grid */}
      <div className="max-w-4xl mx-auto py-4 relative">
        {/* Center line (vertical) */}
        <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-500/40 via-purple-500/20 to-cyan-500/40 hidden md:block" />

        <div className="space-y-8">
          {stages.map((stage: any, index: number) => {
            const isCompleted = completedStages.includes(stage.name);
            const isExpanded = expandedStages.includes(stage.name);
            const isCompleting = completingStage === stage.name;
            
            return (
              <div key={index} className="relative flex flex-col md:flex-row gap-6 items-start">
                
                {/* Timeline node icon */}
                <div className="absolute md:static left-2 top-2 z-10">
                  <button
                    onClick={() => handleCompleteStage(activeRoadmap._id, stage.name)}
                    disabled={isCompleted || completingStage !== null}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                      isCompleted 
                        ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.3)] cursor-default' 
                        : 'bg-black/40 border-white/10 text-gray-500 hover:border-blue-500 hover:text-blue-400'
                    }`}
                    title={isCompleted ? "Stage Completed" : "Mark Stage Complete"}
                  >
                    {isCompleting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </button>
                </div>

                {/* Glassmorphic Stage Box */}
                <div className="flex-1 ml-16 md:ml-0 glass-card rounded-2xl border border-white/5 overflow-hidden w-full">
                  {/* Collapsed Header */}
                  <div 
                    onClick={() => toggleStageExpand(stage.name)}
                    className="p-5 flex items-center justify-between cursor-pointer bg-white/2 hover:bg-white/5 transition-all select-none"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-white group-hover:text-blue-400">
                          {stage.name} Stage
                        </h3>
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[9px] font-bold border border-green-500/15">
                            COMPLETE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Estimated duration: {stage.duration}</span>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                    </div>
                  </div>

                  {/* Expanded Content Details */}
                  {isExpanded && (
                    <div className="p-6 border-t border-white/5 space-y-6 bg-black/10">
                      
                      {/* Section 1: Skills to acquire */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Skills to Master
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {stage.skills?.map((skill: string) => (
                            <span key={skill} className="px-2 py-1 rounded bg-black/40 border border-white/5 text-[10px] text-gray-300 font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Section 2: Recommended Projects */}
                      {stage.projects && stage.projects.length > 0 && (
                        <div className="space-y-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5" />
                            Proof-of-Work Projects
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {stage.projects.map((proj: any, pIdx: number) => (
                              <div key={pIdx} className="p-4 rounded-xl bg-black/35 border border-white/5">
                                <h4 className="text-xs font-bold text-white mb-1">{proj.title}</h4>
                                <p className="text-[10px] text-gray-400 leading-relaxed">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 3: Resources & Certifications */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        
                        {/* Learning links */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            Curated Resources
                          </span>
                          <div className="space-y-1.5">
                            {stage.resources?.map((res: any, rIdx: number) => (
                              <a
                                key={rIdx}
                                href={res.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-2 rounded bg-black/20 hover:bg-black/40 border border-white/5 text-[10px] text-gray-300 hover:text-white transition-all group/link"
                              >
                                <span className="truncate max-w-[200px]">{res.title} ({res.type})</span>
                                <ExternalLink className="w-3 h-3 text-gray-500 group-hover/link:text-white shrink-0 ml-2" />
                              </a>
                            ))}
                          </div>
                        </div>

                        {/* Certifications & Platforms */}
                        <div className="space-y-4">
                          {stage.certifications && stage.certifications.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5" />
                                Recommended Certifications
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {stage.certifications.map((cert: string) => (
                                  <span key={cert} className="px-2 py-0.5 rounded bg-purple-950/10 border border-purple-500/20 text-[9px] text-purple-300 font-semibold">
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {stage.practicePlatforms && stage.practicePlatforms.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-yellow-400">Practice Platforms</span>
                              <div className="flex flex-wrap gap-1">
                                {stage.practicePlatforms.map((plat: string) => (
                                  <span key={plat} className="px-2 py-0.5 rounded bg-yellow-950/10 border border-yellow-500/20 text-[9px] text-yellow-300 font-semibold">
                                    {plat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
