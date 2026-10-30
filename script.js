/* ============================================================
   Igienista Laura El Shatanofy — script.js
   - Pagina pubblica (index.html): rendering contenuti, menu, modale articolo
   - Pannello admin (admin.html): login, editing contenuti, articoli, consigli Amazon
   I contenuti modificati sono salvati in localStorage (questo browser).
   ============================================================ */

const STORE_KEY  = 'laura_site_v1';
const ADMIN_KEY  = 'laura_admin_ok';
const ADMIN_PASS = 'laura2026'; // password demo: cambiarla in produzione (vedi riepilogo)

/* ---------------- CONTENUTI PREDEFINITI ---------------- */
const DEFAULTS = {
  site: {
    heroTitle: "Laura El Shatanofy",
    heroText: "Igienista dentale a Morbegno da 15 anni: curo il sorriso di grandi e piccini, in italiano, arabo e inglese.",
    aboutTitle: "Chi sono",
    aboutText: "Sono Laura El Shatanofy, igienista dentale a Morbegno, in Valtellina.\nDa 15 anni aiuto grandi e piccini a prendersi cura del proprio sorriso, con la convinzione che una buona igiene orale nasca dall'ascolto e dall'educazione.\nParlo italiano, arabo e inglese: ogni paziente può sentirsi a casa, nella propria lingua.\nI bambini sono la mia passione: trasformo la pulizia dei denti in un gioco, così crescono senza paura del dentista."
  },
  articles: [
    {
      id: 1,
      title: "Spazzolino come un gioco: igiene orale per i più piccoli",
      category: "Bambini",
      image: "",
      content: "Fin dalla comparsa del primo dentino la parola d'ordine è una: dolcezza. Scegliete uno spazzolino a testina piccola con setole morbide e lasciate che sia il bambino a \"guidare\" il gioco, con voi accanto. Due minuti, due volte al giorno: rendeteli un momento di condivisione, magari con una canzoncina o una clessidra colorata.\nDai 2-3 anni si può introdurre un dentifricio al fluoro in quantità grande come un chicco di riso, per arrivare a un pisello intorno ai 6 anni. Ricordate: fino a 7-8 anni il brushing finale spetta a voi genitori, perché la motricità fine dei bambini è ancora in crescita.\nCon costanza e allegria, l'igiene orale diventa un'abitudine che accompagnerà i vostri figli per tutta la vita."
    },
    {
      id: 2,
      title: "Il filo interdentale: l'alleato che dimentichiamo sempre",
      category: "Guide",
      image: "",
      content: "Lo spazzolino da solo pulisce solo il 60% delle superfici dei denti: il resto è compito del filo interdentale o degli scovolini. Va usato almeno una volta al giorno, meglio la sera prima del brushing.\nStaccate circa 40 cm di filo, avvolgetelo attorno agli indici lasciandone liberi 2-3 cm, inseritelo delicatamente tra dente e dente e adagiatelo a \"C\" prima contro una parete, poi contro l'altra. Se le gengive sanguinano i primi giorni è normale; se il sanguinamento persiste oltre una settimana, parliamone in studio.\nChi porta apparecchio fisso o ponti può preferire gli scovolini, scegliendo il calibro giusto: devono entrare con una leggera resistenza, mai forzati."
    },
    {
      id: 3,
      title: "Alimenti amici del sorriso: cosa mettere nel carrello",
      category: "Prevenzione",
      image: "",
      content: "La prevenzione inizia a tavola. Verdure croccanti come carote e finocchi, formaggi stagionati e frutta secca stimolano la salivazione, il naturale sistema di difesa del cavo orale.\nAttenzione agli zuccheri \"nascosti\": succhi di frutta, bibite gassate, yogurt alla frutta e snack confezionati nutrono i batteri che causano la carie. La regola d'oro è limitare la frequenza, non solo la quantità: meglio un dolce a fine pasto che mille assaggi durante la giornata.\nAcqua e tè non zuccherati sono le bevande migliori; una gomma senza zucchero al xilitolo dopo i pasti può aiutare quando non si può lavare i denti. E per i più piccoli? Mai lasciare il biberon zuccherato per la nanna: è una delle cause principali delle carie precoci."
    }
  ],
  products: [
    {
      id: 1,
      title: "Spazzolino elettrico per bambini",
      description: "Testina piccola e timer integrato: rende il brushing divertente e completo.",
      image: "",
      url: "https://www.amazon.it/s?k=spazzolino+elettrico+bambini"
    },
    {
      id: 2,
      title: "Scovolini interdentali",
      description: "Per la pulizia quotidiana degli spazi tra i denti: scegliete il calibro giusto.",
      image: "",
      url: "https://www.amazon.it/s?k=scovolini+interdentali"
    },
    {
      id: 3,
      title: "Idropulsore da viaggio",
      description: "Getto d'acqua pulsato per un'igiene interdentale comoda anche fuori casa.",
      image: "",
      url: "https://www.amazon.it/s?k=idropulsore+portatile"
    },
    {
      id: 4,
      title: "Clessidra timer 2 minuti",
      description: "Il trucco che amo per i bambini: due minuti di spazzolino diventano un gioco.",
      image: "",
      url: "https://www.amazon.it/s?k=clessidra+2+minuti+denti+bambini"
    }
  ]
};

/* ---------------- HELPERS ---------------- */
const $  = (s, el = document) => el.querySelector(s);
const clone = (o) => JSON.parse(JSON.stringify(o));
const uid = () => Date.now() + Math.floor(Math.random() * 1000);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const excerpt = (t, n = 130) => {
  t = String(t || '');
  return t.length > n ? t.slice(0, n).trimEnd() + '…' : t;
};
// prova più selettori (robustezza tra pagine)
const qAny = (sels) => { for (const s of sels) { const el = $(s); if (el) return el; } return null; };
const setAny = (sels, v) => { const el = qAny(sels); if (el) el.value = v ?? ''; };
const getAny = (sels) => { const el = qAny(sels); return el ? el.value.trim() : ''; };
const textAny = (sels, v) => { const el = qAny(sels); if (el) el.textContent = v ?? ''; };

/* ---------------- STORAGE ---------------- */
function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return clone(DEFAULTS);
    const s = JSON.parse(raw);
    return {
      site: { ...clone(DEFAULTS.site), ...(s.site || {}) },
      articles: Array.isArray(s.articles) ? s.articles : clone(DEFAULTS.articles),
      products: Array.isArray(s.products) ? s.products : clone(DEFAULTS.products)
    };
  } catch { return clone(DEFAULTS); }
}
const saveData = (d) => localStorage.setItem(STORE_KEY, JSON.stringify(d));

/* ============================================================
   PAGINA PUBBLICA (index.html)
   ============================================================ */
function initPublic() {
  const data = loadData();

  // testi modificabili da admin
  const heroTitle = textAny(['#heroTitle', '.hero h1'], data.site.heroTitle);
  const heroP = textAny(['#heroText', '.hero p'], data.site.heroText);
  if (heroTitle) heroTitle.removeAttribute('hidden');
  textAny(['#aboutTitle'], data.site.aboutTitle);
  const about = qAny(['#aboutText']);
  if (about) { about.textContent = data.site.aboutText; about.style.whiteSpace = 'pre-line'; }

  // menu mobile
  const menuBtn = $('.menu-btn');
  const navLinks = $('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', e => {
      if (e.target.closest('a')) navLinks.classList.remove('open');
    });
  }

  // articoli
  const grid = qAny(['#articlesGrid', '.grid-articles']);
  if (grid) {
    grid.innerHTML = data.articles.map(a => `
      <article class="card">
        ${a.image ? `<img class="card-img" src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy">` : ''}
        <div class="card-body">
          ${a.category ? `<span class="badge">${esc(a.category)}</span>` : ''}
          <h3>${esc(a.title)}</h3>
          <p>${esc(excerpt(a.content))}</p>
          <button class="btn btn--small read-more" data-id="${esc(a.id)}">Leggi l'articolo</button>
        </div>
      </article>`).join('');
    grid.addEventListener('click', e => {
      const btn = e.target.closest('.read-more');
      if (!btn) return;
      openArticle(data.articles.find(a => String(a.id) === btn.dataset.id));
    });
  }

  // consigli Amazon
  const pgrid = qAny(['#productsGrid', '.grid-products']);
  if (pgrid) {
    pgrid.innerHTML = data.products.map(p => `
      <article class="card">
        ${p.image ? `<img class="card-img" src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">` : ''}
        <div class="card-body">
          <h3>${esc(p.title)}</h3>
          ${p.description ? `<p>${esc(p.description)}</p>` : ''}
          ${p.url ? `<a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Vedi su Amazon →</a>` : ''}
        </div>
      </article>`).join('');
  }

  // anno footer
  textAny(['#year'], String(new Date().getFullYear()));

  // reveal sobrio
  const revs = document.querySelectorAll('.reveal');
  if (revs.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: .12 });
    revs.forEach(r => io.observe(r));
  }
}

/* ---------- modale articolo ---------- */
let modalEl = null;
function openArticle(a) {
  if (!a) return;
  modalEl = modalEl || qAny(['#articleModal', '.modal']);
  if (!modalEl) { alert(a.title + '\n\n' + a.content); return; }
  const t = qAny(['#modalTitle']);
  const b = qAny(['#modalBody']);
  if (t) t.textContent = a.title;
  if (b) b.innerHTML =
    (a.image ? `<img class="card-img" src="${esc(a.image)}" alt="">` : '') +
    `<p>${esc(a.content).replace(/\n/g, '<br>')}</p>`;
  modalEl.classList.add('open');
  modalEl.setAttribute('aria-hidden', 'false');
  const c = qAny(['#modalClose', '.modal-close']);
  if (c) c.focus();
}
function closeModal() {
  if (!modalEl) return;
  modalEl.classList.remove('open');
  modalEl.setAttribute('aria-hidden', 'true');
}

/* ============================================================
   PANNELLO ADMIN (admin.html)
   ============================================================ */
let DATA = null;

const SEL = {
  loginView: ['#loginView', '#login'],
  adminView: ['#adminView', '#dashboard'],
  loginForm: ['#loginForm'],
  pass: ['#adminPass', '#pass'],
  logout: ['#logoutBtn', '#logout'],
  heroTitle: ['#fHeroTitle', '#heroTitle'],
  heroText: ['#fHeroText', '#heroText'],
  aboutTitle: ['#fAboutTitle', '#aboutTitle'],
  aboutText: ['#fAboutText', '#aboutText'],
  artId: ['#artId', '#articleId'],
  artTitle: ['#artTitle', '#articleTitle'],
  artCategory: ['#artCategory', '#articleCategory'],
  artImage: ['#artImage', '#articleImage'],
  artContent: ['#artContent', '#articleContent'],
  prodId: ['#prodId', '#productId'],
  prodTitle: ['#prodTitle', '#productTitle'],
  prodDesc: ['#prodDesc', '#productDesc'],
  prodImage: ['#prodImage', '#productImage'],
  prodUrl: ['#prodUrl', '#productUrl'],
  artList: ['#articlesAdmin', '#adminArticles'],
  prodList: ['#productsAdmin', '#adminProducts'],
  reset: ['#resetData', '#resetBtn'],
  export: ['#exportBtn', '#export'],
  importFile: ['#importFile', '#import']
};

const isAdminPage = () =>
  /admin\.html/i.test(location.pathname) || document.body.dataset.page === 'admin';

function fillSiteForm(d) {
  setAny(SEL.heroTitle, d.site.heroTitle);
  setAny(SEL.heroText, d.site.heroText);
  setAny(SEL.aboutTitle, d.site.aboutTitle);
  setAny(SEL.aboutText, d.site.aboutText);
}
function fillArticleForm(a) {
  setAny(SEL.artId, a ? a.id : '');
  setAny(SEL.artTitle, a ? a.title : '');
  setAny(SEL.artCategory, a ? a.category : '');
  setAny(SEL.artImage, a ? a.image : '');
  setAny(SEL.artContent, a ? a.content : '');
}
function fillProductForm(p) {
  setAny(SEL.prodId, p ? p.id : '');
  setAny(SEL.prodTitle, p ? p.title : '');
  setAny(SEL.prodDesc, p ? p.description : '');
  setAny(SEL.prodImage, p ? p.image : '');
  setAny(SEL.prodUrl, p ? p.url : '');
}

function renderList(sel, items, type) {
  const box = qAny(sel);
  if (!box) return;
  if (!items.length) {
    box.innerHTML = '<p class="muted">Nessun elemento: aggiungine uno dal modulo.</p>';
    return;
  }
  box.innerHTML = items.map(i => `
    <div class="admin-row">
      <strong>${esc(i.title)}</strong>
      <span class="admin-actions">
        <button class="btn btn--small" data-act="edit" data-type="${type}" data-id="${esc(i.id)}">Modifica</button>
        <button class="btn btn--small btn--danger" data-act="del" data-type="${type}" data-id="${esc(i.id)}">Elimina</button>
      </span>
    </div>`).join('');
}

function refreshAdmin() {
  DATA = loadData();
  fillSiteForm(DATA);
  renderList(SEL.artList, DATA.articles, 'article');
  renderList(SEL.prodList, DATA.products, 'product');
}

function initAdmin() {
  const loginView = qAny(SEL.loginView);
  const adminView = qAny(SEL.adminView);
  const isLogged = () => sessionStorage.getItem(ADMIN_KEY) === '1';
  const toggleViews = () => {
    const ok = isLogged();
    if (loginView) loginView.hidden = ok;
    if (adminView) adminView.hidden = !ok;
    if (ok) refreshAdmin();
  };

  // login
  const loginForm = qAny(SEL.loginForm);
  if (loginForm) loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = qAny(SEL.pass);
    if (input && input.value === ADMIN_PASS) {
      sessionStorage.setItem(ADMIN_KEY, '1');
      input.value = '';
      toggleViews();
    } else {
      alert('Password non corretta. Riprova.');
      if (input) input.focus();
    }
  });

  const logoutBtn = qAny(SEL.logout);
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_KEY);
    toggleViews();
  });

  // testi presentazione
  const siteForm = qAny(['#siteForm', '#textsForm']);
  if (siteForm) siteForm.addEventListener('submit', e => {
    e.preventDefault();
    const d = loadData();
    d.site.heroTitle = getAny(SEL.heroTitle) || d.site.heroTitle;
    d.site.heroText  = getAny(SEL.heroText);
    d.site.aboutTitle = getAny(SEL.aboutTitle);
    d.site.aboutText  = getAny(SEL.aboutText);
    saveData(d);
    refreshAdmin();
    alert('Presentazione aggiornata! Apri index.html per vederla.');
  });

  // articoli
  const artForm = qAny(['#articleForm']);
  if (artForm) artForm.addEventListener('submit', e => {
    e.preventDefault();
    const f = {
      title: getAny(SEL.artTitle),
      category: getAny(SEL.artCategory),
      image: getAny(SEL.artImage),
      content: getAny(SEL.artContent)
    };
    if (!f.title || !f.content) { alert('Titolo e contenuto sono obbligatori.'); return; }
    const d = loadData();
    const id = getAny(SEL.artId);
    if (id) {
      const a = d.articles.find(x => String(x.id) === id);
      if (a) Object.assign(a, f);
    } else {
      d.articles.unshift({ id: uid(), ...f });
    }
    saveData(d);
    artForm.reset();
    refreshAdmin();
    alert('Articolo salvato!');
  });

  // prodotti / consigli Amazon
  const prodForm = qAny(['#productForm']);
  if (prodForm) prodForm.addEventListener('submit', e => {
    e.preventDefault();
    const f = {
      title: getAny(SEL.prodTitle),
      description: getAny(SEL.prodDesc),
      image: getAny(SEL.prodImage),
      url: getAny(SEL.prodUrl)
    };
    if (!f.title || !f.url) { alert('Titolo e link Amazon sono obbligatori.'); return; }
    const d = loadData();
    const id = getAny(SEL.prodId);
    if (id) {
      const p = d.products.find(x => String(x.id) === id);
      if (p) Object.assign(p, f);
    } else {
      d.products.unshift({ id: uid(), ...f });
    }
    saveData(d);
    prodForm.reset();
    refreshAdmin();
    alert('Consiglio salvato!');
  });

  // azioni modifica/elimina (delegate)
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const { act, type, id } = b.dataset;
    const isArt = type === 'article';
    const list = isArt ? DATA.articles : DATA.products;
    const item = list && list.find(x => String(x.id) === String(id));
    if (act === 'edit' && item) {
      isArt ? fillArticleForm(item) : fillProductForm(item);
      (isArt ? qAny(['#articleForm']) : qAny(['#productForm']))?.scrollIntoView({ behavior: 'smooth' });
    }
    if (act === 'del' && item && confirm(`Eliminare "${item.title}"?`)) {
      const d = loadData();
      if (isArt) d.articles = d.articles.filter(x => String(x.id) !== String(id));
      else d.products = d.products.filter(x => String(x.id) !== String(id));
      saveData(d);
      refreshAdmin();
    }
  });

  // ripristino predefiniti
  const resetBtn = qAny(SEL.reset);
  if (resetBtn) resetBtn.addEventListener('click', () => {
    if (!confirm('Ripristinare tutti i contenuti predefiniti? Le modifiche andranno perse.')) return;
    localStorage.removeItem(STORE_KEY);
    refreshAdmin();
    alert('Contenuti ripristinati.');
  });

  // backup
  const expBtn = qAny(SEL.export);
  if (expBtn) expBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(loadData(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'contenuti-sito-laura.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  const impInput = qAny(SEL.importFile);
  if (impInput) impInput.addEventListener('change', () => {
    const file = impInput.files && impInput.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        saveData({
          site: { ...clone(DEFAULTS.site), ...(d.site || {}) },
          articles: Array.isArray(d.articles) ? d.articles : [],
          products: Array.isArray(d.products) ? d.products : []
        });
        refreshAdmin();
        alert('Contenuti importati.');
      } catch { alert('File non valido.'); }
    };
    r.readAsText(file);
  });

  toggleViews();
}

/* ---------------- BOOT ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  if (isAdminPage()) initAdmin();
  else initPublic();

  // chiusura modale (click su X o sfondo, tasto Esc)
  document.addEventListener('click', e => {
    if (e.target.closest('#modalClose, .modal-close') || e.target === modalEl) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});
