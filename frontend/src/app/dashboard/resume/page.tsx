"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, UploadCloud, CheckCircle, AlertTriangle, 
  Search, ShieldAlert, Sparkles, Loader2, ArrowUpRight, History
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

export default function ResumeAnalyzerPage() {
  const { refreshProfile } = useAuth();
  
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState(presetRoles[0]);
  const [customRole, setCustomRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.getResumeHistory();
      setHistory(data.reverse()); // latest first
    } catch (e) {
      console.error("Failed to load resume history", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setLoadingStep(1);

    // Dynamic loading transitions to feel extremely futuristic and AI-driven
    const timer1 = setTimeout(() => setLoadingStep(2), 1500);
    const timer2 = setTimeout(() => setLoadingStep(3), 3200);

    const activeRole = customRole.trim() || targetRole;
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', activeRole);

    try {
      const result = await api.analyzeResume(formData);
      clearTimeout(timer1);
      clearTimeout(timer2);
      
      setReport(result.report);
      await refreshProfile();
      await fetchHistory();
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const selectPastReport = (pastReport: any) => {
    setReport(pastReport);
  };

  const resetAnalyzer = () => {
    setFile(null);
    setReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">ATS Resume Analyzer</h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload your resume in PDF format. CareerPilot AI evaluates keyword alignments, formats, and returns scoring checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main Column: Upload Form OR Score Report */}
        <div className="lg:col-span-8 space-y-6">
          
          {loading && (
            <div className="glass-card p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">AI Scanner Running</h3>
                <div className="text-xs text-gray-400 font-medium">
                  {loadingStep === 1 && <span className="animate-pulse">Parsing PDF vector coordinates and extracting text trees...</span>}
                  {loadingStep === 2 && <span className="animate-pulse">Cross-referencing resume terms against target {targetRole} keyword indices...</span>}
                  {loadingStep === 3 && <span className="animate-pulse font-semibold text-cyan-400">Rendering visual ATS feedback charts...</span>}
                </div>
              </div>
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
                <div className={`h-full bg-blue-500 rounded-full transition-all duration-1000 ${
                  loadingStep === 1 ? 'w-1/3' : loadingStep === 2 ? 'w-2/3' : 'w-[95%]'
                }`} />
              </div>
            </div>
          )}

          {!loading && !report && (
            <div className="glass-card p-8 rounded-2xl border border-white/5">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Role selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Target Job Title</label>
                    <select
                      value={targetRole}
                      onChange={(e) => {
                        setTargetRole(e.target.value);
                        setCustomRole('');
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {presetRoles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Or Custom Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Test Engineer"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Dropzone File Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Resume Document (PDF)</label>
                  <div className="border border-dashed border-white/10 hover:border-blue-500/50 rounded-2xl bg-black/20 p-8 flex flex-col items-center justify-center text-center cursor-pointer relative transition-all group min-h-[200px]">
                    <input
                      type="file"
                      required
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-all mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    {file ? (
                      <div>
                        <h4 className="text-sm font-semibold text-white truncate max-w-xs">{file.name}</h4>
                        <p className="text-[11px] text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF file selected</p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-semibold text-white">Drag & drop resume here</h4>
                        <p className="text-[11px] text-gray-500 mt-1">Supports PDF format (Max size: 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!file}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] disabled:opacity-30 disabled:bg-gray-800 flex items-center justify-center gap-2"
                >
                  <Search className="w-4.5 h-4.5" />
                  Analyze Resume Credentials
                </button>
              </form>
            </div>
          )}

          {/* REPORT VIEW */}
          {!loading && report && (
            <div className="space-y-6">
              
              {/* ATS Master Score Panel */}
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden bg-gradient-to-tr from-indigo-950/10 to-black/40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  
                  {/* Score circle */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="62" stroke="rgba(255,255,255,0.03)" strokeWidth="10" fill="transparent" />
                        <circle 
                          cx="72" 
                          cy="72" 
                          r="62" 
                          stroke={report.analysis.atsScore >= 75 ? "#22c55e" : report.analysis.atsScore >= 60 ? "#eab308" : "#ef4444"} 
                          strokeWidth="10" 
                          fill="transparent" 
                          strokeDasharray={390}
                          strokeDashoffset={390 - (390 * report.analysis.atsScore) / 100}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute text-3xl font-black text-white">{report.analysis.atsScore}%</div>
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase mt-4">Global ATS Grade</span>
                  </div>

                  {/* Criteria scores */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-bold text-white">Target Position match:</h4>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/20">{report.targetRole}</span>
                    </div>
                    
                    {/* Score breakdowns */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-black/35 rounded-xl border border-white/5 text-center">
                        <div className="text-base font-extrabold text-white">{report.analysis.formattingScore}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Formatting</div>
                      </div>
                      <div className="p-3 bg-black/35 rounded-xl border border-white/5 text-center">
                        <div className="text-base font-extrabold text-white">{report.analysis.keywordScore}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Keyword Match</div>
                      </div>
                      <div className="p-3 bg-black/35 rounded-xl border border-white/5 text-center">
                        <div className="text-base font-extrabold text-white">{report.analysis.skillsScore}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Skills Alignment</div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={resetAnalyzer}
                        className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-lg transition-all"
                      >
                        Scan Another Resume
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-extrabold text-green-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    Resume Strengths
                  </h3>
                  <ul className="space-y-3">
                    {report.analysis.strengths?.map((str: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-300 leading-relaxed pl-5 relative before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold">
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-extrabold text-red-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    Detected Issues
                  </h3>
                  <ul className="space-y-3">
                    {report.analysis.weaknesses?.map((weak: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-300 leading-relaxed pl-5 relative before:content-['!'] before:absolute before:left-0 before:text-red-500 before:font-bold">
                        {weak}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Missing keywords and Recommended Improvements */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
                
                {/* Missing Skills */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Missing Keywords & Skills
                  </h3>
                  <p className="text-[11px] text-gray-500">Add these to your resume experiences to pass index scans.</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {report.analysis.missingKeywords?.map((kw: string) => (
                      <span key={kw} className="px-2.5 py-1 rounded-lg bg-red-950/20 border border-red-500/20 text-[10px] text-red-300 font-semibold">
                        {kw}
                      </span>
                    ))}
                    {report.analysis.missingSkills?.map((skill: string) => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-[10px] text-indigo-300 font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Plan */}
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <h3 className="text-xs font-extrabold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Actionable Improvement Plan
                  </h3>
                  <ul className="space-y-2.5">
                    {report.analysis.improvements?.map((imp: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-300 leading-relaxed pl-5 relative before:content-[attr(data-num)] before:absolute before:left-0 before:text-yellow-400 before:font-bold" data-num={`${idx + 1}.`}>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Right Column: History Sidebar */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
            <History className="w-4.5 h-4.5" />
            Scan History Logs
          </div>
          <p className="text-[11px] text-gray-500">Select a previous record to load the details score breakdown cards.</p>

          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h._id}
                onClick={() => selectPastReport(h)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                  report?._id === h._id 
                    ? 'bg-blue-600/15 border-blue-500 text-white' 
                    : 'bg-black/20 border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold truncate group-hover:text-blue-400 transition-colors">{h.targetRole}</h4>
                  <p className="text-[9px] text-gray-500 truncate mt-0.5">{h.fileName}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-black shrink-0 ml-2 ${
                  h.analysis.atsScore >= 75 ? 'bg-green-500/10 text-green-400 border border-green-500/15' :
                  h.analysis.atsScore >= 60 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15' :
                  'bg-red-500/10 text-red-400 border border-red-500/15'
                }`}>
                  {h.analysis.atsScore}%
                </div>
              </button>
            ))}

            {history.length === 0 && (
              <div className="text-center py-6 text-xs text-gray-600 font-medium">
                No past scan reports saved.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
