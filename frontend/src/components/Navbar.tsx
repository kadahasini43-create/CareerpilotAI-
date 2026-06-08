"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Compass, Menu, X, Rocket, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, token } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
      scrolled 
        ? 'py-3 bg-black/60 backdrop-blur-md border-b border-white/5' 
        : 'py-5 bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
            <Compass className="w-5.5 h-5.5 text-white animate-spin-slow" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            CareerPilot <span className="text-blue-400 font-medium text-sm tracking-widest uppercase ml-1">AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" onClick={(e) => handleScrollClick(e, 'features')} className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Features</a>
          <a href="/#paths" onClick={(e) => handleScrollClick(e, 'paths')} className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Career Paths</a>
          <a href="/#roadmaps" onClick={(e) => handleScrollClick(e, 'roadmaps')} className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Roadmaps</a>
          <a href="/#resources" onClick={(e) => handleScrollClick(e, 'resources')} className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">Resources</a>
        </div>

        {/* Desktop Call to Actions */}
        <div className="hidden md:flex items-center gap-4">
          {token ? (
            <Link href="/dashboard" className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-sm font-semibold transition-all flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors px-3 py-2">
                Login
              </Link>
              <Link href="/login?register=true" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-sm font-semibold text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center gap-2">
                Get Started
                <Rocket className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2 text-gray-400 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-panel border-b border-white/10 py-6 px-6 flex flex-col gap-5 bg-black/95">
          <a href="/#features" onClick={(e) => { handleScrollClick(e, 'features'); setMobileMenuOpen(false); }} className="text-sm text-gray-300 hover:text-white py-1 cursor-pointer">Features</a>
          <a href="/#paths" onClick={(e) => { handleScrollClick(e, 'paths'); setMobileMenuOpen(false); }} className="text-sm text-gray-300 hover:text-white py-1 cursor-pointer">Career Paths</a>
          <a href="/#roadmaps" onClick={(e) => { handleScrollClick(e, 'roadmaps'); setMobileMenuOpen(false); }} className="text-sm text-gray-300 hover:text-white py-1 cursor-pointer">Roadmaps</a>
          <a href="/#resources" onClick={(e) => { handleScrollClick(e, 'resources'); setMobileMenuOpen(false); }} className="text-sm text-gray-300 hover:text-white py-1 cursor-pointer">Resources</a>
          
          <div className="h-px bg-white/5 my-2" />

          {token ? (
            <Link href="/dashboard" className="w-full text-center py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold flex items-center justify-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" className="w-full text-center py-2.5 text-sm font-semibold text-gray-300 border border-transparent hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link href="/login?register=true" className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 text-sm font-semibold text-white" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
