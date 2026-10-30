(function() {
    if (window.__cpboxBound) return;
    window.__cpboxBound = true;

    function avvisa(b, msg) {
        if (!b.getAttribute('data-l')) b.setAttribute('data-l', b.textContent);
        b.textContent = msg;
        setTimeout(function() { b.textContent = b.getAttribute('data-l'); }, 1800);
    }

    function vecchioMetodo(b, t) {
        var r = document.createRange();
        r.selectNodeContents(t);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (x) {}
        if (ok) { s.removeAllRanges(); avvisa(b, 'copiato'); }
        else avvisa(b, 'premi ctrl+c');
    }

    document.addEventListener('click', function(e) {
        var b = e.target && e.target.closest ? e.target.closest('.cpbox-b') : null;
        if (!b) return;
        var box = b.closest('.cpbox');
        var t = box ? box.querySelector('.cpbox-t') : null;
        if (!t) return;
        var testo = t.innerText;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(testo).then(
                function() { avvisa(b, 'copiato'); },
                function() { vecchioMetodo(b, t); }
            );
        } else {
            vecchioMetodo(b, t);
        }
    });
})();
