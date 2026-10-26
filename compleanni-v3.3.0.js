;(function() {

    if (!window.HxHFramework) { console.warn('[BGR] HxHFramework non trovato!'); return; }

    var F  = window.HxHFramework;
    var ST = F.utilities.storage;

    if (!window.BGR_SETTINGS) { console.warn('[BGR] BGR_SETTINGS non trovato!'); return; }
    var SETTINGS = window.BGR_SETTINGS;

    var FB_URL = 'https://compleanni-4035c-default-rtdb.europe-west1.firebasedatabase.app/birthdays-done';

    // Lunghezza massima del messaggio personalizzato
    var MAX_CUSTOM = 600;

    function todayKey() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }

    // Rende sicuro il testo scritto dall'utente (niente HTML che rompa il box) e trasforma gli a capo in <br>
    function formatCustom(text) {
        var out = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        out = out.replace(/\r/g, '').replace(/\n/g, '<br>');
        return out;
    }

    // Legge il nodo di oggi. Prova a ottenere anche l'ETag per la scrittura condizionata;
    // se il browser/CORS non lo permette, ricade su una GET normale (etag = null).
    async function fbRead() {
        var r, etag = null;
        try {
            r = await fetch(FB_URL + '.json', { cache: 'no-store', headers: { 'X-Firebase-ETag': 'true' } });
            etag = r.headers.get('ETag');
        } catch(e) {
            r = await fetch(FB_URL + '.json', { cache: 'no-store' });
        }
        var data = await r.json();
        if (!data || data.date !== todayKey()) data = { date: todayKey(), users: {}, tagged: {} };
        if (!data.users)  data.users  = {};
        if (!data.tagged) data.tagged = {};
        return { data: data, etag: etag };
    }

    // Valore che una mutate può restituire per dire "nessuna modifica, non scrivere".
    var NO_WRITE = {};

    // Lettura-modifica-scrittura. Con l'ETag la PUT riesce solo se nessun altro ha scritto
    // nel frattempo (altrimenti 412 → si rilegge e si riprova), così due utenti che cliccano
    // insieme non possono "prendersi" entrambi il tag.
    async function fbTransaction(mutate) {
        for (var attempt = 0; attempt < 5; attempt++) {
            var res    = await fbRead();
            var result = mutate(res.data);
            if (result === NO_WRITE) return result;
            var opts   = { method: 'PUT', body: JSON.stringify(res.data) };
            if (res.etag) opts.headers = { 'if-match': res.etag };
            var w = await fetch(FB_URL + '.json', opts);
            if (w.ok) return result;
            if (w.status !== 412) throw new Error('Firebase ' + w.status);
        }
        throw new Error('Firebase: troppi conflitti');
    }

    // Salva su Firebase la lista dei festeggiati di oggi letta dal desktop.
    // La versione mobile la usa come riferimento, perché il mobile di ForumFree
    // calcola i compleanni in UTC e fra mezzanotte e le 2 mostra quelli di ieri.
    // Scrive solo se la lista salvata per oggi manca o è diversa.
    async function publishList(birthdays) {
        try {
            await fbTransaction(function(data) {
                if (data.listReady && JSON.stringify(data.list || []) === JSON.stringify(birthdays)) return NO_WRITE;
                data.list = birthdays;
                data.listReady = true;
            });
        } catch(e) { console.warn('[BGR] publishList fallito:', e); }
    }

    async function checkDone(userId) {
        try {
            var res = await fbRead();
            return !!res.data.users[userId];
        } catch(e) { console.warn('[BGR] checkDone fallito:', e); return false; }
    }

    async function markDone(userId) {
        try {
            await fbTransaction(function(data) { data.users[userId] = true; });
        } catch(e) { console.warn('[BGR] markDone fallito:', e); }
    }

    // Riserva il tag per i festeggiati non ancora taggati oggi.
    // Restituisce gli ID che QUESTO utente deve taggare.
    async function claimTags(birthdays, userId) {
        try {
            return await fbTransaction(function(data) {
                var mine = [];
                for (var i = 0; i < birthdays.length; i++) {
                    var id = birthdays[i].id;
                    if (id && !data.tagged[id]) {
                        data.tagged[id] = userId;
                        mine.push(id);
                    }
                }
                return mine;
            });
        } catch(e) { console.warn('[BGR] claimTags fallito:', e); return []; }
    }

    // Se il post fallisce, libera i tag riservati così li farà il prossimo utente.
    async function releaseTags(ids, userId) {
        if (!ids.length) return;
        try {
            await fbTransaction(function(data) {
                for (var i = 0; i < ids.length; i++) {
                    if (data.tagged[ids[i]] === userId) delete data.tagged[ids[i]];
                }
            });
        } catch(e) {}
    }

    window.addEventListener('load', function() {

        if (!F.location.isHome()) return;
        if (F.groups.isGuest()) return;

        F.requests.fetchToken(function(token) {

            var today = new Date().toDateString();
            var userId = String(Commons.user.id);

            // Stato della card: resta anche se la card viene ridotta a bolla e riaperta.
            // inc = festeggiati inclusi (per indice), separate = un messaggio per ciascuno,
            // single = testo unico, per = testi per festeggiato (per indice)
            var state = { ready: false, inc: {}, separate: false, single: '', per: {} };

            var BIRTHDAYS = [];
            var container = document.querySelector('.birthday');
            if (container) {
                var links = container.querySelectorAll('dd a');
                for (var i = 0; i < links.length; i++) {
                    var a    = links.item(i);
                    var href = a.getAttribute('href') || '';
                    var match = href.match(/MID=(\d+)/);
                    BIRTHDAYS.push({ id: match ? match[1] : null, nickname: a.textContent.trim(), url: href });
                }
                // Riferimento per il mobile (anche se oggi non compie gli anni nessuno)
                publishList(BIRTHDAYS);
            }

            // Chi compie gli anni oggi non fa gli auguri a se stesso, ma vede comunque
            // la card per gli altri festeggiati del giorno (se ce ne sono)
            var others = [];
            for (var i = 0; i < BIRTHDAYS.length; i++) {
                if (BIRTHDAYS[i].id != Commons.user.id) others.push(BIRTHDAYS[i]);
            }
            BIRTHDAYS = others;

            if (!BIRTHDAYS.length) return;

            injectFA();
            injectStyles();

            checkDone(userId).then(function(done) {
                if (done) return;
                if (ST.get('bgr-skip') === today) return; // ha scelto di non fare gli auguri oggi
                if (ST.get('bgr-lastcheck') === today) { showBubble(BIRTHDAYS); return; }
                ST.set('bgr-lastcheck', today);
                showCard(BIRTHDAYS);
            });

            function tagFor(p, taggedIds) {
                var t = taggedIds.indexOf(p.id) !== -1 ? '<mark data-uid="' + p.id + '">' + p.nickname + '</mark>' : p.nickname;
                return t;
            }

            function standardLine(tags) {
                var line = '<p style="font-size:14px;font-weight:500;color:#8FBEBA;line-height:1.7;margin:0;">Tanti auguri a ' + tags + ' da parte di tutti noi di <strong style="color:#E2F7C4;font-weight:800;">' + F.constants.FORUM_NAME + '</strong>! <span class="mdi mdi-party-popper" style="color:#CFF09E;"></span></p>';
                return line;
            }

            function customBlock(tags, text) {
                var block = '<p style="font-size:12px;font-weight:700;letter-spacing:1px;color:#79BD9A;line-height:1.6;margin:0 0 10px;">Per ' + tags + ' <span class="mdi mdi-party-popper" style="color:#CFF09E;"></span></p>'
                    + '<p style="font-size:14px;font-weight:500;color:#8FBEBA;line-height:1.7;margin:0;">' + formatCustom(text) + '</p>';
                return block;
            }

            // people = festeggiati inclusi; texts = stringa (messaggio unico) o array (uno per festeggiato)
            function postWish(people, taggedIds, texts, callback) {
                var content = '';
                var i;
                var allEmpty = true;
                if (typeof texts !== 'string') {
                    for (i = 0; i < texts.length; i++) { if (texts[i]) allEmpty = false; }
                }

                if (typeof texts === 'string' || allEmpty) {
                    // Messaggio unico (o messaggi separati tutti vuoti): un solo blocco con tutti i nomi
                    var tags = '';
                    for (i = 0; i < people.length; i++) {
                        if (i > 0) tags += ', ';
                        tags += tagFor(people[i], taggedIds);
                    }
                    content = (typeof texts === 'string' && texts) ? customBlock(tags, texts) : standardLine(tags);
                } else {
                    // Un blocco per festeggiato, separati da una linea tratteggiata
                    for (i = 0; i < people.length; i++) {
                        var tag   = tagFor(people[i], taggedIds);
                        var block = texts[i] ? customBlock(tag, texts[i]) : standardLine(tag);
                        if (i > 0) block = '<div style="border-top:1px dashed rgba(143,190,186,.25);margin-top:14px;padding-top:14px;">' + block + '</div>';
                        content += block;
                    }
                }

                var msg = '<div style="background:linear-gradient(135deg,#1a1040 0%,#0d3b52 100%);border-radius:16px;padding:28px 28px 24px;font-family:Montserrat,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.2);position:relative;overflow:hidden;">'
                    + '<div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;background:rgba(207,240,158,.07);pointer-events:none;"></div>'
                    + '<div style="position:absolute;bottom:-30px;left:-30px;width:120px;height:120px;border-radius:50%;background:rgba(121,189,154,.07);pointer-events:none;"></div>'
                    + '<div style="text-align:center;margin-bottom:20px;">'
                    + '<div style="font-size:36px;margin-bottom:8px;color:#79BD9A;"><i class="fa fa-birthday-cake"></i></div>'
                    + '<div style="font-size:22px;font-weight:900;letter-spacing:-0.5px;background:linear-gradient(90deg,#79BD9A,#CFF09E,#79BD9A);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Buon Compleanno!</div>'
                    + '</div>'
                    + '<div style="background:rgba(255,255,255,.06);border:1px solid rgba(207,240,158,.15);border-radius:12px;padding:16px 18px;text-align:center;margin-bottom:18px;">'
                    + content
                    + '</div>'
                    + '<div style="text-align:center;border-top:1px solid rgba(143,190,186,.15);padding-top:14px;">'
                    + '<span style="font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(143,190,186,.5);">' + F.constants.FORUM_NAME + '</span>'
                    + '</div>'
                    + '</div>';

                F.requests.postComment(token, SETTINGS.sez, SETTINGS.topic, msg, function(ok) {
                    callback(ok);
                });
            }

            function showCard(birthdays) { renderCard(birthdays, true); }
            function showCardFromBubble(birthdays) { renderCard(birthdays, false); }

            // Indici dei festeggiati inclusi, nell'ordine della lista
            function includedIdx(birthdays) {
                var out = [];
                for (var i = 0; i < birthdays.length; i++) { if (state.inc[i]) out.push(i); }
                return out;
            }

            function pillsHTML(birthdays) {
                var h = '';
                for (var i = 0; i < birthdays.length; i++) {
                    h += '<button type="button" class="bgr-pill' + (state.inc[i] ? ' on' : '') + '" data-i="' + i + '" title="' + (state.inc[i] ? 'Escludi dal messaggio' : 'Includi nel messaggio') + '">' + formatCustom(birthdays[i].nickname) + '</button>';
                }
                return h;
            }

            function textsHTML(birthdays) {
                var h = '';
                if (!state.separate) {
                    h = '<textarea class="bgr-text" data-k="all" rows="3" maxlength="' + MAX_CUSTOM + '" placeholder="Scrivi un messaggio tuo (facoltativo)"></textarea>';
                    return h;
                }
                var idx = includedIdx(birthdays);
                for (var j = 0; j < idx.length; j++) {
                    h += '<p class="bgr-for">Per ' + formatCustom(birthdays[idx[j]].nickname) + '</p>'
                        + '<textarea class="bgr-text" data-k="' + idx[j] + '" rows="2" maxlength="' + MAX_CUSTOM + '" placeholder="Messaggio tuo (facoltativo)"></textarea>';
                }
                return h;
            }

            function renderCard(birthdays, autoDismiss) {
                var multi = birthdays.length > 1;
                if (!state.ready) {
                    for (var i = 0; i < birthdays.length; i++) state.inc[i] = true;
                    state.ready = true;
                }

                var namesList = buildNamesList(birthdays);
                var verb = birthdays.length === 1 ? 'compie gli anni oggi!' : 'compiono gli anni oggi!';

                var options = '';
                if (multi) {
                    options = '<p class="bgr-hint">Includi nel messaggio</p>'
                        + '<div class="bgr-pills" id="bgr-pills"></div>'
                        + '<button type="button" class="bgr-switch' + (state.separate ? ' on' : '') + '" id="bgr-switch"><span class="bgr-track"></span>Un messaggio per ciascuno</button>';
                }

                var cardHTML = '<div id="bgr-card">'
                    + '<button class="bgr-close" title="Chiudi"><i class="fa fa-times"></i></button>'
                    + '<div class="bgr-icon"><i class="fa fa-birthday-cake"></i></div>'
                    + '<div class="bgr-body">'
                    + '<p class="bgr-title">Compleanni di oggi!</p>'
                    + '<p class="bgr-subtitle">' + namesList + ' ' + verb + '</p>'
                    + options
                    + '<div class="bgr-texts" id="bgr-texts"></div>'
                    + '<button class="bgr-btn" id="bgr-wish-btn"><i class="fa fa-heart"></i> Fai gli auguri!</button>'
                    + '<button type="button" class="bgr-skip" id="bgr-skip-btn">Non voglio fare gli auguri, oggi</button>'
                    + '</div>'
                    + '</div>';

                document.body.insertAdjacentHTML('beforeend', cardHTML);

                var card     = document.getElementById('bgr-card');
                var wishBtn  = document.getElementById('bgr-wish-btn');
                var textsBox = document.getElementById('bgr-texts');
                var pillsBox = document.getElementById('bgr-pills');
                var switchEl = document.getElementById('bgr-switch');
                var skipBtn  = document.getElementById('bgr-skip-btn');
                var closeBtn = card.querySelector('.bgr-close');
                var autoTimer = null;
                var sending = false;

                // Se l'utente interagisce con la card, non si chiude più da sola
                function stopAutoDismiss() {
                    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
                }

                function refresh() {
                    if (pillsBox) pillsBox.innerHTML = pillsHTML(birthdays);
                    textsBox.innerHTML = textsHTML(birthdays);
                    var tas = textsBox.querySelectorAll('.bgr-text');
                    for (var t = 0; t < tas.length; t++) {
                        var k = tas[t].getAttribute('data-k');
                        tas[t].value = k === 'all' ? state.single : (state.per[k] || '');
                    }
                    wishBtn.disabled = sending || includedIdx(birthdays).length === 0;
                }
                refresh();

                card.addEventListener('focusin', function(ev) {
                    if (ev.target.classList && ev.target.classList.contains('bgr-text')) stopAutoDismiss();
                });

                card.addEventListener('input', function(ev) {
                    var ta = ev.target;
                    if (!ta.classList || !ta.classList.contains('bgr-text')) return;
                    stopAutoDismiss();
                    var k = ta.getAttribute('data-k');
                    if (k === 'all') state.single = ta.value;
                    else state.per[k] = ta.value;
                });

                if (pillsBox) {
                    pillsBox.addEventListener('click', function(ev) {
                        var pill = ev.target.closest ? ev.target.closest('.bgr-pill') : null;
                        if (!pill || sending) return;
                        stopAutoDismiss();
                        var idx = pill.getAttribute('data-i');
                        state.inc[idx] = !state.inc[idx];
                        refresh();
                    });
                }

                if (switchEl) {
                    switchEl.addEventListener('click', function() {
                        if (sending) return;
                        stopAutoDismiss();
                        state.separate = !state.separate;
                        switchEl.classList.toggle('on', state.separate);
                        refresh();
                    });
                }

                wishBtn.addEventListener('click', function() {
                    var idx = includedIdx(birthdays);
                    if (!idx.length || sending) return;
                    stopAutoDismiss();
                    sending = true;

                    var people = [];
                    var texts;
                    for (var p = 0; p < idx.length; p++) people.push(birthdays[idx[p]]);
                    if (state.separate) {
                        texts = [];
                        for (var q = 0; q < idx.length; q++) texts.push((state.per[idx[q]] || '').trim());
                    } else {
                        texts = state.single.trim();
                    }

                    var controls = card.querySelectorAll('textarea, .bgr-pill, .bgr-switch, .bgr-skip');
                    for (var c = 0; c < controls.length; c++) controls[c].disabled = true;
                    wishBtn.disabled = true;
                    wishBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Invio...';

                    claimTags(people, userId).then(function(taggedIds) {
                        postWish(people, taggedIds, texts, function(ok) {
                            var after = ok ? Promise.resolve() : releaseTags(taggedIds, userId);
                            after.then(function() { return markDone(userId); }).then(function() {
                                setTimeout(function() {
                                    document['loca'+'tion']['hre'+'f'] = 'https://' + location.hostname + '/?t=' + SETTINGS.topic + '&view=getlastpost';
                                }, 2000);
                            });
                        });
                    });
                });

                // Rinuncia per oggi: niente card né bollino fino a domani, su questo dispositivo
                // (ST) e su tutti gli altri (Firebase, come se avesse già fatto gli auguri).
                // Non tocca i tag: restano liberi per chi farà gli auguri.
                skipBtn.addEventListener('click', function() {
                    if (sending) return;
                    stopAutoDismiss();
                    sending = true;
                    ST.set('bgr-skip', today);
                    card._minimizing = true;
                    card.style.animation = 'bgr-shrink .4s forwards';
                    setTimeout(function() { if (card.parentNode) card.parentNode.removeChild(card); }, 400);
                    markDone(userId);
                });

                if (autoDismiss) {
                    closeBtn.addEventListener('click', function() { stopAutoDismiss(); minimizeToBubble(card, birthdays); });
                    autoTimer = setTimeout(function() { minimizeToBubble(card, birthdays); }, SETTINGS.toast_duration);
                } else {
                    closeBtn.addEventListener('click', function() {
                        if (card.parentNode) card.parentNode.removeChild(card);
                        showBubble(birthdays);
                    });
                }
            }

            function minimizeToBubble(card, birthdays) {
                if (!card || card._minimizing) return;
                card._minimizing = true;
                card.style.animation = 'bgr-shrink .4s forwards';
                setTimeout(function() {
                    if (card.parentNode) card.parentNode.removeChild(card);
                    showBubble(birthdays);
                }, 400);
            }

            function showBubble(birthdays) {
                document.body.insertAdjacentHTML('beforeend', '<button id="bgr-bubble" title="Compleanni di oggi!"><i class="fa fa-birthday-cake"></i></button>');
                var bubble = document.getElementById('bgr-bubble');
                bubble.addEventListener('click', function() {
                    if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
                    showCardFromBubble(birthdays);
                });
            }

            function buildNamesList(birthdays) {
                var html = '';
                for (var i = 0; i < birthdays.length; i++) {
                    if (i > 0) html += ', ';
                    html += '<a class="bgr-name" href="https://' + location.hostname + birthdays[i].url + '">' + birthdays[i].nickname + '</a>';
                }
                return html;
            }

        });

    });

    function injectFA() {
        if (document.getElementById('bgr-fa')) return;
        var link = document.createElement('link');
        link.id  = 'bgr-fa';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
        document.head.appendChild(link);
    }

    function injectStyles() {
        if (document.getElementById('bgr-styles')) return;
        var css = '@keyframes bgr-slideIn {from {opacity:0;transform:translateY(20px) scale(.95)} to {opacity:1;transform:translateY(0) scale(1)}}'
            + '@keyframes bgr-shrink {from {opacity:1;transform:scale(1)} to {opacity:0;transform:scale(.5)}}'
            + '@keyframes bgr-bubbleIn {from {opacity:0;transform:scale(0)} to {opacity:1;transform:scale(1)}}'
            + '#bgr-card {position:fixed;bottom:24px;left:24px;z-index:9999;display:flex;align-items:flex-start;gap:14px;background:linear-gradient(135deg,#292354 0%,#0B486B 100%);border-radius:20px;box-shadow:0 16px 48px rgba(11,72,107,.5);padding:22px 24px;max-width:320px;max-height:calc(100vh - 48px);overflow-y:auto;box-sizing:border-box;animation:bgr-slideIn .4s cubic-bezier(.22,1,.36,1) forwards;border-top:3px solid #79BD9A;border-bottom:3px solid #79BD9A;font-family:Montserrat,inherit}'
            + '#bgr-card .bgr-close {position:absolute;top:10px;right:12px;background:none;border:none;font-size:11px;color:rgba(143,190,186,.4);cursor:pointer;padding:2px 4px}'
            + '#bgr-card .bgr-close:hover {color:#79BD9A}'
            + '#bgr-card .bgr-icon {width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#79BD9A,#CFF09E);display:flex;align-items:center;justify-content:center;font-size:21px;color:#0B486B;flex-shrink:0}'
            + '#bgr-card .bgr-body {display:flex;flex-direction:column;gap:6px;padding-right:14px;flex:1;min-width:0}'
            + '#bgr-card .bgr-title {margin:0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;background:linear-gradient(90deg,#79BD9A,#CFF09E);-webkit-background-clip:text;-webkit-text-fill-color:transparent}'
            + '#bgr-card .bgr-subtitle {margin:0;font-size:13px;font-weight:500;color:#8FBEBA;line-height:1.55}'
            + '#bgr-card .bgr-name {font-weight:800;color:#CFF09E;text-decoration:none;-webkit-text-fill-color:#CFF09E}'
            + '#bgr-card .bgr-name:hover {text-decoration:underline}'
            + '#bgr-card .bgr-hint {margin:8px 0 0;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(143,190,186,.6)}'
            + '#bgr-card .bgr-pills {display:flex;flex-wrap:wrap;gap:5px}'
            + '#bgr-card .bgr-pill {margin:0;padding:4px 11px;background:transparent;border:1px dashed rgba(143,190,186,.4);border-radius:50px;color:rgba(143,190,186,.55);font-family:Montserrat,inherit;font-size:11px;font-weight:600;line-height:1.3;text-decoration:line-through;cursor:pointer;transition:.2s}'
            + '#bgr-card .bgr-pill.on {background:rgba(121,189,154,.12);border-style:solid;border-color:#79BD9A;color:#CFF09E;text-decoration:none}'
            + '#bgr-card .bgr-pill:disabled {opacity:.5;cursor:default}'
            + '#bgr-card .bgr-switch {display:flex;align-items:center;gap:8px;margin:8px 0 0;padding:0;background:none;border:none;color:#8FBEBA;font-family:Montserrat,inherit;font-size:11px;font-weight:600;text-align:left;cursor:pointer;align-self:flex-start}'
            + '#bgr-card .bgr-switch .bgr-track {position:relative;flex-shrink:0;width:28px;height:16px;border:1px solid rgba(143,190,186,.45);border-radius:50px;box-sizing:border-box;transition:.2s}'
            + '#bgr-card .bgr-switch .bgr-track::after {content:"";position:absolute;top:2px;left:2px;width:10px;height:10px;border-radius:50%;background:rgba(143,190,186,.6);transition:.2s}'
            + '#bgr-card .bgr-switch.on .bgr-track {background:rgba(121,189,154,.18);border-color:#79BD9A}'
            + '#bgr-card .bgr-switch.on .bgr-track::after {left:14px;background:#CFF09E}'
            + '#bgr-card .bgr-switch:disabled {opacity:.5;cursor:default}'
            + '#bgr-card .bgr-for {margin:10px 0 0;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#79BD9A}'
            + '#bgr-card .bgr-text {display:block;box-sizing:border-box;width:100%;min-height:62px;max-height:160px;margin:8px 0 0;padding:9px 12px;background:rgba(255,255,255,.06);border:1px dashed rgba(143,190,186,.35);border-radius:12px;color:#8FBEBA;font-family:Montserrat,inherit;font-size:12px;font-weight:500;line-height:1.5;resize:vertical;outline:none;box-shadow:none;transition:border-color .2s}'
            + '#bgr-card .bgr-text::placeholder {color:rgba(143,190,186,.5);font-style:italic}'
            + '#bgr-card .bgr-text:focus {border-color:#79BD9A}'
            + '#bgr-card .bgr-text:disabled {opacity:.5}'
            + '#bgr-card .bgr-for + .bgr-text {margin-top:4px;min-height:50px}'
            + '#bgr-card .bgr-btn {margin-top:10px;padding:9px 20px;background:transparent;color:#CFF09E;border:1.5px solid #CFF09E;border-radius:50px;font-family:Montserrat,inherit;font-weight:700;font-size:11px;letter-spacing:.5px;cursor:pointer;align-self:flex-start;transition:.2s}'
            + '#bgr-card .bgr-btn:hover {background:#CFF09E;color:#0B486B;transform:translateY(-2px)}'
            + '#bgr-card .bgr-btn:disabled {opacity:.5;cursor:default}'
            + '#bgr-card .bgr-skip {margin:2px 0 0;padding:4px 2px;background:none;border:none;border-bottom:1px dashed rgba(143,190,186,.3);border-radius:0;color:rgba(143,190,186,.6);font-family:Montserrat,inherit;font-size:10px;font-weight:600;letter-spacing:.5px;text-align:left;cursor:pointer;align-self:flex-start;transition:.2s}'
            + '#bgr-card .bgr-skip:hover {color:#8FBEBA;border-bottom-color:#79BD9A}'
            + '#bgr-card .bgr-skip:disabled {opacity:.5;cursor:default}'
            + '#bgr-bubble {position:fixed;bottom:24px;left:24px;z-index:9999;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#292354,#0B486B);color:#79BD9A;border:2px solid #79BD9A;font-size:22px;cursor:pointer;box-shadow:0 4px 20px rgba(11,72,107,.5);animation:bgr-bubbleIn .3s cubic-bezier(.22,1,.36,1) forwards;transition:.3s ease}'
            + '#bgr-bubble:hover {transform:scale(1.1)}';
        var style = document.createElement('style');
        style.id = 'bgr-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

})();
