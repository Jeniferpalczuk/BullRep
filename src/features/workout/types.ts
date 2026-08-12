export type SetDraft = {
  id: string;
  reps: number;
  weight: number;
};

export type ExerciseDraft = {
  id: string;
  name: string;
  muscleGroup?: string;
  sets: SetDraft[];
};

export type ExerciseSelection = {
  name: string;
  muscleGroup: string;
};
