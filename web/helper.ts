// Kiaat screen: CAPS-aligned lesson plans, class tests with memos, and assignments with rubrics,
// plus a conversation for CAPS questions, alignment checks and changes to the current draft.
// Only grade, subject, topic, mark totals and the conversation text are sent. Drafts are for the teacher to review.

type ApiFn = (path: string, body?: any, method?: string) => Promise<any>;
type Turn = { role: 'user' | 'assistant'; text: string };

const KIND_LABEL: Record<string, string> = { lesson: 'Lesson plan', test: 'Class test with memo', assignment: 'Assignment with rubric' };

function esc(s: string) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }

function draftText(out: any): string {
  const d = out.draft;
  const lines: string[] = [d.title || KIND_LABEL[out.kind], ''];
  if (out.kind === 'lesson') {
    lines.push('Objectives:', ...(d.objectives || []).map((x: string) => '- ' + x), '', 'Steps:');
    for (const s of d.steps || []) lines.push(`- ${s.minutes} min: ${s.activity}`);
    lines.push('', 'Resources: ' + (d.resources || []).join(', '), 'Assessment: ' + (d.assessment || ''), 'Homework: ' + (d.homework || ''));
  } else if (out.kind === 'test') {
    lines.push(d.instructions || '', '');
    for (const q of d.questions || []) lines.push(`${q.number}. (${q.marks}) ${q.text}`, `   Memo: ${q.memo}`);
  } else {
    lines.push('Brief: ' + (d.brief || ''), '', 'Rubric:');
    for (const r of d.rubric || []) lines.push(`- ${r.criterion} (${r.marks}): ${r.descriptor}`);
  }
  return lines.join('\n');
}

function renderDraft(out: any): string {
  const d = out.draft;
  const c = out.check;
  const checkLine = out.kind === 'lesson'
    ? `Steps add up to ${c.minutes} minutes, as planned.`
    : `Marks add up to ${c.marks}, as planned.`;
  let body = '';
  if (out.kind === 'lesson') {
    body = `<h3>Objectives</h3><ul>${(d.objectives || []).map((x: string) => `<li>${esc(x)}</li>`).join('')}</ul>
      <h3>Steps</h3><table class="sh-table"><thead><tr><th>Minutes</th><th>Activity</th></tr></thead><tbody>${(d.steps || []).map((s: any) => `<tr><td>${esc(String(s.minutes))}</td><td>${esc(s.activity)}</td></tr>`).join('')}</tbody></table>
      <p><strong>Resources:</strong> ${esc((d.resources || []).join(', '))}</p>
      <p><strong>Assessment:</strong> ${esc(d.assessment || '')}</p>
      <p><strong>Homework:</strong> ${esc(d.homework || '')}</p>`;
  } else if (out.kind === 'test') {
    body = `<p>${esc(d.instructions || '')}</p><table class="sh-table"><thead><tr><th>No.</th><th>Question</th><th>Marks</th><th>Memo</th></tr></thead><tbody>${(d.questions || []).map((q: any) => `<tr><td>${esc(String(q.number))}</td><td>${esc(q.text)}</td><td>${esc(String(q.marks))}</td><td>${esc(q.memo)}</td></tr>`).join('')}</tbody></table>`;
  } else {
    body = `<p><strong>Brief:</strong> ${esc(d.brief || '')}</p><table class="sh-table"><thead><tr><th>Criterion</th><th>Marks</th><th>Descriptor</th></tr></thead><tbody>${(d.rubric || []).map((r: any) => `<tr><td>${esc(r.criterion)}</td><td>${esc(String(r.marks))}</td><td>${esc(r.descriptor)}</td></tr>`).join('')}</tbody></table>`;
  }
  return `<div class="panel" style="padding:16px;margin-top:14px" id="sh-result">
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">
      <div><h2 style="font-size:18px;margin:0">${esc(d.title || KIND_LABEL[out.kind])}</h2>
      <p style="font-size:13px;color:var(--muted);margin:4px 0 0">Grade ${esc(out.grade)} · ${esc(out.subject)} · ${esc(out.topic)}</p></div>
      <div style="display:flex;gap:8px"><button class="btn small" id="sh-copy">Copy text</button><button class="btn small" id="sh-print">Print</button></div>
    </div>
    <p role="status" style="font-size:13px;color:var(--accent-hover);background:var(--accent-soft);border-radius:8px;padding:6px 10px;margin:12px 0">✓ ${esc(checkLine)} Review before use.</p>
    ${body}
  </div>`;
}

function chatHtml(turns: Turn[]): string {
  const log = turns.length
    ? turns.map(t => `<article class="msg ${t.role === 'user' ? 'user' : ''}"><span class="msg-sender">${t.role === 'user' ? 'You' : 'Helper'}</span><div class="bubble">${esc(t.text)}</div></article>`).join('')
    : '<p style="font-size:13px;color:var(--muted)">Ask about CAPS content, check that a topic matches the outcomes, or ask for a change to the draft above.</p>';
  return `<div class="panel" style="padding:16px;margin-top:14px" aria-label="Talk to Kiaat">
    <h2 style="font-size:17px;margin:0 0 10px">Talk to Kiaat</h2>
    <div id="sh-chat-log" class="messages" tabindex="0" aria-live="polite" style="max-height:340px;overflow:auto">${log}</div>
    <form id="sh-chat-form" class="chat-compose" style="margin-top:10px">
      <textarea id="sh-chat-text" rows="2" maxlength="1000" aria-label="Message Kiaat" placeholder="e.g. Does this match the CAPS outcome for fractions? Or: make question 2 harder"></textarea>
      <button class="btn primary small" id="sh-chat-send" type="submit">Send</button>
    </form>
    <p style="font-size:12px;color:var(--muted);margin:8px 0 0">Do not type learner names or numbers here. Only what you write in this box is sent.</p>
  </div>`;
}

export function renderHelper(root: HTMLElement, api: ApiFn, toast: (msg: string, err?: boolean) => void) {
  let info: any = null;
  let last: any = null;
  let turns: Turn[] = [];
  let chatBusy = false;
  let chosenGrade = '8';
  const subjectsFor = (grade: string): string[] => (info?.subjects?.[grade] as string[]) || [];

  const draw = () => {
    const grades: string[] = info?.grades || ['R', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const used = info?.used || {};
    const limits = info?.limits || { lesson: 20, assessment: 10, chat: 60 };
    const left = (k: string) => Math.max(0, (limits[k] ?? 0) - (used[k] ?? 0));
    const notReady = info && !info.configured
      ? '<p role="status" style="font-size:13px;background:var(--gold-soft);border-radius:8px;padding:8px 10px;margin:10px 0">Kiaat is not switched on yet. You can see the form, but drafts and answers cannot be created until the service is connected.</p>' : '';
    root.innerHTML = `<div class="page-heading"><div><h1>Kiaat</h1>
      <p style="font-size:13px;color:var(--muted);margin-top:4px">Drafts for lesson plans, class tests with memos, and assignments with rubrics. Aligned to CAPS, in English. Check every draft against your CAPS documents before you use it.</p></div></div>
      <div class="panel" style="padding:16px">
        <p style="font-size:13px;margin:0 0 10px">Left this month: <strong>${left('lesson')}</strong> of ${limits.lesson} lesson plans, <strong>${left('assessment')}</strong> of ${limits.assessment} tests or assignments, and <strong>${left('chat')}</strong> of ${limits.chat} conversation messages.</p>
        <p style="font-size:12px;color:var(--muted);margin:0 0 12px">Only the grade, subject, topic, mark totals and what you type in the conversation are sent. Learner names, IDs and marks never leave your browser. Do not type a learner's name anywhere in Kiaat.</p>
        ${notReady}
        <div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));align-items:end">
          <label>Type<select id="sh-kind">${Object.keys(KIND_LABEL).map(k => `<option value="${k}">${KIND_LABEL[k]}</option>`).join('')}</select></label>
          <label>Grade<select id="sh-grade">${grades.map(g => `<option value="${g}">Grade ${g}</option>`).join('')}</select></label>
          <label>CAPS subject<select id="sh-subject"></select></label>
          <label>Length (minutes)<input id="sh-num" type="number" min="20" max="120" value="45"></label>
          <label style="grid-column:1/-1">Topic<input id="sh-topic" maxlength="120" placeholder="e.g. Fractions: adding unlike denominators"></label>
        </div>
        <div style="margin-top:12px"><button class="btn" id="sh-make">Create draft</button> <span id="sh-busy" style="font-size:13px;color:var(--muted)"></span></div>
      </div>
      <div id="sh-out"></div>
      <div id="sh-chat"></div>`;

    const kind = root.querySelector<HTMLSelectElement>('#sh-kind')!;
    const grade = root.querySelector<HTMLSelectElement>('#sh-grade')!;
    const subject = root.querySelector<HTMLSelectElement>('#sh-subject')!;
    const num = root.querySelector<HTMLInputElement>('#sh-num')!;
    const fillSubjects = () => {
      const list = subjectsFor(grade.value);
      subject.innerHTML = list.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
    };
    const fillNum = () => {
      const lesson = kind.value === 'lesson';
      num.min = lesson ? '20' : '10'; num.max = lesson ? '120' : '100';
      num.value = lesson ? '45' : '50';
      const label = num.parentElement;
      if (label && label.firstChild) label.firstChild.textContent = lesson ? 'Length (minutes) ' : 'Total marks ';
    };
    grade.value = chosenGrade;
    grade.onchange = () => { chosenGrade = grade.value; fillSubjects(); };
    kind.onchange = fillNum;
    fillSubjects();
    fillNum();
    if (last) root.querySelector('#sh-out')!.innerHTML = renderDraft(last);
    root.querySelector('#sh-chat')!.innerHTML = last ? chatHtml(turns) : '';
    wire();
  };

  // The form values the draft and conversation were made with.
  const currentSettings = () => {
    const kind = (root.querySelector<HTMLSelectElement>('#sh-kind')!).value;
    const grade = (root.querySelector<HTMLSelectElement>('#sh-grade')!).value;
    const subject = (root.querySelector<HTMLSelectElement>('#sh-subject')!).value;
    const n = Number((root.querySelector<HTMLInputElement>('#sh-num')!).value);
    return { kind, grade, subject, n };
  };

  const wire = () => {
    const make = root.querySelector<HTMLButtonElement>('#sh-make')!;
    make.onclick = async () => {
      const { kind, grade, subject, n } = currentSettings();
      const topic = (root.querySelector<HTMLInputElement>('#sh-topic')!).value.trim();
      if (topic.length < 3) { toast('Describe the topic in a few words.', true); return; }
      const payload: any = { kind, grade, subject, topic };
      if (kind === 'lesson') payload.minutes = n; else payload.total_marks = n;
      const busy = root.querySelector<HTMLElement>('#sh-busy')!;
      make.disabled = true; busy.textContent = 'Writing the draft. This can take a minute…';
      try {
        last = await api('/api/helper/generate', payload);
        turns = [];
        toast('Draft ready. Review it before use.');
        info = await api('/api/helper/usage', undefined, 'GET');
        draw();
      } catch (err: any) {
        const msg = err?.message || 'Kiaat could not write this draft.';
        toast(msg, true);
        busy.textContent = msg;
      } finally {
        make.disabled = false;
      }
    };
    wireOutput();
    wireChat();
  };

  const wireOutput = () => {
    const copy = root.querySelector<HTMLButtonElement>('#sh-copy');
    if (copy && last) copy.onclick = async () => {
      try { await navigator.clipboard.writeText(draftText(last)); toast('Draft copied.'); }
      catch { toast('Copy did not work in this browser. Select the text and copy it.', true); }
    };
    const print = root.querySelector<HTMLButtonElement>('#sh-print');
    if (print) print.onclick = () => window.print();
  };

  const wireChat = () => {
    const form = root.querySelector<HTMLFormElement>('#sh-chat-form');
    if (!form) return;
    const log = root.querySelector<HTMLElement>('#sh-chat-log');
    if (log) log.scrollTop = log.scrollHeight;
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (chatBusy || !last) return;
      const input = root.querySelector<HTMLTextAreaElement>('#sh-chat-text')!;
      const text = input.value.trim();
      if (!text) return;
      const { kind, grade, subject, n } = currentSettings();
      const next: Turn[] = [...turns, { role: 'user', text }];
      // The server needs the conversation to start and end with the teacher.
      const history = next.slice(-12);
      while (history.length && history[0].role !== 'user') history.shift();
      const payload: any = { kind, grade, subject, messages: history, current_draft: last.draft };
      if (kind === 'lesson') payload.minutes = n; else payload.total_marks = n;
      chatBusy = true;
      turns = next;
      root.querySelector('#sh-chat')!.innerHTML = chatHtml(turns);
      wireChat();
      const send = root.querySelector<HTMLButtonElement>('#sh-chat-send');
      if (send) send.disabled = true;
      try {
        const out = await api('/api/helper/chat', payload);
        turns = [...turns, { role: 'assistant', text: out.reply }];
        if (out.draft) {
          last = { ...last, kind, grade, subject, draft: out.draft, check: out.check };
          toast('Draft updated and checked.');
        }
        info = await api('/api/helper/usage', undefined, 'GET');
        draw();
      } catch (err: any) {
        turns = turns.slice(0, -1);
        const msg = err?.message || 'Kiaat could not answer this message.';
        toast(msg, true);
        root.querySelector('#sh-chat')!.innerHTML = chatHtml(turns);
        const again = root.querySelector<HTMLTextAreaElement>('#sh-chat-text');
        if (again) again.value = text;
        wireChat();
      } finally {
        chatBusy = false;
      }
    };
  };

  (async () => {
    try { info = await api('/api/helper/usage', undefined, 'GET'); }
    catch { info = { configured: false, used: {}, limits: { lesson: 20, assessment: 10, chat: 60 } }; }
    draw();
  })();
  draw();
}
