import React, { useEffect, useMemo, useState } from 'react';
import { loadPresets, savePresets } from '../lib/storage';

const WEATHER = [
  ['none','CLEAR','No weather overlay'],
  ['rain','RAIN','Soft rain across every cartridge'],
  ['snow','SNOW','Slow pixel snow'],
  ['fog','FOG','Low drifting haze'],
  ['sunset','SUNSET','Warm late-day wash'],
  ['storm','STORM','Rain + occasional flashes'],
];

export default function UtilityPanel({ tab = 'sound', onClose, ambient, setAmbient, weather, setWeather, musicVolume, setMusicVolume, currentPreset, applyPreset, onSfx }) {
  const [active, setActive] = useState(tab);
  const [presets, setPresets] = useState(loadPresets());
  const [name, setName] = useState('');
  useEffect(() => { setActive(tab); }, [tab]);

  const saveCurrent = () => {
    const n = name.trim(); if (!n) return;
    const next = [{ id: Date.now(), name: n, ...currentPreset }, ...presets].slice(0, 24);
    setPresets(next); savePresets(next); setName(''); onSfx?.('coin');
  };

  const updateAmbient = (key, value) => setAmbient({ ...ambient, [key]: Number(value) });

  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card utility-card">
    <div className="modal-head"><div><span className="kicker">VIBE CONTROLS</span><h2>TUNE THE ROOM.</h2></div><button onClick={onClose}>×</button></div>
    <div className="tab-strip"><button className={active === 'sound' ? 'active' : ''} onClick={() => setActive('sound')}>SOUND</button><button className={active === 'weather' ? 'active' : ''} onClick={() => setActive('weather')}>WEATHER</button><button className={active === 'presets' ? 'active' : ''} onClick={() => setActive('presets')}>PRESETS</button></div>

    {active === 'sound' && <div className="utility-section"><p className="utility-lead">Layer procedural ambience under the soundtrack. Everything is generated locally in your browser.</p><label className="mixer-row"><span>♫ MUSIC</span><input type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))}/><b>{Math.round(musicVolume*100)}</b></label>{Object.entries(ambient).map(([key,val]) => <label className="mixer-row" key={key}><span>{key === 'rain' ? '☂ RAIN' : key === 'cafe' ? '☕ CAFE' : key === 'fire' ? '🔥 FIRE' : '◉ VINYL'}</span><input type="range" min="0" max="1" step="0.01" value={val} onChange={e => updateAmbient(key,e.target.value)}/><b>{Math.round(val*100)}</b></label>)}<div className="sound-presets"><button onClick={() => setAmbient({rain:.55,cafe:0,fire:0,vinyl:.1})}>RAINY WINDOW</button><button onClick={() => setAmbient({rain:0,cafe:.38,fire:0,vinyl:.18})}>CAFE CORNER</button><button onClick={() => setAmbient({rain:.1,cafe:0,fire:.45,vinyl:.25})}>FIREPLACE TAPE</button><button onClick={() => setAmbient({rain:0,cafe:0,fire:0,vinyl:0})}>SILENCE AMBIENCE</button></div></div>}

    {active === 'weather' && <div className="weather-grid">{WEATHER.map(([id,label,desc]) => <button key={id} className={weather === id ? 'active' : ''} onClick={() => { setWeather(id); onSfx?.('tick'); }}><span className={`weather-icon ${id}`}/><b>{label}</b><small>{desc}</small></button>)}</div>}

    {active === 'presets' && <div className="preset-section"><p className="utility-lead">Save the current cartridge + visual treatment + weather + ambience as a reusable setup.</p><div className="preset-entry"><input value={name} onChange={e => setName(e.target.value)} placeholder="2AM coding, rainy reading..." onKeyDown={e => e.key === 'Enter' && saveCurrent()}/><button className="primary" onClick={saveCurrent}>SAVE CURRENT</button></div><div className="preset-list">{presets.length === 0 && <div className="empty-mini">No presets yet. Save one when the room feels right.</div>}{presets.map(p => <article key={p.id}><div><b>{p.name}</b><small>{String(p.theme || '').toUpperCase()} · {String(p.weather || 'clear').toUpperCase()}</small></div><button onClick={() => { applyPreset(p); onClose(); }}>LOAD</button><button onClick={() => { const next = presets.filter(x => x.id !== p.id); setPresets(next); savePresets(next); }}>×</button></article>)}</div></div>}
  </div></div>;
}
