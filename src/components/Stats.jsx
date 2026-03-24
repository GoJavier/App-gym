import { useMemo } from 'react';
import { getWorkouts, getStreak, getLevel, formatDateShort } from '../utils/storage';

export default function Stats() {
  const workouts = getWorkouts();
  const streak = getStreak();
  const level = getLevel(workouts.length);

  // Workouts per week (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks = [];
    const now = Date.now();
    for (let i = 7; i >= 0; i--) {
      const weekStart = now - (i + 1) * 7 * 86400000;
      const weekEnd = now - i * 7 * 86400000;
      const count = workouts.filter((w) => {
        const d = new Date(w.date).getTime();
        return d >= weekStart && d < weekEnd;
      }).length;
      const label = `S${8 - i}`;
      weeks.push({ label, count });
    }
    return weeks;
  }, [workouts]);

  const maxWeekly = Math.max(...weeklyData.map((w) => w.count), 1);

  // Muscle group distribution
  const muscleData = useMemo(() => {
    const counts = {};
    workouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const group = ex.name; // we'll group by exercise name
        counts[group] = (counts[group] || 0) + ex.sets.length;
      });
    });
    // Top 8 exercises
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [workouts]);

  const maxMuscle = muscleData.length > 0 ? muscleData[0][1] : 1;

  // Total stats
  const totalSets = workouts.reduce((acc, w) => acc + (w.totalSets || 0), 0);
  const totalReps = workouts.reduce((acc, w) => acc + (w.totalReps || 0), 0);
  const totalTime = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);
  const totalHours = Math.floor(totalTime / 3600000);
  const totalMinutes = Math.floor((totalTime % 3600000) / 60000);

  // Recent workouts for chart
  const recentDays = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayWorkouts = workouts.filter(
        (w) => new Date(w.date).toISOString().split('T')[0] === dateStr
      );
      days.push({
        label: date.toLocaleDateString('es-AR', { day: 'numeric' }),
        trained: dayWorkouts.length > 0,
        sets: dayWorkouts.reduce((acc, w) => acc + (w.totalSets || 0), 0),
      });
    }
    return days;
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <div className="fade-in">
        <div className="section-title">📊 Estadísticas</div>
        <div className="empty-state">
          <div className="empty-state-emoji">📈</div>
          <div className="empty-state-text">Empezá a entrenar para ver tus stats</div>
          <div className="empty-state-sub">
            Acá vas a ver gráficos de tu progreso
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="section-title">📊 Estadísticas</div>

      {/* Summary Cards */}
      <div className="stats-summary">
        <div className="card stats-card">
          <div className="stats-value">{workouts.length}</div>
          <div className="stats-label">Entrenamientos</div>
        </div>
        <div className="card stats-card">
          <div className="stats-value">🔥 {streak.current}</div>
          <div className="stats-label">Racha actual</div>
        </div>
        <div className="card stats-card">
          <div className="stats-value">{totalSets}</div>
          <div className="stats-label">Series totales</div>
        </div>
        <div className="card stats-card">
          <div className="stats-value">
            {totalHours > 0 ? `${totalHours}h` : `${totalMinutes}m`}
          </div>
          <div className="stats-label">Tiempo total</div>
        </div>
      </div>

      {/* Level */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: '2rem' }}>{level.emoji}</span>
        <div style={{ fontWeight: 700, marginTop: 4 }}>Nivel: {level.name}</div>
        <div className="level-progress" style={{ marginTop: 8 }}>
          <div
            className="level-progress-bar"
            style={{ width: `${level.progress}%` }}
          />
        </div>
        <div className="level-xp">
          {workouts.length} / {level.next} para el siguiente nivel
        </div>
      </div>

      {/* Last 14 days */}
      <div className="chart-container">
        <div className="section-title" style={{ fontSize: '0.95rem' }}>
          📅 Últimos 14 días
        </div>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {recentDays.map((day, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  background: day.trained ? 'var(--accent)' : 'var(--bg-tertiary)',
                  margin: '0 auto 4px',
                }}
                title={day.trained ? `${day.sets} series` : 'Sin entreno'}
              />
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                {day.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="chart-container">
        <div className="section-title" style={{ fontSize: '0.95rem' }}>
          📈 Entrenamientos por semana
        </div>
        <div className="card">
          <div className="bar-chart">
            {weeklyData.map((week, i) => (
              <div key={i} className="bar-wrapper">
                <div className="bar-value">{week.count > 0 ? week.count : ''}</div>
                <div
                  className="bar"
                  style={{
                    height: `${(week.count / maxWeekly) * 80}%`,
                    opacity: week.count === 0 ? 0.3 : 1,
                  }}
                />
                <div className="bar-label">{week.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Exercises */}
      {muscleData.length > 0 && (
        <div className="chart-container">
          <div className="section-title" style={{ fontSize: '0.95rem' }}>
            🏆 Ejercicios más trabajados
          </div>
          <div className="card">
            <div className="muscle-chart">
              {muscleData.map(([name, count]) => (
                <div key={name} className="muscle-bar-row">
                  <div className="muscle-bar-name">{name.length > 12 ? name.slice(0, 12) + '…' : name}</div>
                  <div className="muscle-bar-track">
                    <div
                      className="muscle-bar-fill"
                      style={{ width: `${(count / maxMuscle) * 100}%` }}
                    />
                  </div>
                  <div className="muscle-bar-count">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
