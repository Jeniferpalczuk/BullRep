export type MuscleGroup = {
  id:
    | 'biceps'
    | 'triceps'
    | 'chest'
    | 'shoulders'
    | 'trapezius'
    | 'back'
    | 'forearms'
    | 'abs'
    | 'legs'
    | 'calves'
    | 'glutes';
  name: string;
  imageUrl?: string;
};

export type ExerciseLevel = 'Iniciante' | 'Médio' | 'Avançado';
export type Equipment = 'Barra' | 'Halteres' | 'Peso corporal';

export type ExerciseItem = {
  id: string;
  name: string;
  muscleId: MuscleGroup['id'];
  muscleName: string;
  level: ExerciseLevel;
  equipment: Equipment;
  sourceUrl?: string;
  imageStartUrl?: string;
  imageEndUrl?: string;
  steps: string[];
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 'biceps', name: 'Bíceps', imageUrl: 'https://images.pexels.com/photos/136405/pexels-photo-136405.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'triceps', name: 'Tríceps', imageUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'chest', name: 'Peito', imageUrl: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'shoulders', name: 'Ombro', imageUrl: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'trapezius', name: 'Trapézio', imageUrl: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'back', name: 'Costas', imageUrl: 'https://images.pexels.com/photos/2261485/pexels-photo-2261485.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'forearms', name: 'Antebraço', imageUrl: 'https://images.pexels.com/photos/791763/pexels-photo-791763.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'abs', name: 'Abdômen', imageUrl: 'https://images.pexels.com/photos/4720260/pexels-photo-4720260.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'legs', name: 'Pernas', imageUrl: 'https://images.pexels.com/photos/1462364/pexels-photo-1462364.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'calves', name: 'Panturrilhas', imageUrl: 'https://images.pexels.com/photos/7674497/pexels-photo-7674497.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'glutes', name: 'Glúteos', imageUrl: 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

const by = (id: MuscleGroup['id']) => MUSCLE_GROUPS.find((m) => m.id === id)?.name || '';

const make = (
  id: string,
  name: string,
  muscleId: MuscleGroup['id'],
  equipment: Equipment,
  level: ExerciseLevel,
  sourceUrl: string | undefined,
  imageStartUrl: string | undefined,
  imageEndUrl: string | undefined,
  steps: string[]
): ExerciseItem => ({
  id,
  name,
  muscleId,
  muscleName: by(muscleId),
  equipment,
  level,
  sourceUrl,
  imageStartUrl,
  imageEndUrl,
  steps,
});

const EXERCISE_NAMES_BY_GROUP: Record<MuscleGroup['id'], string[]> = {
  biceps: [
    'Rosca direta barra', 'Rosca direta W', 'Rosca alternada', 'Rosca martelo', 'Rosca concentrada',
    'Rosca scott', 'Rosca spider', 'Rosca inversa', 'Rosca 21', 'Rosca no cabo',
    'Rosca unilateral no cross', 'Chin up (barra fixa supinada)', 'Rosca banco inclinado',
    'Rosca zottman', 'Rosca preacher',
  ],
  triceps: [
    'Tríceps pulley barra reta', 'Tríceps pulley corda', 'Tríceps francês', 'Tríceps testa', 'Supino fechado',
    'Paralelas', 'Coice de tríceps', 'Tríceps unilateral no cross', 'Tríceps banco',
    'Extensão acima da cabe?a', 'Mergulho entre bancos', 'Flexão diamante',
  ],
  chest: [
    'Supino reto', 'Supino inclinado', 'Supino declinado', 'Crucifixo reto', 'Crucifixo inclinado',
    'Crucifixo no cross', 'Peck deck', 'Flexão de braço', 'Flexão inclinada', 'Flexão declinada',
    'Crossover polia alta', 'Crossover polia baixa', 'Pullover', 'Chest press máquina',
  ],
  shoulders: [
    'Desenvolvimento militar', 'Desenvolvimento halter', 'Elevação lateral', 'Elevação frontal',
    'Desenvolvimento arnold', 'Remada alta', 'Crucifixo inverso', 'Face pull',
    'Elevação lateral no cabo', 'Desenvolvimento máquina', 'Handstand push-up',
    'Encolhimento com halteres frontal',
  ],
  trapezius: [
    'Encolhimento barra', 'Encolhimento halteres', 'Encolhimento smith', 'Remada alta',
    'Farmer walk', 'Face pull', 'Levantamento terra', 'High pull', 'Trap bar shrug',
  ],
  back: [
    'Puxada frente', 'Puxada supinada', 'Barra fixa', 'Remada curvada', 'Remada cavalinho',
    'Remada unilateral', 'Remada baixa', 'Pulldown', 'Serrote', 'Levantamento terra',
    'Rack pull', 'Pullover no cabo', 'Remada T-bar', 'Remada máquina', 'Pull up pronado', 'Chin up',
  ],
  forearms: [
    'Rosca punho', 'Rosca punho inversa', 'Farmer walk', 'Dead hang', 'Rosca martelo',
    'Hand gripper', 'Wrist roller', 'Flexão dos dedos', 'Extensão dos dedos',
    'Pegada na barra fixa', 'Reverse curl',
  ],
  abs: [
    'Abdominal tradicional', 'Crunch', 'Infra', 'Elevação de pernas', 'Prancha',
    'Prancha lateral', 'Ab wheel', 'Russian twist', 'Mountain climber', 'Bicicleta no solo',
    'Sit-up', 'Abdominal no cabo', 'Hollow body hold', 'Toes to bar', 'Vacuum abdominal',
  ],
  legs: [
    'Agachamento livre', 'Agachamento frontal', 'Leg press', 'Cadeira extensora', 'Cadeira flexora',
    'Stiff', 'Terra romeno', 'Afundo', 'Passada', 'Bulgarian squat', 'Hack squat', 'Sissy squat',
    'Avanço', 'Good morning', 'Step up', 'Agachamento sumô',
  ],
  calves: [
    'Panturrilha em pé', 'Panturrilha sentado', 'Panturrilha no leg press', 'Panturrilha unilateral',
    'Elevação na escada', 'Donkey calf raise', 'Saltos pliométricos', 'Pular corda',
  ],
  glutes: [
    'Elevação pélvica', 'Hip thrust', 'Coice no cabo', 'Glute bridge', 'Agachamento sumô', 'Stiff',
    'Afundo', 'Passada', 'Cadeira abdutora', 'Bulgarian squat', 'Step up', 'Terra romeno',
    'Kickback máquina', 'Frog pump', 'Agachamento búlgaro',
  ],
};
const inferEquipment = (name: string): Equipment => {
  const lower = name.toLowerCase();
  if (
    lower.includes('barra') ||
    lower.includes('smith') ||
    lower.includes('cabo') ||
    lower.includes('cross') ||
    lower.includes('máquina') ||
    lower.includes('maquina') ||
    lower.includes('leg press') ||
    lower.includes('pulley') ||
    lower.includes('polia')
  ) {
    return 'Barra';
  }
  if (lower.includes('halter') || lower.includes('halteres') || lower.includes('dumbbell')) {
    return 'Halteres';
  }
  return 'Peso corporal';
};
const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
export const EXERCISES: ExerciseItem[] = Object.entries(EXERCISE_NAMES_BY_GROUP).flatMap(
  ([muscleId, names]) =>
    names.map((name) =>
      make(
        `${muscleId}-${slugify(name)}`,
        name,
        muscleId as MuscleGroup['id'],
        inferEquipment(name),
        'Médio',
        undefined,
        undefined,
        undefined,
        ['Ajuste postura e carga.', 'Execute com controle.', 'Mantenha a técnica.', 'Finalize com segurança.']
      )
    )
);
