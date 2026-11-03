/* Box dei tag in fondo ai post - v1.0.0 (desktop e mobile) */
(function () {
  'use strict';

  /* Configurazione */
  // Contenitore del testo del post, provati in ordine (il primo che trova vince)
  var CONTENITORI = ['.post .color', '.post .text', '.post .content', '.post'];
  // Tag utenti e tag gruppi
  var TAG = 'mark[data-uid], mark[data-gid]';
  // Dentro questi blocchi i tag non vengono raccolti
  var ESCLUDI = '.quote, .code, .spoiler, .signature, .tagbox';
  // 'testo'  nel post resta il nome senza stile, il tag finisce nel box
  // 'sposta' il tag sparisce dal post e finisce nel box
  // 'copia'  il tag resta dov'è e compare anche nel box
  var MODO = 'testo';
  var TITOLO = 'utenti e gruppi taggati';

  function corrisponde(el, sel) {
    var f = el.matches || el.msMatchesSelector || el.webkitMatchesSelector;
    return f ? f.call(el, sel) : false;
  }

  function trovaPost(el) {
    for (var s = 0; s < CONTENITORI.length; s++) {
      var p = el.parentNode;
      while (p && p.nodeType === 1) {
        if (corrisponde(p, CONTENITORI[s])) return p;
        p = p.parentNode;
      }
    }
    return null;
  }

  function dentroEscluso(el, box) {
    var p = el.parentNode;
    while (p && p !== box) {
      if (p.nodeType === 1 && corrisponde(p, ESCLUDI)) return true;
      p = p.parentNode;
    }
    return false;
  }

  function chiave(el) {
    var k = el.getAttribute('data-uid');
    if (k) return 'u' + k;
    k = el.getAttribute('data-gid');
    if (k) return 'g' + k;
    k = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    return 't' + k;
  }

  function costruisciBox(box, copie) {
    var wrap = document.createElement('div');
    wrap.className = 'tagbox';

    var tit = document.createElement('div');
    tit.className = 'tagbox-tit';
    tit.textContent = TITOLO;
    wrap.appendChild(tit);

    var lista = document.createElement('div');
    lista.className = 'tagbox-lista';
    for (var j = 0; j < copie.length; j++) {
      var chip = document.createElement('span');
      chip.className = 'tagbox-chip';
      chip.appendChild(copie[j]);
      lista.appendChild(chip);
      if (j < copie.length - 1) lista.appendChild(document.createTextNode(' '));
    }
    wrap.appendChild(lista);

    var firma = box.querySelector('.signature');
    if (firma && firma.parentNode === box) {
      box.insertBefore(wrap, firma);
    } else {
      box.appendChild(wrap);
    }
  }

  function avvia() {
    var tutti = document.querySelectorAll(TAG);
    var posts = [];
    var gruppi = [];

    // Raggruppa i tag per post
    for (var i = 0; i < tutti.length; i++) {
      var el = tutti[i];
      var box = trovaPost(el);
      if (!box || box.getAttribute('data-tagbox')) continue;
      if (dentroEscluso(el, box)) continue;
      var idx = -1;
      for (var p = 0; p < posts.length; p++) {
        if (posts[p] === box) { idx = p; break; }
      }
      if (idx === -1) { posts.push(box); gruppi.push([]); idx = posts.length - 1; }
      gruppi[idx].push(el);
    }

    // Per ogni post: raccoglie, toglie i doppioni, costruisce il box
    for (var b = 0; b < posts.length; b++) {
      try {
        var visti = {};
        var copie = [];
        var tags = gruppi[b];
        for (var t = 0; t < tags.length; t++) {
          var tg = tags[t];
          if (!tg.parentNode) continue;
          var k = chiave(tg);
          if (!visti[k]) { visti[k] = true; copie.push(tg.cloneNode(true)); }
          if (MODO === 'sposta') {
            tg.parentNode.removeChild(tg);
          } else if (MODO === 'testo') {
            tg.parentNode.replaceChild(document.createTextNode(tg.textContent), tg);
          }
        }
        posts[b].setAttribute('data-tagbox', '1');
        if (copie.length) costruisciBox(posts[b], copie);
      } catch (e) { console.warn('[tagbox]', e); }
    }
  }

  // Richiamabile a mano se un post arriva dopo il caricamento
  window.tagBox = avvia;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', avvia);
  } else {
    avvia();
  }
})();
