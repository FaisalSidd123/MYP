/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { isUserAdmin } from '@/lib/adminCheck';
import AssignTaskModal from '@/components/admin/AssignTaskModal';

interface AgentMetric {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  leadsCount: number;
  pipelineValue: number;
  wonCount: number;
  winRate: number;
  openTasksCount: number;
  completedTasksCount: number;
  staleLeadsCount: number;
  nichesCount: number;
  performanceGrade: 'A+' | 'A' | 'B' | 'Needs Review';
}

interface CrossAgentLead {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  status: string;
  dealValue: number;
  leadScore: number;
  createdAt: string;
  leadAge: {
    formattedDate: string;
    daysOld: number;
    badgeText: string;
    badgeClasses: string;
    dotColor: string;
  };
  agentId: string;
  agentName: string;
  agentEmail: string;
}

export default function AdminPortalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'tasks' | 'leads'>('agents');
  
  // Data states
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [agents, setAgents] = useState<AgentMetric[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<CrossAgentLead[]>([]);

  // Modals & UI controls
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgentForTask, setSelectedAgentForTask] = useState<string>('');
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('all');
  const [taskFilterAgent, setTaskFilterAgent] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fetchAdminData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const token = await user.getIdToken();

      // Fetch overview & tasks in parallel
      const [overviewRes, tasksRes] = await Promise.all([
        fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!overviewRes.ok) {
        if (overviewRes.status === 403 || overviewRes.status === 401) {
          setAuthorized(false);
          setLoading(false);
          return;
        }
        throw new Error('Failed to load admin overview');
      }

      const overviewData = await overviewRes.json();
      const tasksData = await tasksRes.json();

      setAuthorized(true);
      setGlobalStats(overviewData.globalStats);
      setAgents(overviewData.agents || []);
      setRecentLeads(overviewData.recentLeads || []);
      setTasks(tasksData.tasks || []);
    } catch (err: any) {
      console.error('Error loading admin portal:', err);
      showToast(err.message || 'Failed to sync admin data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user, fetchAdminData]);

  // Handle Role Toggle (Admin <-> Agent)
  const handleToggleRole = async (targetUserId: string, currentRole: string) => {
    if (!user) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target_user_id: targetUserId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update user role', 'error');
        return;
      }
      showToast(`User role successfully updated to ${newRole.toUpperCase()}`);
      fetchAdminData();
    } catch {
      showToast('Failed to update user role', 'error');
    }
  };

  // Handle Task Quick Status Update
  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (res.ok) {
        showToast('Task status updated');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update task status', 'error');
    }
  };

  // Filtered Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesAgent = taskFilterAgent === 'all' || t.user_id === taskFilterAgent;
    const matchesStatus = taskFilterStatus === 'all' || t.status === taskFilterStatus;
    return matchesAgent && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-500 font-medium">
        <span className="material-symbols-outlined text-3xl animate-spin mb-2 text-purple-700">refresh</span>
        <p className="text-xs uppercase tracking-wider font-mono">Loading MYP Command Center...</p>
      </div>
    );
  }

  // Access Denied Screen for Non-Admin
  if (!authorized && !isUserAdmin(user?.email)) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-lg space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
            Restricted Administration Area
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Your current account ({user?.email}) does not have administrative privileges to manage team agents or view company-wide performance.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
          showToast('Task successfully assigned to agent!');
          fetchAdminData();
        }}
        agents={agents}
        preselectedAgentId={selectedAgentForTask}
      />

      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-headline)' }}>
              MYP Admin Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 border border-purple-200 text-purple-900 text-xs font-mono font-bold flex items-center gap-1">
              <span>👑</span>
              <span>ORGANIZATION ROOT</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Global management portal for <strong>{user?.email}</strong>. Track agent performance, assign tasks, and monitor organization pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => {
              setSelectedAgentForTask('');
              setIsAssignModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">assignment_add</span>
            <span>+ Delegate Task</span>
          </button>
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Global Organization KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pipeline */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            TOTAL ORG PIPELINE
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono mt-1">
            {formatCurrency(globalStats?.totalPipelineValue || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Accumulated deal value across all agents</p>
        </div>

        {/* Active Team / Agents */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            TEAM AGENTS & MEMBERS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono">
              {globalStats?.totalAgents || agents.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">registered</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-user workspace accounts</p>
        </div>

        {/* Global Leads & Win Rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            TOTAL LEADS & WIN RATE
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
              {globalStats?.totalLeads || 0}
            </span>
            <span className="text-xs text-emerald-600 font-mono font-semibold">
              ({globalStats?.globalConversionRate || 0}% win rate)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{globalStats?.wonLeads || 0} closed & won deals</p>
        </div>

        {/* Total Tasks & Delegation */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            ACTIVE ASSIGNED TASKS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono">
              {globalStats?.pendingTasks || 0}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {globalStats?.totalTasks || 0} total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{globalStats?.completedTasks || 0} completed</p>
        </div>
      </div>

      {/* Tabs Control Ribbon */}
      <div className="border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'agents', label: `Agents & Performance (${agents.length})`, icon: 'group' },
            { id: 'tasks', label: `Task Delegation Hub (${tasks.length})`, icon: 'assignment' },
            { id: 'leads', label: 'Cross-Agent Lead Stream', icon: 'hub' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-purple-900 text-purple-950 bg-purple-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: AGENTS & PERFORMANCE MATRIX */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: 'var(--font-headline)' }}>
                Team Members & Agent Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor individual agent outputs, conversion rates, pipeline contributions, and assign tasks.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    <th className="py-3 px-5">Agent / Member</th>
                    <th className="py-3 px-4">Role & Status</th>
                    <th className="py-3 px-4">Leads & Verticals</th>
                    <th className="py-3 px-4">Pipeline Value</th>
                    <th className="py-3 px-4">Win Rate %</th>
                    <th className="py-3 px-4">Open Tasks</th>
                    <th className="py-3 px-4">Stale Leads (&gt;30d)</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agents.map((agent) => {
                    const isSelf = agent.email.toLowerCase() === user?.email?.toLowerCase();
                    return (
                      <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Member Identity */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 font-bold flex items-center justify-center text-xs font-mono shrink-0">
                              {agent.displayName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{agent.displayName}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-600 text-[9px] font-mono font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">{agent.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role & Status */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                                agent.role === 'admin'
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span>{agent.role === 'admin' ? '👑 Admin' : '👤 Agent'}</span>
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {agent.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </div>
                        </td>

                        {/* Leads Count */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          <div>
                            <span>{agent.leadsCount} leads</span>
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {agent.nichesCount} niches
                            </span>
                          </div>
                        </td>

                        {/* Pipeline Value */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatCurrency(agent.pipelineValue)}
                        </td>

                        {/* Win Rate */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                                agent.winRate >= 20
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {agent.winRate}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">({agent.wonCount} won)</span>
                          </div>
                        </td>

                        {/* Open Tasks */}
                        <td className="py-3.5 px-4 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              agent.openTasksCount > 0
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'text-slate-400'
                            }`}
                          >
                            {agent.openTasksCount} pending
                          </span>
                        </td>

                        {/* Stale Leads */}
                        <td className="py-3.5 px-4 font-mono">
                          {agent.staleLeadsCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold">
                              ⚠️ {agent.staleLeadsCount} stale
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-normal">0 stale</span>
                          )}
                        </td>

                        {/* Grade */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold ${
                              agent.performanceGrade === 'A+'
                                ? 'bg-emerald-100 text-emerald-900'
                                : agent.performanceGrade === 'A'
                                ? 'bg-blue-100 text-blue-900'
                                : agent.performanceGrade === 'Needs Review'
                                ? 'bg-rose-100 text-rose-900'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {agent.performanceGrade}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAgentForTask(agent.id);
                                setIsAssignModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              title="Assign a task to this agent"
                            >
                              Assign Task
                            </button>

                            {!isUserAdmin(agent.email) && (
                              <button
                                onClick={() => handleToggleRole(agent.id, agent.role)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                title="Toggle Admin/User role"
                              >
                                {agent.role === 'admin' ? 'Demote' : 'Promote'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASK DELEGATION HUB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: 'var(--font-headline)' }}>
                Cross-Agent Task Delegation Board
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track tasks assigned to agents, filter by status, and assign new tasks directly.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Agent Filter */}
              <select
                value={taskFilterAgent}
                onChange={(e) => setTaskFilterAgent(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs cursor-pointer"
              >
                <option value="all">All Assignees</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.displayName}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={taskFilterStatus}
                onChange={(e) => setTaskFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={() => {
                  setSelectedAgentForTask('');
                  setIsAssignModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                + Assign Task
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">task</span>
                <p className="text-xs font-bold text-slate-700">No tasks found matching criteria</p>
                <p className="text-[11px] text-slate-400 mt-1">Assign your first task to an agent above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      <th className="py-3 px-5">Task Title</th>
                      <th className="py-3 px-4">Assigned Agent</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Title & Notes */}
                        <td className="py-3.5 px-5 min-w-[200px]">
                          <div>
                            <p className="font-bold text-slate-900">{task.title}</p>
                            {task.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                            <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-900 text-[10px] font-bold flex items-center justify-center font-mono">
                              {task.assigneeName.slice(0, 2).toUpperCase()}
                            </span>
                            <span>{task.assigneeName}</span>
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              task.priority === 'urgent'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : task.priority === 'high'
                                ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                : task.priority === 'low'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {task.priority || 'medium'}
                          </span>
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                              task.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : task.status === 'in_progress'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>

                        {/* Quick Status Selector */}
                        <td className="py-3.5 px-5 text-right">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-800 shadow-xs cursor-pointer focus:outline-none"
                          >
                            <option value="pending">PENDING</option>
                            <option value="in_progress">IN PROGRESS</option>
                            <option value="completed">COMPLETED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CROSS-AGENT LEAD STREAM */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: 'var(--font-headline)' }}>
              Cross-Agent Pipeline Stream
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live feed of leads added and managed across all agent accounts with accountability attribution.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    <th className="py-3 px-5">Lead / Business</th>
                    <th className="py-3 px-4">Managing Agent</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Deal Value</th>
                    <th className="py-3 px-4">Date Added & Age</th>
                    <th className="py-3 px-4">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 block">{lead.name}</span>
                        <span className="text-[11px] text-slate-400">{lead.company || 'Direct Prospect'}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="inline-flex items-center gap-1.5 text-purple-950 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                          <span className="material-symbols-outlined text-[14px]">person</span>
                          <span>{lead.agentName}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        <span>{lead.phone || lead.email || '-'}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(lead.dealValue)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-slate-800 font-mono text-[11px] font-semibold block">
                            {lead.leadAge.formattedDate}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold border ${lead.leadAge.badgeClasses}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${lead.leadAge.dotColor}`} />
                            <span>{lead.leadAge.badgeText}</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold">
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
