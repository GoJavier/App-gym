const STORAGE_KEYS = {
  WORKOUTS: 'gymbuddy_workouts',
  PROFILE: 'gymbuddy_profile',
  STREAK: 'gymbuddy_streak',
};

export function getWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS)) || [];
  } catch {
    return [];
  }
}

export function saveWorkout(workout) {
  const workouts = getWorkouts();
  workouts.unshift(workout);
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  updateStreak();
  return workouts;
}

export function deleteWorkout(id) {
  const workouts = getWorkouts().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  return workouts;
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE)) || {
      name: '',
      startDate: new Date().toISOString(),
      totalWorkouts: 0,
    };
  } catch {
    return { name: '', startDate: new Date().toISOString(), totalWorkouts: 0 };
  }
}

export function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getStreak() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK)) || {
      current: 0,
      longest: 0,
      lastWorkoutDate: null,
    };
  } catch {
    return { current: 0, longest: 0, lastWorkoutDate: null };
  }
}

function updateStreak() {
  const streak = getStreak();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (streak.lastWorkoutDate === today) return streak;

  if (streak.lastWorkoutDate === yesterday) {
    streak.current += 1;
  } else {
    streak.current = 1;
  }

  streak.lastWorkoutDate = today;
  if (streak.current > streak.longest) streak.longest = streak.current;

  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  return streak;
}

export function getLevel(totalWorkouts) {
  const levels = [
    { min: 0, name: 'Semilla', emoji: '🌱', next: 6 },
    { min: 6, name: 'Brote', emoji: '🌿', next: 16 },
    { min: 16, name: 'Árbol', emoji: '🌳', next: 31 },
    { min: 31, name: 'Guerrero', emoji: '💪', next: 61 },
    { min: 61, name: 'Leyenda', emoji: '🔥', next: 101 },
    { min: 101, name: 'Máquina', emoji: '🏆', next: 200 },
  ];

  let level = levels[0];
  for (const l of levels) {
    if (totalWorkouts >= l.min) level = l;
  }

  const progress = Math.min(
    ((totalWorkouts - level.min) / (level.next - level.min)) * 100,
    100
  );

  return { ...level, progress, totalWorkouts };
}

export function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export function getMotivationalMessage() {
  const messages = [
    '¡Cada repetición te hace más fuerte! 💪',
    '¡Hoy entrenaste mejor que ayer!',
    '¡Tremendo entrenamiento! Tu cuerpo te lo agradece 🔥',
    '¡Otro día, otra victoria! Seguí así 🏆',
    '¡Sos imparable! El progreso se nota 💚',
    '¡Gran trabajo! La constancia es la clave del éxito',
    '¡Excelente sesión! Cada día más cerca de tu meta ⭐',
    '¡Lo diste todo! Descansá bien que el músculo crece durmiendo 😴',
    '¡Crack! Otro entrenamiento completado 🎯',
    '¡Eso es disciplina! No se trata de motivación, se trata de hábito',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getDailyTip() {
  const tips = [
    { title: 'Hidratación', text: 'Tomá al menos 2 litros de agua por día. Llevá una botella al gym y tomá entre series.' },
    { title: 'Descanso', text: 'Los músculos crecen mientras dormís. Intentá dormir 7-8 horas por noche.' },
    { title: 'Calentamiento', text: 'Siempre calentá 5-10 minutos antes de entrenar. Caminata rápida o bicicleta suave.' },
    { title: 'Proteínas', text: 'Comé proteína en cada comida: pollo, huevos, carne, legumbres, lácteos.' },
    { title: 'Peso correcto', text: 'Usá un peso que te cueste las últimas 2-3 repeticiones, pero que puedas hacer con buena forma.' },
    { title: 'Consistencia', text: 'Es mejor ir 3 veces por semana siempre, que ir 6 veces una semana y después no ir más.' },
    { title: 'No te compares', text: 'Todos empezamos de cero. Concentrate en tu propio progreso, no en el de los demás.' },
    { title: 'Respiración', text: 'Exhalá (largá el aire) cuando hacés fuerza, inhalá cuando bajás el peso.' },
    { title: 'Estiramiento', text: 'Estirá los músculos que trabajaste al final de cada sesión. 30 segundos por grupo muscular.' },
    { title: 'Preguntá', text: 'No tengas vergüenza de preguntar. Cualquier persona en el gym va a estar feliz de ayudarte.' },
    { title: 'Progresión', text: 'Intentá aumentar un poquito de peso cada semana. Aunque sea medio kilo, eso es progreso.' },
    { title: 'Forma primero', text: 'Mejor hacer 8 repeticiones con buena forma que 15 moviendo el peso de cualquier manera.' },
    { title: 'Paciencia', text: 'Los resultados visibles tardan 8-12 semanas. Confiá en el proceso.' },
    { title: 'Registro', text: '¡Ya estás usando esta app! Anotar tus ejercicios es clave para mejorar semana a semana.' },
  ];
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return tips[dayOfYear % tips.length];
}
