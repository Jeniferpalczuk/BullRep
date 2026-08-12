import { EXERCISES } from '@/data/workoutMock';

export const TRAINING_MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Perna',
  'Glúteo',
  'Bíceps',
  'Tríceps',
  'Ombro',
  'Abdômen',
  'Trapézio',
  'Antebraço',
  'Panturrilha',
] as const;

export type TrainingMuscleGroup = (typeof TRAINING_MUSCLE_GROUPS)[number];

const MUSCLE_BY_EXERCISE_ID: Record<string, TrainingMuscleGroup> = {
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  chest: 'Peito',
  shoulders: 'Ombro',
  trapezius: 'Trapézio',
  back: 'Costas',
  forearms: 'Antebraço',
  abs: 'Abdômen',
  legs: 'Perna',
  calves: 'Panturrilha',
  glutes: 'Glúteo',
};

const MUSCLE_LABELS: Record<TrainingMuscleGroup, string> = {
  Peito: 'PEITO',
  Costas: 'COSTA',
  Perna: 'PERNA',
  Glúteo: 'GLÚTEO',
  Bíceps: 'BÍCEPS',
  Tríceps: 'TRÍCEPS',
  Ombro: 'OMBRO',
  Abdômen: 'ABDÔMEN',
  Trapézio: 'TRAPÉZIO',
  Antebraço: 'ANTEBRAÇO',
  Panturrilha: 'PANTURRILHA',
};

const MUSCLE_ALIASES: Record<TrainingMuscleGroup, string[]> = {
  Peito: ['peito', 'peitoral', 'chest'],
  Costas: ['costa', 'costas', 'dorsal', 'back'],
  Perna: ['perna', 'pernas', 'coxa', 'quadriceps', 'leg', 'legs'],
  Glúteo: ['gluteo', 'gluteos', 'glteo', 'glteos'],
  Bíceps: ['biceps', 'bceps'],
  Tríceps: ['triceps', 'trceps'],
  Ombro: ['ombro', 'ombros', 'shoulder', 'shoulders'],
  Abdômen: ['abdomen', 'abdmen', 'abdominal', 'abs'],
  Trapézio: ['trapezio', 'trapzio'],
  Antebraço: ['antebraco', 'antebrao', 'forearm', 'forearms'],
  Panturrilha: ['panturrilha', 'panturrilhas', 'calf', 'calves'],
};

const EXERCISE_MUSCLE_INDEX = new Map(
  EXERCISES.map((exercise) => [
    simplify(exercise.name),
    MUSCLE_BY_EXERCISE_ID[exercise.muscleId],
  ]).filter((entry): entry is [string, TrainingMuscleGroup] => Boolean(entry[1]))
);

function simplify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function uniqueMuscles(values: TrainingMuscleGroup[]): TrainingMuscleGroup[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

export function normalizeMuscleGroupName(value: string): TrainingMuscleGroup | null {
  const normalized = simplify(value);
  return (
    TRAINING_MUSCLE_GROUPS.find((group) =>
      MUSCLE_ALIASES[group].some((alias) => alias === normalized)
    ) ?? null
  );
}

export function parseTrainingMuscleGroups(trainingType?: string | null): TrainingMuscleGroup[] {
  if (!trainingType) return [];

  const tokens = simplify(trainingType).split(/[^a-z0-9]+/).filter(Boolean);
  return TRAINING_MUSCLE_GROUPS.filter((group) =>
    MUSCLE_ALIASES[group].some((alias) => tokens.includes(alias))
  );
}

export function getExerciseMuscleGroup(exerciseName: string): TrainingMuscleGroup | null {
  return EXERCISE_MUSCLE_INDEX.get(simplify(exerciseName)) ?? null;
}

export function getTrainingMuscleGroups(
  trainingType?: string | null,
  exerciseNames: string[] = []
): TrainingMuscleGroup[] {
  const fromType = parseTrainingMuscleGroups(trainingType);
  if (fromType.length > 0) return fromType;

  const fromExercises = exerciseNames
    .map(getExerciseMuscleGroup)
    .filter((group): group is TrainingMuscleGroup => Boolean(group));

  return uniqueMuscles(fromExercises);
}

export function formatTrainingType(groups: TrainingMuscleGroup[]): string {
  return uniqueMuscles(groups).map((group) => MUSCLE_LABELS[group]).join('/');
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function getMondayWeekRange(dateKey: string): { start: Date; end: Date } {
  const date = parseDateKey(dateKey);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() - daysSinceMonday);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { start, end };
}
