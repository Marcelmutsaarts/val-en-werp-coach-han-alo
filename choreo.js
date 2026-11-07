// Mijn show: viertal, zes duo's, technieken met rollen, toetscheck, uitvalcheck, oefenmodus en delen.
import { SPORTS } from './data.js';
import {
  state, update, save, rerender, PAIRS, uid, newShow, activeShow, memberName, techById, sportById, levelById, dirById,
  packShow, importPacked, encodeShare, decodeShare, shareCodeFrom,
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
      const hoog = (t.height || t.level) === 'hoog';
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

const mark = ok => `<span class="mk ${ok ? 'ok' : ''}">${ok ? icon('check') : ''}<span class="sr">${ok ? 'in orde' : 'nog niet'}</span></span>`;
const frac = ([a, b]) => `<b class="frac ${a === b ? 'done' : ''}">${a}/${b}</b>`;
const ROLE_WORDS = { valLaag: 'laag vallen', valHoog: 'hoog vallen', werpLaag: 'laag werpen', werpHoog: 'hoog werpen' };

function checksBody(show) {
  const a = analyze(show);
  const all = Object.values(a.totals).every(([x, y]) => x === y);
  const roleCols = [['valLaag', 'Valt laag'], ['valHoog', 'Valt hoog'], ['werpLaag', 'Werpt laag'], ['werpHoog', 'Werpt hoog']];
  let uitval = '';
  if (ui.absent != null) {
    const b = analyze(show, ui.absent);
    const missing = b.sports.filter(x => !x.ok).map(x => x.s.name);
    const left = show.scenes.length - b.dropped.length;
    const gaps = b.roles.map(x => ({ m: x.m, miss: Object.keys(ROLE_WORDS).filter(k => !x.r[k]) })).filter(x => x.miss.length);
    uitval = `<div class="uitval-result">
      <p>Zonder <b>${esc(memberName(show, ui.absent))}</b> vallen ${b.dropped.length} scènes weg en blijven er ${left} over.
      ${missing.length ? `Dan ontbreekt: <b>${esc(missing.join(', '))}</b>.` : 'Alle sportprofielen zitten er dan nog in.'}</p>
      ${gaps.length ? `<ul>${gaps.map(x => `<li><b>${esc(memberName(show, x.m))}</b> laat dan niet meer zien: ${x.miss.map(k => ROLE_WORDS[k]).join(', ')}</li>`).join('')}</ul>` : '<p>Iedereen laat dan nog steeds laag en hoog vallen en werpen zien.</p>'}
    </div>`;
  }
  return `
    ${all ? `<p class="all-good">${icon('check')} Alles in orde. Tijd om te oefenen!</p>` : ''}
    <section class="check-group">
      <h3>Elk duo twee technieken ${frac(a.totals.pairs)}</h3>
      <ul class="check-list">${a.pairs.map(x => `<li>${mark(x.ok)}<span>${pairLabel(show, x.p)}</span><small>${x.n}</small></li>`).join('')}</ul>
    </section>
    <section class="check-group">
      <h3>Alle sportprofielen ${frac(a.totals.sports)}</h3>
      <ul class="sport-marks">${a.sports.map(x => `<li class="${x.ok ? 'ok' : ''}">${x.ok ? icon('check') : ''}${esc(x.s.name)}<span class="sr">${x.ok ? ', zit erin' : ', ontbreekt nog'}</span></li>`).join('')}</ul>
    </section>
    <section class="check-group">
      <h3>Ieder laat alles zien ${frac(a.totals.roles)}</h3>
      <table class="role-grid">
        <thead><tr><th></th>${roleCols.map(([, l]) => `<th scope="col">${l}</th>`).join('')}</tr></thead>
        <tbody>${a.roles.map(x => `<tr><th scope="row">${who(show, x.m)}</th>${roleCols.map(([k]) => `<td>${mark(x.r[k])}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      <p class="hint">Bij uitdagende technieken telt de valhoogte van die techniek: een suplex is hoog, een roll of sweep vanaf de grond laag.</p>
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
    <p class="muted">Kreeg je een link van een groepsgenoot? Open de link, of kopieer hem en kies Show importeren › Link plakken. Dat laatste werkt ook als je de app vanaf je beginscherm gebruikt.</p>
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
        <button type="button" class="icon-btn sm" data-action="item-swap" data-scene="${esc(sc.id)}" data-item="${esc(it.id)}" aria-label="Wissel wie werpt en wie valt">${icon('swap')}</button>
        <span class="role"><small>valt</small>${who(show, fal)}</span>
      </div>
      <input type="text" class="item-note" maxlength="500" placeholder="Aanwijzing, bijvoorbeeld: op de drumroffel" value="${esc(it.note)}" data-input="item-note" data-scene="${esc(sc.id)}" data-item="${esc(it.id)}" aria-label="Aanwijzing bij ${esc(t.name)}">
    </div>
    <div class="item-tools">
      <button type="button" class="icon-btn sm" data-action="item-move" data-dir="-1" data-scene="${esc(sc.id)}" data-item="${esc(it.id)}" aria-label="Omhoog" ${j === 0 ? 'disabled' : ''}>${icon('up')}</button>
      <button type="button" class="icon-btn sm" data-action="item-move" data-dir="1" data-scene="${esc(sc.id)}" data-item="${esc(it.id)}" aria-label="Omlaag" ${j === sc.items.length - 1 ? 'disabled' : ''}>${icon('down')}</button>
      <button type="button" class="icon-btn sm" data-action="item-remove" data-scene="${esc(sc.id)}" data-item="${esc(it.id)}" aria-label="Verwijder ${esc(t.name)}">${icon('x')}</button>
    </div>
  </li>`;
}

// Unieke technieken per duo, over alle scènes van dat duo samen (zoals de toetscheck telt)
function duoTotals(show) {
  const map = {};
  for (const sc of show.scenes) {
    if (!sc.pair) continue;
    const k = pairKey(sc.pair);
    map[k] = map[k] || { techs: new Set(), scenes: 0 };
    map[k].scenes++;
    sc.items.forEach(it => { if (techById(it.tech)) map[k].techs.add(it.tech); });
  }
  return map;
}

function sceneCard(show, sc, i, duos) {
  const items = sc.items.filter(it => techById(it.tech));
  const duo = sc.pair ? duos[pairKey(sc.pair)] : null;
  const distinct = duo ? duo.techs.size : 0;
  const prefix = duo && duo.scenes > 1 ? 'duo: ' : '';
  const status = !sc.pair ? '' : distinct >= 2
    ? `<span class="status ok">${icon('check')} ${prefix}${distinct} technieken</span>`
    : `<span class="status">${prefix}nog ${2 - distinct} ${2 - distinct === 1 ? 'techniek' : 'technieken'}</span>`;
  const last = show.scenes.length - 1;
  return `
  <li class="scene ${isOut(sc) ? 'out' : ''} ${sc.pair ? '' : 'group'}" id="scene-${esc(sc.id)}">
    <header class="scene-head">
      <span class="scene-num">${i + 1}</span>
      <div class="scene-who">
        <b>${pairLabel(show, sc.pair)}</b>
        ${isOut(sc) ? '<span class="tag tag-accent">valt weg</span>' : status}
      </div>
      <div class="scene-tools">
        <button type="button" class="icon-btn sm" data-action="scene-move" data-dir="-1" data-scene="${esc(sc.id)}" aria-label="Scène omhoog" ${i === 0 ? 'disabled' : ''}>${icon('up')}</button>
        <button type="button" class="icon-btn sm" data-action="scene-move" data-dir="1" data-scene="${esc(sc.id)}" aria-label="Scène omlaag" ${i === last ? 'disabled' : ''}>${icon('down')}</button>
        <button type="button" class="icon-btn sm" data-action="scene-remove" data-scene="${esc(sc.id)}" aria-label="Verwijder scène">${icon('trash')}</button>
      </div>
    </header>
    <input type="text" class="scene-title" maxlength="120" placeholder="${sc.pair ? 'Moment in het verhaal (optioneel)' : 'Bijvoorbeeld: opening of slot'}" value="${esc(sc.title)}" data-input="scene-title" data-scene="${esc(sc.id)}" aria-label="Titel van scène ${i + 1}">
    ${sc.pair ? `
      ${items.length ? `<ol class="items">${items.map((it, j) => itemRow(show, { ...sc, items }, it, j)).join('')}</ol>` : ''}
      <button type="button" class="btn btn-ghost btn-add" data-action="pick-open" data-scene="${esc(sc.id)}">${icon('plus')} Techniek kiezen</button>` : ''}
    <textarea class="scene-note" rows="1" maxlength="2000" placeholder="${sc.pair ? 'Regie: opkomst, overgang, muziekmoment' : 'Wat gebeurt er? Wie staat waar?'}" data-input="scene-note" data-scene="${esc(sc.id)}" aria-label="Regie bij scène ${i + 1}">${esc(sc.note)}</textarea>
  </li>`;
}

export function viewChoreo() {
  const show = activeShow();
  if (!show) return emptyView();
  if (state.activeShow !== show.id) state.activeShow = show.id;
  if (ui.absent != null && ui.absent > 3) ui.absent = null;
  const switcher = state.shows.length > 1
    ? `<label class="show-switch"><span class="sr">Kies een show</span>
        <select data-input="show-switch">${state.shows.map(s => `<option value="${esc(s.id)}" ${s.id === show.id ? 'selected' : ''}>${esc(s.name)} · ${new Date(s.updated).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</option>`).join('')}</select>
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
        <ol class="scenes">${(duos => show.scenes.map((sc, i) => sceneCard(show, sc, i, duos)).join(''))(duoTotals(show))}</ol>
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
      <div data-part="techlist" data-scope="pick" data-scene="${esc(sc.id)}">${parts.techlist({ scope: 'pick', scene: sc.id })}</div>`,
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

  // De kaart noemt het duo en het moment; het scènenummer staat bovenin (één nummering)
  const stepCard = st => {
    if (!st.it) {
      return `<p class="rh-scene">${esc(pairText(show, st.sc.pair))}</p>
        <h2 class="rh-tech">${esc(st.sc.title || (st.sc.pair ? 'Nog geen technieken' : 'Groepsmoment'))}</h2>
        ${st.sc.note ? `<p class="rh-regie">${esc(st.sc.note)}</p>` : ''}`;
    }
    const t = techById(st.it.tech);
    const thr = memberName(show, st.sc.pair[st.it.thrower]);
    const fal = memberName(show, st.sc.pair[1 - st.it.thrower]);
    return `
      <p class="rh-scene">${esc(pairText(show, st.sc.pair))}${st.sc.title ? ` · ${esc(st.sc.title)}` : ''} <span>· techniek ${st.ii + 1}/${st.of}</span></p>
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

  const spoken = st => {
    if (!st.it) return `Scène ${st.si + 1}, ${pairText(show, st.sc.pair)}`;
    const t = techById(st.it.tech);
    return `Scène ${st.si + 1}, ${t.name}, ${memberName(show, st.sc.pair[st.it.thrower])} werpt, ${memberName(show, st.sc.pair[1 - st.it.thrower])} valt`;
  };

  // Vaste opbouw: alleen de inhoud wisselt, de knoppen blijven staan (en houden de focus).
  root.innerHTML = `
    <div class="rh-top">
      <span data-rh-count></span>
      <span class="rh-clock">
        <span data-clock>00:00</span>
        <button type="button" class="icon-btn" data-rh-pause aria-label="Pauzeer de tijd">${icon('pause')}</button>
      </span>
    </div>
    <div class="rh-progress"><span data-rh-bar></span></div>
    <div class="rh-card" data-rh-card></div>
    <p class="rh-next" data-rh-nextline></p>
    <div class="rh-nav">
      <button type="button" class="btn btn-lg" data-rh-prev>${icon('left')} Vorige</button>
      <button type="button" class="btn btn-lg btn-primary" data-rh-next></button>
    </div>
    <p class="sr" aria-live="polite" data-rh-live></p>`;
  const $ = sel => root.querySelector(sel);

  const paint = () => {
    const done = pos >= steps.length;
    root.classList.toggle('is-done', done);
    if (done) {
      pausedAt = pausedAt || Date.now();
      $('[data-rh-count]').textContent = 'Doorloop klaar';
      $('[data-rh-bar]').style.width = '100%';
      $('[data-rh-card]').innerHTML = `
        <div class="rh-done">
          <p class="eyebrow">Doorlooptijd</p>
          <p class="rh-tech">${clock(elapsed())}</p>
          <p class="muted">${sceneCount} scènes, ${steps.filter(s => s.it).length} technieken${ui.absent != null ? `, zonder ${esc(memberName(show, ui.absent))}` : ''}.</p>
          <div class="row center">
            <button type="button" class="btn" data-rh-restart>${icon('reset')} Opnieuw</button>
            <button type="button" class="btn btn-primary" data-dlg-close>Sluiten</button>
          </div>
        </div>`;
      $('[data-rh-nextline]').innerHTML = '';
      $('[data-rh-live]').textContent = `Doorloop klaar in ${clock(elapsed())}`;
    } else {
      const st = steps[pos];
      const sceneIndex = new Set(steps.slice(0, pos + 1).map(s => s.si)).size;
      $('[data-rh-count]').textContent = `Scène ${sceneIndex} van ${sceneCount}${ui.absent != null ? ` · zonder ${memberName(show, ui.absent)}` : ''}`;
      $('[data-rh-bar]').style.width = `${((pos + 1) / steps.length) * 100}%`;
      $('[data-rh-card]').innerHTML = stepCard(st);
      $('[data-rh-card]').scrollTop = 0;
      $('[data-rh-nextline]').innerHTML = `<small>Hierna</small>${esc(nextLabel(steps[pos + 1]))}`;
      $('[data-rh-live]').textContent = spoken(st);
    }
    $('[data-rh-prev]').disabled = pos === 0;
    const next = $('[data-rh-next]');
    next.hidden = done;
    next.innerHTML = `${pos >= steps.length - 1 ? 'Afronden' : 'Volgende'} ${icon('right')}`;
    const pause = $('[data-rh-pause]');
    pause.innerHTML = icon(pausedAt ? 'play' : 'pause');
    pause.setAttribute('aria-label', pausedAt ? 'Start de tijd' : 'Pauzeer de tijd');
    $('[data-clock]').textContent = clock(elapsed());
    if (done) $('[data-rh-restart]').focus();
    else if (!root.contains(document.activeElement) || document.activeElement.disabled) next.focus({ preventScroll: true });
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
  // Op document, zodat pijltjes en een presentatieclicker blijven werken waar de focus ook staat
  const onKey = e => {
    if (!d.open || document.querySelector('dialog.dlg-video')) return;
    // Spatie of Enter op een knop of link doet wat die knop doet
    if ((e.key === ' ' || e.key === 'Enter') && e.target.closest('button, a, input, textarea, select')) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  };
  document.addEventListener('keydown', onKey);

  // Vegen: horizontaal naar de volgende of vorige stap (touch-action: pan-y in de CSS)
  let sx = null;
  let sy = null;
  root.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  root.addEventListener('pointercancel', () => { sx = null; });
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
    document.removeEventListener('keydown', onKey);
    if (lock) lock.release().catch(() => {});
  });
  paint();
}

// ---------- Delen, bestand en draaiboek ----------

// De deel-link wordt vooraf gemaakt, zodat kopiëren en delen direct bij de tik gebeuren (vereist op iPhone).
let readyUrl = '';

async function openShare(show) {
  readyUrl = await shareUrl(show);
  openDialog({
    title: 'Delen en bewaren',
    body: `
      <section class="share-block">
        <h3>${icon('link')} Deel met je groep</h3>
        <p class="muted">Je groepsgenoten openen de link en krijgen een eigen kopie van deze show. Gebruiken ze de app vanaf hun beginscherm? Dan kopiëren ze de link en kiezen ze Show importeren › Link plakken.</p>
        <div class="row">
          ${navigator.share ? `<button type="button" class="btn btn-primary" data-action="share-native">${icon('share')} Deel link</button>` : ''}
          <button type="button" class="btn ${navigator.share ? '' : 'btn-primary'}" data-action="share-copy">${icon('copy')} Kopieer link</button>
        </div>
        <label class="field share-url"><span class="sr">Deel-link</span>
          <input type="text" readonly value="${esc(readyUrl)}" data-share-url aria-label="Deel-link">
        </label>
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

// Kopiëren zonder await vooraf, zodat de browser het als directe actie van de student ziet.
function copyText(text) {
  const fallback = () => {
    // Het tekstvak moet in het open venster staan; alles daarbuiten is tijdelijk niet bruikbaar
    const host = [...document.querySelectorAll('dialog[open]')].pop() || document.body;
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    host.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* niet ondersteund */ }
    ta.remove();
    return ok;
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true, fallback);
  }
  return Promise.resolve(fallback());
}

const importedMessage = ({ show, dropped }) =>
  `“${show.name}” is geïmporteerd${dropped ? `. ${dropped} ${dropped === 1 ? 'techniek kon' : 'technieken konden'} niet worden overgenomen` : ''}`;

function afterImport(result) {
  document.querySelectorAll('dialog[open]').forEach(dl => dl.close());
  if (location.hash !== '#choreo') location.hash = '#choreo';
  toast(importedMessage(result));
}

function pickFile() {
  const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json,application/json' });
  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      afterImport(importPacked(JSON.parse(await file.text())));
    } catch (e) {
      toast(e.message && e.message.startsWith('Dit is') ? e.message : 'Dit bestand kan niet worden geopend.');
    }
  });
  input.click();
}

function openImport() {
  const d = openDialog({
    title: 'Show importeren',
    className: 'dlg-small',
    body: `
      <form class="stack" data-paste-form>
        <label class="field"><span>Plak een deel-link</span>
          <input type="text" inputmode="url" autocomplete="off" placeholder="https://…#deel=…" data-paste>
        </label>
        <button type="submit" class="btn btn-primary">${icon('link')} Link importeren</button>
      </form>
      <p class="or"><span>of</span></p>
      <button type="button" class="btn btn-block" data-file>${icon('upload')} Kies een bestand (.json)</button>`,
  });
  const input = d.querySelector('[data-paste]');
  d.querySelector('[data-file]').addEventListener('click', pickFile);
  d.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    const code = shareCodeFrom(input.value);
    if (!code) { toast('Dit lijkt geen deel-link. Kopieer de hele link opnieuw.'); input.focus(); return; }
    try {
      afterImport(importPacked(await decodeShare(code)));
    } catch {
      toast('Deze link werkt niet. Vraag je groepsgenoot om een nieuwe.');
    }
  });
  input.focus();
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
        const items = sc.pair ? sc.items.filter(it => techById(it.tech)) : [];
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
  document.body.classList.add('printing');
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

  'show-import': () => {
    document.querySelectorAll('dialog[open]').forEach(dl => dl.close());
    openImport();
  },

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
    d.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => d.close()));
  }),

  'show-rename': withShow(async show => {
    const name = await promptDialog('Naam van de show', { value: show.name });
    if (name) update(() => { show.name = name; touch(show); });
  }),

  'show-duplicate': withShow(show => {
    const copy = JSON.parse(JSON.stringify(show));
    copy.id = uid();
    const names = new Set(state.shows.map(s => s.name));
    let n = 1;
    do { copy.name = `${show.name} (kopie${n > 1 ? ` ${n}` : ''})`; n++; } while (names.has(copy.name));
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

  'share-copy': async () => {
    const ok = await copyText(readyUrl);
    if (ok) toast('Link gekopieerd. Plak hem in je groepsapp.');
    else {
      // Laatste redmiddel: de link selecteren zodat de student hem zelf kan kopiëren
      const field = document.querySelector('[data-share-url]');
      if (field) { field.focus(); field.select(); }
      toast('Kopiëren lukte niet automatisch. De link is geselecteerd: kopieer hem zelf.');
    }
  },

  'share-native': withShow(show => {
    navigator.share({ title: show.name, text: `Onze show “${show.name}” in de Val & Werp Coach`, url: readyUrl })
      .catch(e => { if (e && e.name !== 'AbortError') toast('Delen lukte niet. Kopieer de link.'); });
  }),

  rehearse: withShow(show => openRehearsal(show)),

  'checks-open': withShow(() => {
    openDialog({ title: 'Toetscheck', body: '<div data-part="checks"></div>' });
    refreshParts();
  }),

  // Een weergavekeuze: niet opslaan, alleen opnieuw tekenen
  absent: el => {
    ui.absent = el.dataset.i === '' ? null : Number(el.dataset.i);
    rerender();
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
    const index = sc.items.findIndex(x => x.id === el.dataset.item);
    if (index < 0) return;
    const [removed] = sc.items.slice(index, index + 1);
    const t = techById(removed.tech);
    update(() => { sc.items.splice(index, 1); touch(show); });
    toast(`${t ? t.name : 'Techniek'} verwijderd`, {
      action: 'Ongedaan maken',
      onAction: () => update(() => { sc.items.splice(Math.min(index, sc.items.length), 0, removed); touch(show); }),
    });
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
             <button type="button" data-scene-pick="${esc(sc.id)}">
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
addEventListener('afterprint', () => {
  document.getElementById('print-root').innerHTML = '';
  document.body.classList.remove('printing');
});
