import { apiRequest } from '@/lib/apiClient';
import type {
  DbTrainingSession,
  DbTrainingSessionExercise,
  SessionExercise,
  TrainingSession,
} from '@/types';

function mapDbExercise(raw: DbTrainingSessionExercise): SessionExercise {
  return {
    id: raw.id,
    sessionId: raw.session_id,
    exerciseId: raw.exercise_id,
    name: raw.name,
    setsDone: raw.sets_done,
    repsDone: raw.reps_done,
    weight: raw.weight,
    orderIndex: raw.order_index,
  };
}

function mapDbSession(
  raw: DbTrainingSession & { exercises: DbTrainingSessionExercise[] }
): TrainingSession {
  return {
    id: raw.id,
    userId: raw.user_id,
    date: raw.date,
    trainingType: raw.training_type,
    notes: raw.notes,
    durationMin: raw.duration_min,
    exercises: raw.exercises.map(mapDbExercise),
  };
}

export async function fetchSessions(): Promise<{ data: TrainingSession[]; error?: string }> {
  try {
    const response = await apiRequest<{
      data: Array<DbTrainingSession & { exercises: DbTrainingSessionExercise[] }>;
    }>('/api/sessions');
    return { data: response.data.map(mapDbSession) };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Erro ao buscar sessoes.' };
  }
}

type CreateSessionPayload = {
  trainingType: string;
  notes?: string;
  durationMin?: number;
  exercises: Array<{
    exerciseId?: string | null;
    name: string;
    setsDone: number;
    repsDone: number;
    weight: number;
    orderIndex?: number;
  }>;
};

export async function createSession(
  payload: CreateSessionPayload
): Promise<{ data: TrainingSession | null; error?: string }> {
  try {
    const response = await apiRequest<{
      data: DbTrainingSession & { exercises: DbTrainingSessionExercise[] };
    }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { data: mapDbSession(response.data) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Erro ao criar sessao.' };
  }
}

export async function deleteSession(sessionId: string): Promise<{ error?: string }> {
  try {
    await apiRequest<{ ok: boolean }>(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao remover sessao.' };
  }
}

export async function updateSession(
  sessionId: string,
  payload: CreateSessionPayload
): Promise<{ data: TrainingSession | null; error?: string }> {
  try {
    const response = await apiRequest<{
      data: DbTrainingSession & { exercises: DbTrainingSessionExercise[] };
    }>(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return { data: mapDbSession(response.data) };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Erro ao atualizar sessao.' };
  }
}
