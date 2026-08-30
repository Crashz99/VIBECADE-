import React, { useMemo } from 'react';
import { dayKey } from '../lib/focus';
import { exportLocalData, loadFocusHistory, loadNotes, loadScores, loadSessionHistory } from '../lib/storage';

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export default function StatsModal({ onClose }) {
  const history = loadFocusHistory();
  const sessions = loadSessionHistory();
  const notes = loadNotes();
  const scores = loadScores();
  const stats = useMemo(() => {
    const focus = history.filter(x => x.type === 'focus');
    const total = focus.reduce((s,x) => s + Number(x.minutes || 0), 0);
    const days = {};
    focus.forEach(x => { const k = String(x.createdAt || '').slice(0,10); days[k] = (days[k] || 0) + Number(x.minutes || 0); });
    const themes = {};
    focus.forEach(x => { themes[x.theme || 'pixel'] = (themes[x.theme || 'pixel'] || 0) + Number(x.minutes || 0); });
    const favorite = Object.entries(themes).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';
    const recentDays = Array.from({length:28}, (_,i) => { const d = new Date(); d.setDate(d.getDate() - (27-i)); const k=dayKey(d); return { key:k, minutes:days[k]||0 }; });
    let streak = 0; for(let i=0;i<365;i++){ const d=new Date(); d.setDate(d.getDate()-i); if(days[dayKey(d)]) streak++; else if(i>0) break; }
    return { focus, total, favorite, recentDays, streak };
  }, [history]);

  const achievements = [
    ['FIRST SHIFT', stats.focus.length >= 1, 'Complete one focus session.'],
    ['INSPECTOR APPROVED', stats.total >= 100, 'Spend 100 minutes under supervision.'],
    ['BOSS SURVIVOR', history.some(x => x.type === 'focus' && x.mode === 'boss'), 'Complete a Boss Focus.'],
    ['NOTE GOBLIN', notes.length >= 10, 'Save 10 scratchpad notes.'],
    ['THREE DAY INCIDENT', stats.streak >= 3, 'Focus on three consecutive days.'],
    ['ARCADE LIABILITY', Object.values(scores).some(v => Number(v) >= 20), 'Get suspiciously good at a mini-game.'],
  ];

  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card stats-card">
    <div className="modal-head"><div><span className="kicker">LOCAL STATS / NO ACCOUNT REQUIRED</span><h2>YOUR VIBE LOG.</h2></div><button onClick={onClose}>×</button></div>
    <div className="stats-kpis"><div><b>{stats.total}</b><span>FOCUS MINUTES</span></div><div><b>{stats.focus.length}</b><span>FOCUS SHIFTS</span></div><div><b>{stats.streak}</b><span>DAY STREAK</span></div><div><b>{String(stats.favorite).toUpperCase()}</b><span>TOP CARTRIDGE</span></div></div>
    <section className="heat-section"><div className="panel-label">LAST 28 DAYS</div><div className="heat-grid">{stats.recentDays.map(d => <i key={d.key} title={`${d.key}: ${d.minutes} min`} style={{ '--heat': Math.min(1, d.minutes/90) }}/>)}</div></section>
    <section><div className="panel-label">ACHIEVEMENTS</div><div className="achievement-grid">{achievements.map(([name,done,desc]) => <article key={name} className={done ? 'done' : ''}><span>{done ? '★' : '☆'}</span><div><b>{name}</b><small>{desc}</small></div></article>)}</div></section>
    <section><div className="panel-label">RECENT SHIFTS</div><div className="history-list">{stats.focus.slice(0,8).map(x => <article key={x.id}><b>{String(x.mode||'focus').toUpperCase()}</b><span>{x.minutes} min · {String(x.theme||'pixel').toUpperCase()}</span><small>{new Date(x.createdAt).toLocaleString()}</small></article>)}{stats.focus.length===0 && <div className="empty-mini">No focus shifts yet. Inspector Dog is unemployed.</div>}</div></section>
    <section className="session-history-section"><div className="panel-label">VIBE SESSION HISTORY</div><p className="history-explainer">Launching the player now creates a local session record, including cartridge, tracks used and how long the vibe stayed open.</p><div className="history-list session-history">{sessions.slice(0,12).map(x => <article key={x.id}><b>{String(x.theme || 'pixel').toUpperCase()}</b><span>{formatSessionDuration(x)} · {(x.tracks?.length || 0) ? x.tracks.join(' / ') : (x.lastTrack || x.trackName || 'Demo loop')}</span><small>{new Date(x.startedAt).toLocaleString()}</small></article>)}{sessions.length===0 && <div className="empty-mini">No vibe sessions saved yet. Launch a cartridge and hang out for a bit.</div>}</div></section>
    <div className="stats-actions"><button onClick={() => downloadJson(exportLocalData(), `vibecade-export-${dayKey()}.json`)}>EXPORT MY LOCAL DATA</button><button className="primary" onClick={onClose}>BACK TO VIBE</button></div>
  </div></div>;
}

function formatSessionDuration(session) {
  const seconds = Number(session.durationSeconds || 0);
  if (seconds > 0 && seconds < 60) return `${seconds}s`;
  const minutes = Number(session.durationMinutes || 0);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}
