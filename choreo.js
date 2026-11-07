// Mijn show: viertal, zes duo's, technieken met rollen, toetscheck, uitvalcheck, oefenmodus en delen.
import { SPORTS } from './data.js';
import {
  state, update, save, PAIRS, uid, newShow, activeShow, memberName, techById, sportById, levelById, dirById,
  packShow, importPacked, encodeShare,
} from './store.js';
import {
  esc, icon, actions, inputs, parts, refreshParts, openDialog, confirmDialog, promptDialog, openVideo, toast, download, slug,
} from './ui.js';
import { searchBox, setPickContext, techMeta } from './views.js';

const ui = { absent: null, setupOpen: null };

const pairKey = p => `${Math.min(...p)}-${Math.max(...p)}`;
const who = (show, i) => `<span data-member="${i}">${esc(memberName(show, i))}</span>`;
const pairLabel = (show, p) => (p ? `${who(show, p[0])} &amp; ${who(show, p[1])}` : 'Hele groep');
const pairText = (show, p) => (p ? `${memberName(show, p[0])} & ${memberName(show, p[1])}` : 'Hele groep');
const findScene = (show, id) => show.scenes.find(s => s.id === id);
const isOut = sc => ui.absent != null && sc.pair && sc.pair.includes(ui.absent);

function touch(show) { show.updated = Date.now(); }

// ---------- Toetscheck ----------

export function analyze(show, absent = null) {
  const out = sc => absent != null && sc.pair && sc.pair.includes(absent);
  const scenes = show.scenes.filter(sc => !out(sc));
  const used = scenes.flatMap(sc => (sc.pair ? sc.items.map(it => ({ t: techById(it.tech), sc, it })) : [])).filter(x => x.t);

  const pairs = PAIRS.filter(p => !p.includes(absent)).map(p => {
    const n = new Set(used.filter(x => pairKey(x.sc.pair) === pairKey(p)).map(x => x.t.id)).size;
    return { p, n, ok: n >= 2 };
  });
  const sports = SPORTS.map(s => ({ s, ok: used.some(x => x.t.sport === s.id) }));
  const roles = [0, 1, 2, 3].filter(m => m !== absent).map(m => {
    const r = { valLaag: false, valHoog: false, werpLaag: false, werpHoog: false };
    for (const { t, sc, it } of used) {
      const hoog = t.level !== 'laag';
      if (sc.pair[it.thrower] === m) r[hoog ? 'werpHoog' : 'werpLaag'] = true;
      if (sc.pair[1 - it.thrower] === m) r[hoog ? 'valHoog' : 'valLaag'] = true;
    }
    return { m, r };
  });
  const elements = [
    ['Thema of verhaal', show.theme], ['Muziek', show.music], ['Kleding en aankleding', show.costume], ['Regie', show.direction],
  ].map(([label, v]) => ({ label, ok: !!v.trim() }));
  const score = (list, f = x => x.ok) => [list.filter(f).length, list.length];
  const roleCount = [roles.reduce((n, x) => n + Object.values(x.r).filter(Boolean).length, 0), roles.length * 4];
  return {
    pairs, sports, roles, elements,
    dropped: show.scenes.filter(out),
    totals: { pairs: score(pairs), sports: score(sports), roles: roleCount, elements: score(elements) },
  };
}

const mark = ok => `<span class="mk ${ok ? 'ok' : ''}" aria-label="${ok ? 'in orde' : 'nog niet'}">${ok ? icon('check') : ''}</span>`;
const frac = ([a, b]) => `<b class="frac ${a === b ? 'done' : ''}">${a}/${b}</b>`;

function checksBody(show) {
  const a = analyze(show);
  const all = Object.values(a.totals).every(([x, y]) => x === y);
  const roleCols = [['valLaag', 'Valt laag'], ['valHoog', 'Valt hoog'], ['werpLaag', 'Werpt laag'], ['werpHoog', 'Werpt hoog']];
  let uitval = '';
  if (ui.absent != null) {
    const b = analyze(show, ui.absent);
    const missing = b.sports.filter(x => !x.ok).map(x => x.s.name);
    const left = show.scenes.length - b.dropped.length;
    uitval = `<p class="uitval-result">Zonder <b>${esc(memberName(show, ui.absent))}</b> vallen ${b.dropped.length} scènes weg en blijven er ${left} over.
      ${missing.length ? `Dan ontbreekt nog: <b>${esc(missing.join(', '))}</b>.` : 'Alle sportprofielen zitten er dan nog in.'}</p>`;
  }
  return `
    ${all ? `<p class="all-good">${icon('check')} Alles in orde. Tijd om te oefenen!</p>` : ''}
    <section class="check-group">
      <h3>Elk duo twee technieken ${frac(a.totals.pairs)}</h3>
      <ul class="check-list">${a.pairs.map(x => `<li>${mark(x.ok)}<span>${pairLabel(show, x.p)}</span><small>${x.n}</small></li>`).join('')}</ul>
    </section>
    <section class="check-group">
      <h3>Alle sportprofielen ${frac(a.totals.sports)}</h3>
      <ul class="sport-marks">${a.sports.map(x => `<li class="${x.ok ? 'ok' : ''}">${x.ok ? icon('check') : ''}${esc(x.s.name)}</li>`).join('')}</ul>
    </section>
    <section class="check-group">
      <h3>Ieder laat alles zien ${frac(a.totals.roles)}</h3>
      <table class="role-grid">
        <thead><tr><th></th>${roleCols.map(([, l]) => `<th scope="col">${l}</th>`).join('')}</tr></thead>
        <tbody>${a.roles.map(x => `<tr><th scope="row">${who(show, x.m)}</th>${roleCols.map(([k]) => `<td>${mark(x.r[k])}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      <p class="hint">Hoog telt ook voor technieken op niveau uitdagend.</p>
    </section>
    <section class="check-group">
      <h3>Showelementen ${frac(a.totals.elements)}</h3>
      <ul class="check-list">${a.elements.map(x => `<li>${mark(x.ok)}<span>${x.label}</span></li>`).join('')}</ul>
    </section>
    <section class="check-group">
      <h3>Als iemand uitvalt</h3>
      <div class="chips wrap" role="group" aria-label="Kies wie uitvalt">
        <button type="button" class="chip ${ui.absent == null ? 'on' : ''}" aria-pressed="${ui.absent == null}" data-action="absent" data-i="">Niemand</button>
        ${[0, 1, 2, 3].map(i => `<button type="button" class="chip ${ui.absent === i ? 'on' : ''}" aria-pressed="${ui.absent === i}" data-action="absent" data-i="${i}">${who(show, i)}</button>`).join('')}
      </div>
      ${uitval}
    </section>
    <p class="hint">De check is een hulpmiddel. Je docent beoordeelt de show.</p>`;
}

parts.checks = () => {
  const show = activeShow();
  return show ? checksBody(show) : '';
};

parts.checkbar = () => {
  const show = activeShow();
  if (!show) return '';
  const t = analyze(show).totals;
  const [ok, all] = Object.values(t).reduce(([a, b], [x, y]) => [a + x, b + y], [0, 0]);
  return `<button type="button" class="check-bar" data-action="checks-open">
    <span class="check-ring" style="--p:${Math.round((ok / all) * 100)}">${icon(ok === all ? 'check' : 'toets')}</span>
    <span><b>Toetscheck</b><small>${ok} van ${all} punten in orde</small></span>
    ${icon('right')}
  </button>`;
};

// ---------- Weergave ----------

function emptyView() {
  return `
  <section class="page">
    <header class="page-head">
      <p class="eyebrow">Mijn show</p>
      <h1>Bouw je show</h1>
      <p class="lead">Plan je show met je viertal: wie doet wat, in welke volgorde, en klopt alles met de toetseisen?</p>
    </header>
    <ol class="steps">
      <li><span><b>Vul je viertal in.</b> De app maakt meteen de zes duo’s.</span></li>
      <li><span><b>Kies per duo twee technieken.</b> Geef aan wie werpt en wie valt.</span></li>
      <li><span><b>Check, oefen en deel.</b> De toetscheck laat zien wat nog ontbreekt. Met de oefenmodus loop je de show door in de zaal.</span></li>
    </ol>
    <div class="row">
      <button type="button" class="btn btn-primary" data-action="show-new">${icon('plus')} Nieuwe show</button>
      <button type="button" class="btn" data-action="show-import">${icon('upload')} Show importeren</button>
    </div>
    <p class="muted">Kreeg je een link van een groepsgenoot? Open die link, dan verschijnt de show vanzelf hier.</p>
  </section>`;
}

const setupSummary = show =>
  esc(show.members.map((m, i) => memberName(show, i)).join(', ')) + (show.theme.trim() ? ` · ${esc(show.theme)}` : '');

parts['setup-sum'] = () => {
  const show = activeShow();
  return show ? setupSummary(show) : '';
};

function setupCard(show) {
  const filled = show.members.every(m => m.trim());
  const open = ui.setupOpen ?? !filled;
  const field = (key, label, ph, area) => `
    <label class="field"><span>${label}</span>
      ${area
        ? `<textarea rows="2" data-input="show-field" data-key="${key}" placeholder="${ph}">${esc(show[key])}</textarea>`
        : `<input type="text" maxlength="200" data-input="show-field" data-key="${key}" placeholder="${ph}" value="${esc(show[key])}">`}
    </label>`;
  return `
  <details class="card setup" data-setup ${open ? 'open' : ''}>
    <summary>
      <span class="setup-sum">
        <b>Groep en thema</b>
        <small data-part="setup-sum">${setupSummary(show)}</small>
      </span>
      ${icon('down', 'chev')}
    </summary>
    <div class="members">
      ${[0, 1, 2, 3].map(i => `
        <label class="member"><span class="badge">${'ABCD'[i]}</span>
          <input type="text" maxlength="40" autocomplete="off" placeholder="Naam ${i + 1}" value="${esc(show.members[i])}" data-input="member" data-i="${i}" aria-label="Naam groepslid ${'ABCD'[i]}">
        </label>`).join('')}
    </div>
    <div class="grid cols-2 tight">
      ${field('theme', 'Thema of verhaal', 'Bijvoorbeeld: western, superhelden, ninja’s')}
      ${field('music', 'Muziek', 'Nummer(s) en wanneer de muziek wisselt')}
      ${field('costume', 'Kleding en aankleding', 'Kleding, attributen, sfeer')}
      ${field('direction', 'Regie', 'Opkomst, overgangen en slot', true)}
    </div>
  </details>`;
}

function itemRow(show, sc, it, j) {
  const t = techById(it.tech);
  if (!t) return '';
  const thr = sc.pair[it.thrower];
  const fal = sc.pair[1 - it.thrower];
  return `
  <li class="item">
    <span class="item-num">${j + 1}</span>
    <div class="item-body">
      <button type="button" class="item-name" data-action="${t.video ? 'video' : 'noop'}" data-url="${esc(t.video)}" data-title="${esc(t.name)}">
        ${esc(t.name)}${t.video ? icon('play', 'tiny') : ''}
      </button>
      <span class="tech-meta">${techMeta(t)}</span>
      <div class="roles">
        <span class="role"><small>werpt</small>${who(show, thr)}</span>
        <button type="button" class="icon-btn sm" data-action="item-swap" data-scene="${sc.id}" data-item="${it.id}" aria-label="Wissel wie werpt en wie valt">${icon('swap')}</button>
        <span class="role"><small>valt</small>${who(show, fal)}</span>
      </div>
      <input type="text" class="item-note" maxlength="500" placeholder="Aanwijzing, bijvoorbeeld: op de drumroffel" value="${esc(it.note)}" data-input="item-note" data-scene="${sc.id}" data-item="${it.id}" aria-label="Aanwijzing bij ${esc(t.name)}">
    </div>
    <div class="item-tools">
      <button type="button" class="icon-btn sm" data-action="item-move" data-dir="-1" data-scene="${sc.id}" data-item="${it.id}" aria-label="Omhoog" ${j === 0 ? 'disabled' : ''}>${icon('up')}</button>
      <button type="button" class="icon-btn sm" data-action="item-move" data-dir="1" data-scene="${sc.id}" data-item="${it.id}" aria-label="Omlaag" ${j === sc.items.length - 1 ? 'disabled' : ''}>${icon('down')}</button>
      <button type="button" class="icon-btn sm" data-action="item-remove" data-scene="${sc.id}" data-item="${it.id}" aria-label="Verwijder ${esc(t.name)}">${icon('x')}</button>
    </div>
  </li>`;
}

function sceneCard(show, sc, i) {
  const items = sc.items.filter(it => techById(it.tech));
  const distinct = new Set(items.map(it => it.tech)).size;
  const status = !sc.pair ? '' : distinct >= 2
    ? `<span class="status ok">${icon('check')} ${distinct} technieken</span>`
    : `<span class="status">nog ${2 - distinct} ${2 - distinct === 1 ? 'techniek' : 'technieken'}</span>`;
  const last = show.scenes.length - 1;
  return `
  <li class="scene ${isOut(sc) ? 'out' : ''} ${sc.pair ? '' : 'group'}" id="scene-${sc.id}">
    <header class="scene-head">
      <span class="scene-num">${i + 1}</span>
      <div class="scene-who">
        <b>${pairLabel(show, sc.pair)}</b>
        ${isOut(sc) ? '<span class="tag tag-accent">valt weg</span>' : status}
      </div>
      <div class="scene-tools">
        <button type="button" class="icon-btn sm" data-action="scene-move" data-dir="-1" data-scene="${sc.id}" aria-label="Scène omhoog" ${i === 0 ? 'disabled' : ''}>${icon('up')}</button>
        <button type="button" class="icon-btn sm" data-action="scene-move" data-dir="1" data-scene="${sc.id}" aria-label="Scène omlaag" ${i === last ? 'disabled' : ''}>${icon('down')}</button>
        <button type="button" class="icon-btn sm" data-action="scene-remove" data-scene="${sc.id}" aria-label="Verwijder scène">${icon('trash')}</button>
      </div>
    </header>
    <input type="text" class="scene-title" maxlength="120" placeholder="${sc.pair ? 'Moment in het verhaal (optioneel)' : 'Bijvoorbeeld: opening of slot'}" value="${esc(sc.title)}" data-input="scene-title" data-scene="${sc.id}" aria-label="Titel van scène ${i + 1}">
    ${sc.pair ? `
      ${items.length ? `<ol class="items">${items.map((it, j) => itemRow(show, { ...sc, items }, it, j)).join('')}</ol>` : ''}
      <button type="button" class="btn btn-ghost btn-add" data-action="pick-open" data-scene="${sc.id}">${icon('plus')} Techniek kiezen</button>` : ''}
    <textarea class="scene-note" rows="1" maxlength="2000" placeholder="${sc.pair ? 'Regie: opkomst, overgang, muziekmoment' : 'Wat gebeurt er? Wie staat waar?'}" data-input="scene-note" data-scene="${sc.id}" aria-label="Regie bij scène ${i + 1}">${esc(sc.note)}</textarea>
  </li>`;
}

export function viewChoreo() {
  const show = activeShow();
  if (!show) return emptyView();
  if (state.activeShow !== show.id) state.activeShow = show.id;
  if (ui.absent != null && ui.absent > 3) ui.absent = null;
  const switcher = state.shows.length > 1
    ? `<label class="show-switch"><span class="sr">Kies een show</span>
        <select data-input="show-switch">${state.shows.map(s => `<option value="${s.id}" ${s.id === show.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
      </label>` : '';
  return `
  <section class="page choreo">
    <header class="show-bar">
      <div class="show-title">
        <p class="eyebrow">Mijn show</p>
        <h1>${esc(show.name)}</h1>
        ${switcher}
      </div>
      <div class="show-actions">
        <button type="button" class="btn btn-primary" data-action="rehearse">${icon('play')} Oefenen</button>
        <button type="button" class="btn" data-action="share-open">${icon('share')} Delen</button>
        <button type="button" class="icon-btn" data-action="show-menu" aria-label="Meer opties">${icon('more')}</button>
      </div>
    </header>
    <div class="choreo-grid">
      <div class="choreo-main">
        ${setupCard(show)}
        <div class="checkbar-wrap" data-part="checkbar">${parts.checkbar()}</div>
        ${ui.absent != null ? `
          <p class="absent-banner">${icon('users')}<span>Uitvalcheck: zo ziet de show eruit zonder <b>${esc(memberName(show, ui.absent))}</b>.</span>
            <button type="button" class="btn btn-sm" data-action="absent" data-i="">Stop</button></p>` : ''}
        <ol class="scenes">${show.scenes.map((sc, i) => sceneCard(show, sc, i)).join('')}</ol>
        <button type="button" class="btn btn-ghost btn-block btn-dashed" data-action="scene-add">${icon('plus')} Scène toevoegen</button>
      </div>
      <aside class="choreo-side" aria-label="Toetscheck">
        <article class="card checks-card">
          <h2>Toetscheck</h2>
          <div data-part="checks">${checksBody(show)}</div>
        </article>
      </aside>
    </div>
  </section>`;
}

// ---------- Technieken kiezen ----------

function openPicker(show, sc) {
  const counts = () => Object.fromEntries([...new Set(sc.items.map(it => it.tech))].map(id => [id, sc.items.filter(it => it.tech === id).length]));
  setPickContext({ counts: counts() });
  openDialog({
    title: `Techniek voor ${pairText(show, sc.pair)}`,
    className: 'dlg-tall',
    body: `
      <div class="picker-tools">
        ${searchBox('pick')}
        <div data-part="filters" data-scope="pick">${parts.filters({ scope: 'pick' })}</div>
      </div>
      <div data-part="techlist" data-scope="pick" data-scene="${sc.id}">${parts.techlist({ scope: 'pick', scene: sc.id })}</div>`,
    footer: '<button type="button" class="btn btn-primary btn-block" data-dlg-close>Klaar</button>',
  });
}

function addItem(show, sc, techId) {
  update(() => {
    sc.items.push({ id: uid(), tech: techId, thrower: sc.items.length % 2, note: '' });
    touch(show);
  });
  setPickContext({ counts: Object.fromEntries(sc.items.map(it => [it.tech, sc.items.filter(x => x.tech === it.tech).length])) });
  refreshParts();
}

// ---------- Oefenmodus ----------

function buildSteps(show) {
  const steps = [];
  show.scenes.forEach((sc, si) => {
    if (isOut(sc)) return;
    const items = sc.items.filter(it => techById(it.tech));
    if (!sc.pair || !items.length) steps.push({ sc, si, it: null });
    else items.forEach((it, ii) => steps.push({ sc, si, it, ii, of: items.length }));
  });
  return steps;
}

function openRehearsal(show) {
  const steps = buildSteps(show);
  if (!steps.length) { toast('Voeg eerst scènes toe'); return; }
  let pos = 0;
  let started = Date.now();
  let paused = 0;
  let pausedAt = null;
  let lock = null;
  const sceneCount = new Set(steps.map(s => s.si)).size;

  const d = openDialog({ title: show.name, className: 'dlg-full rehearsal', body: '<div class="rh" data-rh></div>' });
  const root = d.querySelector('[data-rh]');
  const elapsed = () => Math.floor(((pausedAt || Date.now()) - started - paused) / 1000);
  const clock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const stepCard = st => {
    if (!st.it) {
      return `<p class="rh-scene">Scène ${st.si + 1} · ${esc(pairText(show, st.sc.pair))}</p>
        <h2 class="rh-tech">${esc(st.sc.title || (st.sc.pair ? 'Nog geen technieken' : 'Groepsmoment'))}</h2>
        ${st.sc.note ? `<p class="rh-note">${esc(st.sc.note)}</p>` : ''}`;
    }
    const t = techById(st.it.tech);
    const thr = memberName(show, st.sc.pair[st.it.thrower]);
    const fal = memberName(show, st.sc.pair[1 - st.it.thrower]);
    return `
      <p class="rh-scene">Scène ${st.si + 1} · ${esc(pairText(show, st.sc.pair))}${st.sc.title ? ` · ${esc(st.sc.title)}` : ''} <span>· techniek ${st.ii + 1}/${st.of}</span></p>
      <h2 class="rh-tech">${esc(t.name)}</h2>
      <p class="rh-meta">${esc(sportById(t.sport).name)} · ${esc(dirById(t.dir).name)} · ${esc(levelById(t.level).name)}</p>
      <div class="rh-roles">
        <div><small>werpt</small><b>${esc(thr)}</b></div>
        <div><small>valt</small><b>${esc(fal)}</b></div>
      </div>
      ${st.it.note ? `<p class="rh-note">${icon('note')} ${esc(st.it.note)}</p>` : ''}
      ${st.ii === 0 && st.sc.note ? `<p class="rh-regie"><b>Regie:</b> ${esc(st.sc.note)}</p>` : ''}
      ${t.video ? `<button type="button" class="btn btn-ghost btn-sm" data-action="video" data-url="${esc(t.video)}" data-title="${esc(t.name)}">${icon('play')} Bekijk video</button>` : ''}`;
  };

  const nextLabel = st => {
    if (!st) return 'Einde van de show';
    if (!st.it) return `Scène ${st.si + 1}: ${pairText(show, st.sc.pair)}`;
    const t = techById(st.it.tech);
    return `${t.name} · ${memberName(show, st.sc.pair[st.it.thrower])} werpt`;
  };

  const paint = () => {
    if (pos >= steps.length) {
      root.innerHTML = `
        <div class="rh-done">
          <p class="eyebrow">Doorloop klaar</p>
          <h2 class="rh-tech">${clock(elapsed())}</h2>
          <p class="muted">${sceneCount} scènes, ${steps.filter(s => s.it).length} technieken${ui.absent != null ? `, zonder ${esc(memberName(show, ui.absent))}` : ''}.</p>
          <div class="row center">
            <button type="button" class="btn" data-rh-restart>${icon('reset')} Opnieuw</button>
            <button type="button" class="btn btn-primary" data-dlg-close>Sluiten</button>
          </div>
        </div>`;
      pausedAt = pausedAt || Date.now();
      return;
    }
    const st = steps[pos];
    const sceneIndex = [...new Set(steps.slice(0, pos + 1).map(s => s.si))].length;
    root.innerHTML = `
      <div class="rh-top">
        <span>Scène ${sceneIndex} van ${sceneCount}${ui.absent != null ? ` · zonder ${esc(memberName(show, ui.absent))}` : ''}</span>
        <span class="rh-clock">
          <span data-clock>${clock(elapsed())}</span>
          <button type="button" class="icon-btn sm" data-rh-pause aria-label="${pausedAt ? 'Start de tijd' : 'Pauzeer de tijd'}">${icon(pausedAt ? 'play' : 'pause')}</button>
        </span>
      </div>
      <div class="rh-progress"><span style="width:${((pos + 1) / steps.length) * 100}%"></span></div>
      <div class="rh-card" aria-live="polite">${stepCard(st)}</div>
      <p class="rh-next"><small>Hierna</small>${esc(nextLabel(steps[pos + 1]))}</p>
      <div class="rh-nav">
        <button type="button" class="btn btn-lg" data-rh-prev ${pos === 0 ? 'disabled' : ''}>${icon('left')} Vorige</button>
        <button type="button" class="btn btn-lg btn-primary" data-rh-next>${pos === steps.length - 1 ? 'Afronden' : 'Volgende'} ${icon('right')}</button>
      </div>`;
  };

  const go = delta => {
    pos = Math.max(0, Math.min(steps.length, pos + delta));
    paint();
  };
  const togglePause = () => {
    if (pausedAt) { paused += Date.now() - pausedAt; pausedAt = null; } else pausedAt = Date.now();
    paint();
  };

  root.addEventListener('click', e => {
    if (e.target.closest('[data-rh-next]')) go(1);
    else if (e.target.closest('[data-rh-prev]')) go(-1);
    else if (e.target.closest('[data-rh-pause]')) togglePause();
    else if (e.target.closest('[data-rh-restart]')) { pos = 0; started = Date.now(); paused = 0; pausedAt = null; paint(); }
  });
  const onKey = e => {
    if (document.querySelector('dialog.dlg-video')) return;
    // Spatie op een knop is al een klik; niet nog een keer doorschakelen
    if (e.key === ' ' && e.target.closest('button')) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  };
  d.addEventListener('keydown', onKey);

  let sx = null;
  let sy = null;
  root.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  root.addEventListener('pointerup', e => {
    if (sx == null) return;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  });

  const timer = setInterval(() => {
    const c = root.querySelector('[data-clock]');
    if (c) c.textContent = clock(elapsed());
  }, 1000);

  // Scherm aan houden tijdens het oefenen in de zaal
  const wake = async () => {
    try { if ('wakeLock' in navigator && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen'); } catch { /* niet ondersteund */ }
  };
  const onVis = () => { if (document.visibilityState === 'visible') wake(); };
  document.addEventListener('visibilitychange', onVis);
  wake();

  d.addEventListener('close', () => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVis);
    if (lock) lock.release().catch(() => {});
  });
  paint();
  d.querySelector('[data-rh-next]')?.focus();
}

// ---------- Delen, bestand en draaiboek ----------

function openShare(show) {
  openDialog({
    title: 'Delen en bewaren',
    body: `
      <section class="share-block">
        <h3>${icon('link')} Deel met je groep</h3>
        <p class="muted">Je groepsgenoten openen de link en krijgen een eigen kopie van deze show op hun telefoon of laptop.</p>
        <div class="row">
          ${navigator.share ? `<button type="button" class="btn btn-primary" data-action="share-native">${icon('share')} Deel link</button>` : ''}
          <button type="button" class="btn ${navigator.share ? '' : 'btn-primary'}" data-action="share-copy">${icon('copy')} Kopieer link</button>
        </div>
      </section>
      <section class="share-block">
        <h3>${icon('print')} Draaiboek</h3>
        <p class="muted">Een overzicht van je hele show: scènes, rollen, aanwijzingen en de toetscheck. Druk het af of bewaar het als PDF.</p>
        <button type="button" class="btn" data-action="show-print">${icon('print')} Draaiboek of PDF</button>
      </section>
      <section class="share-block">
        <h3>${icon('download')} Bestand</h3>
        <p class="muted">Handig als back-up of om te bewaren in je eigen map.</p>
        <div class="row">
          <button type="button" class="btn" data-action="show-export">${icon('download')} Download</button>
          <button type="button" class="btn" data-action="show-import">${icon('upload')} Importeer</button>
        </div>
      </section>
      <p class="hint">Je show staat alleen op dit apparaat. Deel of download hem regelmatig, zodat je hem niet kwijtraakt.</p>`,
  });
}

async function shareUrl(show) {
  return `${location.origin}${location.pathname}#deel=${await encodeShare(show)}`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

function pickFile() {
  const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json,application/json' });
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const show = importPacked(JSON.parse(await file.text()));
      document.querySelectorAll('dialog[open]').forEach(dl => dl.close());
      location.hash = '#choreo';
      toast(`“${show.name}” is geïmporteerd`);
    } catch (e) {
      toast(e.message && e.message.startsWith('Dit is') ? e.message : 'Dit bestand kan niet worden geopend.');
    }
  });
  input.click();
}

function printShow(show) {
  const a = analyze(show);
  const roleWords = { valLaag: 'valt laag', valHoog: 'valt hoog', werpLaag: 'werpt laag', werpHoog: 'werpt hoog' };
  const row = (k, v) => (v.trim() ? `<tr><th>${k}</th><td>${esc(v)}</td></tr>` : '');
  const html = `
    <article class="doc">
      <p class="doc-kicker">Val &amp; Werp Coach · HAN ALO · Van staand naar de grond</p>
      <h1>${esc(show.name)}</h1>
      <table class="doc-meta">
        <tr><th>Groep</th><td>${show.members.map((m, i) => `${'ABCD'[i]}. ${esc(memberName(show, i))}`).join('&nbsp;&nbsp; ')}</td></tr>
        ${row('Thema', show.theme)}${row('Muziek', show.music)}${row('Kleding', show.costume)}${row('Regie', show.direction)}
      </table>
      <h2>Scènes</h2>
      ${show.scenes.map((sc, i) => {
        const items = sc.items.filter(it => techById(it.tech));
        return `
        <section class="doc-scene">
          <h3>${i + 1}. ${esc(pairText(show, sc.pair))}${sc.title ? ` · ${esc(sc.title)}` : ''}</h3>
          ${items.length ? `<ol>${items.map(it => {
            const t = techById(it.tech);
            return `<li><b>${esc(t.name)}</b> <span class="doc-muted">(${esc(sportById(t.sport).name)}, ${esc(dirById(t.dir).name.toLowerCase())}, ${esc(levelById(t.level).name.toLowerCase())})</span><br>
              ${esc(memberName(show, sc.pair[it.thrower]))} werpt, ${esc(memberName(show, sc.pair[1 - it.thrower]))} valt${it.note ? ` · ${esc(it.note)}` : ''}
              ${t.video ? `<br><span class="doc-link">${esc(t.video)}</span>` : ''}</li>`;
          }).join('')}</ol>` : ''}
          ${sc.note ? `<p><b>Regie:</b> ${esc(sc.note)}</p>` : ''}
        </section>`;
      }).join('')}
      <h2>Toetscheck</h2>
      <ul class="doc-checks">
        <li>Duo’s met twee technieken: ${a.totals.pairs.join('/')}</li>
        <li>Sportprofielen: ${a.totals.sports.join('/')}${a.sports.some(x => !x.ok) ? ` (ontbreekt: ${esc(a.sports.filter(x => !x.ok).map(x => x.s.name).join(', '))})` : ''}</li>
        ${a.roles.map(x => {
          const miss = Object.entries(x.r).filter(([, v]) => !v).map(([k]) => roleWords[k]);
          return `<li>${esc(memberName(show, x.m))}: ${miss.length ? `nog niet: ${miss.join(', ')}` : 'laat alles zien'}</li>`;
        }).join('')}
        <li>Showelementen: ${a.totals.elements.join('/')}</li>
      </ul>
      <p class="doc-muted">Gemaakt op ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </article>`;
  document.getElementById('print-root').innerHTML = html;
  document.querySelectorAll('dialog[open]').forEach(dl => dl.close());
  setTimeout(() => window.print(), 50);
}

// ---------- Acties ----------

const withShow = fn => (el, e) => {
  const show = activeShow();
  if (show) fn(show, el, e);
};
const withScene = fn => withShow((show, el, e) => {
  const sc = findScene(show, el.dataset.scene);
  if (sc) fn(show, sc, el, e);
});
const move = (list, idx, dir) => {
  const to = idx + dir;
  if (idx < 0 || to < 0 || to >= list.length) return;
  [list[idx], list[to]] = [list[to], list[idx]];
};

Object.assign(actions, {
  noop: () => {},

  'show-new': async () => {
    const name = state.shows.length ? await promptDialog('Nieuwe show', { value: 'Mijn show', ok: 'Maken' }) : 'Mijn show';
    if (!name) return;
    const show = newShow(name);
    ui.absent = null;
    ui.setupOpen = null;
    update(st => { st.shows.push(show); st.activeShow = show.id; });
    document.querySelectorAll('dialog[open]').forEach(dl => dl.close());
    requestAnimationFrame(() => document.querySelector('[data-input="member"]')?.focus());
  },

  'show-import': () => pickFile(),

  'show-menu': withShow(show => {
    const d = openDialog({
      title: show.name,
      className: 'dlg-small',
      body: `<div class="menu">
        <button type="button" data-action="show-rename">${icon('edit')} Naam wijzigen</button>
        <button type="button" data-action="show-duplicate">${icon('copy')} Kopie maken</button>
        <button type="button" data-action="show-new">${icon('plus')} Nieuwe show</button>
        <button type="button" data-action="show-import">${icon('upload')} Show importeren</button>
        <button type="button" data-action="show-print">${icon('print')} Draaiboek of PDF</button>
        <button type="button" class="danger" data-action="show-delete">${icon('trash')} Show verwijderen</button>
      </div>`,
    });
    d.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => {
      if (!['show-import'].includes(b.dataset.action)) d.close();
    }));
  }),

  'show-rename': withShow(async show => {
    const name = await promptDialog('Naam van de show', { value: show.name });
    if (name) update(() => { show.name = name; touch(show); });
  }),

  'show-duplicate': withShow(show => {
    const copy = JSON.parse(JSON.stringify(show));
    copy.id = uid();
    copy.name = `${show.name} (kopie)`;
    copy.scenes.forEach(sc => { sc.id = uid(); sc.items.forEach(it => { it.id = uid(); }); });
    touch(copy);
    update(st => { st.shows.push(copy); st.activeShow = copy.id; });
    toast('Kopie gemaakt');
  }),

  'show-delete': withShow(async show => {
    const ok = await confirmDialog(`“${show.name}” wordt van dit apparaat verwijderd. Dit kun je niet ongedaan maken.`, { title: 'Show verwijderen?' });
    if (!ok) return;
    ui.absent = null;
    update(st => {
      st.shows = st.shows.filter(s => s.id !== show.id);
      st.activeShow = st.shows[0] ? st.shows[0].id : null;
    });
    toast('Show verwijderd');
  }),

  'show-print': withShow(show => printShow(show)),

  'show-export': withShow(show => {
    download(`${slug(show.name)}.json`, JSON.stringify(packShow(show), null, 2));
    toast('Bestand gedownload');
  }),

  'share-open': withShow(show => openShare(show)),

  'share-copy': withShow(async show => {
    const ok = await copyText(await shareUrl(show));
    toast(ok ? 'Link gekopieerd. Plak hem in je groepsapp.' : 'Kopiëren lukte niet');
  }),

  'share-native': withShow(async show => {
    try {
      await navigator.share({ title: show.name, text: `Onze show “${show.name}” in de Val & Werp Coach`, url: await shareUrl(show) });
    } catch (e) {
      if (e && e.name !== 'AbortError') toast('Delen lukte niet. Kopieer de link.');
    }
  }),

  rehearse: withShow(show => openRehearsal(show)),

  'checks-open': withShow(() => {
    openDialog({ title: 'Toetscheck', body: '<div data-part="checks"></div>' });
    refreshParts();
  }),

  absent: el => {
    ui.absent = el.dataset.i === '' ? null : Number(el.dataset.i);
    update(() => {});
  },

  'scene-add': withShow(show => {
    const d = openDialog({
      title: 'Scène toevoegen',
      className: 'dlg-small',
      body: `<div class="menu">
        ${PAIRS.map((p, i) => `<button type="button" data-pair="${i}">${icon('users')} ${pairLabel(show, p)}</button>`).join('')}
        <button type="button" data-pair="group">${icon('users')} Hele groep <small>opening, overgang of slot</small></button>
      </div>`,
    });
    d.querySelectorAll('[data-pair]').forEach(b => b.addEventListener('click', () => {
      const pair = b.dataset.pair === 'group' ? null : [...PAIRS[Number(b.dataset.pair)]];
      const sc = { id: uid(), pair, title: '', note: '', items: [] };
      update(() => { show.scenes.push(sc); touch(show); });
      d.close();
      requestAnimationFrame(() => document.getElementById(`scene-${sc.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }));
  }),

  'scene-move': withScene((show, sc, el) => {
    update(() => { move(show.scenes, show.scenes.indexOf(sc), Number(el.dataset.dir)); touch(show); });
  }),

  'scene-remove': withScene(async (show, sc) => {
    if (sc.items.length || sc.note || sc.title) {
      const ok = await confirmDialog(`Scène “${pairText(show, sc.pair)}” met ${sc.items.length} ${sc.items.length === 1 ? 'techniek' : 'technieken'} wordt verwijderd.`, { title: 'Scène verwijderen?' });
      if (!ok) return;
    }
    update(() => { show.scenes = show.scenes.filter(s => s !== sc); touch(show); });
  }),

  'pick-open': withScene((show, sc) => openPicker(show, sc)),

  pick: withScene((show, sc, el) => {
    addItem(show, sc, el.dataset.id);
    toast(`${techById(el.dataset.id).name} toegevoegd`);
  }),

  'item-swap': withScene((show, sc, el) => {
    const it = sc.items.find(x => x.id === el.dataset.item);
    if (it) update(() => { it.thrower = 1 - it.thrower; touch(show); });
  }),

  'item-move': withScene((show, sc, el) => {
    update(() => { move(sc.items, sc.items.findIndex(x => x.id === el.dataset.item), Number(el.dataset.dir)); touch(show); });
  }),

  'item-remove': withScene((show, sc, el) => {
    update(() => { sc.items = sc.items.filter(x => x.id !== el.dataset.item); touch(show); });
  }),

  // Vanuit de bibliotheek: kies in welke scène de techniek komt
  'tech-to-choreo': el => {
    const id = el.dataset.id;
    let show = activeShow();
    if (!show) {
      show = newShow('Mijn show');
      update(st => { st.shows.push(show); st.activeShow = show.id; });
    }
    const duos = show.scenes.filter(sc => sc.pair);
    const t = techById(id);
    const d = openDialog({
      title: `${t.name} toevoegen`,
      className: 'dlg-small',
      body: duos.length
        ? `<p class="muted">Aan welke scène van “${esc(show.name)}”?</p>
           <div class="menu">${duos.map(sc => `
             <button type="button" data-scene-pick="${sc.id}">
               <span class="scene-num sm">${show.scenes.indexOf(sc) + 1}</span>${pairLabel(show, sc.pair)}
               <small>${sc.items.length} ${sc.items.length === 1 ? 'techniek' : 'technieken'}</small>
             </button>`).join('')}</div>`
        : '<p class="muted">Deze show heeft nog geen duo-scènes.</p>',
    });
    d.querySelectorAll('[data-scene-pick]').forEach(b => b.addEventListener('click', () => {
      const sc = findScene(show, b.dataset.scenePick);
      addItem(show, sc, id);
      d.close();
      toast(`Toegevoegd aan scène ${show.scenes.indexOf(sc) + 1}`);
    }));
  },
});

// ---------- Invoer ----------

Object.assign(inputs, {
  member: el => {
    const show = activeShow();
    const i = Number(el.dataset.i);
    show.members[i] = el.value.slice(0, 40);
    touch(show);
    save();
    document.querySelectorAll(`[data-member="${i}"]`).forEach(s => { s.textContent = memberName(show, i); });
    refreshParts();
  },
  'show-field': el => {
    const show = activeShow();
    show[el.dataset.key] = el.value.slice(0, el.dataset.key === 'direction' ? 2000 : 200);
    touch(show);
    save();
    refreshParts();
  },
  'show-switch': el => {
    ui.absent = null;
    ui.setupOpen = null;
    update(st => { st.activeShow = el.value; });
  },
  'scene-title': el => sceneField(el, 'title', 120),
  'scene-note': el => { sceneField(el, 'note', 2000); autoGrow(el); },
  'item-note': el => {
    const show = activeShow();
    const sc = show && findScene(show, el.dataset.scene);
    const it = sc && sc.items.find(x => x.id === el.dataset.item);
    if (!it) return;
    it.note = el.value.slice(0, 500);
    touch(show);
    save();
  },
});

function sceneField(el, key, max) {
  const show = activeShow();
  const sc = show && findScene(show, el.dataset.scene);
  if (!sc) return;
  sc[key] = el.value.slice(0, max);
  touch(show);
  save();
}

export function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}

// Open/dicht van de groepskaart onthouden tijdens het werken
document.addEventListener('toggle', e => {
  if (e.target.matches && e.target.matches('details[data-setup]')) ui.setupOpen = e.target.open;
}, true);

// Na het afdrukken het draaiboek weer opruimen
addEventListener('afterprint', () => { document.getElementById('print-root').innerHTML = ''; });
