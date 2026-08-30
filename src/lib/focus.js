export const FOCUS_MODES = {
  pomodoro: { id: 'pomodoro', name: 'POMODORO', focus: 25, break: 5, icon: '🍅', description: 'Classic 25 / 5 rhythm.' },
  deep: { id: 'deep', name: 'DEEP WORK', focus: 50, break: 10, icon: '🧠', description: 'Longer focus, proper reset.' },
  boss: { id: 'boss', name: 'BOSS FOCUS', focus: 90, break: 20, icon: '👹', description: 'Ninety minutes. Inspector Dog respects this.' },
  reading: { id: 'reading', name: 'READING', focus: 45, break: 10, icon: '📚', description: 'Quieter pacing for reading sessions.' },
  writing: { id: 'writing', name: 'WRITING', focus: 30, break: 5, icon: '✍️', description: 'Writing sprint with optional word target.' },
  exam: { id: 'exam', name: 'EXAM', focus: 60, break: 10, icon: '⏱', description: 'Strict timer. Arcade is locked while focus runs.' },
  countdown: { id: 'countdown', name: 'COUNTDOWN', focus: 37, break: 0, icon: '⌛', description: 'Use exactly the time you actually have.' },
  stopwatch: { id: 'stopwatch', name: 'STOPWATCH', focus: 0, break: 0, icon: '⏲', description: 'Open-ended session. Stop when you are done.' },
};

export function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
