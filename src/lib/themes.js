export const THEMES = {
  pixel: { id:'pixel', number:'01', name:'PIXEL DREAMS', short:'PIXEL', mood:'cozy • warm • nostalgic', description:'A tiny after-hours room with warm window light, stars, and one judgmental cat.', accent:'#4deeea', accent2:'#f92aad', accent3:'#ffe66d' },
  city: { id:'city', number:'02', name:'NIGHT CITY', short:'CITY', mood:'rain • neon • midnight', description:'Blue-violet skyline, wet neon, distant signs and slow midnight rain.', accent:'#7db8ff', accent2:'#ff3d68', accent3:'#ffd23f' },
  manga: { id:'manga', number:'03', name:'INK', short:'MANGA', mood:'quiet • monochrome • dramatic', description:'Ink panels, halftones, paper grain and a little too much internal monologue.', accent:'#c81d25', accent2:'#161310', accent3:'#8a8365' },
  comic: { id:'comic', number:'04', name:'PANEL BREAKER', short:'COMIC', mood:'loud • kinetic • ridiculous', description:'Bold panels, halftones and big unnecessary sound effects. As intended.', accent:'#3a6bff', accent2:'#ff2ec4', accent3:'#ffd23f' },
  void: { id:'void', number:'??', name:'NO SIGNAL', short:'CRT VOID', mood:'secret • unstable • forbidden', description:'A corrupted cartridge hidden behind the oldest cheat code in the book.', accent:'#92ff7a', accent2:'#f7ff00', accent3:'#caffbf', secret:true }
};

export const THEME_ORDER = ['pixel','city','manga','comic'];

export const PALETTES = {
  cartridge: { name:'Cartridge colors', accent:null, accent2:null, accent3:null },
  candy: { name:'Arcade candy', accent:'#66f7ff', accent2:'#ff5ac8', accent3:'#fff07a' },
  lagoon: { name:'Electric lagoon', accent:'#4fffd2', accent2:'#4f8cff', accent3:'#b9ff66' },
  sunset: { name:'Sunset tape', accent:'#ff9a62', accent2:'#ff4f8b', accent3:'#ffd166' },
  acid: { name:'Acid terminal', accent:'#b6ff00', accent2:'#7c3cff', accent3:'#00ffd5' },
  soda: { name:'Blue raspberry', accent:'#59c9ff', accent2:'#9e72ff', accent3:'#ff8fd8' },
  peach: { name:'Peach milk', accent:'#ffb08a', accent2:'#ff77aa', accent3:'#fff0b5' },
  mono: { name:'Photocopier', accent:'#f6f6f2', accent2:'#aaa9b0', accent3:'#ffffff' }
};

export const ROOM_FINISHES = {
  arcade: 'Arcade plastic',
  glass: 'Glass candy',
  paper: 'Paper cutout',
  chrome: 'Chrome future',
  soft: 'Soft bedroom',
  brutal: 'Brutalist terminal'
};
