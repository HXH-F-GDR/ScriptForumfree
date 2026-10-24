/* Redazioni: firme e date degli articoli v1.1.0
   Configurazione (nell'HTML del forum, prima di questo script):

   var REDAZIONI_FIRME = {
     '65121577': { nome: 'La Spina', firme: ['Spina Dorsale', 'Alla Spina'], libera: false }
   };

   - la chiave è il numero della sezione (quello dopo ?f=)
   - firme: i nomi proposti nel menu
   - libera: true aggiunge "Altro..." per scrivere una firma qualsiasi (es. il nome del proprio PG)

   Funzionamento: nell'editor del primo messaggio di un articolo compaiono il menu "Firma come"
   e il campo "Data". Le scelte vengono scritte come prime righe del testo ("Firma: Nome",
   "Data: 14/03/2017"); nella sezione le righe vengono nascoste, il nome sostituisce il
   nickname dell'account e la data sostituisce quella di pubblicazione reale. */
(function() {
  var HEAD_RE = /^[ \t]*(Firma|Data)[ \t]*:[ \t]*([^\r\n]*)(\r?\n|$)/i;
  var MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];

  /* "14/03/2017" o "2017-03-14" -> {d, m, y} */
  function parseData(str) {
    var s = String(str || '').trim(), m;
    if ((m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/))) return valid(+m[1], +m[2], +m[3]);
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return valid(+m[3], +m[2], +m[1]);
    return null;
  }
  function valid(d, m, y) {
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    var dt = new Date(y, m - 1, d);
    if (dt.getMonth() !== m - 1) return null;
    return {d: d, m: m, y: y};
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function toIso(o) { return o ? o.y + '-' + pad(o.m) + '-' + pad(o.d) : ''; }
  function toLine(o) { return o ? pad(o.d) + '/' + pad(o.m) + '/' + o.y : ''; }

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
  /* Legge le righe "Firma:" e "Data:" all'inizio del testo */
  function readHead(text) {
    var out = {firma: '', data: ''}, v = String(text || ''), m, guard = 0;
    while ((m = v.match(HEAD_RE)) && guard++ < 4) {
      out[m[1].toLowerCase()] = m[2].trim();
      v = v.slice(m[0].length);
    }
    out.rest = v;
    return out;
  }
  function writeHead(ta, firma, data) {
    var h = readHead(ta.value), lines = '';
    if (firma) lines += 'Firma: ' + firma + '\n';
    if (data) lines += 'Data: ' + data + '\n';
    ta.value = lines + h.rest;
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
    var dlbl = document.createElement('label');
    dlbl.textContent = 'Data:';
    dlbl.style.cssText = 'font-weight:bold;margin:0 0 0 8px;';
    var date = document.createElement('input');
    date.type = 'date';
    date.min = '1900-01-01';
    date.style.cssText = 'padding:3px 6px;font-size:13px;';
    var hint = document.createElement('span');
    hint.style.cssText = 'font-size:11px;opacity:0.75;width:100%;';
    hint.textContent = 'Firma e data vengono salvate come prime righe del testo e mostrate al posto di nickname e data reale. Lascia la data vuota per usare quella di pubblicazione.';
    var dkey = 'rdz_data_' + cfg.id;

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
      var d = parseData(date.value);
      writeHead(ta, name, toLine(d));
      if (name) store(key, name);
      store(dkey, date.value || '');
    }

    var head = readHead(ta.value);
    var existing = head.firma;
    var startData = head.data ? parseData(head.data) : (isNewTopic() ? parseData(store(dkey) || '') : null);
    date.value = toIso(startData);
    var start = existing || (isNewTopic() ? (store(key) || '') : '');
    if (!libera && firme.length && start !== existing && firme.indexOf(start) === -1) start = '';
    if (!libera && firme.length && !start) start = firme[0];
    if (start && firme.indexOf(start) !== -1) sel.value = start;
    else if (start && libera) { sel.value = '__altro__'; other.value = start; }
    else if (start) { opt(start, start); sel.value = start; }
    else sel.value = '';

    sel.onchange = apply;
    other.oninput = apply;
    date.onchange = apply;
    date.oninput = apply;
    apply();

    box.appendChild(lbl);
    box.appendChild(sel);
    box.appendChild(other);
    box.appendChild(dlbl);
    box.appendChild(date);
    box.appendChild(hint);
    ta.parentNode.insertBefore(box, ta);
  }

  function isNewTopic() {
    return document.body.classList.contains('new-topic');
  }

  /* ── VISUALIZZAZIONE ── */
  /* Toglie la prima riga del testo se è "Firma: ..." o "Data: ..." e la restituisce */
  function takeLine(color) {
    var nodes = [], n = color.firstChild, text = '';
    while (n && n.nodeType === 3 && !n.textContent.trim()) n = n.nextSibling;
    var first = n;
    while (n) {
      if (n.nodeType === 1 && n.tagName === 'BR') break;
      if (n.nodeType === 1 && n.tagName === 'IMG') return null;
      text += n.textContent;
      nodes.push(n);
      if (text.length > 140) return null;
      n = n.nextSibling;
    }
    var m = text.match(/^\s*(Firma|Data)\s*:\s*(.+?)\s*$/i);
    if (!m) return null;
    var c = color.firstChild;
    while (c && c !== first) { var nx = c.nextSibling; color.removeChild(c); c = nx; }
    for (var i = 0; i < nodes.length; i++) color.removeChild(nodes[i]);
    if (n && n.tagName === 'BR') color.removeChild(n);
    return {key: m[1].toLowerCase(), value: m[2]};
  }

  function setDate(li, o) {
    var when = li.querySelector('.title2.top .when');
    if (!when) return;
    while (when.firstChild) when.removeChild(when.firstChild);
    var parts = [['', 'il'], ['d_day', String(o.d)], ['d_month', MESI[o.m - 1]], ['d_year', String(o.y)]];
    for (var i = 0; i < parts.length; i++) {
      var sp = document.createElement('span');
      if (parts[i][0]) sp.className = parts[i][0];
      sp.textContent = parts[i][1];
      when.appendChild(sp);
      if (i < parts.length - 1) when.appendChild(document.createTextNode(' '));
    }
    li.setAttribute('data-data', toIso(o));
  }

  function applyToArticle(li) {
    if (li.getAttribute('data-rdz')) return;
    li.setAttribute('data-rdz', '1');
    var color = li.querySelector('.center .color');
    if (!color) return;
    var head = {}, line, guard = 0;
    while ((line = takeLine(color)) && guard++ < 4) head[line.key] = line.value;
    var br = color.firstChild;
    while (br && br.nodeType === 3 && !br.textContent.trim()) br = br.nextSibling;
    if (guard && br && br.nodeType === 1 && br.tagName === 'BR') color.removeChild(br);
    if (head.firma) {
      var who = li.querySelector('.title2.top .who');
      if (who) {
        var link = who.querySelector('a');
        var span = document.createElement('span');
        span.className = 'rdz-name';
        span.textContent = head.firma;
        if (link) link.parentNode.replaceChild(span, link);
        else who.appendChild(span);
        li.setAttribute('data-firma', head.firma);
      }
    }
    var d = parseData(head.data);
    if (d) setDate(li, d);
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
