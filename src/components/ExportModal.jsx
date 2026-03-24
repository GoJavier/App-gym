import { useState, useEffect } from 'react';
import { exportToGitHub, getGitHubSettings, saveGitHubSettings, clearGitHubSettings } from '../utils/github';

export default function ExportModal({ onClose }) {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const saved = getGitHubSettings();
    if (saved) {
      setOwner(saved.owner || '');
      setRepo(saved.repo || '');
      setToken(saved.token || '');
    }
  }, []);

  const handleExport = async () => {
    if (!owner.trim() || !repo.trim() || !token.trim()) {
      setStatus('⚠️ Completá todos los campos');
      return;
    }

    setLoading(true);
    setDone(false);
    setStatus('');

    try {
      if (remember) {
        saveGitHubSettings({ owner: owner.trim(), repo: repo.trim(), token: token.trim() });
      }

      await exportToGitHub(owner.trim(), repo.trim(), token.trim(), setStatus);
      setDone(true);
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    clearGitHubSettings();
    setOwner('');
    setRepo('');
    setToken('');
    setStatus('Datos de conexión borrados');
  };

  return (
    <div className="export-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="export-modal fade-in">
        <div className="export-header">
          <div className="export-title">☁️ Exportar a GitHub</div>
          <button className="export-close" onClick={onClose}>✕</button>
        </div>

        <div className="export-body">
          <p className="export-desc">
            Guardá todos tus entrenamientos en un archivo JSON en tu repo de GitHub.
            Si ya tenés un backup anterior, solo se agregan los datos nuevos.
          </p>

          <label className="export-label">👤 Usuario de GitHub</label>
          <input
            className="export-input"
            type="text"
            placeholder="tu-usuario"
            value={owner}
            onChange={e => setOwner(e.target.value)}
            disabled={loading}
            autoComplete="username"
          />

          <label className="export-label">📁 Nombre del repositorio</label>
          <input
            className="export-input"
            type="text"
            placeholder="mi-gym-data"
            value={repo}
            onChange={e => setRepo(e.target.value)}
            disabled={loading}
          />

          <label className="export-label">🔑 Token de acceso personal (PAT)</label>
          <input
            className="export-input"
            type="password"
            placeholder="ghp_xxxxxxxxxxxx"
            value={token}
            onChange={e => setToken(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
          <div className="export-token-help">
            Creá uno en GitHub → Settings → Developer settings → Personal access tokens →
            Fine-grained tokens. Permiso necesario: <strong>Contents (Read and write)</strong> sobre el repo.
          </div>

          <label className="export-checkbox-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              disabled={loading}
            />
            <span>Recordar datos para la próxima vez</span>
          </label>

          {status && (
            <div className={`export-status ${done ? 'success' : ''}`}>
              {loading && <span className="export-spinner" />}
              {status}
            </div>
          )}
        </div>

        <div className="export-footer">
          {getGitHubSettings() && (
            <button className="btn btn-secondary export-clear-btn" onClick={handleClear} disabled={loading}>
              🗑️ Borrar datos
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {loading ? '⏳ Exportando...' : done ? '✅ ¡Exportado!' : '🚀 Exportar'}
          </button>
        </div>
      </div>
    </div>
  );
}
