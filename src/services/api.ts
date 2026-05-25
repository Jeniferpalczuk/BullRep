/**
 * Ponto de entrada dos services BullRep.
 * Re-exporta os services para facilitar os imports.
 */

export { fetchSessions, createSession, updateSession, deleteSession } from './sessionService';
export { fetchExercises, fetchExercisesByGroup, fetchExerciseByName } from './exerciseService';
