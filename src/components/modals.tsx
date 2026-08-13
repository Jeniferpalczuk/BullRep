import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle2, Plus, Search, X } from 'lucide-react';
import { EXERCISE_CATALOG } from './utils';
import { formatTrainingType, normalizeMuscleGroupName } from '@/lib/trainingMuscles';
import type { ExerciseSelection } from '@/features/workout/types';

function normalizeCategoryName(value?: string) {
  if (!value) return null;
  const target = value.trim().toLowerCase();
  const normalizedMuscle = normalizeMuscleGroupName(value);
  const found = Object.keys(EXERCISE_CATALOG).find(
    (cat) =>
      cat.toLowerCase() === target ||
      (normalizedMuscle && normalizeMuscleGroupName(cat) === normalizedMuscle)
  );
  return found ?? null;
}

export function ExerciseSelectorModal({
  onSelect,
  onCancel,
  defaultCategory,
  defaultCategories,
  blockedCategories = [],
}: {
  onSelect: (exercises: ExerciseSelection[]) => void;
  onCancel: () => void;
  defaultCategory?: string;
  defaultCategories?: string[];
  blockedCategories?: string[];
}) {
  const blockedCategorySet = new Set(
    blockedCategories.map(normalizeCategoryName).filter((category): category is string => Boolean(category))
  );
  const initialCategories = [...(defaultCategories || []), ...(defaultCategory ? [defaultCategory] : [])]
    .map(normalizeCategoryName)
    .filter((category): category is string => Boolean(category))
    .filter((category, index, values) => values.indexOf(category) === index)
    .filter((category) => !blockedCategorySet.has(category));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [query, setQuery] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(initialCategories.length === 0);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseSelection[]>([]);
  const [categoryWarning, setCategoryWarning] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onCancel]);

  const allCategories = useMemo(() => Object.keys(EXERCISE_CATALOG), []);

  const exerciseList = useMemo(() => {
    if (!selectedCategories.length) return [];
    const merged = selectedCategories.flatMap((cat) =>
      (EXERCISE_CATALOG[cat] || []).map((exercise) => ({ ...exercise, category: cat }))
    );

    const uniqueByName = merged.filter(
      (item, idx, arr) => arr.findIndex((x) => x.name.toLowerCase() === item.name.toLowerCase()) === idx
    );

    const q = query.trim().toLowerCase();
    if (!q) return uniqueByName;

    return uniqueByName.filter((ex) => {
      const text = `${ex.name} ${ex.target ?? ''} ${ex.equipment ?? ''}`.toLowerCase();
      return text.includes(q);
    });
  }, [query, selectedCategories]);

  const toggleCategory = (category: string) => {
    const exists = selectedCategories.includes(category);
    if (exists) {
      setCategoryWarning(null);
      setSelectedCategories((current) => current.filter((item) => item !== category));
      return;
    }
    if (blockedCategorySet.has(category)) {
      const muscle = normalizeMuscleGroupName(category);
      setCategoryWarning(
        `${muscle ? formatTrainingType([muscle]) : category.toUpperCase()} já foi treinado nesta semana. Escolha outro músculo.`
      );
      return;
    }
    setCategoryWarning(null);
    setSelectedCategories((current) => [...current, category]);
  };

  const toggleExercise = (name: string, category: string) => {
    setSelectedExercises((current) =>
      current.some((item) => item.name === name)
        ? current.filter((item) => item.name !== name)
        : [...current, { name, muscleGroup: category }]
    );
  };

  const launchExercises = () => {
    if (!selectedExercises.length) return;
    onSelect(selectedExercises);
    onCancel();
  };

  return (
    <div
      className="exercise-selector-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18px',
          overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.985, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        exit={{ opacity: 0, scale: 0.985, y: 10 }}
        className="glass-card-premium exercise-selector-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-selector-title"
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: 'min(90dvh, 760px)',
          overflow: 'hidden',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg, rgba(12,12,12,0.98), rgba(6,6,6,0.95))',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="exercise-selector-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', position: 'sticky', top: '-20px', zIndex: 1, background: 'linear-gradient(180deg, rgba(12,12,12,0.98), rgba(12,12,12,0.94))', paddingTop: '2px', paddingBottom: '8px' }}>
          <div>
            <h2 id="exercise-selector-title" style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fff' }}>Adicionar exercícios</h2>
            <p className="exercise-selector-subtitle">Escolha um ou mais exercícios para o treino.</p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost exercise-selector-close"
            aria-label="Fechar seletor de exercícios"
            style={{ padding: '8px 12px', borderRadius: '12px', fontWeight: 800 }}
          >
            <X size={18} />
            <span>Fechar</span>
          </button>
        </div>

        <div className="exercise-selector-launch">
          <button
            type="button"
            className="btn-primary exercise-selector-launch-button"
            disabled={selectedExercises.length === 0}
            onClick={launchExercises}
          >
            Lançar exercícios ({selectedExercises.length})
          </button>
        </div>

        <div className="glass-panel" style={{ borderRadius: '18px', padding: '14px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Músculos selecionados
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {selectedCategories.length === 0 && (
                  <span className="badge-gray">Selecione pelo menos 1 músculo</span>
                )}
                {selectedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    style={{
                      border: '1px solid rgba(232,0,29,0.35)',
                      background: 'rgba(232,0,29,0.15)',
                      color: '#fff',
                      borderRadius: '999px',
                      padding: '6px 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                    <X size={14} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCategoryPicker((v) => !v)}
              className="btn-ghost"
              style={{ padding: '10px 12px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              Adicionar músculo
            </button>
          </div>

          {showCategoryPicker && (
            <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: '8px' }}>
              {allCategories.map((cat) => {
                const selected = selectedCategories.includes(cat);
                const blocked = blockedCategorySet.has(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-disabled={blocked}
                    aria-label={blocked ? `${cat} já treinado nesta semana` : `Selecionar ${cat}`}
                    onClick={() => toggleCategory(cat)}
                    style={{
                      borderRadius: '12px',
                      border: selected ? '1px solid rgba(232,0,29,0.45)' : '1px solid rgba(255,255,255,0.08)',
                      background: selected ? 'rgba(232,0,29,0.16)' : 'rgba(255,255,255,0.03)',
                      color: blocked ? 'rgba(255,255,255,0.38)' : '#fff',
                      padding: '9px 10px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textAlign: 'left',
                      textDecoration: blocked ? 'line-through' : 'none',
                    }}
                  >
                    {cat}{blocked ? ' · feito' : ''}
                  </button>
                );
              })}
            </div>
          )}

          {categoryWarning && (
            <div className="weekly-muscle-warning" role="alert">
              <span aria-hidden="true">!</span>
              <p>{categoryWarning}</p>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '10px 12px', borderRadius: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar exercício..."
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontWeight: 700 }}
            />
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '10px' }}>
          {exerciseList.length} exercícios encontrados
        </p>

        <div className="exercise-selector-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '2px' }}>
          {exerciseList.map((ex, idx) => {
            const isAdded = selectedExercises.some((item) => item.name === ex.name);
            return (
              <div
                key={`${ex.name}-${idx}`}
                className="glass-card-premium"
                style={{ borderRadius: '16px', padding: '15px', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {ex.gif ? (
                      <Image src={ex.gif} alt={ex.name} width={64} height={64} unoptimized style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.4rem' }}>🏋️</span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', marginBottom: '5px' }}>{ex.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '7px' }}>
                      {ex.target ? <>Músculo: <span style={{ color: '#fff' }}>{ex.target}</span></> : null}
                      {ex.equipment ? <> - Equip: <span style={{ color: '#fff' }}>{ex.equipment}</span></> : null}
                      {ex.difficulty ? <> - Nível: <span style={{ color: '#fff' }}>{ex.difficulty}</span></> : null}
                    </p>
                    {ex.description ? (
                      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.35, marginBottom: '9px' }}>{ex.description}</p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => toggleExercise(ex.name, ex.category)}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        border: isAdded ? '1px solid rgba(0,230,118,0.35)' : '1px solid rgba(232,0,29,0.3)',
                        background: isAdded ? 'rgba(0,230,118,0.14)' : 'rgba(232,0,29,0.14)',
                        color: '#fff',
                        padding: '9px 12px',
                        fontSize: '0.84rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      {isAdded ? <Check size={15} /> : <Plus size={15} />}
                      {isAdded ? 'Selecionado' : 'Adicionar exercício'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {exerciseList.length === 0 && (
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '18px' }}>
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Nenhum exercício encontrado para o(s) músculo(s) selecionado(s).</p>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}

export function WorkoutSummaryModal({ duration, onDismiss }: { duration: number; onDismiss: () => void }) {
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const timeStr = `${mins}min ${secs}s`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass-card-premium"
        style={{ width: '100%', maxWidth: '380px', textAlign: 'center', padding: '40px 30px' }}
      >
        <div style={{ width: '80px', height: '80px', background: 'var(--red-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px var(--red-glow)' }}>
          <CheckCircle2 size={40} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>Treino Finalizado!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Parabéns! Você concluiu seus objetivos de hoje.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Duração</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--red-primary)', marginTop: '4px' }}>{timeStr}</p>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Intensidade</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffcc00', marginTop: '4px' }}>ALTA</p>
          </div>
        </div>

        <button className="btn-primary" onClick={onDismiss} style={{ width: '100%', padding: '18px', borderRadius: '16px' }}>
          FECHAR RESUMO
        </button>
      </motion.div>
    </div>
  );
}
