import { ExternalLink, X } from 'lucide-react';
import Image from 'next/image';

import type { ExerciseItem } from '@/data/workoutMock';

function levelClass(level: ExerciseItem['level']) {
  if (level === 'Iniciante') return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300';
  if (level === 'Médio') return 'border-amber-400/40 bg-amber-500/15 text-amber-300';
  return 'border-rose-400/40 bg-rose-500/15 text-rose-300';
}

function MotionImage({
  label,
  exerciseName,
  imageUrl,
}: {
  label: 'Início' | 'Fim';
  exerciseName: string;
  imageUrl?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/70 p-3">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">{label}</div>
      {imageUrl ? (
        <div className="relative h-40 w-full sm:h-44">
          <Image
            src={imageUrl}
            alt={`${exerciseName} ${label}`}
            fill
            className="rounded-xl border border-zinc-700 object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
            unoptimized
          />
        </div>
      ) : (
        <div className="grid h-40 place-items-center rounded-xl border border-zinc-700 bg-gradient-to-b from-zinc-800 to-zinc-900 p-3 sm:h-44">
          <p className="text-center text-sm font-semibold text-zinc-200">{exerciseName}</p>
        </div>
      )}
    </div>
  );
}

export function ExerciseModal({
  exercise,
  onClose,
}: {
  exercise: ExerciseItem | null;
  onClose: () => void;
}) {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[rgba(12,12,12,0.96)] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800 px-5 py-4 sm:px-6">
          <h3 className="pr-4 text-lg font-extrabold text-white sm:text-xl">{exercise.name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-xl border border-zinc-500 px-3 py-1.5 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-700/70"
          >
            <X className="h-4 w-4" />
            Fechar
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MotionImage label="Início" exerciseName={exercise.name} imageUrl={exercise.imageStartUrl} />
            <MotionImage label="Fim" exerciseName={exercise.name} imageUrl={exercise.imageEndUrl} />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${levelClass(exercise.level)}`}>
              {exercise.level}
            </span>
            <span className="inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-300">
              {exercise.equipment}
            </span>
            {exercise.sourceUrl && (
              <a
                href={exercise.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300 transition hover:bg-blue-500/20"
              >
                Abrir no MuscleWiki
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <ol className="space-y-2.5">
            {exercise.steps.map((step, idx) => (
              <li key={step} className="rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-zinc-200">
                <span className="mr-2 font-bold text-red-400">{idx + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
