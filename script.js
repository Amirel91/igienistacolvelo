/* ============================================================
   Laura El Shatanofy — script.js (pagina pubblica)
   Rendering contenuti da localStorage, menu mobile,
   modale articolo, effetti di scorrimento [data-reveal].
   ============================================================ */

const STORE_KEY = 'laura_site_v1';

/* ---------------- CONTENUTI PREDEFINITI ---------------- */
const DEFAULTS = {
  site: {
    tagline: "Sono Laura, igienista dentale da 15 anni. Curo il tuo sorriso in italiano, arabo e inglese, con la stessa filosofia: prevenire prima di curare.",
    bio: "Sono Laura El Shatanofy, igienista dentale con origini egiziane e un cuore che batte per la prevenzione. Da 15 anni accompagno le famiglie di Morbegno e della Valtellina verso un'igiene orale consapevole: credo che un sorriso sano nasca dalle buone abitudini di ogni giorno, non solo dalla poltrona.\n\nParlo italiano, arabo e inglese, così ogni paziente può raccontarmi i suoi bisogni nella propria lingua. Il mio impegno preferito? Educare i più piccoli: trasformare la prima visita in un gioco è il modo migliore per costruire sorrisi senza paura.",
    telefono: "",
    email: ""
  },
  articles: [
    {
      id: "a1",
      titolo: "Come lavare i denti ai bambini (senza drammi)",
      categoria: "Guide per famiglie",
      img: "",
      pubblicato: true,
      data: "2026-01-12",
      testo: "La parola d'ordine è dolcezza: spazzolino a testina piccola con setole morbide, dentifricio al fluoro nella giusta quantità e tanto gioco. Dai 2 ai 6 anni basta una dose grande come un chicco di riso; crescendo si arriva a quella di un pisello.\n\nDue minuti, due volte al giorno: rendeteli un momento di condivisione, con una canzoncina o una clessidra colorata. Fino ai 7-8 anni il brushing finale spetta comunque a un adulto, perché la motricità fine dei bambini è ancora in crescita.\n\nE se il bimbo si oppone? Trasformate la routine in un gioco: spazzolate i denti del peluche preferito, raccontate la storia degli «sbattibatteri» e festeggiate ogni settimana di costanza. L'importante è non trasformare mai l'igiene in una punizione."
    },
    {
      id: "a2",
      titolo: "Scovolino o filo interdentale? Come scegliere",
      categoria: "Consigli utili",
      img: "",
      pubblicato: true,
      data: "2026-01-20",
      testo: "Lo spazzolino da solo pulisce solo il 60% delle superfici dei denti: il resto è compito del filo o degli scovolini, da usare almeno una volta al giorno, meglio la sera prima del brushing.\n\nIl filo è perfetto per gli spazi stretti: va adagiato a «C» contro una parete del dente e poi contro l'altra, senza schiacciarlo sulla gengiva. Se le gengive sanguinano i primi giorni è normale; se il sanguinamento dura oltre una settimana, parliamone in studio.\n\nGli scovolini sono ideali quando gli spazi sono più ampi o con apparecchio e ponti: la misura giusta entra con una leggera resistenza, mai forzata. Nel dubbio portateli alla prossima pulizia: insieme troviamo il calibro perfetto per la vostra bocca."
    },
    {
      id: "a3",
      titolo: "5 segnali che devi prenotare una pulizia",
      categoria: "Prevenzione",
      img: "",
      pubblicato: true,
      data: "2026-02-02",
      testo: "Gengive che sanguinano quando spazzoli, alito persistente, tartaro visibile agli angoli degli incisivi: sono i segnali classici che il corpo ci manda quando è tempo di una seduta di igiene professionale.\n\nAggiungiamo la sensibilità al freddo che dura da giorni, un sapore metallico al risveglio e denti che sembrano «più lunghi»: quando la gengiva si ritira la radice si scopre, e va protetta il prima possibile.\n\nLa regola generale è una pulizia ogni 6 mesi, ma ognuno ha il suo ritmo: chi ha gengive delicate o apparecchio fisso può aver bisogno di controlli più ravvicinati. Una visita veloce basta a costruire il tuo calendario di prevenzione ideale."
    }
  ],
  products: [
    { id: "p1", nome: "Spazzolino elettrico sonico", icona: "🪥", descrizione: "Pulizia delicata ed efficace: perfetto per chi vuole passare all'elettrico.", link: "https://www.amazon.it/s?k=spazzolino+elettrico+sonico" },
    { id: "p2", nome: "Scovolini interdentali", icona: "🧵", descrizione: "Indispensabili per gli spazi tra i denti: chiedimi la misura giusta per te.", link: "https://www.amazon.it/s?k=scovolini+interdentali" },
    { id: "p3", nome: "Filo interdentale in seta", icona: "🦷", descrizione: "Per gli spazi stretti: scorrevole, resistente e gentile con le gengive.", link: "https://www.amazon.it/s?k=filo+interdentale" },
    { id: "p4", nome: "Spazzolino bambini con timer", icona: "🧒", descrizione: "Setole morbide e timer integrato: due minuti di pulizia diventano un gioco.", link: "https://www.amazon.it/s?k=spazzolino+bambini+timer" }
  ]
};

/* ---------------- HELPERS ---------------- */
const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const clone = (o) => JSON.parse(JSON.stringify(o));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const excerpt = (t, n = 130) => {
  t = String(t || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).trimEnd() + '…' : t;
};

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

/* ---------------- RENDERING ---------------- */
function renderArticoli(data) {
  const grid = $('#articoli-grid');
  if (!grid) return;
  const pubblicati = data.articles.filter(a => a.pubblicato !== false);
  const empty = $('#articoli-empty');
  if (empty) empty.hidden = pubblicati.length > 0;
  if (!pubblicati.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = pubblicati.map(a => {
    const titolo = a.titolo || a.title || '';
    const testo  = a.testo  || a.content || '';
    return `
      <article class="article-card" data-id="${esc(a.id)}" tabindex="0" role="button" aria-label="Leggi: ${esc(titolo)}">
        <p class="article-tag">${esc(a.categoria || 'Articolo')}</p>
        <h3 class="article-title">${esc(titolo)}</h3>
        <p class="article-excerpt">${esc(excerpt(testo))}</p>
        <span class="article-more">Leggi tutto →</span>
      </article>`;
  }).join('');
}

function renderProdotti(data) {
  const grid = $('#prodotti-grid');
  if (!grid) return;
  if (!data.products.length) { grid.innerHTML = ''; return; }
  grid.innerHTML = data.products.map(p => {
    const nome = p.nome || p.title || '';
    const desc = p.descrizione || p.description || '';
    const link = p.link || p.url || '#';
    return `
      <article class="product-card">
        <div class="product-icon">${esc(p.icona || '🦷')}</div>
        <h3 class="product-name">${esc(nome)}</h3>
        <p class="product-desc">${esc(desc)}</p>
        <a class="product-link" href="${esc(link)}" target="_blank" rel="noopener nofollow">Vedi su Amazon →</a>
      </article>`;
  }).join('');
}

function renderContatti(site) {
  const telRow = $('#tel-row'), telLink = $('#tel-link');
  if (telRow && telLink && site.telefono) {
    telLink.textContent = site.telefono;
    telLink.href = 'tel:' + site.telefono.replace(/[\s.]/g, '');
    telRow.hidden = false;
  }
  const mailRow = $('#email-row'), mailLink = $('#email-link');
  if (mailRow && mailLink && site.email) {
    mailLink.textContent = site.email;
    mailLink.href = 'mailto:' + site.email;
    mailRow.hidden = false;
  }
}

/* ---------------- MODALE ARTICOLO ---------------- */
let modalEl = null;

function apriArticolo(a) {
  if (!a || !modalEl) return;
  const cat = $('#modal-categoria');
  const tit = $('#modal-titolo');
  const dat = $('#modal-data');
  const body = $('#modal-testo');
  if (cat) cat.textContent = a.categoria || 'Articolo';
  if (tit) tit.textContent = a.titolo || a.title || '';
  if (dat) {
    const d = a.data ? new Date(a.data) : null;
    dat.textContent = (!d || isNaN(d)) ? '' :
      'Pubblicato il ' + d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (body) {
    const testo = String(a.testo || a.content || '');
    body.innerHTML =
      (a.img ? `<img src="${esc(a.img)}" alt="" loading="lazy">` : '') +
      testo.split(/\n{2,}/).filter(Boolean)
           .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  }
  modalEl.hidden = false;
  modalEl.classList.add('open');
  modalEl.setAttribute('aria-hidden', 'false');
  const closeBtn = $('#modal-close');
  if (closeBtn) closeBtn.focus();
}

function chiudiModale() {
  if (!modalEl || modalEl.hidden) return;
  modalEl.classList.remove('open');
  modalEl.setAttribute('aria-hidden', 'true');
  setTimeout(() => { modalEl.hidden = true; }, 220);
}

/* ---------------- EFFETTI SCORRIMENTO ---------------- */
function initReveal() {
  const revs = $$('[data-reveal]');
  if (!revs.length) return;
  if (!('IntersectionObserver' in window)) {
    revs.forEach(r => r.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  revs.forEach(r => io.observe(r));
}

/* ---------------- INIT PAGINA PUBBLICA ---------------- */
function initPublic() {
  const data = loadData();

  const tagline = $('#tagline');
  if (tagline && data.site.tagline) tagline.textContent = data.site.tagline;

  const bio = $('#bio');
  if (bio && data.site.bio) {
    bio.textContent = data.site.bio;
    bio.style.whiteSpace = 'pre-line';
  }

  renderArticoli(data);
  renderProdotti(data);
  renderContatti(data.site);

  // menu mobile
  const menuBtn = $('#menu-btn');
  const navLinks = $('#nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    });
    navLinks.addEventListener('click', e => {
      if (e.target.closest('a')) {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // modale
  modalEl = $('#articolo-modal');
  if (modalEl) {
    const grid = $('#articoli-grid');
    if (grid) {
      grid.addEventListener('click', e => {
        const card = e.target.closest('.article-card');
        if (!card) return;
        apriArticolo(data.articles.find(a => String(a.id) === card.dataset.id));
      });
      grid.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.article-card');
        if (!card) return;
        e.preventDefault();
        apriArticolo(data.articles.find(a => String(a.id) === card.dataset.id));
      });
    }
    modalEl.addEventListener('click', e => {
      if (e.target.closest('#modal-close') || e.target === modalEl) chiudiModale();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') chiudiModale(); });
  }

  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  initReveal();
}

document.addEventListener('DOMContentLoaded', initPublic);
