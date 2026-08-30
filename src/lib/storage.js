const SETUP_KEY = 'vibecade_v3_setup';
const UNLOCK_KEY = 'vibecade_v3_void_unlocked';
const NOTES_KEY = 'vibecade_v3_notes';
const HISTORY_KEY = 'vibecade_v3_focus_history';
const PRESETS_KEY = 'vibecade_v3_presets';
const SCORES_KEY = 'vibecade_v3_scores';
const PREFS_KEY = 'vibecade_v3_prefs';
const PLAYLIST_KEY = 'vibecade_v3_playlist';
const SESSION_KEY = 'vibecade_v3_session_history';
const SCHEDULE_KEY = 'vibecade_v4_schedule';
const MEDIA_DB = 'vibecade_v3_media';
const MEDIA_STORE = 'tracks';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* local-first best effort */ }
};

export const loadSetup = () => read(SETUP_KEY, null);
export const saveSetup = (setup) => write(SETUP_KEY, setup);

export const isVoidUnlocked = () => localStorage.getItem(UNLOCK_KEY) === 'yes';
export const unlockVoid = () => localStorage.setItem(UNLOCK_KEY, 'yes');

export const loadNotes = () => read(NOTES_KEY, []);
export const saveNotes = (notes) => write(NOTES_KEY, notes);

export const loadFocusHistory = () => read(HISTORY_KEY, []);
export const saveFocusHistory = (items) => write(HISTORY_KEY, items.slice(0, 500));
export const addFocusHistory = (entry) => {
  const items = loadFocusHistory();
  const next = [{ id: crypto.randomUUID?.() || String(Date.now()), createdAt: new Date().toISOString(), ...entry }, ...items];
  saveFocusHistory(next);
  return next;
};

export const loadPresets = () => read(PRESETS_KEY, []);
export const savePresets = (items) => write(PRESETS_KEY, items.slice(0, 24));

export const loadScores = () => read(SCORES_KEY, {});
export const saveScore = (game, score) => {
  const scores = loadScores();
  scores[game] = Math.max(Number(scores[game] || 0), Number(score || 0));
  write(SCORES_KEY, scores);
  return scores;
};

export const loadPrefs = () => read(PREFS_KEY, {
  weather: 'none',
  zen: false,
  dockVisible: true,
  inspector: true,
  timerDisplay: 'visible',
  ambient: { rain: 0, cafe: 0, fire: 0, vinyl: 0 },
});
export const savePrefs = (prefs) => write(PREFS_KEY, prefs);

export const loadPlaylist = () => read(PLAYLIST_KEY, []);
export const savePlaylist = (items) => write(PLAYLIST_KEY, items.slice(0, 100));

function openMediaDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const request = indexedDB.open(MEDIA_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open media database'));
  });
}

export async function saveTrackFile(id, file) {
  const db = await openMediaDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    tx.objectStore(MEDIA_STORE).put({ id, file });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error('Could not save track'));
  });
  db.close();
}

export async function loadTrackFile(id) {
  const db = await openMediaDb();
  const result = await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readonly');
    const request = tx.objectStore(MEDIA_STORE).get(id);
    request.onsuccess = () => resolve(request.result?.file || null);
    request.onerror = () => reject(request.error || new Error('Could not read track'));
  });
  db.close();
  return result;
}

export async function deleteTrackFile(id) {
  const db = await openMediaDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    tx.objectStore(MEDIA_STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error('Could not delete track'));
  });
  db.close();
}

export const loadSessionHistory = () => read(SESSION_KEY, []);
export const saveSessionHistory = (items) => write(SESSION_KEY, items.slice(0, 250));
export const startVibeSession = (entry = {}) => {
  const items = loadSessionHistory();
  const session = {
    id: crypto.randomUUID?.() || String(Date.now()),
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationMinutes: 0,
    tracks: [],
    ...entry,
  };
  saveSessionHistory([session, ...items]);
  return session;
};

export const updateVibeSession = (id, patch = {}) => {
  if (!id) return loadSessionHistory();
  const next = loadSessionHistory().map(item => item.id === id ? { ...item, ...patch } : item);
  saveSessionHistory(next);
  return next;
};

export const loadSchedule = () => read(SCHEDULE_KEY, []);
export const saveSchedule = (items) => write(SCHEDULE_KEY, items.slice(0, 200));
export const addScheduleItem = (item) => {
  const items = loadSchedule();
  const next = [...items, { id: crypto.randomUUID?.() || String(Date.now()), createdAt: new Date().toISOString(), done: false, ...item }].sort((a,b) => String(a.when).localeCompare(String(b.when)));
  saveSchedule(next);
  return next;
};
export const updateScheduleItem = (id, patch = {}) => {
  const next = loadSchedule().map(item => item.id === id ? { ...item, ...patch } : item);
  saveSchedule(next);
  return next;
};
export const deleteScheduleItem = (id) => {
  const next = loadSchedule().filter(item => item.id !== id);
  saveSchedule(next);
  return next;
};

export const exportLocalData = () => ({
  exportedAt: new Date().toISOString(),
  setup: loadSetup(),
  notes: loadNotes(),
  focusHistory: loadFocusHistory(),
  presets: loadPresets(),
  scores: loadScores(),
  prefs: loadPrefs(),
  playlist: loadPlaylist(),
  sessionHistory: loadSessionHistory(),
  schedule: loadSchedule(),
  secretCartridgeUnlocked: isVoidUnlocked(),
  unlocks: loadUnlocks(),
  encounters: loadEncounters(),
});

const UNLOCKS_KEY = 'vibecade_v5_unlocks';
const ENCOUNTERS_KEY = 'vibecade_v5_encounters';
export const loadUnlocks = () => read(UNLOCKS_KEY, []);
export const unlockCurio = (id) => {
  const current = loadUnlocks();
  if (current.includes(id)) return current;
  const next = [...current, id]; write(UNLOCKS_KEY, next); return next;
};
export const loadEncounters = () => read(ENCOUNTERS_KEY, []);
export const logEncounter = (entry) => {
  const next = [{ at:new Date().toISOString(), ...entry }, ...loadEncounters()].slice(0,100);
  write(ENCOUNTERS_KEY, next); return next;
};
