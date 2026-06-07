"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Target, CheckCircle2, AlertCircle, Clock, 
  BookOpen, ExternalLink, Sparkles, Loader2, ArrowRight
} from 'lucide-react';

const presetRoles = [
  "Full Stack Developer",
  "AI / Machine Learning Engineer",
  "Data Scientist",
  "Cybersecurity Analyst",
  "Cloud Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Mobile App Developer",
  "Product Manager"
];

export default function SkillGapPage() {
  const { profile } = useAuth();
  
  const [targetRole, setTargetRole] = useState(presetRoles[0]);
  const [loading, setLoading] = useState(false);
  const [gapData, setGapData] = useState<any>(null);

  useEffect(() => {
    // If user has a dream role set in their profile, default to that
    if (profile?.dreamRole) {
      const match = presetRoles.find(r => r.toLowerCase().includes(profile.dreamRole.toLowerCase()) || profile.dreamRole.toLowerCase().includes(r.toLowerCase()));
      if (match) {
        setTargetRole(match);
      }
    }
  }, [profile]);

  useEffect(() => {
    runAnalysis();
  }, [targetRole]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const result = await api.analyzeSkills(targetRole);
      setGapData(result);
    } catch (e) {
      console.error("Failed to run skill gap analysis", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Skill Gap Analyzer</h1>
          <p className="text-sm text-gray-400 mt-1">
            Compare your profile skills against target industry roles and calculate estimates to bridge the gaps.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-1.5 cursor-pointer">
          <label className="text-xs font-bold text-gray-500 uppercase">Target Role:</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="bg-transparent border-none text-xs text-white outline-none font-bold cursor-pointer"
          >
            {presetRoles.map(r => (
              <option key={r} value={r} className="bg-[#090a14]">{r}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Running skill vector matching comparison...</p>
        </div>
      )}

      {!loading && gapData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Core Metrics & Match gauge */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Match Percentage Card */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-tr from-indigo-950/10 to-black/40 text-center flex flex-col items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Skills Compatibility Match</span>
              
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="transparent" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    stroke={gapData.matchPercentage >= 70 ? "#06b6d4" : gapData.matchPercentage >= 40 ? "#eab308" : "#ef4444"} 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * gapData.matchPercentage) / 100}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-4xl font-black text-white">{gapData.matchPercentage}%</div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-4.5 h-4.5 text-blue-400" />
                <span>Estimated Learning Duration: <strong className="text-white">{gapData.estimatedLearningDuration}</strong></span>
              </div>
            </div>

            {/* Comparison Grid lists */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
              
              {/* Matched Skills */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-green-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-green-500 shrink-0" />
                  Acquired Skills ({gapData.matchedSkills?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {gapData.matchedSkills?.map((skill: string) => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-green-950/10 border border-green-500/20 text-[10px] text-green-300 font-semibold">
                      {skill}
                    </span>
                  ))}
                  {gapData.matchedSkills?.length === 0 && (
                    <span className="text-xs text-gray-500">No matching skills found.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <h3 className="text-xs font-extrabold text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
                  Missing Skill Gaps ({gapData.missingSkills?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {gapData.missingSkills?.map((skill: string) => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg bg-red-950/15 border border-red-500/20 text-[10px] text-red-300 font-semibold">
                      {skill}
                    </span>
                  ))}
                  {gapData.missingSkills?.length === 0 && (
                    <span className="text-xs text-green-400 font-bold">Excellent! Zero skill gaps identified.</span>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Dynamic study schedule */}
          <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-extrabold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
              Bridging Plan Study Schedule
            </h3>
            <p className="text-xs text-gray-500 mb-6">Targeted curricula and practice checkpoints to master missing technologies.</p>

            <div className="space-y-4">
              {gapData.recommendedLearningPlan?.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-black/25 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-xs font-bold text-white">{item.skill}</h4>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        item.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {item.priority} Priority
                      </span>
                    </div>
                    
                    <div className="space-y-1 mt-3">
                      {item.resources?.map((res: any, rIdx: number) => (
                        <div key={rIdx} className="flex items-center gap-2 text-[10px] text-gray-400">
                          <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                          <span>{res.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a 
                    href="https://www.coursera.org" 
                    target="_blank" 
                    rel="noreferrer"
                    className="self-start md:self-auto px-4 py-2 bg-white/5 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-[10px] font-bold text-gray-300 hover:text-white rounded-lg transition-all flex items-center gap-1 shrink-0"
                  >
                    Start Study
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              ))}

              {gapData.recommendedLearningPlan?.length === 0 && (
                <div className="text-center py-10 text-xs text-gray-500 font-medium">
                  🎉 Perfect alignment! You possess all the skills required for the **{targetRole}** role.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
