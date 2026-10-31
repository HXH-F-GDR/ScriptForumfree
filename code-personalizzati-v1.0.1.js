(function() {
    if (window.__cpboxBound) return;
    window.__cpboxBound = true;

    function pulisci(s) {
        var res = String(s).split('\r').join('').split('\n').join('');
        return res;
    }

    function testoDa(el) {
        var out = '', nodi = el.childNodes, i, n, tag;
        for (i = 0; i < nodi.length; i++) {
            n = nodi[i];
            if (n.nodeType === 3) out += pulisci(n.nodeValue);
            else if (n.nodeType === 1) {
                if (n.nodeName === 'BR') out += '\n';
                else {
                    tag = n.getAttribute('data-tag');
                    if (tag) out += '<' + tag + '>' + testoDa(n) + '</' + tag + '>';
                    else out += testoDa(n);
                }
            }
        }
        return out;
    }

    function avvisa(b, msg) {
        if (!b.getAttribute('data-l')) b.setAttribute('data-l', b.textContent);
        b.textContent = msg;
        setTimeout(function() { b.textContent = b.getAttribute('data-l'); }, 1800);
    }

    function vecchioMetodo(b, testo) {
        var ta = document.createElement('textarea');
        ta.value = testo;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (x) {}
        document.body.removeChild(ta);
        avvisa(b, ok ? 'copiato' : 'copia non riuscita');
    }

    document.addEventListener('click', function(e) {
        var b = e.target && e.target.closest ? e.target.closest('.cpbox-b') : null;
        if (!b) return;
        var box = b.closest('.cpbox');
        var t = box ? box.querySelector('.cpbox-t') : null;
        if (!t) return;
        var testo = testoDa(t);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(testo).then(
                function() { avvisa(b, 'copiato'); },
                function() { vecchioMetodo(b, testo); }
            );
        } else {
            vecchioMetodo(b, testo);
        }
    });
})();
