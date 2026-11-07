// Gedeelde interface-bouwstenen: escapen, iconen, dialogen, video, meldingen en registers.

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Klikacties en invoer-handlers per module: data-action="naam" en data-input="naam".
export const actions = {};
export const inputs = {};

// Delen van de pagina die opnieuw getekend kunnen worden zonder de rest (en het invoerveld met focus) te raken.
export const parts = {};
export function refreshParts(root = document) {
  const ae = document.activeElement;
  const typing = ae && ae.matches('input:not([type=radio]):not([type=checkbox]), textarea, select');
  const key = focusKey(ae);
  root.querySelectorAll('[data-part]').forEach(el => {
    const fn = parts[el.dataset.part];
    if (!fn || (typing && el.contains(ae))) return;
    // Horizontaal gescrolde chiprijen op dezelfde plek houden
    const scroll = [...el.querySelectorAll('.chips')].map(c => c.scrollLeft);
    el.innerHTML = fn(el.dataset);
    el.querySelectorAll('.chips').forEach((c, i) => { c.scrollLeft = scroll[i] || 0; });
  });
  if (!typing) restoreFocus(key);
}

// Na opnieuw tekenen de focus terugzetten op dezelfde knop (prettig met toetsenbord en schermlezer).
export function focusKey(el) {
  if (!el || !el.dataset || !el.dataset.action) return null;
  const d = el.dataset;
  return [d.action, d.id, d.scene, d.item, d.key, d.val, d.scope, d.i, d.dir, el.classList[0]].join('|');
}
export function restoreFocus(key) {
  if (!key || (document.activeElement && document.activeElement !== document.body && document.contains(document.activeElement))) return;
  const el = [...document.querySelectorAll('[data-action]')].find(e => focusKey(e) === key);
  if (!el) return;
  // Een uitgeschakelde knop (bijvoorbeeld Omlaag bij het laatste item) kan geen focus krijgen: neem de buurknop
  const target = el.disabled ? el.parentElement.querySelector('[data-action]:not([disabled])') : el;
  if (target) target.focus({ preventScroll: true });
}

const ICONS = {
  toets: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9z"/><path d="m9 13 2 2 4-4"/>',
  valbreken: '<path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/>',
  sporten: '<circle cx="12" cy="9" r="5.5"/><path d="m8.7 13.5-1.4 7.5 4.7-2.6 4.7 2.6-1.4-7.5"/>',
  technieken: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3z"/><path d="M21 5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21z"/>',
  choreo: '<path d="M3 6h11M3 12h11M3 18h7"/><path d="m16 13 6 3.5-6 3.5z"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z"/>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  swap: '<path d="M7 4 3 8l4 4"/><path d="M3 8h14"/><path d="m17 12 4 4-4 4"/><path d="M21 16H7"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.4 13.3 7.2 4.4M15.6 6.3l-7.2 4.4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M5 21h14"/>',
  print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  reset: '<path d="M4 4v6h6"/><path d="M4.6 15a8 8 0 1 0 1.8-8.4L4 10"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.3"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};

export const icon = (name, cls = '') => `<svg class="i i-${name} ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

// ---------- Meldingen ----------

// De melding komt in het bovenste open dialoogvenster te staan (anders is hij daar onzichtbaar en
// onhoorbaar). Met een actie, zoals 'Ongedaan maken', blijft hij langer staan.
let toastTimer;
export function toast(msg, { action, onAction } = {}) {
  const el = document.getElementById('toast');
  const host = [...document.querySelectorAll('dialog[open]')].pop() || document.body;
  if (el.parentElement !== host) host.append(el);
  el.innerHTML = '';
  el.classList.add('show');
  // Tekst een tik later zetten, zodat schermlezers de wijziging oppikken
  setTimeout(() => {
    el.textContent = msg;
    if (action) {
      const b = Object.assign(document.createElement('button'), { type: 'button', textContent: action, className: 'toast-action' });
      b.addEventListener('click', () => { hide(); onAction && onAction(); });
      el.append(' ', b);
    }
  }, 30);
  el.classList.toggle('has-action', !!action);
  const hide = () => {
    clearTimeout(toastTimer);
    el.classList.remove('show', 'has-action');
  };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hide, action ? 6000 : Math.max(2600, msg.length * 60));
}

// ---------- Dialogen (onderaan als sheet op de telefoon, gecentreerd op de laptop) ----------

let dlgCount = 0;
export function openDialog({ title, body, className = '', onClose, footer = '' }) {
  const back = focusKey(document.activeElement);
  const d = document.createElement('dialog');
  const titleId = `dlg-title-${++dlgCount}`;
  d.className = `dlg ${className}`;
  d.setAttribute('aria-labelledby', titleId);
  d.innerHTML = `
    <div class="dlg-head">
      <h2 class="dlg-title" id="${titleId}">${esc(title)}</h2>
      <button type="button" class="icon-btn" data-dlg-close aria-label="Sluiten">${icon('x')}</button>
    </div>
    <div class="dlg-body">${body}</div>
    ${footer ? `<div class="dlg-foot">${footer}</div>` : ''}`;
  document.body.append(d);
  // Direct opruimen bij sluiten, ook als het close-event later komt (bijvoorbeeld op een achtergrondtabblad)
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    const t = document.getElementById('toast');
    if (t && d.contains(t)) document.body.append(t);
    d.remove();
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('has-dialog');
    // Focus terug naar de knop die het venster opende (ook als die intussen opnieuw getekend is)
    restoreFocus(back);
    onClose && onClose();
  };
  const nativeClose = d.close.bind(d);
  d.close = value => { nativeClose(value); finish(); };
  d.addEventListener('close', finish);
  d.addEventListener('click', e => {
    if (e.target === d || e.target.closest('[data-dlg-close]')) d.close();
  });
  d.showModal();
  document.body.classList.add('has-dialog');
  return d;
}

export function confirmDialog(message, { title = 'Weet je het zeker?', ok = 'Verwijderen', danger = true } = {}) {
  return new Promise(resolve => {
    let result = false;
    const d = openDialog({
      title,
      className: 'dlg-small',
      body: `<p>${esc(message)}</p>`,
      footer: `<button type="button" class="btn btn-ghost" data-dlg-close>Annuleren</button>
               <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${esc(ok)}</button>`,
      onClose: () => resolve(result),
    });
    d.querySelector('[data-ok]').addEventListener('click', () => { result = true; d.close(); });
    // Bij verwijderen staat de focus op Annuleren, zodat één Enter niets kapotmaakt
    d.querySelector(danger ? '.dlg-foot [data-dlg-close]' : '[data-ok]').focus();
  });
}

export function promptDialog(title, { label = 'Naam', value = '', ok = 'Opslaan' } = {}) {
  return new Promise(resolve => {
    let result = null;
    const d = openDialog({
      title,
      className: 'dlg-small',
      body: `<form class="stack" data-prompt>
               <label class="field"><span>${esc(label)}</span><input type="text" maxlength="80" value="${esc(value)}" required></label>
             </form>`,
      footer: `<button type="button" class="btn btn-ghost" data-dlg-close>Annuleren</button>
               <button type="button" class="btn btn-primary" data-ok>${esc(ok)}</button>`,
      onClose: () => resolve(result),
    });
    const input = d.querySelector('input');
    const submit = () => {
      const v = input.value.trim();
      if (!v) { input.focus(); return; }
      result = v;
      d.close();
    };
    d.querySelector('[data-ok]').addEventListener('click', submit);
    d.querySelector('form').addEventListener('submit', e => { e.preventDefault(); submit(); });
    input.focus();
    input.select();
  });
}

// ---------- Video ----------

export function ytId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
    const p = u.pathname.split('/');
    if (p[1] === 'shorts' || p[1] === 'embed' || p[1] === 'live') return p[2] || null;
    return u.searchParams.get('v');
  } catch { return null; }
}

export function openVideo(url, title) {
  const id = ytId(url);
  const frame = id && /^[\w-]{6,20}$/.test(id)
    ? `<div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1&modestbranding=1" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
    : `<p class="muted">Deze video kan niet in de app worden afgespeeld.</p>`;
  openDialog({
    title,
    className: 'dlg-video',
    body: `${frame}
      <a class="btn btn-ghost btn-block" href="${esc(url)}" target="_blank" rel="noopener">${icon('external')} Open op YouTube</a>`,
  });
}

// ---------- Kleine helpers voor markup ----------

export const levelBars = level => {
  const n = level === 'uitdagend' ? 3 : level === 'hoog' ? 2 : 1;
  return `<span class="bars" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
};

export function download(filename, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const slug = s => (s || 'show').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'show';
