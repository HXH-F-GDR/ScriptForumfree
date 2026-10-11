/* ═══════════════════════════════════════════════════════════════
   PAROLE CHIAVE EXTRA per Keyword Tooltips
   Le prime 40 stanno su Easy Innovation, qui tutte le altre (nessun limite).
   Deve essere caricato PRIMA dello script di Easy Innovation.

   COME AGGIUNGERE UN OGGETTO: copia un blocco { ... }, incollalo prima
   della "]" finale e cambia i valori. Ogni blocco finisce con una virgola.
   - parola:   il nome che attiva il popup (maiuscole/minuscole non contano,
               apostrofo dritto e tipografico vanno bene entrambi;
               evita i simboli ( ) [ ] ? * +)
   - immagine: link dell'immagine 300x300
   - pack:     nome del pack, deve essere scritto come in HXH_KEYWORD_PACKS
   - campi:    una riga per voce, ["Etichetta", "valore"]
               (i due punti dopo l'etichetta li aggiunge lo script;
               nel valore si puo' usare HTML, es. <br> per andare a capo)
               Una riga senza etichetta si scrive come testo semplice:
               "<b>Nota in grassetto</b>"
   - in alternativa a immagine/campi/pack si puo' scrivere tutto l'HTML
     del popup in   contenuto: "..."   (come gli anelli qui sotto)

   ESEMPIO con i campi:
   {
     parola: "Nome Oggetto",
     immagine: "https://link-immagine.png",
     pack: "Hunter's Ring",
     campi: [
       ["Tipologia", "Equipaggiamento"],
       ["Descrizione", "Testo della descrizione."],
       ["Bonus Passivo", "+100 Istinto Base."]
     ]
   },

   Dentro i valori usa l'apostrofo normale ' senza problemi; se ti serve
   una virgoletta doppia scrivila \"
   Dopo ogni modifica su GitHub, svuota la cache di jsDelivr aprendo:
   https://purge.jsdelivr.net/gh/HXH-F-GDR/ScriptForumfree@main/keyword-tooltips-lista.js
   ═══════════════════════════════════════════════════════════════ */

window.HXH_KEYWORD_PACKS = {
  "Death Bringer": "https://hxhforumgdr.forumcommunity.net/?t=62852432",
  "Hunter's Ring": "https://hxhforumgdr.forumcommunity.net/?t=63288731",
  "Aquapolis": "LINK DEL TOPIC AQUAPOLIS"
};

window.HXH_KEYWORDS = [

  {
    parola: "Anello Del Muschio",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/001.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Riduce leggermente la fatica quando si viaggia in ambienti boscosi.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Marea",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/002.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore si adatta meglio alle superfici scivolose e su queste ha una presa più sicura.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Legno Corroso",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/003.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Permette di riconoscere l'età approssimativa di oggetti in legno.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Cacciatore Primordiale",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/004.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Migliora lievemente l'udito in ambienti naturali.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Edera",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/005.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Facilita la scalata su superfici naturali come alberi o rocce.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Sole D'Oro",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/006.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Fornisce una leggera resistenza alle temperature elevate.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Delle Ali D'Argento",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/007.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Riduce impercettibilmente la rumorosità dei passi.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Fiore Solare",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/008.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Rende il portatore più carismatico quando parla con chi ama la natura.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Aurora Cremisi",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/009.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>La luce riflessa dall'anello è più intensa del normale, utile per segnalazioni.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Luna Di Cristallo",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/010.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Aumenta leggermente la capacità di vedere in penombra.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Pelliccia Sacra",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/011.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Gli animali sono un po' meno diffidenti verso il portatore.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Terra Antica",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/012.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Migliora la stabilità su terreni accidentati.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Corteccia Immortale",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/013.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Permette di distinguere più facilmente le piante velenose.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Viandante Della Roccia",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/014.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore avverte lievi vibrazioni nel terreno sotto i piedi.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Notte Di Piombo",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/015.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Aiuta a rimanere svegli più a lungo, riducendo leggermente la stanchezza mentale.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Metallo Corrotto",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/016.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Attutisce leggermente gli effetti della ruggine sulle armi e sugli oggetti metallici.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Tempesta Verde",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/017.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Piccole scariche statiche si generano con l'attrito, talvolta illuminando debolmente.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Delle Zanne Dorate",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/018.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Conferisce una leggera presenza intimidatoria.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Cenere Rossa",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/019.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Rende il portatore meno sensibile agli odori forti.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Serpe Verde",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/020.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore percepisce meglio le tracce sul terreno.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Equilibrio Smeraldo",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/021.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Aumenta leggermente la coordinazione nei movimenti precisi.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Lupo Antico",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/022.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore è più sensibile ai suoni lontani.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Urlo Del Vulcano",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/023.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore avverte debolmente le variazioni di temperatura nell'ambiente.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Predatore Silenzioso",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/024.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Aumenta lievemente la capacità di muoversi senza farsi notare.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Conchiglia Antica",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Epici/025.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore sente meglio i suoni sott'acqua.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Guerriero D'Acciaio",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/001.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Leggera resistenza agli impatti fisici (nulla di sovrannaturale).<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Sentenza Oscura",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/002.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore percepisce vagamente quando qualcuno gli mente.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Oro Imperiale",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/003.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Aumenta leggermente la fiducia che gli altri ripongono nel portatore.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Custode Della Torre",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/004.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore ha una maggiore resistenza alla stanchezza fisica.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Emissario Smeraldino",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/005.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Piccole creature boschive non vedono il portatore come una minaccia immediata.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Disciplina Runica",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/006.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore apprende più facilmente le basi di lingue sconosciute.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Perla Lunare",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/007.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Rende i sogni del portatore più vividi e talvolta profetici.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Corona Cremisi",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/008.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore è meno influenzato dalla paura in situazioni di pericolo.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Delle Spine D'Ombra",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/009.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore ha un lieve sesto senso per i pericoli imminenti.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Giudice D'Argento",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/010.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore ha una maggiore lucidità nei momenti di crisi.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Roccia Guardiana",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/011.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Riduce leggermente gli effetti secondari degli attacchi fisici.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Sfinge Perduta",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/012.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore riconosce più facilmente sigilli e simboli antichi.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Piramide Dorata",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/013.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore è meno influenzato dai miraggi e dalle illusioni visive.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Occhio Ardente",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/014.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore avverte un leggero calore quando qualcuno nelle vicinanze lo osserva con intenti ostili.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Sangue Di Rubino",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Leggendari/015.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore guarisce leggermente più velocemente da ferite superficiali.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Aurora Del Caos",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/001.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore ha sogni più intensi e a volte riceve visioni di eventi passati.<br><b>Bonus Passivo:</b> +100 Intelligenza Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Notte Stellata",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/002.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore può orientarsi meglio di notte senza l'uso di stelle o strumenti.<br><b>Bonus Passivo:</b> +100 Istinto Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Equinozio Nero",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/003.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore percepisce lievemente l'energia delle persone vicine.<br><b>Bonus Passivo:</b> +100 Istinto Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Portale Celeste",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/004.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore sente un brivido quando è vicino a un passaggio nascosto.<br><b>Bonus Passivo:</b> +100 Fortuna Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Infinito Arcano",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/005.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Gli oggetti intrisi di aura vicino al portatore sembrano pulsare debolmente.<br><b>Bonus Passivo:</b> +100 Istinto Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Delle Dimensioni Perdute",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/006.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore ha una sensibilità maggiore ai cambiamenti nello spazio attorno a lui.<br><b>Bonus Passivo:</b> +100 Intelligenza Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Bestia Dell'Abisso",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/007.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Gli animali notturni sono meno aggressivi verso il portatore.<br><b>Bonus Passivo:</b> +100 Carisma Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Mano Dell'Oscuro",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/008.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore avverte una sensazione di gelo se è vicino a una trappola.<br><b>Bonus Passivo:</b> +100 Istinto Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Occhio Del Leviatano",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/009.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore può trattenere il respiro un po' più a lungo del normale.<br><b>Bonus Passivo:</b> +100 Fortuna Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Nucleo Solare",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/010.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore avverte debolmente i cambiamenti nella pressione atmosferica.<br><b>Bonus Passivo:</b> +100 Intelligenza Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Fiala Alchemica",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/011.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore può riconoscere ingredienti alchemici comuni con maggiore facilità.<br><b>Bonus Passivo:</b> +100 Intelligenza Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Bussola Arcana",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/012.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>L'anello ruota leggermente quando il portatore si trova vicino a qualcosa di significativo per le sue ricerche.<br><b>Bonus Passivo:</b> +100 Intelligenza Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Del Mantello D'Ombra",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/013.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore avverte una leggera sensazione quando è osservato nell'oscurità di acque profonde.<br><b>Bonus Passivo:</b> +100 Istinto Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Torre Dell'Oblio",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/UltraLeggendari/014.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore ha una vaga resistenza ai tentativi di manipolazione mentale.<br><b>Bonus Passivo:</b> +100 Carisma Base.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Delle Stelle Diamantate",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Unici/001.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Brilla debolmente in presenza di energia Nen particolarmente intensa.<br><b>Bonus Passivo:</b> +25% Aura Totale.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Dell'Onda Di Luna",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Unici/002.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore avverte una calma innaturale nelle notti di luna piena e riesce a tramutarla in benessere fisico.<br><b>Bonus Passivo:</b> +25% Vita Totale.<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

  {
    parola: "Anello Della Corona Di Smeraldo",
    contenuto: "<div style=\"background-image: url(https://hhforumgdr.altervista.org/wp-content/Rings/Unici/003.png); background-repeat: no-repeat; width: 125px; height: 125px;border-radius: 10px; border: 2px solid Gainsboro;float:left;margin-right:5px;margin-bottom:5px\"></div><br><b>Descrizione:</b>Il portatore riesce a mantenere la concentrazione più a lungo in situazioni di pericolo.<br><b>Bonus Passivo:</b> il Bonus della Concentrazione viene raddoppiato (30%).<br><b>Expansion Pack: </b><a href=\"https://hxhforumgdr.forumcommunity.net/?t=63288731\">Hunter's Ring</a>"
  },

];
