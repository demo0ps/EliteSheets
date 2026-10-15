// Public landing page shown before sign-in. Built to be understood at a glance: a looping product demo,
// three picture steps and short labels. Every claim matches what the app does today.
// The element IDs below are used by the sign-in and sign-up handlers in app.ts; do not rename them.

// Images and icons sit next to styles.css, so resolve from that link: works on the local server (/static/)
// and on GitHub Pages (./web/), where absolute /static paths do not exist.
function assetUrl(name: string): string {
  const link = document.querySelector<HTMLLinkElement>('link[href*="styles.css"]');
  const base = link ? new URL('.', link.href).href : '/static/';
  return base + name;
}

export const LANDING_CSS = `
.login-minimal,body:has(.login-minimal){--bg:#F3FAF9;--panel:#FFFFFF;--line:#D3E8E5;--ink:#13293D;--muted:#4D6475;--accent:#0A7C78;--accent-hover:#076562;--accent-soft:#E0F4F1;--accent-border:#9ED8D1;--gold:#F5B82E;--gold-soft:#FFF4DB}
body:has(.login-minimal){background:#F3FAF9 !important;background-image:none !important}
.login-minimal{max-width:1040px;margin:0 auto;padding:12px 18px 48px;color:var(--ink);text-align:center}
.login-minimal .btn.primary{box-shadow:0 8px 20px rgba(10,124,120,.28)}
.lp-big{font-size:18px;padding:16px 28px;border-radius:14px}
.lp-hero{display:grid;gap:28px;align-items:center;margin:20px 0 8px;text-align:left}
@media (min-width:880px){.lp-hero{grid-template-columns:1fr 1.1fr}}
.lp-hero h1{font-size:clamp(30px,4.6vw,46px);line-height:1.1;margin:0 0 14px;color:var(--ink)}
.lp-sub{font-size:19px;color:var(--muted);margin:0 0 22px;line-height:1.45}
.lp-cta{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.lp-try{font-weight:600;color:var(--accent-hover);font-size:15px}
.lp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}
.lp-chip{display:inline-flex;align-items:center;gap:7px;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:7px 13px;font-size:14px;font-weight:600}
.lp-chip img,.lp-ico{width:20px;height:20px;display:block}
/* demo card */
.lp-demo{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px;box-shadow:0 14px 36px rgba(19,41,61,.10);text-align:left;font-size:13px}
.lp-demo-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-weight:700;font-size:14px}
.lp-stack{position:relative;height:26px;min-width:120px}
.lp-stack span{position:absolute;right:0;top:0;white-space:nowrap}
.lp-w1{color:#B42318;animation:lpProblem 9s linear infinite}
.lp-w2{color:var(--accent);opacity:0;animation:lpOk 9s linear infinite}
.lp-weights{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px}
.lp-weights div{background:var(--accent-soft);border-radius:8px;padding:6px 8px;font-size:12px;color:var(--accent-hover);font-weight:600}
.lp-table{width:100%;border-collapse:collapse}
.lp-table th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);text-align:left;padding:4px 6px}
.lp-table td{padding:6px;border-top:1px solid var(--line)}
.lp-c{display:inline-block;min-width:34px;text-align:center;background:#F3F7F7;border-radius:6px;padding:4px 0;opacity:0;animation:lpPop 9s linear infinite;animation-delay:var(--d)}
.lp-t{font-weight:700;color:var(--accent-hover);opacity:0;animation:lpPop 9s linear infinite;animation-delay:var(--d)}
.lp-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap}
.lp-status{position:relative;height:22px;font-weight:700}
.lp-status span{position:absolute;left:0;top:0;white-space:nowrap}
.lp-s1{color:#B42318;animation:lpProblem 9s linear infinite}
.lp-s2{color:var(--accent-hover);opacity:0;animation:lpOk 9s linear infinite}
.lp-dl{background:#C9D8D6;color:#fff;border-radius:10px;padding:9px 14px;font-weight:700;font-size:13px;animation:lpDl 9s linear infinite}
@keyframes lpPop{0%{opacity:0}6%,92%{opacity:1}100%{opacity:0}}
@keyframes lpProblem{0%,40%{opacity:1}46%,100%{opacity:0}}
@keyframes lpOk{0%,50%{opacity:0}56%,94%{opacity:1}100%{opacity:0}}
@keyframes lpDl{0%,52%{background:#C9D8D6}58%,94%{background:#0A7C78}100%{background:#C9D8D6}}
@media (prefers-reduced-motion: reduce){
  .lp-w1,.lp-s1,.lp-w2,.lp-s2,.lp-c,.lp-t,.lp-dl{animation:none !important}
  .lp-w1,.lp-s1{opacity:0}.lp-w2,.lp-s2,.lp-c,.lp-t{opacity:1}.lp-dl{background:#0A7C78}
}
/* sections */
.lp-section{margin:64px 0 0}
.lp-section h2{font-size:26px;margin:0 0 22px;color:var(--ink)}
.lp-steps{display:grid;gap:14px;grid-template-columns:1fr}
@media (min-width:760px){.lp-steps{grid-template-columns:repeat(3,1fr)}}
.lp-step{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:26px 18px}
.lp-step .lp-num{display:inline-flex;width:34px;height:34px;align-items:center;justify-content:center;border-radius:50%;background:var(--gold);color:var(--ink);font-weight:800;margin-bottom:10px}
.lp-step img{width:64px;height:64px;display:block;margin:0 auto 10px}
.lp-step strong{font-size:20px}
.lp-tiles{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)}
@media (min-width:760px){.lp-tiles{grid-template-columns:repeat(4,1fr)}}
.lp-tile{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px 10px;font-weight:700;font-size:15px}
.lp-tile img{width:44px;height:44px;display:block;margin:0 auto 8px}
.lp-kiaat{font-size:17px;color:var(--muted);margin:0 0 18px}
.lp-privacy{display:grid;gap:12px;grid-template-columns:1fr}
@media (min-width:760px){.lp-privacy{grid-template-columns:repeat(3,1fr)}}
.lp-privacy div{background:var(--accent-soft);border:1px solid var(--accent-border);border-radius:14px;padding:18px 12px;font-weight:700;font-size:16px}
.lp-privacy img{width:36px;height:36px;display:block;margin:0 auto 8px}
.lp-price{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:26px;display:grid;gap:14px;justify-items:center}
.lp-price strong{font-size:30px}
.lp-faq{text-align:left;max-width:720px;margin:0 auto}
.lp-faq details{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin-top:10px}
.lp-faq summary{cursor:pointer;font-weight:700;font-size:16px}
.lp-faq p{margin:8px 0 0;font-size:15px;line-height:1.5;color:var(--muted)}
.lp-signin{margin:64px auto 0;max-width:520px;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:24px;text-align:left}
.lp-signin h2{font-size:22px;margin:12px 0 4px;text-align:center}
.lp-end{margin:56px 0 10px;padding:32px 24px;background:linear-gradient(135deg,var(--accent) 0%,#0B5E7A 100%);color:#fff;border-radius:18px}
.lp-end h2{color:#fff;font-size:28px;margin:0 0 16px}
.lp-end .btn.primary{background:#FFFFFF;color:#0A7C78;box-shadow:none}
.lp-end .btn.primary:hover:not(:disabled){background:#E0F4F1}
.lp-note{font-size:14px;color:var(--muted);margin:0}
.login-minimal a,.login-minimal .btn{text-decoration:none !important}
`;

export function landingHtml(logoHtml: string, productCreditHtml: string, demo: boolean): string {
  const trySample = demo
    ? `<a class="lp-try" href="#" data-launch-vert="education">or try the sample class</a>`
    : '';
  const trySampleEnd = demo
    ? `<button class="btn primary lp-big" data-launch-vert="education" style="margin-top:16px;background:#FFFFFF;color:#0A7C78">Try the sample class</button>`
    : '';
  const cells = (marks: string[], delays: number[]) =>
    marks.map((m, i) => `<td><span class="lp-c" style="--d:${delays[i]}s">${m}</span></td>`).join('');
  return `<main class="login-minimal">
<style>${LANDING_CSS}</style>
<header>${logoHtml}</header>

<section class="lp-hero">
  <div>
    <h1>Turn messy school marks into checked, shareable reports.</h1>
    <p class="lp-sub">Weighted gradebook for South African teachers.</p>
    <div class="lp-cta">
      <a class="btn primary lp-big" href="#get-started">Start free trial</a>
      ${trySample}
    </div>
    <div class="lp-chips">
      <span class="lp-chip"><img src="${assetUrl('icons/clock.png')}" alt="" onerror="this.remove()">Free 2 weeks</span>
      <span class="lp-chip"><img src="${assetUrl('icons/dollar.png')}" alt="" onerror="this.remove()">R79 a month</span>
      <span class="lp-chip"><img src="${assetUrl('icons/shield.png')}" alt="" onerror="this.remove()">Marks stay in your browser</span>
    </div>
  </div>
  <div class="lp-demo" role="img" aria-label="Animated gradebook: marks fill in, weights are checked, then Download Excel turns on">
    <div class="lp-demo-top"><span>Grade 9B Maths</span><span class="lp-stack"><span class="lp-w1">Weights 90%</span><span class="lp-w2">Weights 100%</span></span></div>
    <div class="lp-weights"><div>Test 1 · 20%</div><div>Test 2 · 20%</div><div>Exam · 60%</div></div>
    <table class="lp-table">
      <thead><tr><th>Learner</th><th>Test 1</th><th>Test 2</th><th>Exam</th><th>Term</th></tr></thead>
      <tbody>
        <tr><td>L-014</td>${cells(['8','18','71'],[0.4,0.8,1.2])}<td><span class="lp-t" style="--d:1.6s">73%</span></td></tr>
        <tr><td>L-027</td>${cells(['6','22','80'],[1.8,2.2,2.6])}<td><span class="lp-t" style="--d:3s">77%</span></td></tr>
        <tr><td>L-031</td>${cells(['4','12','44'],[3.4,3.8,4.2])}<td><span class="lp-t" style="--d:4.6s">44%</span></td></tr>
      </tbody>
    </table>
    <div class="lp-foot">
      <span class="lp-status"><span class="lp-s1">1 problem: weights add to 90%</span><span class="lp-s2">All checks passed</span></span>
      <span class="lp-dl">Download Excel</span>
    </div>
  </div>
</section>

<section class="lp-section" id="how">
  <h2>Three steps</h2>
  <div class="lp-steps">
    <div class="lp-step"><span class="lp-num">1</span><img src="${assetUrl('icons/grid.png')}" alt=""><strong>Add marks</strong></div>
    <div class="lp-step"><span class="lp-num">2</span><img src="${assetUrl('icons/check.png')}" alt=""><strong>Check</strong></div>
    <div class="lp-step"><span class="lp-num">3</span><img src="${assetUrl('icons/download.png')}" alt=""><strong>Download</strong></div>
  </div>
</section>

<section class="lp-section" id="features">
  <h2>Everything in one app</h2>
  <div class="lp-tiles">
    <div class="lp-tile"><img src="${assetUrl('icons/book.png')}" alt="">Gradebook</div>
    <div class="lp-tile"><img src="${assetUrl('icons/clipboard.png')}" alt="">Registers</div>
    <div class="lp-tile"><img src="${assetUrl('icons/clock.png')}" alt="">Planner</div>
    <div class="lp-tile"><img src="${assetUrl('icons/chart.png')}" alt="">Pacing</div>
    <div class="lp-tile"><img src="${assetUrl('icons/shield.png')}" alt="">CPTD log</div>
    <div class="lp-tile"><img src="${assetUrl('icons/spark.png')}" alt="">Kiaat helper</div>
    <div class="lp-tile"><img src="${assetUrl('icons/upload.png')}" alt="">Import</div>
    <div class="lp-tile"><img src="${assetUrl('icons/school.png')}" alt="">CAPS levels</div>
  </div>
</section>

<section class="lp-section" id="privacy">
  <div class="lp-privacy">
    <div><img src="${assetUrl('icons/lock.png')}" alt="">Saved in your browser</div>
    <div><img src="${assetUrl('icons/users.png')}" alt="">No learner names to AI</div>
    <div><img src="${assetUrl('icons/download.png')}" alt="">Export anytime</div>
  </div>
</section>

<section class="lp-section" id="pricing">
  <div class="lp-price">
    <strong>Free 2 weeks, then R79 a month</strong>
    <p class="lp-note">Including VAT. Cancel any time.</p>
    <a class="btn primary lp-big" href="#get-started">Start free trial</a>
  </div>
</section>

<section class="lp-section lp-faq" id="faq">
  <details><summary>Can I share it?</summary><p>Not yet. Download the Excel file and send it.</p></details>
  <details><summary>Does Kiaat see my learners?</summary><p>No. It sees only grade, subject, topic and mark totals.</p></details>
  <details><summary>Is my CPTD log sent to SACE?</summary><p>No. It is your personal record.</p></details>
  <details><summary>Does it connect to SA-SAMS?</summary><p>No. Copy the checked marks across yourself.</p></details>
</section>

<section class="lp-signin" id="get-started">
  ${logoHtml}
  <h2>Start your free trial</h2>
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
  <h2>Your next mark sheet, checked.</h2>
  <a class="btn primary lp-big" href="#get-started">Start free trial</a>
  ${trySampleEnd}
</section>
<div style="margin-top:22px">${productCreditHtml}</div>
</main>`;
}
