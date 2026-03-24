const SAVE_PREFIX = 'gymbuddy_save_';

// Get list of all saved usernames
export function getSavedUsers() {
  const users = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(SAVE_PREFIX)) {
      const username = key.slice(SAVE_PREFIX.length);
      try {
        const data = JSON.parse(localStorage.getItem(key));
        users.push({
          username,
          savedAt: data._savedAt || null,
          workoutCount: (data.gymbuddy_workouts || []).length,
        });
      } catch {
        users.push({ username, savedAt: null, workoutCount: 0 });
      }
    }
  }
  return users.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
}

// Get all current app data
function getAllLocalData() {
  const keys = [
    'gymbuddy_workouts',
    'gymbuddy_profile',
    'gymbuddy_streak',
    'gymbuddy_weekplan',
    'gymbuddy_mode',
  ];
  const data = {};
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        data[key] = key === 'gymbuddy_mode' ? raw : JSON.parse(raw);
      }
    } catch {
      // skip
    }
  }
  return data;
}

// Merge: keep all unique workouts (local + saved), use local for everything else
function mergeWorkouts(localWorkouts, savedWorkouts) {
  const ids = new Set(localWorkouts.map(w => w.id));
  const onlySaved = savedWorkouts.filter(w => !ids.has(w.id));
  return [...localWorkouts, ...onlySaved];
}

// Save data for a username (incremental merge)
export function saveUserData(username) {
  const key = SAVE_PREFIX + username.toLowerCase().trim();
  const localData = getAllLocalData();

  // Check if there's existing saved data
  let existing = null;
  try {
    existing = JSON.parse(localStorage.getItem(key));
  } catch {
    // no existing data
  }

  let finalData = { ...localData };

  if (existing) {
    // Merge workouts incrementally
    const localWorkouts = localData.gymbuddy_workouts || [];
    const savedWorkouts = existing.gymbuddy_workouts || [];
    finalData.gymbuddy_workouts = mergeWorkouts(localWorkouts, savedWorkouts);
  }

  finalData._savedAt = new Date().toISOString();
  finalData._username = username.trim();
  localStorage.setItem(key, JSON.stringify(finalData));

  return {
    totalWorkouts: (finalData.gymbuddy_workouts || []).length,
    previousWorkouts: existing ? (existing.gymbuddy_workouts || []).length : 0,
  };
}

// Load data for a username into the app
export function loadUserData(username) {
  const key = SAVE_PREFIX + username.toLowerCase().trim();
  let data;
  try {
    data = JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
  if (!data) return null;

  // Restore each key into the app's localStorage
  const appKeys = ['gymbuddy_workouts', 'gymbuddy_profile', 'gymbuddy_streak', 'gymbuddy_weekplan'];
  for (const k of appKeys) {
    if (data[k] != null) {
      localStorage.setItem(k, JSON.stringify(data[k]));
    }
  }
  if (data.gymbuddy_mode) {
    localStorage.setItem('gymbuddy_mode', data.gymbuddy_mode);
  }

  return {
    workoutCount: (data.gymbuddy_workouts || []).length,
  };
}

// Delete a user's saved data
export function deleteUserSave(username) {
  const key = SAVE_PREFIX + username.toLowerCase().trim();
  localStorage.removeItem(key);
}

// Get last used username
export function getLastUsername() {
  try {
    return localStorage.getItem('gymbuddy_last_user') || '';
  } catch {
    return '';
  }
}

export function setLastUsername(username) {
  localStorage.setItem('gymbuddy_last_user', username.trim());
}
