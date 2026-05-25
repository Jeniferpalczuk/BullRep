export type SetDraft = {
  id: string;
  reps: number;
  weight: number;
};

export type ExerciseDraft = {
  id: string;
  name: string;
  sets: SetDraft[];
};
