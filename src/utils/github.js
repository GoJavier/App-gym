const GITHUB_SETTINGS_KEY = 'gymbuddy_github';

export function getGitHubSettings() {
  try {
    return JSON.parse(localStorage.getItem(GITHUB_SETTINGS_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveGitHubSettings(settings) {
  localStorage.setItem(GITHUB_SETTINGS_KEY, JSON.stringify(settings));
}

export function clearGitHubSettings() {
  localStorage.removeItem(GITHUB_SETTINGS_KEY);
}

// Gather all app data from localStorage
function getAllLocalData() {
  const keys = [
    'gymbuddy_workouts',
    'gymbuddy_profile',
    'gymbuddy_streak',
    'gymbuddy_weekplan',
  ];
  const data = {};
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      data[key] = raw ? JSON.parse(raw) : null;
    } catch {
      data[key] = null;
    }
  }
  data._exportedAt = new Date().toISOString();
  return data;
}

// Merge local data with existing remote data (incremental)
function mergeData(local, remote) {
  const merged = { ...local };

  // Workouts: merge by id, keep all unique entries
  const localWorkouts = local.gymbuddy_workouts || [];
  const remoteWorkouts = remote.gymbuddy_workouts || [];
  const workoutIds = new Set(localWorkouts.map(w => w.id));
  const newFromRemote = remoteWorkouts.filter(w => !workoutIds.has(w.id));
  // Combine: local first (newest), then any remote-only ones
  merged.gymbuddy_workouts = [...localWorkouts, ...newFromRemote];

  // Profile, streak, weekplan: use local (most recent) always
  // Already set from local spread above

  merged._exportedAt = new Date().toISOString();
  return merged;
}

// Fetch existing file from GitHub repo
async function fetchExistingFile(owner, repo, path, token) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status} al leer el archivo`);
  }

  const file = await res.json();
  return file;
}

// Create or update a file on GitHub
async function putFile(owner, repo, path, content, sha, token, message) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Error ${res.status} al guardar`);
  }

  return res.json();
}

/**
 * Export all app data to a GitHub repo.
 * If a previous backup exists, merges incrementally.
 * @param {string} owner - GitHub username
 * @param {string} repo - Repo name
 * @param {string} token - Personal Access Token
 * @param {function} onStatus - Status callback (string)
 */
export async function exportToGitHub(owner, repo, token, onStatus) {
  const filePath = 'gymbuddy-backup.json';

  onStatus('Leyendo datos locales...');
  const localData = getAllLocalData();

  onStatus('Verificando backup anterior en GitHub...');
  const existing = await fetchExistingFile(owner, repo, filePath, token);

  let finalData = localData;
  let sha = null;
  let commitMsg = 'gymbuddy: backup inicial';

  if (existing) {
    sha = existing.sha;
    try {
      const decoded = decodeURIComponent(escape(atob(existing.content.replace(/\n/g, ''))));
      const remoteData = JSON.parse(decoded);
      onStatus('Combinando datos nuevos con el backup anterior...');
      finalData = mergeData(localData, remoteData);
      const localCount = (localData.gymbuddy_workouts || []).length;
      const remoteCount = (remoteData.gymbuddy_workouts || []).length;
      const mergedCount = finalData.gymbuddy_workouts.length;
      const newCount = mergedCount - remoteCount;
      commitMsg = newCount > 0
        ? `gymbuddy: +${newCount} entrenamientos (total: ${mergedCount})`
        : `gymbuddy: actualización de datos (${mergedCount} entrenamientos)`;
    } catch {
      commitMsg = 'gymbuddy: backup actualizado';
    }
  }

  onStatus('Subiendo a GitHub...');
  const content = JSON.stringify(finalData, null, 2);
  await putFile(owner, repo, filePath, content, sha, token, commitMsg);

  const count = (finalData.gymbuddy_workouts || []).length;
  onStatus(`✅ ¡Listo! ${count} entrenamientos guardados en GitHub`);
}
