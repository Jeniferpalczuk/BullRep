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
  { id: 'biceps', name: 'B?ceps', imageUrl: 'https://images.pexels.com/photos/136405/pexels-photo-136405.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'triceps', name: 'Tr?ceps', imageUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'chest', name: 'Peito', imageUrl: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'shoulders', name: 'Ombro', imageUrl: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'trapezius', name: 'Trap?zio', imageUrl: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'back', name: 'Costas', imageUrl: 'https://images.pexels.com/photos/2261485/pexels-photo-2261485.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'forearms', name: 'Antebra?o', imageUrl: 'https://images.pexels.com/photos/791763/pexels-photo-791763.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'abs', name: 'Abd?men', imageUrl: 'https://images.pexels.com/photos/4720260/pexels-photo-4720260.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'legs', name: 'Pernas', imageUrl: 'https://images.pexels.com/photos/1462364/pexels-photo-1462364.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'calves', name: 'Panturrilhas', imageUrl: 'https://images.pexels.com/photos/7674497/pexels-photo-7674497.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 'glutes', name: 'Gl?teos', imageUrl: 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=800' },
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

export const EXERCISES: ExerciseItem[] = [
  // BÍCEPS
  make('biceps-barbell-curl', 'Rosca Direta com Barra', 'biceps', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/biceps/barbell', undefined, undefined, ['Pegada supinada na barra', 'Cotovelos fixos ao lado', 'Suba controlando', 'Desça lentamente']),
  make('biceps-ez-preacher-curl', 'Rosca Scott com Barra EZ', 'biceps', 'Barra', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/biceps/barbell', undefined, undefined, ['Apoie os braços no banco Scott', 'Suba contraindo bíceps', 'Sem tirar cotovelo do apoio', 'Retorne devagar']),
  make('biceps-reverse-curl-barbell', 'Rosca Inversa com Barra', 'biceps', 'Barra', 'Avançado', 'https://musclewiki.com/pt-br/exercises/biceps/barbell', undefined, undefined, ['Pegada pronada', 'Suba sem balançar', 'Mantenha punhos firmes', 'Desça controlando']),
  make('biceps-incline-curl', 'Rosca Inclinada com Halteres', 'biceps', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/biceps/dumbbells', undefined, undefined, ['Banco inclinado', 'Braços estendidos para baixo', 'Suba sem mover ombro', 'Retorne com controle']),
  make('biceps-hammer-curl', 'Rosca Martelo com Halteres', 'biceps', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/biceps/dumbbells', undefined, undefined, ['Pegada neutra', 'Suba os halteres', 'Sem impulso', 'Desça devagar']),
  make('biceps-preacher-dumbbell', 'Rosca Scott com Halteres', 'biceps', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/biceps/dumbbells', undefined, undefined, ['Braços no apoio', 'Suba até contrair', 'Pausa curta', 'Desça lentamente']),
  make('biceps-chin-up', 'Barra Fixa Supinada (Chin Up)', 'biceps', 'Peso corporal', 'Médio', undefined, undefined, undefined, ['Pegada supinada', 'Suba até o queixo passar', 'Controle a descida', 'Evite balanço']),
  make('biceps-australian-row', 'Remada Australiana Supinada', 'biceps', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Corpo alinhado sob a barra', 'Puxe o peito à barra', 'Segure 1s no topo', 'Desça controlado']),

  // TRÍCEPS
  make('triceps-close-grip-bench', 'Supino Fechado com Barra', 'triceps', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/triceps/barbell', undefined, undefined, ['Pegada mais fechada', 'Desça ao peito', 'Empurre estendendo cotovelos', 'Mantenha controle']),
  make('triceps-skullcrusher-barbell', 'Tríceps Testa com Barra', 'triceps', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/triceps/barbell', undefined, undefined, ['Deite no banco', 'Leve barra à testa', 'Cotovelos estáveis', 'Estenda os braços']),
  make('triceps-french-press-barbell', 'Tríceps Francês com Barra', 'triceps', 'Barra', 'Avançado', 'https://musclewiki.com/pt-br/exercises/triceps/barbell', undefined, undefined, ['Barra acima da cabeça', 'Desça atrás da nuca', 'Sem abrir cotovelos', 'Suba com controle']),
  make('triceps-skullcrusher-dumbbell', 'Tríceps Testa com Halteres', 'triceps', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/triceps/dumbbells', undefined, undefined, ['Deite no banco', 'Halteres acima do peito', 'Desça até lateral da cabeça', 'Estenda controlando']),
  make('triceps-overhead-dumbbell', 'Tríceps Acima da Cabeça com Halter', 'triceps', 'Halteres', 'Médio', 'https://musclewiki.com/pt-br/exercises/triceps/dumbbells', undefined, undefined, ['Halter sobre a cabeça', 'Desça atrás da nuca', 'Cotovelos fixos', 'Suba contraindo']),
  make('triceps-decline-skullcrusher-db', 'Tríceps Testa Declinado com Halteres', 'triceps', 'Halteres', 'Médio', 'https://musclewiki.com/pt-br/exercises/triceps/dumbbells', undefined, undefined, ['Banco declinado', 'Desça aos lados da testa', 'Controle o movimento', 'Suba até estender']),
  make('triceps-diamond-pushup', 'Flexão Diamante', 'triceps', 'Peso corporal', 'Médio', undefined, undefined, undefined, ['Mãos em formato diamante', 'Desça com cotovelos próximos', 'Core firme', 'Empurre até estender']),
  make('triceps-bench-dips', 'Mergulho no Banco', 'triceps', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Mãos no banco atrás do corpo', 'Desça flexionando cotovelos', 'Suba controlando', 'Repita sem pressa']),

  // PEITO
  make('chest-bench-press', 'Supino Reto com Barra', 'chest', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/chest/barbell', undefined, undefined, ['Pés firmes no chão', 'Desça ao centro do peito', 'Empurre em linha reta', 'Desça devagar']),
  make('chest-incline-bench-press', 'Supino Inclinado com Barra', 'chest', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/chest/barbell', undefined, undefined, ['Banco inclinado', 'Desça na linha clavicular', 'Empurre controlando', 'Mantenha escápulas fixas']),
  make('chest-floor-press-barbell', 'Floor Press com Barra', 'chest', 'Barra', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/chest/barbell', undefined, undefined, ['Deite no chão', 'Desça até cotovelos tocarem levemente', 'Empurre para cima', 'Controle a descida']),
  make('chest-db-bench', 'Supino com Halteres', 'chest', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/chest/dumbbells', undefined, undefined, ['Halteres na linha do peito', 'Suba até quase estender', 'Sem bater halteres no topo', 'Desça devagar']),
  make('chest-db-fly', 'Crucifixo com Halteres', 'chest', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/chest/dumbbells', undefined, undefined, ['Braços semi-flexionados', 'Abra controlando', 'Feche contraindo peitoral', 'Não force ombros']),
  make('chest-db-pullover', 'Pullover com Halter', 'chest', 'Halteres', 'Médio', 'https://musclewiki.com/pt-br/exercises/chest/dumbbells', undefined, undefined, ['Halter acima do peito', 'Leve atrás da cabeça', 'Retorne com peitoral ativo', 'Movimento suave']),
  make('chest-pushup', 'Flexão Tradicional', 'chest', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Mãos na largura dos ombros', 'Corpo alinhado', 'Desça controlado', 'Empurre até o topo']),
  make('chest-incline-pushup', 'Flexão Inclinada', 'chest', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Mãos em superfície elevada', 'Corpo alinhado', 'Desça até perto do apoio', 'Empurre de volta']),

  // OMBRO
  make('shoulder-ohp-barbell', 'Desenvolvimento Militar com Barra', 'shoulders', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/front-shoulders/barbell', undefined, undefined, ['Barra nos ombros', 'Core firme', 'Empurre acima da cabeça', 'Desça controlado']),
  make('shoulder-push-press', 'Push Press com Barra', 'shoulders', 'Barra', 'Avançado', 'https://musclewiki.com/pt-br/exercises/front-shoulders/barbell', undefined, undefined, ['Pequena flexão de joelhos', 'Impulsione a barra para cima', 'Trave no topo', 'Retorne com controle']),
  make('shoulder-front-raise-barbell', 'Elevação Frontal com Barra', 'shoulders', 'Barra', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/front-shoulders/barbell', undefined, undefined, ['Barra à frente da coxa', 'Eleve até a linha dos ombros', 'Sem balanço', 'Desça lentamente']),
  make('shoulder-lateral-raise-db', 'Elevação Lateral com Halteres', 'shoulders', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/front-shoulders/dumbbells', undefined, undefined, ['Halteres ao lado do corpo', 'Suba até linha do ombro', 'Sem impulso', 'Retorne devagar']),
  make('shoulder-front-raise-db', 'Elevação Frontal com Halteres', 'shoulders', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/front-shoulders/dumbbells', undefined, undefined, ['Eleve alternando braços', 'Mantenha tronco estável', 'Subida controlada', 'Desça lentamente']),
  make('shoulder-arnold-press', 'Arnold Press', 'shoulders', 'Halteres', 'Médio', 'https://musclewiki.com/pt-br/exercises/front-shoulders/dumbbells', undefined, undefined, ['Inicie com halteres à frente do rosto', 'Gire e empurre para cima', 'Controle a volta', 'Mantenha core ativo']),
  make('shoulder-pike-pushup', 'Pike Push Up', 'shoulders', 'Peso corporal', 'Médio', undefined, undefined, undefined, ['Forme um V invertido', 'Desça a cabeça entre as mãos', 'Empurre para cima', 'Mantenha quadril elevado']),
  make('shoulder-handstand-pushup', 'Handstand Push Up', 'shoulders', 'Peso corporal', 'Avançado', undefined, undefined, undefined, ['Apoie em parede', 'Desça controlando', 'Empurre até estender', 'Mantenha alinhamento']),

  // TRAPÉZIO
  make('traps-shrug-barbell', 'Encolhimento com Barra', 'trapezius', 'Barra', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/traps-middle/barbell', undefined, undefined, ['Segure a barra em pé', 'Eleve os ombros', 'Pausa no topo', 'Desça controlando']),
  make('traps-high-pull-barbell', 'Barbell High Pull', 'trapezius', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/traps-middle/barbell', undefined, undefined, ['Puxe a barra em direção ao peito', 'Cotovelos altos', 'Controle o retorno', 'Mantenha coluna neutra']),
  make('traps-upright-row-barbell', 'Remada Alta com Barra', 'trapezius', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/traps-middle/barbell', undefined, undefined, ['Pegada média', 'Puxe até altura do peito', 'Sem girar punhos', 'Desça controlando']),
  make('traps-shrug-db', 'Encolhimento com Halteres', 'trapezius', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/traps-middle/dumbbells', undefined, undefined, ['Halteres ao lado do corpo', 'Eleve os ombros', 'Segure 1s no topo', 'Desça devagar']),
  make('traps-db-upright-row', 'Remada Alta com Halteres', 'trapezius', 'Halteres', 'Médio', 'https://musclewiki.com/pt-br/exercises/traps-middle/dumbbells', undefined, undefined, ['Puxe halteres ao peito', 'Cotovelos apontam para fora', 'Controle na descida', 'Sem impulso']),
  make('traps-prone-y', 'Prone Y Raise', 'trapezius', 'Peso corporal', 'Médio', undefined, undefined, undefined, ['Deite inclinado', 'Eleve braços em Y', 'Ative trapézio médio', 'Retorne com controle']),

  // COSTAS
  make('back-row-barbell', 'Remada Curvada com Barra', 'back', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/lats/barbell', undefined, undefined, ['Incline tronco com coluna neutra', 'Puxe a barra ao abdômen', 'Aproxime escápulas', 'Desça controlado']),
  make('back-pendlay-row', 'Pendlay Row', 'back', 'Barra', 'Avançado', 'https://musclewiki.com/pt-br/exercises/lats/barbell', undefined, undefined, ['Barra no chão a cada repetição', 'Puxe explosivo até tronco', 'Tronco firme', 'Retorne ao chão']),
  make('back-deadlift', 'Levantamento Terra com Barra', 'back', 'Barra', 'Avançado', 'https://musclewiki.com/pt-br/exercises/lowerback/barbell', undefined, undefined, ['Barra próxima das canelas', 'Suba estendendo quadril e joelhos', 'Lombar neutra', 'Desça controlando']),
  make('back-one-arm-row-db', 'Remada Unilateral com Halter', 'back', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/lats/dumbbells', undefined, undefined, ['Apoie mão no banco', 'Puxe halter ao quadril', 'Sem girar tronco', 'Desça devagar']),
  make('back-db-pullover', 'Pullover com Halter', 'back', 'Halteres', 'Médio', 'https://musclewiki.com/pt-br/exercises/lats/dumbbells', undefined, undefined, ['Halter acima do peito', 'Leve atrás da cabeça', 'Puxe de volta com dorsais', 'Movimento controlado']),
  make('back-db-romanian-deadlift', 'Levantamento Romeno com Halteres', 'back', 'Halteres', 'Médio', 'https://musclewiki.com/pt-br/exercises/lowerback/dumbbells', undefined, undefined, ['Halteres próximos das coxas', 'Desça mantendo coluna neutra', 'Suba contraindo posterior/lombar', 'Sem curvar costas']),
  make('back-pull-up', 'Pull Up', 'back', 'Peso corporal', 'Avançado', undefined, undefined, undefined, ['Pegada pronada na barra', 'Puxe até passar o queixo', 'Desça com controle', 'Evite balanço']),
  make('back-superman', 'Superman', 'back', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Deite de barriga para baixo', 'Eleve braços e pernas', 'Segure 1s', 'Retorne devagar']),

  // ANTEBRAÇO
  make('forearm-reverse-curl-bar', 'Rosca Inversa com Barra', 'forearms', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/forearms/barbell', undefined, undefined, ['Pegada pronada', 'Flexione cotovelos', 'Punhos firmes', 'Desça lentamente']),
  make('forearm-wrist-curl-bar', 'Rosca de Punho com Barra', 'forearms', 'Barra', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/forearms/barbell', undefined, undefined, ['Antebraços apoiados', 'Flexione punhos para cima', 'Pausa no topo', 'Desça devagar']),
  make('forearm-reverse-wrist-curl-bar', 'Rosca Inversa de Punho com Barra', 'forearms', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/forearms/barbell', undefined, undefined, ['Pegada pronada', 'Suba o dorso da mão', 'Controle punho', 'Retorne lentamente']),
  make('forearm-wrist-curl-db', 'Rosca de Punho com Halter', 'forearms', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/forearms/dumbbells', undefined, undefined, ['Apoie antebraços no banco', 'Suba os punhos', 'Segure no topo', 'Desça controlando']),
  make('forearm-reverse-curl-db', 'Rosca Inversa com Halteres', 'forearms', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/forearms/dumbbells', undefined, undefined, ['Pegada pronada', 'Suba sem abrir cotovelos', 'Controle no topo', 'Desça lentamente']),
  make('forearm-dead-hang', 'Dead Hang', 'forearms', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Pendure-se na barra', 'Ative escápulas', 'Segure o tempo', 'Respiração controlada']),

  // ABDÔMEN
  make('abs-rollout-barbell', 'Rollout com Barra', 'abs', 'Barra', 'Avançado', 'https://musclewiki.com/pt-br/exercises/abdominals/barbell', undefined, undefined, ['Ajoelhe e segure barra com anilhas', 'Role à frente com core ativo', 'Evite arquear lombar', 'Retorne contraindo abdômen']),
  make('abs-landmine-twist', 'Landmine Twist com Barra', 'abs', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/abdominals/barbell', undefined, undefined, ['Segure ponta da barra', 'Gire de um lado para outro', 'Quadril estável', 'Movimento controlado']),
  make('abs-situp-barbell', 'Sit Up com Barra', 'abs', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/abdominals/barbell', undefined, undefined, ['Deite com barra leve no peito', 'Suba o tronco', 'Desça sem soltar controle', 'Core firme']),
  make('abs-russian-twist-db', 'Russian Twist com Halter', 'abs', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/abdominals/dumbbells', undefined, undefined, ['Tronco inclinado', 'Gire para cada lado', 'Core ativo', 'Respire no ritmo']),
  make('abs-side-bend-db', 'Flexão Lateral com Halter', 'abs', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/abdominals/dumbbells', undefined, undefined, ['Halter em uma mão', 'Incline para o lado do peso', 'Retorne ao centro', 'Alterne lados']),
  make('abs-hanging-knee-raise', 'Elevação de Joelhos na Barra', 'abs', 'Peso corporal', 'Médio', undefined, undefined, undefined, ['Pendure-se na barra', 'Eleve joelhos ao tronco', 'Sem embalo', 'Desça devagar']),
  make('abs-plank', 'Prancha', 'abs', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Corpo alinhado', 'Abdômen contraído', 'Respiração controlada', 'Mantenha tempo alvo']),

  // PERNAS
  make('legs-squat-barbell', 'Agachamento com Barra', 'legs', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/quads/barbell', undefined, undefined, ['Barra no trapézio', 'Desça com joelhos alinhados', 'Mantenha peito aberto', 'Suba com controle']),
  make('legs-front-squat-barbell', 'Front Squat com Barra', 'legs', 'Barra', 'Avançado', 'https://musclewiki.com/pt-br/exercises/quads/barbell', undefined, undefined, ['Barra na frente dos ombros', 'Cotovelos altos', 'Desça com tronco ereto', 'Suba empurrando o chão']),
  make('legs-hack-squat-barbell', 'Hack Squat com Barra', 'legs', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/quads/barbell', undefined, undefined, ['Barra atrás das pernas', 'Agache com amplitude segura', 'Suba controlando', 'Mantenha lombar neutra']),
  make('legs-lunge-db', 'Afundo com Halteres', 'legs', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/quads/dumbbells', undefined, undefined, ['Passo à frente', 'Desça os dois joelhos', 'Tronco neutro', 'Retorne e alterne']),
  make('legs-goblet-squat', 'Goblet Squat', 'legs', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/quads/dumbbells', undefined, undefined, ['Halter junto ao peito', 'Desça com quadril para trás', 'Joelhos acompanham ponta dos pés', 'Suba com controle']),
  make('legs-step-up-db', 'Step Up com Halteres', 'legs', 'Halteres', 'Médio', 'https://musclewiki.com/pt-br/exercises/quads/dumbbells', undefined, undefined, ['Suba em banco/plataforma', 'Empurre pela perna da frente', 'Desça controlando', 'Alterne pernas']),
  make('legs-bodyweight-squat', 'Agachamento Livre', 'legs', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Pés na largura dos ombros', 'Desça com controle', 'Core firme', 'Suba sem perder postura']),
  make('legs-jump-squat', 'Agachamento com Salto', 'legs', 'Peso corporal', 'Médio', undefined, undefined, undefined, ['Desça em agachamento', 'Salte explosivo', 'Aterre suave', 'Repita com ritmo']),

  // PANTURRILHAS
  make('calves-standing-barbell', 'Panturrilha em Pé com Barra', 'calves', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/calves/barbell', undefined, undefined, ['Barra nos ombros', 'Suba na ponta dos pés', 'Pausa no topo', 'Desça completo']),
  make('calves-seated-barbell', 'Panturrilha Sentado com Barra', 'calves', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/calves/barbell', undefined, undefined, ['Barra apoiada nas coxas', 'Eleve calcanhares', 'Segure 1s no topo', 'Desça devagar']),
  make('calves-donkey-barbell', 'Donkey Calf Raise com Barra', 'calves', 'Barra', 'Avançado', 'https://musclewiki.com/pt-br/exercises/calves/barbell', undefined, undefined, ['Incline tronco', 'Eleve calcanhares', 'Contraia panturrilha', 'Retorne controlado']),
  make('calves-standing-db', 'Panturrilha em Pé com Halteres', 'calves', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/calves/dumbbells', undefined, undefined, ['Halteres ao lado do corpo', 'Suba na ponta dos pés', 'Pausa no topo', 'Desça devagar']),
  make('calves-seated-db', 'Panturrilha Sentado com Halteres', 'calves', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/calves/dumbbells', undefined, undefined, ['Sente e apoie halteres nas coxas', 'Eleve calcanhares', 'Controle o topo', 'Desça lentamente']),
  make('calves-single-leg', 'Panturrilha Unilateral', 'calves', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Apoie-se em uma perna', 'Suba na ponta do pé', 'Mantenha equilíbrio', 'Desça controlando']),

  // GLÚTEOS
  make('glutes-hip-thrust-bar', 'Hip Thrust com Barra', 'glutes', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/glutes/barbell', undefined, undefined, ['Escápulas no banco', 'Barra sobre quadril', 'Suba contraindo glúteos', 'Desça com controle']),
  make('glutes-barbell-glute-bridge', 'Glute Bridge com Barra', 'glutes', 'Barra', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/glutes/barbell', undefined, undefined, ['Deite no chão', 'Barra sobre quadril', 'Suba o quadril', 'Retorne lentamente']),
  make('glutes-barbell-rdl', 'Levantamento Romeno com Barra', 'glutes', 'Barra', 'Médio', 'https://musclewiki.com/pt-br/exercises/glutes/barbell', undefined, undefined, ['Barra próxima das coxas', 'Desça com quadril para trás', 'Sinta alongar glúteos', 'Suba contraindo']),
  make('glutes-hip-thrust-db', 'Hip Thrust com Halter', 'glutes', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/glutes/dumbbells', undefined, undefined, ['Halter no quadril', 'Suba o quadril', 'Contraia no topo', 'Desça controlando']),
  make('glutes-bulgarian-db', 'Agachamento Búlgaro com Halteres', 'glutes', 'Halteres', 'Médio', 'https://musclewiki.com/pt-br/exercises/glutes/dumbbells', undefined, undefined, ['Pé traseiro elevado', 'Desça em linha reta', 'Empurre com perna da frente', 'Alterne lados']),
  make('glutes-db-sumo-squat', 'Sumô com Halter', 'glutes', 'Halteres', 'Iniciante', 'https://musclewiki.com/pt-br/exercises/glutes/dumbbells', undefined, undefined, ['Pés mais abertos', 'Halter entre as pernas', 'Desça com joelhos para fora', 'Suba contraindo glúteos']),
  make('glutes-glute-bridge-bodyweight', 'Glute Bridge', 'glutes', 'Peso corporal', 'Iniciante', undefined, undefined, undefined, ['Deite com joelhos flexionados', 'Suba o quadril', 'Contraia glúteos', 'Desça lentamente']),
  make('glutes-single-leg-bridge', 'Glute Bridge Unilateral', 'glutes', 'Peso corporal', 'Médio', undefined, undefined, undefined, ['Uma perna elevada', 'Empurre com a perna de apoio', 'Suba o quadril', 'Desça controlando']),
];
