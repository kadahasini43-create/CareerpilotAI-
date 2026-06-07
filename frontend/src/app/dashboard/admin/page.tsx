"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { 
  ShieldAlert, Users, Map, FileCheck, Mic, 
  Cpu, HardDrive, Clock, Loader2, Sparkles 
} from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mockUsersList, setMockUsersList] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
      
      // Seed a couple of mock user logs for the admin table
      setMockUsersList([
        { name: "John Doe", email: "johndoe@stanford.edu", role: "user", status: "Active" },
        { name: "Sarah Connor", email: "sconnor@mit.edu", role: "user", status: "Active" },
        { name: "System Admin", email: "admin@careerpilot.ai", role: "admin", status: "Active" }
      ]);
    } catch (e) {
      console.error("Failed to fetch admin stats", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Aggregating system diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-purple-400" />
          Admin Command Center
        </h1>
        <p className="text-sm text-gray-400 mt-1">Supervise global user behavior, AI system API limits, and Node.js process load.</p>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase">Total Users</span>
            <Users className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <h3 className="text-2xl font-black text-white mt-3">{stats?.counts?.totalUsers || 0} Registrations</h3>
        </div>

        {/* KPI 2 */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase">Active Users</span>
            <Sparkles className="w-4.5 h-4.5 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-black text-white mt-3">{stats?.counts?.activeUsers || 0} Sessions</h3>
        </div>

        {/* KPI 3 */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase">Roadmaps Generated</span>
            <Map className="w-4.5 h-4.5 text-green-400" />
          </div>
          <h3 className="text-2xl font-black text-white mt-3">{stats?.counts?.roadmapsGenerated || 0} Pipelines</h3>
        </div>

        {/* KPI 4 */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase">Resumes Checked</span>
            <FileCheck className="w-4.5 h-4.5 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-black text-white mt-3">{stats?.counts?.resumesAnalyzed || 0} Scans</h3>
        </div>

        {/* KPI 5 */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase">Interviews Conducted</span>
            <Mic className="w-4.5 h-4.5 text-purple-400" />
          </div>
          <h3 className="text-2xl font-black text-white mt-3">{stats?.counts?.interviewsConducted || 0} Audits</h3>
        </div>
      </div>

      {/* Split section: System performance and User list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left/System diagnostics box */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/5 space-y-6">
          <h3 className="text-xs font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5" />
            Infrastructure Diagnostics
          </h3>

          <div className="space-y-4 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Platform Host:</span>
              <span className="text-white font-bold">{stats?.system?.platform}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Host CPU Model:</span>
              <span className="text-white font-bold truncate max-w-[200px]">{stats?.system?.cpuModel}</span>
            </div>

            <div className="space-y-1.5 border-t border-white/5 pt-4">
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-gray-500" />
                  Available Memory:
                </span>
                <span className="text-white font-bold">{stats?.system?.freeMemory} / {stats?.system?.totalMemory}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div className="flex justify-between border-t border-white/5 pt-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                Uptime Log:
              </span>
              <span className="text-white font-bold">{stats?.system?.uptime}</span>
            </div>
          </div>
        </div>

        {/* Right/User list directory table */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/5 overflow-hidden">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4 flex items-center justify-between">
            Registered Account Directory
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-600/20 text-purple-400 border border-purple-500/20">Synced</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-400">
              <thead className="text-[10px] uppercase text-gray-500 border-b border-white/5 font-extrabold">
                <tr>
                  <th className="py-3 px-2">Account Name</th>
                  <th className="py-3 px-2">Email Address</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockUsersList.map((usr, idx) => (
                  <tr key={idx} className="hover:bg-white/2 transition-colors">
                    <td className="py-3 px-2 font-bold text-white">{usr.name}</td>
                    <td className="py-3 px-2 font-mono">{usr.email}</td>
                    <td className="py-3 px-2 uppercase text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded ${usr.role === 'admin' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/25' : 'bg-black/30 border border-white/5 text-gray-400'}`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-green-400 font-semibold">{usr.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
