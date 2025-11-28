// js/utils.js
// simples e sem module: define no escopo global (window) para compatibilidade com app.js não-modular
(function(global){
  function escapeHtml(str){
    if(!str && str !== 0) return '';
    return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }
  function generateRandomPastelColor(){
    const colors = ["#f7e7d7","#d7f7e9","#d7e7ff","#fff2d7","#f0d7ff","#e2f0cb","#ffdfd3"];
    return colors[Math.floor(Math.random()*colors.length)];
  }
  function clearChildren(el){
    while(el && el.firstChild) el.removeChild(el.firstChild);
  }
  function debounce(fn, wait = 200){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
  }

  global.escapeHtml = escapeHtml;
  global.generateRandomPastelColor = generateRandomPastelColor;
  global.clearChildren = clearChildren;
  global.debounce = debounce;
})(window);
