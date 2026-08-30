import React, { useState } from 'react';

const ideas = [
  ['💧','GET WATER','Leave the screen. Acquire water. Return as a hydrated person.'],
  ['🧍','STRETCH','Shoulders, neck, wrists. Thirty seconds is enough.'],
  ['👀','LOOK FAR AWAY','Find something across the room or outside. Let your eyes reset.'],
  ['🐈','POKE THE CAT','One sanctioned act of procrastination.'],
  ['🎮','ARCADE BREAK','One tiny game. Not seventeen tiny games.'],
  ['🌬','BREATHE','Four slow breaths. No productivity metric attached.'],
  ['🚶','WALK','Walk around for two minutes. Inspector Dog permits it.'],
];

export default function BreakRoulette({ onClose, onArcade, onSfx }) {
  const [pick, setPick] = useState(null);
  const spin = () => { const p=ideas[Math.floor(Math.random()*ideas.length)]; setPick(p); onSfx?.('win'); };
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card roulette-card"><div className="modal-head"><div><span className="kicker">BREAK ROULETTE</span><h2>DO SOMETHING ELSE.</h2></div><button onClick={onClose}>×</button></div><div className={`roulette-result ${pick?'picked':''}`}>{pick ? <><span>{pick[0]}</span><b>{pick[1]}</b><p>{pick[2]}</p></> : <><span>?</span><b>THE WHEEL KNOWS</b><p>Spin for a short break suggestion.</p></>}</div><div className="stats-actions"><button className="primary" onClick={spin}>{pick?'SPIN AGAIN':'SPIN THE WHEEL'}</button>{pick?.[1]==='ARCADE BREAK' && <button onClick={onArcade}>OPEN ARCADE</button>}</div></div></div>;
}
