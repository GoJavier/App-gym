import { useState, useMemo } from 'react';
import { exercises, muscleGroups } from '../data/exercises';

export default function ExerciseLibrary({ onSelectExercise }) {
  const [filter, setFilter] = useState('todos');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = exercises;
    if (filter !== 'todos') {
      result = result.filter((e) => e.muscleGroup === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscleGroup.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filter, search]);

  return (
    <div className="fade-in">
      <div className="section-title">📖 Biblioteca de Ejercicios</div>
      <div className="section-subtitle">
        Tocá un ejercicio para ver cómo se hace
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar ejercicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter */}
      <div className="muscle-filter">
        <button
          className={`filter-btn ${filter === 'todos' ? 'active' : ''}`}
          onClick={() => setFilter('todos')}
        >
          Todos
        </button>
        {muscleGroups.map((mg) => (
          <button
            key={mg.id}
            className={`filter-btn ${filter === mg.id ? 'active' : ''}`}
            onClick={() => setFilter(mg.id)}
          >
            {mg.emoji} {mg.name}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">🔍</div>
          <div className="empty-state-text">No se encontraron ejercicios</div>
        </div>
      ) : (
        filtered.map((exercise) => (
          <div
            key={exercise.id}
            className="exercise-list-item"
            onClick={() => onSelectExercise(exercise.id)}
          >
            <div className="exercise-list-emoji">{exercise.emoji}</div>
            <div className="exercise-list-info">
              <div className="exercise-list-name">{exercise.name}</div>
              <div className="exercise-list-muscle">
                {muscleGroups.find((m) => m.id === exercise.muscleGroup)?.name} · {exercise.equipment}
              </div>
            </div>
            <div className="exercise-list-arrow">›</div>
          </div>
        ))
      )}
    </div>
  );
}
