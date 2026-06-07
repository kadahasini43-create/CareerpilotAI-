"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (credentials: any) => Promise<void>;
  logout: () => void;
  onboard: (onboardingData: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
  gamificationAlert: { show: boolean; title: string; message: string; type: 'xp' | 'badge' | 'level' } | null;
  triggerAlert: (title: string, message: string, type: 'xp' | 'badge' | 'level') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [gamificationAlert, setGamificationAlert] = useState<AuthContextType['gamificationAlert']>(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await api.getProfile();
      setUser(data.user);
      setProfile(data.profile);
    } catch (error) {
      console.error("Failed to load user session", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const data = await api.login(credentials);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      
      triggerAlert("Welcome Back!", `Continuous learning streak: ${data.profile.streakCount} days.`, 'xp');

      if (!data.profile.dreamRole) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (credentials: any) => {
    setLoading(true);
    try {
      const data = await api.register(credentials);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      router.push('/onboarding');
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
    router.push('/login');
  };

  const onboard = async (onboardingData: any) => {
    try {
      const data = await api.onboard(onboardingData);
      setProfile(data.profile);
      
      if (data.rewards?.badgeUnlocked) {
        triggerAlert("Badge Unlocked!", "Unlocked 'Career Explorer' badge! (+100 XP)", 'badge');
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const data = await api.getProfile();
      setUser(data.user);
      
      // Check if XP increased to trigger dynamic UI notifications
      if (profile && data.profile.xp > profile.xp) {
        const diff = data.profile.xp - profile.xp;
        triggerAlert("XP Earned!", `+${diff} XP! Keep up the good work.`, 'xp');
      }
      
      // Check if Level increased
      if (profile && data.profile.level > profile.level) {
        triggerAlert("Level Up!", `Congratulations! You reached Level ${data.profile.level}!`, 'level');
      }

      setProfile(data.profile);
    } catch (error) {
      console.error("Failed to refresh profile data:", error);
    }
  };

  const triggerAlert = (title: string, message: string, type: 'xp' | 'badge' | 'level') => {
    setGamificationAlert({ show: true, title, message, type });
    setTimeout(() => {
      setGamificationAlert(null);
    }, 4500);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      token,
      loading,
      login,
      register,
      logout,
      onboard,
      refreshProfile,
      gamificationAlert,
      triggerAlert
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
