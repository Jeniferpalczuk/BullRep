'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  ArrowLeft,
  Dumbbell,
  ListFilter,
  LogOut,
  Search,
  ChevronDown,
} from 'lucide-react';

import { EXERCISES, MUSCLE_GROUPS, type Equipment, type ExerciseItem, type MuscleGroup } from '@/data/workoutMock';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { ExerciseModal } from '@/components/workout/ExerciseModal';
import { MuscleCard } from '@/components/workout/MuscleCard';

const EQUIPMENT_FILTERS: Array<{ key: 'all' | Equipment; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'Barra', label: 'Barra' },
  { key: 'Halteres', label: 'Halteres' },
  { key: 'Peso corporal', label: 'Peso corporal' },
];

export function WorkoutExperience({
  onBack,
}: {
  onBack: () => void;
}) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [query, setQuery] = useState('');
  const [equipment, setEquipment] = useState<'all' | Equipment>('all');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [sort, setSort] = useState<'az' | 'za'>('az');
  const [isPending, startTransition] = useTransition();

  const filteredExercises = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byMuscle = EXERCISES.filter((e) => e.muscleId === selectedMuscle?.id);
    const byEquipment = equipment === 'all' ? byMuscle : byMuscle.filter((e) => e.equipment === equipment);
    const byQuery = !q
      ? byEquipment
      : byEquipment.filter((e) => e.name.toLowerCase().includes(q) || e.muscleName.toLowerCase().includes(q));

    return [...byQuery].sort((a, b) =>
      sort === 'az' ? a.name.localeCompare(b.name, 'pt-BR') : b.name.localeCompare(a.name, 'pt-BR')
    );
  }, [equipment, query, selectedMuscle, sort]);

  return (
    <div className="min-h-screen bg-black text-white">
      {!selectedMuscle && (
        <div className="home-shell mx-auto w-full max-w-[1320px] px-4 pb-24 pt-2 lg:px-8">
          <div className="card-premium mb-5 rounded-[24px] border-red-500/20 bg-[radial-gradient(800px_260px_at_10%_0%,rgba(232,0,29,0.16),transparent_60%),rgba(12,12,12,0.86)] p-5 sm:p-6">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Escolha o Grupo Muscular</h2>
            <p className="mt-1.5 text-sm font-medium text-zinc-400 sm:text-base">
              Selecione um grupo para ver exerc�cios com barra, halteres e peso corporal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {MUSCLE_GROUPS.map((muscle, idx) => (
              <div
                key={muscle.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
              >
                <MuscleCard muscle={muscle} onClick={setSelectedMuscle} />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMuscle && (
        <div className="min-h-screen bg-gradient-to-b from-[#150608] via-black to-black px-6 pb-24 pt-8 lg:px-12 lg:pt-10">
          <div className="mx-auto w-full max-w-[1240px]">
            <div className="mb-7 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  startTransition(() => {
                    setSelectedMuscle(null);
                    setQuery('');
                    setEquipment('all');
                  });
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950/70 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-900 active:scale-[0.98]"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
                Voltar
              </button>

              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950/70 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-900 active:scale-[0.98]"
              >
                <LogOut className="h-4.5 w-4.5 text-red-500" />
                Sair
              </button>
            </div>

            <div className="card-premium mb-7 rounded-[24px] px-6 py-6 sm:px-7 sm:py-7">
              <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-red-500 sm:text-sm">
                <Dumbbell className="h-4 w-4" />
                Grupo Muscular
              </div>
              <h3 className="text-[2.2rem] font-black leading-none text-white sm:text-[3rem]">{selectedMuscle.name}</h3>
              <p className="mt-2 text-sm font-medium text-zinc-400 sm:text-base">Exerc�cios filtrados por grupo muscular</p>
            </div>

            <div className="glass-panel mb-4 rounded-2xl p-3.5 sm:p-4">
              <div className="flex h-12 items-center gap-3 rounded-xl border border-red-600/65 bg-red-950/20 px-3.5 transition focus-within:border-red-400 focus-within:bg-red-950/30 sm:h-14 sm:px-4">
                <Search className="h-5 w-5 text-zinc-300" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    const value = e.target.value;
                    startTransition(() => setQuery(value));
                  }}
                  placeholder="Buscar exerc�cio (ex: rosca, barra, halteres...)"
                  className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none sm:text-base"
                />
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-3.5 sm:p-4">
              <div className="mb-3 flex flex-wrap gap-2.5">
                {EQUIPMENT_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => startTransition(() => setEquipment(f.key))}
                    className={`rounded-xl border px-4 py-2 text-sm font-bold transition active:scale-[0.98] sm:px-5 sm:text-[0.95rem] ${
                      equipment === f.key
                        ? 'border-red-500 bg-red-600 text-white shadow-[0_0_0_1px_rgba(232,0,29,0.25)]'
                        : 'border-zinc-700 bg-zinc-900/90 text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => startTransition(() => setSort((s) => (s === 'az' ? 'za' : 'az')))}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-4 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 active:scale-[0.98] sm:text-[0.95rem]"
              >
                <ListFilter className="h-5 w-5" />
                Ordenar: {sort === 'az' ? 'A - Z' : 'Z - A'}
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-5 text-sm font-semibold text-zinc-300 sm:mb-6 sm:text-base">
              <span className="text-red-500">{filteredExercises.length}</span> exerc�cios encontrados
            </div>

            {isPending ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-7">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-5"
                  >
                    <div className="h-6 w-3/4 rounded-md bg-zinc-700/70" />
                    <div className="mt-3 h-4 w-1/3 rounded-md bg-zinc-800" />
                    <div className="mt-4 flex gap-2">
                      <div className="h-7 w-20 rounded-full bg-zinc-800" />
                      <div className="h-7 w-16 rounded-full bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-7">
                {filteredExercises.map((exercise, idx) => (
                  <div
                    key={exercise.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${Math.min(idx * 45, 260)}ms` }}
                  >
                    <ExerciseCard exercise={exercise} onClick={setSelectedExercise} />
                  </div>
                ))}
              </div>
            )}

            {filteredExercises.length === 0 && (
              <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 text-sm text-zinc-400 sm:text-base">
                Nenhum exerc�cio encontrado para o filtro atual.
              </div>
            )}
          </div>
        </div>
      )}

      <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
    </div>
  );
}
