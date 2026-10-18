// ═══════════════════════════════════════════════════════════════
// CONTATORE CARATTERI VALIDI — textarea di scrittura dei post
// ═══════════════════════════════════════════════════════════════
//  Mostra sotto la textarea i caratteri validi mentre scrivi.
//  Stessa regola dei "caratteri validi" sui post pubblicati:
//    - esclude [quote] [spoiler] [code] [html] col loro contenuto
//    - esclude [img] e i tag BBCode/HTML di formattazione (il testo resta)
//    - esclude il box PG/NPC (riconosciuto dai caratteri ❝ ❞ dentro
//      un contenitore con border-radius e bordo spesso)
//    - non conta gli spazi e gli a capo
//  Funziona uguale su desktop e mobile: lo stesso blocco va bene in entrambi.

;(function() {
	'use strict';
	if (window.__ccvTextarea) return;
	window.__ccvTextarea = true;

	// textarea dei post (risposta completa, risposta rapida, modifica)
	var TA_SEL = 'textarea[name="Post"], textarea#Post';

	// tag BBCode di sola formattazione: si tolgono i tag, il testo resta
	var INLINE_TAGS = 'b|i|u|s|strike|url|color|size|font|center|left|right|justify|align|float|indent|list|\\*|sub|sup|hr|email|tt';

	// ── 1) blocchi da togliere col contenuto (gestisce anche gli annidati) ──
	function stripBlocks(s) {
		var re = /\[(quote|spoiler|code|html|img)(?:=[^\]]*)?\]((?:(?!\[\1(?:=[^\]]*)?\])[\s\S])*?)\[\/\1\]/gi;
		var prev;
		do {
			prev = s;
			s = s.replace(re, ' ');
		} while (s !== prev);
		return s;
	}

	// ── 2) tag BBCode di formattazione ──
	function stripInlineTags(s) {
		var re = new RegExp('\\[\\/?(?:' + INLINE_TAGS + ')(?:=[^\\]]*)?\\]', 'gi');
		return s.replace(re, ' ');
	}

	// ── 3) box PG/NPC ──
	function removeQuoteBoxes(root) {
		var MARKERS = ['❝', '❞']; // ❝ ❞
		var divs = root.querySelectorAll('div');
		var toRemove = [];
		for (var i = 0; i < divs.length; i++) {
			var txt = divs[i].textContent || '';
			if (txt.indexOf(MARKERS[0]) !== -1 || txt.indexOf(MARKERS[1]) !== -1) {
				var box = findBoxAncestor(divs[i], root);
				if (box && toRemove.indexOf(box) === -1) toRemove.push(box);
			}
		}
		for (var j = 0; j < toRemove.length; j++) {
			if (toRemove[j].parentNode) toRemove[j].parentNode.removeChild(toRemove[j]);
		}
	}
	function findBoxAncestor(el, root) {
		var cur = el;
		while (cur && cur !== root) {
			var style = (cur.getAttribute && cur.getAttribute('style')) || '';
			if (/border-radius/i.test(style) && /border-(left|right|top|bottom)\s*:\s*\d/i.test(style)) return cur;
			cur = cur.parentNode;
		}
		return null;
	}

	function removeAll(root, sel) {
		var els = root.querySelectorAll(sel);
		for (var i = 0; i < els.length; i++) {
			if (els[i].parentNode) els[i].parentNode.removeChild(els[i]);
		}
	}

	// ── conteggio ──
	// L'HTML viene interpretato in un documento separato (DOMParser):
	// non esegue script e non carica immagini.
	var parser = new DOMParser();
	function countValid(raw) {
		var s = stripInlineTags(stripBlocks(raw || ''));
		var doc = parser.parseFromString(s, 'text/html');
		var root = doc.body;
		if (!root) return 0;
		removeAll(root, 'script, style');
		removeAll(root, '.spoiler, .quote_top, .quote, .code_top, .code');
		removeQuoteBoxes(root);
		return (root.textContent || '').replace(/\s/g, '').length;
	}

	// ── aggancio alla textarea ──
	function attach(ta) {
		if (ta.getAttribute('data-ccv')) return;
		ta.setAttribute('data-ccv', '1');

		var box = document.createElement('div');
		box.className = 'ccv-counter';
		box.style.cssText = 'display:block;margin:4px 0 0;padding:0;text-align:right;font-size:11px;font-weight:700;line-height:1.4;color:#0B486B;';
		ta.parentNode.insertBefore(box, ta.nextSibling);

		var timer = null;
		var last = null;
		function update() {
			if (ta.value === last) return;
			last = ta.value;
			box.textContent = countValid(ta.value) + ' caratteri validi';
		}
		function schedule() {
			clearTimeout(timer);
			timer = setTimeout(update, 150);
		}
		ta.addEventListener('input', schedule);
		ta.addEventListener('keyup', schedule);
		ta.addEventListener('change', schedule);
		ta._ccvUpdate = update;
		update();
	}

	// controlla periodicamente: aggancia le textarea che compaiono dopo
	// (risposta rapida) e aggiorna il conto quando il testo cambia dai
	// pulsanti dell'editor, che non generano l'evento input.
	function scan() {
		var tas = document.querySelectorAll(TA_SEL);
		for (var i = 0; i < tas.length; i++) {
			attach(tas[i]);
			if (tas[i]._ccvUpdate) tas[i]._ccvUpdate();
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', scan);
	} else {
		scan();
	}
	setInterval(scan, 700);
})();
