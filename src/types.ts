// ─── BullRep - Tipos Oficiais (schema v2) ─────────────────────────────────────
// Todos os IDs s�o UUID (string). Snake_case no banco, camelCase no c�digo.

// ─── DATABASE TYPES (retorno direto da API/Neon) ──────────────────────────────

export type DbProfile = {
  id: string;
  name: string;
  email: string;
  weight: number | null;
  height: number | null;
  goal: 'Ganhar massa' | 'Emagrecer' | 'Manter peso' | null;
  fitness_level: 'Iniciante' | 'Intermedi�rio' | 'Avan�ado' | null;
  frequency: '2x' | '3x' | '4x' | '5x+' | null;
  is_admin: boolean;
  app_level: number;
  avatar_url: string | null;
  xp: number;
  created_at: string;
  updated_at: string;
};

export type DbExercise = {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string | null;
  level: 'iniciante' | 'intermediario' | 'avancado' | null;
  gif_url: string | null;
  description: string | null;
  created_at: string;
};

export type DbWorkout = {
  id: string;
  user_id: string;
  name: string;
  muscle_group: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DbWorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_id: string | null;
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  order_index: number;
  created_at: string;
};

export type DbTrainingSession = {
  id: string;
  user_id: string;
  workout_id: string | null;
  date: string;
  training_type: string;
  notes: string | null;
  duration_min: number | null;
  created_at: string;
};

export type DbTrainingSessionExercise = {
  id: string;
  session_id: string;
  exercise_id: string | null;
  name: string;
  sets_done: number;
  reps_done: number;
  weight: number;
  order_index: number;
  created_at: string;
};

export type DbAthleteStreak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_trained_at: string | null;
  updated_at: string;
};

// ─── APP TYPES (mapeados p/ uso no frontend) ───────────────────────────────────

export type AthleteStreak = {
  currentStreak: number;
  longestStreak: number;
  lastTrainedAt: string | null;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  level: number;
  xp: number;
  streak: AthleteStreak | null;
  avatarUrl?: string | null;
  weight?: number | null;
  height?: number | null;
  goal?: string | null;
  fitnessLevel?: string | null;
  frequency?: string | null;
};

export type SessionExercise = {
  id: string;
  sessionId: string;
  exerciseId: string | null;
  name: string;
  setsDone: number;
  repsDone: number;
  weight: number;
  orderIndex: number;
};

export type TrainingSession = {
  id: string;
  userId: string;
  date: string;
  trainingType: string;
  notes?: string | null;
  durationMin?: number | null;
  exercises: SessionExercise[];
};

export type WorkoutExercise = {
  id: string;
  workoutId: string;
  exerciseId: string | null;
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  orderIndex: number;
};

export type Workout = {
  id: string;
  userId: string;
  name: string;
  muscleGroup: string | null;
  notes: string | null;
  exercises: WorkoutExercise[];
};
