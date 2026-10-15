// Teacher planner: timetable, term dates, weekly calendar and reminders.
// Saved in this browser only (localStorage). Reminders never include learner names.
import { loadRegisters, Register } from './register';
import { loadProfile, windowStatus, summarise } from './cptd';
import { loadPacing, behindReminders } from './pacing';

export type Weekday = 'Mon'|'Tue'|'Wed'|'Thu'|'Fri';
export const WEEKDAYS:Weekday[]=['Mon','Tue','Wed','Thu','Fri'];
export type Period = {id:string; day:Weekday; start:string; end:string; label:string; room:string};
export type TermDates = {term:1|2|3|4; start:string; end:string};
export type CalendarEvent = {id:string; date:string; text:string};
export type PlannerData = {
  year:number;
  terms:TermDates[];
  periods:Period[];
  events:CalendarEvent[];
  timetablePhoto?:{name:string; dataUrl:string};
};
export type Reminder = {key:string; date:string; text:string; kind:'cptd'|'register'|'term'|'event'|'pacing'};

const STORE_KEY='elite-sheets-planner-v1';
const MAX_PHOTO_BYTES=1_500_000;
export const ABSENCE_ALERT_RUN=3;
export const REMINDER_LOOKAHEAD_DAYS=14;

export function loadPlanner():PlannerData{
  try{const raw=localStorage.getItem(STORE_KEY);if(raw)return JSON.parse(raw)}catch{}
  return {year:new Date().getFullYear(),terms:[],periods:[],events:[]};
}
export function savePlanner(p:PlannerData){localStorage.setItem(STORE_KEY,JSON.stringify(p))}

const isDate=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
const isTime=(s:string)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export function addDays(date:string,n:number){const d=new Date(date+'T00:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
export function weekdayOf(date:string):Weekday|null{
  const i=new Date(date+'T00:00:00').getDay(); // 0 Sun .. 6 Sat
  return i>=1&&i<=5?WEEKDAYS[i-1]:null;
}
export function mondayOf(date:string){
  const i=new Date(date+'T00:00:00').getDay();
  return addDays(date,i===0?-6:1-i);
}

// Checks one period. Returns problems for the teacher to fix.
export function validatePeriod(p:Partial<Period>,existing:Period[]):string[]{
  const problems:string[]=[];
  if(!p.day||!WEEKDAYS.includes(p.day as Weekday))problems.push('Choose a day.');
  if(!p.start||!isTime(p.start)||!p.end||!isTime(p.end))problems.push('Enter start and end times as HH:MM.');
  else if(p.end<=p.start)problems.push('The end time must be after the start time.');
  if(!p.label||!p.label.trim())problems.push('Name the lesson or subject.');
  if(p.day&&p.start&&p.end&&isTime(p.start)&&isTime(p.end)&&p.end>p.start){
    const newStart=p.start as string, newEnd=p.end as string;
    const clash=existing.find(e=>e.day===p.day&&e.id!==p.id&&newStart<e.end&&e.start<newEnd);
    if(clash)problems.push(`This clashes with ${clash.label} (${clash.start} to ${clash.end}).`);
  }
  return problems;
}

export function validateTerms(terms:TermDates[]):string[]{
  const problems:string[]=[];
  for(const t of terms){
    if(!isDate(t.start)||!isDate(t.end))problems.push(`Term ${t.term}: enter both dates.`);
    else if(t.end<t.start)problems.push(`Term ${t.term}: the end date is before the start date.`);
  }
  return problems;
}

// Periods for each weekday of the week containing `date`, sorted by start time.
export function weekView(data:PlannerData,date:string){
  const monday=mondayOf(date);
  return WEEKDAYS.map((day,i)=>{
    const dayDate=addDays(monday,i);
    const periods=data.periods.filter(p=>p.day===day).sort((a,b)=>a.start.localeCompare(b.start));
    const events=data.events.filter(e=>e.date===dayDate);
    const termNote=data.terms.filter(t=>dayDate===t.start||dayDate===t.end).map(t=>dayDate===t.start?`Term ${t.term} starts`:`Term ${t.term} ends`);
    return {day,date:dayDate,periods,events,termNote};
  });
}

// Absences in a row at the end of the register, counting recorded school days only.
export function trailingAbsenceRun(reg:Register,learnerId:string):number{
  const days=Object.keys(reg.days).filter(d=>Object.keys(reg.days[d]).length>0).sort();
  let run=0;
  for(let i=days.length-1;i>=0;i--){
    if(reg.days[days[i]][learnerId]==='A')run++;else break;
  }
  return run;
}

// Reminders from every source, for the next REMINDER_LOOKAHEAD_DAYS days from `today`.
export function reminders(today:string,data:PlannerData,registers:Register[],cptdProfile=loadProfile()):Reminder[]{
  const out:Reminder[]=[];
  const horizon=addDays(today,REMINDER_LOOKAHEAD_DAYS);
  const inWindow=(d:string)=>d>=today&&d<=horizon;

  // CPTD reporting windows
  const cs=summarise(cptdProfile);
  const win=windowStatus(today);
  if(win){
    if(win.state==='open'){
      out.push({key:`cptd-open-${win.window.start}`,date:today,kind:'cptd',text:`${win.window.label} is open until ${win.window.end}.${cs?.unreported?` ${cs.unreported} activity(ies) not yet reported to SACE.`:''}`});
    }else if(win.daysAway<=REMINDER_LOOKAHEAD_DAYS){
      out.push({key:`cptd-soon-${win.window.start}`,date:win.window.start,kind:'cptd',text:`${win.window.label} opens in ${win.daysAway} day(s).`});
    }
  }

  // Register absence alerts (names stay in the register; the reminder only gives the number)
  for(const reg of registers){
    for(const l of reg.learners){
      const run=trailingAbsenceRun(reg,l.id);
      if(run>=ABSENCE_ALERT_RUN){
        out.push({key:`reg-${reg.id}-${l.id}-${run}`,date:today,kind:'register',text:`${reg.name}: learner ${l.id} has been absent ${run} school days in a row. Tell the principal.`});
      }
    }
  }

  // Term starts and ends
  for(const t of data.terms){
    if(inWindow(t.start))out.push({key:`term-start-${t.term}-${t.start}`,date:t.start,kind:'term',text:`Term ${t.term} starts.`});
    if(inWindow(t.end))out.push({key:`term-end-${t.term}-${t.end}`,date:t.end,kind:'term',text:`Term ${t.term} ends.`});
  }

  // Custom events
  for(const e of data.events){
    if(inWindow(e.date))out.push({key:`event-${e.id}`,date:e.date,kind:'event',text:e.text});
  }
  // Pacing: classes with lessons behind plan
  for(const b of behindReminders(loadPacing(),today))out.push({key:b.key,date:today,kind:'pacing',text:b.text});
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}

// Keeps a record of which notifications were shown, so the same reminder is not repeated.
const SHOWN_KEY='elite-sheets-reminders-shown-v1';
export function unshownReminders(list:Reminder[]):Reminder[]{
  let shown:string[]=[];
  try{shown=JSON.parse(localStorage.getItem(SHOWN_KEY)||'[]')}catch{}
  return list.filter(r=>!shown.includes(r.key));
}
export function markShown(list:Reminder[]){
  let shown:string[]=[];
  try{shown=JSON.parse(localStorage.getItem(SHOWN_KEY)||'[]')}catch{}
  const next=Array.from(new Set([...shown,...list.map(r=>r.key)])).slice(-500);
  localStorage.setItem(SHOWN_KEY,JSON.stringify(next));
}

export async function readPhoto(file:File){
  if(file.size>MAX_PHOTO_BYTES)throw new Error('That file is too large to keep in this browser (limit 1.5 MB).');
  return new Promise<{name:string;dataUrl:string}>((resolve,reject)=>{
    const r=new FileReader(); r.onload=()=>resolve({name:file.name,dataUrl:String(r.result)}); r.onerror=()=>reject(r.error); r.readAsDataURL(file);
  });
}

export {loadRegisters};
