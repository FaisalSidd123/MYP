/* eslint-disable */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { format, isBefore, addHours, parseISO } from "date-fns";

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all three sources
      const [tasksRes, eventsRes, contactsRes] = await Promise.all([
        fetch("/api/tasks", { headers }),
        fetch("/api/events", { headers }),
        fetch("/api/contacts", { headers }),
      ]);

      const tasks = tasksRes.ok ? await tasksRes.json() : [];
      const events = eventsRes.ok ? await eventsRes.json() : [];
      const contacts = contactsRes.ok ? await contactsRes.json() : [];

      const newNotifications: any[] = [];
      const now = new Date();

      // Process Tasks (overdue or due within 24h & not completed)
      Array.isArray(tasks) && tasks.forEach((task: any) => {
        if (task.status !== "completed") {
          const dueDate = task.due_date ? parseISO(task.due_date) : null;
          if (dueDate) {
            if (isBefore(dueDate, now)) {
              newNotifications.push({
                id: `task-${task.id}`,
                type: "task",
                severity: "high",
                title: "Overdue Task",
                description: task.title,
                time: dueDate,
                icon: "assignment_late",
              });
            } else if (isBefore(dueDate, addHours(now, 24))) {
              newNotifications.push({
                id: `task-${task.id}`,
                type: "task",
                severity: "medium",
                title: "Task Due Soon",
                description: task.title,
                time: dueDate,
                icon: "assignment",
              });
            }
          }
        }
      });

      // Process Events (starting within 48h)
      Array.isArray(events) && events.forEach((event: any) => {
        const startTime = event.start_time ? parseISO(event.start_time) : null;
        if (startTime && isBefore(startTime, addHours(now, 48)) && event.status !== 'completed') {
          // If the event has barely passed but not completed, still show it
          newNotifications.push({
            id: `event-${event.id}`,
            type: "event",
            severity: isBefore(startTime, now) ? 'high' : 'medium',
            title: "Upcoming Event",
            description: event.title,
            time: startTime,
            icon: "event",
          });
        }
      });

      // Process Contacts (status === 'new' or 'pending')
      Array.isArray(contacts) && contacts.forEach((contact: any) => {
        if (contact.status === "new" || contact.status === "pending") {
          newNotifications.push({
            id: `contact-${contact.id}`,
            type: "contact",
            severity: "low",
            title: "New Lead Action Required",
            description: `Review contact: ${contact.name}`,
            time: parseISO(contact.created_at || now.toISOString()),
            icon: "group_add",
          });
        }
      });

      // Sort chronological descending / severity based (simplest: chronological by time)
      newNotifications.sort((a, b) => b.time.getTime() - a.time.getTime());

      setNotifications(newNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-rose-50 text-rose-600 border border-rose-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl w-9 h-9 flex items-center justify-center transition-colors relative"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-[380px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 transform origin-top-right">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Actionable pipeline alerts</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="px-2 py-0.5 bg-slate-900 text-white rounded-md text-[10px] font-bold font-mono">
                {unreadCount}
              </span>
              <button 
                onClick={fetchNotifications}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200/60 text-slate-500 transition-all"
                title="Refresh"
              >
                <span className={`material-symbols-outlined text-[15px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
              </button>
            </div>
          </div>
          
          <div className="max-h-[380px] overflow-y-auto w-full divide-y divide-slate-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="material-symbols-outlined animate-spin text-2xl mb-2">refresh</span>
                <span className="text-[11px] font-medium font-mono">Checking alerts...</span>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((note) => (
                <div key={note.id} className="p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getSeverityStyles(note.severity)}`}>
                    <span className="material-symbols-outlined text-[16px]">{note.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate">{note.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {format(note.time, "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{note.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 px-6 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-500">
                  <span className="material-symbols-outlined text-xl">done_all</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-0.5">You&apos;re all caught up</h4>
                <p className="text-[11px] text-slate-500">No overdue tasks or pending schedules.</p>
              </div>
            )}
          </div>
          
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
