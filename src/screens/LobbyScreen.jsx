import React, { useEffect, useState } from 'react';
import WhistleDuck from '../components/WhistleDuck';
import CurioShelf from '../components/CurioShelf';

const ROOMS = [
  ['music','♫','MUSIC ROOM','Playlists, reactive worlds, ambience.','go listen'],
  ['study','◎','STUDY HALL','Focus shifts, Inspector Dog, levels.','clock in'],
  ['notes','✎','SCRATCHPAD','Jot, write, pin things to the world.','scribble'],
  ['arcade','⌁','ARCADE','Tiny games. Questionable productivity.','waste 45 seconds'],
  ['schedule','◷','SCHEDULE','Plan shifts and let the duck yell about time.','plan something'],
];

export default function LobbyScreen({ onGo, onTune, onStats, onAbout, intro = false, onIntroDone, unlocks = [] }) {
  const [showIntro, setShowIntro] = useState(intro);
  useEffect(()=>{ if(!intro) return; const t=setTimeout(()=>{setShowIntro(false); onIntroDone?.();}, 5600); return()=>clearTimeout(t); },[intro]);
  return <main className="lobby-screen">
    {showIntro && <div className="stair-intro"><button onClick={()=>{setShowIntro(false);onIntroDone?.();}}>SKIP</button><div className="bw-stairs">{Array.from({length:9},(_,i)=><i key={i}/>)}</div><div className="falling-piano"><span>♩</span><b>PIANO</b><i/><i/><i/></div><div className="piano-crash">KRRRANG!</div><div className="duck-escape"><WhistleDuck active message="Nothing to report."/></div></div>}
    <section className="lobby-hero"><span className="kicker">VIBECADE / LOBBY</span><h1>WHERE ARE YOU GOING?</h1><p>Music is one room now. Studying is another. Notes are another. The world settings stay out of your face until you ask for them.</p><div className="lobby-mini-nav"><button className="text-button" onClick={onTune}>⚙ tune the world</button><button className="text-button" onClick={onStats}>▦ session log</button><button className="text-button" onClick={onAbout}>? about</button></div></section>
    <section className="room-grid">{ROOMS.map(([id,icon,name,desc,cta],idx)=><button key={id} className={`room-card room-${id}`} onClick={()=>onGo(id)}><div className="room-number">0{idx+1}</div><span className="room-icon">{icon}</span><h2>{name}</h2><p>{desc}</p><small>{cta} →</small></button>)}</section>
    <CurioShelf unlocks={unlocks}/>
    <div className="lobby-characters"><WhistleDuck active message="Schedule department. Keep moving."/></div>
  </main>;
}
