import React, { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Scene from './components/Scene';
import Cat from './components/Cat';
import InspectorDog from './components/InspectorDog';
import MiniGame from './components/MiniGame';
import FocusPanel from './components/FocusPanel';
import Scratchpad from './components/Scratchpad';
import UtilityPanel from './components/UtilityPanel';
import StatsModal from './components/StatsModal';
import BreakRoulette from './components/BreakRoulette';
import VibeDock from './components/VibeDock';
import CommandPalette from './components/CommandPalette';
import WorldTuner from './components/WorldTuner';
import EncounterDirector from './components/EncounterDirector';
import CreatorFooter from './components/CreatorFooter';
import LobbyScreen from './screens/LobbyScreen';
import MusicRoomScreen from './screens/MusicRoomScreen';
import StudyHallScreen from './screens/StudyHallScreen';
import NotesRoomScreen from './screens/NotesRoomScreen';
import ArcadeRoomScreen from './screens/ArcadeRoomScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import { PALETTES, THEMES, THEME_ORDER } from './lib/themes';
import { AudioEngine } from './lib/audio';
import { formatClock } from './lib/focus';
import {
  deleteTrackFile,
  isVoidUnlocked,
  loadNotes,
  loadPlaylist,
  loadPrefs,
  loadSetup,
  loadTrackFile,
  loadUnlocks,
  savePlaylist,
  savePrefs,
  saveSetup,
  saveTrackFile,
  startVibeSession,
  unlockVoid,
  updateVibeSession,
} from './lib/storage';

const initial = loadSetup() || { theme: 'pixel', photo: null, photoStyle: 'duotone', intensity: 65, trinket: 'none', palette: 'cartridge', roomFinish: 'arcade' };
const prefInitial = loadPrefs();

export default function App() {
  const [screen, setScreen] = useState('start');
  const [theme, setTheme] = useState(initial.theme || 'pixel');
  const [photo, setPhoto] = useState(initial.photo || null);
  const [photoStyle, setPhotoStyle] = useState(initial.photoStyle === 'pixelate' ? 'pixel' : initial.photoStyle === 'manga' ? 'ink' : (initial.photoStyle || 'duotone'));
  const [intensity, setIntensity] = useState(initial.intensity ?? 65);
  const [trinket, setTrinket] = useState(initial.trinket || 'none');
  const [palette, setPalette] = useState(initial.palette || 'cartridge');
  const [roomFinish, setRoomFinish] = useState(initial.roomFinish || 'arcade');
  const [unlocks, setUnlocks] = useState(loadUnlocks());
  const [weather, setWeather] = useState(prefInitial.weather || 'none');
  const [ambient, setAmbient] = useState(prefInitial.ambient || { rain: 0, cafe: 0, fire: 0, vinyl: 0 });
  const [musicVolume, setMusicVolume] = useState(.68);
  const [zen, setZen] = useState(Boolean(prefInitial.zen));
  const [inspector, setInspector] = useState(prefInitial.inspector !== false);
  const [timerDisplay, setTimerDisplay] = useState(prefInitial.timerDisplay || 'visible');
  const [about, setAbout] = useState(false);
  const [arcade, setArcade] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [utility, setUtility] = useState(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [roulette, setRoulette] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [tunerOpen, setTunerOpen] = useState(false);
  const [lobbyIntro, setLobbyIntro] = useState(false);
  const [requestedFocusMode, setRequestedFocusMode] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [focusMusic, setFocusMusic] = useState(true);
  const [trackName, setTrackName] = useState('VIBECADE DEMO LOOP');
  const [playlist, setPlaylist] = useState(loadPlaylist());
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [voidUnlocked, setVoidUnlocked] = useState(isVoidUnlocked());
  const [pinnedNotes, setPinnedNotes] = useState(loadNotes().filter(n => n.pinned));
  const [focusState, setFocusState] = useState({ active: false, phase: 'focus', modeId: 'pomodoro', seconds: 1500, taskCount: 0, arcadeLocked: false });
  const [inspectorSignal, setInspectorSignal] = useState(null);
  const audioRef = useRef(null);
  const keys = useRef([]);
  const playlistRef = useRef(playlist);
  const currentTrackIdRef = useRef(currentTrackId);
  const sessionRef = useRef(null);
  const liveSessionValues = useRef({ theme, weather, trackName });

  if (!audioRef.current && typeof window !== 'undefined') audioRef.current = new AudioEngine(setAudioLevel);
  const current = THEMES[theme] || THEMES.pixel;
  const choices = voidUnlocked ? [...THEME_ORDER, 'void'] : THEME_ORDER;

  useEffect(() => {
    const t = THEMES[theme] || THEMES.pixel;
    const p = PALETTES[palette] || PALETTES.cartridge;
    document.documentElement.style.setProperty('--accent', p.accent || t.accent);
    document.documentElement.style.setProperty('--accent2', p.accent2 || t.accent2);
    document.documentElement.style.setProperty('--accent3', p.accent3 || t.accent3);
  }, [theme, palette]);

  useEffect(() => { saveSetup({ theme, photo, photoStyle, intensity, trinket, palette, roomFinish }); }, [theme, photo, photoStyle, intensity, trinket, palette, roomFinish]);
  useEffect(() => { savePrefs({ ...loadPrefs(), weather, ambient, zen, inspector, timerDisplay, dockVisible: false }); }, [weather, ambient, zen, inspector, timerDisplay]);
  useEffect(() => { savePlaylist(playlist); playlistRef.current = playlist; }, [playlist]);
  useEffect(() => { currentTrackIdRef.current = currentTrackId; }, [currentTrackId]);
  useEffect(() => { liveSessionValues.current = { theme, weather, trackName }; }, [theme, weather, trackName]);
  useEffect(() => () => audioRef.current?.destroy(), []);

  useEffect(() => { audioRef.current?.setMusicVolume(musicVolume); }, [musicVolume]);
  useEffect(() => { Object.entries(ambient).forEach(([kind, level]) => { if (level > 0 || audioRef.current?.ctx) audioRef.current?.setAmbient(kind, level); }); }, [ambient]);

  useEffect(() => {
    const media = audioRef.current?.media;
    if (!media) return;
    const onEnded = () => {
      if (playlistRef.current.length) playNextTrack(true);
      else setPlaying(false);
    };
    media.addEventListener('ended', onEnded);
    return () => media.removeEventListener('ended', onEnded);
  }, []);

  useEffect(() => {
    const onBeforeUnload = () => finalizeSession();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    if (!focusState.active) return;
    if (focusMusic && !playing) { audioRef.current?.play(theme); setPlaying(true); }
    if (!focusMusic && playing) { audioRef.current?.pause(); setPlaying(false); }
  }, [focusMusic, focusState.active]);

  useEffect(() => {
    const target = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    const handler = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      const editing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      keys.current = [...keys.current, k].slice(-target.length);
      if (keys.current.join('|') === target.join('|')) {
        unlockVoid(); setVoidUnlocked(true); setTheme('void'); setTunerOpen(true); audioRef.current?.sfx('win'); return;
      }
      if (editing) return;
      if (e.key === '/') { e.preventDefault(); setCommandOpen(true); }
      else if (k === 'f') setFocusOpen(true);
      else if (k === 'n') setNotesOpen(true);
      else if (k === 'a' && !focusState.arcadeLocked) setArcade(true);
      else if (k === 'm') setUtility('sound');
      else if (k === 'w') setUtility('weather');
      else if (k === 's') setStatsOpen(true);
      else if (k === 'z') setZen(v => !v);
      else if (k === 'v') setTunerOpen(true);
      else if (e.key === 'Escape') { setAbout(false); setArcade(false); setNotesOpen(false); setUtility(null); setStatsOpen(false); setRoulette(false); setCommandOpen(false); setFocusOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusState.arcadeLocked]);

  const selectTheme = (id) => setTheme(id);
  const toggleAudio = async () => { if (playing) { audioRef.current.pause(); setPlaying(false); } else { await audioRef.current.play(theme); setPlaying(true); } };

  async function playPlaylistTrack(id) {
    const item = playlistRef.current.find(track => track.id === id);
    if (!item) return;
    try {
      const file = await loadTrackFile(id);
      if (!file) return;
      await audioRef.current.setTrack(file);
      setCurrentTrackId(id);
      setTrackName(item.name);
      setPlaying(true);
      recordSessionTrack(item.name);
    } catch {
      setTrackName(`${item.name} — re-add file`);
      setPlaying(false);
    }
  }

  async function addTracks(files) {
    const incoming = Array.from(files || []).filter(file => file?.type?.startsWith('audio/'));
    if (!incoming.length) return;
    const room = Math.max(0, 100 - playlistRef.current.length);
    const chosen = incoming.slice(0, room);
    const added = [];
    for (const file of chosen) {
      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      await saveTrackFile(id, file);
      added.push({ id, name: file.name, type: file.type, size: file.size, addedAt: new Date().toISOString() });
    }
    const next = [...playlistRef.current, ...added];
    playlistRef.current = next;
    setPlaylist(next);
    if (!currentTrackIdRef.current && added[0]) await playPlaylistTrack(added[0].id);
  }

  async function removeTrack(id) {
    await deleteTrackFile(id).catch(() => {});
    const currentIndex = playlistRef.current.findIndex(track => track.id === id);
    const next = playlistRef.current.filter(track => track.id !== id);
    playlistRef.current = next;
    setPlaylist(next);
    if (currentTrackIdRef.current === id) {
      const fallback = next[Math.min(currentIndex, Math.max(0, next.length - 1))];
      if (fallback) await playPlaylistTrack(fallback.id);
      else {
        audioRef.current.pause();
        audioRef.current.usingUpload = false;
        setCurrentTrackId(null);
        setTrackName('VIBECADE DEMO LOOP');
        setPlaying(false);
      }
    }
  }

  function moveTrack(id, direction) {
    const list = [...playlistRef.current];
    const index = list.findIndex(track => track.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return;
    [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
    playlistRef.current = list;
    setPlaylist(list);
  }

  async function playNextTrack(fromEnded = false) {
    const list = playlistRef.current;
    if (!list.length) return;
    const index = Math.max(-1, list.findIndex(track => track.id === currentTrackIdRef.current));
    const next = list[(index + 1) % list.length];
    await playPlaylistTrack(next.id);
    if (fromEnded) setPlaying(true);
  }

  async function playPreviousTrack() {
    const list = playlistRef.current;
    if (!list.length) return;
    const found = list.findIndex(track => track.id === currentTrackIdRef.current);
    const index = found < 0 ? 0 : found;
    const previous = list[(index - 1 + list.length) % list.length];
    await playPlaylistTrack(previous.id);
  }

  function recordSessionTrack(name) {
    if (!sessionRef.current || !name || name === 'VIBECADE DEMO LOOP') return;
    const tracks = Array.from(new Set([...(sessionRef.current.tracks || []), name]));
    sessionRef.current = { ...sessionRef.current, tracks };
    updateVibeSession(sessionRef.current.id, { tracks, lastTrack: name });
  }

  function launchSession() {
    finalizeSession();
    const session = startVibeSession({
      theme,
      weather,
      trackName,
      tracks: trackName === 'VIBECADE DEMO LOOP' ? [] : [trackName],
    });
    sessionRef.current = { ...session, startedMs: Date.now() };
    setScreen('player');
  }

  function finalizeSession() {
    if (!sessionRef.current) return;
    const endedAt = new Date();
    const elapsedMs = Math.max(0, Date.now() - Number(sessionRef.current.startedMs || Date.now()));
    const live = liveSessionValues.current;
    updateVibeSession(sessionRef.current.id, {
      endedAt: endedAt.toISOString(),
      durationSeconds: Math.round(elapsedMs / 1000),
      durationMinutes: Math.max(0, Math.round(elapsedMs / 60000)),
      theme: live.theme,
      weather: live.weather,
      lastTrack: live.trackName,
      tracks: sessionRef.current.tracks || [],
    });
    sessionRef.current = null;
  }

  const exitSession = () => { finalizeSession(); setScreen('lobby'); };
  const goHome = () => { finalizeSession(); setScreen('lobby'); };
  const goRoom = (id) => {
    if (screen === 'music' && id !== 'music') finalizeSession();
    if (id === 'music' && screen !== 'music') {
      const session = startVibeSession({ theme, weather, trackName, tracks: trackName === 'VIBECADE DEMO LOOP' ? [] : [trackName] });
      sessionRef.current = { ...session, startedMs: Date.now() };
    }
    setScreen(id);
  };
  const startScheduledFocus = (modeId = 'pomodoro') => { setRequestedFocusMode({ id: modeId === 'custom' ? 'countdown' : modeId, at: Date.now() }); setScreen('study'); setFocusOpen(true); };
  const openArcade = () => { if (!focusState.arcadeLocked) setArcade(true); else { setInspectorSignal({ type: 'task', at: Date.now() }); audioRef.current?.sfx('fail'); } };

  const randomize = () => {
    const pool = voidUnlocked ? [...THEME_ORDER, 'void'] : THEME_ORDER;
    setTheme(pool[Math.floor(Math.random()*pool.length)]);
    setIntensity(35 + Math.floor(Math.random()*66));
    const w = ['none','rain','snow','fog','sunset']; setWeather(w[Math.floor(Math.random()*w.length)]);
    const palettes = Object.keys(PALETTES); setPalette(palettes[Math.floor(Math.random()*palettes.length)]);
    const finishes = ['arcade','glass','paper','chrome','soft','brutal']; setRoomFinish(finishes[Math.floor(Math.random()*finishes.length)]);
    audioRef.current?.sfx('win');
  };
  const daily = () => { const d=new Date(); const idx=(d.getFullYear()*372+d.getMonth()*31+d.getDate())%THEME_ORDER.length; setTheme(THEME_ORDER[idx]); audioRef.current?.sfx('coin'); };

  const applyPreset = p => {
    if (p.theme && THEMES[p.theme]) setTheme(p.theme);
    if (p.photoStyle) setPhotoStyle(p.photoStyle);
    if (Number.isFinite(p.intensity)) setIntensity(p.intensity);
    if (p.weather) setWeather(p.weather);
    if (p.ambient) setAmbient(p.ambient);
    if (p.trinket) setTrinket(p.trinket);
    if (p.palette) setPalette(p.palette);
    if (p.roomFinish) setRoomFinish(p.roomFinish);
  };

  const runCommand = cmd => {
    if (cmd === 'focus') { setScreen('study'); setFocusOpen(true); }
    else if (cmd === 'notes') { setScreen('notes'); setNotesOpen(true); }
    else if (cmd === 'sound') setUtility('sound');
    else if (cmd === 'weather') setUtility('weather');
    else if (cmd === 'stats') setStatsOpen(true);
    else if (cmd === 'arcade') { setScreen('arcade'); openArcade(); }
    else if (cmd === 'zen') setZen(v=>!v);
    else if (cmd === 'random') randomize();
    else if (THEMES[cmd]) setTheme(cmd);
    else if (['rain','snow','fog'].includes(cmd)) setWeather(cmd);
    else if (cmd === 'clear weather') setWeather('none');
  };

  const presetSnapshot = { theme, photoStyle, intensity, weather, ambient, trinket, palette, roomFinish };

  return <div className={`app theme-${theme} palette-${palette} finish-${roomFinish} screen-${screen} ${zen ? 'zen-mode' : ''} ${focusState.active ? 'focus-active' : ''}`}>
    <Scene theme={theme} photo={screen === 'start' ? null : photo} photoStyle={photoStyle} intensity={intensity} audioLevel={playing ? audioLevel : 0} weather={weather} trinket={trinket}/>
    <div className="global-grain"/><div className="scanlines"/>

    {screen === 'start' && <StartScreen onStart={() => { setScreen('lobby'); setLobbyIntro(true); }} onAbout={() => setAbout(true)} />}
    {screen === 'lobby' && <LobbyScreen intro={lobbyIntro} onIntroDone={() => setLobbyIntro(false)} onGo={goRoom} onTune={() => setTunerOpen(true)} onStats={() => setStatsOpen(true)} onAbout={() => setAbout(true)} unlocks={unlocks}/>} 
    {screen === 'music' && <MusicRoomScreen theme={theme} playing={playing} toggleAudio={toggleAudio} trackName={trackName} playlist={playlist} currentTrackId={currentTrackId} addTracks={addTracks} playTrack={playPlaylistTrack} removeTrack={removeTrack} moveTrack={moveTrack} onPrevious={playPreviousTrack} onNext={playNextTrack} onTune={() => setTunerOpen(true)} onHome={() => goRoom('lobby')} audioLevel={audioLevel} onSound={() => setUtility('sound')}/>} 
    {screen === 'study' && <StudyHallScreen onHome={() => goRoom('lobby')} onTune={() => setTunerOpen(true)} onFocus={() => setFocusOpen(true)} focusState={focusState} inspector={inspector} inspectorSignal={inspectorSignal} onPoke={() => audioRef.current?.sfx('bark')}/>} 
    {screen === 'notes' && <NotesRoomScreen onHome={() => goRoom('lobby')} onTune={() => setTunerOpen(true)} onOpenNotes={() => setNotesOpen(true)}/>} 
    {screen === 'arcade' && <ArcadeRoomScreen onHome={() => goRoom('lobby')} onTune={() => setTunerOpen(true)} onOpenArcade={openArcade} locked={focusState.arcadeLocked}/>} 
    {screen === 'schedule' && <ScheduleScreen onHome={() => goRoom('lobby')} onTune={() => setTunerOpen(true)} onStartFocus={startScheduledFocus} onWhistle={() => audioRef.current?.sfx('coin')}/>} 

    {focusState.active && !focusOpen && timerDisplay !== 'hidden' && <button className={`focus-chip ${timerDisplay}`} onClick={() => { setScreen('study'); setFocusOpen(true); }}><span>{focusState.phase === 'focus' ? '◎' : '☕'}</span><b>{timerDisplay === 'minimal' ? formatClock(focusState.seconds) : `${focusState.modeId.toUpperCase()} · ${formatClock(focusState.seconds)}`}</b><small>INSPECTOR ACTIVE</small></button>}

    {!zen && screen !== 'study' && <PinnedNotes notes={pinnedNotes}/>} 
    {screen !== 'start' && <Cat theme={theme} focusActive={focusState.active} phase={focusState.phase} onClick={() => audioRef.current?.sfx('coin')}/>} 
    {screen !== 'study' && <InspectorDog visible={inspector} active={focusState.active} phase={focusState.phase} signal={inspectorSignal} taskCount={focusState.taskCount} onPoke={() => audioRef.current?.sfx('bark')}/>} 

    <FocusPanel open={focusOpen} onClose={() => setFocusOpen(false)} onStateChange={setFocusState} onInspectorSignal={setInspectorSignal} inspector={inspector} setInspector={setInspector} timerDisplay={timerDisplay} setTimerDisplay={setTimerDisplay} musicOn={focusMusic} setMusicOn={setFocusMusic} onBreakRoulette={() => setRoulette(true)} onOpenNotes={() => setNotesOpen(true)} onSfx={(t)=>audioRef.current?.sfx(t)} theme={theme} trackName={trackName} requestedMode={requestedFocusMode}/>
    <WorldTuner open={tunerOpen} onClose={() => setTunerOpen(false)} theme={theme} setTheme={setTheme} voidUnlocked={voidUnlocked} photo={photo} setPhoto={setPhoto} photoStyle={photoStyle} setPhotoStyle={setPhotoStyle} intensity={intensity} setIntensity={setIntensity} weather={weather} setWeather={setWeather} trinket={trinket} setTrinket={setTrinket} palette={palette} setPalette={setPalette} roomFinish={roomFinish} setRoomFinish={setRoomFinish}/>
    {about && <About onClose={() => setAbout(false)}/>} 
    {arcade && <MiniGame onClose={() => setArcade(false)} onSfx={(t) => audioRef.current?.sfx(t)} voidUnlocked={voidUnlocked}/>} 
    {notesOpen && <Scratchpad onClose={() => setNotesOpen(false)} onPinChange={setPinnedNotes}/>} 
    {utility && <UtilityPanel tab={utility} onClose={() => setUtility(null)} ambient={ambient} setAmbient={setAmbient} weather={weather} setWeather={setWeather} musicVolume={musicVolume} setMusicVolume={setMusicVolume} currentPreset={presetSnapshot} applyPreset={applyPreset} onSfx={(t)=>audioRef.current?.sfx(t)}/>} 
    {statsOpen && <StatsModal onClose={() => setStatsOpen(false)}/>} 
    {roulette && <BreakRoulette onClose={() => setRoulette(false)} onArcade={() => { setRoulette(false); setScreen('arcade'); openArcade(); }} onSfx={(t)=>audioRef.current?.sfx(t)}/>} 
    {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} run={runCommand}/>} 
    {screen !== 'start' && <EncounterDirector screen={screen} playlistLength={playlist.length} onUnlock={setUnlocks}/>}
    {screen !== 'start' && <div className="quick-corner"><button onClick={() => setStatsOpen(true)}>▦ LOG</button><button onClick={() => setCommandOpen(true)}>/</button><button onClick={() => setAbout(true)}>?</button></div>}
    <CreatorFooter/>
    <Analytics />
  </div>;
}

function Header({ screen, onAbout, onArcade, onHome, arcadeLocked }) {
  return <header className="topbar"><button className="brand" onClick={onHome}><span>◆</span> VIBECADE</button><nav>{screen !== 'start' && <button onClick={onArcade} disabled={arcadeLocked}>ARCADE</button>}<button onClick={onAbout}>ABOUT</button></nav></header>;
}

function StartScreen({ onStart, onAbout }) {
  return <main className="start-screen"><div className="start-copy"><p className="eyebrow">THE DOORS ARE OPEN</p><h1>VIBECADE</h1><p className="hero-line">A little place to <b>listen, work, scribble and wander.</b></p><p className="hero-sub">Five rooms. Three deeply unqualified mascots. Your music stays local. The atmosphere is optional; the nonsense is not.</p><button className="primary arcade-button" onClick={onStart}>ENTER VIBECADE ▶</button><button className="text-button" onClick={onAbout}>what even is this?</button><p className="konami">↑ ↑ ↓ ↓ ← → ← → B A</p></div></main>;
}

function SelectScreen({ choices, theme, selectTheme, onNext, voidUnlocked, onRandom, onDaily }) {
  return <main className="select-screen"><section className="section-heading"><span className="kicker">STEP 01 / CARTRIDGE BAY</span><h2>CHOOSE YOUR VIBE</h2><p>Each cartridge changes the scene, colors, typography and demo soundtrack. Or let the machine choose.</p><div className="micro-actions"><button onClick={onDaily}>☀ DAILY CARTRIDGE</button><button onClick={onRandom}>⚄ RANDOMIZE ME</button></div></section><div className="cartridge-grid">{choices.map(id => { const t = THEMES[id]; return <button key={id} className={`cartridge ${theme === id ? 'active' : ''}`} onClick={() => selectTheme(id)}><div className="cartridge-top"><span>{t.number}</span><em>{theme === id ? 'INSERTED' : 'READY'}</em></div><Scene theme={id} preview/><div className="cartridge-copy"><h3>{t.name}</h3><p>{t.mood}</p><small>{t.description}</small></div></button>})}</div><div className="step-actions"><button className="primary arcade-button" onClick={onNext}>CUSTOMISE THIS VIBE →</button>{!voidUnlocked && <span className="secret-note">one cartridge is missing.</span>}</div></main>;
}

function CustomizeScreen({ theme, photo, setPhoto, photoStyle, setPhotoStyle, intensity, setIntensity, trinket, setTrinket, trackName, playlist, currentTrackId, addTracks, playTrack, removeTrack, moveTrack, playing, toggleAudio, onPrevious, onNext, onBack, onLaunch, onSound, onWeather }) {
  const fileRef = useRef(null), audioInput = useRef(null);
  const onImage = (file) => { if (!file) return; const reader = new FileReader(); reader.onload = () => setPhoto(reader.result); reader.readAsDataURL(file); };
  return <main className="customize-screen"><section className="section-heading"><span className="kicker">STEP 02 / TUNE THE WORLD</span><h2>MAKE IT YOURS</h2><p>Launch immediately, or bend the cartridge around your photo, soundtrack, ambience and tiny unnecessary desk objects.</p></section><div className="custom-grid"><section className="panel visual-panel"><div className="panel-label">YOUR VISUAL</div><div className="big-preview"><Scene theme={theme} photo={photo} photoStyle={photoStyle} intensity={intensity} preview/></div><div className="inline-actions"><button onClick={() => fileRef.current?.click()}>+ UPLOAD PHOTO</button>{photo && <button onClick={() => setPhoto(null)}>RESET</button>}</div><input hidden ref={fileRef} type="file" accept="image/*" onChange={e => onImage(e.target.files?.[0])}/><label className="control-label">STYLE<select value={photoStyle} onChange={e => setPhotoStyle(e.target.value)}><option value="duotone">Duotone</option><option value="pixel">Pixelate</option><option value="grain">Grain</option><option value="ink">Manga ink</option><option value="comic">Comic print</option><option value="original">Original</option></select></label><label className="control-label">INTENSITY <span>{intensity}%</span><input type="range" min="10" max="100" value={intensity} onChange={e => setIntensity(Number(e.target.value))}/></label><label className="control-label">DESK TRINKET<select value={trinket} onChange={e=>setTrinket(e.target.value)}><option value="none">Nothing</option><option value="mug">Coffee mug</option><option value="lava">Lava lamp</option><option value="plant">Tiny plant</option><option value="poster">Mystery poster</option></select></label></section><section className="panel audio-panel"><div className="panel-label">YOUR SOUNDTRACK / LOCAL PLAYLIST</div><div className="track-display"><span>♫</span><div><b>{trackName}</b><small>{trackName === 'VIBECADE DEMO LOOP' ? 'generated inside your browser' : `${playlist.length} saved local track${playlist.length === 1 ? '' : 's'}`}</small></div></div><div className="visualizer">{Array.from({length:24}).map((_,i)=><i key={i}/>)}</div><div className="audio-actions playlist-main-controls"><button onClick={onPrevious} disabled={!playlist.length}>◀</button><button className="play-big" onClick={toggleAudio}>{playing ? '❚❚ PAUSE' : '▶ PLAY'}</button><button onClick={onNext} disabled={!playlist.length}>▶</button><button onClick={() => audioInput.current?.click()}>+ ADD TRACKS</button><input hidden ref={audioInput} multiple type="file" accept="audio/*" onChange={e => { addTracks(e.target.files); e.target.value = ''; }}/></div><div className="playlist-box"><div className="playlist-head"><b>TRACK LIST</b><span>{playlist.length ? `${playlist.length}/100` : 'drop in a few songs'}</span></div>{playlist.length === 0 ? <div className="playlist-empty">No local tracks yet. Add multiple audio files at once and VIBECADE will keep the queue on this device.</div> : <div className="playlist-list">{playlist.map((track,index) => <article key={track.id} className={track.id === currentTrackId ? 'active' : ''}><button className="playlist-pick" onClick={() => playTrack(track.id)}><span>{String(index + 1).padStart(2,'0')}</span><div><b>{track.name}</b><small>{Math.max(.1, track.size / 1024 / 1024).toFixed(1)} MB · local</small></div></button><div className="playlist-row-actions"><button onClick={() => moveTrack(track.id,-1)} disabled={index===0}>↑</button><button onClick={() => moveTrack(track.id,1)} disabled={index===playlist.length-1}>↓</button><button className="danger-mini" onClick={() => removeTrack(track.id)}>×</button></div></article>)}</div>}</div><div className="audio-shortcuts"><button onClick={onSound}>♫ AMBIENT MIXER</button><button onClick={onWeather}>☂ WEATHER</button></div><p className="privacy-note">Playlist audio is stored locally in this browser using IndexedDB. VIBECADE never uploads the files.</p></section></div><div className="launch-bar"><button onClick={onBack}>← CHANGE CARTRIDGE</button><button className="primary arcade-button launch" onClick={onLaunch}>LAUNCH THIS VIBE ▶</button></div></main>;
}

function Player({ current, playing, toggleAudio, trackName, playlistCount, onPrevious, onNext, onExit, onArcade, audioLevel, onFocus, onNotes, zen }) {
  return <main className="player-screen"><div className={`player-center ${zen ? 'zen-player' : ''}`}><span className="kicker">NOW PLAYING / {current.short}</span><h2>{current.name}</h2><p>{trackName}</p>{playlistCount > 0 && <small className="queue-count">LOCAL QUEUE · {playlistCount} TRACK{playlistCount === 1 ? '' : 'S'}</small>}<div className="player-bars">{Array.from({length:28}).map((_,i)=><i key={i} style={{height:`${8 + ((i*17)%30) + audioLevel*70}px`}}/>)}</div><div className="player-transport">{playlistCount > 0 && <button onClick={onPrevious}>◀</button>}<button className="round-play" onClick={toggleAudio}>{playing ? '❚❚' : '▶'}</button>{playlistCount > 0 && <button onClick={onNext}>▶</button>}</div>{!zen && <><div className="player-actions"><button onClick={onExit}>ESC / REMIX</button><button onClick={onFocus}>◎ START FOCUS</button><button onClick={onNotes}>✎ JOT NOTE</button><button onClick={onArcade}>ARCADE BREAK</button></div><p className="shortcut-hint">F focus · N notes · M sound · W weather · A arcade · Z zen · / commands</p></>}</div></main>;
}

function PinnedNotes({ notes }) { if (!notes?.length) return null; return <div className="pinned-notes">{notes.slice(0,3).map((n,i)=><article key={n.id} style={{ transform:`rotate(${[-1.5,1.2,-.5][i]||0}deg)` }}><b>PINNED</b><p>{n.text}</p></article>)}</div>; }

function About({ onClose }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card"><div className="modal-head"><div><span className="kicker">ABOUT</span><h2>WHAT IS VIBECADE?</h2></div><button onClick={onClose}>×</button></div><p className="about-lead">A small interactive place with rooms for music, focus, notes, schedules and tiny arcade breaks — supervised by a cat, a moustached dog and a whistle-happy duck.</p><p>The rooms are the main event now. World/cartridge customization sits in a secondary Tune menu, while each room gets its own behavior and personality. Your files and history stay on your device; the built-in worlds and ambience are generated in the browser.</p><div className="about-grid"><div><b>LISTEN</b><span>Reactive scenes, your music, procedural ambience.</span></div><div><b>FOCUS</b><span>Pomodoro, deep work, exam, reading, writing and Inspector Dog.</span></div><div><b>PLAY</b><span>Short cartridge-flavoured mini-games when you are actually on break.</span></div></div><button className="primary" onClick={onClose}>GOT IT</button></div></div>;
}
