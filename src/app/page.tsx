'use client';
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Calendar, Trash2, Weight, Play, CheckCircle2,
  Award, TrendingUp, Dumbbell,
  Flame, Clock, Zap, Star, XCircle, AlertTriangle, Dices
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import {
  FITNESS_LEVEL_OPTIONS,
  FREQUENCY_OPTIONS,
  GOAL_OPTIONS,
  type BullrepFitnessLevel,
  type BullrepFrequency,
  type BullrepGoal,
} from '@/features/profile/options';
import { fetchSessions, createSession as createSessionService, updateSession as updateSessionService } from '@/services/api';
import type { TrainingSession, User } from '@/types';
import { IconHome, IconTrend, IconDumbbell, IconUser, BullMascot } from '@/components/icons';
import { getGreeting, getDayOfWeek, toDateKey, getWeekRange, isInRange, EXERCISE_CATALOG, MUSCLE_ICONS, getCatalogEntryByName } from '@/components/utils';
import { ExerciseSelectorModal, WorkoutSummaryModal } from '@/components/modals';
import { WorkoutExperience } from '@/components/workout/WorkoutExperience';
import { useAuth } from '@/hooks/useAuth';
import { Toast, type ToastState } from '@/components/Toast';
import { apiRequest } from '@/lib/apiClient';
import { CalendarSection } from '@/features/dashboard/components/CalendarSection';
import { DashTooltip } from '@/features/dashboard/components/DashTooltip';
import { ProgressScreen } from '@/features/progress/components/ProgressScreen';
import type { ExerciseDraft } from '@/features/workout/types';
import { HomeScreen } from '@/features/home/components/HomeScreen';
import { WorkoutScreen } from '@/features/workout/components/WorkoutScreen';

const AVATAR_STYLES = [
  { id: 'adventurer', label: 'Cartoon' },
  { id: 'notionists', label: 'Realista' },
  { id: 'pixel-art', label: 'Pixel' },
  { id: 'bottts', label: 'Rob' },
] as const;

const AVATAR_SKIN_COLORS = ['f2d3b1', 'd4a373', 'a67c52', '6b4c3a', '3d261e'];

function buildAvatarUrl(style: string, seed: string, skinColor: string) {
  let url = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;

  if (style === 'adventurer') {
    url += `&skinColor=${skinColor}`;
  } else if (style === 'pixel-art') {
    url += `&skinColor=${skinColor}`;
  }

  return url;
}

function parseAvatarUrl(avatarUrl: string | null | undefined) {
  if (!avatarUrl) return null;

  try {
    const url = new URL(avatarUrl);
    if (!url.hostname.includes('dicebear.com')) return null;

    const pathParts = url.pathname.split('/').filter(Boolean);
    const style = pathParts[1];
    if (!style || !AVATAR_STYLES.some((item) => item.id === style)) return null;

    const seed = url.searchParams.get('seed') || 'BULLREP';
    const skinColor = url.searchParams.get('skinColor') || 'f2d3b1';
    return {
      style: style as 'adventurer' | 'notionists' | 'pixel-art' | 'bottts',
      seed,
      skinColor,
    };
  } catch {
    return null;
  }
}






// Screen: Home
type Tab = 'home' | 'progress' | 'workout' | 'profile' | 'admin';

// Workout (NEW SPA UI) - no rotas, tudo em estado local.
function WorkoutTab({ setTab }: { setTab: (t: Tab) => void }) {
  type WorkoutView = 'grupos' | 'exercicios' | 'detalhe';
  type MuscleKey = 'Peito' | 'Costas' | 'Ombro' | 'Bceps' | 'Trceps' | 'Perna';
  type ExerciseLite = { name: string; steps: string[] };

  const [view, setView] = useState<WorkoutView>('grupos');
  const [muscle, setMuscle] = useState<MuscleKey>('Ombro');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseLite | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  const groups: Array<{ key: MuscleKey; label: string }> = [
    { key: 'Peito', label: 'Peito' },
    { key: 'Costas', label: 'Costas' },
    { key: 'Ombro', label: 'Ombro' },
    { key: 'Bceps', label: 'Bceps' },
    { key: 'Trceps', label: 'Trceps' },
    { key: 'Perna', label: 'Perna' },
  ];

  const exerciseListByMuscle: Record<MuscleKey, string[]> = {
    Peito: (EXERCISE_CATALOG['Peito'] || []).slice(0, 8).map((e) => e.name),
    Costas: (EXERCISE_CATALOG['Costas'] || []).slice(0, 8).map((e) => e.name),
    Ombro: ['Desenvolvimento com barra', 'Elevao frontal', 'Remada vertical'],
    Bceps: (EXERCISE_CATALOG['Bceps'] || []).slice(0, 8).map((e) => e.name),
    Trceps: (EXERCISE_CATALOG['Trceps'] || []).slice(0, 8).map((e) => e.name),
    Perna: (EXERCISE_CATALOG['Perna'] || []).slice(0, 8).map((e) => e.name),
  };

  const stepsByExercise: Record<string, string[]> = {
    'Desenvolvimento com barra': [
      'Segure na largura dos ombros',
      'Empurre o peso para cima',
      'Estenda os cotovelos',
      'Retorne com controle',
    ],
    'Elevao frontal': [
      'Pegue os halteres com firmeza',
      'Eleve  frente at a altura dos ombros',
      'Evite balano do tronco',
      'Retorne com controle',
    ],
    'Remada vertical': [
      'Segure a barra/corda na frente do corpo',
      'Puxe subindo cotovelos',
      'Pare no ponto de conforto',
      'Desa controlando',
    ],
  };

  const getSteps = (exerciseName: string) => {
    const steps = stepsByExercise[exerciseName];
    if (steps?.length) return steps;

    const fromCatalog = getCatalogEntryByName(exerciseName);
    if (fromCatalog?.exercise.description) {
      return [
        'Ajuste postura e pegada',
        'Execute o movimento controlado',
        'Mantenha a tcnica durante todo o range',
        'Finalize e retorne com controle',
      ];
    }

    return [
      'Ajuste postura e pegada',
      'Execute o movimento controlado',
      'Mantenha a tcnica durante todo o range',
      'Finalize e retorne com controle',
    ];
  };

  const openMuscle = (m: MuscleKey) => {
    setMuscle(m);
    setSelectedExercise(null);
    setView('exercicios');
  };

  const openDetail = (name: string) => {
    setSelectedExercise({ name, steps: getSteps(name) });
    setView('detalhe');
  };

  const markDone = () => {
    if (!selectedExercise) return;
    setDone((d0) => ({ ...d0, [selectedExercise.name]: true }));
  };

  const back = () => {
    if (view === 'detalhe') {
      setView('exercicios');
      return;
    }
    if (view === 'exercicios') {
      setView('grupos');
      return;
    }
    setTab('home');
  };

  const headerTitle = view === 'grupos' ? 'Treino de Hoje' : view === 'exercicios' ? muscle : selectedExercise?.name ?? 'Exerccio';
  const headerSubtitle =
    view === 'grupos'
      ? 'Escolha um grupo muscular'
      : view === 'exercicios'
        ? 'Selecione um exerccio'
        : 'Execuo e checklist';

  const selectedMediaUrl = selectedExercise ? getCatalogEntryByName(selectedExercise.name)?.exercise.gif : null;

  return (
    <div style={{ padding: '0 20px 18px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '4px', height: '28px', background: 'var(--red-primary)', borderRadius: '2px', marginTop: '6px' }} />
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 950, lineHeight: 1.05 }}>{headerTitle}</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 750, marginTop: '8px' }}>{headerSubtitle}</p>
          </div>
        </div>

        <button className="btn-ghost" type="button" onClick={back} style={{ padding: '12px 14px', borderRadius: '16px' }}>
          Voltar
        </button>
      </div>

      {view === 'grupos' && (
        <div className="card-premium" style={{ padding: '18px', background: 'rgba(17,17,17,0.86)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
            {groups.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => openMuscle(g.key)}
                className="glass-panel"
                style={{
                  borderRadius: '22px',
                  padding: '16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  borderColor: 'rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '84px',
                    borderRadius: '18px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'radial-gradient(300px 90px at 20% 10%, rgba(232, 0, 29, 0.22), rgba(255, 255, 255, 0.02))',
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {/* cones removidos */}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 950, fontSize: '1rem' }}>{g.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 900 }}></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'exercicios' && (
        <div className="card-premium" style={{ padding: '16px', background: 'rgba(17,17,17,0.86)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(exerciseListByMuscle[muscle] || []).map((name) => (
              <div key={name} className="glass-panel" style={{ padding: '14px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <p style={{ fontWeight: 950, color: '#fff' }}>{name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.62)', fontWeight: 700, fontSize: '0.82rem', marginTop: '6px' }}>
                    {done[name] ? '? Concludo hoje' : 'Treino mini'}
                  </p>
                </div>
                <button className="btn-primary" type="button" onClick={() => openDetail(name)} style={{ padding: '10px 14px', borderRadius: '16px', fontSize: '0.86rem' }}>
                  Ver execuo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'detalhe' && selectedExercise && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            className="card-premium"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(232,0,29,0.18) 0%, rgba(255,80,0,0.10) 30%, rgba(255,255,255,0.02) 100%)',
              borderColor: 'rgba(232,0,29,0.14)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ fontWeight: 1000, fontSize: '1.15rem' }}>{selectedExercise.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.86rem', marginTop: '6px' }}>
                  {selectedMediaUrl ? 'Imagem de execuo' : 'Área de vdeo (mock)'}
                </p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '18px', background: 'rgba(232,0,29,0.85)', display: 'grid', placeItems: 'center', boxShadow: '0 0 26px rgba(232,0,29,0.20)' }}>
                <Play size={18} color="#fff" />
              </div>
            </div>

            <div
              style={{
                marginTop: '14px',
                borderRadius: '22px',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(0,0,0,0.35)',
                aspectRatio: '16 / 9',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {selectedMediaUrl ? (
                <img
                  src={selectedMediaUrl}
                  alt={selectedExercise.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background:
                      'radial-gradient(1200px 500px at 20% 0%, rgba(232,0,29,0.25), transparent 60%), radial-gradient(800px 380px at 90% 20%, rgba(255,80,0,0.16), transparent 55%), rgba(0,0,0,0.20)',
                  }}
                />
              )}
            </div>
          </div>

          <div className="card-premium" style={{ padding: '16px', background: 'rgba(17,17,17,0.86)' }}>
            <p style={{ fontWeight: 950, color: '#fff' }}>Passo a passo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {selectedExercise.steps.map((s, idx) => (
                <div key={s} className="glass-panel" style={{ padding: '12px 12px', borderRadius: '18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '999px', background: 'var(--accent-gradient)', boxShadow: '0 0 18px rgba(232,0,29,0.20)', marginTop: '2px' }} />
                  <div style={{ fontWeight: 850, color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 900, marginRight: '8px' }}>{idx + 1}.</span>
                    {s}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary" type="button" onClick={markDone} style={{ width: '100%', padding: '18px 18px', borderRadius: '18px' }}>
            {done[selectedExercise.name] ? 'Feito ?' : 'Marcar como feito'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const router = useRouter();
  const { loading: authLoading, session, profile, signOut, updateProfile } = useAuth();
  const isAdmin = profile?.is_admin === true;

  const [tab, setTab] = useState<Tab>('home');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [pName, setPName] = useState('');
  const [pWeight, setPWeight] = useState<number>(70);
  const [pHeight, setPHeight] = useState<number>(165);
  const [pGoal, setPGoal] = useState<BullrepGoal>('Ganhar massa');
  const [pFitness, setPFitness] = useState<BullrepFitnessLevel>('Iniciante');
  const [pFrequency, setPFrequency] = useState<BullrepFrequency>('3x');
  const [avatarStyle, setAvatarStyle] = useState<'adventurer' | 'notionists' | 'pixel-art' | 'bottts'>('adventurer');
  const [avatarSeed, setAvatarSeed] = useState('BULLREP');
  const [avatarSkinColor, setAvatarSkinColor] = useState('f2d3b1');

  // Workout Timer States
  const [workoutStartTime] = useState<number | null>(null);
  const [lastWorkoutDuration, setLastWorkoutDuration] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const sessionName = (session?.user?.user_metadata as { name?: string } | undefined)?.name;
  const displayName = (profile?.name || sessionName || session?.user?.email?.split('@')?.[0] || 'Atleta').trim();

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await fetchSessions();
    if (!error) setSessions(data);
    else setSessions([]);
    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;

    queueMicrotask(() => {
      void fetchData();
    });
  }, [session]);

  useEffect(() => {
    if (authLoading) return;
    if (!session) router.replace('/login');
  }, [authLoading, session, router]);

  useEffect(() => {
    if (!profile) return;

    queueMicrotask(() => {
      setPName(profile.name || '');
      setPWeight(profile.weight ?? 70);
      setPHeight(profile.height ?? 165);
      setPGoal(profile.goal ?? 'Ganhar massa');
      setPFitness(profile.fitness_level ?? 'Iniciante');
      setPFrequency(profile.frequency ?? '3x');

      const parsedAvatar = parseAvatarUrl(profile.avatar_url);
      if (parsedAvatar) {
        setAvatarStyle(parsedAvatar.style);
        setAvatarSeed(parsedAvatar.seed);
        setAvatarSkinColor(parsedAvatar.skinColor);
      }
    });
  }, [profile]);

  const avatarSeedFromProfile = profile?.name ? profile.name.replace(/\s+/g, '').toUpperCase() : 'BULLREP';

  const user = useMemo<User | null>(() => {
    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      level: profile.app_level,
      xp: profile.xp,
      streak: null,
      weight: profile.weight,
      height: profile.height,
      goal: profile.goal,
      fitnessLevel: profile.fitness_level,
      frequency: profile.frequency,
      avatarUrl: profile.avatar_url,
    };
  }, [profile]);

  const currentAvatarUrl = useMemo(
    () => buildAvatarUrl(avatarStyle, avatarSeed || avatarSeedFromProfile, avatarSkinColor),
    [avatarStyle, avatarSeed, avatarSeedFromProfile, avatarSkinColor]
  );

  const createSession = async (type: string, obs: string, exercises: ExerciseDraft[]) => {
    const { error } = await createSessionService({
      trainingType: type,
      notes: obs || undefined,
      exercises: exercises.flatMap((ex) =>
        ex.sets.map((s, idx) => ({
          name: ex.name,
          setsDone: 1,
          repsDone: s.reps,
          weight: s.weight,
          orderIndex: idx,
        }))
      ),
    });
    if (error) {
      setToast({ type: 'error', message: `Erro ao salvar treino: ${error}` });
      return false;
    } else {
      await fetchData();
      setToast({ type: 'success', message: 'Treino salvo com sucesso.' });
      return true;
    }
  };

  const updateSessionHandler = async (sessionId: string, type: string, obs: string, exercises: ExerciseDraft[]) => {
    const { error } = await updateSessionService(sessionId, {
      trainingType: type,
      notes: obs || undefined,
      exercises: exercises.flatMap((ex) =>
        ex.sets.map((s, idx) => ({
          name: ex.name,
          setsDone: 1,
          repsDone: s.reps,
          weight: s.weight,
          orderIndex: idx,
        }))
      ),
    });
    if (error) {
      setToast({ type: 'error', message: `Erro ao atualizar treino: ${error}` });
    } else {
      await fetchData();
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) {
      setToast({ type: 'error', message: 'No foi possvel carregar seu perfil. Verifique a conexo com o Neon e a tabela users.' });
      return;
    }
    if (pName.trim().length < 2) {
      setToast({ type: 'error', message: 'Digite um nome vlido.' });
      return;
    }
    if (!Number.isFinite(pWeight) || pWeight < 30 || pWeight > 300) {
      setToast({ type: 'error', message: 'Digite um peso vlido (30-300kg).' });
      return;
    }
    if (!Number.isFinite(pHeight) || pHeight < 100 || pHeight > 230) {
      setToast({ type: 'error', message: 'Digite uma altura vlida (100-230cm).' });
      return;
    }
    setSavingProfile(true);
    const res = await updateProfile({
      name: pName.trim(),
      weight: Number.isFinite(pWeight) ? pWeight : null,
      height: Number.isFinite(pHeight) ? pHeight : null,
      goal: pGoal,
      fitness_level: pFitness,
      frequency: pFrequency,
      avatar_url: currentAvatarUrl,
    });
    setSavingProfile(false);

    if (res.error) {
      setToast({ type: 'error', message: res.error });
      return;
    }
    setToast({ type: 'success', message: 'Perfil atualizado com sucesso.' });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setToast({ type: 'error', message: 'Preencha todos os campos de senha.' });
      return;
    }

    if (newPassword.length < 8) {
      setToast({ type: 'error', message: 'A nova senha deve ter pelo menos 8 caracteres.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setToast({ type: 'error', message: 'A confirmacao da nova senha nao confere.' });
      return;
    }

    setChangingPassword(true);
    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      setToast({ type: 'success', message: 'Senha alterada com sucesso.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Nao foi possivel alterar a senha.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const navItems: { id: Tab; label: string; icon: (a: boolean) => React.ReactElement }[] = [
    { id: 'home', label: 'Home', icon: (a) => <IconHome active={a} /> },
    { id: 'progress', label: 'Evoluo', icon: (a) => <IconTrend active={a} /> },
    ...(isAdmin ? [{ id: 'workout' as Tab, label: 'Treino', icon: (a: boolean) => <IconDumbbell active={a} /> }] : []),
    { id: 'profile', label: 'Perfil', icon: (a) => <IconUser active={a} /> },
    ...(isAdmin ? [{
      id: 'admin' as Tab,
      label: 'Admin',
      icon: (a: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15v2" />
          <path d="M6 9a6 6 0 0 1 12 0c0 3-2 5-3 6H9c-1-1-3-3-3-6Z" />
          <path d="M9 22h6" />
          <path d="M10 22a2 2 0 0 1-2-2v-1h8v1a2 2 0 0 1-2 2Z" />
        </svg>
      ),
    }] : []),
  ];

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card-premium" style={{ padding: '18px 20px' }}>
          <p style={{ fontWeight: 900, color: '#fff' }}>Carregando sesso…</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container-main">
      {/* Side Navigation (Desktop Only) */}
      <aside className="desktop-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px', padding: '0 8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(232,0,29,0.5)', boxShadow: '0 0 10px rgba(232,0,29,0.3)' }}>
            <img src={user?.avatarUrl || currentAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 950, letterSpacing: '0.02em', color: '#fff' }}>BULL<span style={{ color: 'var(--red-primary)' }}>REP</span></h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`sidebar-link${tab === id ? ' active-pro' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '16px',
                border: 'none', cursor: 'pointer',
                background: tab === id ? 'rgba(232,0,29,0.9)' : 'transparent',
                color: tab === id ? '#fff' : 'var(--text-muted)',
                fontWeight: tab === id ? 800 : 600,
                fontSize: '0.95rem', transition: '0.2s'
              }}
            >
              {icon(tab === id)}
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {user && (
          <div className="profile-widget" style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={user.avatarUrl || currentAvatarUrl} alt={user.name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name || 'Atleta BullRep'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <div style={{ width: '4px', height: '4px', background: 'var(--red-primary)', borderRadius: '50%' }} />
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Nvel {user.level || 1}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {tab === 'home' && (
          <HomeScreen
            sessions={sessions}
            loading={loading}
            onCreateSession={createSession}
            user={user}
            displayName={displayName}
            currentAvatarUrl={currentAvatarUrl}
            workoutStartTime={workoutStartTime}
            setTab={setTab}
          />
        )}
        {tab === 'progress' && <ProgressScreen sessions={sessions} user={user} displayName={displayName} setTab={setTab} />}
        {tab === 'workout' && isAdmin && (
          <WorkoutExperience onBack={() => setTab('home')} />
        )}
        {tab === 'admin' && isAdmin && (
          <div style={{ padding: '28px 20px 44px', animation: 'fadeInUp 0.4s ease' }}>
            <div className="card-premium" style={{ padding: '22px', marginBottom: '18px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(232,0,29,0.25)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top left, rgba(232,0,29,0.20), transparent 58%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(232,0,29,0.9), rgba(255,80,0,0.8))', display: 'grid', placeItems: 'center', boxShadow: '0 8px 24px rgba(232,0,29,0.35)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 15v2" />
                      <path d="M6 9a6 6 0 0 1 12 0c0 3-2 5-3 6H9c-1-1-3-3-3-6Z" />
                      <path d="M9 22h6" />
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 950, lineHeight: 1.1 }}>Painel Admin</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>Gerenciamento e viso geral</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                  <div className="glass-panel" style={{ padding: '16px', borderRadius: '18px', borderColor: 'rgba(232,0,29,0.15)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sesses registradas</p>
                    <p style={{ fontSize: '2rem', fontWeight: 950, color: '#fff', marginTop: '4px' }}>{sessions.length}</p>
                  </div>
                  <div className="glass-panel" style={{ padding: '16px', borderRadius: '18px', borderColor: 'rgba(232,0,29,0.15)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Conta</p>
                    <p style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', marginTop: '8px', wordBreak: 'break-all' }}>{profile?.email}</p>
                  </div>
                  <div className="glass-panel" style={{ padding: '16px', borderRadius: '18px', borderColor: 'rgba(232,0,29,0.15)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tipo de conta</p>
                    <p style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--red-primary)', marginTop: '8px' }}>?? Administrador</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium" style={{ padding: '22px', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '14px' }}>Aes do Admin</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px', lineHeight: 1.6 }}>
                Usurios pblicos veem <strong style={{ color: '#fff' }}>3 abas</strong>: Home, Evoluo e Perfil.<br />
                A aba <strong style={{ color: 'var(--red-primary)' }}>Treino</strong> e o <strong style={{ color: 'var(--red-primary)' }}>Painel Admin</strong> so exclusivos do administrador.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['Home', 'Evoluo', 'Perfil'].map((t) => (
                  <span key={t} className="badge-gray" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>? {t}</span>
                ))}
                {['Treino', 'Admin'].map((t) => (
                  <span key={t} style={{ fontSize: '0.82rem', padding: '8px 14px', borderRadius: '12px', background: 'rgba(232,0,29,0.12)', border: '1px solid rgba(232,0,29,0.3)', color: 'var(--red-primary)', fontWeight: 800 }}>?? {t}</span>
                ))}
              </div>
            </div>

            <div className="card-premium" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '14px' }}>?? Aes do Admin</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Gerenciar Exerccios', desc: 'Adicionar/remover exerc?cios do cat?logo', icon: '?' },
                  { label: 'Ver Todos os Usurios', desc: 'Listar usu?rios cadastrados', icon: '?' },
                  { label: 'Configuraes do App', desc: 'Ajustar parmetros globais', icon: '?' },
                ].map((action) => (
                  <div key={action.label} className="glass-panel" style={{ padding: '14px 16px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{action.icon}</span>
                      <div>
                        <p style={{ fontWeight: 900, color: '#fff', fontSize: '0.92rem' }}>{action.label}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, marginTop: '2px' }}>{action.desc}</p>
                      </div>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, fontSize: '1.1rem' }}></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'profile' && (
          <div style={{ padding: '28px 20px 44px', animation: 'fadeInUp 0.4s ease' }}>
            <div
              className="card-premium"
              style={{
                padding: '18px',
                marginBottom: '18px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(232,0,29,0.12)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at top, rgba(232,0,29,0.16), transparent 58%)',
                  pointerEvents: 'none',
                }}
              />
              <div
                className="profile-hero-grid"
                style={{
                  position: 'relative',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(220px, 260px) minmax(0, 1fr)',
                  gap: '18px',
                  alignItems: 'center',
                }}
              >
                <div className="profile-hero-avatar-wrap" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div
                    className="profile-hero-avatar"
                    style={{
                      width: '224px',
                      height: '224px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '4px solid rgba(232,0,29,0.92)',
                      boxShadow: '0 18px 50px rgba(232,0,29,0.34)',
                      background: 'rgba(0,0,0,0.35)',
                      position: 'relative',
                    }}
                  >
                    <img src={user?.avatarUrl || currentAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                    Perfil do atleta
                  </p>
                  <h2 style={{ fontSize: '2rem', fontWeight: 950, marginTop: '10px', lineHeight: 1.05 }}>{pName || displayName}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '10px', maxWidth: '42ch' }}>
                    Aqui voc v seu progresso e mantm seus dados de treino sempre atualizados.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                    <span className="badge-red" style={{ fontSize: '0.75rem', fontWeight: 800 }}>NVEL {user?.level ?? profile?.app_level ?? 1}</span>
                    <span className="badge-gray" style={{ fontSize: '0.75rem' }}>{user?.xp ?? profile?.xp ?? 0} XP</span>
                    <span className="badge-gray" style={{ fontSize: '0.75rem' }}>Avatar ativo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', marginTop: '0', textAlign: 'left' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resumo</p>
              <div className="profile-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>Peso</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 900 }}>{(profile?.weight ?? user?.weight) ? `${profile?.weight ?? user?.weight}kg` : '-'}</p>
                </div>
                <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>Altura</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 900 }}>{(profile?.height ?? user?.height) ? `${profile?.height ?? user?.height}cm` : '-'}</p>
                </div>
                <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>Objetivo</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 900 }}>{profile?.goal ?? user?.goal ?? '-'}</p>
                </div>
                <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '16px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800 }}>Frequncia</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 900 }}>{profile?.frequency ?? user?.frequency ?? '-'}</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', marginTop: '18px', textAlign: 'left' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Configuraes</p>
              {['Conta', 'Notificaes', 'Privacidade', 'Sobre o App'].map((item) => (
                <div key={item} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 0', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer'
                }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{item}</span>
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: 'rotate(-90deg)' }} />
                </div>
              ))}
            </div>

            <div className="card-premium" style={{ padding: '22px', marginTop: '18px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 950 }}>Dados do perfil</h3>
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={async () => {
                    await signOut();
                    router.replace('/login');
                  }}
                  style={{ padding: '10px 12px' }}
                >
                  Sair
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {!profile && (
                  <div className="glass-panel" style={{ padding: '12px 14px', borderRadius: '16px', borderColor: 'rgba(232,0,29,0.22)', background: 'rgba(232,0,29,0.06)' }}>
                    <p style={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem' }}>Perfil no carregado</p>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: '6px' }}>
                      Verifique se a conexo com o Neon est configurada em `DATABASE_URL` e se a tabela `users` existe.
                    </p>
                  </div>
                )}
                <label className="auth-field">
                  <span>Nome</span>
                  <div className="auth-input">
                    <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Seu nome de atleta" />
                  </div>
                </label>

                <label className="auth-field">
                  <span>E-mail</span>
                  <div className="auth-input" style={{ opacity: 0.75 }}>
                    <input value={profile?.email || user?.email || session?.user?.email || ''} disabled />
                  </div>
                </label>

                                <div className="auth-grid2">
                  <label className="auth-field">
                    <span>Peso (kg)</span>
                    <div className="auth-input">
                      <input value={pWeight} onChange={(e) => setPWeight(Number(e.target.value || 0))} type="number" min={30} max={300} />
                    </div>
                  </label>
                  <label className="auth-field">
                    <span>Altura (cm)</span>
                    <div className="auth-input">
                      <input value={pHeight} onChange={(e) => setPHeight(Number(e.target.value || 0))} type="number" min={100} max={230} />
                    </div>
                  </label>
                </div>

                <div className="auth-grid2">
                  <label className="auth-field">
                    <span>Objetivo</span>
                    <div className="auth-input">
                      <select value={pGoal} onChange={(e) => setPGoal(e.target.value as BullrepGoal)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontWeight: 800 }}>
                        {GOAL_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                  <label className="auth-field">
                    <span>Nvel</span>
                    <div className="auth-input">
                      <select value={pFitness} onChange={(e) => setPFitness(e.target.value as BullrepFitnessLevel)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontWeight: 800 }}>
                        {FITNESS_LEVEL_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>

                <label className="auth-field">
                  <span>Frequncia semanal</span>
                  <div className="auth-input">
                    <select value={pFrequency} onChange={(e) => setPFrequency(e.target.value as BullrepFrequency)} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontWeight: 800 }}>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </label>

                <button className="btn-primary" type="button" onClick={handleSaveProfile} disabled={savingProfile || !profile || !pName.trim()} style={{ width: '100%', marginTop: '6px' }}>
                  {savingProfile ? 'SALVANDO...' : 'Salvar alteraes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSummary && lastWorkoutDuration !== null && (
          <WorkoutSummaryModal
            duration={lastWorkoutDuration}
            onDismiss={() => { setShowSummary(false); setLastWorkoutDuration(null); }}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="mobile-nav">
        {navItems.map(({ id, label, icon }) => (
          <button key={id} id={`nav-${id}`}
            className={`nav-link${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}>
            <div style={{ transform: tab === id ? 'scale(1.1) translateY(-2px)' : 'scale(1)', transition: 'all 0.2s' }}>
              {icon(tab === id)}
            </div>
            <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>{label}</span>
          </button>
        ))}
      </nav>

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
