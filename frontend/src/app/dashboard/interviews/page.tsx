"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Mic, MicOff, Volume2, Send, RotateCcw, AlertTriangle, 
  CheckCircle, Sparkles, Loader2, PlayCircle, Trophy, ArrowRight
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

export default function InterviewsPage() {
  const { refreshProfile } = useAuth();
  
  // State machine: 'setup' | 'active' | 'evaluating' | 'report'
  const [phase, setPhase] = useState<'setup' | 'active' | 'evaluating' | 'report'>('setup');
  const [role, setRole] = useState(presetRoles[0]);
  const [type, setType] = useState('Technical');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Initialize Web Speech Recognition if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setCurrentAnswer(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.getInterviewHistory();
      setHistory(data.reverse()); // latest first
    } catch (e) {
      console.error("Failed to load interview history", e);
    }
  };

  const handleStartInterview = async () => {
    setPhase('active');
    setAnswers([]);
    setCurrentIdx(0);
    setCurrentAnswer('');
    
    try {
      const data = await api.startInterview(role, type);
      setQuestions(data.questions);
      // Auto-read first question
      speakText(data.questions[0]);
    } catch (e) {
      console.error("Failed to start session", e);
      setPhase('setup');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleRecord = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Safari or type your response.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleNext = () => {
    // Save answer
    const updatedAnswers = [...answers, currentAnswer];
    setAnswers(updatedAnswers);

    if (currentIdx < questions.length - 1) {
      const nextIndex = currentIdx + 1;
      setCurrentIdx(nextIndex);
      setCurrentAnswer('');
      speakText(questions[nextIndex]);
    } else {
      // End interview, submit transcript
      handleSubmitInterview(updatedAnswers);
    }
  };

  const handleSubmitInterview = async (finalAnswers: string[]) => {
    setPhase('evaluating');
    
    // Structure transcript array
    const transcript = questions.map((q, index) => ({
      question: q,
      answer: finalAnswers[index] || "No response provided."
    }));

    try {
      const result = await api.submitInterview(role, type, transcript);
      setReport(result.session);
      await refreshProfile();
      await fetchHistory();
      setPhase('report');
    } catch (e) {
      console.error("Failed to evaluate transcript", e);
      setPhase('setup');
    }
  };

  if (phase === 'evaluating') {
    return (
      <div className="glass-card p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">AI Grading Transcript</h3>
          <p className="text-xs text-gray-500 animate-pulse">Calculating semantic technical score, confidence metrics, and language fluency ratios...</p>
        </div>
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
          <div className="h-full bg-blue-500 rounded-full animate-[loading-bar_4s_ease-out_infinite]" style={{ width: '80%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Interview Simulator</h1>
        <p className="text-sm text-gray-400 mt-1">
          Simulate Technical and Behavioral interviews. Speaks questions aloud and evaluates verbal or typed responses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PHASE 1: SETUP */}
          {phase === 'setup' && (
            <div className="glass-card p-8 rounded-2xl border border-white/5 space-y-6">
              <h3 className="text-base font-bold text-white mb-2">Configure Mock Session</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Target Job Title</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {presetRoles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Interview Core Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Technical', 'Behavioral'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setType(cat)}
                        className={`py-3 rounded-xl border text-xs font-semibold transition-all ${
                          type === cat 
                            ? 'bg-blue-600/30 border-blue-500 text-white' 
                            : 'bg-white/5 border-white/5 text-gray-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartInterview}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-semibold text-white rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5 text-white" />
                Initialize Interview Session
              </button>
            </div>
          )}

          {/* PHASE 2: ACTIVE SESSION */}
          {phase === 'active' && questions.length > 0 && (
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 space-y-6">
              {/* Session Progress Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">Mock Session: Active</span>
                  <h4 className="text-xs text-gray-400 mt-0.5">{role} • {type} Round</h4>
                </div>
                <div className="text-xs font-extrabold text-white bg-white/5 px-2.5 py-1 rounded border border-white/5">
                  Question {currentIdx + 1} of {questions.length}
                </div>
              </div>

              {/* Question Text Panel */}
              <div className="p-6 rounded-2xl border border-blue-500/15 bg-blue-950/10 text-center relative overflow-hidden group">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => speakText(questions[currentIdx])}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    title="Speak Question"
                  >
                    <Volume2 className="w-4.5 h-4.5" />
                  </button>
                </div>
                <p className="text-sm md:text-base font-bold text-white tracking-wide leading-relaxed px-4">
                  "{questions[currentIdx]}"
                </p>
              </div>

              {/* Response Textarea */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">Your Response</label>
                <textarea
                  placeholder="Type your response here, or click the Microphone icon to speak your answer aloud..."
                  rows={6}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="w-full p-4 bg-black/45 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-xs text-white resize-none placeholder-gray-600 leading-relaxed"
                />
              </div>

              {/* Voice controllers and navigation */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-3">
                  {/* Microphone speech recognizer toggle */}
                  <button
                    onClick={handleToggleRecord}
                    className={`p-3.5 rounded-xl border flex items-center justify-center transition-all ${
                      isRecording 
                        ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                        : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                    }`}
                    title={isRecording ? "Stop Transcribing" : "Speak Response"}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  {isRecording && (
                    <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest animate-pulse">
                      Recording input...
                    </span>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl transition-all shadow-[0_0_12px_rgba(59,130,246,0.3)] flex items-center gap-1.5"
                >
                  {currentIdx < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      Finish & Grade
                      <Trophy className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* PHASE 3: EVALUATION REPORT */}
          {phase === 'report' && report && (
            <div className="space-y-6">
              
              {/* Overall Ratings Card */}
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden bg-gradient-to-tr from-indigo-950/15 to-black/40">
                <h3 className="text-sm font-extrabold text-blue-400 uppercase tracking-widest mb-6">Session Evaluation Report</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                  <div className="text-center p-4 bg-black/45 rounded-xl border border-white/5">
                    <div className="text-2xl font-black text-white">{report.evaluation.overallScore}%</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider mt-1.5">Overall Grade</div>
                  </div>
                  <div className="text-center p-4 bg-black/45 rounded-xl border border-white/5">
                    <div className="text-2xl font-black text-blue-400">{report.evaluation.technicalScore}%</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider mt-1.5">Technical</div>
                  </div>
                  <div className="text-center p-4 bg-black/45 rounded-xl border border-white/5">
                    <div className="text-2xl font-black text-purple-400">{report.evaluation.communicationScore}%</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider mt-1.5">Communication</div>
                  </div>
                  <div className="text-center p-4 bg-black/45 rounded-xl border border-white/5">
                    <div className="text-2xl font-black text-cyan-400">{report.evaluation.confidenceScore}%</div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider mt-1.5">Confidence</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                  <button
                    onClick={() => setPhase('setup')}
                    className="px-5 py-2.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-lg transition-all"
                  >
                    Start New Interview
                  </button>
                </div>
              </div>

              {/* Strengths & constructive feedback lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Strengths */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-extrabold text-green-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-3">
                    {report.evaluation.strengths?.map((str: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-300 leading-relaxed pl-5 relative before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold">
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-extrabold text-yellow-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-3">
                    {report.evaluation.constructiveFeedback?.map((feed: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-300 leading-relaxed pl-5 relative before:content-['!'] before:absolute before:left-0 before:text-yellow-500 before:font-bold">
                        {feed}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Detailed QnA breakdown */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-widest">Question Breakdown & Sample Answers</h3>
                
                <div className="space-y-5">
                  {report.evaluation.detailedQnAEvaluation?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-xs font-bold text-white">Q{idx + 1}: {item.question}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                          item.score >= 75 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {item.score}%
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-gray-400 bg-white/2 p-2.5 rounded border border-white/5">
                        <strong className="text-gray-500">Your Answer:</strong> "{item.answer}"
                      </div>

                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        <strong className="text-blue-400">Feedback:</strong> {item.feedback}
                      </p>

                      <div className="text-[10px] text-gray-400 pt-2 border-t border-white/5">
                        <strong className="text-indigo-400 block mb-1">AI Suggested Answer (STAR Checklist):</strong>
                        {item.sampleAnswer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: History Sidebar */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
            <Volume2 className="w-4.5 h-4.5" />
            Session History Logs
          </div>
          <p className="text-[11px] text-gray-500">View performance grades from past interview preparation sessions.</p>

          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h._id}
                onClick={() => {
                  setReport(h);
                  setPhase('report');
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                  report?._id === h._id 
                    ? 'bg-blue-600/15 border-blue-500 text-white' 
                    : 'bg-black/20 border-white/5 hover:border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold truncate group-hover:text-blue-400 transition-colors">{h.role}</h4>
                  <p className="text-[9px] text-gray-500 truncate mt-0.5">{h.type} Round • {h.transcript?.length || 5} Qs</p>
                </div>
                <div className="px-2 py-1 rounded text-xs font-black bg-white/5 border border-white/5 shrink-0 ml-2">
                  {h.evaluation?.overallScore}%
                </div>
              </button>
            ))}

            {history.length === 0 && (
              <div className="text-center py-6 text-xs text-gray-600 font-medium">
                No past interview reports saved.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
