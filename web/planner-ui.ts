// Planner screen: term dates, timetable, weekly calendar, events and reminders.
import { loadPlanner, savePlanner, PlannerData, Period, Weekday, WEEKDAYS, TermDates, weekView, reminders, unshownReminders, markShown, validatePeriod, validateTerms, readPhoto, loadRegisters, Reminder } from './planner';

function newId(){return Math.random().toString(36).slice(2,10)}
function esc(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
function todayLocal(){const d=new Date();const p=(n:number)=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}

// Shows reminders as browser notifications, once each, if the teacher has allowed them.
export function notifyDueReminders(){
  if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
  const list=unshownReminders(reminders(todayLocal(),loadPlanner(),loadRegisters()));
  const now=list.filter(r=>r.date<=todayLocal()).slice(0,3);
  for(const r of now){new Notification('Kiaat reminder',{body:r.text})}
  if(now.length)markShown(now);
}

export function renderPlanner(root:HTMLElement,toast:(msg:string,err?:boolean)=>void){
  let data:PlannerData=loadPlanner();
  let viewDate=todayLocal();
  const persist=()=>savePlanner(data);
  const termsDraft=():TermDates[]=>{
    const rows=[1,2,3,4].map(t=>{
      const s=data.terms.find(x=>x.term===t);
      return {term:t as 1|2|3|4,start:s?.start??'',end:s?.end??''};
    });
    return rows;
  };

  const draw=()=>{
    const week=weekView(data,viewDate);
    const rem:Reminder[]=reminders(todayLocal(),data,loadRegisters());
    const notifyState=typeof Notification==='undefined'?'This browser does not support notifications.':Notification.permission==='granted'?'Notifications are on.':Notification.permission==='denied'?'Notifications are blocked in this browser settings.':'Notifications are off.';
    const termRows=termsDraft().map(t=>`<tr><td>Term ${t.term}</td><td><input type="date" data-term="${t.term}" data-f="start" value="${t.start}" aria-label="Term ${t.term} start"></td><td><input type="date" data-term="${t.term}" data-f="end" value="${t.end}" aria-label="Term ${t.term} end"></td></tr>`).join('');
    const periodRows=WEEKDAYS.map(d=>{
      const ps=data.periods.filter(p=>p.day===d).sort((a,b)=>a.start.localeCompare(b.start));
      return ps.length?ps.map(p=>`<tr><td>${d}</td><td>${p.start}–${p.end}</td><td>${esc(p.label)}</td><td>${esc(p.room)}</td><td><button class="btn small" data-del-p="${p.id}" aria-label="Remove ${esc(p.label)}">Remove</button></td></tr>`).join(''):'';
    }).join('');
    const grid=week.map(d=>`<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px;min-width:0">
        <div style="font-weight:700;font-size:14px;margin-bottom:6px">${d.day} <span style="color:var(--muted);font-weight:400;font-size:12px">${d.date.slice(8)}</span></div>
        ${d.termNote.map(t=>`<div style="font-size:12px;color:var(--accent-hover);background:var(--accent-soft);border-radius:8px;padding:4px 6px;margin-bottom:6px">${esc(t)}</div>`).join('')}
        ${d.events.map(e=>`<div style="font-size:12px;background:var(--gold-soft);border-radius:8px;padding:4px 6px;margin-bottom:6px">${esc(e.text)}</div>`).join('')}
        ${d.periods.map(p=>`<div style="font-size:13px;border-left:3px solid var(--accent);padding:4px 6px;margin-bottom:6px"><strong>${p.start}</strong> ${esc(p.label)}${p.room?`<br><span style="color:var(--muted);font-size:12px">${esc(p.room)}</span>`:''}</div>`).join('')||'<div style="font-size:12px;color:var(--muted)">No periods</div>'}
      </div>`).join('');
    const reminderList=rem.length?rem.map(r=>`<li style="margin-bottom:6px"><strong>${r.date}</strong> ${esc(r.text)}</li>`).join(''):'<li style="color:var(--muted)">Nothing due in the next two weeks.</li>';
    root.innerHTML=`<div class="page-heading"><div><h1>Planner</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Your timetable, term dates, weekly calendar and reminders. Saved in this browser only.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="pl-open-helper">Open Kiaat</button><button class="btn" id="pl-open-pacing">Open pacing tracker</button></div></div>
      <div class="panel" style="padding:16px">
        <h2 style="font-size:17px;margin:0 0 10px">Reminders</h2>
        <ul style="margin:0 0 10px 18px;padding:0;font-size:14px">${reminderList}</ul>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span style="font-size:13px;color:var(--muted)">${notifyState}</span>
        ${typeof Notification!=='undefined'&&Notification.permission==='default'?'<button class="btn small" id="pl-notify">Turn on notifications</button>':''}</div>
      </div>
      <div class="panel" style="padding:16px;margin-top:14px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center"><h2 style="font-size:17px;margin:0">Weekly calendar</h2>
          <label>Week containing <input type="date" id="pl-view" value="${viewDate}"></label></div>
        <div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-top:12px">${grid}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px">
          <input type="date" id="pl-ev-date" value="${viewDate}" aria-label="Event date">
          <input id="pl-ev-text" placeholder="Event or reminder, e.g. Exam paper due" aria-label="Event text" style="min-width:240px">
          <button class="btn" id="pl-ev-add">Add event</button>
        </div>
        <ul style="margin:10px 0 0 18px;padding:0;font-size:13px">${data.events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<li style="margin-bottom:4px">${e.date}: ${esc(e.text)} <button class="btn small" data-del-e="${e.id}">Remove</button></li>`).join('')||'<li style="color:var(--muted)">No events yet.</li>'}</ul>
      </div>
      <div class="panel" style="padding:16px;margin-top:14px">
        <h2 style="font-size:17px;margin:0 0 10px">Term dates</h2>
        <p style="font-size:13px;color:var(--muted);margin:0 0 8px">Enter the dates your school or province publishes for ${data.year}.</p>
        <label>Year <input type="number" id="pl-year" value="${data.year}" style="width:110px"></label>
        <table style="border-collapse:collapse;margin-top:8px;font-size:14px"><thead><tr><th style="text-align:left">Term</th><th style="text-align:left">Starts</th><th style="text-align:left">Ends</th></tr></thead><tbody>${termRows}</tbody></table>
        <div style="margin-top:10px"><button class="btn primary" id="pl-terms-save">Save term dates</button></div>
      </div>
      <div class="panel" style="padding:16px;margin-top:14px">
        <h2 style="font-size:17px;margin:0 0 10px">Timetable</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <select id="pl-p-day" aria-label="Day">${WEEKDAYS.map(d=>`<option>${d}</option>`).join('')}</select>
          <input type="time" id="pl-p-start" value="08:00" aria-label="Start time">
          <input type="time" id="pl-p-end" value="08:45" aria-label="End time">
          <input id="pl-p-label" placeholder="Class or subject, e.g. 8A Maths" aria-label="Class or subject" style="min-width:200px">
          <input id="pl-p-room" placeholder="Room (optional)" aria-label="Room" style="width:140px">
          <button class="btn primary" id="pl-p-add">Add period</button>
        </div>
        <div style="overflow-x:auto;margin-top:12px"><table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="text-align:left">Day</th><th style="text-align:left">Time</th><th style="text-align:left">Class or subject</th><th style="text-align:left">Room</th><th></th></tr></thead><tbody>${periodRows||'<tr><td colspan="5" style="color:var(--muted)">No periods yet.</td></tr>'}</tbody></table></div>
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)">
          ${data.timetablePhoto?`<p style="font-size:14px">Paper timetable stored: <strong>${esc(data.timetablePhoto.name)}</strong> <a class="btn small" href="${data.timetablePhoto.dataUrl}" download="${esc(data.timetablePhoto.name)}">Open</a> <button class="btn small" id="pl-photo-remove">Remove</button></p>`:''}
          <label style="font-size:14px">Attach a photo or file of your timetable (kept for reference) <input type="file" id="pl-photo" accept="image/*,.pdf"></label>
        </div>
      </div>`;
    wire();
  };

  const wire=()=>{
    root.querySelector<HTMLButtonElement>('#pl-notify')?.addEventListener('click',async()=>{
      if(typeof Notification==='undefined')return;
      const r=await Notification.requestPermission();
      toast(r==='granted'?'Notifications turned on.':'Notifications were not allowed.',r!=='granted');
      draw();
    });
    root.querySelector<HTMLButtonElement>('#pl-open-helper')!.onclick=()=>window.dispatchEvent(new CustomEvent('elite-nav',{detail:'helper'}));
    root.querySelector<HTMLButtonElement>('#pl-open-pacing')!.onclick=()=>window.dispatchEvent(new CustomEvent('elite-nav',{detail:'pacing'}));
    root.querySelector<HTMLInputElement>('#pl-view')!.onchange=e=>{viewDate=(e.target as HTMLInputElement).value||viewDate;draw()};
    root.querySelector<HTMLButtonElement>('#pl-ev-add')!.onclick=()=>{
      const date=root.querySelector<HTMLInputElement>('#pl-ev-date')!.value;
      const text=root.querySelector<HTMLInputElement>('#pl-ev-text')!.value.trim();
      if(!date||!text){toast('Enter a date and a short description.',true);return}
      data.events.push({id:newId(),date,text});persist();toast('Event added.');draw();
    };
    root.querySelectorAll<HTMLButtonElement>('[data-del-e]').forEach(b=>b.onclick=()=>{
      data.events=data.events.filter(e=>e.id!==b.dataset.delE);persist();draw();
    });
    root.querySelector<HTMLButtonElement>('#pl-terms-save')!.onclick=()=>{
      const next:TermDates[]=[];
      root.querySelectorAll<HTMLInputElement>('[data-term]').forEach(i=>{
        const t=Number(i.dataset.term) as 1|2|3|4;
        let row=next.find(x=>x.term===t);
        if(!row){row={term:t,start:'',end:''};next.push(row)}
        (row as any)[i.dataset.f!]=i.value;
      });
      const filled=next.filter(t=>t.start||t.end);
      const problems=validateTerms(filled);
      if(problems.length){toast(problems[0],true);return}
      data.terms=filled;
      data.year=Number(root.querySelector<HTMLInputElement>('#pl-year')!.value)||data.year;
      persist();toast('Term dates saved.');draw();
    };
    root.querySelector<HTMLButtonElement>('#pl-p-add')!.onclick=()=>{
      const p:Partial<Period>={
        id:newId(),
        day:root.querySelector<HTMLSelectElement>('#pl-p-day')!.value as Weekday,
        start:root.querySelector<HTMLInputElement>('#pl-p-start')!.value,
        end:root.querySelector<HTMLInputElement>('#pl-p-end')!.value,
        label:root.querySelector<HTMLInputElement>('#pl-p-label')!.value.trim(),
        room:root.querySelector<HTMLInputElement>('#pl-p-room')!.value.trim(),
      };
      const problems=validatePeriod(p,data.periods);
      if(problems.length){toast(problems[0],true);return}
      data.periods.push(p as Period);persist();toast('Period added.');draw();
    };
    root.querySelectorAll<HTMLButtonElement>('[data-del-p]').forEach(b=>b.onclick=()=>{
      data.periods=data.periods.filter(p=>p.id!==b.dataset.delP);persist();draw();
    });
    root.querySelector<HTMLInputElement>('#pl-photo')!.onchange=async e=>{
      const f=(e.target as HTMLInputElement).files?.[0];if(!f)return;
      try{data.timetablePhoto=await readPhoto(f);persist();toast('Timetable stored.');draw()}
      catch(err){toast((err as Error).message,true)}
    };
    root.querySelector<HTMLButtonElement>('#pl-photo-remove')?.addEventListener('click',()=>{delete data.timetablePhoto;persist();draw()});
  };

  draw();
}
