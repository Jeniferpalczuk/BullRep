import Image from 'next/image';

import type { MuscleGroup } from '@/data/workoutMock';

export function MuscleCard({
  muscle,
  onClick,
}: {
  muscle: MuscleGroup;
  onClick: (muscle: MuscleGroup) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(muscle)}
      className="group card-premium relative w-full overflow-hidden rounded-[22px] p-0 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/45 hover:shadow-[0_18px_40px_-20px_rgba(232,0,29,0.5)] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/80"
    >
      <div className="h-28 bg-[rgb(205,23,37)] sm:h-32">
        <div className="relative h-full w-full overflow-hidden">
          {muscle.imageUrl ? (
            <Image
              src={muscle.imageUrl}
              alt={`Ilustra��o de ${muscle.name}`}
              fill
              className="object-cover transition-transform duration-300 scale-[1.22] group-hover:scale-[1.28]"
              sizes="(max-width: 1024px) 50vw, 25vw"
              priority={false}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm font-bold text-white/90">
              {muscle.name}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        </div>
      </div>

      <div className="border-t border-white/10 bg-zinc-950 px-3 py-2.5">
        <p className="line-clamp-2 text-center text-[0.92rem] font-extrabold text-zinc-100">
          Exerc�cios para {muscle.name}
        </p>
      </div>
    </button>
  );
}
