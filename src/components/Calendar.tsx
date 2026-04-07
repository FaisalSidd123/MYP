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

  // Update internal selectedDate when external prop changes
  useEffect(() => {
    if (externalSelectedDate) {
      setSelectedDate(externalSelectedDate);
      // Also navigate to the month of the selected date
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
    <div className="glass-panel rounded-2xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h3 className="text-xl font-bold text-on-surface">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-on-surface-variant py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const hasEvents = dayEvents.length > 0;
          const isCurrent = isCurrentMonth(date);

          return (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              className={`
                relative aspect-square p-2 rounded-xl transition-all duration-200
                ${!isCurrent ? 'opacity-40' : 'opacity-100'}
                ${isSelected(date) ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-white/5'}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span
                  className={`
                    text-sm font-medium
                    ${isToday(date) ? 'w-8 h-8 flex items-center justify-center rounded-full bg-primary text-on-primary' : 'text-on-surface'}
                    ${isSelected(date) && !isToday(date) ? 'text-primary' : ''}
                  `}
                >
                  {date.getDate()}
                </span>

                {/* Event Indicators */}
                {hasEvents && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event, idx) => (
                      <div
                        key={idx}
                        className={`
                          w-1.5 h-1.5 rounded-full
                          ${event.type === 'call' ? 'bg-blue-400' : ''}
                          ${event.type === 'meeting' ? 'bg-emerald-400' : ''}
                          ${event.type === 'follow_up' ? 'bg-amber-400' : ''}
                          ${event.status === 'completed' ? 'bg-green-400' : ''}
                        `}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}