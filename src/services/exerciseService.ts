import { apiRequest } from '@/lib/apiClient';
import type { DbExercise } from '@/types';

export async function fetchExercises(): Promise<{ data: DbExercise[]; error?: string }> {
  try {
    const response = await apiRequest<{ data: DbExercise[] }>('/api/exercises');
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Erro ao buscar exercicios.' };
  }
}

export async function fetchExercisesByGroup(muscleGroup: string): Promise<{ data: DbExercise[]; error?: string }> {
  try {
    const response = await apiRequest<{ data: DbExercise[] }>(
      `/api/exercises?muscleGroup=${encodeURIComponent(muscleGroup)}`
    );
    return { data: response.data };
  } catch (error) {
    return { data: [], error: error instanceof Error ? error.message : 'Erro ao buscar exercicios.' };
  }
}

export async function fetchExerciseByName(name: string): Promise<{ data: DbExercise | null; error?: string }> {
  try {
    const response = await apiRequest<{ data: DbExercise[] }>(
      `/api/exercises?name=${encodeURIComponent(name)}`
    );
    return { data: response.data[0] ?? null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Erro ao buscar exercicio.' };
  }
}
