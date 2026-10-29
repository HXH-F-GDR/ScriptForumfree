/* ============================================================
   Pannello Avvisi Shoutbox - v1.0.0
   Logica della pagina staff (pannello-avvisi.html): legge e scrive
   il nodo shoutAvvisi su Firebase, letto poi da shout-avvisi-desktop
   e shout-avvisi-mobile.

   Nodo Firebase: shoutAvvisi = {
     a<timestamp>: {
       attivo: true/false,
       nome:   "Staff",            mittente mostrato in shoutbox
       badge:  "Avviso",           vuoto = nessun badge
       testo:  "...",              HTML
       avatar: "https://...",      vuoto = nessun avatar
       link:   "https://...",      vuoto = nessun link
       acc:    { b: "#3B8686", h: "#B65718" o "", n: "#931D2D" o "" },
       scade:  "AAAA-MM-GG" o "",  l'avviso vale fino a fine giornata
       creato: <timestamp>
     }
   }
   ============================================================ */
(function () {
  if (window.__hxhAvvisiPannello) return;
  window.__hxhAvvisiPannello = true;

  var DB = 'https://spam-limitato-e-illimitato-default-rtdb.europe-west1.firebasedatabase.app/shoutAvvisi';
  var HEX = /^#[0-9A-F]{6}$/;

  var root = document.getElementById('sa-gen');
  if (!root) return;

  var lista = [];
  var inModifica = null;
  var occupato = false;
  var timerMsg = null;

  // ---------- utilita' ----------

  function q(id) {
    var e = document.getElementById(id);
    return e;
  }

  function mk(tag, cls, testo) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (testo !== undefined) e.textContent = testo;
    return e;
  }

  function svuota(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function due(n) {
    var s = (n < 10 ? '0' : '') + n;
    return s;
  }

  function oggi() {
    var d = new Date();
    var s = d.getFullYear() + '-' + due(d.getMonth() + 1) + '-' + due(d.getDate());
    return s;
  }

  // "AAAA-MM-GG" -> "GG/MM/AAAA"
  function dataIt(s) {
    if (!s) return '';
    var p = s.split('-');
    var out = p[2] + '/' + p[1] + '/' + p[0];
    return out;
  }

  // "g/m/aaaa" (anche con - o .) -> "AAAA-MM-GG"; '' se vuota; null se non valida
  function dataIso(s) {
    s = String(s || '').trim();
    if (!s) return '';
    var m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
    if (!m) return null;
    var g = parseInt(m[1], 10);
    var me = parseInt(m[2], 10);
    var a = parseInt(m[3], 10);
    var d = new Date(a, me - 1, g);
    if (d.getFullYear() !== a || d.getMonth() !== me - 1 || d.getDate() !== g) return null;
    var out = a + '-' + due(me) + '-' + due(g);
    return out;
  }

  // accetta "#abc", "abc", "#aabbcc", "aabbcc"; '' se vuoto; null se non valido
  function normHex(v) {
    v = String(v || '').trim().toUpperCase();
    if (!v) return '';
    if (v.charAt(0) !== '#') v = '#' + v;
    if (/^#[0-9A-F]{3}$/.test(v)) v = '#' + v.charAt(1) + v.charAt(1) + v.charAt(2) + v.charAt(2) + v.charAt(3) + v.charAt(3);
    var out = HEX.test(v) ? v : null;
    return out;
  }

  function fb(metodo, percorso, dati) {
    var opts = { method: metodo, cache: 'no-store' };
    if (dati !== undefined) opts.body = JSON.stringify(dati);
    var p = fetch(DB + percorso + '.json', opts).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var j = r.json();
      return j;
    });
    return p;
  }

  function avviso(testo, errore, fisso) {
    var m = q('sa-msg');
    m.textContent = testo;
    m.className = 'sa-msg sa-show' + (errore ? ' sa-err' : '');
    clearTimeout(timerMsg);
    if (!fisso) timerMsg = setTimeout(function () { m.className = 'sa-msg'; }, 3000);
  }

  function testoPiano(html) {
    var d = document.createElement('div');
    d['inner' + 'HTML'] = html;
    var t = (d.textContent || '').replace(/\s+/g, ' ').trim();
    if (t.length > 170) t = t.slice(0, 167) + '...';
    return t;
  }

  function normalizzaUno(id, x) {
    x = x || {};
    var acc = x.acc || {};
    var scade = String(x.scade || '');
    var out = {
      id: id,
      attivo: x.attivo === true,
      nome: String(x.nome || ''),
      badge: String(x.badge || ''),
      testo: String(x.testo || ''),
      avatar: String(x.avatar || ''),
      link: String(x.link || ''),
      acc: { b: normHex(acc.b) || '#3B8686', h: normHex(acc.h) || '', n: normHex(acc.n) || '' },
      scade: /^\d{4}-\d{2}-\d{2}$/.test(scade) ? scade : '',
      creato: Number(x.creato) || 0
    };
    return out;
  }

  function normalizza(dati) {
    var arr = [];
    if (dati && typeof dati === 'object') {
      for (var k in dati) {
        if (dati.hasOwnProperty(k) && dati[k] && typeof dati[k] === 'object') arr.push(normalizzaUno(k, dati[k]));
      }
    }
    arr.sort(function (a, b) { return a.creato - b.creato; });
    return arr;
  }

  function scaduto(a) {
    var s = !!a.scade && a.scade < oggi();
    return s;
  }

  function trova(id) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return lista[i];
    return null;
  }

  // ---------- elenco ----------

  function bottoneIcona(icona, titolo, azione, id) {
    var b = mk('button', 'sa-ic');
    b.type = 'button';
    b.title = titolo;
    b.setAttribute('data-az', azione);
    b.setAttribute('data-id', id);
    b.appendChild(mk('i', 'fa-solid ' + icona));
    return b;
  }

  function quadratino(colore, etichetta) {
    var f = document.createDocumentFragment();
    var i = mk('i');
    i.style.background = colore;
    f.appendChild(i);
    f.appendChild(mk('b', '', etichetta));
    return f;
  }

  function disegnaLista() {
    var box = q('sa-lista');
    svuota(box);
    var n = lista.length;
    var attivi = 0;
    for (var j = 0; j < n; j++) if (lista[j].attivo && !scaduto(lista[j])) attivi++;
    q('sa-conta').textContent = n ? '(' + attivi + ' attiv' + (attivi === 1 ? 'o' : 'i') + ' su ' + n + ')' : '';
    if (!n) {
      box.appendChild(mk('div', 'sa-vuoto-lista', 'Nessun avviso: la shoutbox resta com\'è.'));
      return;
    }
    for (var i = 0; i < n; i++) {
      var a = lista[i];
      var sc = scaduto(a);
      var on = a.attivo && !sc;
      var t = mk('table', 'sa-fr' + (on ? '' : ' sa-off') + (a.id === inModifica ? ' sa-edit' : ''));
      var tr = t.insertRow(-1);
      var cN = tr.insertCell(-1);
      var cT = tr.insertCell(-1);
      var cA = tr.insertCell(-1);
      cN.className = 'sa-fn';
      cT.className = 'sa-ft';
      cA.className = 'sa-fa';
      cN.textContent = String(i + 1);

      var h = mk('div', 'sa-fh', a.nome || 'Staff');
      if (a.badge) h.appendChild(mk('span', 'sa-fb', a.badge));
      cT.appendChild(h);
      cT.appendChild(mk('div', 'sa-fx', testoPiano(a.testo) || '(testo vuoto)'));

      var st = mk('div', 'sa-fs');
      var stato;
      if (sc) stato = 'scaduto il ' + dataIt(a.scade);
      else if (!a.attivo) stato = 'spento';
      else stato = a.scade ? 'attivo fino al ' + dataIt(a.scade) : 'attivo';
      st.appendChild(mk('b', '', stato + ' ·'));
      st.appendChild(quadratino(a.acc.b, 'base'));
      st.appendChild(quadratino(a.acc.h || a.acc.b, 'halloween'));
      st.appendChild(quadratino(a.acc.n || a.acc.b, 'natale'));
      cT.appendChild(st);

      cA.appendChild(bottoneIcona(a.attivo ? 'fa-eye' : 'fa-eye-slash', a.attivo ? 'Spegni' : 'Accendi', 'toggle', a.id));
      cA.appendChild(bottoneIcona('fa-pen', 'Modifica', 'modifica', a.id));
      cA.appendChild(bottoneIcona('fa-trash-can', 'Elimina', 'elimina', a.id));
      box.appendChild(t);
    }
  }

  // ---------- form ----------

  var CAMPI = ['sa-nome', 'sa-badge', 'sa-avatar', 'sa-link', 'sa-testo', 'sa-acc-b', 'sa-acc-h', 'sa-acc-n', 'sa-scade'];

  function aggiornaQuadratini() {
    var base = normHex(q('sa-acc-b').value) || '#3B8686';
    var k = ['b', 'h', 'n'];
    for (var i = 0; i < k.length; i++) {
      var v = normHex(q('sa-acc-' + k[i]).value);
      var sw = q('sa-sw-' + k[i]);
      sw.style.background = v || base;
      sw.className = v ? '' : 'sa-vuoto';
    }
  }

  function svuotaForm() {
    for (var i = 0; i < CAMPI.length; i++) q(CAMPI[i]).value = '';
    q('sa-acc-b').value = '#3B8686';
    q('sa-acc-h').value = '#B65718';
    q('sa-acc-n').value = '#931D2D';
    inModifica = null;
    q('sa-titolo-form').textContent = 'Nuovo avviso';
    q('sa-salva').textContent = 'Aggiungi avviso';
    q('sa-annulla').className = 'sa-bt sa-nas';
    aggiornaQuadratini();
  }

  function apriModifica(id) {
    var a = trova(id);
    if (!a) return;
    inModifica = id;
    q('sa-nome').value = a.nome;
    q('sa-badge').value = a.badge;
    q('sa-avatar').value = a.avatar;
    q('sa-link').value = a.link;
    q('sa-testo').value = a.testo;
    q('sa-acc-b').value = a.acc.b;
    q('sa-acc-h').value = a.acc.h;
    q('sa-acc-n').value = a.acc.n;
    q('sa-scade').value = dataIt(a.scade);
    q('sa-titolo-form').textContent = 'Modifica avviso';
    q('sa-salva').textContent = 'Salva modifiche';
    q('sa-annulla').className = 'sa-bt';
    aggiornaQuadratini();
    disegnaLista();
    var t = q('sa-testo');
    if (t.scrollIntoView) t.scrollIntoView({ block: 'center' });
    t.focus();
  }

  function leggiForm() {
    var testo = q('sa-testo').value.replace(/\r/g, '').trim();
    if (!testo) { avviso('Scrivi il testo dell\'avviso', true); return null; }
    var b = normHex(q('sa-acc-b').value);
    if (!b) { avviso('Accento base: serve un hex tipo #3B8686', true); return null; }
    var h = normHex(q('sa-acc-h').value);
    if (h === null) { avviso('Accento Halloween non valido', true); return null; }
    var n = normHex(q('sa-acc-n').value);
    if (n === null) { avviso('Accento Natale non valido', true); return null; }
    var sc = dataIso(q('sa-scade').value);
    if (sc === null) { avviso('Scadenza non valida: usa gg/mm/aaaa', true); return null; }
    var out = {
      nome: q('sa-nome').value.trim() || 'Staff',
      badge: q('sa-badge').value.trim(),
      testo: testo,
      avatar: q('sa-avatar').value.trim(),
      link: q('sa-link').value.trim(),
      acc: { b: b, h: h, n: n },
      scade: sc
    };
    return out;
  }

  // ---------- salvataggi ----------

  function scrivi(metodo, percorso, valore, fatto, testo) {
    occupato = true;
    root.className = 'sa-busy';
    fb(metodo, percorso, valore).then(function () {
      occupato = false;
      root.className = '';
      fatto();
      disegnaLista();
      avviso(testo);
    }).catch(function (e) {
      occupato = false;
      root.className = '';
      console.error('[Avvisi Shoutbox]', e);
      avviso('Salvataggio non riuscito, riprova', true);
    });
  }

  function salva() {
    var d = leggiForm();
    if (!d) return;
    var vecchio = inModifica ? trova(inModifica) : null;
    var id = vecchio ? vecchio.id : 'a' + Date.now();
    d.attivo = vecchio ? vecchio.attivo : true;
    d.creato = vecchio ? vecchio.creato : Date.now();
    var nuovoScaduto = d.scade && d.scade < oggi();
    scrivi('PUT', '/' + id, d, function () {
      var a = normalizzaUno(id, d);
      if (vecchio) {
        for (var i = 0; i < lista.length; i++) if (lista[i].id === id) lista[i] = a;
      } else {
        lista.push(a);
      }
      svuotaForm();
    }, vecchio ? 'Avviso modificato' : (nuovoScaduto ? 'Aggiunto, ma la scadenza è già passata' : 'Avviso aggiunto e attivo'));
  }

  function toggle(id) {
    var a = trova(id);
    if (!a) return;
    var nuovo = !a.attivo;
    var testo = nuovo ? (scaduto(a) ? 'Acceso, ma è scaduto: cambia la data' : 'Avviso acceso') : 'Avviso spento';
    scrivi('PUT', '/' + id + '/attivo', nuovo, function () { a.attivo = nuovo; }, testo);
  }

  function elimina(id) {
    var a = trova(id);
    if (!a) return;
    if (!confirm('Eliminare questo avviso?\n\n' + testoPiano(a.testo))) return;
    scrivi('DELETE', '/' + id, undefined, function () {
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].id === id) { lista.splice(i, 1); break; }
      }
      if (inModifica === id) svuotaForm();
    }, 'Avviso eliminato');
  }

  // ---------- eventi ----------

  root.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('button') : null;
    if (!b || occupato || root.className === 'sa-wait') return;
    if (b.id === 'sa-salva') { salva(); return; }
    if (b.id === 'sa-annulla') { svuotaForm(); disegnaLista(); return; }
    var az = b.getAttribute('data-az');
    var id = b.getAttribute('data-id');
    if (az === 'toggle') toggle(id);
    else if (az === 'modifica') apriModifica(id);
    else if (az === 'elimina') elimina(id);
  });

  root.addEventListener('input', function (ev) {
    if (/^sa-acc-/.test(ev.target.id || '')) aggiornaQuadratini();
  });

  // ---------- avvio ----------

  svuotaForm();
  fb('GET', '').then(function (dati) {
    lista = normalizza(dati);
    disegnaLista();
    root.className = '';
    avviso(lista.length ? 'Avvisi caricati' : 'Nessun avviso ancora');
  }).catch(function (e) {
    console.error('[Avvisi Shoutbox]', e);
    avviso('Impossibile leggere Firebase: ricarica la pagina', true, true);
  });
})();
