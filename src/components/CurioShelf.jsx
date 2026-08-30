import React from 'react';
import { CURIO_INFO } from './EncounterDirector';
export default function CurioShelf({ unlocks=[] }){
  const items=unlocks.map(id=>({id,...CURIO_INFO[id]})).filter(x=>x.name);
  return <section className="curio-shelf"><div><span className="kicker">LOBBY LOST + FOUND</span><h3>CURIOS</h3><p>Little things appear when you actually use VIBECADE.</p></div><div className="curio-row">{items.length?items.map(item=><article key={item.id} title={item.desc}><span>{item.icon}</span><b>{item.name}</b></article>):<article className="curio-empty"><span>?</span><b>NOTHING WEIRD YET</b></article>}</div></section>;
}
