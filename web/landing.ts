// Public landing page shown before sign-in. Facts only: every claim matches what the app does today.
// The element IDs below are used by the sign-in and sign-up handlers in app.ts; do not rename them.

export const LANDING_CSS = `
.login-minimal,body:has(.login-minimal){--bg:#F3FAF9;--panel:#FFFFFF;--line:#D3E8E5;--line-strong:#A6D0CA;--ink:#13293D;--muted:#4D6475;--accent:#0A7C78;--accent-hover:#076562;--accent-soft:#E0F4F1;--accent-border:#9ED8D1;--gold:#F5B82E;--gold-soft:#FFF4DB}
body:has(.login-minimal){background:#F3FAF9 !important;background-image:none !important}
.login-minimal{max-width:960px;margin:0 auto;padding:12px 16px 40px;color:var(--ink);text-align:left}
.login-minimal .btn.primary{box-shadow:0 6px 16px rgba(10,124,120,.25)}
.lp-hero{display:grid;grid-template-columns:minmax(0,1fr);gap:28px;margin:18px 0 8px}
@media (min-width:860px){.lp-hero{grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);align-items:center}}
.lp-hero h1{color:var(--ink);font-size:clamp(28px,4vw,42px);line-height:1.12;margin:12px 0 14px}
.lp-lede{font-size:17px;line-height:1.55;color:var(--muted);margin:0 0 20px}
.lp-actions{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.lp-actions .btn{padding:14px 20px;font-size:16px}
.lp-link{font-weight:600;color:var(--accent-hover)}
.lp-note{font-size:14px;color:var(--muted);margin:14px 0 0}
.lp-shot{margin:0;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px;box-shadow:0 10px 30px rgba(19,41,61,.08)}
.lp-shot img{width:100%;height:auto;display:block;border-radius:8px;border:1px solid var(--line)}
.lp-shot figcaption{font-size:13px;color:var(--muted);margin:8px 2px 2px}
.lp-section{margin:56px 0 0}
.lp-section h2{font-size:24px;line-height:1.25;margin:0 0 10px;color:var(--ink)}
.lp-section > p{font-size:16px;line-height:1.6;color:var(--ink);margin:0 0 14px;max-width:760px}
.lp-table{width:100%;max-width:620px;border-collapse:collapse;background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden;margin:16px 0 8px;font-size:15px}
.lp-table th,.lp-table td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--line)}
.lp-table th{background:var(--accent-soft);color:var(--accent-hover);font-weight:700}
.lp-table tr:last-child td{border-bottom:0}
.lp-table td.num{font-variant-numeric:tabular-nums}
.lp-table tr.total td{font-weight:700;background:var(--gold-soft)}
.lp-steps{list-style:none;margin:18px 0 0;padding:0;display:grid;gap:14px}
.lp-steps li{display:grid;grid-template-columns:40px minmax(0,1fr);gap:14px;background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:12px;padding:16px 18px}
.lp-steps b{width:34px;height:34px;line-height:34px;text-align:center;border-radius:50%;background:var(--gold);color:var(--ink);font-weight:700}
.lp-steps h3{font-size:17px;margin:2px 0 6px}
.lp-steps p{font-size:15px;line-height:1.55;margin:0;color:var(--ink)}
.lp-steps p + p{margin-top:6px;color:var(--muted)}
.lp-pair{display:grid;gap:16px;margin-top:20px}
@media (min-width:860px){.lp-pair{grid-template-columns:1fr 1fr}}
.lp-grid{display:grid;gap:14px;margin-top:18px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.lp-card{background:var(--panel);border:1px solid var(--line);border-top:4px solid var(--accent);border-radius:12px;padding:18px}
.lp-card h3{font-size:17px;margin:0 0 6px}
.lp-card p{font-size:15px;line-height:1.55;margin:0}
.lp-card .lp-tag{display:inline-block;font-size:12px;font-weight:700;color:var(--accent-hover);background:var(--accent-soft);border-radius:999px;padding:3px 9px;margin-bottom:8px}
.lp-privacy{list-style:none;margin:16px 0 0;padding:0;display:grid;gap:10px}
.lp-privacy li{background:var(--accent-soft);border:1px solid var(--accent-border);border-radius:10px;padding:12px 14px;font-size:15px;line-height:1.5}
.lp-price{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:22px;margin-top:16px;display:grid;gap:14px}
@media (min-width:700px){.lp-price{grid-template-columns:1fr auto;align-items:center}}
.lp-price strong{font-size:26px;color:var(--ink)}
.lp-price ul{margin:8px 0 0;padding-left:18px;font-size:15px;line-height:1.7}
.lp-faq details{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 16px;margin-top:10px}
.lp-faq summary{cursor:pointer;font-weight:600}
.lp-faq p{margin:8px 0 0;font-size:15px;line-height:1.55}
.lp-signin{margin:56px auto 0;max-width:520px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:22px}
.lp-signin h2{font-size:22px;margin:10px 0 4px}
.lp-end{margin:48px 0 10px;padding:26px;background:linear-gradient(135deg,var(--accent) 0%,#0B5E7A 100%);color:#fff;border-radius:14px}
.lp-end h2{color:#fff;font-size:24px;margin:0 0 6px}
.lp-end p{color:#E6F7F5;margin:0 0 14px}
.lp-end .btn.primary{background:#FFFFFF;color:#0A7C78;box-shadow:none}
.lp-end .btn.primary:hover:not(:disabled){background:#E0F4F1}
`;

// Images sit next to styles.css, so resolve from that link: works on the local server (/static/)
// and on GitHub Pages (./web/), where absolute /static paths do not exist.
function assetUrl(name: string): string {
  const link = document.querySelector<HTMLLinkElement>('link[href*="styles.css"]');
  const base = link ? new URL('.', link.href).href : '/static/';
  return base + name;
}

export function landingHtml(logoHtml: string, productCreditHtml: string, demo: boolean): string {
  const demoCta = demo
    ? `<button class="btn primary" data-launch-vert="education">Try the sample class</button>`
    : '';
  const demoCtaEnd = demo
    ? `<button class="btn primary" data-launch-vert="education" style="margin-top:14px">Try the sample class</button>`
    : '';
  return `<main class="login-minimal">
<style>${LANDING_CSS}</style>
<header>${logoHtml}</header>

<section class="lp-hero">
  <div>
    <h1>Turn messy school marks into checked, shareable reports.</h1>
    <p class="lp-lede">Kiaat is a gradebook for South African teachers. Weight your tests and exams, see term marks and CAPS levels, fix problems before you export, and download a clean Excel file.</p>
    <div class="lp-actions">
      ${demoCta}
      <a class="lp-link" href="#get-started">Create a free account</a>
    </div>
    <p class="lp-note">Free for 2 weeks, then R79 a month including VAT.</p>
  </div>
  <figure class="lp-shot">
    <img src="${assetUrl('landing-gradebook.png')}" alt="Kiaat gradebook for a sample Grade 9B Maths class, with three assessments, learner numbers, term marks and CAPS levels" width="1000" height="1490">
    <figcaption>Sample class. Learners are shown by number only.</figcaption>
  </figure>
</section>

<section class="lp-section" id="kiaat">
  <h2>Built like a kiaat</h2>
  <p>The kiaat is a South African tree. It grows steadily, roots deeply and gives shade to the people around it. Kiaat is built the same way: careful with every mark, dependable from one term to the next, and always leaving the teacher in charge of the result.</p>
</section>

<section class="lp-section" id="why">
  <h2>Why term marks go wrong</h2>
  <p>Adding raw points favours the longer assessment. Each mark has to become a percentage first, then the weights apply. Here is one learner, with a test weighted 20% and an exam weighted 80%:</p>
  <table class="lp-table">
    <thead><tr><th>Assessment</th><th>Mark</th><th>Percentage</th><th>Weight</th></tr></thead>
    <tbody>
      <tr><td>Test</td><td class="num">6 / 10</td><td class="num">60%</td><td class="num">20%</td></tr>
      <tr><td>Exam</td><td class="num">80 / 100</td><td class="num">80%</td><td class="num">80%</td></tr>
      <tr class="total"><td colspan="2">Term mark (weighted)</td><td class="num">76%</td><td class="num">100%</td></tr>
    </tbody>
  </table>
  <p class="lp-note" style="margin-top:8px">Adding the raw points instead gives 86 out of 110, which is 78%. That is a different mark, and it is wrong for this weighting.</p>
</section>

<section class="lp-section" id="how-it-works">
  <h2>How it works</h2>
  <p>Four steps, in the order you use them. You can change anything at any time.</p>
  <ol class="lp-steps">
    <li><b>1</b><div>
      <h3>Create a class and add learners</h3>
      <p>Name the class, for example Grade 9B Maths. Add each learner by learner number or initials.</p>
      <p>Learner names are not needed in the gradebook.</p>
    </div></li>
    <li><b>2</b><div>
      <h3>Add assessments with weights</h3>
      <p>For each test, exam or task, enter a name, the maximum mark and the weight as a percentage. The weights must total 100%, and the running total is shown above the list.</p>
    </div></li>
    <li><b>3</b><div>
      <h3>Enter marks as they are on the paper</h3>
      <p>Type the raw marks. Each mark is converted to a percentage, then the term mark and CAPS level (1 to 7) are calculated for every learner.</p>
      <p>Mark a learner absent and no term mark is calculated until a mark is entered.</p>
    </div></li>
    <li><b>4</b><div>
      <h3>Check, then download Excel</h3>
      <p>The Checks panel lists missing marks, marks above the maximum, duplicate learners and weights that do not total 100%. Download unlocks when there are no errors.</p>
      <p>The Excel file has a Marks sheet with the calculated results, and a Checks sheet with what was found.</p>
    </div></li>
  </ol>
  <div class="lp-pair">
    <figure class="lp-shot" style="margin:0">
      <img src="${assetUrl('landing-gradebook-checks.png')}" alt="Gradebook Checks panel listing an error when the weights add up to 90 percent instead of 100 percent" width="1000" height="1490" loading="lazy">
      <figcaption>The Checks panel, with a weight error. Download stays locked until it is fixed.</figcaption>
    </figure>
    <figure class="lp-shot" style="margin:0">
      <img src="${assetUrl('landing-gradebook.png')}" alt="Gradebook with the weights totalling 100 percent, term marks and CAPS levels for each learner" width="1000" height="1490" loading="lazy">
      <figcaption>The same class with the weights corrected to 100%.</figcaption>
    </figure>
  </div>
</section>

<section class="lp-section" id="features">
  <h2>Everything else a teacher needs, in one app</h2>
  <p>Use only the tools you need. Each one opens from the Home page.</p>
  <div class="lp-grid">
    <div class="lp-card"><span class="lp-tag">Core</span><h3>Gradebook</h3><p>Weighted assessments, term marks, CAPS levels, checks before export, and an Excel download.</p></div>
    <div class="lp-card"><h3>Registers</h3><p>Daily class or period registers with present, absent and late marks. Monthly absentee rate, flags for three days in a row and for repeated absence, and a signed monthly Excel export.</p></div>
    <div class="lp-card"><h3>Planner</h3><p>Your timetable, term dates and a weekly calendar. Reminders show in the app, and browser notifications work if you allow them.</p></div>
    <div class="lp-card"><h3>Pacing</h3><p>Plan your scheme of work across school days, tick lessons as you teach them, and move the remaining plan when a day is lost.</p></div>
    <div class="lp-card"><h3>CPTD log</h3><p>Record your PD points by type across your three-year cycle, with reporting windows and an Excel summary.</p><p style="margin-top:6px;color:var(--muted)">A personal record only. Nothing is sent to SACE; you still report through SACE yourself.</p></div>
    <div class="lp-card"><span class="lp-tag">AI helper</span><h3>Kiaat</h3><p>Draft CAPS-aligned lesson plans, class tests with memos, and assignments with rubrics. Mark totals are checked in code. Refine a draft in the same chat. You review every draft before you use it.</p></div>
    <div class="lp-card"><h3>Import a file</h3><p>Already have a mark sheet? Open an Excel or CSV file, fix SA ID and phone formats, pass levels and duplicates, then download the cleaned copy.</p></div>
  </div>
</section>

<section class="lp-section" id="privacy">
  <h2>Where your data is kept</h2>
  <p>Teachers work with learner information, so the rules are simple:</p>
  <ul class="lp-privacy">
    <li><strong>Marks, registers, planner, pacing and CPTD records are saved in your browser.</strong> They are not stored on our server. Clearing site data deletes them, so download your Excel files as a backup.</li>
    <li><strong>Learner names and numbers never go to the AI service.</strong> Kiaat receives only the grade, subject, topic and mark totals you enter.</li>
    <li><strong>Register photos are never sent to the AI.</strong> Timetable photos may be, because they contain no learner information.</li>
  </ul>
</section>

<section class="lp-section" id="pricing">
  <h2>Price</h2>
  <div class="lp-price">
    <div>
      <strong>Free for 2 weeks, then R79 a month</strong>
      <p class="lp-note" style="margin:6px 0 0">Monthly plan, including VAT. Pay on Yoco's secure page; we never see your card.</p>
      <ul>
        <li>Gradebook, registers, planner, pacing and CPTD log</li>
        <li>Import and clean existing files</li>
        <li>Kiaat drafts</li>
      </ul>
    </div>
    <a class="btn primary" href="#get-started">Start the free trial</a>
  </div>
</section>

<section class="lp-section lp-faq" id="faq">
  <h2>Questions teachers ask</h2>
  <details><summary>Can I share my gradebook with someone?</summary><p>Not yet. Download the Excel file and send it yourself.</p></details>
  <details><summary>What if I clear my browser data?</summary><p>The saved marks are deleted. Download Excel files regularly, and before you switch computers or browsers.</p></details>
  <details><summary>Does Kiaat see my learners?</summary><p>No. It receives only the grade, CAPS subject, topic and mark totals you type in. Learner names and numbers never go to the AI service.</p></details>
  <details><summary>Is my CPTD log sent to SACE?</summary><p>No. It is your personal record. You still report your PD points through SACE yourself.</p></details>
  <details><summary>Does it connect to SA-SAMS?</summary><p>No. You export the checked marks and copy them across yourself.</p></details>
  <details><summary>Do I need to pay during the trial?</summary><p>No. The trial is free for 2 weeks. After that the plan is R79 a month, including VAT.</p></details>
</section>

<section class="lp-signin" id="get-started">
  ${logoHtml}
  <h2>Get started</h2>
  <p class="lp-note" style="margin-top:0">Create a free account, or sign in to yours.</p>
  <details class="divider-details"><summary>Create a free account</summary>
    <form id="signup-form">
      <label for="signup-name">Your name</label>
      <input id="signup-name" required minlength="2" placeholder="e.g. Thabo Mokoena">
      <label for="signup-org">School or organisation</label>
      <input id="signup-org" required minlength="2" placeholder="e.g. Sample High School">
      <label for="signup-email">Email</label>
      <input id="signup-email" type="email" required placeholder="you@example.com">
      <label for="signup-password">Password (8+ characters)</label>
      <input id="signup-password" type="password" required minlength="8" placeholder="Password">
      <button class="btn primary" style="width:100%;margin-top:14px" id="sign-up-btn">Create free account</button>
    </form>
  </details>
  <details class="divider-details" ${demo ? '' : 'open'}><summary>Sign in to an existing account</summary>
    <form id="login-form">
      <label for="login-email">Email</label>
      <input id="login-email" type="email" autocomplete="username" required placeholder="you@example.com">
      <label for="login-password">Password</label>
      <input id="login-password" type="password" autocomplete="current-password" required placeholder="Password">
      <button class="btn primary" style="width:100%;margin-top:16px" id="sign-in">Sign in</button>
    </form>
  </details>
</section>

<section class="lp-end">
  <h2>Check your next mark sheet in minutes</h2>
  <p>Start with the sample class, then replace it with your own learners.</p>
  ${demoCtaEnd}
</section>
<div style="margin-top:20px">${productCreditHtml}</div>
</main>`;
}
