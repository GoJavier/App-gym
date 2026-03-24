import { useState, useCallback } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Routines from './components/Routines';
import WorkoutSession from './components/WorkoutSession';
import ExerciseLibrary from './components/ExerciseLibrary';
import ExerciseDetail from './components/ExerciseDetail';
import History from './components/History';
import Stats from './components/Stats';

function getStoredMode() {
  try {
    return localStorage.getItem('gymbuddy_mode') || 'gym';
  } catch {
    return 'gym';
  }
}

export default function App() {
  const [view, setView] = useState('home');
  const [activeRoutineId, setActiveRoutineId] = useState(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [historyTab, setHistoryTab] = useState('history'); // 'history' | 'stats'
  const [mode, setMode] = useState(getStoredMode); // 'gym' | 'home'

  const toggleMode = useCallback((newMode) => {
    setMode(newMode);
    localStorage.setItem('gymbuddy_mode', newMode);
  }, []);

  const navigate = useCallback((newView) => {
    setView(newView);
    window.scrollTo(0, 0);
  }, []);

  const startWorkout = useCallback((routineId) => {
    setActiveRoutineId(routineId);
    setView('workout');
    window.scrollTo(0, 0);
  }, []);

  const finishWorkout = useCallback(() => {
    setActiveRoutineId(null);
    setView('home');
    window.scrollTo(0, 0);
  }, []);

  const selectExercise = useCallback((exerciseId) => {
    setSelectedExerciseId(exerciseId);
    setView('exercise-detail');
    window.scrollTo(0, 0);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home navigate={navigate} startWorkout={startWorkout} mode={mode} onToggleMode={toggleMode} />;
      case 'routines':
        return <Routines startWorkout={startWorkout} mode={mode} onToggleMode={toggleMode} />;
      case 'workout':
        return (
          <WorkoutSession
            routineId={activeRoutineId}
            onFinish={finishWorkout}
            navigate={navigate}
          />
        );
      case 'library':
        return <ExerciseLibrary onSelectExercise={selectExercise} />;
      case 'exercise-detail':
        return (
          <ExerciseDetail
            exerciseId={selectedExerciseId}
            onBack={() => navigate('library')}
          />
        );
      case 'history':
        return (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                className={`filter-btn ${historyTab === 'history' ? 'active' : ''}`}
                onClick={() => setHistoryTab('history')}
              >
                📋 Historial
              </button>
              <button
                className={`filter-btn ${historyTab === 'stats' ? 'active' : ''}`}
                onClick={() => setHistoryTab('stats')}
              >
                📊 Estadísticas
              </button>
            </div>
            {historyTab === 'history' ? <History /> : <Stats />}
          </div>
        );
      default:
        return <Home navigate={navigate} startWorkout={startWorkout} />;
    }
  };

  const showNav = view !== 'workout';
  const showHeader = view === 'workout';

  return (
    <div className="app">
      {showHeader && (
        <div className="header">
          <button
            className="header-back"
            onClick={() => {
              if (window.confirm('¿Salir del entrenamiento?')) finishWorkout();
            }}
          >
            ←
          </button>
          <h1>🏋️ Entrenando</h1>
          <div style={{ width: 40 }} />
        </div>
      )}

      <div className="app-content">{renderView()}</div>

      {showNav && (
        <Navigation
          currentView={view === 'exercise-detail' ? 'library' : view}
          navigate={(v) => {
            if (v === 'history') setHistoryTab('history');
            navigate(v);
          }}
        />
      )}
    </div>
  );
}
