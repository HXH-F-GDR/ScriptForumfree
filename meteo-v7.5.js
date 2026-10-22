/* Meteo e tempo di gioco
   Hunter x Hunter Forum - GDR Remastered
   Versione 7.5

   Lo stesso file serve desktop e mobile, con gli stessi luoghi (DATI qui sotto).
   Desktop: nel blocco HTML del forum, dopo questo script, HxHMeteo.avvia()
   Mobile: il bundle carica questo file e chiama HxHMeteo.avvia({ mobile: true })

   Espone window.HxHMeteo, usato anche dal pannello staff e dalla mappa del mondo. */
;(function() {
'use strict';

if (window.HxHMeteo) return;

var FIREBASE_PREDEFINITO = 'https://huntermeteo-default-rtdb.europe-west1.firebasedatabase.app';
var ORA = 3600000;
var GIORNO = 86400000;
var MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
var SVG = 'http://www.w3.org/2000/svg';

/* DATI
   Unico posto dove stanno gli ID delle sezioni.
   FORUM: quale forum è, in base al dominio; decide quali ID usare e quali dati leggere su Firebase
   TEMPO: tempo di partenza, vale solo finché lo staff non imposta data e velocità dal pannello
   EMISFERO: "australe" o "boreale", vale solo finché lo staff non lo sceglie dal pannello;
     i climi dei luoghi sono scritti per l'australe (freddo a sud, in basso nella mappa):
     nel boreale subtropicale e subpolare si scambiano da soli
   LUOGHI: prova = ID della sezione sul forum di prova, gdr = ID della sezione sul forum vero;
     fuso e clima si ereditano dal luogo che contiene, se non indicati;
     predefinito = luogo mostrato fuori dalle zone di gioco;
     comePadre = mostra nome e meteo del luogo che lo contiene (gli override restano propri) */

var DATI = {
  FORUM: {
    "graficaxskinxelaborazione.forumfree.it": "prova",
    "hxhforumgdr.forumcommunity.net": "gdr"
  },

  EMISFERO: "australe",

  TEMPO: { giocoUTC: "2017-01-01T01:00:00Z", realeUTC: "2026-04-09T17:52:00Z", giorniRealiPerGiorno: 2 },

  LUOGHI: [
    { prova: "65073567", gdr: "", nome: "Narevka", fuso: -1, clima: "subtropical", figli: [
        { prova: "65114239", gdr: "", nome: "Repubblica di Padokia", figli: [
            { prova: "65114240", gdr: "", nome: "Monte Kukuru" }
        ]},
        { prova: "65114241", gdr: "", nome: "Zerkaid", figli: [
            { prova: "65114244", gdr: "", nome: "Parasta" },
            { prova: "65114245", gdr: "", nome: "Swardani", predefinito: true, figli: [
                { prova: "65114246", gdr: "", nome: "Associazione degli Hunter", comePadre: true },
                { prova: "65114236", gdr: "", nome: "Torre Celeste", comePadre: true }
            ]}
        ]},
        { prova: "65114242", gdr: "", nome: "Repubblica di Mimbo" },
        { prova: "65114243", gdr: "", nome: "Repubblica Kotoritana", fuso: 0 }
    ]},
    { prova: "65073568", gdr: "", nome: "Solmara", fuso: -2, clima: "temperate", figli: [
        { prova: "65114247", gdr: "", nome: "Regno di Kukan'yu", figli: [
            { prova: "65114251", gdr: "", nome: "Zapan", figli: [
                { prova: "65114478", gdr: "", nome: "Villaggio di Trakey" }
            ]},
            { prova: "65114250", gdr: "", nome: "Dolle Harbor", figli: [
                { prova: "65114477", gdr: "", nome: "Insediamento Melioras" }
            ]}
        ]},
        { prova: "65114248", gdr: "", nome: "Repubblica di Lapet", clima: "subtropical" },
        { prova: "65114249", gdr: "", nome: "Jappon", clima: "subtropical", figli: [
            { prova: "65114479", gdr: "", nome: "Villaggio dei Fiori" },
            { prova: "65114480", gdr: "", nome: "Villaggio delle Nuvole" }
        ]}
    ]},
    { prova: "65073569", gdr: "", nome: "Yorbian", fuso: -2, clima: "temperate", figli: [
        { prova: "65114252", gdr: "", nome: "Stati Uniti di Saherta", figli: [
            { prova: "65114256", gdr: "", nome: "York Shin" }
        ]},
        { prova: "65114254", gdr: "", nome: "Kravos", clima: "subpolar" },
        { prova: "65114255", gdr: "", nome: "Elyndar", fuso: -1 },
        { prova: "65114253", gdr: "", nome: "Isole di Balsa", fuso: -1, clima: "subpolar", figli: [
            { prova: "65114263", gdr: "", nome: "Arcipelago di Luneth", figli: [
                { prova: "65114257", gdr: "", nome: "Unione di Mitene", figli: [
                    { prova: "65114258", gdr: "", nome: "NGL", figli: [
                        { prova: "65114481", gdr: "", nome: "Monte Hiei" },
                        { prova: "65114482", gdr: "", nome: "Monte Kurama" }
                    ]},
                    { prova: "65114259", gdr: "", nome: "Repubblica di Rokario" },
                    { prova: "65114260", gdr: "", nome: "Repubblica di Hass" },
                    { prova: "65114261", gdr: "", nome: "Rep. Gorteau Occidentale" },
                    { prova: "65114262", gdr: "", nome: "Rep. Gorteau Orientale" }
                ]}
            ]}
        ]}
    ]},
    { prova: "65114231", gdr: "", nome: "Azia", fuso: 2, clima: "temperate", figli: [
        { prova: "65114265", gdr: "", nome: "Torvane", clima: "subtropical", figli: [
            { prova: "65114483", gdr: "", nome: "Citt\u00e0 Eterna" }
        ]},
        { prova: "65114264", gdr: "", nome: "Impero di Kakin", figli: [
            { prova: "65114484", gdr: "", nome: "Villaggio di Blackbird" }
        ]},
        { prova: "65114266", gdr: "", nome: "Mirelka" }
    ]},
    { prova: "65114232", gdr: "", nome: "Kethra", fuso: 2, clima: "temperate", figli: [
        { prova: "65114267", gdr: "", nome: "Federazione di Ochima", figli: [
            { prova: "65114269", gdr: "", nome: "Isola Balena" }
        ]},
        { prova: "65114268", gdr: "", nome: "Egypersia", clima: "subpolar" }
    ]},
    { prova: "65114234", gdr: "", nome: "Citt\u00e0 delle Stelle Cadenti", fuso: 1, clima: "subtropical", figli: [
        { prova: "65114272", gdr: "", nome: "Meteor" }
    ]},
    { prova: "65114233", gdr: "", nome: "Vandros", fuso: 1, clima: "subpolar", figli: [
        { prova: "65114270", gdr: "", nome: "Unione di Beger\u00f2ss\u00e8" },
        { prova: "65114271", gdr: "", nome: "Greed Island 2", fuso: 0, clima: "temperate" }
    ]},
    { prova: "65114235", gdr: "", nome: "Greed Island", fuso: 0, clima: "temperate" }
  ]
};



/* CONDIZIONI METEO
   Per fascia climatica e stagione (emisfero australe):
   estate = dic, gen, feb; autunno = mar, apr, mag; inverno = giu, lug, ago; primavera = set, ott, nov.
   requiresCold: diventa pioggia se la temperatura supera i 2 gradi
   requiresHot: diventa soleggiato se la temperatura è sotto i 28 gradi
   breve: non può durare due fasce orarie di fila */

var METEO = {

  /* Subtropicale: 25/38 estate, 15/25 autunno, 5/15 inverno, 15/25 primavera */
  subtropical: {
    summer: [
      { label: "Afa",            icon: "wx-hot",     minT: 30, maxT: 38, weight: 5, requiresHot: true },
      { label: "Soleggiato",     icon: "wx-sunny",   minT: 25, maxT: 35, weight: 3 },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT: 24, maxT: 33, weight: 2 },
      { label: "Temporale",      icon: "wx-thunder", minT: 22, maxT: 30, weight: 2 },
      { label: "Vento caldo",    icon: "wx-windy",   minT: 25, maxT: 34, weight: 2 },
      { label: "Grandine",       icon: "wx-hail",    minT: 18, maxT: 27, weight: 1, breve: true }
    ],
    autumn: [
      { label: "Soleggiato",     icon: "wx-sunny",   minT: 18, maxT: 25, weight: 2 },
      { label: "Nuvoloso",       icon: "wx-cloudy",  minT: 14, maxT: 22, weight: 2 },
      { label: "Pioggia",        icon: "wx-rainy",   minT: 12, maxT: 20, weight: 3 },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT: 15, maxT: 23, weight: 2 },
      { label: "Vento",          icon: "wx-windy",   minT: 14, maxT: 22, weight: 2 },
      { label: "Temporale",      icon: "wx-thunder", minT: 12, maxT: 19, weight: 2 }
    ],
    winter: [
      { label: "Pioggia",        icon: "wx-rainy",   minT:  5, maxT: 13, weight: 4 },
      { label: "Nuvoloso",       icon: "wx-cloudy",  minT:  4, maxT: 12, weight: 3 },
      { label: "Temporale",      icon: "wx-thunder", minT:  5, maxT: 12, weight: 2 },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT:  7, maxT: 14, weight: 2 },
      { label: "Soleggiato",     icon: "wx-sunny",   minT:  8, maxT: 15, weight: 1 },
      { label: "Vento",          icon: "wx-windy",   minT:  5, maxT: 13, weight: 2 }
    ],
    spring: [
      { label: "Vento",          icon: "wx-windy",   minT: 15, maxT: 23, weight: 4 },
      { label: "Pioggia",        icon: "wx-rainy",   minT: 13, maxT: 21, weight: 3 },
      { label: "Nuvoloso",       icon: "wx-cloudy",  minT: 13, maxT: 21, weight: 2 },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT: 15, maxT: 23, weight: 2 },
      { label: "Soleggiato",     icon: "wx-sunny",   minT: 17, maxT: 25, weight: 2 },
      { label: "Temporale",      icon: "wx-thunder", minT: 13, maxT: 20, weight: 2 }
    ]
  },

  /* Temperata: 18/28 estate, 8/18 autunno, -5/5 inverno, 8/18 primavera */
  temperate: {
    summer: [
      { label: "Soleggiato",     icon: "wx-sunny",   minT: 20, maxT: 28, weight: 3 },
      { label: "Temporale",      icon: "wx-thunder", minT: 16, maxT: 24, weight: 4 },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT: 18, maxT: 26, weight: 3 },
      { label: "Nuvoloso",       icon: "wx-cloudy",  minT: 15, maxT: 22, weight: 2 },
      { label: "Afa",            icon: "wx-hot",     minT: 28, maxT: 34, weight: 1, requiresHot: true },
      { label: "Grandine",       icon: "wx-hail",    minT: 14, maxT: 22, weight: 1, breve: true }
    ],
    autumn: [
      { label: "Pioggia",        icon: "wx-rainy",   minT:  6, maxT: 14, weight: 4 },
      { label: "Nuvoloso",       icon: "wx-cloudy",  minT:  6, maxT: 15, weight: 3 },
      { label: "Vento",          icon: "wx-windy",   minT:  7, maxT: 15, weight: 3 },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT:  9, maxT: 17, weight: 2 },
      { label: "Soleggiato",     icon: "wx-sunny",   minT: 10, maxT: 18, weight: 1 },
      { label: "Temporale",      icon: "wx-thunder", minT:  6, maxT: 13, weight: 2 },
      { label: "Nebbia",         icon: "wx-foggy",   minT:  4, maxT: 11, weight: 3 }
    ],
    winter: [
      { label: "Neve",            icon: "wx-snow",     minT: -5, maxT:  2, weight: 4, requiresCold: true },
      { label: "Nevischio",       icon: "wx-snow",     minT: -2, maxT:  3, weight: 3, requiresCold: true },
      { label: "Gelido",          icon: "wx-freezing", minT: -5, maxT:  0, weight: 2 },
      { label: "Nuvoloso",        icon: "wx-cloudy",   minT: -1, maxT:  5, weight: 3 },
      { label: "Freddo e sereno", icon: "wx-sunny",    minT: -2, maxT:  4, weight: 2 },
      { label: "Pioggia",         icon: "wx-rainy",    minT:  1, maxT:  5, weight: 2 },
      { label: "Grandine",        icon: "wx-hail",     minT:  0, maxT:  5, weight: 1, breve: true }
    ],
    spring: [
      { label: "Pioggia",        icon: "wx-rainy",   minT:  8, maxT: 15, weight: 4 },
      { label: "Temporale",      icon: "wx-thunder", minT:  9, maxT: 16, weight: 3 },
      { label: "Nuvoloso",       icon: "wx-cloudy",  minT:  8, maxT: 15, weight: 2 },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT: 10, maxT: 18, weight: 2 },
      { label: "Soleggiato",     icon: "wx-sunny",   minT: 12, maxT: 18, weight: 2 },
      { label: "Vento",          icon: "wx-windy",   minT:  9, maxT: 16, weight: 2 }
    ]
  },

  /* Subpolare: 10/20 estate, 0/10 autunno, -12/0 inverno, 0/10 primavera */
  subpolar: {
    summer: [
      { label: "Soleggiato",     icon: "wx-sunny",   minT: 12, maxT: 20, weight: 3 },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT: 10, maxT: 18, weight: 3 },
      { label: "Nuvoloso",       icon: "wx-cloudy",  minT:  8, maxT: 16, weight: 2 },
      { label: "Pioggia",        icon: "wx-rainy",   minT:  7, maxT: 14, weight: 2 },
      { label: "Vento",          icon: "wx-windy",   minT:  8, maxT: 16, weight: 2 },
      { label: "Temporale",      icon: "wx-thunder", minT:  8, maxT: 14, weight: 1 }
    ],
    autumn: [
      { label: "Nuvoloso",       icon: "wx-cloudy",  minT:  2, maxT:  9, weight: 3 },
      { label: "Pioggia",        icon: "wx-rainy",   minT:  1, maxT:  8, weight: 3 },
      { label: "Vento",          icon: "wx-windy",   minT:  1, maxT:  8, weight: 3 },
      { label: "Neve",           icon: "wx-snow",    minT: -2, maxT:  2, weight: 3, requiresCold: true },
      { label: "Nevischio",      icon: "wx-snow",    minT:  0, maxT:  3, weight: 2, requiresCold: true },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT:  3, maxT: 10, weight: 1 }
    ],
    winter: [
      { label: "Neve abbondante", icon: "wx-snow",     minT: -12, maxT: -1, weight: 5, requiresCold: true },
      { label: "Neve",            icon: "wx-snow",     minT:  -8, maxT:  0, weight: 4, requiresCold: true },
      { label: "Gelido",          icon: "wx-freezing", minT: -12, maxT: -3, weight: 3 },
      { label: "Nuvoloso",        icon: "wx-cloudy",   minT:  -5, maxT:  0, weight: 2 },
      { label: "Freddo e sereno", icon: "wx-sunny",    minT:  -8, maxT: -1, weight: 1 }
    ],
    spring: [
      { label: "Vento",          icon: "wx-windy",   minT:  0, maxT:  9, weight: 4 },
      { label: "Soleggiato",     icon: "wx-sunny",   minT:  2, maxT: 10, weight: 3 },
      { label: "Nuvoloso",       icon: "wx-cloudy",  minT:  0, maxT:  8, weight: 2 },
      { label: "Pioggia",        icon: "wx-rainy",   minT:  0, maxT:  7, weight: 2 },
      { label: "Neve",           icon: "wx-snow",    minT: -3, maxT:  1, weight: 2, requiresCold: true },
      { label: "Parz. nuvoloso", icon: "wx-partly",  minT:  1, maxT:  9, weight: 2 }
    ]
  }
};

/* Icona di passaggio mostrata nella prima ora di una nuova fascia, se il cambio è brusco */
var TRANSIZIONI = {
  "wx-sunny":   { "wx-rainy": "wx-cloudy", "wx-thunder": "wx-partly", "wx-snow": "wx-cloudy", "wx-foggy": "wx-partly" },
  "wx-partly":  { "wx-rainy": "wx-cloudy", "wx-thunder": "wx-cloudy", "wx-snow": "wx-cloudy" },
  "wx-cloudy":  { "wx-sunny": "wx-partly" },
  "wx-rainy":   { "wx-sunny": "wx-cloudy", "wx-snow": "wx-cloudy" },
  "wx-thunder": { "wx-sunny": "wx-cloudy", "wx-partly": "wx-cloudy" },
  "wx-snow":    { "wx-sunny": "wx-cloudy", "wx-rainy": "wx-cloudy" },
  "wx-hot":     { "wx-rainy": "wx-partly", "wx-thunder": "wx-partly" }
};

/* Ore del giorno più calda e più fredda */
var PICCHI = {
  summer: { caldo: 16, freddo: 5 },
  spring: { caldo: 15, freddo: 5 },
  autumn: { caldo: 15, freddo: 5 },
  winter: { caldo: 14, freddo: 5 }
};


/* CALCOLO DEL METEO */

/* Fascia climatica nell'emisfero attuale: nel boreale il polo è a nord,
   quindi subtropicale e subpolare si scambiano; la temperata resta uguale */
function climaEffettivo(clima) {
  if (stato.emisfero !== 'boreale') return clima;
  if (clima === 'subtropical') return 'subpolar';
  if (clima === 'subpolar') return 'subtropical';
  return clima;
}

/* Nell'emisfero boreale le stagioni sono spostate di sei mesi */
function stagione(mese) {
  if (stato.emisfero === 'boreale') mese = (mese + 6) % 12;
  if (mese === 11 || mese === 0 || mese === 1) return 'summer';
  if (mese >= 2 && mese <= 4) return 'autumn';
  if (mese >= 5 && mese <= 7) return 'winter';
  return 'spring';
}

/* Ora di alba e di tramonto per stagione */
var LUCE = {
  summer: [5, 20],
  spring: [6, 19],
  autumn: [6, 19],
  winter: [7, 17]
};

function eNotte(ora, st) {
  var l = LUCE[st];
  return ora >= l[1] || ora < l[0];
}

function distanzaCircolare(a, b) {
  var d = Math.abs(a - b) % 24;
  return d > 12 ? 24 - d : d;
}

/* 0 all'ora più fredda, 1 all'ora più calda */
function fattoreTemperatura(ora, st) {
  var p = PICCHI[st];
  var dCaldo = distanzaCircolare(ora, p.caldo);
  var dFreddo = distanzaCircolare(ora, p.freddo);
  return dFreddo / (dCaldo + dFreddo);
}

function hashTesto(testo) {
  var h = 2166136261;
  for (var i = 0; i < testo.length; i++) {
    h ^= testo.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function generatore(seme) {
  var s = (seme ^ 0xdeadbeef) >>> 0;
  return function() {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0x100000000;
  };
}

function trova(pool, icona) {
  for (var i = 0; i < pool.length; i++) {
    if (pool[i].icon === icona) return pool[i];
  }
  return null;
}

function scegli(pool, rand, escludiBrevi) {
  var lista = [];
  var totale = 0;
  for (var i = 0; i < pool.length; i++) {
    if (escludiBrevi && pool[i].breve) continue;
    lista.push(pool[i]);
    totale += pool[i].weight;
  }
  var r = rand() * totale;
  var somma = 0;
  for (var j = 0; j < lista.length; j++) {
    somma += lista[j].weight;
    if (r <= somma) return lista[j];
  }
  return lista[lista.length - 1];
}

/* Meteo di un luogo all'istante locale indicato (ms di gioco già spostati sul fuso del luogo).
   Il giorno è diviso in fasce di 2 ore (primavera, autunno) o 3 ore (estate, inverno);
   ogni fascia ha il suo seme, calcolato sull'indice assoluto della fascia e sul nome del luogo. */
function calcolaMeteo(localeMs, nome, clima) {
  var d = new Date(localeMs);
  var ora = d.getUTCHours();
  var st = stagione(d.getUTCMonth());
  var pool = (METEO[climaEffettivo(clima)] || METEO.temperate)[st];

  var durata = (st === 'spring' || st === 'autumn') ? 2 : 3;
  var oreAssolute = Math.floor(localeMs / ORA);
  var fascia = Math.floor(oreAssolute / durata);
  var base = hashTesto(nome);

  function seme(f, extra) {
    return (Math.imul(f, 0x9E3779B1) ^ base ^ (extra || 0)) >>> 0;
  }

  var prima = scegli(pool, generatore(seme(fascia - 1)), false);
  var adesso = scegli(pool, generatore(seme(fascia)), prima.breve);

  var rT = generatore(seme(fascia, 0x5bd1e995));
  var rumore = (rT() - 0.5) * 3;
  var f = fattoreTemperatura(ora, st);
  var temp = Math.round(adesso.minT + rumore + f * (adesso.maxT - adesso.minT));

  function vincoli(w) {
    if (w.requiresCold && temp > 2) return trova(pool, 'wx-rainy') || w;
    if (w.requiresHot && temp < 28) return trova(pool, 'wx-sunny') || w;
    return w;
  }
  adesso = vincoli(adesso);
  prima = vincoli(prima);

  var passaggio = TRANSIZIONI[prima.icon] ? TRANSIZIONI[prima.icon][adesso.icon] : null;
  if (passaggio && oreAssolute % durata === 0) {
    var p = trova(pool, passaggio);
    return { label: p ? p.label : 'Variabile', icon: passaggio, temp: temp };
  }
  return { label: adesso.label, icon: adesso.icon, temp: temp };
}


/* STATO */

var stato = {
  config:      null,
  forum:       null,
  firebase:    FIREBASE_PREDEFINITO,
  radici:      [],
  nodi:        [],
  perId:       {},
  predefinito: null,
  luogo:       null,
  tempo:       null,
  override:    {},
  caricato:    0,
  emisfero:    'australe'
};

var attese = [];


/* LUOGHI
   Ogni luogo eredita fuso e clima dal padre se non li indica.
   L'ID usato è quello del forum corrente (campo "prova" o "gdr" nella config). */

function preparaAlbero(lista, padre, profondita) {
  for (var i = 0; i < lista.length; i++) {
    var n = lista[i];
    var id = n[stato.forum];
    var nodo = {
      id:         id ? String(id) : null,
      nome:       n.nome,
      fuso:       n.fuso !== undefined ? n.fuso : (padre ? padre.fuso : 0),
      clima:      n.clima || (padre ? padre.clima : 'temperate'),
      comePadre:  !!(n.comePadre && padre),
      padre:      padre,
      profondita: profondita,
      figli:      []
    };
    if (padre) padre.figli.push(nodo);
    else stato.radici.push(nodo);
    stato.nodi.push(nodo);
    if (nodo.id) stato.perId[nodo.id] = nodo;
    if (n.predefinito) stato.predefinito = nodo;
    if (n.figli) preparaAlbero(n.figli, nodo, profondita + 1);
  }
}

/* Il percorso di navigazione è quello il cui primo link porta alla home */
function trovaNav() {
  var navs = document.querySelectorAll(stato.config.NAV || 'ul.nav');
  for (var i = 0; i < navs.length; i++) {
    var primo = navs[i].querySelector('a[href]');
    if (primo && primo.pathname === '/' && !primo.search) return navs[i];
  }
  return null;
}

/* Sezioni della pagina, dalla più esterna alla più interna */
function idPagina() {
  var ids = [];
  var nav = trovaNav();
  if (nav) {
    var link = nav.querySelectorAll('a[href]');
    for (var i = 0; i < link.length; i++) {
      var m = (link[i].getAttribute('href') || '').match(/[?&]f=(\d+)/);
      if (m) ids.push(m[1]);
    }
  }
  var mUrl = location.search.match(/[?&]f=(\d+)/);
  if (mUrl) ids.push(mUrl[1]);
  var c = window.Commons && window.Commons.location;
  if (c && c.section && c.section.id) ids.push(String(c.section.id));
  return ids;
}

/* Luogo della pagina: la sezione mappata più interna, altrimenti il luogo predefinito */
function luogoPagina() {
  var ids = idPagina();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (stato.perId[ids[i]]) return stato.perId[ids[i]];
  }
  return stato.predefinito;
}

/* Per i continenti il meteo è quello di uno dei paesi della stessa fascia climatica,
   che cambia ogni giorno di gioco */
function delegato(continente, localeMs) {
  var adatti = [];
  var tutti = [];
  for (var i = 0; i < continente.figli.length; i++) {
    var f = continente.figli[i];
    if (f.comePadre) continue;
    tutti.push(f);
    if (f.clima === continente.clima) adatti.push(f);
  }
  if (adatti.length === 0) adatti = tutti;
  if (adatti.length === 0) return null;
  var giorno = Math.floor(localeMs / GIORNO);
  return adatti[(giorno + hashTesto(continente.nome)) % adatti.length];
}

/* Override del luogo, poi dei luoghi che lo contengono, poi globale */
function overrideDi(nodo) {
  for (var n = nodo; n; n = n.padre) {
    if (n.id && stato.override[n.id]) return stato.override[n.id];
  }
  return stato.override.global || null;
}


/* TEMPO DI GIOCO
   L'àncora dice: all'istante reale realeMs il tempo di gioco (UTC) era giocoMs,
   e da lì scorre al ritmo di 1 giorno di gioco ogni "velocita" giorni reali. */

function tempoValido(t) {
  return !!t && isFinite(t.giocoMs) && isFinite(t.realeMs) && isFinite(t.velocita) && t.velocita > 0;
}

function tempoDaConfig(t) {
  if (!t) return null;
  var ris = { giocoMs: Date.parse(t.giocoUTC), realeMs: Date.parse(t.realeUTC), velocita: t.giorniRealiPerGiorno };
  return tempoValido(ris) ? ris : null;
}

function chiaveCache() {
  return 'hxh-meteo-tempo-' + stato.forum;
}

function leggiCache() {
  try {
    var t = JSON.parse(localStorage.getItem(chiaveCache()));
    return tempoValido(t) ? t : null;
  } catch (e) {
    return null;
  }
}

function scriviCache(t) {
  try {
    if (t) localStorage.setItem(chiaveCache(), JSON.stringify(t));
    else localStorage.removeItem(chiaveCache());
  } catch (e) {}
}

function emisferoValido(e) {
  return e === 'australe' || e === 'boreale';
}

function leggiCacheEmisfero() {
  try {
    var e = localStorage.getItem('hxh-meteo-emisfero-' + stato.forum);
    return emisferoValido(e) ? e : null;
  } catch (err) {
    return null;
  }
}

function scriviCacheEmisfero(e) {
  try {
    if (e) localStorage.setItem('hxh-meteo-emisfero-' + stato.forum, e);
    else localStorage.removeItem('hxh-meteo-emisfero-' + stato.forum);
  } catch (err) {}
}

function tempoGioco() {
  var t = stato.tempo;
  return t.giocoMs + (Date.now() - t.realeMs) / t.velocita;
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

function dataOra(nodo) {
  var mostra = nodo.comePadre ? nodo.padre : nodo;
  var d = new Date(tempoGioco() + mostra.fuso * ORA);
  return {
    ora:  pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()),
    data: d.getUTCDate() + ' ' + MESI[d.getUTCMonth()] + ' ' + d.getUTCFullYear()
  };
}


/* METEO DI UN LUOGO, CON OVERRIDE */

function meteoNodo(nodo) {
  var mostra = nodo.comePadre ? nodo.padre : nodo;
  var adesso = tempoGioco();
  var locale = new Date(adesso + mostra.fuso * ORA);
  var st = stagione(locale.getUTCMonth());

  var fonte = mostra;
  if (!mostra.padre && mostra.figli.length) fonte = delegato(mostra, locale.getTime()) || mostra;
  var w = calcolaMeteo(adesso + fonte.fuso * ORA, fonte.nome, fonte.clima);

  var ov = overrideDi(nodo);
  if (ov) {
    if (ov.icon) { w.icon = ov.icon; w.label = ov.label; }
    if (ov.temp) {
      if (ov.temp.mode === 'abs')   w.temp = ov.temp.val;
      if (ov.temp.mode === 'plus')  w.temp = w.temp + ov.temp.val;
      if (ov.temp.mode === 'minus') w.temp = w.temp - ov.temp.val;
      w.temp = Math.round(w.temp);
    }
  }

  var notte = eNotte(locale.getUTCHours(), st);

  /* Prova delle icone: "wx-rainy", oppure "night:wx-sunny" per la versione notturna */
  var dbg = stato.config.DEBUG_METEO;
  if (dbg) {
    notte = dbg.indexOf('night:') === 0;
    w.icon = notte ? dbg.slice(6) : dbg;
    w.label = '[DBG] ' + w.icon;
  }

  var etichetta = w.label;
  if (w.icon === 'wx-sunny' && notte) etichetta = 'Sereno';
  if (w.icon === 'wx-tornado' && climaEffettivo(mostra.clima) === 'subtropical') etichetta = 'Uragano';

  var t = dataOra(nodo);
  var luce = LUCE[st];
  return {
    luogo:    mostra.nome,
    ora:      t.ora,
    data:     t.data,
    label:    etichetta,
    icon:     w.icon,
    temp:     w.temp,
    notte:    notte,
    alba:     pad(luce[0]) + ':00',
    tramonto: pad(luce[1]) + ':00',
    giornata: (locale.getUTCHours() * 60 + locale.getUTCMinutes()) / 1440
  };
}


/* FIREBASE
   Un solo nodo per forum: /<forum>/overrides e /<forum>/tempo */

function caricaDati(fatto) {
  fetch(stato.firebase + '/' + stato.forum + '.json')
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var json = r.json();
      return json;
    })
    .then(function(d) {
      d = d || {};
      stato.override = d.overrides || {};
      if (tempoValido(d.tempo)) {
        stato.tempo = { giocoMs: d.tempo.giocoMs, realeMs: d.tempo.realeMs, velocita: d.tempo.velocita };
        scriviCache(stato.tempo);
      } else {
        stato.tempo = tempoDaConfig(stato.config.TEMPO) || stato.tempo;
        scriviCache(null);
      }
      if (emisferoValido(d.emisfero)) {
        stato.emisfero = d.emisfero;
        scriviCacheEmisfero(d.emisfero);
      } else {
        stato.emisfero = emisferoValido(stato.config.EMISFERO) ? stato.config.EMISFERO : 'australe';
        scriviCacheEmisfero(null);
      }
      stato.caricato = Date.now();
      aggiorna();
      if (fatto) fatto(true);
    })
    .catch(function(e) {
      console.warn('[HxHMeteo] lettura Firebase non riuscita:', e);
      if (fatto) fatto(false);
    });
}


/* WIDGET */

function el(tag, cls) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function elSvg(tag) {
  return document.createElementNS(SVG, tag);
}

function iconaFa(cls) {
  return el('i', cls);
}

var RAGGIO = 26;
var CIRCONFERENZA = 2 * Math.PI * RAGGIO;

function cellaTesto(etichetta, classeValore, iconaClasse) {
  var cella = el('div', 'hxw-cell');
  var lab = el('div', 'hxw-cell-label');
  if (iconaClasse) lab.appendChild(iconaFa(iconaClasse));
  lab.appendChild(document.createTextNode(etichetta));
  cella.appendChild(lab);
  cella.appendChild(el('div', 'hxw-cell-value ' + classeValore));
  return cella;
}

function costruisci() {
  var bar = document.getElementById('hxh-bar');
  if (!bar || bar.firstChild) return;
  var mobile = !!stato.config.mobile;
  bar.className = mobile ? 'hxw-mobile' : '';

  /* Chiuso: cerchio con l'anello della giornata e la temperatura */
  if (!mobile) {
    var orb = el('div', 'hxw-orb');
    var anello = elSvg('svg');
    anello.setAttribute('class', 'hxw-ring');
    anello.setAttribute('viewBox', '0 0 60 60');
    var traccia = elSvg('circle');
    traccia.setAttribute('class', 'hxw-ring-track');
    var pieno = elSvg('circle');
    pieno.setAttribute('class', 'hxw-ring-fill');
    var cerchi = [traccia, pieno];
    for (var i = 0; i < cerchi.length; i++) {
      cerchi[i].setAttribute('cx', '30');
      cerchi[i].setAttribute('cy', '30');
      cerchi[i].setAttribute('r', String(RAGGIO));
      anello.appendChild(cerchi[i]);
    }
    orb.appendChild(anello);
    orb.appendChild(el('div', 'hxw-orb-icon'));
    orb.appendChild(el('span', 'hxw-orb-temp'));
    orb.onmouseenter = function() { bar.className = 'hxw-open'; };
    orb.onclick = function() { bar.className = 'hxw-open'; };
    bar.appendChild(orb);
  }

  /* Aperto: scheda */
  var card = el('div', 'hxw-card');

  var testa = el('div', 'hxw-head');
  testa.appendChild(iconaFa('fa-solid fa-location-dot'));
  testa.appendChild(el('span', 'hxw-name'));
  if (!mobile) {
    var chiudi = el('button', 'hxw-close');
    chiudi.appendChild(iconaFa('fa-solid fa-xmark'));
    chiudi.onclick = function(e) { e.stopPropagation(); bar.className = ''; };
    testa.appendChild(chiudi);
  }
  card.appendChild(testa);

  var hero = el('div', 'hxw-hero');
  hero.appendChild(el('div', 'hxw-hero-icon'));
  var heroTesto = el('div');
  heroTesto.appendChild(el('div', 'hxw-temp'));
  heroTesto.appendChild(el('div', 'hxw-label'));
  hero.appendChild(heroTesto);
  card.appendChild(hero);

  var riga = el('div', 'hxw-grid');
  riga.appendChild(cellaTesto('Ora locale', 'hxw-ora'));
  riga.appendChild(cellaTesto('Data', 'hxw-small hxw-data'));
  card.appendChild(riga);

  var luce = el('div', 'hxw-grid hxw-foot');
  luce.appendChild(cellaTesto('Alba', 'hxw-mid hxw-alba', 'fa-solid fa-sun'));
  luce.appendChild(cellaTesto('Tramonto', 'hxw-mid hxw-tramonto', 'fa-solid fa-moon'));
  card.appendChild(luce);

  bar.appendChild(card);
}

var ultima = { icon: null, notte: null };

function scrivi(bar, selettore, testo) {
  var e = bar.querySelector(selettore);
  if (e && e.textContent !== testo) e.textContent = testo;
}

function aggiorna() {
  var bar = document.getElementById('hxh-bar');
  if (!bar || !bar.firstChild) return;
  stato.luogo = luogoPagina();
  var m = meteoNodo(stato.luogo);
  var segno = m.temp > 0 ? '+' : '';

  scrivi(bar, '.hxw-name', m.luogo);
  scrivi(bar, '.hxw-temp', segno + m.temp + '°C');
  scrivi(bar, '.hxw-label', m.label);
  scrivi(bar, '.hxw-ora', m.ora);
  scrivi(bar, '.hxw-data', m.data);
  scrivi(bar, '.hxw-alba', m.alba);
  scrivi(bar, '.hxw-tramonto', m.tramonto);
  scrivi(bar, '.hxw-orb-temp', segno + m.temp + '°');

  var pieno = bar.querySelector('.hxw-ring-fill');
  if (pieno) pieno.setAttribute('stroke-dasharray', (m.giornata * CIRCONFERENZA).toFixed(1) + ' ' + CIRCONFERENZA.toFixed(1));

  if (m.icon !== ultima.icon || m.notte !== ultima.notte) {
    var posti = bar.querySelectorAll('.hxw-orb-icon, .hxw-hero-icon');
    for (var i = 0; i < posti.length; i++) {
      posti[i].textContent = '';
      posti[i].appendChild(icona(m.icon, m.notte));
    }
    ultima.icon = m.icon;
    ultima.notte = m.notte;
  }
}


/* ICONE */

function cerchio(cx, cy, r, fill) {
  var c = elSvg('circle');
  c.setAttribute('cx', cx);
  c.setAttribute('cy', cy);
  c.setAttribute('r', r);
  c.setAttribute('fill', fill);
  return c;
}

function luna(fill, cx, cy, r, mcx, mcy, mr, rot, stelleBuco, stelleExtra) {
  var svg = elSvg('svg');
  svg.setAttribute('class', 'moon-svg');
  svg.setAttribute('viewBox', '0 0 90 90');
  svg.setAttribute('overflow', 'visible');
  var defs = elSvg('defs');
  var idMaschera = 'mm' + Math.random().toString(36).slice(2, 8);
  var maschera = elSvg('mask');
  maschera.setAttribute('id', idMaschera);
  var g = elSvg('g');
  g.setAttribute('transform', 'rotate(' + rot + ',' + cx + ',' + cy + ')');
  g.appendChild(cerchio(cx, cy, r, 'white'));
  g.appendChild(cerchio(mcx, mcy, mr, 'black'));
  maschera.appendChild(g);
  defs.appendChild(maschera);
  svg.appendChild(defs);
  var disco = cerchio(cx, cy, r, fill);
  disco.setAttribute('mask', 'url(#' + idMaschera + ')');
  svg.appendChild(disco);
  var stelle = (stelleBuco ? [[57, 33, 2, 'white', 'n-star-1'], [65, 42, 1.4, 'white', 'n-star-3']] : []).concat(stelleExtra || []);
  for (var i = 0; i < stelle.length; i++) {
    var s = cerchio(stelle[i][0], stelle[i][1], stelle[i][2], stelle[i][3]);
    s.setAttribute('class', stelle[i][4]);
    svg.appendChild(s);
  }
  return svg;
}

/* Le tre linee del vento, disegnate qui: i simboli nell'head non servono più */
var LINEE_VENTO = [
  'M -18 16 L 32 16 Q 44 16 44 8 Q 44 0 34 0',
  'M 2 28 L 52 28 Q 64 28 64 20 Q 64 12 54 12',
  'M 10 40 L 42 40 Q 52 40 52 48 Q 52 56 44 56'
];

function icona(cls, notte) {
  var wrap = el('div', 'wx-icon ' + cls);
  var sole, i;

  if (notte && cls === 'wx-sunny') {
    wrap.className += ' wx-night';
    wrap.appendChild(luna('#ddeeff', 45, 45, 24, 58, 35, 20, 5, true, [
      [14, 16, 2.2, 'white', 'n-star-1'], [74, 12, 1.8, 'white', 'n-star-2'],
      [80, 50, 1.5, 'white', 'n-star-3'], [12, 70, 1.6, 'white', 'n-star-4'], [70, 74, 1.3, 'white', 'n-star-5']
    ]));
    return wrap;
  }
  if (notte && cls === 'wx-partly') {
    wrap.className += ' wx-night has-cloud';
    var svgParz = luna('#ddeeff', 70, 26, 23, 81, 16, 19, 5, false, [
      [77, 14, 1.8, 'white', 'n-star-2'], [83, 22, 1.3, 'white', 'n-star-4'],
      [8, 12, 1.8, 'white', 'n-star-1'], [25, 6, 1.5, 'white', 'n-star-3'],
      [45, 10, 1.3, 'white', 'n-star-5'], [6, 32, 1.4, 'white', 'n-star-2']
    ]);
    svgParz.setAttribute('width', '100%');
    svgParz.setAttribute('height', '100%');
    wrap.appendChild(svgParz);
    wrap.appendChild(el('div', 'cloud'));
    return wrap;
  }
  if (notte && cls === 'wx-hot') {
    wrap.className += ' wx-night';
    wrap.appendChild(luna('#ddeeff', 45, 45, 24, 58, 35, 20, 5, false, [
      [14, 16, 2.0, 'white', 'n-star-1'], [74, 12, 1.6, 'white', 'n-star-2'],
      [80, 52, 1.4, 'white', 'n-star-3'], [12, 68, 1.5, 'white', 'n-star-4']
    ]));
    wrap.appendChild(el('div', 'wx-hot-night-aura'));
    return wrap;
  }
  if (notte && cls === 'wx-foggy') {
    wrap.className += ' wx-night';
    wrap.appendChild(luna('#99ccee', 45, 45, 24, 58, 35, 20, 5, true, [
      [16, 22, 1.6, 'rgba(180,220,255,0.8)', 'n-star-3'],
      [74, 18, 1.4, 'rgba(180,220,255,0.8)', 'n-star-5'],
      [78, 55, 1.2, 'rgba(180,220,255,0.7)', 'n-star-1']
    ]));
    wrap.appendChild(el('div', 'fog'));
    return wrap;
  }

  if (cls === 'wx-sunny' || cls === 'wx-hot') {
    sole = el('div', 'sun');
    sole.appendChild(el('div', 'rays'));
    wrap.appendChild(sole);
  } else if (cls === 'wx-partly') {
    wrap.appendChild(el('div', 'cloud'));
    sole = el('div', 'sun');
    sole.appendChild(el('div', 'rays'));
    wrap.appendChild(sole);
  } else if (cls === 'wx-cloudy') {
    wrap.appendChild(el('div', 'cloud'));
    wrap.appendChild(el('div', 'cloud back'));
  } else if (cls === 'wx-rainy') {
    wrap.appendChild(el('div', 'cloud'));
    wrap.appendChild(el('div', 'rain'));
  } else if (cls === 'wx-thunder') {
    wrap.appendChild(el('div', 'cloud'));
    var lampo = el('div', 'lightning');
    lampo.appendChild(el('div', 'bolt'));
    lampo.appendChild(el('div', 'bolt'));
    wrap.appendChild(lampo);
  } else if (cls === 'wx-snow') {
    wrap.appendChild(el('div', 'cloud'));
    var neve = el('div', 'snow');
    for (i = 0; i < 4; i++) {
      var fiocco = el('div', 'snowflake');
      var sp = el('span');
      sp.textContent = '\u2744';
      fiocco.appendChild(sp);
      neve.appendChild(fiocco);
    }
    wrap.appendChild(neve);
  } else if (cls === 'wx-foggy') {
    wrap.appendChild(el('div', 'fog-sun'));
    wrap.appendChild(el('div', 'fog'));
  } else if (cls === 'wx-windy') {
    var svgVento = elSvg('svg');
    svgVento.setAttribute('viewBox', '0 0 80 60');
    for (i = 0; i < LINEE_VENTO.length; i++) {
      var linea = elSvg('path');
      linea.setAttribute('d', LINEE_VENTO[i]);
      linea.setAttribute('class', 'w-line');
      svgVento.appendChild(linea);
    }
    var punti = [[18, 22, 2.2, 'w-dot'], [30, 34, 2, 'w-dot w-dot-2'], [10, 10, 1.8, 'w-dot w-dot-3']];
    for (i = 0; i < punti.length; i++) {
      var punto = elSvg('circle');
      punto.setAttribute('cx', punti[i][0]);
      punto.setAttribute('cy', punti[i][1]);
      punto.setAttribute('r', punti[i][2]);
      punto.setAttribute('class', punti[i][3]);
      svgVento.appendChild(punto);
    }
    wrap.appendChild(svgVento);
  } else if (cls === 'wx-hail') {
    var grandine = el('div', 'hail');
    grandine.appendChild(el('div', 'hail-extra'));
    wrap.appendChild(el('div', 'cloud'));
    wrap.appendChild(grandine);
  } else if (cls === 'wx-freezing') {
    var cristallo = el('div', 'ice-crystal');
    cristallo.textContent = '\u2744';
    wrap.appendChild(cristallo);

  /* Icone estreme, solo da override dello staff */
  } else if (cls === 'wx-tornado') {
    var imbuto = el('div', 'tornado-funnel');
    for (i = 0; i < 5; i++) imbuto.appendChild(el('div', 'harsh-wind'));
    wrap.appendChild(imbuto);
  } else if (cls === 'wx-meteor') {
    var scena = el('div', 'meteor-scene');
    var terzo = el('div', 'm-third');
    var ul3 = el('ul');
    ul3.appendChild(el('li'));
    ul3.appendChild(el('li'));
    ul3.appendChild(el('li', 'floating-1'));
    ul3.appendChild(el('li', 'floating-1'));
    ul3.appendChild(el('li', 'floating-2'));
    ul3.appendChild(el('li', 'floating-2'));
    terzo.appendChild(ul3);
    scena.appendChild(terzo);
    var quarto = el('div', 'm-fourth');
    var ul4 = el('ul');
    for (i = 0; i < 7; i++) ul4.appendChild(el('li'));
    for (i = 0; i < 4; i++) ul4.appendChild(el('li', 'm-floating'));
    quarto.appendChild(ul4);
    scena.appendChild(quarto);
    wrap.appendChild(scena);
  } else if (cls === 'wx-tsunami') {
    var onde = el('div', 'wave-wrapper');
    onde.appendChild(el('div', 'wave one'));
    onde.appendChild(el('div', 'wave two'));
    onde.appendChild(el('div', 'wave three'));
    wrap.appendChild(onde);
  } else if (cls === 'wx-heatwave') {
    wrap.appendChild(el('div', 'heat-sun'));
    var cactus = el('div', 'cactus');
    var svgCactus = elSvg('svg');
    svgCactus.setAttribute('viewBox', '0 0 40 48');
    svgCactus.setAttribute('fill', 'none');
    var forme = [
      'M16 44 L16 18 Q16 14 20 14 Q24 14 24 18 L24 44 Z',
      'M 8.5 16 Q 6 16 6 18.5 L 6 32 L 16 32 L 16 27 L 11 27 L 11 18.5 Q 11 16 8.5 16 Z',
      'M 31.5 20 Q 34 20 34 22.5 L 34 36 L 24 36 L 24 31 L 29 31 L 29 22.5 Q 29 20 31.5 20 Z'
    ];
    for (i = 0; i < forme.length; i++) {
      var forma = elSvg('path');
      forma.setAttribute('d', forme[i]);
      forma.setAttribute('fill', '#fff');
      svgCactus.appendChild(forma);
    }
    cactus.appendChild(svgCactus);
    wrap.appendChild(cactus);
  } else if (cls === 'wx-blizzard') {
    wrap.appendChild(el('div', 'ice-aura'));
    var cristalloB = el('div', 'ice-crystal');
    cristalloB.textContent = '\u2744';
    wrap.appendChild(cristalloB);
  }
  return wrap;
}


/* STILI */

var CSS = `#hxh-bar {--hxw-g1: #0e2a2a; --hxw-g2: #0B486B; --hxw-c1: #0e2a2a; --hxw-c2: #0B2533; --hxw-c3: #0e1f2e; --hxw-border: #3B8686; --hxw-accent: #79BD9A; --hxw-text: #E2F7C4; --hxw-title: #CFF09E; --hxw-dim: #8FBEBA; --hxw-mute: #3B8686; --hxw-head: rgba(11,72,107,0.35); --hxw-line: rgba(59,134,134,0.3); --hxw-glow: rgba(59,134,134,0.7); --hxw-glow2: rgba(121,189,154,0.25); --hxw-ring: #CFF09E; --hxw-track: rgba(59,134,134,0.35); --hxw-badge: #0B486B; --hxw-badge-border: #3B8686; --hxw-badge-text: #E2F7C4}
#hxh-bar {position: fixed; top: 150px; left: 12px; z-index: 9; font-family: 'Montserrat', Georgia, serif}
#hxh-bar.hxw-mobile {position: static}
.hxw-orb {position: relative; width: 60px; height: 60px; border-radius: 50%; background: radial-gradient(circle at 50% 35%, var(--hxw-g1), var(--hxw-g2)); border: 1px solid var(--hxw-border); display: flex; align-items: center; justify-content: center; cursor: pointer; animation: hxw-pulse 2.5s ease-in-out infinite}
@keyframes hxw-pulse {0%, 100% {box-shadow: 0 3px 12px rgba(0,0,0,0.5), 0 0 6px var(--hxw-glow)} 50% {box-shadow: 0 3px 16px rgba(0,0,0,0.5), 0 0 16px var(--hxw-glow), 0 0 28px var(--hxw-glow2)}}
.hxw-ring {position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg)}
.hxw-ring-track {fill: none; stroke: var(--hxw-track); stroke-width: 2.5}
.hxw-ring-fill {fill: none; stroke: var(--hxw-ring); stroke-width: 2.5; stroke-linecap: round}
.hxw-orb-icon {width: 40px; height: 32px; display: flex; align-items: center; justify-content: center}
.hxw-orb-icon .wx-icon {font-size: 3.4px; --wx-scala: 0.8}
.hxw-orb-temp {position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); padding: 1px 8px; border-radius: 8px; border: 1px solid var(--hxw-badge-border); background: var(--hxw-badge); font-size: 10.5px; font-weight: 600; line-height: 1.4; color: var(--hxw-badge-text); white-space: nowrap}
.hxw-card {display: none; position: relative; width: 224px; border-radius: 10px; overflow: hidden; background: linear-gradient(160deg, var(--hxw-c1) 0%, var(--hxw-c2) 60%, var(--hxw-c3) 100%); border: 1px solid var(--hxw-border); box-shadow: 0 6px 24px rgba(0,0,0,0.55)}
#hxh-bar.hxw-open .hxw-orb {display: none}
#hxh-bar.hxw-open .hxw-card {display: block; animation: hxw-in 0.3s ease forwards}
#hxh-bar.hxw-mobile .hxw-card {display: block; width: auto}
@keyframes hxw-in {from {opacity: 0; transform: translateY(-4px)} to {opacity: 1; transform: translateY(0)}}
.hxw-head {display: flex; align-items: center; gap: 7px; padding: 10px 14px; background: var(--hxw-head); border-bottom: 1px solid var(--hxw-line)}
.hxw-head i {font-size: 10px; color: var(--hxw-accent)}
.hxw-name {flex: 1; font-size: 9px; letter-spacing: 2.2px; text-transform: uppercase; color: var(--hxw-title); line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis}
.hxw-close {margin-left: auto; background: none; border: none; padding: 0; color: var(--hxw-mute); cursor: pointer; font-size: 11px; line-height: 1; transition: color 0.2s}
.hxw-close:hover {color: var(--hxw-title)}
.hxw-hero {display: flex; align-items: center; gap: 4px; padding: 14px 14px 12px 8px}
.hxw-hero-icon {width: 86px; height: 66px; flex-shrink: 0; display: flex; align-items: center; justify-content: center}
.hxw-hero-icon .wx-icon {font-size: 7.4px; --wx-scala: 1.5}
.hxw-temp {font-size: 30px; font-weight: 600; color: var(--hxw-text); line-height: 1; letter-spacing: -0.5px}
.hxw-label {margin-top: 5px; font-size: 13px; font-style: italic; color: var(--hxw-title); line-height: 1.2}
.hxw-grid {display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--hxw-line)}
.hxw-cell {padding: 9px 14px}
.hxw-cell + .hxw-cell {border-left: 1px solid var(--hxw-line)}
.hxw-cell-label {margin-bottom: 3px; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: var(--hxw-mute)}
.hxw-cell-value {font-family: 'Courier New', monospace; font-size: 19px; font-weight: bold; color: var(--hxw-text); letter-spacing: 1px; line-height: 1.2}
.hxw-cell-value.hxw-small {padding-top: 4px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 500; color: var(--hxw-dim); letter-spacing: 0}
.hxw-cell-value.hxw-mid {font-size: 14px}
.hxw-foot {background: var(--hxw-head)}
.hxw-foot .hxw-cell {text-align: center}
.hxw-foot .hxw-cell + .hxw-cell {border-left: none}
.hxw-foot .hxw-cell-label i {margin-right: 4px; color: var(--hxw-accent)}
.wx-icon {position: relative; display: inline-block; width: 10em; height: 8em; font-size: 4.2px; color: #b0bec5}
.cloud {position: absolute; z-index: 1; top: 50%; left: 50%; width: 3.6875em; height: 3.6875em; margin: -1.84375em; background: currentColor; border-radius: 50%; box-shadow: -2.1875em 0.6875em 0 -0.6875em, 2.0625em 0.9375em 0 -0.9375em, 0 0 0 0.375em #fff, -2.1875em 0.6875em 0 -0.3125em #fff, 2.0625em 0.9375em 0 -0.5625em #fff}
.cloud::after {content: ""; position: absolute; bottom: 0; left: -0.5em; display: block; width: 4.5625em; height: 1em; background: currentColor; box-shadow: 0 0.4375em 0 -0.0625em #fff}
.cloud.back {z-index: 0; background: #fff; box-shadow: -2.1875em 0.6875em 0 -0.6875em #fff, 2.0625em 0.9375em 0 -0.9375em #fff, 0 0 0 0.375em #fff, -2.1875em 0.6875em 0 -0.3125em #fff, 2.0625em 0.9375em 0 -0.5625em #fff; opacity: 1; transform: scale(0.5) translate(7.5em, -3em); animation: cloud-drift 4s linear infinite}
.cloud.back::after {background: #fff}
.sun {position: absolute; top: 50%; left: 50%; width: 2.5em; height: 2.5em; margin: -1.25em; background: currentColor; border-radius: 50%; box-shadow: 0 0 0 0.375em #fff; animation: wx-spin 12s linear infinite}
.rays {position: absolute; top: -2em; left: 50%; display: block; width: 0.375em; height: 1.125em; margin-left: -0.1875em; background: #fff; border-radius: 0.25em; box-shadow: 0 5.375em #fff}
.rays::before, .rays::after {content: ""; position: absolute; top: 0; left: 0; width: 0.375em; height: 1.125em; background: #fff; border-radius: 0.25em; box-shadow: 0 5.375em #fff}
.rays::before {transform: rotate(60deg); transform-origin: 50% 3.25em}
.rays::after {transform: rotate(120deg); transform-origin: 50% 3.25em}
.cloud + .sun {margin: -2em 1em}
.rain, .lightning, .hail {position: absolute; z-index: 2; top: 50%; left: 50%; margin: 3.8em 0 0 -1em}
.snow {position: absolute; z-index: 2; top: 50%; left: 50%; margin: 2.6em 0 0 -1em}
.fog, .wind-lines {position: absolute; z-index: 2; top: 50%; left: 50%; transform: translate(-50%, -50%)}
.rain::after {content: ""; position: absolute; z-index: 2; top: 50%; left: 50%; width: 1.125em; height: 1.125em; margin: -1em 0 0 -0.25em; background: #6cf; border-radius: 100% 0 60% 50% / 60% 0 100% 50%; box-shadow: 0.625em 0.875em 0 -0.125em rgba(255,255,255,0.2), -0.875em 1.125em 0 -0.125em rgba(255,255,255,0.2), -1.375em -0.125em 0 rgba(255,255,255,0.2); transform: rotate(-28deg); animation: wx-rain 2.5s linear infinite}
.bolt {position: absolute; top: 50%; left: 50%; margin: -0.25em 0 0 -0.125em; color: #fff; opacity: 0.3; animation: wx-lightning 2s linear infinite}
.bolt:nth-child(2) {transform: translate(1.9em, 0.9em) scale(0.6); transform-origin: 0 0; opacity: 0.2; animation: wx-lightning 1.5s linear infinite}
.bolt::before, .bolt::after {content: ""; position: absolute; z-index: 2; top: 50%; left: 50%; margin: -1.625em 0 0 -1.0125em; border-top: 1.25em solid transparent; border-right: 0.75em solid; border-bottom: 0.75em solid; border-left: 0.5em solid transparent; transform: skewX(-10deg)}
.bolt::after {margin: -0.25em 0 0 -0.25em; border-top: 0.75em solid; border-right: 0.5em solid transparent; border-bottom: 1.25em solid transparent; border-left: 0.75em solid}
.snowflake {position: absolute; top: 0; color: #fff !important; line-height: 1; animation: wx-snowfall linear infinite}
.snowflake span {display: block; color: #fff !important; animation: wx-spin linear infinite}
.snowflake:nth-child(1) {left: -0.8em; font-size: 1.4em; opacity: 0.9; animation-duration: 2.2s; animation-delay: 0s}
.snowflake:nth-child(2) {left: 0.4em; font-size: 1.0em; opacity: 0.7; animation-duration: 2.7s; animation-delay: 0.7s}
.snowflake:nth-child(3) {left: 1.4em; font-size: 1.2em; opacity: 0.8; animation-duration: 2.0s; animation-delay: 1.4s}
.snowflake:nth-child(4) {left: -0.1em; font-size: 0.8em; opacity: 0.55; animation-duration: 2.5s; animation-delay: 0.35s}
.snowflake:nth-child(1) span {animation-duration: 6s}
.snowflake:nth-child(2) span {animation-duration: 9s; animation-direction: reverse}
.snowflake:nth-child(3) span {animation-duration: 7s}
.snowflake:nth-child(4) span {animation-duration: 11s; animation-direction: reverse}
.hail::before {content: ""; position: absolute; top: 0; left: 0.3em; width: 0.85em; height: 0.85em; background: #aef; border-radius: 50%; animation: wx-hail 1s ease-in infinite 0s}
.hail::after {content: ""; position: absolute; top: 0; left: 1.5em; width: 0.75em; height: 0.75em; background: #aef; border-radius: 50%; animation: wx-hail 1s ease-in infinite 0.35s}
.hail-extra {position: absolute; top: 0; left: -0.1em; width: 0.65em; height: 0.65em; background: rgba(174,238,255,0.7); border-radius: 50%; animation: wx-hail 1s ease-in infinite 0.65s}
.wx-foggy .fog-sun {position: absolute; top: 50%; left: 50%; width: 5em; height: 5em; margin: -2.5em 0 0 -2.5em; background: radial-gradient(circle, rgba(255,220,100,0.9) 0%, rgba(255,180,50,0.6) 60%, rgba(255,150,30,0.2) 100%); border-radius: 50%; box-shadow: 0 0 1.5em rgba(255,200,80,0.4)}
.fog::before {content: ""; position: absolute; top: 50%; left: 50%; width: 7em; height: 0.55em; margin: -0.2em 0 0 -3.8em; background: rgba(220,220,220,0.92); border-radius: 0.3em; box-shadow: 0.3em 1.3em 0 0.05em rgba(220,220,220,0.82); animation: wx-fog 3s ease-in-out infinite}
.fog::after {content: ""; position: absolute; top: 50%; left: 50%; width: 5.5em; height: 0.55em; margin: 1.1em 0 0 -2.7em; background: rgba(210,210,210,0.78); border-radius: 0.3em; box-shadow: -0.4em 1.3em 0 0.03em rgba(210,210,210,0.65); animation: wx-fog 3s ease-in-out infinite 1.5s}
.wx-windy svg {position: absolute; top: 50%; left: 50%; transform: translate(-38%, -50%); width: 8em; height: 6em; overflow: visible}
.wx-windy .w-line {fill: none; stroke: rgba(255,255,255,0.85); stroke-width: 2.8; stroke-linecap: round}
.wx-windy .w-line:nth-child(2) {stroke: rgba(255,255,255,0.7)}
.wx-windy .w-line:nth-child(3) {stroke: rgba(255,255,255,0.55)}
.wx-windy .w-line:nth-child(1) {animation: wx-wind-draw 2.8s ease-in-out infinite 0.4s}
.wx-windy .w-line:nth-child(2) {animation: wx-wind-draw 2.8s ease-in-out infinite 0s}
.wx-windy .w-line:nth-child(3) {animation: wx-wind-draw 2.8s ease-in-out infinite 0.8s}
.wx-windy .w-dot {fill: rgba(255,255,255,0.75); animation: wx-wind-dot 1.4s ease-in-out infinite}
.wx-windy .w-dot-2 {animation-delay: 0.45s}
.wx-windy .w-dot-3 {animation-delay: 0.9s}
.wx-night .moon-svg {position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10em; height: 10em; overflow: visible; z-index: 0}
.wx-night.has-cloud .moon-svg {width: 100%; height: 100%}
.n-star-1 {animation: wx-star 2.8s ease-in-out infinite}
.n-star-2 {animation: wx-star 2.8s ease-in-out infinite 1s}
.n-star-3 {animation: wx-star 2.8s ease-in-out infinite 2s}
.n-star-4 {animation: wx-star 2.8s ease-in-out infinite 1.5s}
.n-star-5 {animation: wx-star 2.8s ease-in-out infinite 0.5s}
.ice-crystal {position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #adf; font-size: 6em; line-height: 1; text-shadow: 0 0 0.15em rgba(170,220,255,1), 0 0 0.4em rgba(170,220,255,0.6); animation: wx-spin-center 14s linear infinite}
.ice-crystal::before {content: "\\2744"; position: absolute; font-size: 0.4em; top: 0.3em; left: -0.8em; opacity: 0.55; animation: wx-spin 8s linear infinite reverse}
.ice-crystal::after {content: "\\2744"; position: absolute; font-size: 0.35em; top: 1.6em; left: 2em; opacity: 0.4; animation: wx-spin 6s linear infinite}
.wx-hot-night-aura {position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 6em; height: 6em; border-radius: 50%; background: radial-gradient(circle, transparent 35%, rgba(255,120,0,0.22) 60%, rgba(255,80,0,0.10) 80%, transparent 100%); animation: hot-night-pulse 3s ease-in-out infinite; z-index: 1; pointer-events: none}
@keyframes hot-night-pulse {0%, 100% {transform: translate(-50%, -50%) scale(1); opacity: 0.7} 50% {transform: translate(-50%, -50%) scale(1.35); opacity: 1.0}}
.wx-hot {color: #f93}
.wx-icon.wx-partly:not(.wx-night) {transform: translateY(0.8em)}
.wx-icon.wx-cloudy:not(.wx-night) {transform: translateY(0.4em)}
.wx-icon.wx-rainy:not(.wx-night) {transform: translateY(-1.5em)}
.wx-icon.wx-thunder:not(.wx-night) {transform: translateY(-1.5em)}
.wx-icon.wx-snow:not(.wx-night) {transform: translateY(-2.15em)}
.wx-icon.wx-foggy:not(.wx-night) {transform: translateY(-0.25em)}
.wx-icon.wx-windy:not(.wx-night) {transform: translateY(0.2em)}
.wx-icon.wx-hail:not(.wx-night) {transform: translateY(-2.1em)}
.wx-icon.wx-freezing:not(.wx-night) {transform: translateY(0.4em)}
.wx-icon.wx-sunny.wx-night {transform: translateY(0.25em)}
.wx-icon.wx-partly.wx-night {transform: translateY(0.7em)}
.wx-icon.wx-hot.wx-night {transform: translateY(0.55em)}
.wx-icon.wx-tornado:not(.wx-night) {transform: translateY(0.8em)}
.wx-icon.wx-tsunami:not(.wx-night) {transform: translateY(-0.75em)}
.wx-icon.wx-heatwave:not(.wx-night) {transform: translateY(-0.35em)}
.wx-hot .sun {background: #f93; box-shadow: 0 0 0 0.375em #fff; animation: wx-spin 12s linear infinite, wx-hot-pulse 2.5s ease-in-out infinite}
@keyframes wx-spin {100% {transform: rotate(360deg)}}
@keyframes wx-spin-center {from {transform: translate(-50%, -50%) rotate(0deg)} to {transform: translate(-50%, -50%) rotate(360deg)}}
@keyframes cloud-drift {0% {opacity: 0} 50% {opacity: 0.7} 100% {opacity: 0; transform: scale(0.5) translate(-240%, -4em)}}
@keyframes wx-rain {0% {background: #6cf; box-shadow: 0.625em 0.875em 0 -0.125em rgba(255,255,255,0.2), -0.875em 1.125em 0 -0.125em rgba(255,255,255,0.2), -1.375em -0.125em 0 #6cf} 25% {box-shadow: 0.625em 0.875em 0 -0.125em rgba(255,255,255,0.2), -0.875em 1.125em 0 -0.125em #6cf, -1.375em -0.125em 0 rgba(255,255,255,0.2)} 50% {background: rgba(255,255,255,0.3); box-shadow: 0.625em 0.875em 0 -0.125em #6cf, -0.875em 1.125em 0 -0.125em rgba(255,255,255,0.2), -1.375em -0.125em 0 rgba(255,255,255,0.2)} 100% {box-shadow: 0.625em 0.875em 0 -0.125em rgba(255,255,255,0.2), -0.875em 1.125em 0 -0.125em rgba(255,255,255,0.2), -1.375em -0.125em 0 #6cf}}
@keyframes wx-lightning {45% {color: #fff; background: #fff; opacity: 0.2} 50% {color: #0cf; background: #0cf; opacity: 1} 55% {color: #fff; background: #fff; opacity: 0.2}}
@keyframes wx-snowfall {0% {transform: translateY(0); opacity: 0} 15% {opacity: 1} 85% {opacity: 0.9} 100% {transform: translateY(2.2em); opacity: 0}}
@keyframes wx-hail {0% {transform: translateY(0); opacity: 1} 80% {opacity: 0.8} 100% {transform: translateY(2em); opacity: 0}}
@keyframes wx-fog {0%, 100% {transform: translateX(0); opacity: 0.7} 50% {transform: translateX(0.5em); opacity: 0.4}}
@keyframes wx-wind-draw {0% {transform: translateX(-12px); opacity: 0} 20% {opacity: 1} 80% {opacity: 1} 100% {transform: translateX(12px); opacity: 0}}
@keyframes wx-wind-dot {0% {transform: translateX(-10px); opacity: 0} 20% {opacity: 0.85} 80% {opacity: 0.85} 100% {transform: translateX(14px); opacity: 0}}
@keyframes wx-star {0%, 100% {opacity: 1} 50% {opacity: 0.2}}
@keyframes wx-hot-pulse {0%, 100% {box-shadow: 0 0 0 0.375em #fff, 0 0 0 0.9em rgba(255,153,0,0.2)} 50% {box-shadow: 0 0 0 0.375em #fff, 0 0 0 1.4em rgba(255,153,0,0.3)}}
.tornado-funnel {position: absolute; top: 8%; left: 50%; transform: translateX(-42%) rotate(-10deg)}
.harsh-wind {margin: 0.35em 0; background: #b0bec5; border-radius: 0.2em; height: 0.7em; animation: harsh-wind 2s infinite ease-in-out}
.harsh-wind:nth-child(1) {width: 6.5em; animation-delay: 0s}
.harsh-wind:nth-child(2) {width: 4em; animation-delay: 0.3s; margin-left: 1em}
.harsh-wind:nth-child(3) {width: 2.2em; animation-delay: 0.6s; margin-left: 1.9em}
.harsh-wind:nth-child(4) {width: 1em; animation-delay: 0.9s; margin-left: 2.5em}
.harsh-wind:nth-child(5) {width: 0.5em; animation-delay: 1.2s; margin-left: 2.85em}
@keyframes harsh-wind {0% {transform: translateX(-0.5em)} 50% {transform: translateX(0.5em)} 100% {transform: translateX(-0.5em)}}
.meteor-scene {position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg) scale(var(--wx-scala, 1)); width: 18px; height: 15px}
.meteor-scene > div {border-radius: 100px 0 0 100px; transform: translate(-50%, -50%); left: 50%; top: 50%; position: absolute}
.meteor-scene > div ul {margin: 0; padding: 0}
.meteor-scene > div ul li {list-style: none; display: block}
.m-third {background-color: #f93; height: 18px; width: 18px; margin-left: -2px; box-shadow: 0 0 4px #f93}
.m-third li {border-radius: 300px; position: relative; left: 0}
.m-third li:nth-child(1) {width: 10px; height: 2px; background: #f93; margin-left: 9px; animation: m-anim1 1s ease infinite}
.m-third li:nth-child(2) {width: 16px; height: 2px; background: #f93; margin-left: 9px; margin-top: 14px; animation: m-anim1 1s ease infinite; animation-delay: 0.5s}
.m-third li.floating-1 {position: absolute; top: 0; height: 2px; box-shadow: 0 0 2px #f93; background: #f93}
.m-third li.floating-2 {position: absolute; bottom: 0; height: 2px; background: #f93}
.m-third li:nth-child(3) {width: 7px; left: 11px; animation: m-f1 2s ease-out infinite}
.m-third li:nth-child(4) {width: 3px; left: 20px; animation: m-f11 1.8s ease-out infinite}
.m-third li:nth-child(5) {width: 5px; left: 0; animation: m-f11 1s ease-out infinite; animation-delay: 0.3s}
.m-third li:nth-child(6) {width: 2px; left: 0; animation: m-f11 1.5s ease-out infinite; animation-delay: 0.5s}
.m-fourth {width: 15px; height: 15px; margin-left: -2px; background: #fff; box-shadow: 0 0 4px #fff}
.m-fourth li {position: relative; border-radius: 200px}
.m-fourth li:nth-child(1) {width: 16px; height: 2px; background: #fff; left: 9px; box-shadow: 0 0 2px #fff; animation: m-anim2 1.5s ease-out infinite}
.m-fourth li:nth-child(2) {background: radial-gradient(circle at 100% 50%, rgba(204,0,0,0) 1px, #fff 2px); width: 13px; height: 2px; margin-left: 9px; animation: m-anim3 1.6s ease-out infinite; animation-delay: 0.5s}
.m-fourth li:nth-child(3) {width: 19px; height: 2px; background: #fff; left: 8px; box-shadow: 0 0 2px #fff; animation: m-anim2 1.2s ease-out infinite; animation-delay: 1s}
.m-fourth li:nth-child(4) {background: radial-gradient(circle at 100% 50%, rgba(204,0,0,0) 1px, #fff 2px); width: 12px; height: 2px; margin-left: 13px; animation: m-anim3 2s ease-out infinite; animation-delay: 0.5s}
.m-fourth li:nth-child(5) {width: 15px; height: 2px; background: #fff; left: 10px; box-shadow: 0 0 2px #fff; animation: m-anim4 2s ease-out infinite; animation-delay: 0.5s}
.m-fourth li:nth-child(6) {background: radial-gradient(circle at 100% 50%, rgba(204,0,0,0) 1px, #fff 2px); width: 12px; height: 2px; margin-left: 13px; animation: m-anim3 1s ease-out infinite; animation-delay: 0.5s}
.m-fourth li:nth-child(7) {width: 17px; height: 2px; background: #fff; left: 9px; box-shadow: 0 0 2px #fff; animation: m-anim2 1.3s ease-out infinite; animation-delay: 0.5s}
.m-floating {position: absolute; background: #fff; border-radius: 100px; box-shadow: 0 0 2px #85EDE8; z-index: -2; opacity: 0}
.m-fourth li:nth-child(8) {width: 2px; height: 2px; top: -13px; left: 9px; animation: m-float1 3s ease infinite; animation-delay: 0.4s}
.m-fourth li:nth-child(9) {width: 2px; height: 2px; top: -9px; animation: m-float2 3s ease infinite; animation-delay: 2.5s}
.m-fourth li:nth-child(10) {width: 2px; height: 2px; top: -9px; left: 9px; animation: m-float3 3s ease infinite; animation-delay: 1.5s}
.m-fourth li:nth-child(11) {width: 2px; height: 2px; top: -13px; left: 9px; animation: m-float4 3s ease infinite; animation-delay: 1.5s}
@keyframes m-anim1 {0% {left: 0} 50% {left: 5px} 100% {left: 0}}
@keyframes m-anim2 {0% {left: 8px} 50% {left: 12px} 100% {left: 8px}}
@keyframes m-anim3 {0% {left: 0} 50% {left: 1px} 100% {left: 0}}
@keyframes m-anim4 {0% {left: 10px} 50% {left: 15px} 100% {left: 10px}}
@keyframes m-f1 {0% {left: 2px; width: 13px} 50% {left: 28px; opacity: 0.5; width: 9px} 60% {left: 28px; opacity: 0; width: 1px} 100% {left: 2px; opacity: 0; width: 0}}
@keyframes m-f11 {0% {left: 11px} 50% {left: 34px; opacity: 0.5} 60% {opacity: 0; left: 34px} 100% {left: 11px; opacity: 0}}
@keyframes m-float1 {0% {left: 9px; opacity: 0} 50% {left: 29px; opacity: 1} 70% {left: 29px; opacity: 0} 100% {left: 9px; opacity: 0}}
@keyframes m-float2 {0% {left: 10px; opacity: 0} 50% {left: 32px; opacity: 1} 70% {left: 32px; opacity: 0} 100% {left: 10px; opacity: 0}}
@keyframes m-float3 {0% {left: 9px; opacity: 0} 50% {left: 29px; opacity: 1} 70% {left: 29px; opacity: 0} 100% {left: 9px; opacity: 0}}
@keyframes m-float4 {0% {left: 9px; opacity: 0} 50% {left: 33px; opacity: 1} 70% {left: 33px; opacity: 0} 100% {left: 9px; opacity: 0}}
.wave-wrapper {position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 7em; height: 7em; overflow: hidden; border-radius: 50%; background-color: transparent}
.wave {position: absolute; top: 42%; left: -50%; width: 14em; height: 14em; border-radius: 25%; animation: waves linear infinite}
.wave.one {background-color: #3a6aaa; animation-duration: 7s}
.wave.two {background-color: #fff; animation-duration: 9s}
.wave.three {background-color: #6cf; animation-duration: 12s}
@keyframes waves {0% {transform: rotate(0deg)} 100% {transform: rotate(360deg)}}
.wx-heatwave .heat-sun {position: absolute; top: 40%; left: 62%; width: 3.6em; height: 3.6em; margin: -1.6em -1.6em; background: #f93; border-radius: 50%; box-shadow: 0 0 0 0.375em #fff; animation: wx-hot-pulse 2.5s ease-in-out infinite; z-index: 0}
.wx-heatwave .cactus {position: absolute; top: 52%; left: 36%; transform: translate(-50%, -50%); z-index: 1}
.wx-heatwave .cactus svg {display: block; width: 6.6em; height: 8em}
.ice-aura {position: absolute; top: 50%; left: 50%; width: 7em; height: 7em; border-radius: 50%; background: radial-gradient(circle, rgba(130,190,240,0.55) 0%, rgba(130,190,240,0.25) 45%, rgba(130,190,240,0.05) 70%, transparent 100%); animation: ice-pulse 2.5s ease-in-out infinite; z-index: 0}
.wx-blizzard .ice-crystal {font-size: 8em; color: #fff; text-shadow: none; z-index: 1}
.wx-blizzard .ice-crystal::before, .wx-blizzard .ice-crystal::after {display: none}
@keyframes ice-pulse {0%, 100% {transform: translate(-50%, -50%) scale(1)} 50% {transform: translate(-50%, -50%) scale(1.2)}}`;

function aggiungiStile() {
  if (document.getElementById('hxh-meteo-stile')) return;
  var s = el('style');
  s.id = 'hxh-meteo-stile';
  s.textContent = CSS;
  document.head.appendChild(s);
}


/* AVVIO */

function quandoDom(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
}

function avvia(opzioni) {
  if (stato.forum) return;
  opzioni = opzioni || {};
  var config = {};
  var k;
  for (k in DATI) config[k] = DATI[k];
  for (k in opzioni) config[k] = opzioni[k];

  var forum = config.FORUM ? config.FORUM[location.hostname] : null;
  if (!forum) {
    console.warn('[HxHMeteo] dominio non presente in FORUM: ' + location.hostname);
    return;
  }

  stato.config = config;
  stato.forum = forum;
  if (config.FIREBASE) stato.firebase = config.FIREBASE;

  preparaAlbero(config.LUOGHI || [], null, 0);
  if (!stato.predefinito) stato.predefinito = stato.radici[0] || null;
  if (!stato.predefinito) {
    console.warn('[HxHMeteo] nessun luogo in LUOGHI');
    return;
  }

  stato.emisfero = leggiCacheEmisfero() || (emisferoValido(config.EMISFERO) ? config.EMISFERO : 'australe');
  stato.tempo = leggiCache() || tempoDaConfig(config.TEMPO) || { giocoMs: Date.now(), realeMs: Date.now(), velocita: 1 };

  var lista = attese;
  attese = [];
  for (var i = 0; i < lista.length; i++) {
    try { lista[i](); } catch (e) { console.error('[HxHMeteo]', e); }
  }

  aggiungiStile();
  caricaDati();

  quandoDom(function() {
    stato.luogo = luogoPagina();
    costruisci();
    aggiorna();
    setInterval(aggiorna, 5000);
    setInterval(function() {
      if (!document.hidden) caricaDati();
    }, 60000);
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden && Date.now() - stato.caricato > 60000) caricaDati();
    });
  });
}

/* Esegue fn quando avvia() è stato chiamato (subito se lo è già) */
function pronto(fn) {
  if (stato.forum) fn();
  else attese.push(fn);
}


/* API */

window.HxHMeteo = {
  avvia:   avvia,
  pronto:  pronto,

  /* Meteo di una sezione per ID, o null se la sezione non è tra i luoghi.
     Restituisce { luogo, ora, data, label, icon, temp, notte } */
  meteo: function(id) {
    var n = stato.perId[String(id)];
    return n ? meteoNodo(n) : null;
  },

  /* Ora e data locali di un luogo: { ora, data } */
  dataOra: function(nodo) {
    return dataOra(nodo || stato.predefinito);
  },

  forum:       function() { return stato.forum; },
  firebase:    function() { return stato.firebase; },
  albero:      function() { return stato.radici; },
  nodo:        function(id) { return stato.perId[String(id)] || null; },
  predefinito: function() { return stato.predefinito; },
  luogo:       function() { return stato.luogo; },
  tempoGioco:  function() { return tempoGioco(); },
  emisfero:    function() { return stato.emisfero; },

  /* Stagione in corso in un luogo (predefinito se non indicato), in italiano */
  stagione: function(nodo) {
    var n = nodo || stato.predefinito;
    var mostra = n.comePadre ? n.padre : n;
    var st = stagione(new Date(tempoGioco() + mostra.fuso * ORA).getUTCMonth());
    var nomi = { summer: 'Estate', autumn: 'Autunno', winter: 'Inverno', spring: 'Primavera' };
    return nomi[st];
  },
  ancora:      function() { return { giocoMs: stato.tempo.giocoMs, realeMs: stato.tempo.realeMs, velocita: stato.tempo.velocita }; },
  ricarica:    function(fatto) { caricaDati(fatto); }
};

})();
