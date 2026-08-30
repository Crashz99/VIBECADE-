import React, { useMemo } from 'react';
import { loadFocusHistory } from '../lib/storage';
import InspectorDog from '../components/InspectorDog';

const LEVELS=[
  [1,'UNSUPERVISED INTERN',0],[2,'DESK OCCUPANT',250],[3,'PROVISIONAL STUDENT',700],[4,'INSPECTOR NOTICED YOU',1400],[5,'FOCUS LICENSE HOLDER',2400],[6,'CERTIFIED LOCK-IN',3800],[7,'ACADEMIC MENACE',5600],[8,'BARKLEY APPROVED',8000],[9,'LIBRARY BOSS',11000],[10,'ABSURDLY EMPLOYABLE',15000]
];
export default function StudyHallScreen({ onHome, onTune, onFocus, focusState, inspector, inspectorSignal, onPoke }) {
  const history=loadFocusHistory();
  const progress=useMemo(()=>{const focus=history.filter(x=>x.type==='focus');const mins=focus.reduce((s,x)=>s+Number(x.minutes||0),0);const completed=focus.length;const xp=mins*10+completed*25;let current=LEVELS[0],next=null;for(const l of LEVELS){if(xp>=l[2]) current=l;else{next=l;break}}const pct=next?Math.max(0,Math.min(100,((xp-current[2])/(next[2]-current[2]))*100)):100;return{mins,completed,xp,current,next,pct};},[history]);
  return <main className="room-screen study-hall-screen"><div className="room-toolbar"><button onClick={onHome}>← LOBBY</button><span>ROOM 02</span><button onClick={onTune}>⚙ TUNE WORLD</button></div>
    <section className="study-banner"><div><span className="kicker">INSPECTORATE OF ACADEMIC AFFAIRS</span><h1>STUDY HALL</h1><p>Clock in. Do the work. Earn ridiculous rank titles. Inspector Dog will be unbearable about all of it.</p></div><button className="primary big-clock" onClick={onFocus}>{focusState.active?'OPEN ACTIVE SHIFT':'CLOCK IN →'}</button></section>
    <section className="level-board"><div className="level-stamp"><small>STUDY LEVEL</small><strong>{progress.current[0]}</strong><b>{progress.current[1]}</b></div><div className="level-progress"><div><span>{progress.xp} XP</span><span>{progress.next?`${progress.next[2]} XP TO ${progress.next[1]}`:'MAXIMUM BUREAUCRATIC POWER'}</span></div><div className="xp-track"><i style={{width:`${progress.pct}%`}}/></div><p>{progress.mins} focus minutes · {progress.completed} completed shifts</p></div></section>
    <section className="study-floor"><div className="chalkboard"><b>STUDY HALL RULES</b><p>1. Pick concrete tasks.</p><p>2. Timer may be visible, minimal, or hidden.</p><p>3. Exam mode locks the Arcade.</p><p>4. The cat is not a reliable academic advisor.</p></div><div className="study-desk"><span className="desk-lamp">◒</span><div className="paper-stack">FOCUS<br/>REPORTS</div></div></section>
    <InspectorDog visible={inspector} active={true} phase={focusState.active?focusState.phase:'focus'} signal={inspectorSignal} taskCount={focusState.taskCount} onPoke={onPoke}/>
  </main>;
}
