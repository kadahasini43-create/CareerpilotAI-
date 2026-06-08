"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, Compass, CheckCircle2, ChevronRight, MessageSquare, 
  Map, FileCheck, ShieldAlert, Target, Mic, Code, ListTodo, 
  Briefcase, GraduationCap, TrendingUp, Award, Zap, BookOpen, Terminal, ExternalLink
} from 'lucide-react';

const featuresList = [
  { icon: MessageSquare, title: "AI Career Mentor", desc: "Interact with an AI agent who analyzes industry standards and suggests tailored careers." },
  { icon: Compass, title: "Career Recommendation", desc: "Unlock customized domains matching your interests, degree and experience level." },
  { icon: FileCheck, title: "Resume Analysis", desc: "Verify formatting, language effectiveness, and visual structures instantly." },
  { icon: ShieldAlert, title: "ATS Score Checker", desc: "Grade your resume against real ATS systems and find missing keywords." },
  { icon: Target, title: "Skill Gap Analysis", desc: "Discover gaps between your current skill level and your target dream role." },
  { icon: Mic, title: "Voice Interview Simulator", desc: "Practice real-time speech-to-text behavioral and technical interview rounds." },
  { icon: Code, title: "Coding Challenges", desc: "Solve interactive technical problems ranging from arrays to system designs." },
  { icon: ListTodo, title: "Personalized Learning Plans", desc: "Receive automated learning schedules designed around your timeline." },
  { icon: GraduationCap, title: "Internship Guidance", desc: "Access custom application tips to land entry-level trainee roles." },
  { icon: Briefcase, title: "Job Role Matching", desc: "Analyze match percentages against job boards based on your profile skills." },
  { icon: TrendingUp, title: "Progress Tracker", desc: "Track complete roadmap milestones and log daily study schedules." },
  { icon: Award, title: "Gamification & XP", desc: "Unlock badges, level up, and maintain continuous learning streaks." }
];

const pathsList = [
  { title: "Full Stack Development", level: "Medium", duration: "6-9 Months", salary: "$85k - $140k", tag: "Hot" },
  { title: "AI / Machine Learning", level: "Hard", duration: "9-12 Months", salary: "$110k - $180k", tag: "Explosive" },
  { title: "UI/UX Design", level: "Easy", duration: "4-6 Months", salary: "$70k - $125k", tag: "Creative" },
  { title: "Cloud Engineering", level: "Medium", duration: "6-9 Months", salary: "$100k - $170k", tag: "Scalable" }
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#030308] text-white flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400 mb-6 animate-pulse-glow">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Generation AI Career Architecture
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Your Personal <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent text-glow-blue">
              AI Career Mentor
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-400 mb-8 max-w-xl leading-relaxed">
            Get personalized career guidance, skill roadmaps, resume analysis, interview preparation, and career growth recommendations powered by AI. Designed to transition you from learner to industry leader.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/login?register=true" className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-sm font-semibold text-center text-white transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.55)] flex items-center justify-center gap-2 group">
              Start Career Journey
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-semibold text-center text-gray-300 hover:text-white transition-all backdrop-blur-sm cursor-pointer">
              Explore Features
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/5 w-full max-w-md">
            <div>
              <div className="text-2xl font-bold text-white">99%</div>
              <div className="text-xs text-gray-500">ATS Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">12+</div>
              <div className="text-xs text-gray-500">Career Paths</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-gray-500">Instant Coaching</div>
            </div>
          </div>
        </div>

        {/* Hero Visual Animation */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-cyan-500/20 absolute blur-3xl -z-10 animate-pulse-glow" />
          
          {/* Futuristic CSS Animated 3D Sphere */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center border border-white/5 rounded-full p-8 glass-panel animate-float shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]">
            
            {/* Core Orb */}
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-600 to-cyan-400 opacity-80 shadow-[0_0_50px_rgba(99,102,241,0.5),inset_0_4px_20px_rgba(255,255,255,0.3)] animate-pulse" />
            
            {/* Orbit Ring 1 */}
            <div className="absolute w-[80%] h-[80%] border border-dashed border-indigo-400/20 rounded-full animate-[spin_12s_linear_infinite]" />
            
            {/* Orbit Ring 2 */}
            <div className="absolute w-[105%] h-[105%] border border-indigo-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-pulse" />
            </div>

            {/* Orbit Ring 3 */}
            <div className="absolute w-[120%] h-[120%] border border-cyan-400/10 rounded-full animate-[spin_30s_linear_infinite]">
              <div className="absolute bottom-0 right-1/4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
            </div>

            {/* Glass panel badges overlay */}
            <div className="absolute -top-4 -right-4 px-4 py-2.5 rounded-2xl glass-card text-xs font-semibold flex items-center gap-2 border border-white/10 shadow-lg">
              <Zap className="w-4 h-4 text-yellow-400" />
              10k+ Careers Guided
            </div>

            <div className="absolute bottom-8 -left-6 px-4 py-2.5 rounded-2xl glass-card text-xs font-semibold flex items-center gap-2 border border-white/10 shadow-lg">
              <Award className="w-4 h-4 text-cyan-400" />
              ATS Resume Grader Live
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 md:py-28 relative z-10 border-t border-white/5 bg-gradient-to-b from-[#030308] to-[#060613]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs font-semibold text-indigo-400 mb-4">
            Capabilities
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Next-Gen Career Optimization Tools
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-16 text-sm md:text-base">
            CareerPilot AI replaces traditional guidance counseling with automated, intelligent feedback pipelines tailored directly to corporate needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((f, idx) => (
              <div key={idx} className="glass-card p-8 rounded-2xl flex flex-col items-start text-left border border-white/5 glow-border-blue hover:scale-[1.02] transition-all duration-300">
                <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 mb-6 text-blue-400">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Paths Preview Section */}
      <section id="paths" className="py-20 max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs font-semibold text-cyan-400 mb-4">
              Supported Domains
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Explore Dynamic Industry Paths
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed text-sm md:text-base">
              Whether you are an aspiring ML researcher, an entrepreneur, or planning Higher Studies, CareerPilot maps out the milestones, courses, and interview sets you need to succeed.
            </p>
            <Link href="/login?register=true" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-semibold transition-all flex items-center gap-2">
              Browse All 12 Domains
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pathsList.map((p, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/20 border border-blue-500/30 text-blue-400">
                  {p.tag}
                </div>
                <h3 className="text-base font-bold text-white mb-4 mt-2">{p.title}</h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="text-white font-medium">{p.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline:</span>
                    <span className="text-white font-medium">{p.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salary:</span>
                    <span className="text-green-400 font-medium">{p.salary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Roadmaps Section */}
      <section id="roadmaps" className="py-20 md:py-28 relative z-10 border-t border-white/5 bg-gradient-to-b from-[#030308] to-[#060613]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-xs font-semibold text-purple-400 mb-4">
            Curated Journeys
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Personalized Learning Roadmaps
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-16 text-sm md:text-base">
            No more guessing what to learn next. CareerPilot creates customized step-by-step pathways to take you from beginner to job-ready.
          </p>

          {/* Interactive Roadmap Steps Visual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center relative group glow-border-purple">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest mb-2">Step 01</span>
              <h3 className="text-base font-bold text-white mb-2">Identify & Map</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Select your target career path and let AI assess your current skills to outline immediate gaps.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center relative group glow-border-purple">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest mb-2">Step 02</span>
              <h3 className="text-base font-bold text-white mb-2">Study Core Material</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Learn via structured weekly curriculums containing selected courses, official docs, and videos.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center relative group glow-border-purple">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5">
                <Code className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-2">Step 03</span>
              <h3 className="text-base font-bold text-white mb-2">Build Proof-of-Work</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Develop real-world, portfolio-grade projects designed to showcase your skills to future employers.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center relative group glow-border-purple">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <Award className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest mb-2">Step 04</span>
              <h3 className="text-base font-bold text-white mb-2">Practice & Land</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Test your knowledge through custom coding challenges and prepare for interviews using our Voice simulator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Resources Section */}
      <section id="resources" className="py-20 md:py-28 relative z-10 border-t border-white/5 bg-[#030308]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs font-semibold text-cyan-400 mb-4">
                Elite Learning Material
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                Curated Learning Resources
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed text-sm md:text-base">
                We crawl documentation, online courses, and interactive platforms to recommend only the most current and industry-relevant materials for each career roadmap.
              </p>
              <div className="space-y-4 w-full">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-blue-600/15 text-blue-400 shrink-0 mt-0.5">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Up-to-Date Documentation</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Learn using primary sources like official docs and MDN guides.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-indigo-600/15 text-indigo-400 shrink-0 mt-0.5">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Interactive Coding Playgrounds</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Get hand-picked practice repositories and code sandboxes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resource Item 1 */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group glow-border-cyan">
                <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/20 border border-blue-500/30 text-blue-400">
                  Documentation
                </div>
                <h3 className="text-sm font-bold text-white mb-2 mt-2">NextJS & React Masterclass</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Official framework guides and advanced developer documentation.</p>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  Source: Vercel Docs <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Resource Item 2 */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group glow-border-cyan">
                <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  Courses
                </div>
                <h3 className="text-sm font-bold text-white mb-2 mt-2">Modern Systems Design</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Highly rated modular lectures covering distributed architectures and databases.</p>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  Source: Curated Courses <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Resource Item 3 */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group glow-border-cyan">
                <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-600/20 border border-purple-500/30 text-purple-400">
                  Practice
                </div>
                <h3 className="text-sm font-bold text-white mb-2 mt-2">DSA & Algo Playgrounds</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">LeetCode Lists, Codeforces, and HackerRank custom modules categorized by difficulty.</p>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  Source: Code Platforms <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>

              {/* Resource Item 4 */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group glow-border-cyan">
                <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-600/20 border border-cyan-500/30 text-cyan-400">
                  Project Templates
                </div>
                <h3 className="text-sm font-bold text-white mb-2 mt-2">Full-Stack Repositories</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">Boilerplate codebases with CI/CD configurations for instant developer start.</p>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  Source: GitHub Curated <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10 border-t border-white/5 bg-[#060613]">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to Take Control of Your Career?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl text-sm md:text-base leading-relaxed">
            Join thousands of users who have optimized their resumes, identified their skill gaps, and aced their target role interviews.
          </p>
          <Link href="/login?register=true" className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-sm font-semibold text-white transition-all shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] flex items-center gap-2">
            Get Access Instantly
            <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
