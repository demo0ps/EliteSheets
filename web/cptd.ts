// CPTD log: a teacher's own record of professional development (PD) activities, with a 150-point, three-year cycle.
// Points are entered by the teacher from the certificate or SACE record. The app does not assign points.
// This is a personal record. It does not report anything to SACE. Teachers report to SACE themselves.
// Saved in this browser only (localStorage). Nothing is sent to the server.
import * as XLSX from 'xlsx';

export type PDType = 1 | 2 | 3; // 1 teacher-initiated, 2 school-initiated, 3 provider/employer-initiated
export type PDActivity = {
  id:string; date:string; title:string; provider:string; type:PDType; points:number;
  reported:boolean; reportedDate:string; evidenceName?:string; evidenceDataUrl?:string;
};
export type CPTDProfile = {cycleStart:string; activities:PDActivity[]};
export type CycleSummary = {
  cycleStart:string; cycleEnd:string; total:number; target:number; remaining:number;
  byType:Record<PDType,number>; typesCovered:PDType[]; missingTypes:PDType[];
  unreported:number; percent:number; counted:PDActivity[]; outside:PDActivity[];
};

export const CPTD_TARGET=150;
export const TYPE_LABEL:Record<PDType,string>={
  1:'Type 1: teacher-initiated',2:'Type 2: school-initiated',3:'Type 3: provider or employer-initiated'};

const STORE_KEY='elite-sheets-cptd-v1';
const MAX_EVIDENCE_BYTES=1_500_000;

export function loadProfile():CPTDProfile{
  try{const raw=localStorage.getItem(STORE_KEY);return raw?JSON.parse(raw):{cycleStart:'',activities:[]}}catch{return {cycleStart:'',activities:[]}}
}
export function saveProfile(p:CPTDProfile){localStorage.setItem(STORE_KEY,JSON.stringify(p))}

function isDate(s:string){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))}
function addYears(date:string,years:number){const d=new Date(date+'T00:00:00');d.setFullYear(d.getFullYear()+years);d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)}

// The cycle runs three years from the start date, inclusive of the last day.
export function cycleBounds(cycleStart:string){return {start:cycleStart,end:addYears(cycleStart,3)}}

export function summarise(profile:CPTDProfile):CycleSummary|null{
  if(!isDate(profile.cycleStart))return null;
  const {start,end}=cycleBounds(profile.cycleStart);
  const counted=profile.activities.filter(a=>a.date>=start&&a.date<=end);
  const outside=profile.activities.filter(a=>!(a.date>=start&&a.date<=end));
  const byType:Record<PDType,number>={1:0,2:0,3:0};
  for(const a of counted)byType[a.type]+=a.points;
  const total=counted.reduce((s,a)=>s+a.points,0);
  const typesCovered=([1,2,3] as PDType[]).filter(t=>counted.some(a=>a.type===t));
  const missingTypes=([1,2,3] as PDType[]).filter(t=>!typesCovered.includes(t));
  return {
    cycleStart:start,cycleEnd:end,total,target:CPTD_TARGET,remaining:Math.max(0,CPTD_TARGET-total),
    byType,typesCovered,missingTypes,
    unreported:counted.filter(a=>!a.reported).length,
    percent:Math.min(100,Math.round((total/CPTD_TARGET)*1000)/10),
    counted,outside,
  };
}

// Reporting windows from the SACE guidance: May/June and October/November.
export function reportingWindows(year:number){
  return [
    {label:'May/June reporting window',start:`${year}-05-01`,end:`${year}-06-30`},
    {label:'October/November reporting window',start:`${year}-10-01`,end:`${year}-11-30`},
  ];
}

// Returns the window open now, or the next one, with how many days away it is.
export function windowStatus(today:string){
  const year=Number(today.slice(0,4));
  const all=[...reportingWindows(year-1),...reportingWindows(year),...reportingWindows(year+1)];
  for(const w of all){
    if(today>=w.start&&today<=w.end)return {state:'open' as const,window:w,daysAway:0};
  }
  const next=all.find(w=>w.start>today);
  if(!next)return null;
  const days=Math.round((Date.parse(next.start)-Date.parse(today))/86400000);
  return {state:'upcoming' as const,window:next,daysAway:days};
}

export function validateActivity(a:Partial<PDActivity>):string[]{
  const problems:string[]=[];
  if(!a.title||!a.title.trim())problems.push('Give the activity a title.');
  if(!a.date||!isDate(a.date))problems.push('Enter the activity date.');
  if(![1,2,3].includes(Number(a.type)))problems.push('Choose the activity type.');
  if(a.points===undefined||!Number.isFinite(Number(a.points))||Number(a.points)<0)problems.push('Enter the points from the certificate (0 or more).');
  return problems;
}

// Excel workbook: a summary sheet and the activity list, for the teacher's own PDP file.
export function cptdWorkbook(profile:CPTDProfile):XLSX.WorkBook{
  const s=summarise(profile);
  const wb=XLSX.utils.book_new();
  const head:(string|number)[][]=s?[
    ['CPTD record (personal, not submitted to SACE)'],
    ['Cycle',`${s.cycleStart} to ${s.cycleEnd}`],
    ['Points in cycle',s.total,'Target',s.target,'Remaining',s.remaining],
    ['Type 1 points',s.byType[1],'Type 2 points',s.byType[2],'Type 3 points',s.byType[3]],
    ['Types missing',s.missingTypes.length?s.missingTypes.join(', '):'None'],
    ['Activities not yet reported to SACE',s.unreported],
  ]:[['Set the cycle start date first.']];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(head),'Summary');
  const rows=profile.activities.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(a=>[
    a.date,a.title,a.provider,a.type,a.points,a.reported?'Yes':'No',a.reportedDate||'',
    (a.date>=(s?.cycleStart??'0')&&a.date<=(s?.cycleEnd??'9'))?'Counted':'Outside this cycle',a.evidenceName||''
  ]);
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Date','Activity','Provider','Type','Points','Reported to SACE','Reported date','Cycle','Evidence file'],...rows]),'Activities');
  return wb;
}

export function exportCPTD(profile:CPTDProfile){
  XLSX.writeFile(cptdWorkbook(profile),'CPTD record.xlsx');
}

export async function readEvidence(file:File){
  if(file.size>MAX_EVIDENCE_BYTES)throw new Error('That file is too large to keep in this browser (limit 1.5 MB).');
  return new Promise<{name:string;dataUrl:string}>((resolve,reject)=>{
    const r=new FileReader(); r.onload=()=>resolve({name:file.name,dataUrl:String(r.result)}); r.onerror=()=>reject(r.error); r.readAsDataURL(file);
  });
}

function newId(){return Math.random().toString(36).slice(2,10)}
function esc(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
function todayLocal(){const d=new Date();const p=(n:number)=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}

export function renderCPTD(root:HTMLElement,toast:(msg:string,err?:boolean)=>void){
  let profile=loadProfile();
  const persist=()=>saveProfile(profile);
  const draw=()=>{
    const s=summarise(profile);
    const today=todayLocal();
    const win=windowStatus(today);
    const winText=win?(win.state==='open'
      ?`<strong>${esc(win.window.label)} is open now</strong> (until ${win.window.end}). ${s?.unreported?`${s.unreported} activit${s.unreported===1?'y is':'ies are'} not yet reported to SACE.`:'Everything is marked reported.'}`
      :`Next: ${esc(win.window.label)} opens ${win.window.start} (${win.daysAway} day${win.daysAway===1?'':'s'} away).`):'';
    const bar=s?`<div style="background:var(--panel2);border-radius:999px;height:14px;overflow:hidden;margin:8px 0"><div style="width:${s.percent}%;height:100%;background:var(--accent)"></div></div>`:'';
    const summary=s?`<div class="panel" style="padding:16px;display:grid;gap:8px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><strong style="font-size:16px">${s.total} of ${s.target} points</strong><span style="color:var(--muted);font-size:13px">Cycle ${s.cycleStart} to ${s.cycleEnd}</span></div>
        ${bar}
        <div style="font-size:14px">${s.remaining?`${s.remaining} points still needed in this cycle.`:'Target reached for this cycle.'}</div>
        <div style="font-size:14px">Type 1: ${s.byType[1]} · Type 2: ${s.byType[2]} · Type 3: ${s.byType[3]}</div>
        <div style="font-size:14px;color:${s.missingTypes.length?'var(--warn)':'var(--good)'}">${s.missingTypes.length?`No ${s.missingTypes.map(t=>`Type ${t}`).join(' or ')} activity yet. SACE expects all three types.`:'Activities from all three types recorded.'}</div>
      </div>`:`<div class="panel" style="padding:16px"><label>Start of your current three-year cycle <input type="date" id="cp-start" value="${profile.cycleStart}"></label>
        <button class="btn primary" id="cp-save-start" style="margin-left:8px">Save cycle start</button>
        <p style="font-size:13px;color:var(--muted);margin:8px 0 0">Use the date your current SACE cycle started. Activities before that date are kept but not counted.</p></div>`;
    const rows=profile.activities.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(a=>{
      const idx=profile.activities.indexOf(a);
      const counted=s?(a.date>=s.cycleStart&&a.date<=s.cycleEnd):false;
      return `<tr><td>${esc(a.date)}</td><td>${esc(a.title)}<br><span style="font-size:12px;color:var(--muted)">${esc(a.provider)}</span></td><td>Type ${a.type}</td><td>${a.points}</td>
        <td><label style="white-space:nowrap"><input type="checkbox" data-rep="${idx}" ${a.reported?'checked':''}> Reported</label></td>
        <td>${counted?'<span style="color:var(--good)">Counted</span>':'<span style="color:var(--muted)">Outside cycle</span>'}</td>
        <td>${a.evidenceDataUrl?`<a href="${a.evidenceDataUrl}" download="${esc(a.evidenceName||'evidence')}">${esc(a.evidenceName||'Evidence')}</a>`:'<span style="color:var(--muted)">None</span>'}</td>
        <td><button class="btn small" data-del="${idx}" aria-label="Delete activity">Delete</button></td></tr>`;
    }).join('');
    root.innerHTML=`<div class="page-heading"><div><h1>CPTD log</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Your personal record of professional development. Teachers report to SACE themselves. Saved in this browser only.</p></div></div>
      ${win?`<div class="panel" style="padding:12px 16px;margin-bottom:14px;background:var(--gold-soft)">${winText}</div>`:''}
      ${summary}
      <div class="panel" style="padding:16px;margin-top:14px">
        <h2 style="font-size:17px;margin:0 0 10px">Add an activity</h2>
        <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
          <label>Date <input type="date" id="cp-date" value="${today}"></label>
          <label>Activity title <input id="cp-title" placeholder="e.g. Maths content workshop"></label>
          <label>Provider <input id="cp-provider" placeholder="e.g. District office"></label>
          <label>Type <select id="cp-type"><option value="1">Type 1: teacher-initiated</option><option value="2">Type 2: school-initiated</option><option value="3">Type 3: provider or employer</option></select></label>
          <label>Points (from certificate) <input type="number" id="cp-points" min="0" step="1" value="0"></label>
          <label>Evidence (certificate, PDF or photo) <input type="file" id="cp-file" accept=".pdf,image/*"></label>
        </div>
        <div style="margin-top:10px"><button class="btn primary" id="cp-add">Add activity</button></div>
      </div>
      <div class="panel" style="padding:16px;margin-top:14px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center"><h2 style="font-size:17px;margin:0">Activities</h2>
        <button class="btn" id="cp-export" ${profile.activities.length?'':'disabled'}>Download CPTD record</button></div>
        <div style="overflow-x:auto;margin-top:10px"><table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr><th style="text-align:left">Date</th><th style="text-align:left">Activity</th><th style="text-align:left">Type</th><th>Points</th><th style="text-align:left">SACE</th><th style="text-align:left">Cycle</th><th style="text-align:left">Evidence</th><th></th></tr></thead>
          <tbody>${rows||'<tr><td colspan="8" style="color:var(--muted)">No activities yet. Add your first one above.</td></tr>'}</tbody>
        </table></div>
      </div>`;
    wire();
  };
  const wire=()=>{
    root.querySelector<HTMLButtonElement>('#cp-save-start')?.addEventListener('click',()=>{
      const v=root.querySelector<HTMLInputElement>('#cp-start')!.value;
      if(!v){toast('Choose the start date of your cycle.',true);return}
      profile.cycleStart=v;persist();draw();
    });
    root.querySelector<HTMLButtonElement>('#cp-add')!.onclick=async()=>{
      const v=(id:string)=>root.querySelector<HTMLInputElement|HTMLSelectElement>('#'+id)!.value;
      const a:Partial<PDActivity>={date:v('cp-date'),title:v('cp-title').trim(),provider:v('cp-provider').trim(),type:Number(v('cp-type')) as PDType,points:Number(v('cp-points'))};
      const problems=validateActivity(a);
      if(problems.length){toast(problems[0],true);return}
      let evidence:{name:string;dataUrl:string}|undefined;
      const f=root.querySelector<HTMLInputElement>('#cp-file')!.files?.[0];
      if(f){try{evidence=await readEvidence(f)}catch(err){toast((err as Error).message,true);return}}
      profile.activities.push({id:newId(),date:a.date!,title:a.title!,provider:a.provider??'',type:a.type!,points:a.points!,reported:false,reportedDate:'',evidenceName:evidence?.name,evidenceDataUrl:evidence?.dataUrl});
      persist();toast('Activity added.');draw();
    };
    root.querySelectorAll<HTMLInputElement>('[data-rep]').forEach(c=>c.onchange=()=>{
      const a=profile.activities[Number(c.dataset.rep)];
      a.reported=c.checked;a.reportedDate=c.checked?todayLocal():'';persist();draw();
    });
    root.querySelectorAll<HTMLButtonElement>('[data-del]').forEach(b=>b.onclick=()=>{
      if(!confirm('Delete this activity from your CPTD record?'))return;
      profile.activities.splice(Number(b.dataset.del),1);persist();draw();
    });
    root.querySelector<HTMLButtonElement>('#cp-export')?.addEventListener('click',()=>{exportCPTD(profile);toast('CPTD record downloaded.')});
  };
  draw();
}
