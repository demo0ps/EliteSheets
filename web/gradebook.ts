// Teacher gradebook: weighted assessments, CAPS levels, checks and Excel export.
// Marks are saved in this browser only (localStorage). Nothing is sent to the server.
import * as XLSX from 'xlsx';

export type Assessment = {name:string; max:string; weight:string};
export type Learner = {id:string; marks:Record<string,string>};
export type GradeClass = {id:string; name:string; assessments:Assessment[]; learners:Learner[]};
export type Check = {level:'error'|'warning'; message:string};

const STORE_KEY='elite-sheets-gradebook-v1';
const ABSENT=new Set(['','-','--','—','n/a','na','absent','ab','exempt','not taken']);

export function loadClasses():GradeClass[]{
  try{const raw=localStorage.getItem(STORE_KEY);return raw?JSON.parse(raw):[]}catch{return []}
}
export function saveClasses(classes:GradeClass[]){
  localStorage.setItem(STORE_KEY,JSON.stringify(classes));
}

// Mirrors sheetqms/engine.py percentage_to_caps_level.
export function capsLevel(pct:number):number|null{
  if(!Number.isFinite(pct)||pct<0)return null;
  if(pct<=29.99)return 1;
  if(pct<=39.99)return 2;
  if(pct<=49.99)return 3;
  if(pct<=59.99)return 4;
  if(pct<=69.99)return 5;
  if(pct<=79.99)return 6;
  return 7;
}

// Returns a number, or null for blank/absent/non-numeric text.
export function numberOf(value:string|undefined):number|null{
  if(value===undefined||value===null)return null;
  const text=String(value).trim().replace(/%$/,'').trim();
  if(ABSENT.has(text.toLowerCase()))return null;
  if(!/^-?\d+(\.\d+)?$/.test(text))return null;
  return Number(text);
}

function isAbsent(value:string|undefined){
  return value!==undefined&&ABSENT.has(String(value).trim().toLowerCase());
}

export function validate(cls:GradeClass):Check[]{
  const checks:Check[]=[];
  if(!cls.assessments.length){checks.push({level:'error',message:'Add at least one assessment.'});return checks}
  const names=cls.assessments.map(a=>a.name.trim());
  for(const n of new Set(names.filter((n,i)=>n&&names.indexOf(n)!==i)))
    checks.push({level:'error',message:`Two assessments are called "${n}". Give each one a unique name.`});
  let totalWeight=0;
  for(const a of cls.assessments){
    const label=a.name.trim()||'(unnamed)';
    if(!a.name.trim())checks.push({level:'error',message:'An assessment has no name.'});
    const max=numberOf(a.max);
    if(max===null||max<=0)checks.push({level:'error',message:`"${label}" needs a maximum mark greater than zero.`});
    const weight=numberOf(a.weight);
    if(weight===null||weight<0)checks.push({level:'error',message:`"${label}" needs a weight of zero or more.`});
    else totalWeight+=weight;
  }
  if(Math.abs(totalWeight-100)>0.001)
    checks.push({level:'error',message:`The weights add up to ${+totalWeight.toFixed(2)}%, not 100%.`});
  const ids=new Set<string>();
  for(const l of cls.learners){
    const id=l.id.trim();
    if(!id){checks.push({level:'error',message:'A learner has no learner number or initials.'});continue}
    if(ids.has(id))checks.push({level:'error',message:`Learner "${id}" appears more than once.`});
    ids.add(id);
    for(const a of cls.assessments){
      const label=a.name.trim();
      const raw=l.marks[label];
      if(isAbsent(raw)){checks.push({level:'warning',message:`${id}: "${label}" is marked absent, so no term mark is calculated.`});continue}
      if(raw===undefined||raw.trim()===''){checks.push({level:'warning',message:`${id}: no mark for "${label}", so no term mark is calculated.`});continue}
      const mark=numberOf(raw);
      const max=numberOf(a.max);
      if(mark===null){checks.push({level:'error',message:`${id}: "${raw}" in "${label}" is not a number.`});continue}
      if(mark<0)checks.push({level:'error',message:`${id}: mark in "${label}" is negative.`});
      else if(max!==null&&max>0&&mark>max)checks.push({level:'error',message:`${id}: mark ${mark} in "${label}" is above the maximum of ${max}.`});
    }
  }
  return checks;
}

// Percentages are taken before weighting, so a 6-mark test counts the same as an 80-mark test.
export function calculate(cls:GradeClass,learner:Learner){
  const percentages:Record<string,number|null>={};
  let weighted=0, complete=true;
  for(const a of cls.assessments){
    const label=a.name.trim();
    const mark=numberOf(learner.marks[label]);
    const max=numberOf(a.max);
    const weight=numberOf(a.weight)??0;
    if(mark===null||max===null||max<=0||mark<0||mark>max){
      percentages[label]=null;
      if(weight>0)complete=false;
      continue;
    }
    const pct=Math.round(mark/max*10000)/100;
    percentages[label]=pct;
    weighted+=pct*weight;
  }
  if(!complete)return {percentages,term:null as number|null,level:null as number|null};
  const term=Math.round(weighted/100*100)/100;
  return {percentages,term,level:capsLevel(term)};
}

function newId(){return Math.random().toString(36).slice(2,10)}

function esc(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}

export function exportWorkbook(cls:GradeClass,checks:Check[]){
  const headers=['Learner',...cls.assessments.map(a=>a.name.trim()),'Term mark %','CAPS level'];
  const rows=cls.learners.map(l=>{
    const r=calculate(cls,l);
    return [l.id.trim(),...cls.assessments.map(a=>{
      const n=numberOf(l.marks[a.name.trim()]);
      return n!==null?n:(isAbsent(l.marks[a.name.trim()])?'absent':(l.marks[a.name.trim()]??''));
    }),r.term??'',r.level??''];
  });
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet([headers,...rows]);
  XLSX.utils.book_append_sheet(wb,ws,'Marks');
  const notes=checks.length?checks.map(c=>[c.level,c.message]):[['ok','No problems found.']];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Level','Message'],...notes]),'Checks');
  const safe=(cls.name||'Gradebook').replace(/[^\w\- ]+/g,'').trim()||'Gradebook';
  XLSX.writeFile(wb,`${safe}.xlsx`);
}

function setupSteps(cls:GradeClass,errorCount:number){
  const total=cls.assessments.reduce((t,a)=>t+(numberOf(a.weight)??0),0);
  const steps=[
    ['Name the class', cls.name.trim()!==''],
    ['Add assessments whose weights total 100%', Math.abs(total-100)<0.001 && cls.assessments.length>0],
    ['Add learners and enter their marks', cls.learners.some(l=>l.id.trim()!=='' && cls.assessments.some(a=>numberOf(l.marks[a.name.trim()])!==null))],
  ] as [string,boolean][];
  const ready=steps.every(([,d])=>d)&&errorCount===0;
  const list=steps.map(([t,done],i)=>`<li style="margin:4px 0;color:${done?'var(--good)':'var(--ink)'}">${done?'✓':(i+1)+'.'} ${esc(t)}</li>`).join('');
  return {title:ready?'Ready to download':'Three steps to a checked gradebook', list};
}

export function renderGradebook(root:HTMLElement,toast:(msg:string,err?:boolean)=>void){
  let classes=loadClasses();
  let activeId=classes[0]?.id??'';
  const persist=()=>saveClasses(classes);
  const current=()=>classes.find(c=>c.id===activeId);

  const draw=()=>{
    const cls=current();
    const classOptions=classes.map(c=>`<option value="${c.id}" ${c.id===activeId?'selected':''}>${esc(c.name)}</option>`).join('');
    if(!cls){
      root.innerHTML=`<div class="page-heading"><div><h1>My Gradebook</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Create a class to start. Marks are saved in this browser only.</p></div></div>
        <div class="panel" style="padding:20px"><label>Class name <input id="gb-new-name" placeholder="e.g. Grade 9B Maths" style="margin-left:8px;padding:8px"></label>
        <button class="btn primary" id="gb-new-class" style="margin-left:8px">Create class</button></div>`;
      root.querySelector<HTMLButtonElement>('#gb-new-class')!.onclick=()=>{
        const name=root.querySelector<HTMLInputElement>('#gb-new-name')!.value.trim();
        if(!name){toast('Give the class a name.',true);return}
        const c:GradeClass={id:newId(),name,assessments:[{name:'Test 1',max:'50',weight:'100'}],learners:[]};
        classes.push(c);activeId=c.id;persist();draw();
      };
      return;
    }
    const checks=validate(cls);
    const errors=checks.filter(c=>c.level==='error').length;
    const warnings=checks.filter(c=>c.level==='warning').length;
    const totalWeight=cls.assessments.reduce((s,a)=>s+(numberOf(a.weight)??0),0);
    const head=cls.assessments.map((a,i)=>`
      <div class="gb-arow">
        <input class="gb-name" data-a="${i}" data-f="name" value="${esc(a.name)}" placeholder="Assessment name" aria-label="Assessment name">
        <input class="gb-num" data-a="${i}" data-f="max" value="${esc(a.max)}" placeholder="Max" aria-label="Maximum mark" inputmode="decimal">
        <input class="gb-num" data-a="${i}" data-f="weight" value="${esc(a.weight)}" placeholder="Weight %" aria-label="Weight percent" inputmode="decimal">
        <button class="btn small" data-del-a="${i}" aria-label="Remove assessment">Remove</button></div>`).join('');
    const body=cls.learners.map((l,li)=>{
      const r=calculate(cls,l);
      const cells=cls.assessments.map((a,ai)=>`<td><input data-l="${li}" data-m="${ai}" value="${esc(l.marks[a.name.trim()]??'')}" style="width:80px;padding:6px" inputmode="decimal" aria-label="${esc(a.name)} mark for ${esc(l.id)}"></td>`).join('');
      return `<tr><td><input data-l="${li}" data-f="id" value="${esc(l.id)}" style="width:110px;padding:6px" aria-label="Learner number"></td>${cells}
        <td>${r.term===null?'<span style="color:var(--muted)">incomplete</span>':r.term.toFixed(2)}</td>
        <td>${r.level===null?'—':r.level}</td>
        <td><button class="btn small" data-del-l="${li}">Remove</button></td></tr>`;
    }).join('');
    const checkList=checks.length?checks.slice(0,12).map(c=>`<li style="color:${c.level==='error'?'var(--bad)':'var(--warn)'}">${esc(c.message)}</li>`).join(''):'<li style="color:var(--good)">No problems found.</li>';
    const setup=setupSteps(cls,errors);
    root.innerHTML=`<div class="page-heading"><div><h1>My Gradebook</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Turn messy school marks into checked, shareable reports. Your marks stay in this browser, so download the Excel file to keep a copy.</p></div></div>
      <div class="panel" style="padding:14px 16px;margin-bottom:14px"><strong style="font-size:14px">${setup.title}</strong><ol id="gb-setup" style="margin:8px 0 0 18px;padding:0;font-size:14px;list-style:none">${setup.list}</ol></div>
      <div class="panel" style="padding:16px;margin-bottom:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <select id="gb-class" aria-label="Class">${classOptions}</select>
        <button class="btn small" id="gb-add-class">New class</button>
        <button class="btn small" id="gb-rename">Rename</button>
        <button class="btn small" id="gb-delete-class">Delete class</button>
      </div>
      <div class="panel" style="padding:16px;margin-bottom:14px">
        <h2 style="font-size:16px;margin:0 0 10px">Assessments <span style="font-weight:normal;color:var(--muted);font-size:13px">weights total ${+totalWeight.toFixed(2)}% (must be 100%)</span></h2>
        ${head}
        <button class="btn small" id="gb-add-a">Add assessment</button>
      </div>
      <div class="panel" style="padding:16px;margin-bottom:14px;overflow-x:auto">
        <h2 style="font-size:16px;margin:0 0 10px">Learners</h2>
        <table style="border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left;padding:6px">Learner</th>${cls.assessments.map(a=>`<th style="text-align:left;padding:6px">${esc(a.name)}</th>`).join('')}<th style="text-align:left;padding:6px">Term %</th><th style="text-align:left;padding:6px">CAPS</th><th></th></tr></thead>
        <tbody>${body||'<tr><td colspan="99" style="padding:8px;color:var(--muted)">No learners yet.</td></tr>'}</tbody></table>
        <button class="btn small" id="gb-add-l" style="margin-top:10px">Add learner</button>
        <p style="font-size:12px;color:var(--muted);margin-top:8px">Use learner numbers or initials, not full names. Type "absent" for a learner who did not sit an assessment.</p>
      </div>
      <div class="panel" style="padding:16px;margin-bottom:14px">
        <h2 style="font-size:16px;margin:0 0 6px">Checks <span style="font-weight:normal;color:var(--muted);font-size:13px">${errors} error(s), ${warnings} warning(s)</span></h2>
        <ul style="margin:6px 0 12px 18px;font-size:14px">${checkList}</ul>
        <button class="btn primary" id="gb-export" ${errors?'disabled title="Fix the errors first"':''}>Download Excel</button>
        ${errors?'<span style="font-size:13px;color:var(--muted);margin-left:8px">Export unlocks when there are no errors.</span>':''}
      </div>`;

    const q=(s:string)=>root.querySelector<HTMLElement>(s)!;
    (q('#gb-class') as HTMLSelectElement).onchange=e=>{activeId=(e.target as HTMLSelectElement).value;draw()};
    q('#gb-add-class').onclick=()=>{const n=prompt('Class name?');if(!n||!n.trim())return;const c:GradeClass={id:newId(),name:n.trim(),assessments:[{name:'Test 1',max:'50',weight:'100'}],learners:[]};classes.push(c);activeId=c.id;persist();draw()};
    q('#gb-rename').onclick=()=>{const n=prompt('New class name?',cls.name);if(!n||!n.trim())return;cls.name=n.trim();persist();draw()};
    q('#gb-delete-class').onclick=()=>{if(!confirm(`Delete "${cls.name}" and all its marks from this browser?`))return;classes=classes.filter(c=>c.id!==cls.id);activeId=classes[0]?.id??'';persist();draw()};
    q('#gb-add-a').onclick=()=>{cls.assessments.push({name:`Assessment ${cls.assessments.length+1}`,max:'100',weight:'0'});persist();draw()};
    q('#gb-add-l').onclick=()=>{cls.learners.push({id:'',marks:{}});persist();draw()};
    root.querySelectorAll<HTMLInputElement>('[data-a]').forEach(inp=>inp.oninput=()=>{
      const i=Number(inp.dataset.a);const f=inp.dataset.f as keyof Assessment;
      const old=cls.assessments[i][f];
      cls.assessments[i][f]=inp.value;
      if(f==='name'&&old){cls.learners.forEach(l=>{if(old.trim()!==inp.value.trim()&&l.marks[old.trim()]!==undefined){l.marks[inp.value.trim()]=l.marks[old.trim()];delete l.marks[old.trim()]}})}
      persist();refreshSummary(cls);
    });
    root.querySelectorAll<HTMLButtonElement>('[data-del-a]').forEach(b=>b.onclick=()=>{cls.assessments.splice(Number(b.dataset.delA),1);persist();draw()});
    root.querySelectorAll<HTMLInputElement>('[data-l]').forEach(inp=>inp.oninput=()=>{
      const li=Number(inp.dataset.l);
      if(inp.dataset.f==='id')cls.learners[li].id=inp.value;
      else cls.learners[li].marks[cls.assessments[Number(inp.dataset.m)].name.trim()]=inp.value;
      persist();refreshSummary(cls);
    });
    root.querySelectorAll<HTMLButtonElement>('[data-del-l]').forEach(b=>b.onclick=()=>{cls.learners.splice(Number(b.dataset.delL),1);persist();draw()});
    q('#gb-export').onclick=()=>{
      const list=validate(cls);
      if(list.some(c=>c.level==='error')){toast('Fix the errors before exporting.',true);return}
      exportWorkbook(cls,list);toast('Gradebook downloaded.');
    };
  };

  // Update the checks panel and the term/CAPS columns without redrawing inputs (keeps focus).
  const refreshSummary=(cls:GradeClass)=>{
    const checks=validate(cls);
    const errors=checks.filter(c=>c.level==='error').length;
    const warnings=checks.filter(c=>c.level==='warning').length;
    const totalWeight=cls.assessments.reduce((s,a)=>s+(numberOf(a.weight)??0),0);
    const weightLabel=root.querySelector<HTMLElement>('h2 span');
    if(weightLabel)weightLabel.textContent=`weights total ${+totalWeight.toFixed(2)}% (must be 100%)`;
    const checkHead=[...root.querySelectorAll('h2')].find(h=>h.textContent?.startsWith('Checks'));
    if(checkHead)checkHead.innerHTML=`Checks <span style="font-weight:normal;color:var(--muted);font-size:13px">${errors} error(s), ${warnings} warning(s)</span>`;
    const list=checkHead?.parentElement?.querySelector('ul');
    if(list)list.innerHTML=checks.length?checks.slice(0,12).map(c=>`<li style="color:${c.level==='error'?'var(--bad)':'var(--warn)'}">${esc(c.message)}</li>`).join(''):'<li style="color:var(--good)">No problems found.</li>';
    cls.learners.forEach((l,li)=>{
      const r=calculate(cls,l);
      const row=root.querySelectorAll('tbody tr')[li];
      if(!row)return;
      const cells=row.querySelectorAll('td');
      const n=cells.length;
      cells[n-3].innerHTML=r.term===null?'<span style="color:var(--muted)">incomplete</span>':r.term.toFixed(2);
      cells[n-2].textContent=r.level===null?'—':String(r.level);
    });
    const setupBox=root.querySelector<HTMLElement>('#gb-setup');
    if(setupBox){const st=setupSteps(cls,errors);setupBox.innerHTML=st.list;const t=setupBox.previousElementSibling as HTMLElement|null;if(t)t.textContent=st.title}
    const heads=root.querySelectorAll('thead th');
    cls.assessments.forEach((a,i)=>{const th=heads[i+1];if(th)th.textContent=a.name.trim()||'(unnamed)'});
    const exp=root.querySelector<HTMLButtonElement>('#gb-export');
    if(exp){exp.disabled=errors>0;exp.title=errors?'Fix the errors first':''}
  };

  draw();
}
