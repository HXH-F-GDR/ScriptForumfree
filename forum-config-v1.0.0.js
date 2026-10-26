(function () {
  // ============================================================
  // CONFIGURAZIONE FORUM DA FIREBASE
  // Skin alternative e overlay di manutenzione, decisi dal Pannello Forum
  // (pagina staff). Stesso file per desktop (tag nel blocco HTML del forum)
  // e mobile (caricato dal bundle script-mobile).
  //
  // Nodo Firebase: forumConfig = {
  //   skin:         { halloween: true/false, natale: true/false },
  //   manutenzione: { mode: 0/1/2, titolo: "...", messaggio: "...", frasi: [ "...", ... ] }
  // }
  //   mode 0 = overlay spento
  //   mode 1 = entra solo lo staff (admin, g1-g4)
  //   mode 2 = entrano solo gli amministratori (admin, g1)
  //
  // L'ultima configurazione letta resta in localStorage: alla pagina
  // successiva skin e overlay partono subito da li', senza aspettare Firebase.
  // Test: localStorage mntForceUser = "1" (vedi l'overlay) / mntForceStaff = "1" (non lo vedi)
  // ============================================================

  if (window.__hxhForumConfig) return;
  window.__hxhForumConfig = true;

  var DB_URL = 'https://spam-limitato-e-illimitato-default-rtdb.europe-west1.firebasedatabase.app/forumConfig.json';
  var CACHE_KEY = 'hxh-forumconfig';
  var IMG_URL = 'https://upload.forumfree.net/i/ff13982804/Hunter/loading.svg';

  // ---------- utilita' ----------

  function leggiCache() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (e) {}
    return v ? normalizza(v) : null;
  }

  function salvaCache(cfg) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cfg)); } catch (e) {}
  }

  // Firebase puo' restituire le frasi come array o come oggetto: si leggono entrambi
  function normalizza(c) {
    c = c || {};
    var s = c.skin || {};
    var m = c.manutenzione || {};
    var frasi = [];
    var src = m.frasi;
    if (src && typeof src === 'object') {
      for (var k in src) {
        if (src.hasOwnProperty(k) && typeof src[k] === 'string' && src[k].replace(/\s/g, '')) frasi.push(src[k]);
      }
    }
    var mode = parseInt(m.mode, 10);
    if (mode !== 1 && mode !== 2) mode = 0;
    return {
      skin: { halloween: s.halloween === true, natale: s.natale === true },
      manutenzione: { mode: mode, titolo: String(m.titolo || ''), messaggio: String(m.messaggio || ''), frasi: frasi }
    };
  }

  function quandoBody(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function quandoPronto(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function isMobile() {
    return !!(document.body && document.body.classList.contains('ffm'));
  }

  // ============================================================
  // SKIN ALTERNATIVE
  // La skin base e' sempre disponibile; i bottoni compaiono solo se
  // almeno una skin alternativa e' attiva (come skinAttive = 0 prima).
  // Se l'utente aveva scelto una skin che ora e' spenta, torna alla base.
  // ============================================================

  var SKINS = [
    { k: 'def',       cls: 'bodydef',       btn: 'skin-base' },
    { k: 'halloween', cls: 'bodyhalloween', btn: 'skin-halloween' },
    { k: 'natale',    cls: 'bodynatale',    btn: 'skin-natale' }
  ];

  function skinAttiva(cfg, k) {
    return k === 'def' || cfg.skin[k] === true;
  }

  function leggiSkin() {
    var v = null;
    try { v = localStorage.getItem('skin'); } catch (e) {}
    return v;
  }

  function salvaSkin(k) {
    try { localStorage.setItem('skin', k); } catch (e) {}
  }

  function applicaSkin(k) {
    quandoBody(function () {
      for (var i = 0; i < SKINS.length; i++) {
        if (SKINS[i].k === k) document.body.classList.add(SKINS[i].cls);
        else document.body.classList.remove(SKINS[i].cls);
      }
    });
  }

  function scegliSkin(k) {
    applicaSkin(k);
    salvaSkin(k);
  }

  function aggiornaSkin(cfg) {
    var scelta = leggiSkin();
    if (!scelta || !skinAttiva(cfg, scelta)) {
      scelta = 'def';
      salvaSkin('def');
    }
    applicaSkin(scelta);
    disegnaBottoni(cfg);
  }

  // Riprova finche' il punto d'aggancio non compare (max 20 volte ogni 500ms)
  function conAncora(selettore, fn) {
    var tentativi = 0;
    (function prova() {
      var el = document.querySelector(selettore);
      if (el) { fn(el); return; }
      if (++tentativi < 20) setTimeout(prova, 500);
    })();
  }

  function creaBottone(skin) {
    var b = document.createElement('span');
    b.className = 'skin-switcher ' + skin.btn;
    b.setAttribute('data-hxh-skin', skin.k);
    b.onclick = function () { scegliSkin(skin.k); };
    return b;
  }

  var versioneBottoni = 0;

  function disegnaBottoni(cfg) {
    var mia = ++versioneBottoni;
    quandoPronto(function () {
      var mobile = isMobile();
      // desktop: i bottoni vanno direttamente in .menuwrap .right (come prima)
      // mobile: dentro #skin-addon-box in #ff_links (come prima)
      conAncora(mobile ? '#ff_links' : '.menuwrap .right', function (ancora) {
        if (mia !== versioneBottoni) return; // nel frattempo e' arrivata una config piu' nuova

        var vecchi = ancora.querySelectorAll('[data-hxh-skin]');
        for (var i = 0; i < vecchi.length; i++) vecchi[i].parentNode.removeChild(vecchi[i]);
        var box = document.getElementById('skin-addon-box');

        var alternative = cfg.skin.halloween || cfg.skin.natale;
        if (!alternative) {
          if (box && box.parentNode) box.parentNode.removeChild(box);
          return;
        }

        var dove = ancora;
        if (mobile) {
          if (!box) {
            box = document.createElement('div');
            box.id = 'skin-addon-box';
            ancora.appendChild(box);
          }
          dove = box;
        }

        for (var j = 0; j < SKINS.length; j++) {
          if (skinAttiva(cfg, SKINS[j].k)) dove.appendChild(creaBottone(SKINS[j]));
        }
      });
    });
  }

  // ============================================================
  // OVERLAY DI MANUTENZIONE
  // ============================================================

  var ov = null;          // overlay costruito
  var osservatore = null; // guardia che lo rimette se viene tolto
  var giro = null;        // intervallo delle frasi
  var firmaAttuale = '';  // configurazione con cui e' stato costruito

  function preNascondi() {
    if (document.getElementById('mnt-pre')) return;
    var pre = document.createElement('style');
    pre.id = 'mnt-pre';
    pre.appendChild(document.createTextNode('body{visibility:hidden!important;}'));
    (document.head || document.documentElement).appendChild(pre);
    setTimeout(mostraPagina, 6000); // paracadute: se qualcosa va storto, il forum torna visibile
  }

  function mostraPagina() {
    var el = document.getElementById('mnt-pre');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function puoEntrare(mode) {
    try {
      if (localStorage.getItem('mntForceUser') === '1') return false;
      if (localStorage.getItem('mntForceStaff') === '1') return true;
    } catch (e) {}
    var cls = (document.body && document.body.className) || '';
    var re = (mode === 2) ? /\b(admin|g1)\b/ : /\b(admin|g1|g2|g3|g4)\b/;
    return re.test(cls);
  }

  function blocca() {
    var h = document.documentElement, b = document.body;
    if (h && !/\bmnt-lock\b/.test(h.className)) h.className += ' mnt-lock';
    if (b && !/\bmnt-lock\b/.test(b.className)) b.className += ' mnt-lock';
  }

  function sblocca() {
    var els = [document.documentElement, document.body];
    for (var i = 0; i < els.length; i++) {
      if (els[i]) els[i].className = els[i].className.replace(/\s*\bmnt-lock\b/g, '');
    }
  }

  function togliOverlay() {
    if (osservatore) { osservatore.disconnect(); osservatore = null; }
    if (giro) { clearInterval(giro); giro = null; }
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    ov = null;
    sblocca();
  }

  function stili() {
    if (document.getElementById('mnt-style')) return;
    var st = document.createElement('style');
    st.id = 'mnt-style';
    st.appendChild(document.createTextNode(
      // desktop
      'body.mnt-lock *{z-index:auto!important;}' +
      'html.mnt-lock,body.mnt-lock{overflow:hidden!important;height:100%!important;position:relative!important;}' +
      '#mnt-overlay{position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;min-height:100%;z-index:9;background:#ffffff;color:#000000;font-family:\'Montserrat\',sans-serif;overflow:auto;text-align:center;margin:0;padding:0;}' +
      '#mnt-overlay .mnt-box{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;box-sizing:border-box;padding:6vh 20px 8vh;}' +
      '#mnt-overlay .mnt-head{width:100%;max-width:900px;}' +
      '#mnt-overlay h1{font-family:\'Calistoga\',serif;color:#000000;font-size:42px;margin:0 0 14px;line-height:1.2;}' +
      '#mnt-overlay p.mnt-sub{color:#333333;font-size:19px;margin:0;line-height:1.5;}' +
      '#mnt-overlay .mnt-load{flex:1 1 auto;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;}' +
      '#mnt-overlay .mnt-spinner{width:520px;height:416px;max-width:80vw;margin:0 auto 18px;}' +
      '#mnt-overlay .mnt-spinner img{display:block;width:100%;height:100%;}' +
      '#mnt-overlay .mnt-ticker{margin-top:-80px;position:relative;width:100%;max-width:640px;height:72px;overflow:hidden;}' +
      '#mnt-overlay .mnt-ticker span{position:absolute;top:0;left:0;right:0;height:72px;display:flex;align-items:center;justify-content:center;color:#555555;font-size:22px;font-style:italic;line-height:1.3;opacity:0;}' +
      '#mnt-overlay .mnt-ticker span.on{animation:mntSlide 5s ease-in-out forwards;}' +
      '@keyframes mntSlide{0%{opacity:0;transform:translateX(-60px);}12%{opacity:1;transform:translateX(0);}88%{opacity:1;transform:translateX(0);}100%{opacity:0;transform:translateX(60px);}}' +
      // mobile (classe mnt-mob sull'overlay: e' appeso a <html>, fuori da body.ffm)
      '#mnt-overlay.mnt-mob{z-index:2147483647;}' +
      '#mnt-overlay.mnt-mob .mnt-box{padding:5vh 16px 6vh;}' +
      '#mnt-overlay.mnt-mob .mnt-head{max-width:92vw;}' +
      '#mnt-overlay.mnt-mob h1{font-size:26px;margin:0 0 10px;}' +
      '#mnt-overlay.mnt-mob p.mnt-sub{font-size:15px;line-height:1.45;}' +
      '#mnt-overlay.mnt-mob .mnt-spinner{width:220px;height:176px;max-width:70vw;margin:0 auto 4px;}' +
      '#mnt-overlay.mnt-mob .mnt-ticker{margin-top:-30px;max-width:88vw;height:64px;}' +
      '#mnt-overlay.mnt-mob .mnt-ticker span{height:64px;font-size:17px;}' +
      '#mnt-overlay.mnt-mob .mnt-ticker span.on{animation-name:mntSlideM;}' +
      '@keyframes mntSlideM{0%{opacity:0;transform:translateX(-40px);}12%{opacity:1;transform:translateX(0);}88%{opacity:1;transform:translateX(0);}100%{opacity:0;transform:translateX(40px);}}'
    ));
    (document.head || document.documentElement).appendChild(st);
  }

  function mescola(arr) {
    for (var j = arr.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = arr[j]; arr[j] = arr[k]; arr[k] = tmp;
    }
    return arr;
  }

  // I testi arrivano da Firebase: sempre come testo, mai come HTML.
  // Gli a capo del messaggio diventano <br>.
  function testoConACapo(el, testo) {
    var righe = testo.split(/\r?\n/);
    for (var i = 0; i < righe.length; i++) {
      if (i > 0) el.appendChild(document.createElement('br'));
      el.appendChild(document.createTextNode(righe[i]));
    }
  }

  function costruisciOverlay(m) {
    stili();

    ov = document.createElement('div');
    ov.id = 'mnt-overlay';
    if (isMobile()) ov.className = 'mnt-mob';

    var box = document.createElement('div');
    box.className = 'mnt-box';

    var head = document.createElement('div');
    head.className = 'mnt-head';
    var h1 = document.createElement('h1');
    h1.textContent = m.titolo;
    var sub = document.createElement('p');
    sub.className = 'mnt-sub';
    testoConACapo(sub, m.messaggio);
    head.appendChild(h1);
    head.appendChild(sub);

    var load = document.createElement('div');
    load.className = 'mnt-load';
    var spinner = document.createElement('div');
    spinner.className = 'mnt-spinner';
    var img = document.createElement('img');
    img.src = IMG_URL;
    img.alt = '';
    spinner.appendChild(img);
    load.appendChild(spinner);

    var spans = [];
    if (m.frasi.length) {
      var ticker = document.createElement('div');
      ticker.className = 'mnt-ticker';
      for (var i = 0; i < m.frasi.length; i++) {
        var s = document.createElement('span');
        s.textContent = m.frasi[i];
        ticker.appendChild(s);
        spans.push(s);
      }
      load.appendChild(ticker);
    }

    box.appendChild(head);
    box.appendChild(load);
    ov.appendChild(box);

    document.documentElement.appendChild(ov);
    blocca();

    // Guardia: se qualcosa toglie l'overlay, lo rimette
    osservatore = new MutationObserver(function () {
      if (ov && !document.getElementById('mnt-overlay')) document.documentElement.appendChild(ov);
      blocca();
    });
    osservatore.observe(document.documentElement, { childList: true });

    if (!spans.length) return;

    // Frasi in ordine casuale (durata = animazione, 5s), senza ripetere l'ultima a cavallo dei giri
    var ordine = [];
    for (var n = 0; n < spans.length; n++) ordine.push(n);
    mescola(ordine);
    var pos = 0;
    var attuale = ordine[0];
    spans[attuale].className = 'on';

    giro = setInterval(function () {
      spans[attuale].className = '';
      pos++;
      if (pos >= ordine.length) {
        var ultima = ordine[ordine.length - 1];
        mescola(ordine);
        if (ordine.length > 1 && ordine[0] === ultima) {
          var scambio = ordine[0]; ordine[0] = ordine[1]; ordine[1] = scambio;
        }
        pos = 0;
      }
      attuale = ordine[pos];
      var prossima = spans[attuale];
      void prossima.offsetWidth; // riavvia l'animazione
      prossima.className = 'on';
    }, 5000);
  }

  function aggiornaOverlay(cfg) {
    var m = cfg.manutenzione;
    var attivo = (m.mode === 1 || m.mode === 2) && !puoEntrare(m.mode);
    var firma = attivo ? JSON.stringify(m) : '';
    if (firma !== firmaAttuale) {
      togliOverlay();
      firmaAttuale = firma;
      if (attivo) costruisciOverlay(m);
    }
    mostraPagina();
  }

  // ============================================================
  // AVVIO
  // ============================================================

  function applica(cfg) {
    aggiornaSkin(cfg);
    quandoBody(function () { aggiornaOverlay(cfg); });
  }

  var cache = leggiCache();

  if (cache) {
    if (cache.manutenzione.mode !== 0) preNascondi();
    applica(cache);
  } else {
    // Prima visita: niente da validare ancora, si applica la skin salvata
    applicaSkin(leggiSkin() || 'def');
  }

  fetch(DB_URL, { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (dati) {
      var cfg = normalizza(dati);
      salvaCache(cfg);
      applica(cfg);
    })
    .catch(function (e) {
      console.warn('[ForumConfig] lettura Firebase non riuscita, resta l\'ultima configurazione nota:', e);
      mostraPagina();
    });
})();
