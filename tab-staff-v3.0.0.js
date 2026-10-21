/**
 * Staff Tasks v3.0.0
 *
 * Aggiunge il tab "Task Staff" al profilo degli staffer. Ogni staffer può
 * assegnare task; il proprietario del profilo le spunta e, una volta
 * completate, le elimina.
 *
 * Dati su Firebase Realtime Database (REST), un nodo per task:
 *   staffTasks/<idUtente>/<idTask> = {
 *       title, assignedBy, assignedById, assignedAt, completed, completedAt
 *   }
 * Le date sono timestamp in millisecondi scritti dal server.
 *
 * Configurazione (blocco HTML del forum, prima dello script):
 *   window.StaffTasksConfig = { dbUrl: 'https://...firebasedatabase.app', tabId: 1013, tabName: 'Task Staff' };
 *
 * @requires HxHFramework
 */

;(function() {
    'use strict';

    var F = window.HxHFramework;
    if (!F) { console.warn('[StaffTasks] HxHFramework non trovato'); return; }

    var BOX_STAFF  = ['box_amministratore', 'box_founder', 'box_globalmod', 'box_gruppo1', 'box_gruppo2', 'box_gruppo3', 'box_gruppo4'];
    var MAX_TITOLO = 300;
    var NODO       = 'staffTasks';

    F.utilities.waitFor(
        function() { return !!window.StaffTasksConfig; },
        function() { quandoPronto(avvia); }
    );

    function quandoPronto(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    // Il profilo visitato appartiene a uno staffer
    function profiloStaff() {
        var box = document.querySelector('div[class*="box_"]');
        if (!box) return false;
        for (var i = 0; i < BOX_STAFF.length; i++) {
            if (box.classList.contains(BOX_STAFF[i])) return true;
        }
        return false;
    }

    function esc(testo) {
        var s = String(testo === null || testo === undefined ? '' : testo);
        var sicuro = s.replace(/[&<>"']/g, function(c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c];
        });
        return sicuro;
    }

    // Accetta timestamp numerici e, per i dati vecchi, date ISO
    function ms(valore) {
        if (typeof valore === 'number') return valore;
        var p = Date.parse(valore);
        return isNaN(p) ? 0 : p;
    }

    function avvia() {
        var C = window.Commons;
        if (!C || !C.location || !C.location.isProfile || !C.location.profile) return;
        if (!F.groups.isStaff() || !profiloStaff()) return;

        var cfg   = window.StaffTasksConfig;
        var dbUrl = String(cfg.dbUrl || '').replace(/\/+$/, '');
        if (!dbUrl) { console.warn('[StaffTasks] dbUrl mancante in StaffTasksConfig'); return; }

        var tabsEl = document.querySelector('.profile .tabs');
        var mainEl = document.querySelector('.profile .main_list');
        if (!tabsEl || !mainEl) return;

        var tabId   = cfg.tabId   || 1013;
        var tabNome = cfg.tabName || 'Task Staff';

        var profiloId = String(parseInt(C.location.profile.id, 10));
        var mioId     = String(C.user && C.user.id);
        var mioNick   = (C.user && C.user.nickname) || 'Sconosciuto';
        var proprio   = profiloId === mioId;
        var base      = dbUrl + '/' + NODO + '/' + profiloId;

        var stato    = { tasks: [], caricate: false, inCaricamento: false };
        var el       = {};
        var timerMsg = null;

        iniettaCss();
        iniettaTab();

        // Firebase REST
        // Nessun header personalizzato: la richiesta non fa preflight CORS

        function fb(metodo, idTask, dati) {
            var opzioni = { method: metodo };
            if (dati !== undefined) opzioni.body = JSON.stringify(dati);
            var url = base + (idTask ? '/' + idTask : '') + '.json';
            var richiesta = fetch(url, opzioni).then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            });
            return richiesta;
        }

        // Caricamento: solo alla prima apertura del tab

        function carica() {
            if (stato.caricate || stato.inCaricamento) return;
            stato.inCaricamento = true;
            el.contenuto.innerHTML = '<p class="st-info">Caricamento task...</p>';

            fb('GET').then(function(dati) {
                stato.tasks    = normalizza(dati);
                stato.caricate = true;
                disegna();
                disegnaForm();
            }).catch(function(e) {
                console.error('[StaffTasks] caricamento:', e);
                el.contenuto.innerHTML = '<p class="st-info">Impossibile caricare le task. Clicca di nuovo sul tab per riprovare.</p>';
            }).then(function() {
                stato.inCaricamento = false;
            });
        }

        function normalizza(dati) {
            var lista = [];
            if (!dati || typeof dati !== 'object') return lista;
            for (var id in dati) {
                if (!dati.hasOwnProperty(id) || !dati[id]) continue;
                var t = dati[id];
                lista.push({
                    id:           id,
                    title:        t.title || '',
                    assignedBy:   t.assignedBy || '?',
                    assignedById: t.assignedById || '',
                    assignedAt:   ms(t.assignedAt),
                    completed:    t.completed === true,
                    completedAt:  t.completed === true ? ms(t.completedAt) : null,
                    inVolo:       false
                });
            }
            return lista;
        }

        function indice(id) {
            for (var i = 0; i < stato.tasks.length; i++) {
                if (stato.tasks[i].id === id) return i;
            }
            return -1;
        }

        // Rendering

        function disegna() {
            var attive = [];
            var fatte  = [];
            for (var i = 0; i < stato.tasks.length; i++) {
                if (stato.tasks[i].completed) fatte.push(stato.tasks[i]);
                else attive.push(stato.tasks[i]);
            }
            attive.sort(function(a, b) { return a.assignedAt - b.assignedAt; });
            fatte.sort(function(a, b) { return (b.completedAt || 0) - (a.completedAt || 0); });

            var html = sezione('Task attive', attive, '');
            if (fatte.length) html += sezione('Task completate', fatte, ' st-completate');
            el.contenuto.innerHTML = html;
        }

        function sezione(titolo, lista, classe) {
            var voci = '';
            for (var i = 0; i < lista.length; i++) voci += voce(lista[i]);
            var html = '<div class="st-sezione' + classe + '">'
                + '<h4>' + titolo + ' <span class="st-conta">(' + lista.length + ')</span></h4>'
                + (lista.length ? '<ul class="st-lista">' + voci + '</ul>' : '<p class="st-vuoto">Nessuna task attiva</p>')
                + '</div>';
            return html;
        }

        function voce(t) {
            var data = t.assignedAt ? F.utilities.dates.formatDate(new Date(t.assignedAt), 'D/M/Y H:I') : '';
            var html = '<li class="st-task' + (t.completed ? ' st-fatta' : '') + '" data-id="' + esc(t.id) + '">';
            if (proprio) {
                html += '<input type="checkbox" class="st-check"' + (t.completed ? ' checked' : '') + (t.inVolo ? ' disabled' : '') + '>';
            }
            html += '<div class="st-corpo">'
                + '<div class="st-titolo">' + esc(t.title) + '</div>'
                + '<div class="st-meta">'
                + '<span class="st-da">Assegnata da: <strong>' + esc(t.assignedBy) + '</strong></span>'
                + (data ? '<span class="st-data">' + data + '</span>' : '')
                + '</div></div>';
            if (proprio && t.completed && !t.inVolo) {
                html += '<button type="button" class="st-elimina" title="Elimina task">&#10005;</button>';
            }
            html += '</li>';
            return html;
        }

        function disegnaForm() {
            var nickEl = document.querySelector('.profile .nick');
            var nick   = nickEl ? nickEl.textContent.trim() : 'questo utente';

            el.aggiungi.innerHTML = '<div class="st-form">'
                + '<h4>Aggiungi task a ' + esc(nick) + '</h4>'
                + '<input type="text" id="st-titolo" maxlength="' + MAX_TITOLO + '" placeholder="Titolo della task...">'
                + '<button type="button" id="st-invia">Aggiungi task</button>'
                + '</div>';

            el.input = document.getElementById('st-titolo');
            el.invia = document.getElementById('st-invia');

            el.invia.addEventListener('click', aggiungi);
            el.input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); aggiungi(); }
            });
        }

        // Azioni (aggiornamento ottimistico: la UI cambia subito,
        // e torna com'era se Firebase rifiuta)

        function aggiungi() {
            var titolo = el.input.value.replace(/\s+/g, ' ').trim();
            if (!titolo) { errore('Scrivi il titolo della task'); el.input.focus(); return; }
            if (el.invia.disabled) return;
            el.invia.disabled = true;

            var dati = {
                title:        titolo,
                assignedBy:   mioNick,
                assignedById: mioId,
                assignedAt:   { '.sv': 'timestamp' },
                completed:    false
            };

            fb('POST', '', dati).then(function(r) {
                stato.tasks.push({
                    id:           r.name,
                    title:        titolo,
                    assignedBy:   mioNick,
                    assignedById: mioId,
                    assignedAt:   Date.now(),
                    completed:    false,
                    completedAt:  null,
                    inVolo:       false
                });
                disegna();
                el.input.value = '';
                successo('Task aggiunta');
            }).catch(function(e) {
                console.error('[StaffTasks] aggiunta:', e);
                errore("Errore nell'aggiunta della task");
            }).then(function() {
                el.invia.disabled = false;
                el.input.focus();
            });
        }

        function cambiaStato(id) {
            var i = indice(id);
            if (i === -1) return;
            var t = stato.tasks[i];
            if (t.inVolo) return;

            var prima = { completed: t.completed, completedAt: t.completedAt };
            t.completed   = !t.completed;
            t.completedAt = t.completed ? Date.now() : null;
            t.inVolo      = true;
            disegna();

            fb('PATCH', id, {
                completed:   t.completed,
                completedAt: t.completed ? { '.sv': 'timestamp' } : null
            }).catch(function(e) {
                console.error('[StaffTasks] aggiornamento:', e);
                t.completed   = prima.completed;
                t.completedAt = prima.completedAt;
                errore("Errore nell'aggiornamento della task");
            }).then(function() {
                t.inVolo = false;
                disegna();
            });
        }

        function elimina(id) {
            var i = indice(id);
            if (i === -1) return;
            var t = stato.tasks[i];
            if (t.inVolo) return;

            stato.tasks.splice(i, 1);
            disegna();

            fb('DELETE', id).catch(function(e) {
                console.error('[StaffTasks] eliminazione:', e);
                stato.tasks.push(t);
                disegna();
                errore("Errore nell'eliminazione della task");
            });
        }

        // Eventi: un solo listener per tipo sul contenitore,
        // valido anche dopo ogni ridisegno

        function suCambio(e) {
            var t = e.target;
            if (!proprio || !t.classList.contains('st-check')) return;
            var li = t.closest('.st-task');
            if (li) cambiaStato(li.getAttribute('data-id'));
        }

        function suClick(e) {
            if (!proprio) return;
            var btn = e.target.closest('.st-elimina');
            if (!btn) return;
            var li = btn.closest('.st-task');
            if (li && confirm('Sei sicuro di voler eliminare questa task?')) elimina(li.getAttribute('data-id'));
        }

        // Messaggi

        function messaggio(testo, tipo) {
            clearTimeout(timerMsg);
            el.messaggio.innerHTML = '<div class="st-msg st-' + tipo + '">' + esc(testo) + '</div>';
            timerMsg = setTimeout(function() { el.messaggio.innerHTML = ''; }, 3000);
        }

        function errore(testo)   { messaggio(testo, 'errore'); }
        function successo(testo) { messaggio(testo, 'ok'); }

        // Iniezione nel profilo

        function iniettaTab() {
            tabsEl.insertAdjacentHTML('beforeend',
                '<li id="t' + tabId + '" class="Sub">'
                + '<a href="#" onclick="javascript:tab(' + tabId + ');return false" rel="nofollow">' + esc(tabNome) + '</a></li>'
            );

            mainEl.insertAdjacentHTML('beforeend',
                '<li id="tab' + tabId + '" class="list nascosta">'
                + '<div id="staff-tasks-container">'
                + '<h3>' + esc(tabNome) + '</h3>'
                + '<div id="st-messaggio"></div>'
                + '<div id="st-contenuto"><p class="st-info">Caricamento task...</p></div>'
                + '<div id="st-aggiungi"></div>'
                + '</div></li>'
            );

            el.contenuto = document.getElementById('st-contenuto');
            el.messaggio = document.getElementById('st-messaggio');
            el.aggiungi  = document.getElementById('st-aggiungi');

            document.querySelector('#t' + tabId + ' a').addEventListener('click', carica);
            el.contenuto.addEventListener('change', suCambio);
            el.contenuto.addEventListener('click', suClick);
        }

        function iniettaCss() {
            if (document.getElementById('st-stile')) return;
            var r = '#staff-tasks-container';
            var regole = [
                r + '{padding:10px}',
                r + ' h3{margin:0 0 10px 0;color:#292354;border-bottom:2px solid #3B8686;padding-bottom:8px;font-weight:bold}',
                r + ' h4{color:#0B486B;margin:0 0 8px 0;font-size:15px;font-weight:bold}',
                r + ' .st-sezione{margin-bottom:15px;background:#E2F7C4;padding:10px;border-radius:8px;border-left:4px solid #3B8686}',
                r + ' .st-sezione.st-completate{border-left-color:#0B486B}',
                r + ' .st-conta{color:#3B8686;font-weight:normal;font-size:13px}',
                r + ' .st-lista{list-style:none;padding:0;margin:0;max-height:200px;overflow-y:auto;overflow-x:hidden}',
                r + ' .st-task{display:flex;align-items:flex-start;gap:8px;padding:8px;background:#8FBEBA;margin-bottom:6px;border-radius:5px;transition:all 0.2s;position:relative}',
                r + ' .st-task:hover{background:#79BD9A;transform:translateX(3px)}',
                r + ' .st-task.st-fatta{opacity:0.6}',
                r + ' .st-task.st-fatta .st-titolo{text-decoration:line-through}',
                r + ' .st-check{width:18px;height:18px;cursor:pointer;flex-shrink:0;margin-top:2px}',
                r + ' .st-check:disabled{cursor:wait}',
                r + ' .st-corpo{flex:1;min-width:0;padding-right:26px}',
                r + ' .st-titolo{color:#292354;font-weight:600;font-size:14px;margin-bottom:4px;word-wrap:break-word}',
                r + ' .st-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:11px}',
                r + ' .st-da{color:#292354;background:#A8DBA8;padding:2px 6px;border-radius:3px}',
                r + ' .st-data{color:#FFF;background:#3B8686;padding:2px 6px;border-radius:3px}',
                r + ' .st-elimina{position:absolute;top:8px;right:8px;background:#d9534f;color:#FFF;border:none;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:14px;line-height:1;padding:0}',
                r + ' .st-elimina:hover{background:#c9302c}',
                r + ' .st-form{background:#E2F7C4;padding:10px;border-radius:8px;border-left:4px solid #79BD9A}',
                r + ' .st-form h4{font-size:14px}',
                r + ' .st-form input{width:100%;padding:8px;margin-bottom:8px;border:2px solid #3B8686;border-radius:5px;font-size:13px;box-sizing:border-box}',
                r + ' .st-form input:focus{outline:none;border-color:#0B486B}',
                r + ' .st-form button{width:100%;padding:10px;background:#3B8686;color:#FFF;border:none;border-radius:5px;font-size:14px;font-weight:bold;cursor:pointer;transition:background 0.2s}',
                r + ' .st-form button:hover{background:#0B486B}',
                r + ' .st-form button:disabled{opacity:0.6;cursor:wait}',
                r + ' .st-msg{padding:8px;border-radius:5px;margin-bottom:10px;text-align:center;font-weight:bold;font-size:12px;color:#FFF}',
                r + ' .st-msg.st-errore{background:#d9534f}',
                r + ' .st-msg.st-ok{background:#79BD9A}',
                r + ' .st-vuoto{color:#3B8686;font-style:italic;padding:8px;margin:0;font-size:13px}',
                r + ' .st-info{text-align:center;color:#0B486B;padding:15px;margin:0;font-size:13px}'
            ];
            var stile = document.createElement('style');
            stile.id = 'st-stile';
            stile.textContent = regole.join('\n');
            document.head.appendChild(stile);
        }
    }

})();
