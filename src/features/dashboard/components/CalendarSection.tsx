'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, CheckCircle2, XCircle } from 'lucide-react';

import type { TrainingSession } from '@/types';

export function CalendarSection({ sessions }: { sessions: TrainingSession[] }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [isExpanded, setIsExpanded] = useState(false);

  const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDaysShort = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) { setViewYear((prev) => prev - 1); setViewMonth(11); }
    else setViewMonth((prev) => prev - 1);
  };
  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) { setViewYear((prev) => prev + 1); setViewMonth(0); }
    else setViewMonth((prev) => prev + 1);
  };

  const getDaySession = (year: number, month: number, day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sessions.find((s) => s.date.slice(0, 10) === key);
  };

  const isDayToday = (year: number, month: number, day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return key === today.toISOString().slice(0, 10);
  };

  const isPastDay = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    return d.getTime() < t.getTime();
  };

  const monthCells: { day: number | null; month: number; year: number }[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) monthCells.push({ day: null, month: viewMonth, year: viewYear });
  for (let d = 1; d <= daysInMonth; d++) monthCells.push({ day: d, month: viewMonth, year: viewYear });
  while (monthCells.length % 7 !== 0) monthCells.push({ day: null, month: viewMonth, year: viewYear });

  const getWeekCells = () => {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      week.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear() });
    }
    return week;
  };

  const cells = isExpanded ? monthCells : getWeekCells();

  return (
    <motion.div layout className="card" onClick={() => setIsExpanded(!isExpanded)} style={{ padding: '16px', marginBottom: '20px', cursor: 'pointer', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ color: 'var(--red-primary)' }}><Calendar size={18} /></div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{isExpanded ? `${monthNames[viewMonth]} ${viewYear}` : 'Sua Semana'}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isExpanded && (
            <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
              <button onClick={prevMonth} className="btn-ghost" style={{ padding: '4px 8px', borderRadius: '8px' }}>
                <ChevronDown size={14} style={{ transform: 'rotate(90deg)' }} />
              </button>
              <button onClick={nextMonth} className="btn-ghost" style={{ padding: '4px 8px', borderRadius: '8px' }}>
                <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
              </button>
            </div>
          )}
          <div style={{ color: 'var(--text-muted)' }}>{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
        </div>
      </div>
      <motion.div initial={false} animate={{ height: 'auto' }} style={{ width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {weekDaysShort.map((d, i) => (
            <div key={`${d}-${i}`} style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '6px' }}>{d}</div>
          ))}
          <AnimatePresence mode="popLayout">
            {cells.map((cell, idx) => {
              if (cell.day === null) return <div key={`empty-${idx}`} />;
              const session = getDaySession(cell.year, cell.month, cell.day);
              const trained = !!session;
              const todayMark = isDayToday(cell.year, cell.month, cell.day);
              const missed = !trained && !todayMark && !isExpanded && isPastDay(cell.year, cell.month, cell.day);

              return (
                <motion.div
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={['calendar-day', todayMark ? 'calendar-day-active' : '', trained ? 'calendar-day-trained' : '', missed ? 'calendar-day-missed' : ''].filter(Boolean).join(' ')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 0', borderRadius: '12px', background: 'transparent', position: 'relative' }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: todayMark ? 900 : 700 }}>{cell.day}</span>
                  {!isExpanded && (
                    <div style={{ marginTop: '6px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {trained && <CheckCircle2 size={14} style={{ color: 'var(--green)' }} />}
                      {missed && <XCircle size={14} style={{ color: 'var(--red-primary)', opacity: 0.85 }} />}
                      {todayMark && !trained && <div className="calendar-dot" style={{ background: 'rgba(255,255,255,0.7)' }} />}
                    </div>
                  )}
                  {isExpanded && trained && !todayMark && <div className="calendar-dot" />}
                  {isExpanded && trained && todayMark && <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%', marginTop: '4px' }} />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
