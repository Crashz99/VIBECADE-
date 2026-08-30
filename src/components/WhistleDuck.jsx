import React, { useEffect, useState } from 'react';

export default function WhistleDuck({ active = false, message = '', onWhistle }) {
  const [talk, setTalk] = useState(message);
  useEffect(() => { setTalk(message); }, [message]);
  if (!active) return null;
  return <div className="duck-wrap" aria-hidden="true">
    {talk && <div className="duck-speech">{talk}</div>}
    <button className="whistle-duck" onClick={() => { setTalk('PHEEEEEP!'); onWhistle?.(); setTimeout(() => setTalk(message), 1400); }} tabIndex={-1}>
      <span className="duck-body"/><span className="duck-head"><i className="duck-eye"/><i className="duck-beak"/><i className="duck-whistle">▰</i></span><span className="duck-foot left"/><span className="duck-foot right"/>
    </button>
  </div>;
}
