"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Compass, GraduationCap, Target, Heart, Award, ArrowRight, Loader2 } from 'lucide-react';

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

export default function OnboardingPage() {
  const { onboard, profile, token } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [education, setEducation] = useState('');
  const [degree, setDegree] = useState('');
  const [dreamRole, setDreamRole] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!education || !degree)) {
      setError("Please fill in education and degree details.");
      return;
    }
    if (step === 2 && !dreamRole) {
      setError("Please select or type your dream role.");
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const skills = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (skills.length === 0) {
      setError("Please add at least one core skill.");
      setLoading(false);
      return;
    }

    try {
      await onboard({
        education,
        degree,
        dreamRole,
        skills,
        experienceLevel,
        careerInterests: selectedInterests
      });
    } catch (err: any) {
      setError(err.message || "Failed to update profile onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10 px-6 py-12">
      {/* Background radial mesh */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-blue-900/10 via-transparent to-cyan-950/10 pointer-events-none -z-10" />

      <div className="w-full max-w-xl">
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-gray-500">Step {step} of 3</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-blue-500' : 'w-2 bg-white/10'}`} />
            ))}
          </div>
        </div>

        {/* Wizard Form Frame */}
        <div className="glass-card p-8 md:p-10 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/25 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* STEP 1: Education */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Academic Profile</h2>
              </div>
              <p className="text-sm text-gray-400">Where did you study, and what degree program did you pursue?</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">School / University</label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Degree & Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. B.S. in Computer Science"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-sm text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Career Targets */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Target Career</h2>
              </div>
              <p className="text-sm text-gray-400">What is your dream position? Pick an industry path or type your own.</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Dream Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Artificial Intelligence Researcher"
                    value={dreamRole}
                    onChange={(e) => setDreamRole(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-sm text-white mb-2"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Quick Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {presetRoles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setDreamRole(role)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          dreamRole === role 
                            ? 'bg-blue-600/30 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Skills & Interests */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Skills & Interests</h2>
              </div>
              <p className="text-sm text-gray-400">List your current tech stack (comma-separated) and select core interests.</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Skills (Comma-separated)</label>
                  <textarea
                    placeholder="e.g. React, Node.js, Python, CSS, Git"
                    rows={2}
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-sm text-white resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Experience Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperienceLevel(lvl)}
                        className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                          experienceLevel === lvl
                            ? 'bg-cyan-600/25 border-cyan-500 text-white'
                            : 'bg-white/5 border-white/5 text-gray-400'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Fields of Interest</label>
                  <div className="flex flex-wrap gap-2">
                    {['Web Development', 'Machine Learning', 'Data Security', 'Product Design', 'DevOps Pipelines', 'Cloud Native'].map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                          selectedInterests.includes(interest)
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Complete & Initialize
                    <Award className="w-4 h-4 text-yellow-400" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
