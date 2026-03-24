import { useState, useEffect, useRef, useCallback } from 'react';

export default function RestTimer({ seconds, onClose }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);
  const circumference = 2 * Math.PI * 90;
  const progress = remaining / seconds;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const addTime = useCallback((amount) => {
    setRemaining((prev) => Math.max(0, prev + amount));
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rest-timer-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center' }}>
          <div className="rest-timer-circle">
            <svg viewBox="0 0 200 200">
              <circle
                className="timer-track"
                cx="100"
                cy="100"
                r="90"
              />
              <circle
                className="timer-fill"
                cx="100"
                cy="100"
                r="90"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
              />
            </svg>
            <div className="rest-timer-time">{formatTime(remaining)}</div>
          </div>

          <div className="rest-timer-label">
            {remaining === 0 ? '¡A darle! 💪' : '⏱️ Descansando...'}
          </div>

          <div className="rest-timer-actions">
            <button
              className="btn btn-small btn-secondary"
              onClick={() => addTime(-15)}
            >
              -15s
            </button>
            <button
              className="btn btn-small btn-secondary"
              onClick={() => addTime(15)}
            >
              +15s
            </button>
            <button
              className="btn btn-small btn-primary"
              style={{ width: 'auto' }}
              onClick={onClose}
            >
              {remaining === 0 ? '¡Seguir!' : 'Saltar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
