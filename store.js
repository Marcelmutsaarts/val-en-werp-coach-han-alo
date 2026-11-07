// Alle gegevens blijven op het apparaat van de student (localStorage). Geen server, geen account.
import { TECHNIQUES, SPORTS, LEVELS, DIRECTIONS } from './data.js';

const KEY = 'val-werp-coach:v1';

// Volgorde van de zes duo's: binnen elk blok van twee zijn de duo's verschillend,
// zodat niemand twee scènes direct na elkaar hoeft te spelen.
export const PAIRS = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

// Ids komen ook uit gedeelde links en bestanden: alleen veilige tekens toestaan.
const ID_RE = /^[a-z0-9][\w-]{0,39}$/i;
const CUSTOM_RE = /^c-[\w-]{1,38}$/;
const okId = v => typeof v === 'string' && ID_RE.test(v);

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
    if (failed) listeners.forEach(fn => fn('save-ok'));
    failed = false;
  } catch (e) {
    failed = true;
    listeners.forEach(fn => fn('save-failed'));
  }
}
addEventListener('pagehide', flush);
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

// Een ander tabblad (bijvoorbeeld na het openen van een deel-link) heeft iets opgeslagen: overnemen.
addEventListener('storage', e => {
  if (e.key !== KEY || e.newValue == null) return;
  try {
    const next = sanitizeState(JSON.parse(e.newValue));
    Object.keys(state).forEach(k => delete state[k]);
    Object.assign(state, next);
    dirty = false;
    clearTimeout(timer);
    listeners.forEach(l => l('change'));
  } catch { /* onleesbaar: negeren */ }
});

const listeners = new Set();
export const subscribe = fn => listeners.add(fn);

// Wijzig de state, bewaar en laat de interface opnieuw tekenen.
export function update(fn) {
  fn(state);
  save();
  listeners.forEach(l => l('change'));
}

// Alleen opnieuw tekenen (weergavekeuzes die niet bewaard hoeven te worden).
export function rerender() {
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

const str = (v, max = 2000) => (typeof v === 'string' ? v.slice(0, max) : typeof v === 'number' ? String(v) : '');

export function sanitizeTechnique(t) {
  if (!t || typeof t !== 'object') return null;
  const name = str(t.name, 120).trim();
  if (!name) return null;
  const level = LEVELS.some(l => l.id === t.level) ? t.level : LEVELS[0].id;
  return {
    id: typeof t.id === 'string' && CUSTOM_RE.test(t.id) ? t.id : `c-${uid()}`,
    name,
    sport: SPORTS.some(s => s.id === t.sport) ? t.sport : SPORTS[0].id,
    dir: DIRECTIONS.some(d => d.id === t.dir) ? t.dir : DIRECTIONS[0].id,
    level,
    height: level === 'uitdagend' ? (t.height === 'laag' ? 'laag' : 'hoog') : level,
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

// fresh: alle ids opnieuw uitdelen (bij import), zodat vreemde of dubbele ids nooit binnenkomen.
export function sanitizeShow(s, { fresh = false } = {}) {
  if (!s || typeof s !== 'object') return null;
  const members = Array.isArray(s.members) ? s.members : [];
  const validPair = p => Array.isArray(p) && p.length === 2 && p.every(i => Number.isInteger(i) && i >= 0 && i < 4) && p[0] !== p[1];
  const id = v => (!fresh && okId(v) ? v : uid());
  const scenes = (Array.isArray(s.scenes) ? s.scenes : []).slice(0, 40).filter(sc => sc && typeof sc === 'object').map(sc => {
    const pair = validPair(sc.pair) ? [sc.pair[0], sc.pair[1]] : null;
    return {
      id: id(sc.id),
      pair,
      title: str(sc.title, 120),
      note: str(sc.note),
      // Een groepsscène heeft geen werper en valler, dus ook geen technieken
      items: !pair ? [] : (Array.isArray(sc.items) ? sc.items : []).slice(0, 30)
        .filter(it => it && typeof it === 'object')
        .map(it => ({ id: id(it.id), tech: str(it.tech, 40), thrower: it.thrower === 1 ? 1 : 0, note: str(it.note, 500) }))
        .filter(it => okId(it.tech)),
    };
  });
  return {
    id: id(s.id),
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
  const ids = new Set([...TECHNIQUES.map(t => t.id), ...s.custom.map(t => t.id)]);
  s.favorites = (Array.isArray(d.favorites) ? d.favorites : []).filter(id => ids.has(id));
  if (d.techNotes && typeof d.techNotes === 'object') {
    for (const [k, v] of Object.entries(d.techNotes)) if (ids.has(k) && typeof v === 'string' && v) s.techNotes[k] = v.slice(0, 2000);
  }
  s.shows = (Array.isArray(d.shows) ? d.shows : []).map(x => sanitizeShow(x)).filter(Boolean);
  s.activeShow = okId(d.activeShow) ? d.activeShow : null;
  return s;
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

function freeName(name) {
  const names = new Set(state.shows.map(s => s.name));
  if (!names.has(name)) return name;
  for (let n = 1; ; n++) {
    const candidate = `${name} (kopie${n > 1 ? ` ${n}` : ''})`;
    if (!names.has(candidate)) return candidate;
  }
}

// Voeg een geïmporteerde show toe als nieuwe kopie; overschrijft nooit iets.
// Geeft de show terug en hoeveel technieken niet konden worden overgenomen.
export function importPacked(data) {
  const raw = data && data.app === 'val-werp-coach' ? data : null;
  // Ook een losse show en een export uit de vorige versie van de app accepteren
  const showData = raw ? raw.show : data && Array.isArray(data.duos) ? fromLegacy(data) : data;
  if (!showData || !Array.isArray(showData.scenes)) throw new Error('Dit is geen geldig showbestand.');

  // Eigen technieken krijgen een nieuw id als dat bij ons al voor iets anders bestaat
  const remap = Object.create(null);
  const customs = [];
  for (const rawT of raw && Array.isArray(raw.custom) ? raw.custom.slice(0, 200) : []) {
    const t = sanitizeTechnique(rawT);
    if (!t) continue;
    const mine = state.custom.find(x => x.id === t.id);
    if (mine && (mine.name !== t.name || mine.sport !== t.sport)) {
      const fresh = { ...t, id: `c-${uid()}` };
      remap[t.id] = fresh.id;
      customs.push(fresh);
    } else if (!mine) customs.push(t);
    if (rawT && typeof rawT.id === 'string' && rawT.id !== t.id && !remap[rawT.id]) remap[rawT.id] = t.id;
  }

  const total = showData.scenes.reduce((n, sc) => n + (sc && Array.isArray(sc.items) ? sc.items.length : 0), 0);
  showData.scenes.forEach(sc => {
    if (sc && Array.isArray(sc.items)) sc.items.forEach(it => { if (it && remap[it.tech]) it.tech = remap[it.tech]; });
  });
  const show = sanitizeShow(showData, { fresh: true });
  const known = new Set([...TECHNIQUES.map(t => t.id), ...state.custom.map(t => t.id), ...customs.map(t => t.id)]);
  show.scenes.forEach(sc => { sc.items = sc.items.filter(it => known.has(it.tech)); });
  const kept = show.scenes.reduce((n, sc) => n + sc.items.length, 0);

  update(st => {
    st.custom.push(...customs);
    show.name = freeName(show.name);
    show.updated = Date.now();
    st.shows.push(show);
    st.activeShow = show.id;
  });
  return { show, dropped: Math.max(0, total - kept) };
}

// Vorige app: { name, duos: [{ techniques: [{ techniqueId }], notes: [{ text }] }] }
function fromLegacy(d) {
  const byName = name => TECHNIQUES.find(t => t.name.toLowerCase() === String(name).toLowerCase());
  return {
    name: d.name,
    scenes: d.duos.map((duo, i) => ({
      pair: PAIRS[i % PAIRS.length],
      note: (Array.isArray(duo && duo.notes) ? duo.notes : []).map(n => n && n.text).filter(t => typeof t === 'string' && t).join('\n'),
      items: (Array.isArray(duo && duo.techniques) ? duo.techniques : []).map((t, j) => {
        const id = t && t.techniqueId != null ? String(t.techniqueId) : '';
        const hit = TECHNIQUES.find(x => x.id === id) || byName(id);
        return { tech: hit ? hit.id : id, thrower: j % 2 };
      }),
    })),
  };
}

const b64url = bytes => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
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

// Haal de code uit een geplakte deel-link (of uit alleen de code).
export function shareCodeFrom(text) {
  const m = String(text || '').trim().match(/(?:#deel=)?([zp][\w-]{10,})\s*$/);
  return m ? m[1] : null;
}

// Pas laden als alle hulpfuncties hierboven bestaan.
export const state = load();
