/* eslint-disable */
"use client";
import React from 'react';

const mockEvents = {
  2: [{ color: 'bg-tertiary', title: 'Client Review' }],
  4: [{ color: 'bg-secondary', title: 'Internal Sync' }],
  10: [{ color: 'bg-error', title: 'Cancelled Demo' }],
  11: [{ color: 'bg-primary', shadow: true, title: 'Important' }, { color: 'bg-secondary', title: 'Secondary' }],
};

export default function Calendar() {
  // Use a fixed date for the mockup (Sept 2024 mapping) to preserve the visual design perfectly.
  const daysInMonth = 30; // Sept
  const startDay = 0; // Sept 1 is Sunday
  
  const days = [];
  for (let i = 0; i < startDay; i++) {
    const prevMonthDays = 31; // Aug
    days.push({ day: prevMonthDays - startDay + i + 1, isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  const remaining = 42 - days.length; // fill 6 rows of 7
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  return (
    <div className="grid grid-cols-7 glass-panel rounded-3xl overflow-hidden shadow-2xl">
      {days.map((d, index) => {
        const hasEvents = d.isCurrentMonth && mockEvents[d.day as keyof typeof mockEvents];
        const isToday = d.isCurrentMonth && d.day === 11; // mock today

        return (
          <div 
            key={index} 
            className={`aspect-square p-3 border-r border-b hover:bg-white/5 transition-colors cursor-pointer 
            ${!d.isCurrentMonth ? 'bg-surface-container-lowest/30 opacity-20 border-white/5' : ''} 
            ${isToday ? 'border-white/10 bg-primary/10 relative overflow-hidden group' : 'border-white/5'}`}
          >
            {isToday && <div className="absolute inset-0 bg-primary/5 blur-xl"></div>}
            
            <span className={`text-sm ${isToday ? 'font-bold text-primary relative z-10' : 'font-medium'}`}>{d.day}</span>
            
            {hasEvents && (
              <div className="mt-2 space-y-1 relative z-10">
                {hasEvents.map((evt: any, i: number) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-full ${evt.color} rounded-full ${isToday && evt.shadow ? 'shadow-[0_0_8px_rgba(192,193,255,0.6)]' : 'opacity-40'}`} 
                    title={evt.title}
                  ></div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
