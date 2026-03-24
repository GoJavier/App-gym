import { useState, useEffect } from 'react';
import { getSavedUsers, saveUserData, loadUserData, deleteUserSave, getLastUsername, setLastUsername } from '../utils/github';

export default function ExportModal({ onClose }) {
  const [username, setUsername] = useState('');
  const [savedUsers, setSavedUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' | 'error' | ''

  useEffect(() => {
    setUsername(getLastUsername());
    setSavedUsers(getSavedUsers());
  }, []);

  const handleSave = () => {
    const name = username.trim();
    if (!name) {
      setStatus('⚠️ Escribí un nombre');
      setStatusType('error');
      return;
    }

    const result = saveUserData(name);
    setLastUsername(name);
    setSavedUsers(getSavedUsers());

    const newCount = result.totalWorkouts - result.previousWorkouts;
    if (result.previousWorkouts > 0 && newCount > 0) {
      setStatus(`✅ ¡Listo! +${newCount} entrenamientos nuevos (total: ${result.totalWorkouts})`);
    } else if (result.previousWorkouts > 0) {
      setStatus(`✅ Guardado actualizado · ${result.totalWorkouts} entrenamientos`);
    } else {
      setStatus(`✅ ¡Primer guardado! ${result.totalWorkouts} entrenamientos`);
    }
    setStatusType('success');
  };

  const handleLoad = (name) => {
    if (!window.confirm(`¿Cargar los datos de "${name}"? Esto reemplaza tus datos actuales.`)) return;
    const result = loadUserData(name);
    if (result) {
      setLastUsername(name);
      setUsername(name);
      setStatus(`✅ Datos de "${name}" cargados (${result.workoutCount} entrenamientos). Recargando...`);
      setStatusType('success');
      setTimeout(() => window.location.reload(), 1200);
    } else {
      setStatus('❌ No se pudo cargar');
      setStatusType('error');
    }
  };

  const handleDelete = (name) => {
    if (!window.confirm(`¿Borrar el guardado de "${name}"?`)) return;
    deleteUserSave(name);
    setSavedUsers(getSavedUsers());
    setStatus(`🗑️ Guardado de "${name}" eliminado`);
    setStatusType('');
  };

  return (
    <div className="export-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="export-modal fade-in">
        <div className="export-header">
          <div className="export-title">💾 Guardar / Cargar Datos</div>
          <button className="export-close" onClick={onClose}>✕</button>
        </div>

        <div className="export-body">
          <p className="export-desc">
            Escribí tu nombre para guardar todos tus entrenamientos.
            Si ya tenés un guardado, solo se agregan los nuevos datos.
          </p>

          <label className="export-label">👤 Tu nombre</label>
          <input
            className="export-input"
            type="text"
            placeholder="Ej: Javier"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            autoFocus
          />

          <button
            className="btn btn-primary export-save-btn"
            onClick={handleSave}
            disabled={!username.trim()}
          >
            💾 Guardar mis datos
          </button>

          {status && (
            <div className={`export-status ${statusType}`}>
              {status}
            </div>
          )}

          {savedUsers.length > 0 && (
            <>
              <div className="export-divider" />
              <div className="export-label">📂 Guardados existentes</div>
              <div className="export-saves">
                {savedUsers.map(u => (
                  <div key={u.username} className="export-save-row">
                    <div className="export-save-info" onClick={() => handleLoad(u.username)}>
                      <div className="export-save-name">👤 {u.username}</div>
                      <div className="export-save-meta">
                        {u.workoutCount} entrenamientos
                        {u.savedAt && ` · ${new Date(u.savedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`}
                      </div>
                    </div>
                    <button className="export-save-delete" onClick={() => handleDelete(u.username)}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
