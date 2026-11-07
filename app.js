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

// De links één keer tekenen en daarna alleen de actieve markeren, zodat de focus op de link blijft.
function renderNav() {
  document.querySelectorAll('[data-nav]').forEach(n => {
    if (!n.children.length) {
      n.innerHTML = ROUTES.map(r => `<a href="#${r.id}" data-route="${r.id}">${icon(r.id)}<span>${r.label}</span></a>`).join('');
    }
    n.querySelectorAll('a').forEach(a => {
      const on = a.dataset.route === current;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  });
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
  const first = current === null;
  const changed = id !== current;
  current = id;
  try { localStorage.setItem(TAB_KEY, id); } catch { /* geen opslag */ }
  renderNav();
  render();
  if (changed) {
    window.scrollTo(0, 0);
    document.title = `${ROUTES.find(r => r.id === id).label} · Val & Werp Coach`;
    // Schermlezers en toetsenbord beginnen bij de nieuwe inhoud
    if (!first && !document.querySelector('dialog[open]')) main.focus({ preventScroll: true });
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
      const { show, dropped } = importPacked(data);
      toast(`“${show.name}” staat nu bij Mijn show${dropped ? `. ${dropped} ${dropped === 1 ? 'techniek kon' : 'technieken konden'} niet worden overgenomen` : ''}`);
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
  if (type === 'save-failed' || type === 'save-ok') {
    document.getElementById('save-error').hidden = type === 'save-ok';
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
