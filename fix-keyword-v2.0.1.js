/* Fix per Keyword Tooltips (Easy Innovation, sid 68)
   - parole chiave riconosciute solo come parole intere ("Indi" si', "Quindi" no)
   - apostrofo dritto e tipografico equivalenti, nessun blocco per nomi "strani"
   - popup senza apri/chiudi a raffica
   - PAROLE EXTRA: oltre a quelle di Easy Innovation (max 80) legge la lista
     window.HXH_KEYWORDS dal file keyword-tooltips-lista.js su GitHub
   Non tocca lo script originale: ne intercetta le funzioni. */
(function () {
  /* Se la copia del bundle mobile e' gia' caricata, gira una sola copia */
  if (window.__hxhKeywordFix) return;
  window.__hxhKeywordFix = true;

  var IH = 'inner' + 'HTML';
  var SKIP = { A: 1, SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, BUTTON: 1, SELECT: 1 };

  /* ---------- POPUP: niente apri/chiudi a raffica ----------
     L'originale accoda un fadeIn per ogni parola sfiorata col mouse, senza
     mai annullarlo. Qui il popup si apre solo se il mouse resta fermo sulla
     parola per un attimo, e passare sopra altre parole annulla le aperture
     in sospeso. Le funzioni vengono "bloccate" su window, cosi' funziona sia
     che l'originale parta prima sia che parta dopo. */
  var SHOW_DELAY = 350; /* ms fermi sulla parola prima di aprire */
  var HIDE_DELAY = 300; /* ms prima di chiudere (per poter entrare nel popup) */
  var FADE = 150;
  var showTimer = null;

  function calcDim(el, top) {
    var b = 0;
    while (el) {
      b += top ? el.offsetTop : el.offsetLeft;
      el = el.offsetParent;
    }
    return b;
  }

  function fadePopup(show) {
    var p = document.getElementById('keyword_popup');
    if (!p) { return; }
    var jq = window.jQuery;
    if (!jq) { p.style.display = show ? '' : 'none'; return; }
    var hidden = p.style.display === 'none' || window.getComputedStyle(p).display === 'none';
    if (show) {
      if (hidden) { jq(p).stop(true, true).fadeIn(FADE); }
      else { jq(p).stop(true).fadeTo(FADE, 1); }
    } else if (!hidden) {
      jq(p).stop(true).fadeOut(FADE);
    }
  }

  function fillPopup(a) {
    var p = document.getElementById('keyword_popup');
    var title = document.getElementById('keyword_popup_title');
    var text = document.getElementById('keyword_popup_text');
    if (!p || !title || !text) { return false; }
    title[IH] = a[IH];
    text[IH] = unescape(a.getAttribute('data-keywordtooltip') || '');
    p.style.left = calcDim(a, false) + 'px';
    p.style.top = (calcDim(a, true) + 35) + 'px';
    return true;
  }

  function fixedShow(a) {
    clearTimeout(window.key_timeout);
    clearTimeout(showTimer);
    showTimer = setTimeout(function () {
      showTimer = null;
      if (fillPopup(a)) { fadePopup(true); }
    }, SHOW_DELAY);
  }

  function fixedHide() {
    clearTimeout(showTimer);
    showTimer = null;
    clearTimeout(window.key_timeout);
    window.key_timeout = setTimeout(function () { fadePopup(false); }, HIDE_DELAY);
  }

  function lockGlobal(name, fn) {
    try {
      Object.defineProperty(window, name, {
        configurable: true,
        get: function () { return fn; },
        set: function () {}
      });
    } catch (e) {
      window[name] = fn;
    }
  }
  lockGlobal('show_keywordtooltips', fixedShow);
  lockGlobal('hide_keywordtooltips', fixedHide);

  /* lettera (di qualsiasi alfabeto, accentate comprese), cifra o underscore */
  function isWordChar(c) {
    if (!c) { return false; }
    var isLetter = c.toLowerCase() !== c.toUpperCase();
    var isDigit = c >= '0' && c <= '9';
    var res = isLetter || isDigit || c === '_';
    return res;
  }

  /* ---------- apostrofi e caratteri speciali nei nomi ----------
     L'originale trasforma ogni nome con btoa(), che va in errore con
     apostrofi tipografici, trattini lunghi, emoji ecc. e blocca tutto lo
     script. Mentre gira l'originale sostituiamo btoa con una versione che
     accetta qualsiasi carattere e produce solo cifre (cosi' nessuna parola
     chiave puo' "agganciarsi" dentro i segnaposto). */
  function safeToken(s) {
    var out = '';
    s = String(s);
    for (var i = 0; i < s.length; i++) { out += s.charCodeAt(i) + '_'; }
    return out;
  }
  function callOriginal(fn, s) {
    var saved = window.btoa;
    var res;
    window.btoa = safeToken;
    try {
      res = fn(s);
    } finally {
      window.btoa = saved;
    }
    return res;
  }
  /* apostrofo dritto e tipografico contano come uguali */
  function normApos(s) {
    var out = s.replace(/[‘’ʼ]/g, "'");
    return out;
  }

  function isUpper(c) {
    var res = !!c && c !== c.toLowerCase();
    return res;
  }

  function escapeHtml(s) {
    var out = s.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');
    return out;
  }

  function isInsideSkipped(node, root) {
    var p = node.parentNode;
    while (p && p !== root) {
      if (p.nodeName && SKIP[p.nodeName.toUpperCase()]) { return true; }
      p = p.parentNode;
    }
    return false;
  }

  /* ---------- PAROLE EXTRA (lista su GitHub) ----------
     window.HXH_KEYWORDS = [ { parola, immagine, pack, campi: [...] }, ... ]
     window.HXH_KEYWORD_PACKS = { "Nome pack": "link al topic", ... }
     Se una parola e' sia qui sia su Easy Innovation, vince questa lista. */
  var extraCache = null;

  /* stessa codifica dell'originale (%uXXXX), letta poi con unescape() */
  function toUnicode(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var h = s.charCodeAt(i).toString(16).toUpperCase();
      while (h.length < 4) { h = '0' + h; }
      out += '%u' + h;
    }
    return out;
  }

  /* costruisce l'HTML del popup con la stessa grafica delle voci di Easy Innovation */
  function buildContent(it, packs) {
    if (it.contenuto) { return String(it.contenuto); }
    var h = '';
    if (it.immagine) {
      h += '<div style="background-image: url(' + it.immagine + '); background-repeat: no-repeat; width: 300px; height: 300px;border-radius: 10px; border: 2px solid Gainsboro"></div><br>';
    }
    var campi = it.campi || [];
    for (var i = 0; i < campi.length; i++) {
      var c = campi[i];
      if (typeof c === 'string') { h += c + '<br>'; }
      else if (c && c.length) { h += '<b>' + c[0] + ':</b> ' + (c.length > 1 ? c[1] : '') + '<br>'; }
    }
    if (it.pack) {
      var link = packs[it.pack];
      h += '<b>Expansion Pack: </b>' + (link ? '<a href="' + link + '">' + it.pack + '</a>' : it.pack);
    }
    return h;
  }

  function makeAnchor(parola, contenuto) {
    var a = document.createElement('a');
    a.className = 'keyword_tooltip';
    a.setAttribute('on' + 'mouseover', 'window.show_keywordtooltips(this)');
    a.setAttribute('on' + 'mouseout', 'window.hide_keywordtooltips()');
    a.setAttribute('data-keywordtooltip', toUnicode(contenuto));
    a.appendChild(document.createTextNode(parola));
    return a;
  }

  function getExtras() {
    if (extraCache) { return extraCache; }
    var src = window.HXH_KEYWORDS;
    if (!src || !src.length) { return []; }
    var packs = window.HXH_KEYWORD_PACKS || {};
    var out = [];
    for (var i = 0; i < src.length; i++) {
      var it = src[i];
      if (!it || !it.parola) { continue; }
      try {
        out.push({
          key: normApos(String(it.parola).toLowerCase()),
          anchor: makeAnchor(String(it.parola), buildContent(it, packs))
        });
      } catch (e) {
        console.error('[Keyword Tooltips fix] voce non valida:', it, e);
      }
    }
    extraCache = out;
    return out;
  }

  /* Trova le parole chiave presenti nel testo e prepara i loro <a>:
     quelle di Easy Innovation (chiedendole alla funzione originale) e quelle
     della lista extra. */
  function discover(originalFn, plainText) {
    var map = {};
    var list = [];
    var i;
    if (originalFn) {
      /* il testo viene provato anche con gli apostrofi scambiati, cosi' si
         trovano le parole chiave scritte con l'uno o con l'altro */
      var variants = [plainText, normApos(plainText), plainText.split("'").join('’')];
      for (var v = 0; v < variants.length; v++) {
        var t = document.createElement('template');
        var produced = callOriginal(originalFn, escapeHtml(variants[v]));
        t[IH] = produced;
        var anchors = t.content.querySelectorAll('a.keyword_tooltip');
        for (i = 0; i < anchors.length; i++) {
          var key = normApos(anchors[i].textContent.toLowerCase());
          if (!map[key]) { map[key] = anchors[i]; list.push(key); }
        }
      }
    }
    var extras = getExtras();
    if (extras.length) {
      var normText = normApos(plainText.toLowerCase());
      for (i = 0; i < extras.length; i++) {
        var ex = extras[i];
        if (normText.indexOf(ex.key) === -1) { continue; }
        if (!map[ex.key]) { list.push(ex.key); }
        map[ex.key] = ex.anchor;
      }
    }
    /* prima le parole piu' lunghe, come fa l'originale */
    list.sort(function (a, b) { return b.length - a.length; });
    var res = { map: map, list: list };
    return res;
  }

  function replaceInTextNode(node, data) {
    var text = node.nodeValue;
    var frag = null;
    var last = 0;
    var i = 0;
    while (i < text.length) {
      var found = null;
      if (!isWordChar(text.charAt(i - 1))) {
        for (var k = 0; k < data.list.length; k++) {
          var key = data.list[k];
          if (normApos(text.substr(i, key.length).toLowerCase()) === key && !isWordChar(text.charAt(i + key.length))) {
            found = key;
            break;
          }
        }
      }
      if (found) {
        if (!frag) { frag = document.createDocumentFragment(); }
        if (i > last) { frag.appendChild(document.createTextNode(text.slice(last, i))); }
        frag.appendChild(document.importNode(data.map[found], true));
        i += found.length;
        last = i;
      } else {
        i++;
      }
    }
    if (frag) {
      if (last < text.length) { frag.appendChild(document.createTextNode(text.slice(last))); }
      node.parentNode.replaceChild(frag, node);
    }
  }

  function processRoot(root, data) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    var n = walker.nextNode();
    while (n) {
      if (!isInsideSkipped(n, root)) { nodes.push(n); }
      n = walker.nextNode();
    }
    for (var j = 0; j < nodes.length; j++) { replaceInTextNode(nodes[j], data); }
  }

  function fixedReplace(originalFn, str) {
    var work = document.createElement('template');
    work[IH] = str;
    var root = work.content;
    var data = discover(originalFn, root.textContent);
    if (!data.list.length) { return str; }
    processRoot(root, data);
    var out = work[IH];
    return out;
  }

  /* Ripiego se questo script parte DOPO l'originale:
     toglie i tooltip finiti dentro altre parole. */
  function cleanupExisting() {
    var anchors = document.querySelectorAll('.color a.keyword_tooltip');
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      var prev = a.previousSibling;
      var next = a.nextSibling;
      var pc = (prev && prev.nodeType === 3) ? prev.nodeValue.charAt(prev.nodeValue.length - 1) : '';
      var nc = (next && next.nodeType === 3) ? next.nodeValue.charAt(0) : '';
      if (!isWordChar(pc) && !isWordChar(nc)) { continue; }

      /* l'originale ha sostituito il testo con la parola scritta come nelle
         impostazioni ("QuIndi"): proviamo a ricostruire le maiuscole */
      var txt = a.textContent;
      if (isWordChar(pc)) {
        txt = (isUpper(pc) && (isUpper(nc) || !isWordChar(nc))) ? txt.toUpperCase() : txt.toLowerCase();
      } else {
        txt = txt.charAt(0) + txt.slice(1).toLowerCase();
      }
      var parent = a.parentNode;
      parent.replaceChild(document.createTextNode(txt), a);
      parent.normalize();
    }
    /* e aggiunge comunque le parole della lista extra, direttamente sulla pagina */
    var posts = document.querySelectorAll('.color');
    for (var p = 0; p < posts.length; p++) {
      var data = discover(null, posts[p].textContent);
      if (data.list.length) { processRoot(posts[p], data); }
    }
  }

  if (typeof window.replace_keywordtooltips === 'function') {
    /* l'originale e' gia' passato */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cleanupExisting);
    } else {
      cleanupExisting();
    }
    return;
  }

  /* Trappola: quando l'originale definisce la sua funzione, la teniamo da parte
     e al suo posto gli restituiamo la versione corretta. */
  var originalFn = null;
  function wrapper(str) {
    var out;
    try {
      out = fixedReplace(originalFn, str);
    } catch (e) {
      console.error('[Keyword Tooltips fix]', e);
      out = callOriginal(originalFn, str);
    }
    return out;
  }
  Object.defineProperty(window, 'replace_keywordtooltips', {
    configurable: true,
    get: function () { return originalFn ? wrapper : undefined; },
    set: function (fn) { originalFn = fn; }
  });
})();
