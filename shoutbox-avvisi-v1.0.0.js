/* ============================================================
   Avvisi Shoutbox (desktop e mobile) - v1.0.0
   Legge gli avvisi dal nodo shoutAvvisi su Firebase (gestiti dalla
   pagina staff Pannello Avvisi) e ne mette uno in cima a Hello Box.
   - un solo avviso valido: resta sempre quello
   - piu' avvisi validi: uno a caso a ogni pagina
   - nessun avviso valido: non si vede nulla
   Valido = attivo e non scaduto (la scadenza vale fino a fine giornata).
   L'ultima lista letta resta in localStorage, cosi' l'avviso compare
   subito alla pagina dopo senza aspettare Firebase.
   Se Hello Box ridisegna i messaggi, l'avviso viene rimesso in cima.
   Stesso file per desktop (tag nel codice del forum) e mobile.
   ============================================================ */
(function () {
  if (window.__hxhShoutAvvisi) return;
  window.__hxhShoutAvvisi = true;

  var DB_URL = 'https://spam-limitato-e-illimitato-default-rtdb.europe-west1.firebasedatabase.app/shoutAvvisi.json';
  var CACHE_KEY = 'hxh-shoutavvisi';
  var HEX = /^#[0-9A-Fa-f]{6}$/;

  var el = null;
  var mostrato = null;
  var osservatore = null;
  var attesa = null;

  // ---------- stile ----------

  var CSS = '' +
    '.hb-message.sha-avviso {--sha: var(--sha-b); position: relative; border-left: 3px solid var(--sha) !important; background: color-mix(in srgb, var(--sha) 12%, transparent) !important}' +
    '.bodyhalloween .hb-message.sha-avviso {--sha: var(--sha-h)}' +
    '.bodynatale .hb-message.sha-avviso {--sha: var(--sha-n)}' +
    '.sha-avviso .hb-nickname, .sha-avviso .hb-nickname a {color: var(--sha) !important; font-weight: 700}' +
    '.sha-avviso .sha-badge {display: inline-block; margin: 0 0 0 6px; padding: 0 6px; border: 1px dashed var(--sha); font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; line-height: 16px; color: var(--sha); vertical-align: middle; white-space: nowrap}' +
    '.sha-avviso .hb-text-content a {color: var(--sha)}' +
    '.sha-avviso .hb-text-content img {max-width: 100%}' +
    'body.ffm .sha-avviso .sha-badge {margin: 2px 0 0 6px}';

  function aggiungiStile() {
    if (document.getElementById('sha-stile')) return;
    var s = document.createElement('style');
    s.id = 'sha-stile';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  // ---------- dati ----------

  function due(n) {
    var s = (n < 10 ? '0' : '') + n;
    return s;
  }

  function oggi() {
    var d = new Date();
    var s = d.getFullYear() + '-' + due(d.getMonth() + 1) + '-' + due(d.getDate());
    return s;
  }

  function leggiCache() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) {}
    return v;
  }

  function salvaCache(dati) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(dati || {})); } catch (e) {}
  }

  function validi(dati) {
    var out = [];
    var g = oggi();
    if (!dati || typeof dati !== 'object') return out;
    for (var k in dati) {
      if (!dati.hasOwnProperty(k)) continue;
      var a = dati[k];
      if (!a || typeof a !== 'object' || a.attivo !== true) continue;
      if (typeof a.testo !== 'string' || !a.testo.replace(/\s/g, '')) continue;
      if (a.scade && String(a.scade) < g) continue;
      out.push({ id: k, a: a });
    }
    return out;
  }

  function aCaso(arr) {
    var x = arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
    return x;
  }

  // ---------- costruzione dell'avviso ----------

  function costruisci(voce) {
    var a = voce.a;
    var acc = a.acc || {};
    var b = HEX.test(acc.b || '') ? acc.b : '#3B8686';
    var h = HEX.test(acc.h || '') ? acc.h : b;
    var n = HEX.test(acc.n || '') ? acc.n : b;
    var nome = String(a.nome || 'Staff');
    var link = String(a.link || '');
    var esterno = /^https?:\/\//i.test(link) && link.indexOf(location.hostname) === -1;

    var m = document.createElement('div');
    m.className = 'hb-message sha-avviso';
    m.setAttribute('data-uid', 'avviso-staff');
    m.setAttribute('data-avviso', voce.id);
    m.style.setProperty('--sha-b', b);
    m.style.setProperty('--sha-h', h);
    m.style.setProperty('--sha-n', n);

    function collegamento() {
      var x = document.createElement('a');
      if (link) {
        x.href = link;
        if (esterno) x.target = '_blank';
      }
      x.title = nome;
      return x;
    }

    if (a.avatar) {
      var la = collegamento();
      var img = document.createElement('img');
      img.className = 'hb-avatar';
      img.alt = nome;
      img.src = String(a.avatar);
      la.appendChild(img);
      m.appendChild(la);
    }

    var body = document.createElement('div');
    body.className = 'hb-body';
    var head = document.createElement('div');
    head.className = 'hb-header';
    var nick = document.createElement('span');
    nick.className = 'hb-nickname';
    var ln = collegamento();
    ln.textContent = nome;
    nick.appendChild(ln);
    if (a.badge) {
      var badge = document.createElement('span');
      badge.className = 'sha-badge';
      badge.textContent = String(a.badge);
      nick.appendChild(badge);
    }
    head.appendChild(nick);
    body.appendChild(head);

    var txt = document.createElement('div');
    txt.className = 'hb-text-content';
    txt['inner' + 'HTML'] = String(a.testo);
    body.appendChild(txt);
    m.appendChild(body);
    return m;
  }

  // ---------- posizione in Hello Box ----------

  function contenitore() {
    var c = document.querySelector('hello-box .hb-messages');
    return c;
  }

  function piazza() {
    var c = contenitore();
    if (!c || !el) return false;
    if (c.firstChild !== el) c.insertBefore(el, c.firstChild);
    return true;
  }

  function sorveglia() {
    if (osservatore) return;
    var hb = document.querySelector('hello-box');
    if (!hb || !window.MutationObserver) return;
    osservatore = new MutationObserver(function () {
      if (!el) return;
      var c = contenitore();
      if (c && c.firstChild !== el) piazza();
    });
    osservatore.observe(hb, { childList: true, subtree: true });
  }

  function aspettaShoutbox() {
    if (attesa) return;
    var giri = 0;
    attesa = setInterval(function () {
      giri++;
      if (piazza()) {
        clearInterval(attesa);
        attesa = null;
        sorveglia();
      } else if (giri > 100) {
        clearInterval(attesa);
        attesa = null;
      }
    }, 300);
  }

  function mostra(voce) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
    el = null;
    mostrato = voce ? voce.id : null;
    if (!voce) return;
    aggiungiStile();
    el = costruisci(voce);
    if (piazza()) sorveglia();
    else aspettaShoutbox();
  }

  // ---------- avvio ----------

  function trova(arr, id) {
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }

  function avvia() {
    var cache = validi(leggiCache());
    if (cache.length) mostra(aCaso(cache));

    fetch(DB_URL, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var j = r.json();
      return j;
    }).then(function (dati) {
      salvaCache(dati);
      var v = validi(dati);
      var stesso = mostrato ? trova(v, mostrato) : null;
      // se l'avviso preso dalla cache e' ancora valido resta lui (aggiornato), altrimenti se ne sceglie un altro
      mostra(stesso || aCaso(v));
    }).catch(function (e) {
      console.warn('[Avvisi Shoutbox]', e);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
  else avvia();
})();
