import React, { useEffect, useMemo, useState } from 'react';

const focusLines = [
  'Eyes on the work.',
  'Interesting. Very interesting.',
  'The cat says you are slacking.',
  'Baton inspection. Continue.',
  'I expect visible progress.',
  'This is a focus establishment.',
];
const idleLines = [
  'Five quiet minutes. Explain yourself.',
  'I have noted the suspicious inactivity.',
  'Are we studying or becoming furniture?',
];
const tabLines = [
  'I saw that tab change.',
  'Back already? Fascinating.',
  'The internet can wait. Probably.',
];
const breakLines = [
  'BREAK MEANS BREAK.',
  'Hydrate. Stretch. No heroics.',
  'You are temporarily released.',
];

export default function InspectorDog({ visible, active, phase = 'focus', signal, taskCount = 0, onPoke }) {
  const [x, setX] = useState(72);
  const [facing, setFacing] = useState('left');
  const [speech, setSpeech] = useState('');
  const [patrolling, setPatrolling] = useState(false);

  const pool = useMemo(() => phase === 'break' ? breakLines : focusLines, [phase]);

  useEffect(() => {
    if (!visible || !active) return;
    let timeout;
    const patrol = () => {
      const next = 8 + Math.random() * 78;
      setFacing(next > x ? 'right' : 'left');
      setPatrolling(true);
      setX(next);
      timeout = setTimeout(() => {
        setPatrolling(false);
        if (Math.random() > .45) {
          setSpeech(pool[Math.floor(Math.random() * pool.length)]);
          setTimeout(() => setSpeech(''), 2600);
        }
        timeout = setTimeout(patrol, 4500 + Math.random() * 5500);
      }, 2600);
    };
    timeout = setTimeout(patrol, 1800);
    return () => clearTimeout(timeout);
  }, [visible, active, phase, pool]);

  useEffect(() => {
    if (!visible || !active || !signal) return;
    if (signal.type === 'tab-away') setSpeech(tabLines[Math.floor(Math.random() * tabLines.length)]);
    if (signal.type === 'idle') setSpeech(idleLines[Math.floor(Math.random() * idleLines.length)]);
    if (signal.type === 'task') setSpeech(taskCount ? `${taskCount} task${taskCount === 1 ? '' : 's'} remain. I am counting.` : 'Task list clear. Acceptable.');
    const t = setTimeout(() => setSpeech(''), 3200);
    return () => clearTimeout(t);
  }, [signal, visible, active, taskCount]);

  if (!visible || !active) return null;
  const poke = () => {
    setSpeech(phase === 'break' ? 'Stop poking the inspector. Go rest.' : 'Do not test the baton.');
    onPoke?.();
    setTimeout(() => setSpeech(''), 2400);
  };

  return <div className={`inspector-wrap ${phase} ${patrolling ? 'patrolling' : ''} face-${facing}`} style={{ left: `${x}%` }}>
    {speech && <div className="inspector-speech">{speech}</div>}
    <button className="inspector-dog" onClick={poke} aria-label="Poke Inspector Dog">
      <span className="dog-tail"/><span className="dog-body"/><span className="dog-head">
        <i className="dog-ear left"/><i className="dog-ear right"/><i className="dog-eye left"/><i className="dog-eye right"/><i className="dog-nose"/><i className="dog-moustache left"/><i className="dog-moustache right"/>
        <i className="dog-cap"/>
      </span>
      <span className="dog-leg left"/><span className="dog-leg right"/>
      <span className="dog-baton"/><span className="dog-clipboard">✓</span>
    </button>
  </div>;
}
