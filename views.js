// Tabbladen Toets, Valbreken, Sporten en Technieken, plus de gedeelde techniekenlijst met filters.
import { TOETS, FASES, VALBREKEN, SPORTS, SPORTEN, TECHNIEKEN, LEVELS, DIRECTIONS } from './data.js';
import { state, update, save, allTechniques, techById, sportById, levelById, dirById, sanitizeTechnique, uid } from './store.js';
import { esc, icon, actions, inputs, parts, refreshParts, openDialog, confirmDialog, openVideo, toast, levelBars } from './ui.js';

const pageHead = (eyebrow, title, lead) => `
  <header class="page-head">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1>${esc(title)}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
  </header>`;

// ---------- Toets ----------

export function viewToets() {
  const pairs = ['A + B', 'C + D', 'A + C', 'B + D', 'A + D', 'B + C'];
  return `
  <section class="page">
    <header class="hero">
      <p class="eyebrow on-dark">Toets · week 7</p>
      <h1>${esc(TOETS.title)}</h1>
      <p class="lead">${esc(TOETS.intro)}</p>
      <ul class="facts">
        <li><b>4</b><span>studenten per groep</span></li>
        <li><b>6</b><span>duo’s per groep</span></li>
        <li><b>2</b><span>technieken per duo</span></li>
        <li><b>6</b><span>sportprofielen in de show</span></li>
      </ul>
      <a class="btn btn-primary" href="#choreo">Werk aan je show ${icon('arrow')}</a>
    </header>

    <div class="grid cols-2">
      <article class="card">
        <h2>Uitvoering</h2>
        <p>${esc(TOETS.uitvoering)}</p>
        <div class="pairs-demo">
          ${pairs.map(p => `<span>${p}</span>`).join('')}
        </div>
        <h3>De uitvoering bevat</h3>
        <ul class="checks">${TOETS.bevat.map(b => `<li>${icon('check')}<span>${esc(b)}</span></li>`).join('')}</ul>
        <h3>Je laat zien</h3>
        <ul class="dots">${TOETS.laatZien.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        <p class="callout">${icon('users')}<span><b>Als iemand uitvalt.</b> ${esc(TOETS.uitval)}</span></p>
      </article>

      <article class="card">
        <h2>Leertaken</h2>
        <h3>Summatief <span class="pill">telt voor je cijfer</span></h3>
        <dl class="defs">${TOETS.summatief.map(x => `<div><dt>${esc(x.t)}</dt><dd>${esc(x.d)}</dd></div>`).join('')}</dl>
        <h3>Formatief <span class="pill pill-soft">om aan te werken</span></h3>
        <dl class="defs">${TOETS.formatief.map(x => `<div><dt>${esc(x.t)}</dt><dd>${esc(x.d)}</dd></div>`).join('')}</dl>
      </article>
    </div>

    <article class="card">
      <h2>Ontwikkelingsfases</h2>
      <p class="muted">Zo groei je in een vaardigheid, van eerste poging tot automatisme.</p>
      <ol class="scale">
        ${FASES.map((f, i) => `
          <li style="--step:${i + 1}">
            <div class="scale-bar"><span></span></div>
            <p class="scale-name"><b>${i + 1}. ${esc(f.name)}</b> <span>${esc(f.grade)}</span></p>
            <p class="scale-text">${esc(f.text)}</p>
          </li>`).join('')}
      </ol>
    </article>

    <article class="card">
      <h2>Attitude</h2>
      <p>${esc(TOETS.attitude)}</p>
    </article>
  </section>`;
}

// ---------- Valbreken ----------

export function viewValbreken() {
  const n = VALBREKEN.weeks.length;
  return `
  <section class="page">
    ${pageHead(`Leerlijn · ${n} weken`, 'Valbreken', VALBREKEN.intro)}
    <div class="grid cols-wide">
      <article class="card">
        <h2>Weekplanning</h2>
        <ol class="timeline">
          ${VALBREKEN.weeks.map((w, i) => `
            <li class="${i === n - 1 ? 'is-final' : ''}">
              <span class="wk" aria-hidden="true">${i + 1}</span>
              <div>
                <p class="wk-label">Week ${i + 1} <span class="tag ${w.tag === 'Toets' ? 'tag-accent' : ''}">${esc(w.tag)}</span></p>
                <h3>${esc(w.title)}</h3>
                <p>${esc(w.text)}</p>
              </div>
            </li>`).join('')}
        </ol>
        <p class="callout">${icon('info')}<span><b>Tip.</b> ${esc(VALBREKEN.tip)}</span></p>
      </article>

      <div class="stack">
        <article class="card card-accent">
          <h2>Veilig vallen</h2>
          <ul class="checks">${VALBREKEN.safety.map(s => `<li>${icon('check')}<span>${esc(s)}</span></li>`).join('')}</ul>
        </article>
        <article class="card">
          <h2>Inspiratievideo’s</h2>
          <ul class="video-list">
            ${VALBREKEN.videos.map(v => `
              <li><button type="button" data-action="video" data-url="${esc(v.url)}" data-title="${esc(v.title)}">
                <span class="play">${icon('play')}</span>${esc(v.title)}
              </button></li>`).join('')}
          </ul>
        </article>
      </div>
    </div>

    <details class="card why">
      <summary><h2>Waarom valbreken belangrijk is in het onderwijs</h2>${icon('down', 'chev')}</summary>
      <p>${esc(VALBREKEN.why.intro)}</p>
      <div class="grid cols-2 tight">
        ${VALBREKEN.why.points.map((p, i) => `<div class="why-point"><span class="num">${i + 1}</span><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p></div>`).join('')}
      </div>
    </details>
  </section>`;
}

// ---------- Sporten ----------

export function viewSporten() {
  const all = allTechniques();
  return `
  <section class="page">
    ${pageHead('Zes sportprofielen', 'Sporten', SPORTEN.intro)}
    <div class="grid cols-2">
      ${SPORTS.map(s => {
        const count = all.filter(t => t.sport === s.id).length;
        const shared = s.sharesWeekWith ? sportById(s.sharesWeekWith) : null;
        return `
        <article class="card sport">
          <div class="sport-head">
            <h2>${esc(s.title)}</h2>
            ${shared ? `<span class="tag">Deelt een week met ${esc(shared.name.toLowerCase())}</span>` : ''}
          </div>
          <p class="clamp">${esc(s.text)}</p>
          <button type="button" class="link-btn" data-action="unclamp">Lees meer</button>
          <div class="row">
            <button type="button" class="btn" data-action="video" data-url="${esc(s.video)}" data-title="${esc(s.title)}">${icon('play')} Intro-video</button>
            <button type="button" class="btn btn-ghost" data-action="sport-techs" data-id="${s.id}">${count} technieken ${icon('arrow')}</button>
          </div>
        </article>`;
      }).join('')}
    </div>
    <p class="summary">${esc(SPORTEN.summary)}</p>
  </section>`;
}

// ---------- Technieken: filters en lijst (ook gebruikt in de kiezer van de choreo) ----------

export const filters = {
  lib: { q: '', sport: '', dir: '', level: '', saved: false },
  pick: { q: '', sport: '', dir: '', level: '', saved: false },
};

export function filterTechniques(f) {
  const q = f.q.trim().toLowerCase();
  return allTechniques()
    .filter(t =>
      (!f.sport || t.sport === f.sport) &&
      (!f.dir || t.dir === f.dir) &&
      (!f.level || t.level === f.level) &&
      (!f.saved || state.favorites.includes(t.id)) &&
      (!q || t.name.toLowerCase().includes(q) || sportById(t.sport).name.toLowerCase().includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name, 'nl'));
}

const chip = (scope, key, val, label, on) =>
  `<button type="button" class="chip ${on ? 'on' : ''}" aria-pressed="${on}" data-action="filter" data-scope="${scope}" data-key="${key}" data-val="${val}">${label}</button>`;

parts.filters = ({ scope }) => {
  const f = filters[scope];
  return `
    <div class="chips" role="group" aria-label="Sportprofiel">
      ${chip(scope, 'sport', '', 'Alle sporten', !f.sport)}
      ${SPORTS.map(s => chip(scope, 'sport', s.id, esc(s.name), f.sport === s.id)).join('')}
    </div>
    <div class="chips" role="group" aria-label="Valrichting, niveau en bewaard">
      ${chip(scope, 'saved', '1', `${icon('star')} Bewaard`, f.saved)}
      <span class="chip-sep" aria-hidden="true"></span>
      ${DIRECTIONS.map(d => chip(scope, 'dir', d.id, d.name, f.dir === d.id)).join('')}
      <span class="chip-sep" aria-hidden="true"></span>
      ${LEVELS.map(l => chip(scope, 'level', l.id, `${levelBars(l.id)} ${l.name}`, f.level === l.id)).join('')}
    </div>`;
};

export const searchBox = scope => `
  <label class="search">
    ${icon('search')}
    <input type="search" placeholder="Zoek een techniek of sport" value="${esc(filters[scope].q)}" data-input="filter-q" data-scope="${scope}" aria-label="Zoek een techniek">
  </label>`;

export const techMeta = t => {
  const s = sportById(t.sport);
  return `<span class="tag">${esc(s ? s.name : '')}</span>
    <span>${esc(dirById(t.dir).name)}</span>
    <span class="lvl">${levelBars(t.level)}${esc(levelById(t.level).name)}</span>
    ${t.custom ? '<span class="tag tag-line">Eigen</span>' : ''}`;
};

const activeCount = f => ['sport', 'dir', 'level'].filter(k => f[k]).length + (f.saved ? 1 : 0) + (f.q.trim() ? 1 : 0);

const resultLine = (scope, n) => `
  <p class="result-line">${n} ${n === 1 ? 'techniek' : 'technieken'}
    ${activeCount(filters[scope]) ? `<button type="button" class="link-btn" data-action="filter-reset" data-scope="${scope}">Wis filters</button>` : ''}</p>`;

let openTech = null;

parts.techlist = ({ scope, scene }) => {
  const list = filterTechniques(filters[scope]);
  if (scope === 'pick') return pickList(list, scene);
  if (!list.length) {
    return `${resultLine(scope, 0)}<div class="empty"><p>Geen technieken gevonden.</p>
      ${filters.lib.saved && !state.favorites.length ? '<p class="muted">Tik op de ster bij een techniek om hem te bewaren.</p>' : ''}</div>`;
  }
  return `${resultLine(scope, list.length)}<ul class="tech-list">${list.map(techRow).join('')}</ul>`;
};

function techRow(t) {
  const fav = state.favorites.includes(t.id);
  const note = state.techNotes[t.id] || '';
  const open = openTech === t.id;
  return `
  <li class="tech ${open ? 'open' : ''}">
    <div class="tech-top">
      <button type="button" class="tech-main" data-action="tech-open" data-id="${esc(t.id)}" aria-expanded="${open}">
        <span class="tech-name">${esc(t.name)}${note ? icon('note', 'has-note') : ''}</span>
        <span class="tech-meta">${techMeta(t)}</span>
      </button>
      ${t.video ? `<button type="button" class="icon-btn" data-action="video" data-url="${esc(t.video)}" data-title="${esc(t.name)}" aria-label="Video van ${esc(t.name)}">${icon('play')}</button>` : '<span class="icon-btn ghost" aria-hidden="true"></span>'}
      <button type="button" class="icon-btn star ${fav ? 'on' : ''}" data-action="fav" data-id="${esc(t.id)}" aria-pressed="${fav}" aria-label="${fav ? 'Niet meer bewaren' : 'Bewaren'}">${icon('star')}</button>
    </div>
    ${open ? `
    <div class="tech-more">
      <label class="field"><span>Mijn aantekening</span>
        <textarea rows="2" placeholder="Bijvoorbeeld: let op je grip, eerst op de knieën oefenen" data-input="tech-note" data-id="${esc(t.id)}">${esc(note)}</textarea>
      </label>
      <div class="row">
        <button type="button" class="btn btn-primary" data-action="tech-to-choreo" data-id="${esc(t.id)}">${icon('plus')} In mijn show</button>
        ${t.custom ? `
          <button type="button" class="btn btn-ghost" data-action="custom-edit" data-id="${esc(t.id)}">${icon('edit')} Wijzig</button>
          <button type="button" class="btn btn-ghost danger" data-action="custom-delete" data-id="${esc(t.id)}">${icon('trash')} Verwijder</button>` : ''}
      </div>
    </div>` : ''}
  </li>`;
}

// De kiezer in de choreo krijgt dezelfde lijst, maar met een toevoegknop per techniek.
let pickContext = { onPick: null, counts: {} };
export function setPickContext(ctx) { pickContext = ctx; }

function pickList(list, scene) {
  if (!list.length) return `${resultLine('pick', 0)}<div class="empty"><p>Geen technieken gevonden.</p></div>`;
  return `${resultLine('pick', list.length)}<ul class="tech-list pick">${list.map(t => {
    const n = pickContext.counts[t.id] || 0;
    const fav = state.favorites.includes(t.id);
    return `
    <li class="tech">
      <div class="tech-top">
        <button type="button" class="tech-main" data-action="pick" data-id="${esc(t.id)}" data-scene="${esc(scene)}">
          <span class="tech-name">${fav ? icon('star', 'fav-mark') : ''}${esc(t.name)}</span>
          <span class="tech-meta">${techMeta(t)}</span>
        </button>
        ${t.video ? `<button type="button" class="icon-btn" data-action="video" data-url="${esc(t.video)}" data-title="${esc(t.name)}" aria-label="Video van ${esc(t.name)}">${icon('play')}</button>` : ''}
        <button type="button" class="icon-btn add ${n ? 'on' : ''}" data-action="pick" data-id="${esc(t.id)}" data-scene="${esc(scene)}" aria-label="Voeg ${esc(t.name)} toe${n ? `, al ${n} keer gekozen` : ''}">${n ? `${icon('check')}<b>${n}</b>` : icon('plus')}</button>
      </div>
    </li>`;
  }).join('')}</ul>`;
}

export function viewTechnieken() {
  return `
  <section class="page">
    ${pageHead('Bibliotheek', 'Technieken', TECHNIEKEN.intro)}
    <p class="callout">${icon('alert')}<span>${esc(TECHNIEKEN.safety)}</span></p>
    <div class="lib">
      <div class="lib-tools">
        ${searchBox('lib')}
        <div data-part="filters" data-scope="lib">${parts.filters({ scope: 'lib' })}</div>
        <button type="button" class="btn btn-ghost btn-block" data-action="custom-new">${icon('plus')} Eigen techniek toevoegen</button>
      </div>
      <div class="lib-list" data-part="techlist" data-scope="lib">${parts.techlist({ scope: 'lib' })}</div>
    </div>
  </section>`;
}

// ---------- Eigen techniek ----------

function customForm(t) {
  const radios = (name, list, val) => list.map(x => `
    <label class="seg-opt"><input type="radio" name="${name}" value="${x.id}" ${x.id === val ? 'checked' : ''}><span>${esc(x.name)}</span></label>`).join('');
  return `
  <form class="stack" data-custom-form>
    <label class="field"><span>Naam van de techniek</span><input name="name" type="text" maxlength="120" required value="${esc(t.name)}" placeholder="Bijvoorbeeld: Hip toss"></label>
    <label class="field"><span>Sportprofiel</span>
      <select name="sport">${SPORTS.map(s => `<option value="${s.id}" ${s.id === t.sport ? 'selected' : ''}>${esc(s.title)}</option>`).join('')}</select>
    </label>
    <fieldset class="field"><legend>Valrichting</legend><div class="seg">${radios('dir', DIRECTIONS, t.dir)}</div></fieldset>
    <fieldset class="field"><legend>Niveau</legend><div class="seg">${radios('level', LEVELS, t.level)}</div></fieldset>
    <fieldset class="field" data-height ${t.level === 'uitdagend' ? '' : 'hidden'}><legend>Valhoogte <i>(voor de toetscheck)</i></legend>
      <div class="seg">${radios('height', [{ id: 'laag', name: 'Laag' }, { id: 'hoog', name: 'Hoog' }], t.height === 'laag' ? 'laag' : 'hoog')}</div>
    </fieldset>
    <label class="field"><span>YouTube-link <i>(optioneel)</i></span><input name="video" type="url" inputmode="url" placeholder="https://youtu.be/…" value="${esc(t.video)}"></label>
  </form>`;
}

function openCustomDialog(existing) {
  const t = existing || { name: '', sport: filters.lib.sport || SPORTS[0].id, dir: DIRECTIONS[0].id, level: LEVELS[0].id, video: '' };
  const d = openDialog({
    title: existing ? 'Techniek wijzigen' : 'Eigen techniek toevoegen',
    body: customForm(t),
    footer: `<button type="button" class="btn btn-ghost" data-dlg-close>Annuleren</button>
             <button type="button" class="btn btn-primary" data-save>Opslaan</button>`,
  });
  const form = d.querySelector('form');
  // Valhoogte alleen vragen bij uitdagende technieken
  form.addEventListener('change', () => {
    form.querySelector('[data-height]').hidden = form.elements.level.value !== 'uitdagend';
  });
  const submit = () => {
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (data.video && !/^https?:\/\//i.test(data.video)) data.video = 'https://' + data.video;
    const clean = sanitizeTechnique({ ...data, id: existing ? existing.id : 'c-' + uid() });
    if (!clean) return;
    update(st => {
      if (existing) st.custom = st.custom.map(x => (x.id === existing.id ? clean : x));
      else st.custom.push(clean);
    });
    openTech = clean.id;
    d.close();
    toast(existing ? 'Techniek bijgewerkt' : 'Techniek toegevoegd');
  };
  d.querySelector('[data-save]').addEventListener('click', submit);
  form.addEventListener('submit', e => { e.preventDefault(); submit(); });
  form.querySelector('input[name=name]').focus();
}

// ---------- Acties ----------

Object.assign(actions, {
  video: el => openVideo(el.dataset.url, el.dataset.title),

  unclamp: el => {
    const card = el.closest('.sport');
    const open = card.classList.toggle('unclamped');
    el.textContent = open ? 'Lees minder' : 'Lees meer';
  },

  'sport-techs': el => {
    Object.assign(filters.lib, { q: '', sport: el.dataset.id, dir: '', level: '', saved: false });
    location.hash = '#technieken';
  },

  filter: el => {
    const f = filters[el.dataset.scope];
    const { key, val } = el.dataset;
    if (key === 'saved') f.saved = !f.saved;
    else f[key] = f[key] === val ? '' : val;
    refreshParts();
  },

  'filter-reset': el => {
    Object.assign(filters[el.dataset.scope], { q: '', sport: '', dir: '', level: '', saved: false });
    document.querySelectorAll(`[data-input="filter-q"][data-scope="${el.dataset.scope}"]`).forEach(i => { i.value = ''; });
    refreshParts();
  },

  'tech-open': el => {
    openTech = openTech === el.dataset.id ? null : el.dataset.id;
    refreshParts();
  },

  fav: el => {
    const id = el.dataset.id;
    update(st => {
      st.favorites = st.favorites.includes(id) ? st.favorites.filter(x => x !== id) : [...st.favorites, id];
    });
  },

  'custom-new': () => openCustomDialog(null),
  'custom-edit': el => openCustomDialog(techById(el.dataset.id)),

  'custom-delete': async el => {
    const t = techById(el.dataset.id);
    if (!t) return;
    const used = state.shows.some(sh => sh.scenes.some(sc => sc.items.some(it => it.tech === t.id)));
    const ok = await confirmDialog(`“${t.name}” wordt verwijderd${used ? ' en ook uit je shows gehaald' : ''}.`);
    if (!ok) return;
    update(st => {
      st.custom = st.custom.filter(x => x.id !== t.id);
      st.favorites = st.favorites.filter(x => x !== t.id);
      delete st.techNotes[t.id];
      st.shows.forEach(sh => sh.scenes.forEach(sc => { sc.items = sc.items.filter(it => it.tech !== t.id); }));
    });
    toast('Techniek verwijderd');
  },
});

Object.assign(inputs, {
  'filter-q': el => {
    filters[el.dataset.scope].q = el.value;
    refreshParts();
  },
  'tech-note': el => {
    const v = el.value.slice(0, 2000);
    if (v) state.techNotes[el.dataset.id] = v;
    else delete state.techNotes[el.dataset.id];
    save();
  },
});
