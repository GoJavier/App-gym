import { useState, useEffect, useCallback } from 'react';
import { getRoutineById } from '../data/routines';
import { getExerciseById, getSimilarExercises, exercises } from '../data/exercises';
import { saveWorkout, getMotivationalMessage, formatDuration, getPreset, savePreset } from '../utils/storage';
import RestTimer from './RestTimer';

function buildExerciseEntry(exerciseId, sets, reps) {
  const exercise = getExerciseById(exerciseId);
  const preset = getPreset(exerciseId);
  const numSets = preset?.sets || sets;
  const defaultReps = preset?.reps || reps;
  const defaultWeight = preset?.weight || '';
  return {
    exerciseId,
    name: exercise?.name || exerciseId,
    emoji: exercise?.emoji || '🏋️',
    expanded: false,
    showHowTo: false,
    showReplace: false,
    sets: Array.from({ length: numSets }, () => ({
      weight: defaultWeight,
      reps: defaultReps,
      completed: false,
    })),
  };
}

export default function WorkoutSession({ routineId, onFinish, navigate }) {
  const routine = getRoutineById(routineId);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [exerciseData, setExerciseData] = useState(() =>
    routine.exercises.map((ex) => buildExerciseEntry(ex.exerciseId, ex.sets, ex.reps))
  );
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [presetSaved, setPresetSaved] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const toggleExpand = useCallback((index) => {
    setExerciseData((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, expanded: !ex.expanded } : ex))
    );
  }, []);

  const toggleHowTo = useCallback((index) => {
    setExerciseData((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, showHowTo: !ex.showHowTo } : ex))
    );
  }, []);

  const updateSet = useCallback((exIndex, setIndex, field, value) => {
    setExerciseData((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        const newSets = ex.sets.map((s, j) =>
          j === setIndex ? { ...s, [field]: value } : s
        );
        return { ...ex, sets: newSets };
      })
    );
  }, []);

  const completeSet = useCallback((exIndex, setIndex) => {
    setExerciseData((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        const newSets = ex.sets.map((s, j) =>
          j === setIndex ? { ...s, completed: !s.completed } : s
        );
        return { ...ex, sets: newSets };
      })
    );

    const exercise = getExerciseById(exerciseData[exIndex].exerciseId);
    const restTime = exercise?.suggestedRestSeconds || 90;
    setTimerSeconds(restTime);
    setShowTimer(true);
  }, [exerciseData]);

  const addSet = useCallback((exIndex) => {
    setExerciseData((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { weight: lastSet?.weight || '', reps: lastSet?.reps || '10', completed: false }],
        };
      })
    );
  }, []);

  const handleSavePreset = useCallback((exIndex) => {
    const ex = exerciseData[exIndex];
    const firstSet = ex.sets[0];
    savePreset(ex.exerciseId, {
      weight: firstSet?.weight || '',
      reps: firstSet?.reps || '10',
      sets: ex.sets.length,
    });
    setPresetSaved(exIndex);
    setTimeout(() => setPresetSaved(null), 1500);
  }, [exerciseData]);

  const toggleReplace = useCallback((index) => {
    setExerciseData((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, showReplace: !ex.showReplace } : ex))
    );
  }, []);

  const handleReplace = useCallback((exIndex, newExerciseId) => {
    setExerciseData((prev) =>
      prev.map((ex, i) => {
        if (i !== exIndex) return ex;
        const newEx = getExerciseById(newExerciseId);
        const preset = getPreset(newExerciseId);
        return {
          ...ex,
          exerciseId: newExerciseId,
          name: newEx?.name || newExerciseId,
          emoji: newEx?.emoji || '🏋️',
          showReplace: false,
          sets: ex.sets.map((s) => ({
            weight: preset?.weight || '',
            reps: preset?.reps || s.reps,
            completed: false,
          })),
        };
      })
    );
  }, []);

  const handleAddExercise = useCallback((exerciseId) => {
    const ex = getExerciseById(exerciseId);
    const preset = getPreset(exerciseId);
    setExerciseData((prev) => [
      ...prev,
      {
        exerciseId,
        name: ex?.name || exerciseId,
        emoji: ex?.emoji || '🏋️',
        expanded: true,
        showHowTo: false,
        showReplace: false,
        sets: Array.from({ length: preset?.sets || 3 }, () => ({
          weight: preset?.weight || '',
          reps: preset?.reps || '10',
          completed: false,
        })),
      },
    ]);
    setShowAddExercise(false);
  }, []);

  const finishWorkout = () => {
    const duration = Date.now() - startTime;
    let totalSets = 0;
    let totalReps = 0;

    const exerciseSummary = exerciseData
      .map((ex) => {
        const completedSets = ex.sets.filter((s) => s.completed);
        totalSets += completedSets.length;
        completedSets.forEach((s) => {
          const r = parseInt(s.reps);
          if (!isNaN(r)) totalReps += r;
        });
        return {
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: completedSets.map((s) => ({
            weight: s.weight,
            reps: s.reps,
          })),
        };
      })
      .filter((ex) => ex.sets.length > 0);

    const workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      routineId: routine.id,
      routineName: routine.name,
      duration,
      exercises: exerciseSummary,
      totalSets,
      totalReps,
    };

    saveWorkout(workout);

    setSummaryData({
      duration,
      totalSets,
      totalReps,
      exerciseCount: exerciseSummary.length,
      message: getMotivationalMessage(),
    });
    setShowSummary(true);
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const completedCount = exerciseData.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalCount = exerciseData.reduce((acc, ex) => acc + ex.sets.length, 0);

  if (showSummary && summaryData) {
    return (
      <div className="summary-overlay">
        <div className="summary-emoji">🎉</div>
        <div className="summary-title">¡Entrenamiento completado!</div>
        <div className="summary-message">{summaryData.message}</div>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-stat-value">{summaryData.exerciseCount}</div>
            <div className="summary-stat-label">Ejercicios</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{summaryData.totalSets}</div>
            <div className="summary-stat-label">Series</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{formatDuration(summaryData.duration)}</div>
            <div className="summary-stat-label">Duración</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onFinish()}>
          🏠 Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="workout-header-info">
        <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>
          {routine.emoji} {routine.name}
        </div>
        <div className="workout-timer">{formatTime(elapsed)}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          {completedCount} / {totalCount} series completadas
        </div>
        <div className="level-progress" style={{ marginTop: 8 }}>
          <div
            className="level-progress-bar"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {exerciseData.map((ex, exIndex) => {
        const exercise = getExerciseById(ex.exerciseId);
        const allDone = ex.sets.every((s) => s.completed);

        return (
          <div
            key={ex.exerciseId}
            className="workout-exercise-card"
            style={allDone ? { borderColor: 'var(--accent)', opacity: 0.85 } : {}}
          >
            <div
              className="workout-exercise-header"
              onClick={() => toggleExpand(exIndex)}
            >
              <span style={{ fontSize: '1.3rem' }}>{ex.emoji}</span>
              <span className="workout-exercise-name">{ex.name}</span>
              <span className="workout-exercise-check">
                {allDone ? '✅' : ex.expanded ? '▲' : '▼'}
              </span>
            </div>

            {/* How-To Toggle */}
            {ex.expanded && (
              <div
                className="how-to-toggle"
                onClick={() => toggleHowTo(exIndex)}
              >
                📖 {ex.showHowTo ? 'Ocultar instrucciones' : '¿Cómo se hace?'}
              </div>
            )}

            {/* How-To Instructions */}
            {ex.expanded && ex.showHowTo && exercise && (
              <div className="how-to-content">
                <ol>
                  {exercise.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                {exercise.tips.slice(0, 2).map((tip, i) => (
                  <div key={i} className="tip-item">💡 {tip}</div>
                ))}
              </div>
            )}

            {/* Sets */}
            {ex.expanded && (
              <div className="workout-sets">
                {ex.sets.map((set, setIndex) => (
                  <div key={setIndex} className="set-row">
                    <div className="set-number">S{setIndex + 1}</div>
                    <div className="set-input-group">
                      <label>Kg</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(exIndex, setIndex, 'weight', e.target.value)
                        }
                        disabled={set.completed}
                      />
                    </div>
                    <div className="set-input-group">
                      <label>Reps</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(exIndex, setIndex, 'reps', e.target.value)
                        }
                        disabled={set.completed}
                      />
                    </div>
                    <button
                      className={`set-complete-btn ${set.completed ? 'completed' : ''}`}
                      onClick={() => completeSet(exIndex, setIndex)}
                    >
                      {set.completed ? '✓' : '○'}
                    </button>
                  </div>
                ))}

                <button
                  className="add-set-btn"
                  onClick={() => addSet(exIndex)}
                >
                  + Agregar serie
                </button>

                <div className="exercise-actions-row">
                  <button
                    className={`exercise-action-btn preset-btn ${presetSaved === exIndex ? 'saved' : ''}`}
                    onClick={() => handleSavePreset(exIndex)}
                  >
                    {presetSaved === exIndex ? '✅ Guardado' : '💾 Guardar preset'}
                  </button>
                  <button
                    className="exercise-action-btn replace-btn"
                    onClick={() => toggleReplace(exIndex)}
                  >
                    🔄 Reemplazar
                  </button>
                </div>

                {ex.showReplace && (() => {
                  const currentIds = exerciseData.map((e) => e.exerciseId);
                  const similar = getSimilarExercises(ex.exerciseId, currentIds);
                  return (
                    <div className="replace-list">
                      <div className="replace-list-title">Elegí un ejercicio similar:</div>
                      {similar.length === 0 && (
                        <div className="replace-empty">No hay alternativas disponibles</div>
                      )}
                      {similar.map((alt) => (
                        <button
                          key={alt.id}
                          className="replace-option"
                          onClick={() => handleReplace(exIndex, alt.id)}
                        >
                          <span>{alt.emoji}</span>
                          <span>{alt.name}</span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}

      <div className="workout-finish-area">
        <button
          className="btn btn-secondary add-exercise-btn"
          onClick={() => setShowAddExercise(true)}
        >
          ➕ Agregar ejercicio
        </button>
        <button className="btn btn-primary" onClick={finishWorkout}>
          🏁 Terminar Entrenamiento
        </button>
        <button
          className="btn btn-secondary"
          style={{ color: 'var(--danger)' }}
          onClick={() => {
            if (window.confirm('¿Seguro que querés cancelar el entrenamiento?')) {
              onFinish();
            }
          }}
        >
          Cancelar
        </button>
      </div>

      {showAddExercise && (() => {
        const currentIds = exerciseData.map((e) => e.exerciseId);
        const isHome = routine.id?.startsWith('home-');
        const available = exercises.filter(
          (e) => !currentIds.includes(e.id) && (isHome ? e.homeExercise : !e.homeExercise)
        );
        return (
          <div className="modal-overlay" onClick={() => setShowAddExercise(false)}>
            <div className="add-exercise-modal" onClick={(e) => e.stopPropagation()}>
              <div className="add-exercise-modal-title">Agregar ejercicio</div>
              <div className="add-exercise-modal-list">
                {available.map((ex) => (
                  <button
                    key={ex.id}
                    className="replace-option"
                    onClick={() => handleAddExercise(ex.id)}
                  >
                    <span>{ex.emoji}</span>
                    <span>{ex.name}</span>
                    <span className="add-exercise-muscle">{ex.muscleGroup}</span>
                  </button>
                ))}
              </div>
              <button
                className="btn btn-secondary"
                style={{ marginTop: 12, width: '100%' }}
                onClick={() => setShowAddExercise(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        );
      })()}

      {showTimer && (
        <RestTimer
          seconds={timerSeconds}
          onClose={() => setShowTimer(false)}
        />
      )}
    </div>
  );
}
