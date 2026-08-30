import React, { useEffect, useState } from 'react';
import { loadFocusHistory, loadNotes, loadSchedule, loadScores, logEncounter, unlockCurio } from '../lib/storage';

export const CURIO_INFO = {
  cassetteGhost:{icon:'▣',name:'CASSETTE GHOST',desc:'Built a five-track shelf. Something moved in.'},
  mothLibrarian:{icon:'✦',name:'MOTH LIBRARIAN',desc:'Attracted by an irresponsible quantity of notes.'},
  calendarSnail:{icon:'＠',name:'CALENDAR SNAIL',desc:'Moves slowly. Deadlines do not.'},
  arcadeRat:{icon:'♠',name:'ARCADE RAT',desc:'Recognizes unnecessary high scores.'},
  goldBaton:{icon:'⚑',name:'GOLD BATON',desc:'Inspector Barkley has reluctantly acknowledged you.'},
  duckBadge:{icon:'◉',name:'WHISTLE BADGE',desc:'Three planned sessions. The duck approves loudly.'}
};

export default function EncounterDirector({ screen, playlistLength=0, onUnlock }){
  const [event,setEvent]=useState(null);

  useEffect(()=>{
    const inspect=()=>{
      const focus=loadFocusHistory().filter(x=>x.type==='focus');
      const focusMinutes=focus.reduce((sum,item)=>sum+Number(item.minutes||0),0);
      const earned=[];
      if(playlistLength>=5) earned.push('cassetteGhost');
      if(loadNotes().length>=5) earned.push('mothLibrarian');
      if(loadSchedule().length>=3) earned.push('calendarSnail','duckBadge');
      if(Object.values(loadScores()).some(v=>Number(v)>=20)) earned.push('arcadeRat');
      if(focusMinutes>=100) earned.push('goldBaton');
      earned.forEach(id=>{ const next=unlockCurio(id); onUnlock?.(next); });
    };
    inspect();
    const poll=setInterval(inspect,4000);
    return()=>clearInterval(poll);
  },[playlistLength,onUnlock]);

  useEffect(()=>{
    if(screen==='start') return;
    const timer=setTimeout(()=>{
      const options={
        lobby:[['duck-chase','PHEEEP!','The duck steals Inspector Barkley’s clipboard and immediately regrets it.'],['cat-whistle','ABSOLUTELY NOT','The cat has acquired the whistle. This is an administrative failure.']],
        music:[['ghost','SIDE B?','A cassette ghost inspects your track shelf. It has notes.'],['cat-speaker','BASS TEST','The cat sits directly on the speaker because of course it does.']],
        study:[['dog-audit','SURPRISE AUDIT','Inspector Barkley checks the desk, nods once, then checks it again.'],['paper-plane','INCOMING','A paper plane crosses Study Hall. Barkley files a report.']],
        notes:[['moth','SHHH','A tiny librarian moth circles the lamp and judges your punctuation.'],['ink-spill','WHOOPS','A suspicious ink blot appears. The cat denies everything.']],
        arcade:[['rat','PLAYER TWO?','An arcade rat emerges, studies the high-score board, and vanishes.'],['cabinet','FREE CREDIT','One cabinet flashes CREDIT 1 for absolutely no reason.']],
        schedule:[['snail','ON MY WAY','Calendar Snail has begun travelling toward next Tuesday.'],['duck-meeting','MANDATORY MEETING','Whistle Duck schedules a meeting about scheduling meetings.']]
      };
      const pool=options[screen]||options.lobby;
      if(Math.random()>.62) return;
      const [kind,title,copy]=pool[Math.floor(Math.random()*pool.length)];
      setEvent({kind,title,copy}); logEncounter({screen,kind});
      setTimeout(()=>setEvent(null),5200);
    },6500+Math.random()*6000);
    return()=>clearTimeout(timer);
  },[screen]);

  const secretMap={music:['cassetteGhost','▣','a loose cassette is humming'],study:['goldBaton','⚑','something official is under the desk'],notes:['mothLibrarian','✦','the lamp has a visitor'],arcade:['arcadeRat','●','a coin is rolling by itself'],schedule:['calendarSnail','＠','that calendar mark is moving']};
  const secret=secretMap[screen];
  const revealSecret=()=>{ if(!secret)return; const next=unlockCurio(secret[0]); onUnlock?.(next); setEvent({kind:'secret',title:'YOU FOUND SOMETHING',copy:`${CURIO_INFO[secret[0]].name} added to the lobby curio shelf.`}); logEncounter({screen,kind:'secret-found'}); };
  return <>{secret&&<button className={`room-secret room-secret-${screen}`} onClick={revealSecret} title={secret[2]} aria-label={`Room secret: ${secret[2]}`}>{secret[1]}</button>}{event&&<aside className={`encounter-toast encounter-${event.kind}`} role="status"><div className="encounter-stage"><i/><b/><span/></div><div><small>VIBECADE INCIDENT</small><strong>{event.title}</strong><p>{event.copy}</p></div><button onClick={()=>setEvent(null)} aria-label="Dismiss incident">×</button></aside>}</>;
}
