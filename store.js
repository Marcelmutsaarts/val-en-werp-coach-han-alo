// Alle gegevens blijven op het apparaat van de student (localStorage). Geen server, geen account.
import { TECHNIQUES, SPORTS, LEVELS, DIRECTIONS } from './data.js';

const KEY = 'val-werp-coach:v1';

// Volgorde van de zes duo's: binnen elk blok van twee zijn de duo's verschillend,
// zodat niemand twee scènes direct na elkaar hoeft te spelen.
export const PAIRS = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

function blank() {
  return { v: 1, favorites: [], techNotes: {}, custom: [], shows: [], activeShow: null };
}

function load() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
    if (raw) return sanitizeState(JSON.parse(raw));
  } catch (e) {
    // Onleesbaar: bewaar een reservekopie voordat er iets overschreven wordt
    try { if (raw) localStorage.setItem(`${KEY}:reserve`, raw); } catch { /* geen ruimte */ }
  }
  return blank();
}

let timer = null;
let failed = false;
let dirty = false;
export function save() {
  dirty = true;
  clearTimeout(timer);
  timer = setTimeout(flush, 200);
}
// Alleen schrijven als er echt iets veranderd is, zodat een ander tabblad niet overschreven wordt.
export function flush() {
  clearTimeout(timer);
  if (!dirty) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    dirty = false;
    failed = false;
  } catch (e) {
    if (!failed) listeners.forEach(fn => fn('save-failed'));
    failed = true;
  }
}
addEventListener('pagehide', flush);
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

const listeners = new Set();
export const subscribe = fn => listeners.add(fn);

// Wijzig de state, bewaar en laat de interface opnieuw tekenen.
export function update(fn) {
  fn(state);
  save();
  listeners.forEach(l => l('change'));
}

// ---------- Technieken ----------

export function allTechniques() {
  return [...TECHNIQUES, ...state.custom];
}

export function techById(id) {
  return TECHNIQUES.find(t => t.id === id) || state.custom.find(t => t.id === id) || null;
}

export const sportById = id => SPORTS.find(s => s.id === id);
export const levelById = id => LEVELS.find(l => l.id === id) || LEVELS[0];
export const dirById = id => DIRECTIONS.find(d => d.id === id) || DIRECTIONS[0];

// ---------- Shows ----------

export function newShow(name = 'Mijn show') {
  return {
    id: uid(),
    name,
    members: ['', '', '', ''],
    theme: '',
    music: '',
    costume: '',
    direction: '',
    scenes: PAIRS.map(pair => ({ id: uid(), pair: [...pair], title: '', note: '', items: [] })),
    updated: Date.now(),
  };
}

export function activeShow() {
  return state.shows.find(s => s.id === state.activeShow) || state.shows[0] || null;
}

export function memberName(show, i) {
  const n = (show.members[i] || '').trim();
  return n || `Student ${'ABCD'[i]}`;
}

// ---------- Validatie (ook voor geïmporteerde bestanden en deel-links) ----------

const str = (v, max = 2000) => (typeof v === 'string' ? v.slice(0, max) : '');

export function sanitizeTechnique(t) {
  if (!t || typeof t !== 'object') return null;
  const name = str(t.name, 120).trim();
  if (!name) return null;
  return {
    id: str(t.id, 40) || 'c-' + uid(),
    name,
    sport: SPORTS.some(s => s.id === t.sport) ? t.sport : SPORTS[0].id,
    dir: DIRECTIONS.some(d => d.id === t.dir) ? t.dir : DIRECTIONS[0].id,
    level: LEVELS.some(l => l.id === t.level) ? t.level : LEVELS[0].id,
    video: safeUrl(t.video),
    custom: true,
  };
}

export function safeUrl(u) {
  const s = str(u, 500).trim();
  if (!s) return '';
  try {
    const url = new URL(s);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch { return ''; }
}

export function sanitizeShow(s) {
  if (!s || typeof s !== 'object') return null;
  const members = Array.isArray(s.members) ? s.members : [];
  const validPair = p => Array.isArray(p) && p.length === 2 && p.every(i => Number.isInteger(i) && i >= 0 && i < 4) && p[0] !== p[1];
  const scenes = (Array.isArray(s.scenes) ? s.scenes : []).slice(0, 40).map(sc => ({
    id: str(sc && sc.id, 40) || uid(),
    pair: sc && validPair(sc.pair) ? [sc.pair[0], sc.pair[1]] : null,
    title: str(sc && sc.title, 120),
    note: str(sc && sc.note),
    items: (Array.isArray(sc && sc.items) ? sc.items : []).slice(0, 30).map(it => ({
      id: str(it && it.id, 40) || uid(),
      tech: str(it && it.tech, 40),
      thrower: it && it.thrower === 1 ? 1 : 0,
      note: str(it && it.note, 500),
    })).filter(it => it.tech),
  }));
  return {
    id: str(s.id, 40) || uid(),
    name: str(s.name, 80).trim() || 'Show',
    members: [0, 1, 2, 3].map(i => str(members[i], 40)),
    theme: str(s.theme, 200),
    music: str(s.music, 200),
    costume: str(s.costume, 200),
    direction: str(s.direction),
    scenes,
    updated: Number(s.updated) || Date.now(),
  };
}

function sanitizeState(d) {
  const s = blank();
  if (!d || typeof d !== 'object') return s;
  s.custom = (Array.isArray(d.custom) ? d.custom : []).map(sanitizeTechnique).filter(Boolean);
  const ids = new Set(allIds(s.custom));
  s.favorites = (Array.isArray(d.favorites) ? d.favorites : []).filter(id => ids.has(id));
  s.techNotes = {};
  if (d.techNotes && typeof d.techNotes === 'object') {
    for (const [k, v] of Object.entries(d.techNotes)) if (ids.has(k) && typeof v === 'string' && v) s.techNotes[k] = v.slice(0, 2000);
  }
  s.shows = (Array.isArray(d.shows) ? d.shows : []).map(sanitizeShow).filter(Boolean);
  s.activeShow = typeof d.activeShow === 'string' ? d.activeShow : null;
  return s;
}

function allIds(custom) {
  return [...TECHNIQUES.map(t => t.id), ...custom.map(t => t.id)];
}

// ---------- Delen: bestand en link ----------

// Een export bevat de show plus de eigen technieken die erin voorkomen.
export function packShow(show) {
  const used = new Set(show.scenes.flatMap(sc => sc.items.map(it => it.tech)));
  return {
    app: 'val-werp-coach',
    v: 1,
    show,
    custom: state.custom.filter(t => used.has(t.id)),
  };
}

// Voeg een geïmporteerde show toe als nieuwe kopie; overschrijft nooit iets.
export function importPacked(data) {
  const raw = data && data.app === 'val-werp-coach' ? data : null;
  // Ook een losse show en een export uit de vorige versie van de app accepteren
  const showData = raw ? raw.show : data && Array.isArray(data.duos) ? fromLegacy(data) : data;
  const show = sanitizeShow(showData);
  if (!show || !Array.isArray(showData && showData.scenes)) throw new Error('Dit is geen geldig showbestand.');
  const customs = (raw && Array.isArray(raw.custom) ? raw.custom : []).map(sanitizeTechnique).filter(Boolean);
  update(st => {
    for (const t of customs) {
      if (!techById(t.id)) st.custom.push(t);
    }
    show.id = uid();
    show.scenes.forEach(sc => { sc.items = sc.items.filter(it => techById(it.tech)); });
    if (st.shows.some(s => s.name === show.name)) show.name += ' (kopie)';
    show.updated = Date.now();
    st.shows.push(show);
    st.activeShow = show.id;
  });
  return show;
}

// Vorige app: { name, duos: [{ techniques: [{ techniqueId }], notes: [{ text }] }] }
function fromLegacy(d) {
  return {
    name: d.name,
    scenes: d.duos.map((duo, i) => ({
      pair: PAIRS[i % PAIRS.length],
      note: (Array.isArray(duo.notes) ? duo.notes : []).map(n => n && n.text).filter(Boolean).join('\n'),
      items: (Array.isArray(duo.techniques) ? duo.techniques : []).map((t, j) => ({ tech: t && t.techniqueId, thrower: j % 2 })),
    })),
  };
}

const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

async function pipe(bytes, stream) {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function encodeShare(show) {
  const bytes = new TextEncoder().encode(JSON.stringify(packShow(show)));
  if ('CompressionStream' in window) {
    try { return 'z' + b64url(await pipe(bytes, new CompressionStream('deflate-raw'))); } catch { /* val terug op ongecomprimeerd */ }
  }
  return 'p' + b64url(bytes);
}

export async function decodeShare(code) {
  const kind = code[0];
  let bytes = fromB64url(code.slice(1));
  if (kind === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
  else if (kind !== 'p') throw new Error('Onbekende link');
  return JSON.parse(new TextDecoder().decode(bytes));
}

// Pas laden als alle hulpfuncties hierboven bestaan.
export const state = load();
