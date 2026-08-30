import React, { useRef } from 'react';
import { THEMES } from '../lib/themes';

export default function MusicRoomScreen({ theme, playing, toggleAudio, trackName, playlist, currentTrackId, addTracks, playTrack, removeTrack, moveTrack, onPrevious, onNext, onTune, onHome, audioLevel, onSound }) {
  const input = useRef(null); const t = THEMES[theme] || THEMES.pixel;
  return <main className="room-screen music-room-screen"><div className="room-toolbar"><button onClick={onHome}>← LOBBY</button><span>ROOM 01</span><button onClick={onTune}>⚙ TUNE WORLD</button></div>
    <section className="music-stage"><div className="music-title"><span className="kicker">NOW OCCUPYING / {t.short}</span><h1>MUSIC ROOM</h1><p>The cartridge reacts. The queue survives refreshes. Your files stay on this device.</p></div>
      <div className="record-player"><div className={`vinyl ${playing?'spin':''}`}><i/><b>V</b></div><div className="now-playing"><small>NOW PLAYING</small><h2>{trackName}</h2><div className="room-eq">{Array.from({length:18},(_,i)=><i key={i} style={{height:`${8+Math.max(0,audioLevel)*(8+(i%6)*5)}px`}}/>)}</div><div className="transport"><button onClick={onPrevious}>◀</button><button className="primary" onClick={toggleAudio}>{playing?'❚❚':'▶'}</button><button onClick={onNext}>▶</button></div><button onClick={onSound}>MIX AMBIENCE</button></div></div>
    </section>
    <section className="playlist-room"><div className="playlist-head"><div><span className="panel-label">LOCAL TRACK SHELF</span><h3>{playlist.length} TRACK{playlist.length===1?'':'S'}</h3></div><><input ref={input} hidden type="file" multiple accept="audio/*" onChange={e=>addTracks(e.target.files)}/><button onClick={()=>input.current?.click()}>+ ADD TRACKS</button></></div>
      <div className="playlist-table">{playlist.map((item,index)=><article key={item.id} className={currentTrackId===item.id?'active':''}><button className="track-main" onClick={()=>playTrack(item.id)}><span>{String(index+1).padStart(2,'0')}</span><b>{item.name}</b></button><div><button onClick={()=>moveTrack(item.id,-1)} disabled={index===0}>↑</button><button onClick={()=>moveTrack(item.id,1)} disabled={index===playlist.length-1}>↓</button><button onClick={()=>removeTrack(item.id)}>×</button></div></article>)}{!playlist.length&&<div className="empty-room">Your shelf is empty. Add a few tracks or use the procedural demo loop.</div>}</div>
    </section>
  </main>;
}
