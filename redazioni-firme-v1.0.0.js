/* Redazioni: firme degli articoli v1.0.0
   Configurazione (nell'HTML del forum, prima di questo script):

   var REDAZIONI_FIRME = {
     '65121577': { nome: 'La Spina', firme: ['Spina Dorsale', 'Alla Spina'], libera: false }
   };

   - la chiave è il numero della sezione (quello dopo ?f=)
   - firme: i nomi proposti nel menu
   - libera: true aggiunge "Altro..." per scrivere una firma qualsiasi (es. il nome del proprio PG)

   Funzionamento: nell'editor del primo messaggio di un articolo compare il menu "Firma come".
   La scelta viene scritta come prima riga del testo ("Firma: Nome"); nella sezione la riga
   viene nascosta e il nome sostituisce il nickname dell'account. */
(function() {
  var PREFIX = 'Firma:';
  var LINE_RE = /^[ \t]*Firma[ \t]*:[ \t]*([^\r\n]*)(\r?\n)?/i;

  function config() {
    var c = window.REDAZIONI_FIRME || {};
    var body = document.body;
    if (!body) return null;
    for (var id in c) {
      if (body.classList.contains('f' + id)) { c[id].id = id; return c[id]; }
    }
    return null;
  }

  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) {}
    return null;
  }

  /* ── EDITOR ── */
  function readFirma(text) {
    var m = String(text || '').match(LINE_RE);
    return m ? m[1].trim() : '';
  }
  function writeFirma(ta, name) {
    var v = ta.value.replace(LINE_RE, '');
    ta.value = name ? PREFIX + ' ' + name + '\n' + v : v;
  }

  function initEditor(cfg) {
    var body = document.body;
    if (body.id !== 'send') return;
    var ta = document.querySelector('textarea[name="Post"]');
    var title = document.querySelector('input[name="TopicTitle"]');
    if (!ta || !title || document.getElementById('rdz-firma')) return;

    var firme = cfg.firme || [];
    var libera = !!cfg.libera;
    var key = 'rdz_firma_' + cfg.id;

    var box = document.createElement('div');
    box.id = 'rdz-firma';
    box.style.cssText = 'display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:0 0 8px;padding:8px 10px;border:1px dashed #888;border-radius:6px;font-size:13px;text-align:left;';
    var lbl = document.createElement('label');
    lbl.textContent = 'Firma come:';
    lbl.style.cssText = 'font-weight:bold;margin:0;';
    var sel = document.createElement('select');
    sel.style.cssText = 'padding:3px 6px;font-size:13px;max-width:100%;';
    var other = document.createElement('input');
    other.type = 'text';
    other.placeholder = 'Nome con cui firmare (es. il tuo PG)';
    other.maxLength = 60;
    other.style.cssText = 'padding:3px 6px;font-size:13px;min-width:200px;flex:1;display:none;';
    var hint = document.createElement('span');
    hint.style.cssText = 'font-size:11px;opacity:0.75;width:100%;';
    hint.textContent = 'La firma viene salvata come prima riga del testo e mostrata al posto del nickname.';

    function opt(value, text) {
      var o = document.createElement('option');
      o.value = value; o.textContent = text;
      sel.appendChild(o);
    }
    if (libera || !firme.length) opt('', '— Nessuna (mostra il nickname) —');
    for (var i = 0; i < firme.length; i++) opt(firme[i], firme[i]);
    if (libera) opt('__altro__', 'Altro…');

    function current() {
      if (sel.value === '__altro__') return other.value.trim();
      return sel.value;
    }
    function apply() {
      other.style.display = sel.value === '__altro__' ? 'block' : 'none';
      var name = current();
      writeFirma(ta, name);
      if (name) store(key, name);
    }

    var existing = readFirma(ta.value);
    var start = existing || (isNewTopic() ? (store(key) || '') : '');
    if (!libera && firme.length && start !== existing && firme.indexOf(start) === -1) start = '';
    if (!libera && firme.length && !start) start = firme[0];
    if (start && firme.indexOf(start) !== -1) sel.value = start;
    else if (start && libera) { sel.value = '__altro__'; other.value = start; }
    else if (start) { opt(start, start); sel.value = start; }
    else sel.value = '';

    sel.onchange = apply;
    other.oninput = apply;
    apply();

    box.appendChild(lbl);
    box.appendChild(sel);
    box.appendChild(other);
    box.appendChild(hint);
    ta.parentNode.insertBefore(box, ta);
  }

  function isNewTopic() {
    return document.body.classList.contains('new-topic');
  }

  /* ── VISUALIZZAZIONE ── */
  /* Toglie la riga "Firma: ..." dall'inizio del testo e restituisce il nome */
  function extractFromColor(color) {
    var nodes = [], n = color.firstChild, text = '';
    while (n) {
      if (n.nodeType === 1 && n.tagName === 'BR') break;
      if (n.nodeType === 1 && n.tagName === 'IMG') return '';
      text += n.textContent;
      nodes.push(n);
      if (text.replace(/^\s+/, '').length > 120) return '';
      n = n.nextSibling;
    }
    var m = text.match(/^\s*Firma\s*:\s*(.+?)\s*$/i);
    if (!m) return '';
    for (var i = 0; i < nodes.length; i++) color.removeChild(nodes[i]);
    if (n && n.tagName === 'BR') {
      var next = n.nextSibling;
      color.removeChild(n);
      while (next && next.nodeType === 3 && !next.textContent.trim()) next = next.nextSibling;
      if (next && next.nodeType === 1 && next.tagName === 'BR' && !color.firstElementChild) color.removeChild(next);
    }
    while (color.firstChild && color.firstChild.nodeType === 3 && !color.firstChild.textContent.trim()) color.removeChild(color.firstChild);
    if (color.firstChild && color.firstChild.nodeType === 1 && color.firstChild.tagName === 'BR') color.removeChild(color.firstChild);
    return m[1];
  }

  function applyToArticle(li) {
    if (li.getAttribute('data-rdz')) return;
    li.setAttribute('data-rdz', '1');
    var color = li.querySelector('.center .color');
    if (!color) return;
    var name = extractFromColor(color);
    if (!name) return;
    var who = li.querySelector('.title2.top .who');
    if (!who) return;
    var link = who.querySelector('a');
    var span = document.createElement('span');
    span.className = 'rdz-name';
    span.textContent = name;
    if (link) link.parentNode.replaceChild(span, link);
    else who.appendChild(span);
    li.setAttribute('data-firma', name);
  }

  function initDisplay() {
    if (document.body.id !== 'blog') return;
    var list = document.body.classList.contains('articles_list');
    var items = document.querySelectorAll('.skin_tbl > ol > li.article');
    for (var i = 0; i < items.length; i++) {
      if (!list && i > 0) break;
      applyToArticle(items[i]);
    }
  }

  function run() {
    var cfg = config();
    if (!cfg) return;
    initEditor(cfg);
    initDisplay();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
