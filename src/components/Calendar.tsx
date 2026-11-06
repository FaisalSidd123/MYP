/* eslint-disable */
"use client";
import React, { useState, useEffect } from 'react';

interface CalendarProps {
  events?: any[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
}

export default function Calendar({ events = [], onDateSelect, selectedDate: externalSelectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(externalSelectedDate || null);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    if (externalSelectedDate) {
      setSelectedDate(externalSelectedDate);
      setCurrentMonth(new Date(externalSelectedDate.getFullYear(), externalSelectedDate.getMonth(), 1));
    }
  }, [externalSelectedDate]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const days: Date[] = [];
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    setCalendarDays(days);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    handleDateSelect(today);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <h3 className="text-base font-bold text-slate-900" style={{ fontFamily: "var(--font-headline)" }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-400 py-1 font-mono uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;
          const isCurrent = isCurrentMonth(date);
          const selected = isSelected(date);
          const today = isToday(date);

          return (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              className={`
                relative aspect-square p-1.5 rounded-xl transition-all text-xs font-medium flex flex-col items-center justify-center
                ${!isCurrent ? 'opacity-30 text-slate-400' : 'text-slate-800'}
                ${selected && !today ? 'bg-slate-900 text-white font-bold shadow-xs' : ''}
                ${!selected && isCurrent ? 'hover:bg-slate-100' : ''}
              `}
            >
              <span
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full text-xs
                  ${today ? 'bg-indigo-600 text-white font-bold shadow-xs' : ''}
                `}
              >
                {date.getDate()}
              </span>

              {/* Event Dot Indicators */}
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <span
                      key={idx}
                      className={`
                        w-1 h-1 rounded-full
                        ${selected ? 'bg-white' : 'bg-indigo-500'}
                      `}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
