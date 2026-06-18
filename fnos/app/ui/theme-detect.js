(function(){
  if(localStorage.getItem('quick-dial-is-dark')==='1'){
    var style = document.documentElement.style;
    style.setProperty('--bg','#0f172a');
    style.setProperty('--card','#1e293b');
    style.setProperty('--border','#334155');
    style.setProperty('--text','#f1f5f9');
    style.setProperty('--text2','#94a3b8');
  }
})();
