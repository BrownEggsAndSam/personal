/* All records are synthetic. These pure functions also run in the validation suite. */
const LOANS = [
 [1,'L1001','250000','VA','Current','a@example.test',10],
 [2,'L1002','180000','FL','Current','b@example.test',10],
 [3,'L1003','-500','NJ','Current','c@example.test',10],
 [4,'L1004','125000','ZZ','Current','d@example.test',10],
 [5,'L1005','300000','VA','Unknown','e@example.test',10],
 [6,'L1006','150000','FL','Current',null,10],
 [7,'L1007',null,'VA','Current','g@example.test',10],
 [8,'L1008','95000','NJ','Paid','h@example.test',10],
 [9,'L1002','179000','FL','Current','b@example.test',11],
 [10,'L1008','0','NJ','Paid','h@example.test',11],
 [11,'L1009','210000','VA','Delinquent','bad-email',10],
 [12,'L1010','500000','VA','Current','j@example.test',10]
].map(([event_id,loan_id,balance_raw,state,status,email,hour])=>({event_id,loan_id,balance_raw,state,status,email,hour}));
const CORE_RULES=['balance','state','status'];
function failures(r,rules=CORE_RULES){let f=[];if(rules.includes('balance')&&(r.balance_raw===null||!Number.isFinite(Number(r.balance_raw))||Number(r.balance_raw)<0))f.push('Missing, invalid, or negative balance');if(rules.includes('state')&&!['VA','FL','NJ'].includes(r.state))f.push('State outside this portfolio’s domain');if(rules.includes('status')&&!['Current','Delinquent','Paid'].includes(r.status))f.push('Unknown status');return f;}
function emailWarning(r){return !r.email||!/^\S+@\S+\.\S+$/.test(r.email);}
function latest(rows){let m=new Map();for(const r of rows){let old=m.get(r.loan_id);if(!old||r.hour>old.hour||(r.hour===old.hour&&r.event_id>old.event_id))m.set(r.loan_id,r);}return [...m.values()].sort((a,b)=>a.loan_id.localeCompare(b.loan_id));}
function pipeline({dedup=true,rules=CORE_RULES,rows=LOANS}={}){let current=dedup?latest(rows):rows;let valid=current.filter(r=>!failures(r,rules).length);let quarantine=current.filter(r=>failures(r,rules).length);return {current,valid,quarantine,balance:valid.reduce((n,r)=>n+Number(r.balance_raw),0),warnings:valid.filter(emailWarning),pass:valid.length/current.length*100};}
function access({catalog,schema,select,tag,mask,privileged}){return !catalog||!schema||!select?'DENIED':mask&&!privileged?'MASKED':'VISIBLE';}
function approvalRate(approved,denominator){return denominator?Math.round(approved/denominator*100):0;}
function downstream(selected,edges){let seen=new Set();const visit=n=>{for(const [a,b]of edges){if(a===n&&!seen.has(b)){seen.add(b);visit(b);}}};visit(selected);seen.delete(selected);return [...seen];}
function duplicateRisk(keys,idempotent){return idempotent?new Set(keys).size:keys.length;}
if(typeof module!=='undefined')module.exports={LOANS,CORE_RULES,failures,emailWarning,latest,pipeline,access,approvalRate,downstream,duplicateRisk};
