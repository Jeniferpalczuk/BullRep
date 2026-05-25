'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Dumbbell, Flame, Clock, Award, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

import type { TrainingSession, User } from '@/types';
import { getWeekRange, isInRange, toDateKey } from '@/components/utils';
import { DashTooltip } from '@/features/dashboard/components/DashTooltip';

type Tab = 'home' | 'progress' | 'workout' | 'profile';

export function ProgressScreen({
  sessions,
  user,
  displayName,
  setTab,
}: {
  sessions: TrainingSession[];
  user: User | null;
  displayName: string;
  setTab: (t: Tab) => void;
}) {
  const name = (displayName || user?.name || 'Atleta').split(' ')?.[0] || 'Atleta';
  const level = user?.level || 2;

  const sessionsSorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const sessionVolume = (s: TrainingSession) =>
    s.exercises.reduce((acc, ex) => acc + ex.weight * ex.setsDone * ex.repsDone, 0);

  const estimateDurationMin = (s: TrainingSession) => Math.max(15, Math.round(12 + s.exercises.length * 12));

  const { startOfWeek, endOfWeek, startPrevWeek } = getWeekRange();

  const sessionsThisWeek = sessionsSorted.filter((s) => isInRange(s.date, startOfWeek, endOfWeek));
  const sessionsPrevWeek = sessionsSorted.filter((s) => isInRange(s.date, startPrevWeek, startOfWeek));

  const weekCount = sessionsThisWeek.length;
  const weekDelta = weekCount - sessionsPrevWeek.length;

  const volumeThisWeek = sessionsThisWeek.reduce((a, s) => a + sessionVolume(s), 0);
  const volumePrevWeek = sessionsPrevWeek.reduce((a, s) => a + sessionVolume(s), 0);
  const evolutionPct = volumePrevWeek > 0 ? Math.round(((volumeThisWeek - volumePrevWeek) / volumePrevWeek) * 100) : 20;

  const tempoTotalMin = sessionsThisWeek.reduce((a, s) => a + estimateDurationMin(s), 0);
  const streak = user?.streak?.currentStreak || 3;

  const last10 = sessionsSorted.slice(-10);
  const chartData = last10.map((s, idx) => {
    const volume = sessionVolume(s);
    const durationMin = estimateDurationMin(s);
    return {
      idx: idx + 1,
      date: new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      volume,
      durationMin,
    };
  });

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h <= 0) return `${m}min`;
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  const daysAgo = (iso: string) => {
    const d = new Date(iso);
    const t = new Date();
    d.setHours(0, 0, 0, 0);
    t.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((t.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const best = last10.reduce<{ date: string | null; volume: number }>((acc, s) => {
    const v = sessionVolume(s);
    return v > acc.volume ? { date: s.date, volume: v } : acc;
  }, { date: null, volume: -1 });
  const bestDaysAgo = best.date ? daysAgo(best.date) : null;

  const lastLegs = [...sessionsSorted].reverse().find((s) => /perna|pernas/i.test(s.trainingType));
  const legsDaysAgo = lastLegs ? daysAgo(lastLegs.date) : null;

  const weekKeySet = new Set(sessionsThisWeek.map((s) => toDateKey(s.date)));
  const weekMini = (() => {
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(today.getDate() - mondayOffset);

    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = toDateKey(d.toISOString());
      return {
        label: labels[i],
        key,
        isToday: key === toDateKey(new Date().toISOString()),
        active: weekKeySet.has(key),
      };
    });
  })();

  const xpTarget = 300;
  const xpValue = user?.xp || 0;
  const xpInLevel = ((xpValue % xpTarget) + xpTarget) % xpTarget;
  const xpPct = Math.min(100, Math.round((xpInLevel / xpTarget) * 100));
  const levelLabel = level <= 1 ? 'Iniciante I' : level === 2 ? 'Iniciante II' : `Nível ${level}`;



  // Radar (Equilíbrio muscular)
  const radarGroups: Array<{ key: string; label: string; test: RegExp }> = [
    { key: 'Peito', label: 'Peito', test: /peito/i },
    { key: 'Costas', label: 'Costas', test: /costas/i },
    { key: 'Pernas', label: 'Pernas', test: /perna|pernas/i },
    { key: 'Ombro', label: 'Ombro', test: /ombro/i },
    { key: 'Bíceps', label: 'Bíceps', test: /bíceps|biceps/i },
  ];
  const radarCount = radarGroups.reduce<Record<string, number>>((acc, g) => {
    acc[g.key] = 0;
    return acc;
  }, {});
  sessionsSorted.forEach((s) => {
    const hit = radarGroups.find((g) => g.test.test(s.trainingType));
    if (hit) radarCount[hit.key]++;
  });
  const radarMax = Math.max(1, ...Object.values(radarCount));
  const radarData = radarGroups.map((g) => ({
    subject: g.label,
    A: Math.round((radarCount[g.key] / radarMax) * 100),
    fullMark: 100,
  }));
  const strongest = Object.entries(radarCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Peito';
  const legsBelow = (radarCount['Pernas'] || 0) <= Math.floor(Object.values(radarCount).reduce((a, n) => a + n, 0) / radarGroups.length);

  return (
    <div className="progress-dashboard">
      <header className="dash-top">
        <div>
          <h1 className="dash-greeting">Olá, {name}</h1>
          <p className="dash-subtitle">Seu progresso está acima da média essa semana ✨</p>
        </div>
      </header>

      <div className="dash-grid-top">
        <motion.div whileHover={{ y: -3 }} className="card-premium dash-hero">
          <div className="dash-hero-glow" />
          <div className="dash-hero-main">
            <div className="dash-hero-title">
              <span style={{ fontSize: '1.8rem', marginRight: '10px' }}>✨</span>
              <div>
                <div className="dash-hero-h2">{weekCount} treinos essa semana</div>
                <div className="dash-hero-sub">
                  {weekDelta >= 0 ? `+${weekDelta}` : weekDelta} comparado à semana passada
                </div>
              </div>
            </div>

            <div className="dash-hero-stats">
              <div className="dash-pill">
                <TrendingUp size={14} style={{ color: 'var(--green)' }} />
                <span>Evolução</span>
                <strong>+{Math.max(0, evolutionPct)}%</strong>
              </div>
              <div className="dash-pill">
                <Clock size={14} style={{ color: 'rgba(255,255,255,0.75)' }} />
                <span>Tempo Total</span>
                <strong>{formatDuration(tempoTotalMin)}</strong>
              </div>
              <div className="dash-pill">
                <Flame size={14} style={{ color: 'var(--orange)' }} />
                <span>Sequência</span>
                <strong>{streak}d</strong>
              </div>
            </div>

            <button className="dash-cta-btn" type="button" onClick={() => setTab('workout')}>
              Iniciar treino
            </button>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="card-premium dash-side">
          <div className="dash-card-head">
            <h3>Seu progresso</h3>
            <span>Insights</span>
          </div>

          <div className="dash-insights">
            <div className="dash-insight">
              <Flame size={16} style={{ color: 'var(--orange)' }} />
              <span>Seu melhor treino foi {bestDaysAgo === null ? '—' : `há ${bestDaysAgo} dias`}</span>
            </div>
            <div className="dash-insight">
              <TrendingUp size={16} style={{ color: 'var(--green)' }} />
              <span>Se continuar assim, bate sua meta em <strong>5 dias</strong></span>
            </div>
            <div className="dash-insight">
              <AlertTriangle size={16} style={{ color: '#ffcc00' }} />
              <span>Você não treina pernas {legsDaysAgo === null ? 'há algum tempo' : `há ${legsDaysAgo} dias`}</span>
            </div>
          </div>

          <div className="dash-week-mini">
            {weekMini.map((d) => (
              <div key={d.key} className={`dash-week-day ${d.isToday ? 'today' : ''} ${d.active ? 'active' : ''}`}>
                <span>{d.label}</span>
                <div className="dash-week-dot" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div whileHover={{ y: -2 }} className="card-premium dash-line">
        <div className="dash-card-head" style={{ marginBottom: 10 }}>
          <h3>Seu progresso</h3>
          <span>Evolução dos últimos 10 treinos</span>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dashRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e8001d" stopOpacity={0.50} />
                  <stop offset="60%" stopColor="#ff7a18" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<DashTooltip />} cursor={{ stroke: 'rgba(232,0,29,0.22)', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="rgba(232,0,29,0.95)"
                strokeWidth={3}
                fill="url(#dashRed)"
                dot={{ r: 5, strokeWidth: 2, stroke: 'rgba(255,255,255,0.25)', fill: '#e8001d' }}
                activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2, fill: '#ff7a18' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="dash-grid-bottom">
        <motion.div whileHover={{ y: -2 }} className="card-premium dash-radar">
          <div className="dash-card-head" style={{ marginBottom: 12 }}>
            <h3>Equilíbrio muscular</h3>
            <span>Grupos musculares</span>
          </div>

          <div className="dash-radar-body">
            <div className="dash-radar-insights">
              <div className="dash-insight">
                <AlertTriangle size={16} style={{ color: '#ffcc00' }} />
                <span>{legsBelow ? 'Pernas estão abaixo da média' : 'Pernas estão em bom ritmo'}</span>
              </div>
              <div className="dash-insight">
                <Dumbbell size={16} style={{ color: 'var(--red-primary)' }} />
                <span><strong>{strongest}</strong> é seu grupo mais forte</span>
              </div>
            </div>

            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.10)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="A" stroke="rgba(232,0,29,0.95)" fill="rgba(232,0,29,0.22)" strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <div className="dash-right-stack">
          <motion.div whileHover={{ y: -2 }} className="card-premium dash-week-insights">
            <div className="dash-card-head" style={{ marginBottom: 12 }}>
              <h3>Insights da semana</h3>
              <span>Desempenho</span>
            </div>
            <div className="dash-insights">
              <div className="dash-insight">
                <Flame size={16} style={{ color: 'var(--orange)' }} />
                <span>Você treinou mais que <strong>72%</strong> dos usuários</span>
              </div>
              <div className="dash-insight">
                <TrendingUp size={16} style={{ color: 'var(--green)' }} />
                <span>Se continuar assim, bate sua meta em <strong>5 dias</strong></span>
              </div>
              <div className="dash-insight">
                <AlertTriangle size={16} style={{ color: '#ffcc00' }} />
                <span>Priorize pernas para equilibrar a semana</span>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="card-premium dash-level">
            <div className="dash-card-head" style={{ marginBottom: 12 }}>
              <h3>Seu nível: {levelLabel}</h3>
              <span>XP</span>
            </div>

            <div className="dash-xp-row">
              <span>XP:</span>
              <div className="dash-xp-bar">
                <div className="dash-xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
              <strong>{xpPct}%</strong>
            </div>

            <div className="dash-achievements">
              <div className="dash-achievement">
                <Flame size={16} style={{ color: 'var(--orange)' }} />
                <span>{streak} dias seguidos</span>
              </div>
              <div className="dash-achievement">
                <Award size={16} style={{ color: '#ffcc00' }} />
                <span>{Math.min(10, sessionsSorted.length)} treinos completos</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
