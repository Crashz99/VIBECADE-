import React, { useEffect, useMemo, useState } from 'react';
import { loadNotes, saveNotes } from '../lib/storage';

export default function Scratchpad({ onClose, onPinChange }) {
  const [tab, setTab] = useState('quick');
  const [notes, setNotes] = useState(loadNotes());
  const [text, setText] = useState('');
  const [writing, setWriting] = useState('');
  const [target, setTarget] = useState(500);

  useEffect(() => { saveNotes(notes); onPinChange?.(notes.filter(n => n.pinned)); }, [notes]);
  const words = useMemo(() => writing.trim() ? writing.trim().split(/\s+/).length : 0, [writing]);

  const add = () => {
    const value = text.trim(); if (!value) return;
    setNotes(v => [{ id: Date.now(), text: value, pinned: false, createdAt: new Date().toISOString() }, ...v]); setText('');
  };

  return <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="modal-card notes-card">
      <div className="modal-head"><div><span className="kicker">SCRATCHPAD / LOCAL NOTES</span><h2>JOT IT DOWN.</h2></div><button onClick={onClose}>×</button></div>
      <div className="tab-strip"><button className={tab === 'quick' ? 'active' : ''} onClick={() => setTab('quick')}>QUICK NOTES</button><button className={tab === 'writing' ? 'active' : ''} onClick={() => setTab('writing')}>WRITING PAD</button></div>
      {tab === 'quick' ? <>
        <div className="note-entry"><textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') add(); }} placeholder="Dump the thought before it escapes..."/><button className="primary" onClick={add}>SAVE NOTE</button></div>
        <div className="notes-list">{notes.length === 0 && <div className="empty-mini">No notes. Either serene or dangerous.</div>}{notes.map(note => <article key={note.id} className={note.pinned ? 'pinned' : ''}><p>{note.text}</p><small>{new Date(note.createdAt).toLocaleString()}</small><div><button onClick={() => setNotes(v => v.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n))}>{note.pinned ? 'UNPIN' : 'PIN TO VIBE'}</button><button onClick={() => setNotes(v => v.filter(n => n.id !== note.id))}>DELETE</button></div></article>)}</div>
      </> : <>
        <div className="writing-toolbar"><label>WORD TARGET<input type="number" min="50" max="10000" step="50" value={target} onChange={e => setTarget(Math.max(50, Number(e.target.value) || 500))}/></label><div><b>{words}</b><span>/ {target} words</span></div></div>
        <div className="writing-progress"><i style={{ width: `${Math.min(100, words / target * 100)}%` }}/></div>
        <textarea className="writing-pad" value={writing} onChange={e => setWriting(e.target.value)} placeholder="Start writing. The rest of VIBECADE can stay out of the way."/>
        <div className="inline-actions"><button onClick={() => setWriting('')}>CLEAR</button><button className="primary" onClick={() => { if (writing.trim()) { setNotes(v => [{ id: Date.now(), text: writing.trim(), pinned: false, createdAt: new Date().toISOString(), longform: true }, ...v]); setWriting(''); setTab('quick'); } }}>SAVE TO NOTES</button></div>
      </>}
    </div>
  </div>;
}
