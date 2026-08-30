import React, { useRef } from 'react';
import Scene from './Scene';
import { PALETTES, ROOM_FINISHES, THEMES, THEME_ORDER } from '../lib/themes';

export default function WorldTuner({ open, onClose, theme, setTheme, voidUnlocked, photo, setPhoto, photoStyle, setPhotoStyle, intensity, setIntensity, weather, setWeather, trinket, setTrinket, palette, setPalette, roomFinish, setRoomFinish }) {
  const fileRef = useRef(null);
  if (!open) return null;
  const choices = voidUnlocked ? [...THEME_ORDER, 'void'] : THEME_ORDER;
  const onImage = file => { if (!file) return; const r = new FileReader(); r.onload = () => setPhoto(r.result); r.readAsDataURL(file); };
  return <div className="modal-backdrop tuner-backdrop"><div className="world-tuner">
    <div className="modal-head"><div><span className="kicker">SECONDARY CONTROL / NOT THE MAIN EVENT</span><h2>TUNE THE WORLD.</h2><p>Change the atmosphere without leaving what you came here to do.</p></div><button onClick={onClose}>×</button></div>
    <div className="tuner-cartridges">{choices.map(id => <button key={id} className={theme===id?'active':''} onClick={()=>setTheme(id)}><Scene theme={id} preview/><span>{THEMES[id].short}</span></button>)}</div>
    <div className="tuner-grid">
      <label>VISUAL INTENSITY<input type="range" min="10" max="100" value={intensity} onChange={e=>setIntensity(Number(e.target.value))}/><small>{intensity}%</small></label>
      <label>WEATHER<select value={weather} onChange={e=>setWeather(e.target.value)}><option value="none">Clear</option><option value="rain">Rain</option><option value="snow">Snow</option><option value="fog">Fog</option><option value="sunset">Sunset</option><option value="storm">Storm</option></select></label>
      <label>PHOTO STYLE<select value={photoStyle} onChange={e=>setPhotoStyle(e.target.value)}><option value="duotone">Duotone</option><option value="pixel">Pixelate</option><option value="grain">Grain</option><option value="ink">Manga Ink</option><option value="comic">Comic Print</option><option value="original">Original</option></select></label>
      <label>COLOR PACK<select value={palette} onChange={e=>setPalette(e.target.value)}>{Object.entries(PALETTES).map(([id,p])=><option key={id} value={id}>{p.name}</option>)}</select></label>
      <label>ROOM FINISH<select value={roomFinish} onChange={e=>setRoomFinish(e.target.value)}>{Object.entries(ROOM_FINISHES).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
      <label>DESK OBJECT<select value={trinket} onChange={e=>setTrinket(e.target.value)}><option value="none">None</option><option value="mug">Coffee mug</option><option value="lava">Lava lamp</option><option value="plant">Tiny plant</option><option value="poster">Mystery poster</option><option value="disco">Tiny disco ball</option><option value="aquarium">Desktop aquarium</option><option value="clock">Melting clock</option><option value="trophy">Suspicious trophy</option><option value="ducklamp">Duck lamp</option></select></label>
    </div>
    <div className="tuner-photo"><input ref={fileRef} hidden type="file" accept="image/*" onChange={e=>onImage(e.target.files?.[0])}/><button onClick={()=>fileRef.current?.click()}>{photo?'REPLACE PHOTO':'ADD MY PHOTO'}</button>{photo&&<button onClick={()=>setPhoto(null)}>REMOVE PHOTO</button>}</div>
    <div className="tuner-actions"><button className="primary" onClick={onClose}>DONE — BACK TO WHAT I WAS DOING</button></div>
  </div></div>;
}
