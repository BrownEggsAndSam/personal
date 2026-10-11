/* Learning game: all progress is local and self-attested. */
const BOSSES=[
  {
    "id": "B",
    "name": "The too-perfect scorecard",
    "tier": "beginner",
    "after": "B8",
    "story": "Your team has a beautiful scorecard. Before you present it, find the assumptions that could make its story misleading.",
    "questions": [
      {
        "id": "B1",
        "prompt": "Catalog Explorer shows 40 tables. Your source inventory contains 60 datasets. What can you responsibly report?",
        "options": [
          "Coverage is 67%; the other 20 datasets are missing.",
          "Forty tables are visible to this identity; reconcile scope, grain, registration and privileges before calculating coverage.",
          "The source inventory is wrong because Unity Catalog is authoritative."
        ],
        "correct": 1,
        "why": "Visibility is not existence, and tables and datasets may not be the same unit. Define comparable scope and denominator; investigate access and registration gaps.",
        "session": "B4"
      },
      {
        "id": "B2",
        "prompt": "Nine of 10 datasets pass in team A; one of 90 passes in team B. What is the overall dataset pass rate?",
        "options": [
          "45.56%: take the unweighted average of the two team percentages.",
          "90%: use the best team as the standard.",
          "10%: 10 passing datasets divided by 100 assessed datasets."
        ],
        "correct": 2,
        "why": "Use the ratio of sums for this dataset-level rate: (9 + 1) / (10 + 90) = 10%. The unweighted average of 90% and 1.11% is about 45.56% and answers a different question.",
        "session": "I7"
      },
      {
        "id": "B3",
        "prompt": "A column has a PII tag. A colleague says it is therefore masked. What evidence is needed?",
        "options": [
          "Verify the applicable access policy or mask and test permitted identities.",
          "A screenshot of the tag is enough.",
          "Remove SELECT from everybody and assume the report still works."
        ],
        "correct": 0,
        "why": "A classification label describes data. Enforcement depends on an applicable policy or mask plus identity and privileges. An intentionally configured tag-driven policy can enforce rules; the label alone is insufficient.",
        "session": "I5"
      }
    ]
  },
  {
    "id": "I",
    "name": "The midnight release",
    "tier": "intermediate",
    "after": "I8",
    "story": "A daily profile was retried, a table was renamed, and a late invalid update arrived. Decide what a reliable workflow should do.",
    "questions": [
      {
        "id": "I1",
        "prompt": "An older loan event is valid; its latest event has an invalid balance. Your contract is a latest-state profile. Which order preserves the truth?",
        "options": [
          "Discard invalid events first, then keep the latest remaining event.",
          "Pick the latest event per key, then validate and quarantine failures.",
          "Always average the two balances."
        ],
        "correct": 1,
        "why": "Validating first can revive an older valid value and hide a current defect. For this stated latest-state contract, choose the current row first, then validate it. Other contracts need an explicit, different rule.",
        "session": "I1"
      },
      {
        "id": "I2",
        "prompt": "A retried job sends the same exception ticket twice. The Delta table itself has no duplicates. What is missing?",
        "options": [
          "A bigger SQL warehouse.",
          "More retries.",
          "An idempotency strategy for the external side effect, with a stable event key and recorded outcome."
        ],
        "correct": 2,
        "why": "Idempotent table writes do not automatically make ticket creation idempotent. Design and test the external action separately; use a supported deduplication or reconciliation strategy.",
        "session": "I4"
      },
      {
        "id": "I3",
        "prompt": "A renamed Databricks table appears as a new asset in a catalog comparison. What is the best next action?",
        "options": [
          "Delete the old Collibra asset immediately.",
          "Use stable identity where supported, review rename mapping, and apply agreed attribute ownership.",
          "Copy whichever description has the latest timestamp in either system."
        ],
        "correct": 1,
        "why": "Names can change. Reconcile identity before deleting or creating assets, and agree which system owns each attribute. Connector behavior and synchronization direction must be verified for your setup.",
        "session": "I6"
      }
    ]
  },
  {
    "id": "A",
    "name": "Recovery before morning",
    "tier": "advanced",
    "after": "A8",
    "story": "A pipeline has produced a wrong result. A historical version is unavailable, and an AI answer is confidently repeating the error.",
    "questions": [
      {
        "id": "A1",
        "prompt": "The required historical Delta data files are no longer available. Can a table version number alone recover the data?",
        "options": [
          "Yes; the transaction log contains every historical row.",
          "No; check a retained source, backup or another tested recovery path.",
          "Yes; increasing compute memory will recreate deleted files."
        ],
        "correct": 1,
        "why": "History metadata is not a substitute for retained data files. Recovery depends on available data and retention, plus a tested replay or backup strategy.",
        "session": "A4"
      },
      {
        "id": "A2",
        "prompt": "You repair the source table. Has the entire incident necessarily been resolved?",
        "options": [
          "Yes; all consumers and tickets automatically roll back.",
          "Yes, if the next query succeeds.",
          "No; validate downstream outputs, refreshes and external actions against the recovery plan."
        ],
        "correct": 2,
        "why": "A table repair is one recovery step. Derived tables, published results, caches, scheduled jobs and external side effects may require their own reconciliation and validation.",
        "session": "A4"
      },
      {
        "id": "A3",
        "prompt": "An AI-generated answer is fluent, but its approval rate disagrees with your accepted benchmark. What do you do first?",
        "options": [
          "Inspect its query, population, grain and denominator; compare with the approved metric definition.",
          "Trust the explanation because it is more detailed.",
          "Change the benchmark until both answers match."
        ],
        "correct": 0,
        "why": "Correct language does not establish correct semantics. Test generated answers against known cases and approved definitions, including ambiguous questions and access boundaries.",
        "session": "A5"
      }
    ]
  }
];

const RANKS=[[0,'Explorer'],[150,'Analyst'],[500,'Steward'],[1200,'Builder'],[2200,'Architect'],[3200,'Pathfinder']];
let battleFeedback={};
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dayAfter(n){const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function cleanGame(p){const g={cleared:{},activity:[],reviews:{}};if(!p||typeof p!=='object')return g;
 for(const b of BOSSES)for(const q of b.questions)if(p.cleared?.[q.id]===true)g.cleared[q.id]=true;
 if(Array.isArray(p.activity))g.activity=p.activity.filter(a=>a&&/^\d{4}-\d{2}-\d{2}$/.test(a.day)&&['practice','demonstrated','explained','extended','boss'].includes(a.kind)&&typeof a.id==='string'&&a.id.length<20).slice(-300).map(a=>({day:a.day,kind:a.kind,id:a.id}));
 if(p.reviews&&typeof p.reviews==='object')for(const s of SESSIONS)if(typeof p.reviews[s.id]==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.reviews[s.id]))g.reviews[s.id]=p.reviews[s.id];
 return g;}
function activity(kind,id){const a=state.game.activity;if(!a.some(x=>x.day===today()&&x.kind===kind&&x.id===id)){a.push({day:today(),kind,id});state.game.activity=a.slice(-300);}}
function xp(){return SESSIONS.reduce((n,s)=>{const r=record(s.id);return n+(r.viewed?5:0)+(r.practiced?15:0)+(r.demonstrated?60:0)+(r.explained?20:0)+(r.extended?25:0);},0)+Object.values(state.game.cleared).filter(Boolean).length*50;}
function rank(){return [...RANKS].reverse().find(r=>xp()>=r[0]);}
function tierDone(tier){return SESSIONS.filter(s=>s.tier===tier).every(s=>record(s.id).demonstrated&&record(s.id).explained);}
function bossDone(b){return b.questions.every(q=>state.game.cleared[q.id]);}
function achievements(){return [
 ['First experiment','Try a scenario model.',count('practiced')>0,'✦'],
 ['Show your work','Record your first workspace demonstration.',count('demonstrated')>0,'◇'],
 ['Foundation keeper','Demonstrate and explain all 8 beginner sessions.',tierDone('beginner'),'Ⅰ'],
 ['Workflow builder','Demonstrate and explain all 8 intermediate sessions.',tierDone('intermediate'),'Ⅱ'],
 ['Decision defender','Demonstrate and explain all 8 advanced sessions.',tierDone('advanced'),'Ⅲ'],
 ['Engineering spark','Complete an engineering extension.',count('extended')>0,'⌘'],
 ['Case closer','Clear all 3 scenario boss battles.',BOSSES.every(bossDone),'★'],
 ['Full learning portfolio','Demonstrate and explain all 24 sessions.',SESSIONS.every(s=>record(s.id).demonstrated&&record(s.id).explained),'♜']
 ];}
function paintGame(){const el=$('#game-summary');if(el)el.innerHTML='<b>'+xp().toLocaleString()+' XP</b><span>'+rank()[1]+' · learning rank</span>';}
function gameStrip(){const next=RANKS.find(r=>r[0]>xp());return '<section class="game-strip space"><div><div class="eyebrow">Your learning adventure</div><h2>'+rank()[1]+' <span class="xp-number">'+xp().toLocaleString()+' XP</span></h2><p class="smalltext muted">'+(next?next[0]-xp()+' XP to '+next[1]:'All learning ranks reached. Keep broadening your real-work evidence.')+' · '+achievements().filter(a=>a[2]).length+'/8 badges</p></div><div class="row"><button class="primary" data-page="quests">Open quest board →</button><button data-action="travel">Use another device</button></div></section>';}
function quests(){const done=state.game.activity.filter(a=>a.day===today());const due=SESSIONS.filter(s=>record(s.id).explained&&(!state.game.reviews[s.id]||state.game.reviews[s.id]<=today()));const next=nextSession();const recent=Array.from({length:7},(_,i)=>dayAfter(i-6));
 return '<div class="eyebrow">Quest board · practical progress</div><h1>Small quests.<br>Useful skills.</h1><p class="muted">Earn learning XP by understanding the product, testing your predictions, and bringing back evidence. All lessons and cases stay open. Return at your own pace.</p>'+gameStrip()+
 '<div class="grid3 space">'+[
 ['practice','Experiment','Change one input and explain the result.','<button class="soft" data-experiment="'+next.id+'">Try '+next.id+' →</button>'],
 ['demonstrated','Bring back evidence','Complete a permitted workspace task; record a non-sensitive result.','<button class="soft" data-quest-evidence="'+next.id+'">Record evidence →</button>'],
 ['explained','Teach it back','Explain a concept in your own words before checking the model answer.','<button class="soft" data-session="'+next.id+'">Explain '+next.id+' →</button>']
 ].map(([kind,title,desc,button])=>'<article class="card daily-quest"><span class="pill '+(done.some(x=>x.kind===kind)?'beginner':'')+'">'+(done.some(x=>x.kind===kind)?'✓ Practiced today':'Today’s optional quest')+'</span><h3>'+title+'</h3><p class="smalltext muted">'+desc+'</p>'+button+'</article>').join('')+'</div>'+
 '<div class="learning-days space"><b class="smalltext">Your last 7 days</b>'+recent.map(d=>'<span class="day '+(state.game.activity.some(a=>a.day===d)?'learned':'')+'" title="'+d+'" aria-label="'+d+': '+(state.game.activity.some(a=>a.day===d)?'learning activity recorded':'no activity recorded')+'">'+Number(d.slice(-2))+'</span>').join('')+'<span class="smalltext muted">No streak penalties. Your progress stays yours.</span></div>'+
 '<div class="section-title"><h2>Three boss battles</h2><span class="smalltext muted">3 decisions each · feedback after every choice</span></div><div class="grid3">'+BOSSES.map((b,i)=>'<article class="card boss-card '+b.tier+'"><div class="boss-emblem" aria-hidden="true">'+['◇','⚙','♜'][i]+'</div><span class="pill '+b.tier+'">'+(bossDone(b)?'✓ Case cleared':'Suggested after '+b.after)+'</span><h3>'+b.name+'</h3><p class="smalltext muted">'+b.story+'</p><p class="smalltext">'+b.questions.filter(q=>state.game.cleared[q.id]).length+'/3 decisions cleared · up to 150 XP</p><button class="soft" data-boss="'+b.id+'">'+(bossDone(b)?'Review case':'Enter case')+' →</button></article>').join('')+'</div>'+
 '<div class="section-title"><h2>Badge collection</h2><span class="smalltext muted">Evidence is self-attested.</span></div><div class="badge-grid">'+achievements().map(([name,desc,earned,icon])=>'<article class="badge '+(earned?'earned':'')+'"><span aria-hidden="true">'+icon+'</span><div><b>'+name+'</b><p>'+desc+'</p><small>'+(earned?'✓ Earned':'Not yet earned')+'</small></div></article>').join('')+'</div>'+
 '<div class="section-title"><h2>Recall station</h2><span class="smalltext muted">Suggested review after 2 days, then 7 days</span></div><div class="stack">'+(due.length?due.slice(0,5).map(s=>'<article class="card"><span class="pill">'+s.id+'</span><h3 class="space">'+s.question+'</h3><details><summary>Check your explanation</summary><p class="smalltext space">'+s.answer+'</p></details><div class="row space"><button data-review="'+s.id+'">I recalled and reviewed this</button><button class="text" data-session="'+s.id+'">Revisit session →</button></div></article>').join(''):'<div class="notice green">No recall reviews are due. Mark “explained” in a session’s evidence tab after your teach-back; it will return here for a later review.</div>')+'</div>'+
 '<details class="card space"><summary>How XP works—and what it proves</summary><p class="smalltext space">Each session awards 5 XP for opening it, 15 for an experiment, 60 for a recorded workspace demonstration, 20 for explaining it, and 25 for its engineering extension. Each correct boss decision awards 50 XP once. Repeated clicks do not stack points. Maximum: 3,450 XP.</p><p class="smalltext">Unchecking a milestone removes its XP. Workspace demonstrations require a note; you attest to completion yourself. XP, badges and ranks are motivation, not proof of independent expertise, job level, or certification readiness.</p><button class="text" data-page="plan">Plan your path to product fluency and certification →</button></details>';}
function battle(id){const b=BOSSES.find(b=>b.id===id);if(!b)return;const i=b.questions.findIndex(q=>!state.game.cleared[q.id]);if(i<0){dialog(b.name,'<div class="battle-success"><span class="boss-emblem">★</span><h3>Case cleared · 150 XP earned</h3><p>You worked through three decisions. Now test the same reasoning in your permitted workspace.</p></div>'+b.questions.map(q=>'<details class="card space"><summary>'+q.prompt+'</summary><p class="space"><b>'+q.options[q.correct]+'</b></p><p>'+q.why+'</p></details>').join('')+'<button class="primary space" data-action="close">Back to learning</button>');return;}
 const q=b.questions[i],f=battleFeedback[q.id];dialog(b.name,'<div class="row between"><span class="pill '+b.tier+'">'+b.tier+'</span><span class="smalltext muted">Decision '+(i+1)+' of 3 · 50 XP once</span></div><p class="smalltext muted space">'+b.story+'</p><h3>'+q.prompt+'</h3><div class="battle-options">'+q.options.map((o,n)=>'<button data-answer="'+q.id+':'+n+'"><span>'+String.fromCharCode(65+n)+'</span>'+o+'</button>').join('')+'</div>'+(f?'<div class="notice amber space" role="status"><b>Try another approach.</b> '+q.why+'</div>':'')+'<p class="smalltext muted space">No timer, lives, or penalties. These are original learning cases, not certification exam questions.</p>');}
function answerBattle(id,n){const b=BOSSES.find(b=>b.questions.some(q=>q.id===id));if(!b)return;const q=b.questions.find(q=>q.id===id);if(!Number.isInteger(n)||n<0||n>=q.options.length)return;if(n!==q.correct){battleFeedback[id]=true;battle(b.id);return;}const first=!state.game.cleared[id];state.game.cleared[id]=true;activity('boss',id);save();if(page==='quests'||page==='home')render();dialog(b.name,'<div class="notice green" role="status"><b>Good decision'+(first?' · +50 XP':'')+'.</b> '+q.why+'</div><div class="row space"><button class="primary" data-boss="'+b.id+'">'+(bossDone(b)?'View completed case':'Next decision')+' →</button><button data-battle-lesson="'+q.session+'">Review related lesson</button></div>');}
function travelKit(){dialog('Your academy, wherever you learn','<p>The lessons are public. Your notes and learning progress are saved in this browser on this device; the academy does not upload them to GitHub or Databricks.</p><ol><li>On your current device, export your portfolio JSON.</li><li>Move that file using a location approved for your learning notes.</li><li>Open the academy on your other device and import it.</li></ol><div class="notice amber">Import replaces this device’s academy progress and notes. Export a backup first. There is no automatic cloud sync or account login.</div><div class="row space"><button class="primary" data-action="export">Export portfolio</button><button data-action="import">Import portfolio</button></div><p class="smalltext muted space">Coming from the original downloaded academy? Export there and import here; its portfolio format is supported. Keep company data, sensitive identifiers and credentials in your approved workspace.</p><p><a href="./index.html" download="Databricks_Product_Academy.html">Download this self-contained guide for offline use</a></p>');}

