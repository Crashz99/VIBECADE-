import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FOCUS_MODES, formatClock } from '../lib/focus';
import { addFocusHistory } from '../lib/storage';

export default function FocusPanel({ open = true, onClose, onStateChange, onInspectorSignal, inspector, setInspector, timerDisplay, setTimerDisplay, musicOn, setMusicOn, onBreakRoulette, onOpenNotes, onSfx, theme, trackName, requestedMode = null }) {
  const [modeId, setModeId] = useState('pomodoro');
  const [customFocus, setCustomFocus] = useState(37);
  const [customBreak, setCustomBreak] = useState(5);
  const [phase, setPhase] = useState('focus');
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');
  const [journal, setJournal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [lastMinutes, setLastMinutes] = useState(0);
  const [wordTarget, setWordTarget] = useState(500);
  const [mood, setMood] = useState('steady');
  const lastActivity = useRef(Date.now());
  const idleFlag = useRef(false);

  const mode = FOCUS_MODES[modeId];
  const isStopwatch = modeId === 'stopwatch';
  const focusMinutes = modeId === 'countdown' ? customFocus : mode.focus;
  const breakMinutes = modeId === 'countdown' ? customBreak : mode.break;

  const resetFor = (nextMode = modeId, nextPhase = 'focus') => {
    const m = FOCUS_MODES[nextMode];
    const mins = nextMode === 'countdown' ? customFocus : nextPhase === 'focus' ? m.focus : m.break;
    setPhase(nextPhase);
    setRemaining(Math.max(0, mins * 60));
    setElapsed(0);
    setRunning(false);
  };

  useEffect(() => { resetFor(modeId, 'focus'); }, [modeId]);
  useEffect(() => { const id = typeof requestedMode === 'string' ? requestedMode : requestedMode?.id; if (id && FOCUS_MODES[id]) setModeId(id); }, [requestedMode]);
  useEffect(() => {
    if (modeId === 'countdown' && !running && phase === 'focus') setRemaining(Math.max(1, customFocus) * 60);
  }, [customFocus]);

  useEffect(() => {
    onStateChange?.({ active: running, phase, modeId, timerDisplay, taskCount: tasks.filter(t => !t.done).length, arcadeLocked: running && phase === 'focus' && modeId === 'exam', seconds: isStopwatch ? elapsed : remaining, stopwatch: isStopwatch });
  }, [running, phase, modeId, timerDisplay, tasks]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed(v => v + 1);
      if (!isStopwatch) {
        setRemaining(v => {
          if (v <= 1) {
            completePhase();
            return 0;
          }
          return v - 1;
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running, isStopwatch, phase, modeId, focusMinutes, breakMinutes, tasks]);

  useEffect(() => {
    if (!running || phase !== 'focus') return;
    const activity = () => { lastActivity.current = Date.now(); idleFlag.current = false; };
    const vis = () => {
      if (document.hidden) onInspectorSignal?.({ type: 'tab-away', at: Date.now() });
      else activity();
    };
    ['pointerdown','keydown','mousemove'].forEach(evt => window.addEventListener(evt, activity, { passive: true }));
    document.addEventListener('visibilitychange', vis);
    const idleCheck = setInterval(() => {
      if (!idleFlag.current && Date.now() - lastActivity.current > 4 * 60 * 1000) {
        idleFlag.current = true;
        onInspectorSignal?.({ type: 'idle', at: Date.now() });
      }
    }, 15000);
    return () => {
      ['pointerdown','keydown','mousemove'].forEach(evt => window.removeEventListener(evt, activity));
      document.removeEventListener('visibilitychange', vis);
      clearInterval(idleCheck);
    };
  }, [running, phase]);

  function completePhase() {
    setRunning(false);
    onSfx?.('win');
    if (phase === 'focus') {
      const mins = isStopwatch ? Math.max(1, Math.round(elapsed / 60)) : Math.max(1, Math.round((focusMinutes * 60) / 60));
      setLastMinutes(mins);
      addFocusHistory({ type: 'focus', mode: modeId, minutes: mins, theme, trackName, mood, completedTasks: tasks.filter(t => t.done).length, totalTasks: tasks.length, journal: '' });
      setJournal(true);
    } else {
      addFocusHistory({ type: 'break', mode: modeId, minutes: Math.max(1, breakMinutes), theme });
      setPhase('focus');
      setRemaining(Math.max(1, focusMinutes) * 60);
      setElapsed(0);
    }
  }

  const saveJournal = () => {
    if (journalText.trim()) addFocusHistory({ type: 'journal', mode: modeId, minutes: lastMinutes, theme, trackName, mood, journal: journalText.trim() });
    setJournalText(''); setJournal(false);
    if (breakMinutes > 0) {
      setPhase('break'); setRemaining(breakMinutes * 60); setElapsed(0);
    }
  };

  const toggleRunning = () => { setRunning(v => !v); onSfx?.(running ? 'tick' : 'start'); };
  const addTask = () => {
    const text = taskText.trim(); if (!text) return;
    setTasks(v => [...v, { id: Date.now(), text, done: false }]); setTaskText('');
    onInspectorSignal?.({ type: 'task', at: Date.now() });
  };
  const pending = tasks.filter(t => !t.done).length;
  const shownTime = isStopwatch ? elapsed : remaining;
  const progress = isStopwatch ? 0 : Math.max(0, Math.min(1, 1 - remaining / Math.max(1, (phase === 'focus' ? focusMinutes : breakMinutes) * 60)));

  if (!open) return null;

  return <div className="modal-backdrop focus-backdrop" role="dialog" aria-modal="true">
    <div className="focus-console">
      <div className="focus-topline"><div><span className="kicker">FOCUS DEPARTMENT / INSPECTOR ON DUTY</span><h2>STUDY UP.</h2></div><button className="close-x" onClick={onClose}>×</button></div>

      <div className="focus-mode-strip">
        {Object.values(FOCUS_MODES).map(m => <button key={m.id} className={modeId === m.id ? 'active' : ''} onClick={() => setModeId(m.id)}><span>{m.icon}</span><b>{m.name}</b><small>{m.id === 'stopwatch' ? 'open' : `${m.focus}/${m.break}`}</small></button>)}
      </div>

      <div className="focus-layout">
        <section className="focus-clock-panel">
          <div className="phase-pill">{phase === 'focus' ? 'FOCUS SHIFT' : 'BREAK RELEASE'} · {mode.name}</div>
          <div className={`focus-clock display-${timerDisplay}`}>{timerDisplay === 'hidden' ? <span className="hidden-clock">TIMER HIDDEN — THE INSPECTOR KNOWS.</span> : <><strong>{formatClock(shownTime)}</strong>{timerDisplay === 'minimal' && <small>remaining</small>}</>}</div>
          {!isStopwatch && <div className="focus-progress"><i style={{ width: `${progress * 100}%` }}/></div>}
          <div className="focus-main-actions"><button className="primary" onClick={toggleRunning}>{running ? 'PAUSE' : elapsed || remaining !== focusMinutes * 60 ? 'RESUME' : 'START SHIFT'}</button><button onClick={() => resetFor(modeId, phase)}>RESET</button>{isStopwatch && running && <button onClick={completePhase}>FINISH</button>}</div>
          {modeId === 'countdown' && <div className="custom-time-row"><label>FOCUS MIN<input type="number" min="1" max="240" value={customFocus} onChange={e => setCustomFocus(Math.max(1, Math.min(240, Number(e.target.value) || 1)))}/></label><label>BREAK MIN<input type="number" min="0" max="60" value={customBreak} onChange={e => setCustomBreak(Math.max(0, Math.min(60, Number(e.target.value) || 0)))}/></label></div>}
          {modeId === 'writing' && <div className="word-target"><span>WORD TARGET</span><input type="number" min="50" max="10000" step="50" value={wordTarget} onChange={e => setWordTarget(Number(e.target.value) || 500)}/><button onClick={onOpenNotes}>OPEN WRITING PAD</button></div>}
          <div className="mood-check"><span>MOOD CHECK</span><div>{[['fried','😵'],['low','😐'],['steady','🙂'],['locked','😤'],['chaos','🤪']].map(([id,emoji]) => <button key={id} className={mood===id?'active':''} onClick={() => setMood(id)} title={id}>{emoji}</button>)}</div></div>
          <div className="focus-toggles">
            <label><input type="checkbox" checked={inspector} onChange={e => setInspector(e.target.checked)}/> Inspector Dog</label>
            <label><input type="checkbox" checked={musicOn} onChange={e => setMusicOn(e.target.checked)}/> Music during focus</label>
            <label>TIMER<select value={timerDisplay} onChange={e => setTimerDisplay(e.target.value)}><option value="visible">Visible</option><option value="minimal">Minimal</option><option value="hidden">Hidden</option></select></label>
          </div>
          {phase === 'break' && <button className="roulette-link" onClick={onBreakRoulette}>🎲 I NEED A BREAK IDEA</button>}
        </section>

        <section className="task-panel">
          <div className="panel-label">INSPECTOR'S TASK SHEET</div>
          <p>{pending ? `${pending} item${pending === 1 ? '' : 's'} still under investigation.` : 'No tasks yet. Suspiciously convenient.'}</p>
          <div className="task-entry"><input value={taskText} onChange={e => setTaskText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="What are you actually working on?"/><button onClick={addTask}>ADD</button></div>
          <div className="task-list">{tasks.length === 0 && <div className="empty-mini">Add up to a few concrete things. The dog will count them.</div>}{tasks.map(t => <label key={t.id} className={t.done ? 'done' : ''}><input type="checkbox" checked={t.done} onChange={() => { setTasks(v => v.map(x => x.id === t.id ? { ...x, done: !x.done } : x)); onInspectorSignal?.({ type: 'task', at: Date.now() }); }}/><span>{t.text}</span><button onClick={(e) => { e.preventDefault(); setTasks(v => v.filter(x => x.id !== t.id)); }}>×</button></label>)}</div>
          <div className="focus-rule"><b>INSPECTOR RULE</b><span>{modeId === 'exam' ? 'Arcade access is suspended while the exam timer is running.' : 'No actual surveillance. The dog only sees activity inside this page and whether the tab was hidden.'}</span></div>
        </section>
      </div>

      {journal && <div className="journal-pop"><span className="kicker">SHIFT COMPLETE</span><h3>WHAT DID YOU GET DONE?</h3><p>One sentence is enough. Future-you will see this in the session log.</p><textarea autoFocus value={journalText} onChange={e => setJournalText(e.target.value)} placeholder="Finished chapter 4 and cleaned up the notes..."/><div><button onClick={() => { setJournal(false); saveJournal(); }}>SKIP</button><button className="primary" onClick={saveJournal}>SAVE & RELEASE ME</button></div></div>}
    </div>
  </div>;
}
