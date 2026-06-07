"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { 
  User, GraduationCap, Briefcase, Plus, X, 
  CheckCircle, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, user, refreshProfile, triggerAlert } = useAuth();
  
  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [degree, setDegree] = useState('');
  const [dreamRole, setDreamRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      setName(user.name || '');
      setEducation(profile.education || '');
      setDegree(profile.degree || '');
      setDreamRole(profile.dreamRole || '');
      setExperienceLevel(profile.experienceLevel || 'Beginner');
      setSkills(profile.skills || []);
    }
  }, [user, profile]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    
    const skill = newSkill.trim();
    if (!skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      setSkills([...skills, skill]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    if (skills.length === 0) {
      setError("Please add at least one core skill.");
      setLoading(false);
      return;
    }

    try {
      const result = await api.updateProfile({
        name,
        education,
        degree,
        dreamRole,
        experienceLevel,
        skills,
        careerInterests: profile?.careerInterests || []
      });
      
      await refreshProfile();
      setSuccess(true);
      triggerAlert("Profile Saved!", "Your career attributes have been updated successfully.", "xp");
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">My Profile Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your academic achievements, target job roles, and core skill listings.</p>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/25 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 inline-block mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-950/20 text-xs text-green-300">
              <CheckCircle className="w-4 h-4 inline-block mr-2" />
              Profile configurations updated successfully.
            </div>
          )}

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Personal Details
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-3 bg-black/10 border border-white/5 rounded-xl outline-none text-xs text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Academic profile */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <GraduationCap className="w-4.5 h-4.5" />
                Academic profile
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">School / University</label>
                <input
                  type="text"
                  required
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Degree</label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 my-4" />

          {/* Job Target and Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4" />
                Career Target
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase">Dream Job Title</label>
                <input
                  type="text"
                  required
                  value={dreamRole}
                  onChange={(e) => setDreamRole(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-xs text-white"
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
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        experienceLevel === lvl
                          ? 'bg-cyan-600/20 border-cyan-500 text-white'
                          : 'bg-black/30 border-white/5 text-gray-400 hover:border-white/15'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic Skills Tagging System */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold text-yellow-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                Technologies & Skills
              </h3>

              {/* Skills Tags Grid */}
              <div className="flex flex-wrap gap-1.5 p-3 min-h-[70px] bg-black/25 border border-white/10 rounded-xl">
                {skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-gray-300 font-semibold"
                  >
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-xs text-gray-600 self-center">No skills listed yet. Add some below.</span>
                )}
              </div>

              {/* Add Skill Field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Next.js"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center justify-center"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile Attributes"}
          </button>
        </form>
      </div>
    </div>
  );
}
