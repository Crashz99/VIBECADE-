import React, { useMemo, useState } from 'react';

const COMMANDS = [
  ['focus','Open Focus / Pomodoro'],['notes','Open Scratchpad'],['sound','Open Sound Mixer'],['weather','Open Weather'],['stats','Open Stats'],['arcade','Open Arcade'],['zen','Toggle Zen mode'],['pixel','Switch to Pixel Dreams'],['city','Switch to Night City'],['manga','Switch to Ink'],['comic','Switch to Panel Breaker'],['random','Randomize cartridge + weather'],['clear weather','Set weather to clear'],['rain','Set weather to rain'],['snow','Set weather to snow'],['fog','Set weather to fog'],
];

export default function CommandPalette({ onClose, run }) {
  const [q,setQ]=useState('');
  const shown=useMemo(()=>COMMANDS.filter(c=>c.join(' ').toLowerCase().includes(q.toLowerCase())).slice(0,12),[q]);
  return <div className="command-backdrop" onMouseDown={onClose}><div className="command-card" onMouseDown={e=>e.stopPropagation()}><div className="command-input"><span>›</span><input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Type a command..." onKeyDown={e=>{if(e.key==='Escape')onClose();if(e.key==='Enter'&&shown[0]){run(shown[0][0]);onClose();}}}/><kbd>ESC</kbd></div><div className="command-list">{shown.map(([cmd,label])=><button key={cmd} onClick={()=>{run(cmd);onClose();}}><b>/{cmd}</b><span>{label}</span></button>)}</div></div></div>;
}
