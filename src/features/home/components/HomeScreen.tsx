'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Calendar, Trash2, Weight, Dumbbell, Zap } from 'lucide-react';

import type { TrainingSession, User } from '@/types';
import { getGreeting, getDayOfWeek, toDateKey, getWeekRange, isInRange, getCatalogEntryByName } from '@/components/utils';
import { ExerciseSelectorModal } from '@/components/modals';
import { CalendarSection } from '@/features/dashboard/components/CalendarSection';
import type { ExerciseDraft, ExerciseSelection } from '@/features/workout/types';
import {
  formatTrainingType,
  getTrainingMuscleGroups,
  normalizeMuscleGroupName,
  type TrainingMuscleGroup,
} from '@/lib/trainingMuscles';

type HomeTab = 'home' | 'progress' | 'workout' | 'profile';

const FEATURED_MUSCLE_GROUPS: TrainingMuscleGroup[] = ['Peito', 'Costas', 'Perna', 'Bíceps', 'Ombro'];

export function HomeScreen({
  sessions,
  onCreateSession,
  onDeleteSession,
  user,
  displayName,
  currentAvatarUrl,
  workoutStartTime,
  setTab
}: {
  sessions: TrainingSession[];
  onCreateSession: (type: string, obs: string, exercises: ExerciseDraft[]) => Promise<boolean>;
  onDeleteSession: (sessionId: string) => Promise<boolean>;
  user: User | null;
  displayName: string;
  currentAvatarUrl: string;
  workoutStartTime: number | null;
  setTab: (t: HomeTab) => void;
  loading?: boolean;
}) {
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<TrainingMuscleGroup[]>(['Peito']);
  const [exercises, setExercises] = useState<ExerciseDraft[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<TrainingSession | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [weeklyWarning, setWeeklyWarning] = useState<string | null>(null);
  const [savedChecks, setSavedChecks] = useState<Record<string, { doneDates: string[] }>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem('bullrep_saved_workout_checks');
      if (!raw) return {};
      const parsed = JSON.parse(raw) as Record<string, { doneDates: string[] }>;
      return parsed || {};
    } catch {
      return {};
    }
  });

  const firstName = (displayName || user?.name || 'Atleta').split(' ')?.[0] || 'Atleta';
  const greeting = getGreeting();
  const dayOfWeek = getDayOfWeek();

  const level = user?.level || 1;
  const xpTarget = 300;
  const xpValue = user?.xp || 0;
  const xpInLevel = ((xpValue % xpTarget) + xpTarget) % xpTarget;
  const xpPct = Math.min(100, Math.round((xpInLevel / xpTarget) * 100));

  const sessionsSorted = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const savedSessions = [...sessionsSorted].reverse();
  const visibleSavedSessions = showAllSaved ? savedSessions : savedSessions.slice(0, 4);
  const recordAllTime = sessionsSorted.reduce(
    (maxSession, session) =>
      Math.max(
        maxSession,
        session.exercises.reduce((maxExercise, ex) => Math.max(maxExercise, ex.weight), 0)
      ),
    0
  );

  const { startOfWeek, endOfWeek, startPrevWeek } = getWeekRange();
  const sessionsThisWeek = sessionsSorted.filter((s) => isInRange(s.date, startOfWeek, endOfWeek));
  const sessionsPrevWeek = sessionsSorted.filter((s) => isInRange(s.date, startPrevWeek, startOfWeek));
  const trainedMusclesThisWeek = new Map<TrainingMuscleGroup, TrainingSession>();
  sessionsThisWeek.forEach((savedSession) => {
    getTrainingMuscleGroups(
      savedSession.trainingType,
      savedSession.exercises.map((exercise) => exercise.name)
    ).forEach((group) => {
      if (!trainedMusclesThisWeek.has(group)) trainedMusclesThisWeek.set(group, savedSession);
    });
  });
  const newType = selectedMuscleGroups.length > 0
    ? formatTrainingType(selectedMuscleGroups)
    : 'ESCOLHA UM MÚSCULO';
  const daysDoneThisWeek = new Set(sessionsThisWeek.map((s) => toDateKey(s.date)));
  const weekGoal = 5;
  const weekDone = Math.min(weekGoal, daysDoneThisWeek.size);
  const weekPct = Math.min(100, Math.round((weekDone / weekGoal) * 100));

  const workoutsDeltaPct = (() => {
    const a = sessionsThisWeek.length;
    const b = sessionsPrevWeek.length;
    if (b === 0) return a > 0 ? 100 : 0;
    return Math.round(((a - b) / b) * 100);
  })();

  const recentXpGain = (() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sessions7d = sessionsSorted.filter((s) => new Date(s.date).getTime() >= sevenDaysAgo.getTime());
    return sessions7d.length * 20;
  })();

  const timeEstimateMin = Math.max(20, exercises.length * 15);

  const buildWeeklyWarning = (group: TrainingMuscleGroup) => {
    const savedSession = trainedMusclesThisWeek.get(group);
    if (!savedSession) return null;
    const trainedDate = new Date(`${toDateKey(savedSession.date)}T12:00:00`).toLocaleDateString(
      'pt-BR',
      { weekday: 'long', day: '2-digit', month: '2-digit' }
    );
    return `${formatTrainingType([group])} já foi treinado nesta semana (${trainedDate}). Escolha outro músculo.`;
  };
  const displayedWeeklyWarning =
    weeklyWarning ||
    selectedMuscleGroups.map(buildWeeklyWarning).find((warning) => Boolean(warning)) ||
    null;

  const selectMuscleGroup = (group: TrainingMuscleGroup) => {
    const warning = buildWeeklyWarning(group);
    if (warning) {
      setWeeklyWarning(warning);
      return;
    }
    setWeeklyWarning(null);
    setSelectedMuscleGroups([group]);
  };

  const buildDraftExercise = (selection: ExerciseSelection): ExerciseDraft => ({
      id: crypto.randomUUID(),
      name: selection.name,
      muscleGroup: selection.muscleGroup,
      sets: [
        { id: crypto.randomUUID(), reps: 10, weight: 0 },
        { id: crypto.randomUUID(), reps: 10, weight: 0 },
        { id: crypto.randomUUID(), reps: 10, weight: 0 }
      ],
    });

  const getDraftMuscleGroups = (drafts: ExerciseDraft[]): TrainingMuscleGroup[] => {
    const groups = drafts.flatMap((exercise) => {
      const explicitGroup = normalizeMuscleGroupName(exercise.muscleGroup || '');
      return explicitGroup
        ? [explicitGroup]
        : getTrainingMuscleGroups(null, [exercise.name]);
    });
    return groups.filter((group, index) => groups.indexOf(group) === index);
  };

  const addExercises = (selectedExercises: ExerciseSelection[]) => {
    const nextExercises = [...exercises, ...selectedExercises.map(buildDraftExercise)];
    setExercises(nextExercises);
    setSelectedMuscleGroups(getDraftMuscleGroups(nextExercises));
    setWeeklyWarning(null);
  };

  const removeExercise = (exerciseId: string) => {
    const nextExercises = exercises.filter((exercise) => exercise.id !== exerciseId);
    setExercises(nextExercises);
    const inferredGroups = getDraftMuscleGroups(nextExercises);
    if (inferredGroups.length > 0) setSelectedMuscleGroups(inferredGroups);
  };

  const normalizeText = (v: string) => v.trim().toLowerCase();
  const buildExerciseSignature = (drafts: ExerciseDraft[]) =>
    drafts
      .map((ex) => {
        const sets = ex.sets.map((s) => `${s.reps}x${s.weight}`).join('|');
        return `${normalizeText(ex.name)}:${sets}`;
      })
      .sort()
      .join('||');

  const todayKey = toDateKey(new Date().toISOString());

  const updateSet = (exId: string, setId: string, field: 'reps' | 'weight', val: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      return { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: val } : s) };
    }));
  };

  const addSet = (exId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const last = ex.sets[ex.sets.length - 1];
      return { ...ex, sets: [...ex.sets, { id: crypto.randomUUID(), reps: last?.reps || 10, weight: last?.weight || 0 }] };
    }));
  };

  const removeSet = (exId: string, setId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
    }));
  };

  const getHistoryForExercise = (name: string) => {
    const pastSession = sessions.find(s => s.exercises.some(e => e.name === name));
    if (!pastSession) return null;
    const pastEx = pastSession.exercises.find(e => e.name === name);
    if (pastEx) return `${pastEx.repsDone} reps - ${pastEx.weight}kg`;
    return null;
  };

  const handleCreate = async () => {
    const repeatedGroup = selectedMuscleGroups.find((group) => trainedMusclesThisWeek.has(group));
    if (repeatedGroup) {
      setWeeklyWarning(buildWeeklyWarning(repeatedGroup));
      return;
    }
    if (selectedMuscleGroups.length === 0) {
      setWeeklyWarning('Escolha pelo menos um músculo para montar o treino.');
      return;
    }

    setCreating(true);
    if (editingSessionId) {
      const original = sessions.find((s) => s.id === editingSessionId);
      const originalDrafts: ExerciseDraft[] = (original?.exercises || []).map((dbEx) => ({
        id: crypto.randomUUID(),
        name: dbEx.name,
        sets: Array.from({ length: dbEx.setsDone }).map(() => ({
          id: crypto.randomUUID(),
          reps: dbEx.repsDone,
          weight: dbEx.weight,
        })),
      }));
      const hasChanged = buildExerciseSignature(originalDrafts) !== buildExerciseSignature(exercises) || normalizeText(original?.trainingType || '') !== normalizeText(newType);
      if (hasChanged) {
        const ok = window.confirm('Você está duplicando este treino. O treino original será mantido e uma nova versão será salva. Deseja continuar?');
        if (!ok) {
          setCreating(false);
          return;
        }
      }
      const saved = await onCreateSession(newType, '', exercises);
      if (!saved) {
        setCreating(false);
        return;
      }
      setEditingSessionId(null);
    } else {
      const saved = await onCreateSession(newType, '', exercises);
      if (!saved) {
        setCreating(false);
        return;
      }
    }
    setExercises([]);
    setCreating(false);
  };

  const handleStartWorkout = async () => {
    if (workoutStartTime) {
      setTab('workout');
      return;
    }
    if (exercises.length === 0) {
      setSelectorOpen(true);
      return;
    }
    await handleCreate();
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setExercises([]);
    setSelectedMuscleGroups(['Peito']);
    setWeeklyWarning(null);
  };

  const loadSessionTemplate = (savedSession: TrainingSession) => {
    setEditingSessionId(savedSession.id);
    const templateMuscles = getTrainingMuscleGroups(
      savedSession.trainingType,
      savedSession.exercises.map((exercise) => exercise.name)
    );
    setSelectedMuscleGroups(templateMuscles);
    const repeatedGroup = templateMuscles.find((group) => trainedMusclesThisWeek.has(group));
    setWeeklyWarning(repeatedGroup ? buildWeeklyWarning(repeatedGroup) : null);
    const exDrafts: ExerciseDraft[] = savedSession.exercises.map((dbEx) => ({
      id: crypto.randomUUID(),
      name: dbEx.name,
      sets: Array.from({ length: Math.max(1, dbEx.setsDone) }).map(() => ({
        id: crypto.randomUUID(),
        reps: dbEx.repsDone,
        weight: dbEx.weight,
      })),
    }));
    setExercises(exDrafts);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const persistChecks = (next: Record<string, { doneDates: string[] }>) => {
    setSavedChecks(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('bullrep_saved_workout_checks', JSON.stringify(next));
    }
  };

  const toggleSavedDoneToday = (sessionId: string) => {
    const prev = savedChecks[sessionId]?.doneDates || [];
    const exists = prev.includes(todayKey);
    const nextDates = exists ? prev.filter((d) => d !== todayKey) : [...prev, todayKey];
    persistChecks({
      ...savedChecks,
      [sessionId]: { doneDates: nextDates },
    });
  };

  const confirmDeleteSession = async () => {
    if (!deleteCandidate || deletingSessionId) return;

    setDeletingSessionId(deleteCandidate.id);
    const deleted = await onDeleteSession(deleteCandidate.id);
    setDeletingSessionId(null);

    if (!deleted) return;

    const nextChecks = { ...savedChecks };
    delete nextChecks[deleteCandidate.id];
    persistChecks(nextChecks);
    if (editingSessionId === deleteCandidate.id) cancelEdit();
    setDeleteCandidate(null);
  };

  useEffect(() => {
    if (!deleteCandidate) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deletingSessionId) setDeleteCandidate(null);
    };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [deleteCandidate, deletingSessionId]);

  return (
    <div className="home-screen">
      {/* HEADER SECTION */}
      <div className="home-shell">

        <div className="home-topbar">
          <div className="home-meta-row">
            <p className="home-meta-kicker">
              {dayOfWeek.toUpperCase()}
            </p>
            <span className="home-level-chip">
              NÍVEL {level}
            </span>
          </div>
          <div className="home-avatar">
            <img src={user?.avatarUrl || currentAvatarUrl} alt="Avatar" />
          </div>
        </div>

        <h1 className="home-greeting">
          {greeting},{' '}
          <span style={{ color: 'var(--red-primary)' }}>{firstName} </span>
        </h1>

        <div className="home-xp-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '220px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap' }}>Nível {level} <ChevronDown size={14} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /></p>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{xpInLevel} / {xpTarget} XP</p>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', flex: 1, maxWidth: '200px', display: 'flex' }}>
              <div style={{ height: '100%', background: 'var(--accent-gradient)', width: `${xpPct}%`, borderRadius: '10px', boxShadow: '0 0 14px rgba(232,0,29,0.35)' }} />
            </div>
          </div>
          <div style={{ background: 'linear-gradient(90deg, rgba(255,80,0,0.15) 0%, rgba(200,0,0,0) 100%)', border: '1px solid rgba(255,80,0,0.2)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem' }}>🔥</span>
            <span style={{ color: '#ffb74d', fontSize: '0.75rem', fontWeight: 800 }}>{user?.streak?.currentStreak || 0} dias seguidos</span>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="home-quick-stats">
          <div className="glass-card-premium home-stat-card">
            <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--red-primary)' }}>{sessionsThisWeek.length}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', marginTop: '4px' }}>TREINOS DA SEMANA</p>
            <p style={{ fontSize: '0.65rem', marginTop: '8px', fontWeight: 800, color: workoutsDeltaPct >= 0 ? 'var(--green)' : 'var(--red-primary)' }}>
              {workoutsDeltaPct >= 0 ? '+' : ''}{workoutsDeltaPct}% vs passada
            </p>
          </div>
          <div className="glass-card-premium home-stat-card">
            <Zap size={18} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--red-primary)' }}>{xpValue}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', marginTop: '4px' }}>XP TOTAL</p>
            <p style={{ fontSize: '0.65rem', marginTop: '8px', fontWeight: 800, color: 'var(--orange)' }}>+{recentXpGain} XP (7d)</p>
          </div>
          <div className="glass-card-premium home-stat-card">
            <Weight size={18} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--red-primary)' }}>{recordAllTime}kg</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px', marginTop: '4px' }}>RECORDE</p>
          </div>
        </div>

        <div className="home-main-stack">

        {/* CTA: TREINO DO DIA */}
        <div className="home-cta home-section-card">
          <div className="home-cta-head" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ minWidth: 0, flex: '1 1 260px', textAlign: 'center' }}>
              <p className="home-cta-kicker" style={{ fontSize: '0.9rem', letterSpacing: '0.14em' }}>Treino do dia</p>
              <p className="home-cta-title" style={{ fontSize: '2.2rem', lineHeight: 1.05, marginTop: '8px', fontWeight: 950 }}>
                Hoje: <span className="home-cta-accent">{newType}</span>
              </p>
              <p className="home-cta-sub" style={{ fontSize: '1rem', marginTop: '10px', color: 'rgba(255,255,255,0.9)' }}>
                {exercises.length} exercícios - {timeEstimateMin} min
              </p>
            </div>
          </div>
        </div>

        {/* TREINOS DO DIA SECTION (Montar treino) */}
        <div className="card-premium home-section-card">

          <div className="home-section-head">
            <div className="home-section-title">
               <Dumbbell size={18} color="var(--red-primary)" />
               <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Montar treino</h2>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
               {FEATURED_MUSCLE_GROUPS.map((m, idx) => {
                 const isSelected = selectedMuscleGroups.includes(m);
                 const isBlocked = trainedMusclesThisWeek.has(m);
                 return (
                 <button
                   key={m}
                   type="button"
                   aria-disabled={isBlocked}
                   aria-label={isBlocked ? `${m} já treinado nesta semana` : `Selecionar ${m}`}
                   onClick={() => selectMuscleGroup(m)}
                   style={{
                     padding: '8px 16px', fontSize: '0.8rem', fontWeight: 800, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
                     background: isBlocked ? 'rgba(255,255,255,0.025)' : isSelected ? 'var(--red-primary)' : 'rgba(255,255,255,0.03)',
                     color: isBlocked ? 'rgba(255,255,255,0.35)' : isSelected ? '#fff' : 'var(--text-muted)',
                     whiteSpace: 'nowrap', cursor: 'pointer', transition: '0.2s',
                     display: 'flex', alignItems: 'center', gap: '6px',
                     textDecoration: isBlocked ? 'line-through' : 'none'
                   }}
                 >
                   <Dumbbell size={14} style={{ color: isSelected && !isBlocked ? '#fff' : ['#ffcc00', '#00e676', '#aa00ff'][idx % 3] }} />
                   {m}
                 </button>
                 );
               })}
            </div>
            {displayedWeeklyWarning && (
              <div className="weekly-muscle-warning" role="alert">
                <span aria-hidden="true">!</span>
                <p>{displayedWeeklyWarning}</p>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '12px' }}>EXERCÍCIOS ({exercises.length})</p>
            {exercises.length === 0 ? (
               <button type="button" onClick={() => setSelectorOpen(true)} style={{ width: '100%', padding: '32px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '2px dashed var(--border)', borderRadius: '20px', cursor: 'pointer', color: 'inherit' }}>
                 <Dumbbell size={24} style={{ color: 'var(--red-primary)', marginBottom: '8px', opacity: 0.5 }} />
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Clique para adicionar exercícios</p>
               </button>
            ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {exercises.map((ex) => {
                   const hist = getHistoryForExercise(ex.name);
                   const entry = getCatalogEntryByName(ex.name);
                   return (
                     <div key={ex.id} style={{ background: '#0a0a0a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>

                       {/* Header */}
                       <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                           <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{ex.name}</h3>
                           {(entry?.exercise?.equipment || entry?.exercise?.difficulty) && (
                             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                               {entry?.exercise?.equipment ? <>Equip: {entry.exercise.equipment}</> : null}
                               {entry?.exercise?.difficulty ? <> - Nível: {entry.exercise.difficulty}</> : null}
                             </p>
                           )}
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                           <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} &rsaquo;</span>
                           <button type="button" aria-label={`Remover exercício ${ex.name}`} onClick={() => removeExercise(ex.id)} className="exercise-remove-button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </div>

                       {/* Sets */}
                       <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                         {ex.sets.map((set, idx) => (
                           <div key={set.id} className="workout-set-row">
                             <div className="workout-set-label">
                               <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red-primary)' }} />
                               <span>Série {idx + 1}</span>
                             </div>

                             <label className="workout-set-field workout-set-field-reps">
                               <input
                                 type="number"
                                 inputMode="numeric"
                                 value={set.reps || ''}
                                 onChange={(e) => updateSet(ex.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                               />
                               <span>reps</span>
                             </label>

                             <div className="workout-set-weight">
                               <button type="button" aria-label={`Diminuir carga da série ${idx + 1}`} onClick={() => updateSet(ex.id, set.id, 'weight', Math.max(0, set.weight - 1))}>-</button>
                               <label className="workout-set-field">
                                 <input
                                   type="number"
                                   inputMode="decimal"
                                   min={0}
                                   step={0.5}
                                   value={set.weight || ''}
                                   onChange={(e) => updateSet(ex.id, set.id, 'weight', Number(e.target.value || 0))}
                                 />
                                 <span>kg</span>
                               </label>
                               <button type="button" aria-label={`Aumentar carga da série ${idx + 1}`} onClick={() => updateSet(ex.id, set.id, 'weight', set.weight + 1)}>+</button>
                             </div>

                             <span className="workout-set-history">{hist || 'Sem histórico'}</span>

                             <button className="workout-set-remove" type="button" aria-label={`Remover série ${idx + 1}`} onClick={() => removeSet(ex.id, set.id)}>
                               <Trash2 size={14} />
                             </button>
                           </div>
                         ))}

                         <button type="button" onClick={() => addSet(ex.id)} className="add-set-button" style={{ alignSelf: 'center', marginTop: '4px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', opacity: 0.6 }}>
                           + Adicionar série
                         </button>
                       </div>

                     </div>
                   )
                 })}

                 <button
                   onClick={() => setSelectorOpen(true)}
                   className="btn-ghost"
                   style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, border: '1px dashed rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                 >
                   + Adicionar exercício
                 </button>
               </div>
            )}
          </div>

          {editingSessionId && (
            <button
              className="btn-ghost"
              style={{ width: '100%', marginTop: '8px', color: 'var(--text-muted)' }}
              onClick={cancelEdit}
              type="button"
            >
              CANCELAR EDIÇÃO
            </button>
          )}

          <button
            className="btn-primary"
            style={{ width: '100%', opacity: exercises.length === 0 ? 0.5 : 1, marginTop: '12px' }}
            disabled={exercises.length === 0 || creating}
            onClick={handleStartWorkout}
          >
            {creating ? 'SALVANDO...' : editingSessionId ? 'SALVAR NOVA VERSÃO' : 'SALVAR TREINO'}
          </button>
        </div>

        {/* SUA SEMANA */}
        <div className="card-premium home-section-card">
          <div className="home-section-head">
            <div className="home-section-title">
               <Calendar size={18} color="var(--red-primary)" />
               <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Sua Semana</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>{weekDone}/{weekGoal}</span>
            </div>
          </div>
          <div className="progress-pill" style={{ marginBottom: '14px' }}>
            <div className="progress-pill-fill" style={{ width: `${weekPct}%`, background: 'var(--accent-gradient)' }} />
          </div>

          <CalendarSection sessions={sessionsSorted} />
        </div>

        {/* TREINOS SALVOS */}
        <div className="home-section-head" style={{ marginTop: '4px', marginBottom: '2px' }}>
          <div className="home-section-title" style={{ gap: '8px' }}>
            <div style={{ width: '3px', height: '14px', background: 'var(--red-primary)', borderRadius: '4px' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Treinos Salvos</h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {savedSessions.length} salvos
          </span>
        </div>

        {visibleSavedSessions.map(s => {
          const doneDates = savedChecks[s.id]?.doneDates || [];
          const trainedCount = doneDates.length;
          const doneToday = doneDates.includes(todayKey);
          return (
          <div key={s.id} className="card-premium home-section-card saved-workout-card">
            <div className="saved-workout-head">
              <div className="saved-workout-summary">
                <div className="saved-workout-icon" aria-hidden="true">
                  {s.trainingType.trim().charAt(0).toUpperCase() || 'T'}
                </div>
                <div className="saved-workout-details">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{s.trainingType}</h3>
                  <p className="saved-workout-meta">
                    {new Date(`${toDateKey(s.date)}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} - {s.exercises.length} exercícios - {s.exercises.reduce((acc, e) => acc + (e.weight * e.setsDone), 0)}kg
                  </p>
                  <p style={{ fontSize: '0.74rem', color: 'var(--green)', marginTop: '6px', fontWeight: 800 }}>
                    Treinado: {trainedCount}x
                  </p>
                </div>
              </div>

              <div className="saved-workout-actions">
                <button
                  className="btn-primary saved-workout-primary"
                  type="button"
                  onClick={() => loadSessionTemplate(s)}
                >
                  Usar como modelo
                </button>
                <button
                  className={`btn-ghost saved-workout-check${doneToday ? ' is-done' : ''}`}
                  type="button"
                  onClick={() => toggleSavedDoneToday(s.id)}
                >
                  <span>
                    {doneToday ? 'Feito hoje ✓' : 'Marcar como feito'}
                  </span>
                </button>
                <button
                  className="saved-workout-delete"
                  type="button"
                  aria-label={`Excluir treino ${s.trainingType}`}
                  onClick={() => setDeleteCandidate(s)}
                >
                  <Trash2 size={18} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>

            <div className="saved-workout-exercises">
              {s.exercises.slice(0, 3).map(ex => (
                <div key={ex.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Dumbbell size={12} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>{ex.name}</span>
                </div>
              ))}
              {s.exercises.length > 3 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>+{s.exercises.length - 3} exercícios</span>
                </div>
              )}
              {s.exercises.length === 0 && (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>Treino limpo</span>
                </div>
              )}
            </div>
          </div>
        )})}      </div>
        {savedSessions.length > 4 && (
          <button
            className="btn-ghost saved-workout-toggle"
            type="button"
            onClick={() => setShowAllSaved((current) => !current)}
          >
            {showAllSaved ? 'Mostrar menos' : `Ver todos os ${savedSessions.length} treinos`}
          </button>
        )}
      </div>

      <AnimatePresence>
        {selectorOpen && (
          <ExerciseSelectorModal
            defaultCategories={selectedMuscleGroups}
            blockedCategories={[...trainedMusclesThisWeek.keys()]}
            onSelect={(selectedExercises) => { addExercises(selectedExercises); }}
            onCancel={() => setSelectorOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteCandidate && (
          <motion.div
            className="delete-workout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!deletingSessionId) setDeleteCandidate(null);
            }}
          >
            <motion.div
              className="delete-workout-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-workout-title"
              aria-describedby="delete-workout-description"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="delete-workout-icon" aria-hidden="true">
                <Trash2 size={24} />
              </div>
              <div>
                <h2 id="delete-workout-title">Excluir treino salvo?</h2>
                <p id="delete-workout-description">
                  O treino <strong>{deleteCandidate.trainingType}</strong> e seu histórico serão removidos definitivamente.
                </p>
              </div>
              <div className="delete-workout-actions">
                <button
                  className="btn-ghost"
                  type="button"
                  disabled={Boolean(deletingSessionId)}
                  onClick={() => setDeleteCandidate(null)}
                >
                  Cancelar
                </button>
                <button
                  className="delete-workout-confirm"
                  type="button"
                  disabled={Boolean(deletingSessionId)}
                  onClick={confirmDeleteSession}
                >
                  {deletingSessionId ? 'Excluindo...' : 'Excluir treino'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Screen: Progress
