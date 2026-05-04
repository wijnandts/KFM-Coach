/* Lokale Speicherung ohne personenbezogene Daten | Version 1.1.0 */
const LA_STORE_PREFIX = "lernapp_math_";
function readStore(key, fallback){
  try{
    const raw = localStorage.getItem(LA_STORE_PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  }catch(e){ return fallback; }
}
function writeStore(key, value){ localStorage.setItem(LA_STORE_PREFIX + key, JSON.stringify(value)); }
function removeStore(key){ localStorage.removeItem(LA_STORE_PREFIX + key); }
function listProgress(){
  const out = {};
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.startsWith(LA_STORE_PREFIX+"progress_")){
      const id = k.replace(LA_STORE_PREFIX+"progress_","");
      out[id] = readStore("progress_"+id, {});
    }
  }
  return out;
}
function clearAllLearningData(){
  const keys=[];
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    if(k && k.startsWith(LA_STORE_PREFIX)) keys.push(k);
  }
  keys.forEach(k=>localStorage.removeItem(k));
}
function todayKey(){ return new Date().toISOString().slice(0,10); }
function yesterdayKey(){ const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); }
