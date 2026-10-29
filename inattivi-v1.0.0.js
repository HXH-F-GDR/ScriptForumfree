(function () {
  function aggancia() {
    var box = document.getElementById('inattivi');
    var menu = document.querySelector('.menuwrap');
    if (!box || !menu || box.offsetHeight === 0) return;
    box.style.marginTop = '0px';
    var scorrimento = window.pageYOffset || document.documentElement.scrollTop || 0;
    var fisso = window.getComputedStyle(menu).position === 'fixed';
    var fondoMenu = menu.getBoundingClientRect().bottom + (fisso ? 0 : scorrimento);
    var cimaBox = box.getBoundingClientRect().top + scorrimento;
    var spazio = Math.round(fondoMenu + 10 - cimaBox);
    box.style.marginTop = (spazio > 0 ? spazio : 0) + 'px';
  }
 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aggancia);
  } else {
    aggancia();
  }
  window.addEventListener('load', aggancia);
  window.addEventListener('resize', aggancia);
 
  if (window.ResizeObserver) {
    var avvia = function () {
      var menu = document.querySelector('.menuwrap');
      if (menu) new ResizeObserver(aggancia).observe(menu);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', avvia);
    } else {
      avvia();
    }
  }
})();
