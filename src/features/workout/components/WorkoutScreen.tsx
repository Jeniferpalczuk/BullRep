'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell } from 'lucide-react';

import type { TrainingSession } from '@/types';
import { IconDumbbell, BullMascot } from '@/components/icons';
import { MUSCLE_ICONS, getCatalogEntryByName } from '@/components/utils';

type Tab = 'home' | 'progress' | 'workout' | 'profile';

export function WorkoutScreen({
  sessions,
  workoutStartTime,
  setWorkoutStartTime,
  setLastWorkoutDuration,
  setShowSummary,
  setTab,
}: {
  sessions: TrainingSession[];
  workoutStartTime: number | null;
  setWorkoutStartTime: (t: number | null) => void;
  setLastWorkoutDuration: (d: number | null) => void;
  setShowSummary: (s: boolean) => void;
  setTab: (t: Tab) => void;
}) {
  const [selected] = useState<TrainingSession | null>(null);
  const [started, setStarted] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerDuration] = useState(60);
  const [elapsed, setElapsed] = useState(0);

  const latest = sessions[sessions.length - 1] || null;
  const target = selected || latest;

  useEffect(() => {
    if (!workoutStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workoutStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setTimerActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStart = () => {
    setStarted(true);
    setWorkoutStartTime(Date.now());
    setActiveExerciseIndex(0);
    setCurrentSet(1);
  };

  const nextSet = () => {
    if (!target) return;
    const currentEx = target.exercises[activeExerciseIndex];

    if (currentSet < currentEx.setsDone) {
      setCurrentSet(prev => prev + 1);
      // Start rest timer between sets
      setTimeLeft(timerDuration);
      setTimerActive(true);
    } else {
      // Move to next exercise
      if (activeExerciseIndex < target.exercises.length - 1) {
        setActiveExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        setTimeLeft(timerDuration);
        setTimerActive(true);
      } else {
        handleFinish();
      }
    }
  };

  const handleFinish = () => {
    const finalDuration = Math.floor((Date.now() - (workoutStartTime || 0)) / 1000);
    setLastWorkoutDuration(finalDuration);
    setShowSummary(true);
    setStarted(false);
    setWorkoutStartTime(null);
    setTimerActive(false);
    setElapsed(0);
  };

  const formatElapsedTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (!target) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <BullMascot size={80} />
        <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>Nenhum treino planejado</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>Crie seu treino na tela inicial primeiro!</p>
        <button
          className="btn-primary"
          type="button"
          onClick={() => setTab('home')}
          style={{ marginTop: '22px', padding: '14px 18px', borderRadius: '16px' }}
        >
          Montar treino agora
        </button>
      </div>
    );
  }

  // GUIDED MODE
  if (started) {
    const currentEx = target.exercises[activeExerciseIndex];
    const entry = getCatalogEntryByName(currentEx.name);
    const muscleKey = entry?.category || Object.keys(MUSCLE_ICONS).find(k =>
      currentEx.name.toLowerCase().includes(k.toLowerCase()) ||
      (target.trainingType.toLowerCase().includes(k.toLowerCase()))
    ) || 'Peito';
    const gif = entry?.exercise.gif;

    return (
      <div className="guide-container">
        <div className="guide-header">
          <div className="guide-badge-live">
            <div className="dot-live" />
            <span>Ao Vivo - {formatElapsedTime(elapsed)}</span>
          </div>
        </div>

        <motion.div
          key={activeExerciseIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="guide-illustration-area"
        >
          <div className="guide-mascot-glow" />
          {gif ? (
            <img
              src={gif}
              alt={currentEx.name}
              style={{ width: '240px', height: '240px', objectFit: 'cover', borderRadius: '24px', filter: 'drop-shadow(0 0 20px rgba(232,0,29,0.25))' }}
            />
          ) : (MUSCLE_ICONS[muscleKey]?.startsWith('http') || MUSCLE_ICONS[muscleKey]?.startsWith('/')) ? (
            <img
              src={MUSCLE_ICONS[muscleKey]}
              alt="Músculo"
              style={{ width: '220px', height: '220px', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(232,0,29,0.2))' }}
            />
          ) : (
            <span style={{ fontSize: '6.2rem', filter: 'drop-shadow(0 0 20px rgba(232,0,29,0.2))' }}>
              {MUSCLE_ICONS[muscleKey] || '🏋️'}
            </span>
          )}
        </motion.div>

        <h1 className="guide-main-title">{currentEx.name}</h1>
        <p className="guide-subtitle">{activeExerciseIndex + 1} de {target.exercises.length} exercícios</p>
        {entry?.exercise.description && (
          <p style={{ maxWidth: '680px', textAlign: 'center', color: 'rgba(255,255,255,0.78)', fontSize: '0.9rem', lineHeight: 1.35, marginTop: '10px', padding: '0 18px' }}>
            {entry.exercise.description}
          </p>
        )}

        <div className="guide-stats-row">
          <div className="guide-stat-card">
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Carga</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--red-primary)' }}>{currentEx.weight}<span style={{ fontSize: '0.8rem' }}>kg</span></p>
          </div>
          <div className="guide-stat-card">
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Repetições</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>{currentEx.repsDone}</p>
          </div>
        </div>

        <div className="guide-set-grid">
          {Array.from({ length: currentEx.setsDone }).map((_, i) => (
            <div key={i} className={`guide-set-pill ${i + 1 < currentSet ? 'completed' : i + 1 === currentSet ? 'active' : ''}`}>
              {i + 1 < currentSet ? <CheckCircle2 size={24} /> : i + 1}
            </div>
          ))}
        </div>

        <div className="guide-controls">
          <button className="btn-finish-set" onClick={nextSet}>
            {currentSet < currentEx.setsDone ? 'Concluir Série' : activeExerciseIndex < target.exercises.length - 1 ? 'Próximo Exercício' : 'Finalizar Treino'}
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn-ghost"
              style={{ flex: 1, padding: '16px' }}
              onClick={() => setStarted(false)}
            >
              Visão Geral
            </button>
            <button
              className="btn-ghost"
              style={{ flex: 1, padding: '16px' }}
              onClick={() => setTimerActive(true)}
            >
              Pausar
            </button>
          </div>
        </div>

        {timerActive && (
          <div className="animate-fade-in" style={{
            position: 'fixed', bottom: '100px', left: '24px', right: '24px',
            background: 'rgba(20, 20, 20, 0.98)', border: '1px solid var(--border-highlight)',
            borderRadius: '24px', padding: '20px 24px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 12px 48px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)', zIndex: 1000,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="24" cy="24" r="22" fill="none" stroke="var(--red-primary)" strokeWidth="4"
                    strokeDasharray="138" strokeDashoffset={138 - (138 * timeLeft) / timerDuration}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  />
                </svg>
                <span style={{ position: 'absolute', fontSize: '1rem', fontWeight: 900 }}>{timeLeft}</span>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>Tempo de Descanso</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mantenha o batimento alto!</p>
              </div>
            </div>
            <button onClick={() => setTimerActive(false)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.8rem', borderRadius: '12px' }}>PULAR</button>
          </div>
        )}
      </div>
    );
  }

  // OVERVIEW MODE
  return (
    <div style={{ padding: '0 20px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '4px', height: '28px', background: 'var(--red-primary)', borderRadius: '2px' }} />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900 }}>Resumo da Sessão</h2>
      </div>

      <div className="card-premium" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--red-primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconDumbbell active />
          </div>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900 }}>{target.trainingType}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{target.exercises.length} exercícios planejados</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>ESTIMATIVA</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '4px' }}>45 min</p>
          </div>
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>INTENSIDADE</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '4px', color: '#ffcc00' }}>ALTA</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Lista de Exercícios</p>
        {target.exercises.map((ex) => (
          <div key={ex.id} className="exercise-item-main">
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <Dumbbell size={20} color="var(--red-primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800 }}>{ex.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.setsDone} séries × {ex.repsDone} reps</p>
            </div>
            <span className="badge-red">{ex.weight}kg</span>
          </div>
        ))}
      </div>

      <button className="btn-primary" style={{ width: '100%', padding: '20px' }} onClick={handleStart}>
        INICIAR TREINO AGORA ▶️
      </button>
    </div>
  );
}

// Main app
