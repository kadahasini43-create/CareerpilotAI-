"use client";
import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">CareerPilot AI</span>
          </div>
          <p className="text-sm text-gray-400 max-w-sm">
            Empowering students and professionals to navigate their career paths with personalized AI mentors, roadmaps, and mock interview tools.
          </p>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Features</h4>
          <ul className="space-y-2.5">
            <li><Link href="/#features" className="text-sm text-gray-400 hover:text-white transition-colors">AI Mentor Chat</Link></li>
            <li><Link href="/#features" className="text-sm text-gray-400 hover:text-white transition-colors">Roadmap Timeline</Link></li>
            <li><Link href="/#features" className="text-sm text-gray-400 hover:text-white transition-colors">Resume ATS Grader</Link></li>
            <li><Link href="/#features" className="text-sm text-gray-400 hover:text-white transition-colors">Mock Interviews</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
          <ul className="space-y-2.5">
            <li><Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Login</Link></li>
            <li><Link href="/login?register=true" className="text-sm text-gray-400 hover:text-white transition-colors">Register</Link></li>
            <li><Link href="/onboarding" className="text-sm text-gray-400 hover:text-white transition-colors">Onboarding</Link></li>
            <li><Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">User Dashboard</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} CareerPilot AI. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
