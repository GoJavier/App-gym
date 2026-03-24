import { useState } from 'react';
import { getWorkouts, deleteWorkout, formatDuration, formatDate } from '../utils/storage';

export default function History() {
  const [workouts, setWorkouts] = useState(getWorkouts);
  const [expandedId, setExpandedId] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este entrenamiento?')) {
      const updated = deleteWorkout(id);
      setWorkouts(updated);
    }
  };

  if (workouts.length === 0) {
    return (
      <div className="fade-in">
        <div className="section-title">📊 Tu Progreso</div>
        <div className="empty-state">
          <div className="empty-state-emoji">🏋️</div>
          <div className="empty-state-text">Todavía no tenés entrenamientos</div>
          <div className="empty-state-sub">
            ¡Empezá tu primer entrenamiento y acá vas a ver tu historial!
          </div>
        </div>
      </div>
    );
  }

  // Group by date
  const grouped = {};
  workouts.forEach((w) => {
    const dateKey = new Date(w.date).toISOString().split('T')[0];
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(w);
  });

  return (
    <div className="fade-in">
      <div className="section-title">📊 Historial</div>
      <div className="section-subtitle">
        {workouts.length} {workouts.length === 1 ? 'entrenamiento' : 'entrenamientos'} registrados
      </div>

      {Object.entries(grouped).map(([dateKey, dayWorkouts]) => (
        <div key={dateKey} className="history-day">
          <div className="history-date">{formatDate(dateKey)}</div>
          {dayWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="card history-card"
              onClick={() =>
                setExpandedId(expandedId === workout.id ? null : workout.id)
              }
            >
              <div className="history-card-header">
                <div className="history-card-title">{workout.routineName}</div>
                <div className="history-card-duration">
                  ⏱️ {formatDuration(workout.duration)}
                </div>
              </div>
              <div className="history-card-exercises">
                {workout.exercises.map((ex) => ex.name).join(' · ')}
              </div>
              <div className="history-card-stats">
                <div className="history-stat">
                  <span className="history-stat-value">{workout.exercises.length}</span> ejercicios
                </div>
                <div className="history-stat">
                  <span className="history-stat-value">{workout.totalSets}</span> series
                </div>
                {workout.totalReps > 0 && (
                  <div className="history-stat">
                    <span className="history-stat-value">{workout.totalReps}</span> reps
                  </div>
                )}
              </div>

              {/* Expanded detail */}
              {expandedId === workout.id && (
                <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {workout.exercises.map((ex) => (
                    <div key={ex.exerciseId} style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>
                        {ex.name}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {ex.sets.map((set, i) => (
                          <span
                            key={i}
                            className="badge badge-accent"
                            style={{ fontSize: '0.8rem' }}
                          >
                            {set.weight ? `${set.weight}kg` : '-'} × {set.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    className="btn btn-small btn-secondary"
                    style={{ color: 'var(--danger)', marginTop: 8 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(workout.id);
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
