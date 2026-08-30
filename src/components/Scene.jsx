import React from 'react';

export default function Scene({ theme, photo, photoStyle = 'duotone', intensity = 65, audioLevel = 0, preview = false, weather = 'none', trinket = 'none' }) {
  const vars = { '--react': Math.min(1, audioLevel), '--intensity': intensity / 100 };
  return (
    <div className={`scene scene-${theme} ${preview ? 'scene-preview' : ''}`} style={vars} aria-hidden="true">
      {photo ? <div className={`user-photo effect-${photoStyle}`} style={{ backgroundImage: `url(${photo})` }} /> : <Builtin theme={theme} />}
      {!preview && <><Weather type={weather}/><Trinket type={trinket}/></>}
      <div className="scene-reactive" />
    </div>
  );
}

function Weather({ type }) {
  if (!type || type === 'none') return null;
  return <div className={`weather-layer weather-${type}`}><i/><i/><i/></div>;
}

function Trinket({ type }) {
  if (!type || type === 'none') return null;
  return <div className={`desk-trinket trinket-${type}`}><i/></div>;
}

function Builtin({ theme }) {
  if (theme === 'city') return <>
    <div className="city-moon" /><div className="city-haze" />
    <div className="city-buildings"><i/><i/><i/><i/><i/><i/><i/></div>
    <div className="city-rain" /><div className="city-sign sign-a">24H</div><div className="city-sign sign-b">夢</div>
  </>;
  if (theme === 'manga') return <>
    <div className="manga-grid"><div className="manga-panel kanji">夢</div><div className="manga-panel dark">ドキ<br/>ドキ</div><div className="manga-panel tone"/><div className="manga-panel kanji small">静</div></div>
  </>;
  if (theme === 'comic') return <>
    <div className="comic-grid"><div className="comic-panel blue"><b>POW!</b></div><div className="comic-panel pink"><b>BAM!</b></div><div className="comic-panel yellow"><b>ZAP!</b></div></div>
  </>;
  if (theme === 'void') return <>
    <div className="void-noise"/><div className="void-copy">NO SIGNAL</div><div className="void-code">010101 404 VIBE NOT FOUND 010101</div>
  </>;
  return <>
    <div className="pixel-stars"/><div className="pixel-moon"/><div className="pixel-window"><i/><i/></div><div className="pixel-desk"/><div className="pixel-lamp"/><div className="pixel-plant"/><div className="pixel-cat"/>
  </>;
}
