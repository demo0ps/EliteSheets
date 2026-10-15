// Pacing tracker: a scheme of work per class, planned dates on school days, moving dates when a day is lost,
// and lessons that are behind. Saved in this browser only (localStorage).
import type { TermDates } from './planner';

export type Lesson = {id:string; title:string; plannedDate:string; taughtDate:string};
export type PacingClass = {id:string; name:string; lessons:Lesson[]};
export type PacingStatus = {total:number; taught:number; remaining:number; behind:number; nextDate:string|null};

const STORE_KEY='elite-sheets-pacing-v1';

export function loadPacing():PacingClass[]{
  try{const raw=localStorage.getItem(STORE_KEY);return raw?JSON.parse(raw):[]}catch{return []}
}
export function savePacing(list:PacingClass[]){localStorage.setItem(STORE_KEY,JSON.stringify(list))}

export function addDays(date:string,n:number){const d=new Date(date+'T00:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
const isWeekday=(date:string)=>{const i=new Date(date+'T00:00:00').getDay();return i>=1&&i<=5};
const inTerms=(date:string,terms:TermDates[])=>terms.length===0||terms.some(t=>t.start&&t.end&&date>=t.start&&date<=t.end);

// A school day: Monday to Friday, inside a term when term dates are entered.
export function isSchoolDay(date:string,terms:TermDates[]){return isWeekday(date)&&inTerms(date,terms)}

// The next school day on or after `date`.
export function nextSchoolDay(date:string,terms:TermDates[]){
  let d=date; for(let i=0;i<400;i++){if(isSchoolDay(d,terms))return d; d=addDays(d,1)}
  return date;
}

// Moves a date forward by `n` school days (n may be 0).
export function shiftSchoolDays(date:string,n:number,terms:TermDates[]){
  let d=nextSchoolDay(date,terms);
  for(let i=0;i<n;i++){d=nextSchoolDay(addDays(d,1),terms)}
  return d;
}

// Places lessons from `start`: the first lesson is on the start date (or the next school day), then
// `perWeek` lessons a week, spaced evenly across school days. Breaks and weekends are skipped.
export function generatePlan(titles:string[],start:string,perWeek:number,terms:TermDates[]):Lesson[]{
  const k=Math.min(5,Math.max(1,Math.round(perWeek)));
  const first=nextSchoolDay(start,terms);
  return titles.map((t,i)=>({
    id:Math.random().toString(36).slice(2,10),
    title:t.trim(),
    plannedDate:shiftSchoolDays(first,Math.round(i*5/k),terms),
    taughtDate:'',
  }));
}

// Moves untaught lessons on or after `fromDate` forward by `days` school days, keeping their order.
export function shiftPlan(lessons:Lesson[],fromDate:string,days:number,terms:TermDates[]):Lesson[]{
  return lessons.map(l=>{
    if(l.taughtDate||l.plannedDate<fromDate)return l;
    return {...l,plannedDate:shiftSchoolDays(l.plannedDate,days,terms)};
  });
}

export function statusOf(lessons:Lesson[],today:string):PacingStatus{
  const taught=lessons.filter(l=>l.taughtDate).length;
  const open=lessons.filter(l=>!l.taughtDate).sort((a,b)=>a.plannedDate.localeCompare(b.plannedDate));
  const behind=open.filter(l=>l.plannedDate<today).length;
  return {total:lessons.length,taught,remaining:open.length,behind,nextDate:open[0]?.plannedDate??null};
}

export function validateLessons(lessons:Lesson[]):string[]{
  const problems:string[]=[];
  for(const l of lessons){
    if(!l.title.trim())problems.push('A lesson has no title.');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(l.plannedDate))problems.push(`Lesson "${l.title}" needs a planned date.`);
  }
  return problems;
}

// Used by the planner's reminders: classes with lessons behind today.
export function behindReminders(list:PacingClass[],today:string){
  return list.map(c=>({c,s:statusOf(c.lessons,today)})).filter(x=>x.s.behind>0)
    .map(x=>({key:`pace-${x.c.id}-${today}`,text:`${x.c.name}: ${x.s.behind} lesson(s) are behind plan.`}));
}

function newId(){return Math.random().toString(36).slice(2,10)}
function esc(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
function todayLocal(){const d=new Date();const p=(n:number)=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}

export function renderPacing(root:HTMLElement,toast:(msg:string,err?:boolean)=>void,terms:TermDates[]){
  let classes=loadPacing();
  let activeId=classes[0]?.id??'';
  const persist=()=>savePacing(classes);
  const current=()=>classes.find(c=>c.id===activeId);
  const today=todayLocal();

  const draw=()=>{
    const cls=current();
    if(!cls){
      root.innerHTML=`<div class="page-heading"><div><h1>Pacing</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Create a class to plan its scheme of work. Saved in this browser only.</p></div></div>
        <div class="panel" style="padding:20px;display:grid;gap:10px;max-width:520px">
          <label>Class and subject <input id="pc-new-name" placeholder="e.g. 8A Maths"></label>
          <div><button class="btn primary" id="pc-new">Create class</button></div></div>`;
      root.querySelector<HTMLButtonElement>('#pc-new')!.onclick=()=>{
        const name=root.querySelector<HTMLInputElement>('#pc-new-name')!.value.trim();
        if(!name){toast('Name the class and subject.',true);return}
        const c:PacingClass={id:newId(),name,lessons:[]};classes.push(c);activeId=c.id;persist();draw();
      };
      return;
    }
    const s=statusOf(cls.lessons,today);
    const options=classes.map(c=>`<option value="${c.id}" ${c.id===activeId?'selected':''}>${esc(c.name)}</option>`).join('');
    const rows=cls.lessons.map((l,i)=>{
      const late=!l.taughtDate&&l.plannedDate<today;
      return `<tr style="${late?'background:var(--bad-soft)':''}"><td>${i+1}</td><td><input value="${esc(l.title)}" data-lt="${i}" aria-label="Lesson ${i+1} title" style="min-width:200px"></td>
        <td><input type="date" value="${l.plannedDate}" data-lp="${i}" aria-label="Planned date for lesson ${i+1}"></td>
        <td><label style="white-space:nowrap"><input type="checkbox" data-tc="${i}" ${l.taughtDate?'checked':''}> Taught</label>
        ${l.taughtDate?`<input type="date" value="${l.taughtDate}" data-td="${i}" aria-label="Date taught">`:''}</td>
        <td>${late?'<span style="color:var(--bad)">Behind</span>':''}</td>
        <td><button class="btn small" data-dl="${i}" aria-label="Remove lesson ${i+1}">Remove</button></td></tr>`;
    }).join('');
    root.innerHTML=`<div class="page-heading"><div><h1>Pacing</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Plan the scheme of work on school days, tick lessons as taught, and move the plan when a day is lost.</p></div></div>
      <div class="panel" style="padding:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <select id="pc-select" aria-label="Choose class">${options}</select>
        <button class="btn" id="pc-new-open">New class</button>
        <button class="btn" id="pc-delete">Delete class</button>
      </div>
      <div class="panel" style="padding:16px;margin-top:14px;display:flex;gap:18px;flex-wrap:wrap;font-size:14px">
        <span><strong>${s.taught}</strong> of ${s.total} taught</span>
        <span style="color:${s.behind?'var(--bad)':'var(--good)'}"><strong>${s.behind}</strong> behind plan</span>
        <span>Next lesson: ${s.nextDate??'none left'}</span>
        ${terms.length?'':'<span style="color:var(--warn)">Enter term dates in the Planner so breaks are skipped.</span>'}
      </div>
      <div class="panel" style="padding:16px;margin-top:14px">
        <h2 style="font-size:17px;margin:0 0 10px">Build the plan</h2>
        <p style="font-size:13px;color:var(--muted);margin:0 0 8px">One lesson per line. Lessons are placed on school days from the start date.</p>
        <textarea id="pc-titles" rows="4" style="width:100%" placeholder="Number patterns&#10;Fractions&#10;Ratio and rate"></textarea>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:8px">
          <label>Start <input type="date" id="pc-start" value="${today}"></label>
          <label>Lessons per week <input type="number" id="pc-perweek" min="1" max="5" value="4" style="width:80px"></label>
          <button class="btn primary" id="pc-build">Add lessons to plan</button>
        </div>
      </div>
      <div class="panel" style="padding:16px;margin-top:14px">
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">
          <h2 style="font-size:17px;margin:0">Lessons</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <label>Lost a day on <input type="date" id="pc-lost-date" value="${today}"></label>
            <label>School days <input type="number" id="pc-lost-n" min="1" max="20" value="1" style="width:70px"></label>
            <button class="btn" id="pc-shift">Move the plan</button>
          </div>
        </div>
        <div style="overflow-x:auto;margin-top:10px"><table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr><th style="text-align:left">#</th><th style="text-align:left">Lesson</th><th style="text-align:left">Planned</th><th style="text-align:left">Taught</th><th></th><th></th></tr></thead>
          <tbody>${rows||'<tr><td colspan="6" style="color:var(--muted)">No lessons yet. Build the plan above.</td></tr>'}</tbody>
        </table></div>
        <p style="font-size:12px;color:var(--muted);margin-top:8px">Moving the plan only changes lessons not yet taught, and keeps their order.</p>
      </div>`;
    wire(cls);
  };

  const wire=(cls:PacingClass)=>{
    root.querySelector<HTMLSelectElement>('#pc-select')!.onchange=e=>{activeId=(e.target as HTMLSelectElement).value;draw()};
    root.querySelector<HTMLButtonElement>('#pc-new-open')!.onclick=()=>{activeId='';draw()};
    root.querySelector<HTMLButtonElement>('#pc-delete')!.onclick=()=>{
      if(!confirm(`Delete the plan for "${cls.name}"?`))return;
      classes=classes.filter(c=>c.id!==cls.id);activeId=classes[0]?.id??'';persist();draw();
    };
    root.querySelector<HTMLButtonElement>('#pc-build')!.onclick=()=>{
      const titles=root.querySelector<HTMLTextAreaElement>('#pc-titles')!.value.split('\n').map(t=>t.trim()).filter(Boolean);
      if(!titles.length){toast('Type at least one lesson.',true);return}
      const start=root.querySelector<HTMLInputElement>('#pc-start')!.value;
      const perWeek=Number(root.querySelector<HTMLInputElement>('#pc-perweek')!.value)||4;
      if(!start){toast('Choose a start date.',true);return}
      const planned=generatePlan(titles,start,perWeek,terms);
      cls.lessons=[...cls.lessons,...planned];persist();toast(`${planned.length} lesson(s) added.`);draw();
    };
    root.querySelectorAll<HTMLInputElement>('[data-lt]').forEach(i=>i.onchange=()=>{cls.lessons[Number(i.dataset.lt)].title=i.value.trim();persist();draw()});
    root.querySelectorAll<HTMLInputElement>('[data-lp]').forEach(i=>i.onchange=()=>{cls.lessons[Number(i.dataset.lp)].plannedDate=i.value;persist();draw()});
    root.querySelectorAll<HTMLInputElement>('[data-tc]').forEach(i=>i.onchange=()=>{
      const l=cls.lessons[Number(i.dataset.tc)];l.taughtDate=i.checked?today:'';persist();draw();
    });
    root.querySelectorAll<HTMLInputElement>('[data-td]').forEach(i=>i.onchange=()=>{cls.lessons[Number(i.dataset.td)].taughtDate=i.value;persist();draw()});
    root.querySelectorAll<HTMLButtonElement>('[data-dl]').forEach(b=>b.onclick=()=>{
      cls.lessons.splice(Number(b.dataset.dl),1);persist();draw();
    });
    root.querySelector<HTMLButtonElement>('#pc-shift')!.onclick=()=>{
      const from=root.querySelector<HTMLInputElement>('#pc-lost-date')!.value;
      const n=Number(root.querySelector<HTMLInputElement>('#pc-lost-n')!.value);
      if(!from||!n||n<1){toast('Choose the date and the number of school days lost.',true);return}
      cls.lessons=shiftPlan(cls.lessons,from,n,terms);persist();toast(`Plan moved by ${n} school day(s).`);draw();
    };
  };

  draw();
}
