import React, { useEffect, useState } from 'react';

const lines = {
  pixel: ['cozy. acceptable.', 'this one has snacks energy.', 'finally, indoor weather.'],
  city: ['dramatic. predictable.', 'rain again? groundbreaking.', 'okay the neon is good.'],
  manga: ['...silence suits you.', 'very protagonist of you.', 'don’t make me narrate this.'],
  comic: ['LOUDER.', 'finally, chaos.', 'i demand a cape.'],
  void: ['you were not supposed to find this.', 'turn back.', '...actually stay.'],
};

export default function Cat({ theme, onClick, focusActive = false, phase = 'focus' }) {
  const [speech, setSpeech] = useState('');
  const [clicks, setClicks] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const pool = focusActive ? (phase === 'break' ? ['dog says break. i say arcade.', 'finally. freedom.', 'poke me. it counts as rest.'] : ['psst. open a new tab.', 'the dog is watching.', 'you could be playing Cat Catch.']) : (lines[theme] || lines.pixel);
      setSpeech(pool[Math.floor(Math.random() * pool.length)]);
      setTimeout(() => setSpeech(''), 2600);
    }, focusActive ? 10000 : 7000);
    return () => clearTimeout(t);
  }, [theme, clicks, focusActive, phase]);

  const poke = () => {
    const seq = focusActive ? ['not now. the cop is here.', 'act natural.', 'he has a baton.', 'i blame you.'] : ['hey.', 'personal space.', 'again?', 'i am keeping score.', 'fine.'];
    setSpeech(seq[Math.min(clicks, seq.length - 1)]);
    setClicks(v => v + 1);
    onClick?.();
    setTimeout(() => setSpeech(''), 2200);
  };

  return <div className={`cat-wrap cat-${theme} ${focusActive ? 'cat-under-inspection' : ''}`}>
    {speech && <div className="cat-speech">{speech}</div>}
    <button className="cat-button" onClick={poke} aria-label="Poke the judgmental cat">
      <span className="cat-tail"/><span className="cat-ear left"/><span className="cat-ear right"/>
      <span className="cat-head"><i className="cat-eye left"/><i className="cat-eye right"/><i className="cat-mouth"/></span>
      <span className="cat-paw left"/><span className="cat-paw right"/>
    </button>
  </div>;
}
