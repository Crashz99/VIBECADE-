import React from 'react';

export default function VibeDock({ hidden, zen, onZen, onFocus, onNotes, onSound, onWeather, onStats, onArcade, arcadeLocked, onCommand }) {
  if (hidden && !zen) return null;
  return <div className={`vibe-dock ${zen ? 'zen-dock' : ''}`}>
    {zen ? <button className="dock-zen-exit" onClick={onZen}>EXIT ZEN</button> : <>
      <button onClick={onFocus}><span>◎</span><b>FOCUS</b><small>F</small></button>
      <button onClick={onNotes}><span>✎</span><b>NOTES</b><small>N</small></button>
      <button onClick={onSound}><span>♫</span><b>SOUND</b><small>M</small></button>
      <button onClick={onWeather}><span>☂</span><b>WEATHER</b><small>W</small></button>
      <button onClick={onStats}><span>▦</span><b>STATS</b><small>S</small></button>
      <button onClick={onArcade} disabled={arcadeLocked} title={arcadeLocked ? 'Exam mode locked the arcade.' : ''}><span>⌁</span><b>ARCADE</b><small>A</small></button>
      <button onClick={onZen}><span>◌</span><b>ZEN</b><small>Z</small></button>
      <button onClick={onCommand}><span>/</span><b>COMMAND</b><small>/</small></button>
    </>}
  </div>;
}
