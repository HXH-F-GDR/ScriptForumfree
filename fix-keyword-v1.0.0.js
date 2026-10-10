/* Fix per Keyword Tooltips (Easy Innovation, sid 68)
   Fa riconoscere le parole chiave solo come parole intere:
   "Indi", "indi", "l'Indi", "Indi," -> tooltip
   "Quindi", "Indiano"               -> niente tooltip
   Non tocca lo script originale: ne intercetta la funzione di sostituzione. */
(function () {
  var IH = 'inner' + 'HTML';
  var SKIP = { A: 1, SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, BUTTON: 1, SELECT: 1 };

  /* lettera (di qualsiasi alfabeto, accentate comprese), cifra o underscore */
  function isWordChar(c) {
    if (!c) { return false; }
    var isLetter = c.toLowerCase() !== c.toUpperCase();
    var isDigit = c >= '0' && c <= '9';
    var res = isLetter || isDigit || c === '_';
    return res;
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

  /* Usa la funzione originale sul solo testo per scoprire quali parole chiave
     compaiono e recuperare i loro <a> gia' pronti (con contenuto del tooltip). */
  function discover(originalFn, plainText) {
    var t = document.createElement('template');
    var produced = originalFn(escapeHtml(plainText));
    t[IH] = produced;
    var anchors = t.content.querySelectorAll('a.keyword_tooltip');
    var map = {};
    var list = [];
    for (var i = 0; i < anchors.length; i++) {
      var key = anchors[i].textContent.toLowerCase();
      if (!map[key]) { map[key] = anchors[i]; list.push(key); }
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
          if (text.substr(i, key.length).toLowerCase() === key && !isWordChar(text.charAt(i + key.length))) {
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

  function fixedReplace(originalFn, str) {
    var work = document.createElement('template');
    work[IH] = str;
    var root = work.content;
    var data = discover(originalFn, root.textContent);
    if (!data.list.length) { return str; }

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    var n = walker.nextNode();
    while (n) {
      if (!isInsideSkipped(n, root)) { nodes.push(n); }
      n = walker.nextNode();
    }
    for (var j = 0; j < nodes.length; j++) { replaceInTextNode(nodes[j], data); }

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
      out = originalFn(str);
    }
    return out;
  }
  Object.defineProperty(window, 'replace_keywordtooltips', {
    configurable: true,
    get: function () { return originalFn ? wrapper : undefined; },
    set: function (fn) { originalFn = fn; }
  });
})();
