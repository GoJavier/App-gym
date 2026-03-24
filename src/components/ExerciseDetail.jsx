import { getExerciseById, muscleGroups } from '../data/exercises';

export default function ExerciseDetail({ exerciseId, onBack }) {
  const exercise = getExerciseById(exerciseId);

  if (!exercise) {
    return (
      <div className="empty-state">
        <div className="empty-state-emoji">❓</div>
        <div className="empty-state-text">Ejercicio no encontrado</div>
      </div>
    );
  }

  const muscle = muscleGroups.find((m) => m.id === exercise.muscleGroup);

  return (
    <div className="exercise-detail fade-in">
      {/* Hero */}
      <div className="exercise-detail-hero">
        <div className="exercise-detail-emoji">{exercise.emoji}</div>
        <div className="exercise-detail-name">{exercise.name}</div>
        <div className="exercise-detail-tags">
          <span className="tag">{muscle?.emoji} {muscle?.name}</span>
          <span className="tag">🏷️ {exercise.difficulty}</span>
          <span className="tag">🔧 {exercise.equipment}</span>
        </div>
        {exercise.secondaryMuscles.length > 0 && (
          <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            También trabaja: {exercise.secondaryMuscles.join(', ')}
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="exercise-detail-section">
        <h3>🎯 Recomendación para empezar</h3>
        <div className="exercise-detail-rec">
          <div className="rec-item">
            <div className="rec-value">{exercise.suggestedSets}</div>
            <div className="rec-label">Series</div>
          </div>
          <div className="rec-item">
            <div className="rec-value">{exercise.suggestedReps}</div>
            <div className="rec-label">Reps</div>
          </div>
          <div className="rec-item">
            <div className="rec-value">{exercise.suggestedRestSeconds}s</div>
            <div className="rec-label">Descanso</div>
          </div>
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: 10,
            fontSize: '0.88rem',
            color: 'var(--accent)',
            fontWeight: 600,
          }}
        >
          Peso inicial: {exercise.startingWeight}
        </div>
      </div>

      {/* Instructions */}
      <div className="exercise-detail-section">
        <h3>📝 Paso a paso</h3>
        <ol>
          {exercise.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      <div className="exercise-detail-section">
        <h3>💡 Tips para principiantes</h3>
        {exercise.tips.map((tip, i) => (
          <div key={i} className="detail-tip">
            💡 {tip}
          </div>
        ))}
      </div>

      {/* Common Mistakes */}
      <div className="exercise-detail-section">
        <h3>⚠️ Errores comunes</h3>
        {exercise.mistakes.map((mistake, i) => (
          <div key={i} className="detail-mistake">
            ❌ {mistake}
          </div>
        ))}
      </div>

      <button className="btn btn-secondary" onClick={onBack}>
        ← Volver a la biblioteca
      </button>
    </div>
  );
}
