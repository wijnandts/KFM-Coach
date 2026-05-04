/* Einfacher Offline-Taschenrechner */
function setupCalculator(root=document){
  const display = root.querySelector("#calcDisplay");
  if(!display) return;
  root.querySelectorAll("[data-calc]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const v = btn.getAttribute("data-calc");
      if(v==="C"){ display.value="0"; return; }
      if(v==="BACK"){ display.value = display.value.length>1 ? display.value.slice(0,-1) : "0"; return; }
      if(v==="="){
        try{
          const safe = display.value.replace(",",".").replace(/[^0-9+\-*/().]/g,"");
          const res = Function('"use strict";return ('+safe+')')();
          display.value = Number.isFinite(res) ? String(Math.round(res*1000000)/1000000).replace(".",",") : "Fehler";
        }catch(e){ display.value = "Fehler"; }
        return;
      }
      if(display.value==="0" || display.value==="Fehler") display.value="";
      display.value += v;
    });
  });
}
document.addEventListener("DOMContentLoaded", ()=>setupCalculator());
