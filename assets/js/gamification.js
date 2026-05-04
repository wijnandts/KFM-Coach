/* XP, Level, Badges, Tagesmissionen | Version 1.1.0 */
const MODULE_LABELS = {
  dreisatz:"Dreisatz", prozentrechnung:"Prozentrechnung", durchschnitt:"Durchschnitt", zinsrechnung:"Zinsrechnung", kasse:"Kasse", kalkulation:"Kalkulation"
};
function scoreFor(difficulty, mode, usedHint=false){
  const base = difficulty === "pruefung" ? 24 : difficulty === "training" ? 16 : 10;
  const examBonus = mode === "exam" ? 6 : 0;
  const hintPenalty = usedHint ? 4 : 0;
  return Math.max(4, base + examBonus - hintPenalty);
}
function levelInfo(points){
  const levels = [
    {level:1,name:"Start",min:0,next:80},
    {level:2,name:"Grundlagen",min:80,next:200},
    {level:3,name:"Training",min:200,next:420},
    {level:4,name:"Prüfungsvorbereitung",min:420,next:750},
    {level:5,name:"Sicher",min:750,next:1150},
    {level:6,name:"Mathe-Profi",min:1150,next:1700},
    {level:7,name:"Champion",min:1700,next:2400}
  ];
  let cur = levels[0];
  for(const l of levels){ if(points >= l.min) cur = l; }
  const next = cur.next || (cur.min+500);
  const pct = Math.max(0, Math.min(100, Math.round((points-cur.min)/(next-cur.min)*100)));
  return {...cur,next,pct,label:`Level ${cur.level} · ${cur.name}`};
}
function totalProgress(){
  const all = listProgress();
  let points=0, correct=0, attempts=0, streakBest=0, modulesDone=0, today=0;
  Object.entries(all).forEach(([id,p])=>{
    points += p.points||0; correct += p.correct||0; attempts += p.attempts||0; streakBest=Math.max(streakBest,p.streakBest||0);
    if((p.correct||0)>=10) modulesDone++;
    if(p.lastPracticeDate === todayKey()) today += p.todayCorrect||0;
  });
  return {points,correct,attempts,streakBest,modulesDone,today,all,level:levelInfo(points)};
}
const BADGE_DEFS = [
  {id:"first",icon:"✅",label:"Erste Lösung",desc:"Eine Aufgabe richtig gelöst.",ok:t=>t.correct>=1},
  {id:"ten",icon:"🔟",label:"10 richtig",desc:"10 Aufgaben richtig gelöst.",ok:t=>t.correct>=10},
  {id:"streak5",icon:"🔥",label:"5er-Serie",desc:"5 Aufgaben in Folge richtig.",ok:t=>t.streakBest>=5},
  {id:"level3",icon:"⭐",label:"Level 3",desc:"Level 3 erreicht.",ok:t=>t.points>=200},
  {id:"level5",icon:"🏆",label:"Level 5",desc:"Level 5 erreicht.",ok:t=>t.points>=750},
  {id:"daily",icon:"🎯",label:"Tagesziel",desc:"Tagesmission geschafft.",ok:t=>t.today>=5},
  {id:"modules3",icon:"📚",label:"3 Module",desc:"In 3 Modulen mindestens 10 richtige Aufgaben.",ok:t=>t.modulesDone>=3},
  {id:"exam",icon:"🛡️",label:"Prüfung fit",desc:"Im Prüfungsmodus mindestens 80 % erreicht.",ok:t=>Object.values(t.all).some(p=>(p.examBest||0)>=80)},
  {id:"dreisatz",icon:"📐",label:"Dreisatz-Starter",desc:"5 Dreisatz-Aufgaben richtig.",ok:t=>(t.all.dreisatz?.correct||0)>=5},
  {id:"prozent",icon:"%",label:"Prozent-Profi",desc:"5 Prozent-Aufgaben richtig.",ok:t=>(t.all.prozentrechnung?.correct||0)>=5},
  {id:"zinsen",icon:"💶",label:"Zins-Rechner",desc:"5 Zins-Aufgaben richtig.",ok:t=>(t.all.zinsrechnung?.correct||0)>=5},
  {id:"kasse",icon:"🧾",label:"Kassen-Kontrolleur",desc:"5 Kassen-Aufgaben richtig.",ok:t=>(t.all.kasse?.correct||0)>=5},
  {id:"kalk",icon:"🧮",label:"Kalkulations-Champion",desc:"5 Kalkulations-Aufgaben richtig.",ok:t=>(t.all.kalkulation?.correct||0)>=5}
];
function badgeList(progressOrTotal){
  const t = progressOrTotal.all ? progressOrTotal : totalProgress();
  return BADGE_DEFS.filter(b=>b.ok(t));
}
function allBadges(){ return BADGE_DEFS; }
function dailyMission(){
  const t=totalProgress();
  return {title:"Tagesmission", text:"Löse heute 5 Textaufgaben richtig.", current:Math.min(5,t.today), target:5, done:t.today>=5};
}
function updatePracticeDay(progress){
  const today=todayKey();
  if(progress.lastPracticeDate !== today){
    progress.todayCorrect = 0;
    if(progress.lastPracticeDate === yesterdayKey()) progress.dayStreak = (progress.dayStreak||0)+1;
    else progress.dayStreak = 1;
    progress.lastPracticeDate = today;
  }
}
function showToast(text){
  const old=document.querySelector('.xp-toast'); if(old) old.remove();
  const el=document.createElement('div'); el.className='xp-toast'; el.textContent=text; document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}
