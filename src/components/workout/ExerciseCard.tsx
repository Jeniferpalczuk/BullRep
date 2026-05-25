import { ChevronRight, Star } from 'lucide-react';

import type { ExerciseItem } from '@/data/workoutMock';

export function ExerciseCard({
  exercise,
  onClick,
}: {
  exercise: ExerciseItem;
  onClick: (exercise: ExerciseItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(exercise)}
      className="group card-premium relative w-full rounded-[22px] border-red-500/30 bg-[linear-gradient(120deg,rgba(10,10,10,0.95),rgba(24,8,10,0.88))] p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400/70 hover:shadow-[0_16px_36px_-18px_rgba(232,0,29,0.4)] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/80 sm:p-5"
    >
      <div className="absolute right-4 top-4">
        <Star className="h-5 w-5 text-zinc-500 transition group-hover:text-zinc-300" />
      </div>

      <div className="pr-10">
        <p className="leading-tight text-[1.1rem] font-extrabold tracking-tight text-white sm:text-[1.22rem]">
          {exercise.name}
        </p>
        <p className="mt-1 text-sm font-semibold text-zinc-400 sm:text-[0.95rem]">{exercise.muscleName}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/85 px-2.5 py-1 text-xs font-semibold text-zinc-200">
            {exercise.equipment}
          </span>
          <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/85 px-2.5 py-1 text-xs font-semibold text-zinc-200">
            {exercise.level}
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4">
        <ChevronRight className="h-6 w-6 text-red-500 transition group-hover:translate-x-1 group-hover:text-red-400" />
      </div>
    </button>
  );
}
