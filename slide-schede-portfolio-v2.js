function animaBarre(slide) {
 slide.querySelectorAll('.barra-pg').forEach(function(barra) {
 var target = barra.style.width;
 barra.style.transition = 'none';
 barra.style.width = '0%';
 requestAnimationFrame(function() {
 requestAnimationFrame(function() {
 barra.style.transition = 'width 2s ease';
 barra.style.width = target;
 });
 });
 });
}

function mostraSlide(button, indice) {
 var schedaContainer = button.closest('.scheda-pg-container');

 schedaContainer.querySelectorAll('.bottone-nav').forEach(function(b) {
 b.classList.remove('attivo');
 });
 button.classList.add('attivo');

 var slides = schedaContainer.querySelectorAll('.slide-pg');
 for (var i = 0; i < slides.length; i++) {
 slides[i].style.display = 'none';
 }
 slides[indice].style.display = 'block';

 animaBarre(slides[indice]);
}

function animaBarrePortfolio(slide) {
  slide.querySelectorAll('.portfolio-bc-fill').forEach(function(barra) {
    var target = barra.style.width;
    barra.style.transition = 'none';
    barra.style.width = '0%';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        barra.style.transition = 'width 2s ease';
        barra.style.width = target;
      });
    });
  });
}

function portfolioSlide(button, indice) {
  var container = button.closest('.portfolio-container');
  container.querySelectorAll('.portfolio-bottone').forEach(function(b) { b.classList.remove('attivo'); });
  button.classList.add('attivo');
  container.querySelectorAll('.portfolio-slide').forEach(function(s, i) {
    s.style.display = i === indice ? 'block' : 'none';
  });
  animaBarrePortfolio(container.querySelectorAll('.portfolio-slide')[indice]);
}

// Prepara una scheda: mostra solo la prima slide e attiva il primo bottone.
// Ogni scheda viene preparata una volta sola (segno sull'elemento, non nel
// codice HTML, così il codice copiato dai generatori resta pulito).
function preparaScheda(scheda) {
 if (scheda._slidePronte) return;
 scheda._slidePronte = true;
 var slides = scheda.querySelectorAll('.slide-pg');
 if (slides.length === 0) return;
 for (var i = 1; i < slides.length; i++) {
  slides[i].style.display = 'none';
 }
 var primoBottone = scheda.querySelector('.bottone-nav');
 if (primoBottone) primoBottone.classList.add('attivo');
 animaBarre(slides[0]);
}

function preparaPortfolio(c) {
 if (c._slidePronte) return;
 c._slidePronte = true;
 var slides = c.querySelectorAll('.portfolio-slide');
 if (slides.length === 0) return;
 slides.forEach(function(s, i) {
  s.style.display = i === 0 ? 'block' : 'none';
 });
 var primo = c.querySelector('.portfolio-bottone');
 if (primo) primo.classList.add('attivo');
 animaBarrePortfolio(slides[0]);
}

function preparaTutto() {
 document.querySelectorAll('.scheda-pg-container').forEach(preparaScheda);
 document.querySelectorAll('.portfolio-container').forEach(preparaPortfolio);
}

window.addEventListener('DOMContentLoaded', function() {
 preparaTutto();

 // Schede e portfolio inseriti dopo il caricamento della pagina (le
 // anteprime dei generatori) non passano da DOMContentLoaded: li
 // intercettiamo quando compaiono nella pagina e li prepariamo allo
 // stesso modo. Le modifiche ravvicinate vengono raggruppate in un
 // solo controllo.
 if (!window.MutationObserver) return;
 var inAttesa = false;
 var osservatore = new MutationObserver(function() {
  if (inAttesa) return;
  inAttesa = true;
  setTimeout(function() {
   inAttesa = false;
   preparaTutto();
  }, 0);
 });
 osservatore.observe(document.body, { childList: true, subtree: true });
});
