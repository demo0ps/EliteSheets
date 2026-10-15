// Teacher registers: class and period registers, daily attendance, monthly summary and Excel export.
// Registers are saved in this browser only (localStorage). Nothing is sent to the server.
import * as XLSX from 'xlsx';

export type Mark = 'P' | 'A' | 'L'; // Present, Absent, Late (late counts as present, but is listed separately)
export type Learner = {id:string; name:string};
export type RegisterTemplate = {name:string; headings:string[]; fileDataUrl?:string};
export type Register = {
  id:string;
  name:string;
  kind:'class'|'period';
  learners:Learner[];
  days:Record<string,Record<string,Mark>>; // date 'YYYY-MM-DD' -> learner id -> mark
  template?:RegisterTemplate;
};
export type LearnerSummary = {
  learner:Learner;
  present:number; absent:number; late:number; unmarked:number;
  longestAbsenceRun:number;
  flags:string[];
};
export type MonthlySummary = {
  month:string; // 'YYYY-MM'
  recordedDays:string[];
  learnerDays:number;   // learner-days with a mark
  absentDays:number;
  absenteeRate:number | null; // percent, 1 decimal
  rows:LearnerSummary[];
};

export const CONSECUTIVE_ABSENCE_FLAG = 3; // three consecutive unexplained absences: tell the principal
export const REPEATED_ABSENCE_FLAG = 5;    // default monthly threshold for repeated absence; confirm with schools

const STORE_KEY='elite-sheets-registers-v1';
const MAX_TEMPLATE_BYTES=1_500_000;

export function loadRegisters():Register[]{
  try{const raw=localStorage.getItem(STORE_KEY);return raw?JSON.parse(raw):[]}catch{return []}
}
export function saveRegisters(list:Register[]){
  localStorage.setItem(STORE_KEY,JSON.stringify(list));
}

export function monthOf(date:string){return date.slice(0,7)}

// Monthly summary for one register. Pure function, so it can be tested.
export function monthlySummary(reg:Register, month:string):MonthlySummary{
  const recordedDays=Object.keys(reg.days).filter(d=>monthOf(d)===month&&Object.keys(reg.days[d]).length>0).sort();
  let learnerDays=0, absentDays=0;
  const rows:LearnerSummary[]=reg.learners.map(learner=>{
    let present=0, absent=0, late=0, unmarked=0, run=0, longest=0;
    for(const d of recordedDays){
      const m=reg.days[d][learner.id];
      if(m===undefined){unmarked++;run=0;continue}
      learnerDays++;
      if(m==='A'){absent++;absentDays++;run++;longest=Math.max(longest,run)}
      else{run=0; if(m==='L'){late++;present++}else present++}
    }
    const flags:string[]=[];
    if(longest>=CONSECUTIVE_ABSENCE_FLAG)flags.push(`${longest} days absent in a row: tell the principal`);
    if(absent>=REPEATED_ABSENCE_FLAG)flags.push(`Repeated absence (${absent} days this month)`);
    return {learner,present,absent,late,unmarked,longestAbsenceRun:longest,flags};
  });
  const rate=learnerDays?Math.round((absentDays/learnerDays)*1000)/10:null;
  return {month,recordedDays,learnerDays,absentDays,absenteeRate:rate,rows};
}

// Learner numbers and names must be unique within a register.
export function validateLearners(learners:Learner[]):string[]{
  const problems:string[]=[];
  const ids=new Set<string>();
  for(const l of learners){
    const id=l.id.trim();
    if(!id){problems.push('A learner has no number.');continue}
    if(ids.has(id))problems.push(`Learner number ${id} is used twice.`);
    ids.add(id);
  }
  return problems;
}

// Builds the monthly Excel workbook: a signed summary sheet and a daily grid.
export function registerWorkbook(reg:Register, month:string):XLSX.WorkBook{
  const s=monthlySummary(reg,month);
  const wb=XLSX.utils.book_new();
  const summary:(string|number|null)[][]=[
    [reg.name],
    [`Monthly attendance: ${month}`],
    [`Recorded days: ${s.recordedDays.length}`, '', `Absentee rate: ${s.absenteeRate===null?'n/a':s.absenteeRate+'%'}`],
    [],
    ['Learner number','Name','Present','Absent','Late','Longest absence run','Unmarked days','Flags'],
    ...s.rows.map(r=>[r.learner.id,r.learner.name,r.present,r.absent,r.late,r.longestAbsenceRun,r.unmarked,r.flags.join('; ')]),
    [],
    ['Teacher signature','','','Date',''],
    ['Principal signature','','','Date',''],
  ];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(summary),'Monthly summary');
  const daily:string[][]=[['Learner number','Name',...s.recordedDays]];
  for(const l of reg.learners){
    daily.push([l.id,l.name,...s.recordedDays.map(d=>reg.days[d][l.id]??'')]);
  }
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(daily),'Daily register');
  return wb;
}

export function exportRegister(reg:Register, month:string){
  const safe=(reg.name||'Register').replace(/[^\w\- ]+/g,'').trim()||'Register';
  XLSX.writeFile(registerWorkbook(reg,month),`${safe} ${month}.xlsx`);
}

// Reads the heading row of an Excel or CSV template. Other file types are stored as a reference only.
export async function readTemplate(file:File):Promise<RegisterTemplate>{
  if(file.size>MAX_TEMPLATE_BYTES)throw new Error('That file is too large to keep in this browser (limit 1.5 MB). Try a smaller file or a photo at lower resolution.');
  const lower=file.name.toLowerCase();
  let headings:string[]=[];
  if(/\.(xlsx|xls|csv)$/.test(lower)){
    const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json<string[]>(ws,{header:1,blankrows:false}) as string[][];
    headings=(rows[0]??[]).map(h=>String(h??'').trim()).filter(Boolean);
  }
  const fileDataUrl=await new Promise<string>((resolve,reject)=>{
    const r=new FileReader(); r.onload=()=>resolve(String(r.result)); r.onerror=()=>reject(r.error); r.readAsDataURL(file);
  });
  return {name:file.name,headings,fileDataUrl};
}

function newId(){return Math.random().toString(36).slice(2,10)}
function esc(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
function todayLocal(){
  const d=new Date(); const p=(n:number)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

// Screen. Keeps the same look as the gradebook.
export function renderRegister(root:HTMLElement,toast:(msg:string,err?:boolean)=>void){
  let registers=loadRegisters();
  let activeId=registers[0]?.id??'';
  let date=todayLocal();
  let month=date.slice(0,7);
  const persist=()=>saveRegisters(registers);
  const current=()=>registers.find(r=>r.id===activeId);

  const draw=()=>{
    const reg=current();
    if(!reg){
      root.innerHTML=`<div class="page-heading"><div><h1>Registers</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Create a class or period register. Names and attendance are saved in this browser only.</p></div></div>
        <div class="panel" style="padding:20px;display:grid;gap:10px;max-width:520px">
          <label>Register name <input id="rg-new-name" placeholder="e.g. Grade 8A class register"></label>
          <label>Type <select id="rg-new-kind"><option value="class">Class register (daily)</option><option value="period">Period register (subject)</option></select></label>
          <div><button class="btn primary" id="rg-new">Create register</button></div>
        </div>`;
      root.querySelector<HTMLButtonElement>('#rg-new')!.onclick=()=>{
        const name=root.querySelector<HTMLInputElement>('#rg-new-name')!.value.trim();
        const kind=root.querySelector<HTMLSelectElement>('#rg-new-kind')!.value as 'class'|'period';
        if(!name){toast('Give the register a name.',true);return}
        const r:Register={id:newId(),name,kind,learners:[],days:{}};
        registers.push(r);activeId=r.id;persist();draw();
      };
      return;
    }
    const options=registers.map(r=>`<option value="${r.id}" ${r.id===activeId?'selected':''}>${esc(r.name)} (${r.kind==='class'?'class':'period'})</option>`).join('');
    const dayMarks=reg.days[date]??{};
    const marked=Object.keys(dayMarks).length;
    const learnerRows=reg.learners.map((l,i)=>{
      const m=dayMarks[l.id];
      const btn=(code:Mark,label:string)=>`<button class="btn small ${m===code?'primary':''}" data-mark="${code}" data-li="${i}" aria-pressed="${m===code}" aria-label="${label} for ${esc(l.name||l.id)}">${code}</button>`;
      return `<tr><td>${esc(l.id)}</td><td>${esc(l.name)}</td><td style="white-space:nowrap">${btn('P','Present')} ${btn('A','Absent')} ${btn('L','Late')}</td><td><button class="btn small" data-rm="${i}" aria-label="Remove learner">Remove</button></td></tr>`;
    }).join('');
    const sum=monthlySummary(reg,month);
    const sumRows=sum.rows.map(r=>`<tr><td>${esc(r.learner.id)}</td><td>${esc(r.learner.name)}</td><td>${r.present}</td><td>${r.absent}</td><td>${r.late}</td><td>${r.longestAbsenceRun}</td><td>${r.flags.length?r.flags.map(esc).join('<br>'):'<span style="color:var(--good)">None</span>'}</td></tr>`).join('');
    const problems=validateLearners(reg.learners);
    const tpl=reg.template;
    root.innerHTML=`<div class="page-heading"><div><h1>Registers</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Mark the day, then download the monthly summary for the principal to sign. Saved in this browser only.</p></div></div>
      <div class="panel" style="padding:16px;display:grid;gap:12px">
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <select id="rg-select" aria-label="Choose register">${options}</select>
          <button class="btn" id="rg-new-open">New register</button>
          <button class="btn" id="rg-delete">Delete register</button>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <label>Day <input type="date" id="rg-date" value="${date}"></label>
          <span style="font-size:13px;color:var(--muted)">${marked} of ${reg.learners.length} learners marked for this day</span>
          <button class="btn small" id="rg-all-p" ${reg.learners.length?'':'disabled'}>Mark everyone present</button>
        </div>
      </div>
      <div class="panel" style="padding:16px;margin-top:14px">
        <h2 style="font-size:17px;margin:0 0 10px">Learners</h2>
        ${problems.length?`<p style="color:var(--bad);font-size:13px">${problems.map(esc).join(' ')}</p>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <input id="rg-l-id" placeholder="Learner number" aria-label="Learner number" style="width:150px">
          <input id="rg-l-name" placeholder="Name (optional)" aria-label="Learner name" style="width:220px">
          <button class="btn" id="rg-add-l">Add learner</button>
        </div>
        <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr><th style="text-align:left">Number</th><th style="text-align:left">Name</th><th style="text-align:left">Mark for ${esc(date)}</th><th></th></tr></thead>
          <tbody>${learnerRows||'<tr><td colspan="4" style="color:var(--muted)">Add learners to start the register.</td></tr>'}</tbody>
        </table></div>
        <p style="font-size:12px;color:var(--muted);margin-top:8px">P = present, A = absent, L = late (late learners count as present but are listed separately).</p>
      </div>
      <div class="panel" style="padding:16px;margin-top:14px">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center">
          <h2 style="font-size:17px;margin:0">Monthly summary</h2>
          <div style="display:flex;gap:8px;align-items:center"><label>Month <input type="month" id="rg-month" value="${month}"></label>
          <button class="btn primary" id="rg-export" ${sum.recordedDays.length?'':'disabled'}>Download Excel</button></div>
        </div>
        <p style="font-size:13px;color:var(--muted);margin:8px 0">${sum.recordedDays.length} recorded day(s). Absentee rate: <strong>${sum.absenteeRate===null?'n/a':sum.absenteeRate+'%'}</strong></p>
        <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr><th style="text-align:left">Number</th><th style="text-align:left">Name</th><th>Present</th><th>Absent</th><th>Late</th><th>Longest run</th><th style="text-align:left">Flags</th></tr></thead>
          <tbody>${sumRows||'<tr><td colspan="7" style="color:var(--muted)">No recorded days this month yet.</td></tr>'}</tbody>
        </table></div>
      </div>
      <div class="panel" style="padding:16px;margin-top:14px">
        <h2 style="font-size:17px;margin:0 0 8px">School register template</h2>
        ${tpl?`<p style="font-size:14px">Stored: <strong>${esc(tpl.name)}</strong>${tpl.headings.length?`. Headings found: ${tpl.headings.map(esc).join(', ')}`:' (no headings could be read from this file; type them below if needed).'}</p>
          ${tpl.fileDataUrl?`<a class="btn small" href="${tpl.fileDataUrl}" download="${esc(tpl.name)}">Open stored template</a>`:''}
          <button class="btn small" id="rg-tpl-remove">Remove template</button>`:'<p style="font-size:14px;color:var(--muted)">Attach your school\'s register template (Excel, CSV, PDF or photo). Excel and CSV headings are read automatically.</p>'}
        <div style="margin-top:10px"><input type="file" id="rg-tpl" accept=".xlsx,.xls,.csv,.pdf,image/*" aria-label="Attach register template"></div>
      </div>`;
    wire(reg);
  };

  const wire=(reg:Register)=>{
    root.querySelector<HTMLSelectElement>('#rg-select')!.onchange=e=>{activeId=(e.target as HTMLSelectElement).value;draw()};
    root.querySelector<HTMLButtonElement>('#rg-new-open')!.onclick=()=>{activeId='';draw()};
    root.querySelector<HTMLButtonElement>('#rg-delete')!.onclick=()=>{
      if(!confirm(`Delete "${reg.name}" and all its attendance? This cannot be undone.`))return;
      registers=registers.filter(r=>r.id!==reg.id);activeId=registers[0]?.id??'';persist();draw();
    };
    root.querySelector<HTMLInputElement>('#rg-date')!.onchange=e=>{date=(e.target as HTMLInputElement).value||todayLocal();draw()};
    root.querySelector<HTMLInputElement>('#rg-month')!.onchange=e=>{month=(e.target as HTMLInputElement).value||month;draw()};
    root.querySelectorAll<HTMLButtonElement>('[data-mark]').forEach(b=>b.onclick=()=>{
      const li=Number(b.dataset.li);const l=reg.learners[li];const code=b.dataset.mark as Mark;
      reg.days[date]={...(reg.days[date]??{}),[l.id]:code};persist();draw();
    });
    root.querySelector<HTMLButtonElement>('#rg-all-p')?.addEventListener('click',()=>{
      const d:Record<string,Mark>={...(reg.days[date]??{})};
      for(const l of reg.learners)if(d[l.id]===undefined)d[l.id]='P';
      reg.days[date]=d;persist();draw();
    });
    root.querySelectorAll<HTMLButtonElement>('[data-rm]').forEach(b=>b.onclick=()=>{
      const l=reg.learners[Number(b.dataset.rm)];
      if(!confirm(`Remove ${l.name||l.id} and their attendance from this register?`))return;
      reg.learners.splice(Number(b.dataset.rm),1);
      for(const d of Object.keys(reg.days))delete reg.days[d][l.id];
      persist();draw();
    });
    root.querySelector<HTMLButtonElement>('#rg-add-l')!.onclick=()=>{
      const id=root.querySelector<HTMLInputElement>('#rg-l-id')!.value.trim();
      const name=root.querySelector<HTMLInputElement>('#rg-l-name')!.value.trim();
      if(!id){toast('Enter a learner number.',true);return}
      if(reg.learners.some(l=>l.id===id)){toast(`Learner number ${id} is already in this register.`,true);return}
      reg.learners.push({id,name});persist();draw();
    };
    root.querySelector<HTMLButtonElement>('#rg-export')?.addEventListener('click',()=>{
      const problems=validateLearners(reg.learners);
      if(problems.length){toast(problems[0],true);return}
      exportRegister(reg,month);toast('Register downloaded.');
    });
    root.querySelector<HTMLInputElement>('#rg-tpl')!.onchange=async e=>{
      const f=(e.target as HTMLInputElement).files?.[0];if(!f)return;
      try{reg.template=await readTemplate(f);persist();toast('Template stored.');draw()}
      catch(err){toast((err as Error).message,true)}
    };
    root.querySelector<HTMLButtonElement>('#rg-tpl-remove')?.addEventListener('click',()=>{delete reg.template;persist();draw()});
  };

  draw();
}
