import { EXERCISES, MUSCLE_GROUPS } from '@/data/workoutMock';

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function getDayOfWeek(): string {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  return days[new Date().getDay()];
}

export function toDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10);
}

export function getWeekRange(): { startOfWeek: Date; endOfWeek: Date; startPrevWeek: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  const startPrevWeek = new Date(startOfWeek);
  startPrevWeek.setDate(startOfWeek.getDate() - 7);
  return { startOfWeek, endOfWeek, startPrevWeek };
}

export function isInRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr);
  return d.getTime() >= start.getTime() && d.getTime() < end.getTime();
}

export type CatalogExercise = {
  name: string;
  icon?: string;
  equipment?: string;
  target?: string;
  difficulty?: string;
  gif?: string;
  description?: string;
};

const DIFFICULTY_MAP: Record<string, string> = {
  Iniciante: 'Iniciante',
  Médio: 'Intermediário',
  Avançado: 'Avançado',
};

const CATEGORY_BY_MUSCLE_ID: Record<string, string> = {
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  chest: 'Peito',
  shoulders: 'Ombro',
  trapezius: 'Trapézio',
  back: 'Costas',
  forearms: 'Antebraço',
  abs: 'Abdômen',
  legs: 'Perna',
  calves: 'Panturrilhas',
  glutes: 'Glúteo',
};

const TARGET_BY_MUSCLE_ID: Record<string, string> = {
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  chest: 'Peitoral',
  shoulders: 'Ombro',
  trapezius: 'Trapézio',
  back: 'Costas',
  forearms: 'Antebraço',
  abs: 'Abdômen',
  legs: 'Pernas',
  calves: 'Panturrilhas',
  glutes: 'Glúteos',
};

const EQUIPMENT_LABEL: Record<string, string> = {
  Barra: 'Barra',
  Halteres: 'Halteres',
  'Peso corporal': 'Peso corporal',
};

function toCatalogExercise(ex: (typeof EXERCISES)[number]): CatalogExercise {
  return {
    name: ex.name,
    equipment: EQUIPMENT_LABEL[ex.equipment] ?? ex.equipment,
    target: TARGET_BY_MUSCLE_ID[ex.muscleId] ?? ex.muscleName,
    difficulty: DIFFICULTY_MAP[ex.level] ?? ex.level,
    description: ex.steps[0] ? `${ex.steps[0]}. ${ex.steps[1] ?? ''}`.trim() : undefined,
  };
}

export const EXERCISE_CATALOG: Record<string, CatalogExercise[]> = EXERCISES.reduce(
  (acc, ex) => {
    const category = CATEGORY_BY_MUSCLE_ID[ex.muscleId] ?? ex.muscleName;
    if (!acc[category]) acc[category] = [];

    const exists = acc[category].some((item) => item.name.toLowerCase() === ex.name.toLowerCase());
    if (!exists) acc[category].push(toCatalogExercise(ex));

    return acc;
  },
  {} as Record<string, CatalogExercise[]>
);

Object.keys(EXERCISE_CATALOG).forEach((category) => {
  EXERCISE_CATALOG[category] = EXERCISE_CATALOG[category].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
});

const CATALOG_INDEX = (() => {
  const map = new Map<string, { category: string; exercise: CatalogExercise }>();
  Object.entries(EXERCISE_CATALOG).forEach(([category, list]) => {
    list.forEach((exercise) => {
      const key = exercise.name.trim().toLowerCase();
      if (!map.has(key)) map.set(key, { category, exercise });
    });
  });
  return map;
})();

export function getCatalogEntryByName(name: string): { category: string; exercise: CatalogExercise } | null {
  return CATALOG_INDEX.get(name.trim().toLowerCase()) ?? null;
}

const IMAGE_BY_MUSCLE_ID: Record<string, string> = Object.fromEntries(
  MUSCLE_GROUPS.map((muscle) => [CATEGORY_BY_MUSCLE_ID[muscle.id] ?? muscle.name, muscle.imageUrl ?? ''])
);

export const MUSCLE_ICONS: Record<string, string> = {
  Peito: IMAGE_BY_MUSCLE_ID.Peito || '💪',
  Costas: IMAGE_BY_MUSCLE_ID.Costas || '💪',
  Perna: IMAGE_BY_MUSCLE_ID.Perna || '🦵',
  Glúteo: IMAGE_BY_MUSCLE_ID['Glúteo'] || '🍑',
  Bíceps: IMAGE_BY_MUSCLE_ID['Bíceps'] || '💪',
  Tríceps: IMAGE_BY_MUSCLE_ID['Tríceps'] || '🏋️',
  Ombro: IMAGE_BY_MUSCLE_ID.Ombro || '🏋️',
  Abdômen: IMAGE_BY_MUSCLE_ID['Abdômen'] || '🔥',
  Trapézio: IMAGE_BY_MUSCLE_ID['Trapézio'] || '💪',
  Antebraço: IMAGE_BY_MUSCLE_ID['Antebraço'] || '💪',
  Panturrilhas: IMAGE_BY_MUSCLE_ID.Panturrilhas || '🦵',
};
