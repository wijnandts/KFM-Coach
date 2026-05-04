/* Gemeinsame Übungslogik | Version 1.1.0 | Textaufgaben, XP, Badges */
(function(){
  const M = window.MODULE || {};
  const progressKey = "progress_" + (M.id || "modul");
  const defaultProgress = {points:0, correct:0, attempts:0, streak:0, streakBest:0, wrongItems:[], todayCorrect:0, dayStreak:0, lastPracticeDate:"", examBest:0};
  let progress = readStore(progressKey, {...defaultProgress});
  let state = {mode:"learn", difficulty:progress.lastDifficulty || "einstieg", current:null, usedHint:false};

  const pick = a => a[Math.floor(Math.random()*a.length)];
  const round2 = v => Math.round((v+Number.EPSILON)*100)/100;
  const num = v => Number(v).toLocaleString("de-DE",{minimumFractionDigits:2, maximumFractionDigits:2});
  const euro = v => `${num(v)} €`;
  const answerOk = (input, answer) => Math.abs(parseFloat(String(input).replace(",",".")) - answer) < 0.05;

  const generators = {
    prozentrechnung(diff){
      const type = pick(diff==="einstieg" ? ["W","p","G"] : diff==="training" ? ["W","p","G","plus","minus"] : ["W","p","G","plus","minus","mix"]);
      if(type==="W"){
        const G=pick([80,120,150,200,250,400,600,900]); const p=pick([5,10,12,15,20,25,30]); const W=round2(G*p/100);
        return {text:`Ein Artikel kostet ${euro(G)}. In einer Aktion werden ${p} % des Preises berechnet. Wie viele Euro sind das?`,answer:W,unit:"€",hint:"Rechne: Grundwert mal Prozentsatz geteilt durch 100.",solution:`Rechnung: ${G} · ${p} / 100 = ${num(W)}\nAntwort: ${euro(W)}`};
      }
      if(type==="p"){
        const G=pick([100,150,200,240,300,500,800]); const p=pick([5,10,15,20,25,30]); const W=round2(G*p/100);
        return {text:`Ein Gesamtbetrag beträgt ${euro(G)}. Davon sind ${euro(W)} bezahlt. Wie viel Prozent des Gesamtbetrags sind bezahlt?`,answer:p,unit:"%",hint:"Rechne: Teilbetrag mal 100 geteilt durch Gesamtbetrag.",solution:`Rechnung: ${num(W)} · 100 / ${G} = ${num(p)}\nAntwort: ${num(p)} %`};
      }
      if(type==="G"){
        const G=pick([120,180,240,300,450,600]); const p=pick([10,15,20,25,30]); const W=round2(G*p/100);
        return {text:`Bei einem Preisnachlass entsprechen ${euro(W)} genau ${p} % des ursprünglichen Preises. Wie hoch war der ursprüngliche Preis?`,answer:G,unit:"€",hint:"Rechne: Prozentwert mal 100 geteilt durch Prozentsatz.",solution:`Rechnung: ${num(W)} · 100 / ${p} = ${num(G)}\nAntwort: ${euro(G)}`};
      }
      if(type==="plus"){
        const netto=pick([100,150,200,500,750]); const p=pick([7,19]); const brutto=round2(netto*(100+p)/100);
        return {text:`Ein Netto-Preis beträgt ${euro(netto)}. Der Preis wird um ${p} % erhöht. Wie hoch ist der neue Preis?`,answer:brutto,unit:"€",hint:"Bei einer Erhöhung rechnest du mit 100 % plus dem Prozentsatz.",solution:`Rechnung: ${netto} · ${100+p} / 100 = ${num(brutto)}\nAntwort: ${euro(brutto)}`};
      }
      if(type==="mix"){
        const end=pick([80,120,160,240]); const rabatt=pick([10,20,25]); const original=round2(end*100/(100-rabatt));
        return {text:`Ein Artikel kostet nach einem Rabatt noch ${euro(end)}. Der Rabatt beträgt ${rabatt} %. Wie hoch war der ursprüngliche Preis?`,answer:original,unit:"€",hint:"Der Endpreis entspricht weniger als 100 %. Rechne auf 100 % zurück.",solution:`Rechnung: ${num(end)} · 100 / ${100-rabatt} = ${num(original)}\nAntwort: ${euro(original)}`};
      }
      const preis=pick([50,80,120,200,300]); const rabatt=pick([5,10,15,20,25]); const end=round2(preis*(100-rabatt)/100);
      return {text:`Ein Artikel kostet zuerst ${euro(preis)}. Der Preis wird um ${rabatt} % gesenkt. Wie viel kostet der Artikel jetzt?`,answer:end,unit:"€",hint:"Bei einer Senkung rechnest du mit 100 % minus dem Prozentsatz.",solution:`Rechnung: ${preis} · ${100-rabatt} / 100 = ${num(end)}\nAntwort: ${euro(end)}`};
    },
    dreisatz(diff){
      const anti = diff!=="einstieg" && Math.random()<0.38;
      if(!anti){
        const menge=pick([3,4,5,6,8,10,12]); const preis=pick([9,12,15,18,24,30]); const neu=pick([7,9,14,15,20,25]); const ans=round2(preis/menge*neu);
        return {text:`Ein Geschäft verkauft ${menge} gleiche Artikel für ${euro(preis)}. Wie viel kosten ${neu} gleiche Artikel?`,answer:ans,unit:"€",hint:"Gerader Dreisatz: Erst den Preis für 1 Artikel berechnen. Dann mit der neuen Menge multiplizieren.",solution:`1 Artikel: ${num(preis)} / ${menge} = ${num(preis/menge)}\n${neu} Artikel: ${num(preis/menge)} · ${neu} = ${num(ans)}\nAntwort: ${euro(ans)}`};
      }
      const pers=pick([2,3,4,5]); const zeit=pick([60,80,90,120,150]); const neu=pers*pick([2,3]); const ans=round2(pers*zeit/neu);
      return {text:`${pers} Personen räumen Waren in ein Lager ein. Sie brauchen dafür ${zeit} Minuten. Wie lange brauchen ${neu} Personen bei gleicher Leistung?`,answer:ans,unit:"Minuten",hint:"Ungerader Dreisatz: Mehr Personen brauchen weniger Zeit. Personen mal Zeit bleibt gleich.",solution:`Rechnung: ${pers} · ${zeit} / ${neu} = ${num(ans)}\nAntwort: ${num(ans)} Minuten`};
    },
    durchschnitt(diff){
      const weighted = diff!=="einstieg" && Math.random()<0.45;
      if(!weighted){
        const vals = Array.from({length:pick([4,5,6])},()=>pick([120,150,180,200,240,300,360,420]));
        const sum=vals.reduce((a,b)=>a+b,0); const ans=round2(sum/vals.length);
        return {text:`Eine Person notiert mehrere Tagesumsätze: ${vals.map(v=>euro(v)).join(", ")}. Wie hoch ist der durchschnittliche Tagesumsatz?`,answer:ans,unit:"€",hint:"Addiere alle Werte. Teile die Summe durch die Anzahl der Werte.",solution:`Summe: ${vals.join(" + ")} = ${num(sum)}\nAnzahl: ${vals.length}\nDurchschnitt: ${num(sum)} / ${vals.length} = ${num(ans)}\nAntwort: ${euro(ans)}`};
      }
      const m1=pick([10,20,30,40]); const p1=pick([2.5,3,4,5]); const m2=pick([15,25,35]); const p2=pick([4,5,6,7]); const ans=round2((m1*p1+m2*p2)/(m1+m2));
      return {text:`Ein Geschäft kauft ${m1} Stück zu je ${num(p1)} € und ${m2} Stück zu je ${num(p2)} €. Wie hoch ist der durchschnittliche Einkaufspreis pro Stück?`,answer:ans,unit:"€",hint:"Beim gewichteten Durchschnitt brauchst du Gesamtwert und Gesamtmenge.",solution:`Gesamtwert: ${m1} · ${num(p1)} + ${m2} · ${num(p2)} = ${num(m1*p1+m2*p2)}\nGesamtmenge: ${m1+m2}\nDurchschnitt: ${num(ans)} €\nAntwort: ${euro(ans)}`};
    },
    zinsrechnung(diff){
      const mode = pick(diff==="einstieg" ? ["jahr"] : diff==="training" ? ["jahr","monat","tag"] : ["jahr","monat","tag","kapital"]);
      if(mode==="jahr"){
        const K=pick([500,800,1000,1500,2000,3000]); const p=pick([2,3,4,5,6]); const Z=round2(K*p/100);
        return {text:`Ein Betrag von ${euro(K)} wird für ein Jahr angelegt. Der Zinssatz beträgt ${p} %. Wie viele Zinsen entstehen nach einem Jahr?`,answer:Z,unit:"€",hint:"Jahreszinsen = Kapital mal Zinssatz geteilt durch 100.",solution:`Rechnung: ${K} · ${p} / 100 = ${num(Z)}\nAntwort: ${euro(Z)}`};
      }
      if(mode==="monat"){
        const K=pick([1000,1500,2400,3600]); const p=pick([3,4,5,6]); const m=pick([2,3,4,6,9]); const Z=round2(K*p*m/1200);
        return {text:`Ein Betrag von ${euro(K)} wird für ${m} Monate angelegt. Der Zinssatz beträgt ${p} % pro Jahr. Wie viele Zinsen entstehen in dieser Zeit?`,answer:Z,unit:"€",hint:"Monatszinsen = Kapital mal Zinssatz mal Monate geteilt durch 1200.",solution:`Rechnung: ${K} · ${p} · ${m} / 1200 = ${num(Z)}\nAntwort: ${euro(Z)}`};
      }
      if(mode==="tag"){
        const K=pick([1000,2000,2500,4000,5000]); const p=pick([3,4,5,6]); const t=pick([30,45,60,90,120]); const Z=round2(K*p*t/36000);
        return {text:`Ein Betrag von ${euro(K)} wird für ${t} Tage geliehen. Der Zinssatz beträgt ${p} % pro Jahr. Wie viele Zinsen fallen an?`,answer:Z,unit:"€",hint:"Tageszinsen = Kapital mal Zinssatz mal Tage geteilt durch 36.000.",solution:`Rechnung: ${K} · ${p} · ${t} / 36000 = ${num(Z)}\nAntwort: ${euro(Z)}`};
      }
      const K=pick([1000,1500,2000,2500]); const p=pick([4,5]); const Z=round2(K*p/100);
      return {text:`Eine Person erhält nach einem Jahr ${euro(Z)} Zinsen. Der Zinssatz beträgt ${p} %. Wie hoch war das angelegte Kapital?`,answer:K,unit:"€",hint:"Kapital = Zinsen mal 100 geteilt durch Zinssatz.",solution:`Rechnung: ${num(Z)} · 100 / ${p} = ${num(K)}\nAntwort: ${euro(K)}`};
    },
    kasse(diff){
      const start=pick([100,150,200,250]); const end=pick([850,960,1100,1250,1400]); const aus=pick([20,35,50,80]); const ent=diff==="einstieg"?0:pick([0,40,60]); const einl=diff==="pruefung"?pick([0,30,50]):0; const ans=round2(end-start+aus+ent-einl);
      return {text:`Am Ende eines Verkaufstages werden ${euro(end)} in der Kasse gezählt. Am Morgen waren ${euro(start)} Wechselgeld in der Kasse. Aus der Kasse wurden Ausgaben von ${euro(aus)} bezahlt${ent?`, außerdem gab es eine Entnahme von ${euro(ent)}`:""}${einl?`, außerdem wurde eine Einlage von ${euro(einl)} in die Kasse gelegt`:""}. Wie hoch sind die Tageseinnahmen?`,answer:ans,unit:"€",hint:"Tageseinnahmen = Endbestand minus Anfangsbestand plus Ausgaben plus Entnahmen minus Einlagen.",solution:`Rechnung: ${num(end)} - ${num(start)} + ${num(aus)} + ${num(ent)} - ${num(einl)} = ${num(ans)}\nAntwort: ${euro(ans)}`};
    },
    kalkulation(diff){
      const mode=pick(diff==="einstieg"?["bezug"]:diff==="training"?["bezug","verkauf"]:["bezug","verkauf","rueck"]);
      if(mode==="bezug"){
        const lep=pick([100,200,300,500,800]); const rab=pick([5,10,15]); const sk=pick([2,3]); const bez=pick([8,12,20,30]); const zep=round2(lep*(100-rab)/100); const bep=round2(zep*(100-sk)/100); const ans=round2(bep+bez);
        return {text:`Ein Geschäft kauft Ware ein. Der Listeneinkaufspreis beträgt ${euro(lep)}. Der Lieferant gibt ${rab} % Rabatt und ${sk} % Skonto. Für den Transport fallen ${euro(bez)} Bezugskosten an. Wie hoch ist der Bezugspreis?`,answer:ans,unit:"€",hint:"Rechne Schritt für Schritt: Listeneinkaufspreis minus Rabatt, dann minus Skonto, dann plus Bezugskosten.",solution:`Zieleinkaufspreis: ${lep} · ${100-rab} / 100 = ${num(zep)}\nBareinkaufspreis: ${num(zep)} · ${100-sk} / 100 = ${num(bep)}\nBezugspreis: ${num(bep)} + ${num(bez)} = ${num(ans)}\nAntwort: ${euro(ans)}`};
      }
      if(mode==="verkauf"){
        const bp=pick([100,150,200,300,500]); const hk=pick([20,25,30]); const gew=pick([10,15,20]); const skp=round2(bp*(100+hk)/100); const ans=round2(skp*(100+gew)/100);
        return {text:`Ein Geschäft hat für einen Artikel einen Bezugspreis von ${euro(bp)}. Es rechnet mit ${hk} % Handlungskosten und ${gew} % Gewinn. Wie hoch ist der Barverkaufspreis ohne Umsatzsteuer?`,answer:ans,unit:"€",hint:"Erst Handlungskosten aufschlagen. Danach Gewinn aufschlagen.",solution:`Selbstkosten: ${bp} · ${100+hk} / 100 = ${num(skp)}\nBarverkaufspreis: ${num(skp)} · ${100+gew} / 100 = ${num(ans)}\nAntwort: ${euro(ans)}`};
      }
      const brutto=pick([119,238,357,595]); const ans=round2(brutto/1.19);
      return {text:`Ein Artikel kostet an der Kasse brutto ${euro(brutto)}. Darin sind 19 % Umsatzsteuer enthalten. Wie hoch ist der Nettoverkaufspreis?`,answer:ans,unit:"€",hint:"Netto = Brutto geteilt durch 1,19.",solution:`Rechnung: ${num(brutto)} / 1,19 = ${num(ans)}\nAntwort: ${euro(ans)}`};
    }
  };

  function generateTask(){
    const gen = generators[M.generator];
    state.current = gen ? gen(state.difficulty) : {text:"Keine Aufgabe hinterlegt.",answer:0,unit:"",hint:"",solution:""};
    state.usedHint=false;
    renderTask();
  }

  function renderShell(){
    const root=document.getElementById("app");
    root.innerHTML = `
      <a class="skip-link" href="#main">Zum Inhalt springen</a>
      <div class="app-shell">
        <nav class="navbar" aria-label="Navigation">
          <a class="navbtn secondary" href="${M.backHref||'../../../index.html'}">← Dashboard</a>
          ${M.explainHref ? `<a class="navbtn secondary" href="${M.explainHref}">Erklärung</a>` : ``}
          <a class="navbtn secondary" href="../../../fortschritt.html">Fortschritt</a>
          <a class="navbtn secondary" href="../../../badges.html">Badges</a>
          <button class="navbtn secondary" id="teacherToggle" type="button">Lehrkraft-Modus</button>
          <button class="navbtn danger" id="resetModule" type="button">Lernstand löschen</button>
        </nav>
        <header class="hero">
          <h1>${M.title}</h1>
          <p class="subtitle">${M.subtitle}</p>
          <div class="badge-row">
            <span class="badge">Mathematik</span>
            <span class="badge violet">${M.pathway}</span>
            <span class="badge green">offline</span>
            <span class="badge gold">Version ${M.version||"1.1.0"}</span>
          </div>
        </header>
        <main id="main" class="module-layout">
          <section class="card" aria-labelledby="learnTitle">
            <h2 id="learnTitle">Lernrunde</h2>
            <p class="mode-note">Alle Aufgaben sind Textaufgaben in einfacher Sprache. Im Lernmodus gibt es Hilfen. Im Prüfungsmodus sind die Hilfen reduziert.</p>
            <div class="toolbar">
              <div><strong>Modus</strong><div class="segmented" id="modeBtns">
                <button class="btn active" data-mode="learn" type="button">Lernmodus</button>
                <button class="btn" data-mode="exam" type="button">Prüfungsmodus</button>
              </div></div>
              <div><strong>Stufe</strong><div class="segmented" id="difficultyBtns">
                <button class="btn ${state.difficulty==='einstieg'?'active':''}" data-diff="einstieg" type="button">Einstieg</button>
                <button class="btn ${state.difficulty==='training'?'active':''}" data-diff="training" type="button">Training</button>
                <button class="btn ${state.difficulty==='pruefung'?'active':''}" data-diff="pruefung" type="button">Prüfung</button>
              </div></div>
              <div><strong>Aktion</strong><button class="btn ghost" id="newTask" type="button">Neue Aufgabe</button></div>
            </div>
            <div class="task-box" id="taskText"></div>
            <div class="info-box" id="roundInfo">Bitte Ergebnis kaufmännisch auf 2 Nachkommastellen runden.</div>
            <div class="input-row">
              <input id="answerInput" type="number" inputmode="decimal" step="0.01" aria-label="Antwort eingeben" placeholder="Dein Ergebnis">
              <strong id="unitLabel"></strong>
            </div>
            <div class="input-row" style="margin-top:10px">
              <button class="btn" id="checkBtn" type="button">Antwort prüfen</button>
              <button class="btn secondary" id="hintBtn" type="button">Hilfe anzeigen</button>
            </div>
            <div id="feedback" class="feedback" role="status"></div>
            <details id="solutionDetails" class="solution-locked"><summary id="solutionSummary">Musterlösung / Rechenweg (nach Prüfung freigeschaltet)</summary><pre class="solution" id="solutionText"></pre></details>
            <details><summary>Glossar</summary><dl class="glossary">${M.glossary.map(x=>`<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join("")}</dl></details>
            <section class="teacher-panel card" id="teacherPanel">
              <h2>Lehrkraft-Modus</h2>
              <p><strong>App-Titel:</strong> ${M.title}</p>
              <p><strong>Version:</strong> ${M.version||"1.1.0"} · <strong>Änderungsdatum:</strong> ${M.date}</p>
              <p><strong>Letzte Änderung:</strong> Gamified Learning Dashboard mit XP, Badges, Tagesmission und Fortschrittsseite.</p>
              <p><strong>Trennung:</strong> Fach Mathematik, Bildungsgänge BFS und Einzelhandel, keine fächerübergreifenden Inhalte.</p>
              <p><strong>Kompetenzbezug:</strong> Die Lernenden bearbeiten mathematische Textaufgaben in einfachen beruflichen und lebensnahen Rechenkontexten.</p>
              <p><strong>Datenschutz:</strong> Es werden nur Punkte, Versuche, richtige Lösungen, Tagesfortschritt und Badges lokal im Browser gespeichert. Keine Namen, Klassen oder Serverübertragung.</p>
              <p><strong>Erweiterung:</strong> Neue Aufgaben als kurze Textaufgaben formulieren. Keine Aufgaben aus geschützten Materialien 1:1 übernehmen.</p>
            </section>
          </section>
          <aside>
            <section class="quest-panel card">
              <h2>Dein Fortschritt</h2>
              <p id="levelText" class="muted"></p>
              <div class="xp-bar"><div class="xp-fill" id="xpFill" style="width:0%"></div></div>
              <div class="stat-row">
                <div class="stat-pill"><strong id="points">0</strong>XP</div>
                <div class="stat-pill"><strong id="correct">0</strong>richtig</div>
                <div class="stat-pill"><strong id="streak">0</strong>Serie</div>
              </div>
            </section>
            <section class="card">
              <h2>Badges</h2>
              <div id="badges" class="badge-collection"></div>
            </section>
            <section class="calc" aria-label="Taschenrechner">
              <h2>Rechner</h2>
              <input id="calcDisplay" value="0" aria-label="Taschenrechner-Anzeige" readonly>
              <div class="calc-grid">
                <button data-calc="C" class="clr">C</button><button data-calc="BACK">←</button><button data-calc="(" class="op">(</button><button data-calc=")" class="op">)</button>
                <button data-calc="7">7</button><button data-calc="8">8</button><button data-calc="9">9</button><button data-calc="/" class="op">÷</button>
                <button data-calc="4">4</button><button data-calc="5">5</button><button data-calc="6">6</button><button data-calc="*" class="op">×</button>
                <button data-calc="1">1</button><button data-calc="2">2</button><button data-calc="3">3</button><button data-calc="-" class="op">−</button>
                <button data-calc="0">0</button><button data-calc=".">,</button><button data-calc="=" class="eq">=</button><button data-calc="+" class="op">+</button>
              </div>
            </section>
          </aside>
        </main>
        <footer class="footer">Offline nutzbar · keine externen Bibliotheken · keine personenbezogenen Daten</footer>
      </div>`;
    setupCalculator(document);
    bind(); updateProgress(); generateTask();
  }
  function bind(){
    document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{state.mode=btn.dataset.mode;document.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("active",b===btn));setFeedback("note",state.mode==="exam"?"Prüfungsmodus: Hilfen sind reduziert. Musterlösung erst nach deiner Eingabe und Prüfung.":"Lernmodus: Du kannst eine Hilfe nutzen. Die Musterlösung erscheint erst nach der Prüfung.");}));
    document.querySelectorAll("[data-diff]").forEach(btn=>btn.addEventListener("click",()=>{state.difficulty=btn.dataset.diff;progress.lastDifficulty=state.difficulty;save();document.querySelectorAll("[data-diff]").forEach(b=>b.classList.toggle("active",b===btn));generateTask();}));
    document.getElementById("newTask").addEventListener("click",generateTask);
    document.getElementById("checkBtn").addEventListener("click",checkAnswer);
    document.getElementById("hintBtn").addEventListener("click",showHint);
    document.getElementById("answerInput").addEventListener("keydown",e=>{if(e.key==="Enter")checkAnswer();});
    document.getElementById("teacherToggle").addEventListener("click",()=>{const panel=document.getElementById("teacherPanel"); if(panel.classList.contains("visible")){panel.classList.remove("visible");return;} const code=prompt("Lehrkraft-Code eingeben:"); if(code==="150411")panel.classList.add("visible"); else if(code!==null)setFeedback("bad","Der Lehrkraft-Code ist nicht richtig.");});
    document.getElementById("resetModule").addEventListener("click",()=>{if(confirm("Lokalen Lernstand dieses Moduls löschen?")){progress={...defaultProgress};removeStore(progressKey);updateProgress();generateTask();}});
  }
  function renderTask(){
    document.getElementById("taskText").textContent=state.current.text;
    document.getElementById("unitLabel").textContent=state.current.unit||"";
    document.getElementById("solutionText").textContent=state.current.solution;
    lockSolution();
    const input=document.getElementById("answerInput"); input.value=""; input.classList.remove("answer-correct","answer-wrong"); input.removeAttribute("aria-invalid");
    const fb=document.getElementById("feedback"); fb.style.display="none"; fb.className="feedback"; fb.textContent="";
  }
  function setFeedback(kind,message){const fb=document.getElementById("feedback");fb.style.display="block";fb.className="feedback "+kind;fb.textContent=message;}
  function lockSolution(){const d=document.getElementById("solutionDetails");const s=document.getElementById("solutionSummary");d.open=false;d.classList.add("solution-locked");d.setAttribute("aria-disabled","true");s.textContent="Musterlösung / Rechenweg (nach Prüfung freigeschaltet)";}
  function unlockSolution(openIt=false){const d=document.getElementById("solutionDetails");const s=document.getElementById("solutionSummary");d.classList.remove("solution-locked");d.removeAttribute("aria-disabled");s.textContent="Musterlösung / Rechenweg anzeigen";if(openIt)d.open=true;}
  function showHint(){state.usedHint=true; if(state.mode==="exam"){setFeedback("note","Im Prüfungsmodus gibt es nur eine kleine Hilfe: Markiere zuerst die gesuchte Größe und die gegebenen Zahlen.");return;} setFeedback("note",state.current.hint||"Lies die Aufgabe noch einmal. Schreibe die gegebenen Werte und die gesuchte Größe auf.");}
  function checkAnswer(){
    const inputEl=document.getElementById("answerInput"); const input=inputEl.value;
    if(String(input).trim()===""){inputEl.classList.add("answer-wrong");inputEl.setAttribute("aria-invalid","true");setFeedback("note","Bitte gib zuerst eine Lösung ein. Danach kannst du die Antwort prüfen und die Musterlösung freischalten.");return;}
    updatePracticeDay(progress); progress.attempts++; inputEl.classList.remove("answer-correct","answer-wrong"); unlockSolution(false);
    if(answerOk(input,state.current.answer)){
      progress.correct++; progress.todayCorrect=(progress.todayCorrect||0)+1; progress.streak++; progress.streakBest=Math.max(progress.streakBest||0,progress.streak);
      const xp=scoreFor(state.difficulty,state.mode,state.usedHint); progress.points=(progress.points||0)+xp; inputEl.classList.add("answer-correct"); inputEl.removeAttribute("aria-invalid"); setFeedback("ok",`Richtig! +${xp} XP. Die Musterlösung ist jetzt freigeschaltet.`); showToast(`+${xp} XP · gut gemacht`);
    } else {
      progress.streak=0; inputEl.classList.add("answer-wrong"); inputEl.setAttribute("aria-invalid","true"); setFeedback("bad","Noch nicht richtig. Prüfe Rechenweg, Vorzeichen und Rundung. Die Musterlösung ist jetzt freigeschaltet."); progress.wrongItems=(progress.wrongItems||[]).slice(-10); progress.wrongItems.push({text:state.current.text,answer:state.current.answer,unit:state.current.unit});
    }
    if(state.mode==="exam"){const rate=progress.attempts?Math.round(progress.correct/progress.attempts*100):0;progress.examBest=Math.max(progress.examBest||0,rate);}
    save(); updateProgress();
  }
  function save(){writeStore(progressKey,progress);}
  function updateProgress(){
    const info=levelInfo(progress.points||0); document.getElementById("points").textContent=progress.points||0; document.getElementById("correct").textContent=progress.correct||0; document.getElementById("streak").textContent=progress.streak||0; document.getElementById("levelText").textContent=info.label; document.getElementById("xpFill").style.width=info.pct+"%";
    const badges=badgeList(totalProgress()); const box=document.getElementById("badges"); box.innerHTML=badges.length?badges.slice(0,4).map(b=>`<span class="badge earned">${b.icon} ${b.label}</span>`).join(""):"<span class='small'>Noch keine Badges.</span>";
  }
  document.addEventListener("DOMContentLoaded",renderShell);
})();
