/* Box inattivi v2.0.1 (desktop e mobile): sostituisce inattivi-v1.0.0.js (solo aggancio)
   v2.0.1: l'ID dell'utente si legge anche dal menu mobile (li.user_details a.nickname)
   Controlla su Firebase se l'utente loggato e' segnato come inattivo dal Pannello Inattivi:
   se si', aggiunge .inattivo al body (il CSS mostra #inattivi solo in quel caso)
   e aggancia il box 10px sotto il .menuwrap.
   La risposta resta in localStorage per 10 minuti.
   Test: localStorage inattivoForce = "1" mostra sempre il box. */

(function () {
  if (window.__hxhInattivi) return;
  window.__hxhInattivi = true;

  var DB = 'https://spam-limitato-e-illimitato-default-rtdb.europe-west1.firebasedatabase.app';
  var CACHE_KEY = 'hxh-inattivo';
  var DURATA = 10 * 60 * 1000;
  var DISTANZA = 10;

  function quandoPronto(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function mioId() {
    // Desktop: link al profilo nel .menuwrap; mobile: nickname nel menu utente
    var a = document.querySelector('.menuwrap a[class^="user"][href*="MID="]') ||
            document.querySelector('li.user_details a.nickname[href*="MID="]');
    if (!a) return null;
    var m = /MID=(\d+)/.exec(a.getAttribute('href') || '');
    var id = m ? m[1] : null;
    return id;
  }

  function leggiCache(id) {
    var esito = null;
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (c && c.id === id && (Date.now() - c.t) < DURATA) esito = c.v === true;
    } catch (e) {}
    return esito;
  }

  function salvaCache(id, v) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ id: id, v: v, t: Date.now() })); } catch (e) {}
  }

  // Aggancio del box sotto il menuwrap
  function aggancia() {
    var box = document.getElementById('inattivi');
    var menu = document.querySelector('.menuwrap');
    if (!box || !menu || box.offsetHeight === 0) return;
    box.style.marginTop = '0px';
    var scorrimento = window.pageYOffset || document.documentElement.scrollTop || 0;
    var fisso = window.getComputedStyle(menu).position === 'fixed';
    var fondoMenu = menu.getBoundingClientRect().bottom + (fisso ? 0 : scorrimento);
    var cimaBox = box.getBoundingClientRect().top + scorrimento;
    var spazio = Math.round(fondoMenu + DISTANZA - cimaBox);
    box.style.marginTop = (spazio > 0 ? spazio : 0) + 'px';
  }

  function applica(v) {
    if (v) {
      document.body.classList.add('inattivo');
      aggancia();
    } else {
      document.body.classList.remove('inattivo');
    }
  }

  function avvia() {
    var forza = null;
    try { forza = localStorage.getItem('inattivoForce'); } catch (e) {}
    if (forza === '1') { applica(true); return; }

    var id = mioId();
    if (!id) return;

    var c = leggiCache(id);
    if (c !== null) { applica(c); return; }

    var x = new XMLHttpRequest();
    x.open('GET', DB + '/inattivi/' + id + '.json');
    x.onload = function () {
      if (x.status !== 200) return;
      var v = false;
      try { v = JSON.parse(x.responseText) === true; } catch (e) {}
      salvaCache(id, v);
      applica(v);
    };
    x.send();
  }

  quandoPronto(function () {
    avvia();
    var menu = document.querySelector('.menuwrap');
    if (menu && window.ResizeObserver) new ResizeObserver(aggancia).observe(menu);
  });
  window.addEventListener('load', aggancia);
  window.addEventListener('resize', aggancia);
})();
