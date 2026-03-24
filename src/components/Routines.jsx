import { routines, homeRoutines, weeklyPlans, homeWeeklyPlans, getRoutineById } from '../data/routines';
import { getExerciseById } from '../data/exercises';

export default function Routines({ startWorkout, mode, onToggleMode }) {
  const activeRoutines = mode === 'home' ? homeRoutines : routines;
  const activePlans = mode === 'home' ? homeWeeklyPlans : weeklyPlans;

  return (
    <div className="fade-in">
      <div className="section-title">💪 Elegí tu rutina</div>
      <div className="section-subtitle">
        Tocá una rutina para empezar a entrenar
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

      {activeRoutines.map((routine) => (
        <div
          key={routine.id}
          className="card routine-card"
          onClick={() => startWorkout(routine.id)}
        >
          <div className="routine-header">
            <div className="routine-name">
              {routine.emoji} {routine.name}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="badge badge-accent">{routine.difficulty}</span>
              <span className="badge badge-info">{routine.estimatedTime}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
            {routine.description}
          </div>
          <div className="routine-exercises">
            {routine.exercises.map((ex, i) => {
              const exercise = getExerciseById(ex.exerciseId);
              return (
                <span key={ex.exerciseId}>
                  {exercise?.emoji} {exercise?.name}
                  {' (' + ex.sets + '×' + ex.reps + ')'}
                  {i < routine.exercises.length - 1 ? '  ·  ' : ''}
                </span>
              );
            })}
          </div>
          <button
            className="btn btn-primary mt-16"
            onClick={(e) => {
              e.stopPropagation();
              startWorkout(routine.id);
            }}
          >
            ▶️ Empezar
          </button>
        </div>
      ))}

      {/* Weekly Plans */}
      <div className="plans-section">
        <div className="section-title">📅 Planes semanales</div>
        <div className="section-subtitle">
          Organizá tu semana con estos planes probados
        </div>

        {activePlans.map((plan) => (
          <div key={plan.id} className="card plan-card">
            <div className="plan-name">{plan.name}</div>
            <div className="plan-desc">{plan.description}</div>
            <div className="plan-days">
              {plan.days.map((d) => {
                const routine = d.routineId ? getRoutineById(d.routineId) : null;
                return (
                  <div
                    key={d.day}
                    className={`plan-day ${!routine ? 'rest' : ''}`}
                  >
                    <div className="plan-day-label">{d.day.slice(0, 3)}</div>
                    <div className="plan-day-routine">
                      {routine ? routine.emoji : '😴'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
