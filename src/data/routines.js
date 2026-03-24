export const routines = [
  {
    id: 'fullbody-a',
    name: 'Full Body A',
    emoji: '🅰️',
    description: 'Entrenamiento completo para principiantes. Trabajás todo el cuerpo.',
    difficulty: 'Principiante',
    estimatedTime: '45-60 min',
    exercises: [
      { exerciseId: 'sentadilla', sets: 3, reps: '10' },
      { exerciseId: 'press-banca-barra', sets: 3, reps: '10' },
      { exerciseId: 'remo-barra', sets: 3, reps: '10' },
      { exerciseId: 'press-militar', sets: 3, reps: '10' },
      { exerciseId: 'curl-barra', sets: 2, reps: '12' },
      { exerciseId: 'extension-polea', sets: 2, reps: '12' },
      { exerciseId: 'plancha', sets: 3, reps: '30 seg' },
    ],
  },
  {
    id: 'fullbody-b',
    name: 'Full Body B',
    emoji: '🅱️',
    description: 'Segunda rutina completa. Alternala con Full Body A.',
    difficulty: 'Principiante',
    estimatedTime: '45-60 min',
    exercises: [
      { exerciseId: 'prensa-piernas', sets: 3, reps: '12' },
      { exerciseId: 'press-mancuernas', sets: 3, reps: '10' },
      { exerciseId: 'jalon-pecho', sets: 3, reps: '10' },
      { exerciseId: 'elevaciones-laterales', sets: 3, reps: '15' },
      { exerciseId: 'curl-mancuernas', sets: 2, reps: '12' },
      { exerciseId: 'fondos-banco', sets: 2, reps: '10' },
      { exerciseId: 'crunch', sets: 3, reps: '15' },
    ],
  },
  {
    id: 'push',
    name: 'Día de Empuje (Push)',
    emoji: '👊',
    description: 'Pecho, hombros y tríceps. Parte de la rutina Push/Pull/Legs.',
    difficulty: 'Intermedio',
    estimatedTime: '50-65 min',
    exercises: [
      { exerciseId: 'press-banca-barra', sets: 4, reps: '8' },
      { exerciseId: 'press-inclinado', sets: 3, reps: '10' },
      { exerciseId: 'aperturas-mancuernas', sets: 3, reps: '12' },
      { exerciseId: 'press-militar', sets: 3, reps: '10' },
      { exerciseId: 'elevaciones-laterales', sets: 3, reps: '15' },
      { exerciseId: 'extension-polea', sets: 3, reps: '12' },
      { exerciseId: 'press-frances', sets: 3, reps: '10' },
    ],
  },
  {
    id: 'pull',
    name: 'Día de Tirón (Pull)',
    emoji: '🤙',
    description: 'Espalda y bíceps. Parte de la rutina Push/Pull/Legs.',
    difficulty: 'Intermedio',
    estimatedTime: '50-65 min',
    exercises: [
      { exerciseId: 'dominadas-asistidas', sets: 4, reps: '8' },
      { exerciseId: 'remo-barra', sets: 3, reps: '10' },
      { exerciseId: 'jalon-pecho', sets: 3, reps: '10' },
      { exerciseId: 'remo-mancuerna', sets: 3, reps: '10' },
      { exerciseId: 'pajaros', sets: 3, reps: '15' },
      { exerciseId: 'curl-barra', sets: 3, reps: '10' },
      { exerciseId: 'curl-martillo', sets: 3, reps: '12' },
    ],
  },
  {
    id: 'legs',
    name: 'Día de Piernas',
    emoji: '🦵',
    description: 'Cuádriceps, isquiotibiales, glúteos y pantorrillas.',
    difficulty: 'Intermedio',
    estimatedTime: '50-65 min',
    exercises: [
      { exerciseId: 'sentadilla', sets: 4, reps: '8' },
      { exerciseId: 'prensa-piernas', sets: 3, reps: '10' },
      { exerciseId: 'peso-muerto-rumano', sets: 3, reps: '10' },
      { exerciseId: 'extension-cuadriceps', sets: 3, reps: '12' },
      { exerciseId: 'curl-piernas', sets: 3, reps: '12' },
      { exerciseId: 'zancadas', sets: 3, reps: '10 por pierna' },
      { exerciseId: 'pantorrillas', sets: 4, reps: '15' },
    ],
  },
  {
    id: 'upper',
    name: 'Tren Superior',
    emoji: '💪',
    description: 'Todo el torso: pecho, espalda, hombros y brazos.',
    difficulty: 'Principiante',
    estimatedTime: '50-60 min',
    exercises: [
      { exerciseId: 'press-mancuernas', sets: 3, reps: '10' },
      { exerciseId: 'jalon-pecho', sets: 3, reps: '10' },
      { exerciseId: 'press-militar', sets: 3, reps: '10' },
      { exerciseId: 'remo-mancuerna', sets: 3, reps: '10' },
      { exerciseId: 'elevaciones-laterales', sets: 3, reps: '15' },
      { exerciseId: 'curl-mancuernas', sets: 2, reps: '12' },
      { exerciseId: 'extension-polea', sets: 2, reps: '12' },
    ],
  },
  {
    id: 'lower',
    name: 'Tren Inferior',
    emoji: '🦵',
    description: 'Piernas completas y abdominales.',
    difficulty: 'Principiante',
    estimatedTime: '50-60 min',
    exercises: [
      { exerciseId: 'sentadilla', sets: 3, reps: '10' },
      { exerciseId: 'prensa-piernas', sets: 3, reps: '12' },
      { exerciseId: 'peso-muerto-rumano', sets: 3, reps: '10' },
      { exerciseId: 'extension-cuadriceps', sets: 3, reps: '12' },
      { exerciseId: 'curl-piernas', sets: 3, reps: '12' },
      { exerciseId: 'pantorrillas', sets: 3, reps: '15' },
      { exerciseId: 'plancha', sets: 3, reps: '30 seg' },
      { exerciseId: 'russian-twist', sets: 3, reps: '20' },
    ],
  },
];

export const weeklyPlans = [
  {
    id: 'principiante-3',
    name: '🌱 Plan Principiante',
    description: '3 días por semana. Ideal para arrancar.',
    days: [
      { day: 'Lunes', routineId: 'fullbody-a' },
      { day: 'Martes', routineId: null },
      { day: 'Miércoles', routineId: 'fullbody-b' },
      { day: 'Jueves', routineId: null },
      { day: 'Viernes', routineId: 'fullbody-a' },
      { day: 'Sábado', routineId: null },
      { day: 'Domingo', routineId: null },
    ],
  },
  {
    id: 'intermedio-4',
    name: '🌿 Plan Torso/Pierna',
    description: '4 días por semana. Cuando ya le agarraste la mano.',
    days: [
      { day: 'Lunes', routineId: 'upper' },
      { day: 'Martes', routineId: 'lower' },
      { day: 'Miércoles', routineId: null },
      { day: 'Jueves', routineId: 'upper' },
      { day: 'Viernes', routineId: 'lower' },
      { day: 'Sábado', routineId: null },
      { day: 'Domingo', routineId: null },
    ],
  },
  {
    id: 'ppl-6',
    name: '🔥 Plan Push/Pull/Legs',
    description: '6 días por semana. Para cuando seas un crack.',
    days: [
      { day: 'Lunes', routineId: 'push' },
      { day: 'Martes', routineId: 'pull' },
      { day: 'Miércoles', routineId: 'legs' },
      { day: 'Jueves', routineId: 'push' },
      { day: 'Viernes', routineId: 'pull' },
      { day: 'Sábado', routineId: 'legs' },
      { day: 'Domingo', routineId: null },
    ],
  },
];

export function getRoutineById(id) {
  return routines.find((r) => r.id === id);
}

export function getTodaySuggestion() {
  const dayIndex = new Date().getDay(); // 0=sun, 1=mon...
  // Default to principiante plan
  const plan = weeklyPlans[0];
  const dayMap = [6, 0, 1, 2, 3, 4, 5]; // sun→6, mon→0, etc.
  const planDay = plan.days[dayMap[dayIndex]];
  return planDay?.routineId ? getRoutineById(planDay.routineId) : null;
}
