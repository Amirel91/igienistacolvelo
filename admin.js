/* ============================================================
   Igienista Laura El Shatanofy — admin.js
   Pannello di gestione (admin.html): login, presentazione,
   articoli, prodotti consigliati Amazon, backup JSON.
   Condivide la chiave localStorage con script.js (pagina pubblica).
   ============================================================ */

const STORE_KEY  = 'laura_site_v1';
const ADMIN_KEY  = 'laura_admin_ok';
const ADMIN_PASS = 'igienista2026'; // password demo: cambiarla in produzione

/* ---------------- HELPERS ---------------- */
const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clone = (o) => JSON.parse(JSON.stringify(o));
const uid = () => Date.now() + Math.floor(Math.random() * 1000);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const setVal = (sel, v) => { const el = $(sel); if (el) el.value = v ?? ''; };

const fmtData = (d) => {
  if (!d) return '—';
  const n = Number(d);
  const dt = new Date(Number.isFinite(n) ? n : d);
  return isNaN(dt.getTime()) ? '—'
    : dt.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
};

const msg = (el, testo, ok = true) => {
  if (!el) return;
  el.textContent = testo;
  el.classList.toggle('msg--err', !ok);
};

/* ---------------- CONTENUTI PREDEFINITI ---------------- */
const DEFAULTS = {
  site: {
    tagline: "Sono Laura, igienista dentale da 15 anni. Curo il tuo sorriso in italiano, arabo e inglese, con la stessa filosofia: prevenire prima di curare.",
    bio: "Sono Laura El Shatanofy, igienista dentale con origini egiziane e un cuore che batte per la prevenzione. Da 15 anni accompagno le famiglie di Morbegno e della Valtellina verso un'igiene orale consapevole: credo che un sorriso sano nasca dalle buone abitudini di ogni giorno, non solo dalla poltrona.\n\nParlo italiano, arabo e inglese, così ogni paziente può raccontarmi i suoi bisogni nella propria lingua. Il mio impegno preferito? Educare i più piccoli: trasformare la prima visita in un gioco è il modo migliore per costruire sorrisi senza paura.",
    telefono: "",
    email: ""
  },
  articles: [],
  products: []
};

/* normalizza chiavi vecchie/nueove per robustezza tra versioni */
const normArt = (a) => ({
  id: a.id ?? uid(),
  titolo: a.titolo ?? a.title ?? 'Senza titolo',
  categoria: a.categoria ?? a.category ?? '',
  img: a.img ?? a.image ?? '',
  testo: a.testo ?? a.content ?? '',
  pubblicato: a.pubblicato !== false,
  data: a.data ?? Date.now()
});
const normPro = (p) => ({
  id: p.id ?? uid(),
  nome: p.nome ?? p.title ?? 'Prodotto',
  icona: p.icona ?? '🦷',
  descrizione: p.descrizione ?? p.description ?? '',
  link: p.link ?? p.url ?? ''
});

/* ---------------- STORAGE ---------------- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return clone(DEFAULTS);
    const s = JSON.parse(raw);
    return {
      site: { ...clone(DEFAULTS.site), ...(s.site || {}) },
      articles: Array.isArray(s.articles) ? s.articles.map(normArt) : [],
      products: Array.isArray(s.products) ? s.products.map(normPro) : []
    };
  } catch { return clone(DEFAULTS); }
}
const saveData = (d) => localStorage.setItem(STORE_KEY, JSON.stringify(d));

/* ---------------- LOGIN / VISTE ---------------- */
const isLogged = () => sessionStorage.getItem(ADMIN_KEY) === '1';

function toggleViews() {
  const login = $('#login-view');
  const admin = $('#admin-view');
  const ok = isLogged();
  if (login) login.hidden = ok;
  if (admin) admin.hidden = !ok;
  if (ok) refreshAdmin();
}

function initLogin() {
  const form = $('#login-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#login-pass');
    if (input && input.value === ADMIN_PASS) {
      sessionStorage.setItem(ADMIN_KEY, '1');
      input.value = '';
      msg($('#login-msg'), '');
      toggleViews();
    } else {
      msg($('#login-msg'), 'Password non corretta: riprova. 🔒', false);
      if (input) input.focus();
    }
  });
  const out = $('#btn-logout');
  if (out) out.addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_KEY);
    toggleViews();
  });
}

/* ---------------- TABS ---------------- */
function attivaTab(nome) {
  const btn = $(`.tab-btn[data-tab="${nome}"]`);
  if (btn) btn.click();
}
function initTabs() {
  $$('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    $$('.admin-panel').forEach(p => { p.hidden = p.id !== 'tab-' + btn.dataset.tab; });
  }));
}

/* ---------------- PRESENTAZIONE ---------------- */
function initPresentazione() {
  const form = $('#form-presentazione');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = loadData();
    d.site.tagline   = $('#pres-tagline')?.value.trim() || d.site.tagline;
    d.site.bio       = $('#pres-bio')?.value.trim() || d.site.bio;
    d.site.telefono  = $('#pres-telefono')?.value.trim() || '';
    d.site.email     = $('#pres-email')?.value.trim() || '';
    saveData(d);
    msg($('#pres-msg'), 'Presentazione salvata: apri il sito per vedere le novità. ✨');
  });
}

/* ---------------- ARTICOLI ---------------- */
function fillArticleForm(a) {
  setVal('#art-id', a.id);
  setVal('#art-titolo', a.titolo);
  setVal('#art-categoria', a.categoria);
  setVal('#art-img', a.img);
  setVal('#art-testo', a.testo);
  const pub = $('#art-pubblicato');
  if (pub) pub.checked = a.pubblicato !== false;
  const annulla = $('#art-annulla');
  if (annulla) annulla.hidden = false;
}
function resetArticleForm() {
  const f = $('#form-articolo');
  if (f) f.reset();
  const annulla = $('#art-annulla');
  if (annulla) annulla.hidden = true;
}

function renderListaArticoli(articles) {
  const ul = $('#lista-articoli');
  if (!ul) return;
  if (!articles.length) { ul.innerHTML = '<li class="muted">Nessun articolo: scrivi il primo qui sopra.</li>'; return; }
  ul.innerHTML = articles.map(a => `
    <li class="admin-row">
      <div class="admin-row-main">
        <strong>${esc(a.titolo)}</strong>
        <span class="admin-row-meta">${esc(a.categoria || '—')} · ${fmtData(a.data)} · ${a.pubblicato !== false ? '✅ Pubblicato' : '🚧 Bozza'}</span>
      </div>
      <span class="admin-actions">
        <button class="btn btn--small" type="button" data-act="edit-art" data-id="${esc(a.id)}">Modifica</button>
        <button class="btn btn--small btn--danger" type="button" data-act="del-art" data-id="${esc(a.id)}">Elimina</button>
      </span>
    </li>`).join('');
}

function initArticoli() {
  const form = $('#form-articolo');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const titolo = $('#art-titolo')?.value.trim() || '';
    const testo  = $('#art-testo')?.value.trim() || '';
    if (!titolo || !testo) { alert('Titolo e testo dell\'articolo sono obbligatori.'); return; }
    const d = loadData();
    const id = $('#art-id')?.value;
    const esistente = id ? d.articles.find(x => String(x.id) === String(id)) : null;
    const voce = {
      id: esistente ? esistente.id : uid(),
      titolo,
      categoria: $('#art-categoria')?.value.trim() || 'Consigli',
      img: $('#art-img')?.value.trim() || '',
      testo,
      pubblicato: $('#art-pubblicato')?.checked !== false,
      data: esistente ? esistente.data : Date.now()
    };
    if (esistente) Object.assign(esistente, voce);
    else d.articles.unshift(voce);
    saveData(d);
    resetArticleForm();
    refreshAdmin();
  });
  const annulla = $('#art-annulla');
  if (annulla) annulla.addEventListener('click', resetArticleForm);
}

/* ---------------- PRODOTTI ---------------- */
function fillProductForm(p) {
  setVal('#pro-id', p.id);
  setVal('#pro-nome', p.nome);
  setVal('#pro-icona', p.icona);
  setVal('#pro-descrizione', p.descrizione);
  setVal('#pro-link', p.link);
  const annulla = $('#pro-annulla');
  if (annulla) annulla.hidden = false;
}
function resetProductForm() {
  const f = $('#form-prodotto');
  if (f) f.reset();
  const annulla = $('#pro-annulla');
  if (annulla) annulla.hidden = true;
}

function renderListaProdotti(products) {
  const ul = $('#lista-prodotti');
  if (!ul) return;
  if (!products.length) { ul.innerHTML = '<li class="muted">Nessun prodotto: aggiungi il primo consiglio Amazon.</li>'; return; }
  ul.innerHTML = products.map(p => `
    <li class="admin-row">
      <div class="admin-row-main">
        <strong>${esc(p.icona || '🦷')} ${esc(p.nome)}</strong>
        <span class="admin-row-meta">${esc(p.descrizione || '—')}</span>
      </div>
      <span class="admin-actions">
        <button class="btn btn--small" type="button" data-act="edit-pro" data-id="${esc(p.id)}">Modifica</button>
        <button class="btn btn--small btn--danger" type="button" data-act="del-pro" data-id="${esc(p.id)}">Elimina</button>
      </span>
    </li>`).join('');
}

function initProdotti() {
  const form = $('#form-prodotto');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome = $('#pro-nome')?.value.trim() || '';
    const link = $('#pro-link')?.value.trim() || '';
    if (!nome || !link) { alert('Nome prodotto e link Amazon sono obbligatori.'); return; }
    const d = loadData();
    const id = $('#pro-id')?.value;
    const esistente = id ? d.products.find(x => String(x.id) === String(id)) : null;
    const voce = {
      id: esistente ? esistente.id : uid(),
      nome,
      icona: $('#pro-icona')?.value.trim() || '🦷',
      descrizione: $('#pro-descrizione')?.value.trim() || '',
      link
    };
    if (esistente) Object.assign(esistente, voce);
    else d.products.unshift(voce);
    saveData(d);
    resetProductForm();
    refreshAdmin();
  });
  const annulla = $('#pro-annulla');
  if (annulla) annulla.addEventListener('click', resetProductForm);
}

/* ---------------- MODIFICA / ELIMINA (delega) ---------------- */
function initAzioniLista() {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const { act, id } = b.dataset;
    const d = loadData();
    if (act === 'edit-art') {
      const a = d.articles.find(x => String(x.id) === String(id));
      if (!a) return;
      attivaTab('articoli');
      fillArticleForm(a);
      $('#form-articolo')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (act === 'edit-pro') {
      const p = d.products.find(x => String(x.id) === String(id));
      if (!p) return;
      attivaTab('prodotti');
      fillProductForm(p);
      $('#form-prodotto')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (act === 'del-art' || act === 'del-pro') {
      const isArt = act === 'del-art';
      const lista = isArt ? d.articles : d.products;
      const item = lista.find(x => String(x.id) === String(id));
      if (!item) return;
      const nome = isArt ? item.titolo : item.nome;
      if (!confirm(`Eliminare "${nome}"? L'operazione non si può annullare.`)) return;
      if (isArt) d.articles = d.articles.filter(x => String(x.id) !== String(id));
      else d.products = d.products.filter(x => String(x.id) !== String(id));
      saveData(d);
      if (isArt) resetArticleForm(); else resetProductForm();
      refreshAdmin();
    }
  });
}

/* ---------------- BACKUP ---------------- */
function initBackup() {
  const exp = $('#btn-export');
  if (exp) exp.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(loadData(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'contenuti-sito-laura.json';
    a.click();
    URL.revokeObjectURL(a.href);
    msg($('#backup-msg'), 'Backup esportato: conservalo in un posto sicuro. 💾');
  });

  const imp = $('#import-file');
  if (imp) imp.addEventListener('change', () => {
    const file = imp.files && imp.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const s = JSON.parse(r.result);
        saveData({
          site: { ...clone(DEFAULTS.site), ...(s.site || {}) },
          articles: Array.isArray(s.articles) ? s.articles.map(normArt) : [],
          products: Array.isArray(s.products) ? s.products.map(normPro) : []
        });
        refreshAdmin();
        msg($('#backup-msg'), 'Backup importato: contenuti aggiornati. ✅');
      } catch { msg($('#backup-msg'), 'Il file selezionato non è un backup valido.', false); }
      imp.value = '';
    };
    r.readAsText(file);
  });

  const reset = $('#btn-reset');
  if (reset) reset.addEventListener('click', () => {
    if (!confirm('Ripristinare tutti i contenuti iniziali? Le modifiche andranno perse.')) return;
    localStorage.removeItem(STORE_KEY);
    refreshAdmin();
    msg($('#backup-msg'), 'Contenuti ripristinati ai valori iniziali. ↺');
  });
}

/* ---------------- REFRESH & BOOT ---------------- */
function refreshAdmin() {
  const d = loadData();
  setVal('#pres-tagline', d.site.tagline);
  setVal('#pres-bio', d.site.bio);
  setVal('#pres-telefono', d.site.telefono);
  setVal('#pres-email', d.site.email);
  renderListaArticoli(d.articles);
  renderListaProdotti(d.products);
  resetArticleForm();
  resetProductForm();
}

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initTabs();
  initPresentazione();
  initArticoli();
  initProdotti();
  initAzioniLista();
  initBackup();
  toggleViews();
});
