// Opstart, navigatie en de centrale afhandeling van klikken en invoer.
import { subscribe, flush, decodeShare, importPacked } from './store.js';
import { icon, actions, inputs, refreshParts, focusKey, restoreFocus, confirmDialog, toast } from './ui.js';
import { viewToets, viewValbreken, viewSporten, viewTechnieken } from './views.js';
import { viewChoreo, autoGrow } from './choreo.js';

const ROUTES = [
  { id: 'toets', label: 'Toets', view: viewToets },
  { id: 'valbreken', label: 'Valbreken', view: viewValbreken },
  { id: 'sporten', label: 'Sporten', view: viewSporten },
  { id: 'technieken', label: 'Technieken', view: viewTechnieken },
  { id: 'choreo', label: 'Mijn show', view: viewChoreo },
];
const TAB_KEY = 'val-werp-coach:tab';

const main = document.getElementById('main');
let current = null;

function routeId() {
  const id = location.hash.replace(/^#\/?/, '').split(/[?=]/)[0];
  return ROUTES.some(r => r.id === id) ? id : null;
}

function renderNav() {
  const links = ROUTES.map(r => `
    <a href="#${r.id}" class="${r.id === current ? 'active' : ''}" ${r.id === current ? 'aria-current="page"' : ''}>
      ${icon(r.id)}<span>${r.label}</span>
    </a>`).join('');
  document.querySelectorAll('[data-nav]').forEach(n => { n.innerHTML = links; });
}

function render() {
  const key = focusKey(document.activeElement);
  const route = ROUTES.find(r => r.id === current);
  main.innerHTML = route.view();
  main.querySelectorAll('textarea.scene-note').forEach(autoGrow);
  restoreFocus(key);
}

function go() {
  const id = routeId();
  if (!id) {
    let last = null;
    try { last = localStorage.getItem(TAB_KEY); } catch { /* geen opslag */ }
    history.replaceState(null, '', `#${ROUTES.some(r => r.id === last) ? last : 'toets'}`);
    return go();
  }
  const changed = id !== current;
  current = id;
  try { localStorage.setItem(TAB_KEY, id); } catch { /* geen opslag */ }
  renderNav();
  render();
  if (changed) {
    window.scrollTo(0, 0);
    document.title = `${ROUTES.find(r => r.id === id).label} · Val & Werp Coach`;
  }
}

// Een gedeelde show komt binnen via #deel=...
async function handleShareLink() {
  const m = location.hash.match(/^#deel=([\w-]+)$/);
  if (!m) return false;
  history.replaceState(null, '', '#choreo');
  try {
    const data = await decodeShare(m[1]);
    const name = data && data.show && data.show.name ? data.show.name : 'deze show';
    const ok = await confirmDialog(`Je krijgt een eigen kopie van “${name}”. Je eigen shows blijven gewoon bestaan.`,
      { title: 'Gedeelde show openen?', ok: 'Toevoegen', danger: false });
    if (ok) {
      importPacked(data);
      toast(`“${name}” staat nu bij Mijn show`);
    }
  } catch {
    toast('Deze deel-link werkt niet. Vraag je groepsgenoot om een nieuwe.');
  }
  go();
  return true;
}

// ---------- Centrale afhandeling ----------

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.action];
  if (fn) {
    e.preventDefault();
    fn(el, e);
  }
});

document.addEventListener('input', e => {
  const el = e.target.closest('[data-input]');
  if (el && inputs[el.dataset.input]) inputs[el.dataset.input](el, e);
});

subscribe(type => {
  if (type === 'save-failed') {
    toast('Opslaan lukt niet. Is de opslag van je browser vol of uitgeschakeld?');
    return;
  }
  render();
  refreshParts();
});

addEventListener('hashchange', async () => {
  if (await handleShareLink()) return;
  go();
});

document.querySelectorAll('[data-nav]').forEach(n => n.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (a && a.getAttribute('href') === `#${current}`) window.scrollTo({ top: 0, behavior: 'smooth' });
}));

(async () => {
  if (!(await handleShareLink())) go();
})();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

addEventListener('beforeunload', flush);
