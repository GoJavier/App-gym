import { getWorkouts, getStreak, getLevel, getGreeting, getDailyTip, getWeekPlan } from '../utils/storage';
import { getTodaySuggestion, getRoutineById } from '../data/routines';

export default function Home({ navigate, startWorkout, mode, onToggleMode }) {
  const workouts = getWorkouts();
  const streak = getStreak();
  const level = getLevel(workouts.length);
  const greeting = getGreeting();
  const tip = getDailyTip();
  const lastWorkout = workouts[0];

  // Use custom week plan if available, otherwise fallback to mode-based suggestion
  const savedPlan = getWeekPlan();
  let todayRoutine = null;
  let todayMode = null;
  if (savedPlan?.plan) {
    const jsDay = new Date().getDay();
    const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
    const todayEntry = savedPlan.plan[todayIdx];
    if (todayEntry?.routineId) {
      todayRoutine = getRoutineById(todayEntry.routineId);
      todayMode = todayEntry.mode;
    }
  } else {
    todayRoutine = getTodaySuggestion(mode);
  }

  return (
    <div className="fade-in">
      <div className="home-greeting">{greeting} 💪</div>
      <div className="home-date">
        {new Date().toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'gym' ? 'active' : ''}`}
          onClick={() => onToggleMode('gym')}
        >
          🏋️ Gimnasio
        </button>
        <button
          className={`mode-btn ${mode === 'home' ? 'active' : ''}`}
          onClick={() => onToggleMode('home')}
        >
          🏠 En Casa
        </button>
      </div>
      {mode === 'home' && (
        <div className="mode-info">
          Mancuernas, cosas de tu casa y tu propio cuerpo 💪
        </div>
      )}

      {/* Level Card */}
      <div className="card card-accent">
        <div className="level-card">
          <div className="level-emoji">{level.emoji}</div>
          <div className="level-name">Nivel: {level.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {workouts.length} {workouts.length === 1 ? 'entrenamiento' : 'entrenamientos'} completados
          </div>
          <div className="level-progress">
            <div
              className="level-progress-bar"
              style={{ width: `${level.progress}%` }}
            />
          </div>
          <div className="level-xp">
            {workouts.length} / {level.next} para el siguiente nivel
          </div>
        </div>
      </div>

      {/* Streak */}
      {streak.current > 0 && (
        <div className="card">
          <div className="streak-card">
            <div>
              <div className="streak-number">🔥 {streak.current}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>
                {streak.current === 1 ? 'día seguido' : 'días seguidos'}
              </div>
              <div className="streak-label">
                Racha máxima: {streak.longest} {streak.longest === 1 ? 'día' : 'días'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's suggestion */}
      {todayRoutine ? (
        <div>
          <div className="section-title">🎯 Hoy te toca</div>
          <div className="card" onClick={() => startWorkout(todayRoutine.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {todayRoutine.emoji} {todayRoutine.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {todayRoutine.description}
                </div>
                {todayMode && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: 4 }}>
                    {todayMode === 'home' ? '🏠 En casa' : '🏋️ Gimnasio'}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '1.5rem' }}>▶️</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>😴</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Hoy es día de descanso</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Aprovechá para estirar y descansar. ¡Los músculos crecen descansando!
          </div>
        </div>
      )}

      <button
        className="btn btn-primary start-btn"
        onClick={() => navigate('routines')}
      >
        💪 Empezar Entrenamiento
      </button>

      {/* Last workout summary */}
      {lastWorkout && (
        <div>
          <div className="section-title">📝 Último entrenamiento</div>
          <div className="card" style={{ cursor: 'default' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {lastWorkout.routineName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {new Date(lastWorkout.date).toLocaleDateString('es-AR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
              {' · '}
              {lastWorkout.exercises.length} ejercicios
              {' · '}
              {lastWorkout.totalSets} series
            </div>
          </div>
        </div>
      )}

      {/* Tip of the day */}
      <div className="section-title">💡 Consejo del día</div>
      <div className="card">
        <div className="tip-card">
          <div className="tip-icon">💡</div>
          <div className="tip-text">
            <strong>{tip.title}:</strong> {tip.text}
          </div>
        </div>
      </div>
    </div>
  );
}
