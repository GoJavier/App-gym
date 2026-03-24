import { useState, useEffect } from 'react';
import { getWeekPlan, saveWeekPlan } from '../utils/storage';
import { routines, homeRoutines, getRoutineById } from '../data/routines';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const FOCUS_OPTIONS = [
  { id: 'equilibrado', label: '⚖️ Equilibrado', desc: 'Trabajás todo el cuerpo parejo' },
  { id: 'upper', label: '💪 Tren Superior', desc: 'Más pecho, espalda, hombros y brazos' },
  { id: 'lower', label: '🦵 Tren Inferior', desc: 'Más piernas, glúteos y core' },
  { id: 'push-pull', label: '👊 Empuje/Tirón', desc: 'Dividido en push y pull' },
];

// Smart routine assignment based on days, modes and focus
function generatePlan(dayConfigs, focus) {
  const trainingDays = dayConfigs.filter(d => d.mode !== 'rest');

  if (trainingDays.length === 0) {
    return dayConfigs.map(d => ({ ...d, routineId: null }));
  }

  const gymDays = trainingDays.filter(d => d.mode === 'gym');
  const homeDays = trainingDays.filter(d => d.mode === 'home');
  const totalDays = trainingDays.length;

  // For gym days
  const gymRoutineOrder = getGymRoutineOrder(gymDays.length, focus, totalDays);
  // For home days
  const homeRoutineOrder = getHomeRoutineOrder(homeDays.length, focus, totalDays);

  let gymIdx = 0;
  let homeIdx = 0;

  return dayConfigs.map(d => {
    if (d.mode === 'rest') return { ...d, routineId: null };
    if (d.mode === 'gym') {
      const routineId = gymRoutineOrder[gymIdx % gymRoutineOrder.length];
      gymIdx++;
      return { ...d, routineId };
    }
    if (d.mode === 'home') {
      const routineId = homeRoutineOrder[homeIdx % homeRoutineOrder.length];
      homeIdx++;
      return { ...d, routineId };
    }
    return { ...d, routineId: null };
  });
}

function getGymRoutineOrder(count, focus, totalDays) {
  if (count === 0) return [];

  switch (focus) {
    case 'upper':
      if (count === 1) return ['upper'];
      if (count === 2) return ['upper', 'fullbody-a'];
      if (count === 3) return ['push', 'upper', 'pull'];
      if (count === 4) return ['push', 'pull', 'upper', 'legs'];
      if (count >= 5) return ['push', 'upper', 'pull', 'legs', 'push'];
      break;
    case 'lower':
      if (count === 1) return ['lower'];
      if (count === 2) return ['lower', 'fullbody-b'];
      if (count === 3) return ['legs', 'lower', 'fullbody-a'];
      if (count === 4) return ['legs', 'upper', 'lower', 'push'];
      if (count >= 5) return ['legs', 'upper', 'lower', 'push', 'legs'];
      break;
    case 'push-pull':
      if (count === 1) return ['fullbody-a'];
      if (count === 2) return ['push', 'pull'];
      if (count === 3) return ['push', 'pull', 'legs'];
      if (count === 4) return ['push', 'pull', 'legs', 'push'];
      if (count >= 5) return ['push', 'pull', 'legs', 'push', 'pull'];
      break;
    default: // equilibrado
      if (count === 1) return ['fullbody-a'];
      if (count === 2) return ['fullbody-a', 'fullbody-b'];
      if (count === 3) return ['fullbody-a', 'fullbody-b', 'fullbody-a'];
      if (count === 4) return ['upper', 'lower', 'upper', 'lower'];
      if (count >= 5) return ['push', 'pull', 'legs', 'upper', 'lower'];
  }
  return ['fullbody-a'];
}

function getHomeRoutineOrder(count, focus, totalDays) {
  if (count === 0) return [];

  switch (focus) {
    case 'upper':
      if (count === 1) return ['home-upper'];
      if (count === 2) return ['home-upper', 'home-fullbody-a'];
      if (count === 3) return ['home-push', 'home-upper', 'home-pull'];
      if (count >= 4) return ['home-push', 'home-pull', 'home-upper', 'home-lower'];
      break;
    case 'lower':
      if (count === 1) return ['home-lower'];
      if (count === 2) return ['home-lower', 'home-fullbody-b'];
      if (count === 3) return ['home-lower', 'home-fullbody-a', 'home-lower'];
      if (count >= 4) return ['home-lower', 'home-upper', 'home-lower', 'home-push'];
      break;
    case 'push-pull':
      if (count === 1) return ['home-fullbody-a'];
      if (count === 2) return ['home-push', 'home-pull'];
      if (count === 3) return ['home-push', 'home-pull', 'home-lower'];
      if (count >= 4) return ['home-push', 'home-pull', 'home-lower', 'home-push'];
      break;
    default: // equilibrado
      if (count === 1) return ['home-fullbody-a'];
      if (count === 2) return ['home-fullbody-a', 'home-fullbody-b'];
      if (count === 3) return ['home-fullbody-a', 'home-fullbody-b', 'home-fullbody-a'];
      if (count >= 4) return ['home-upper', 'home-lower', 'home-upper', 'home-lower'];
  }
  return ['home-fullbody-a'];
}

function getTodayIndex() {
  const jsDay = new Date().getDay(); // 0=sun
  return jsDay === 0 ? 6 : jsDay - 1; // convert to 0=monday
}

export default function WeekPlanner({ startWorkout }) {
  const [step, setStep] = useState('view'); // 'view' | 'config' | 'focus'
  const [focus, setFocus] = useState('equilibrado');
  const [dayConfigs, setDayConfigs] = useState(
    DAYS.map(day => ({ day, mode: 'rest' }))
  );
  const [generatedPlan, setGeneratedPlan] = useState(null);

  // Load saved plan on mount
  useEffect(() => {
    const saved = getWeekPlan();
    if (saved) {
      setGeneratedPlan(saved.plan);
      setFocus(saved.focus || 'equilibrado');
      setDayConfigs(saved.dayConfigs || DAYS.map(day => ({ day, mode: 'rest' })));
      setStep('view');
    } else {
      setStep('config');
    }
  }, []);

  const todayIdx = getTodayIndex();

  const toggleDayMode = (index) => {
    setDayConfigs(prev => {
      const next = [...prev];
      const modes = ['rest', 'gym', 'home'];
      const currentModeIdx = modes.indexOf(next[index].mode);
      next[index] = { ...next[index], mode: modes[(currentModeIdx + 1) % 3] };
      return next;
    });
  };

  const handleGenerate = () => {
    const plan = generatePlan(dayConfigs, focus);
    setGeneratedPlan(plan);
    saveWeekPlan({ plan, focus, dayConfigs });
    setStep('view');
  };

  const handleEdit = () => {
    setStep('config');
  };

  const trainingCount = dayConfigs.filter(d => d.mode !== 'rest').length;
  const restCount = 7 - trainingCount;

  // Render: View saved plan
  if (step === 'view' && generatedPlan) {
    return (
      <div className="fade-in">
        <div className="section-title">📅 Mi Semana</div>
        <div className="section-subtitle">
          Tocá un día para empezar a entrenar
        </div>

        {/* Focus badge */}
        <div className="planner-focus-badge">
          {FOCUS_OPTIONS.find(f => f.id === focus)?.label || '⚖️ Equilibrado'}
        </div>

        {/* Week calendar */}
        <div className="planner-week">
          {generatedPlan.map((day, i) => {
            const routine = day.routineId ? getRoutineById(day.routineId) : null;
            const isToday = i === todayIdx;
            const isRest = !routine;

            return (
              <div
                key={day.day}
                className={`planner-day-card ${isToday ? 'today' : ''} ${isRest ? 'rest' : ''}`}
                onClick={() => {
                  if (routine) startWorkout(routine.id);
                }}
              >
                <div className="planner-day-label">{DAY_SHORT[i]}</div>
                <div className="planner-day-emoji">
                  {isRest ? '😴' : routine?.emoji || '🏋️'}
                </div>
                <div className="planner-day-name">
                  {isRest ? 'Descanso' : routine?.name || ''}
                </div>
                {!isRest && (
                  <div className="planner-day-mode">
                    {day.mode === 'home' ? '🏠' : '🏋️'}
                  </div>
                )}
                {!isRest && (
                  <div className="planner-day-time">
                    {routine?.estimatedTime}
                  </div>
                )}
                {isToday && <div className="planner-today-badge">HOY</div>}
                {!isRest && isToday && (
                  <div className="planner-play">▶️</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Today's detail card */}
        {(() => {
          const todayPlan = generatedPlan[todayIdx];
          const todayRoutine = todayPlan?.routineId ? getRoutineById(todayPlan.routineId) : null;
          if (todayRoutine) {
            return (
              <div className="card planner-today-card" onClick={() => startWorkout(todayRoutine.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                      🎯 HOY — {DAYS[todayIdx]}
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                      {todayRoutine.emoji} {todayRoutine.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {todayRoutine.description}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {todayPlan.mode === 'home' ? '🏠 En casa' : '🏋️ Gimnasio'} · {todayRoutine.estimatedTime}
                    </div>
                  </div>
                  <div style={{ fontSize: '2rem' }}>▶️</div>
                </div>
              </div>
            );
          }
          return (
            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>😴</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Hoy es descanso</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Aprovechá para estirar y recuperarte. ¡Los músculos crecen descansando!
              </div>
            </div>
          );
        })()}

        {/* Rest tip */}
        {restCount > 0 && restCount <= 3 && (
          <div className="card" style={{ marginTop: 8 }}>
            <div className="tip-card">
              <div className="tip-icon">💡</div>
              <div className="tip-text">
                <strong>Descanso:</strong> Tenés {restCount} {restCount === 1 ? 'día' : 'días'} de descanso.
                {' '}El descanso es fundamental para que los músculos se recuperen y crezcan.
              </div>
            </div>
          </div>
        )}

        <button className="btn btn-secondary mt-16" onClick={handleEdit}>
          ✏️ Reorganizar Semana
        </button>
      </div>
    );
  }

  // Render: Configuration step
  if (step === 'config') {
    return (
      <div className="fade-in">
        <div className="section-title">📅 Organizá tu Semana</div>
        <div className="section-subtitle">
          Tocá cada día para elegir: descanso, gym o casa
        </div>

        <div className="planner-config-days">
          {dayConfigs.map((dc, i) => (
            <div
              key={dc.day}
              className={`planner-config-day ${dc.mode}`}
              onClick={() => toggleDayMode(i)}
            >
              <div className="planner-config-day-name">{DAY_SHORT[i]}</div>
              <div className="planner-config-day-icon">
                {dc.mode === 'rest' ? '😴' : dc.mode === 'gym' ? '🏋️' : '🏠'}
              </div>
              <div className="planner-config-day-label">
                {dc.mode === 'rest' ? 'Descanso' : dc.mode === 'gym' ? 'Gym' : 'Casa'}
              </div>
            </div>
          ))}
        </div>

        <div className="planner-summary">
          {trainingCount === 0 ? (
            <span>Elegí al menos un día para entrenar</span>
          ) : (
            <span>
              {trainingCount} {trainingCount === 1 ? 'día' : 'días'} de entreno ·
              {' '}{restCount} de descanso
            </span>
          )}
        </div>

        {trainingCount > 0 && (
          <button className="btn btn-primary mt-16" onClick={() => setStep('focus')}>
            Siguiente: Elegir enfoque →
          </button>
        )}
      </div>
    );
  }

  // Render: Focus step
  if (step === 'focus') {
    return (
      <div className="fade-in">
        <div className="section-title">🎯 ¿En qué te querés enfocar?</div>
        <div className="section-subtitle">
          Esto define qué ejercicios van a tener más espacio en tu semana
        </div>

        <div className="planner-focus-options">
          {FOCUS_OPTIONS.map(opt => (
            <div
              key={opt.id}
              className={`planner-focus-card ${focus === opt.id ? 'active' : ''}`}
              onClick={() => setFocus(opt.id)}
            >
              <div className="planner-focus-label">{opt.label}</div>
              <div className="planner-focus-desc">{opt.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={() => setStep('config')}>
            ← Volver
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGenerate}>
            ✨ Generar mi plan
          </button>
        </div>
      </div>
    );
  }

  // Fallback: no saved plan → go to config
  return null;
}
