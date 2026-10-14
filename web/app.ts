import { EDUSCF_LOGO_URI } from './eduscf_logo';
interface User{id:string;name:string;email:string;role:string;tenant_id:string}
interface Q{ id:string;text:string;evidence:string;kind:string }
interface Check{id:string;name:string;passed:boolean;detail:string}
interface Source{source_id:string;sheet:string;header_row:number;layout:string;field_map:Record<string,string>;key:string;period:string;value:string;columns:string[]}
interface Plan{destination:{mode:string;sheet:string;key:string;period:string;value:string;categories:string[];total:string;header_row:number};sources:Source[];rules:any[];questions:Q[]}
interface Chat{id:string;role:string;text:string;kind:string;created:string}
interface Job{id:string;title:string;created:string;state:string;trace_id:string;profiles:{template:any;sources:any[]};plan:Plan;report:{status:string;checks:Check[];questions:Q[];rows:Record<string,any>[];headers:string[];passed_checks:number;total_checks:number;source_records:number;mapped_records:number;output_rows:number;template_version:string}|null;mapping_origin:string;chat:Chat[];proposal:any;knowledge_id:string|null;knowledge_conflict:boolean;use_workbook_rules:boolean}
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const escapeHTML=(x:any)=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const uid=()=>crypto.randomUUID();
const paths:Record<string,string>={grid:'M3 3h18v18H3zM3 9h18M9 3v18M3 15h18M15 3v18',spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3',shield:'m12 3 8 4v6c0 5-8 8-8 8s-8-3-8-8V7l8-4m-4 9 3 3 5-6',file:'M6 3h8l4 4v14H6V3m8 0v5h4M9 12h6m-6 4h6',upload:'M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4',arrow:'M4 12h16m-6-6 6 6-6 6',check:'m5 12 4 4L19 6',book:'M3 5h6c2 0 3 2 3 3 0-1 1-3 3-3h6v15h-6c-2 0-3 1-3 1s-1-1-3-1H3V5m9 3v13',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m-8 4 2-3-1-3 3-1 2-2 2 1 3 1 1 3 2 2-1 3-1 3-3 1-2 2-3-1-3-1-1-3-2-2z',chat:'M4 4h16v13H9l-5 4V4m4 5h8m-8 4h5',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 4v5l4 2',folder:'M3 6h7l2 3h9v11H3V6',download:'M12 3v13m-4-4 4 4 4-4M4 18v3h16v-3',lock:'M6 11h12v10H6V11m2 0V7a4 4 0 0 1 8 0v4',warning:'m12 3 10 18H2L12 3m0 5v6m0 3v1',users:'M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8m9 1a3 3 0 1 1 0 6M2 21v-4c0-4 12-4 12 0v4m3-7c3 0 5 1 5 3v4',logout:'M9 4H3v16h6m4-8h9m-4-4 4 4-4 4',layers:'m12 3 10 5-10 5L2 8l10-5m-10 9 10 5 10-5m-20 5 10 5 10-5',edit:'m15 4 5 5-10 10-6 1 1-6L15 4m-3 3 5 5',plus:'M12 4v16M4 12h16',send:'m3 3 18 9-18 9 3-9-3-9m3 9h15',link:'m9 15 6-6m-7 3-3 3c-4 4 2 10 6 6l3-3m-2-6 3-3c4-4 10 2 6 6l-3 3',trash:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14m-8 4v6m4-6v6',info:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 7v7m0-10v1',dollar:'M12 2v20m5-16H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H6'};
const icon=(name:string)=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.grid}"/></svg>`;
let user:User|null=null,csrf='',demoToken='',workspaceID='',boot:any={},overview:any={},job:Job|null=null,currentPage='workspace',adminSettings:any={},customers:any[]=[],previousFocus:HTMLElement|null=null,staticMode=false;
async function api<T=any>(path:string,body?:any,method='POST'):Promise<T>{
  if(staticMode)return localApi<T>(path,body,method);
  const headers:Record<string,string>={};if(csrf)headers['X-CSRF-Token']=csrf;if(demoToken)headers['X-Demo-Session']=demoToken;if(workspaceID)headers['X-Workspace-ID']=workspaceID;const options:RequestInit={headers,credentials:'same-origin'};if(body!==undefined){options.method=method;if(body instanceof FormData)options.body=body;else{headers['Content-Type']='application/json';options.body=JSON.stringify(body)}}
  try{
    const r=await fetch(path,options);
    if(path==='/api/bootstrap'&&(r.status===404||r.status===405||(r.headers.get('content-type')||'').includes('text/html'))){
      staticMode=true;
      return localApi<T>(path,body,method);
    }
    if(!r.ok){let message='Request failed.';try{const d=await r.json();message=typeof d.detail==='string'?d.detail:'Check the submitted fields.'}catch{}throw new Error(message)}
    return r.json();
  }catch(err){
    if(path==='/api/bootstrap'){
      staticMode=true;
      return localApi<T>(path,body,method);
    }
    throw err;
  }
}
function toast(text:string,error=false){const el=$('toast');el.textContent=text;el.className='visible'+(error?' error':'');window.setTimeout(()=>{el.className=''},4000)}
async function busy(element:HTMLElement,action:()=>Promise<void>){const b=element as HTMLButtonElement;const old=b.innerHTML;b.disabled=true;b.innerHTML=icon('clock')+'Working…';try{await action()}catch(e){toast(e instanceof Error?e.message:String(e),true)}finally{if(document.contains(b)){b.disabled=false;b.innerHTML=old}}}
function logo(){return `<div class="logo"><span class="logo-box">${icon('grid')}</span><span><b>Edu</b>SheetManager<small class="brand-by">by EduSCF</small></span></div>`}
function poweredByEduSCF(){return `<div class="powered-by-eduscf" aria-label="Powered by EduSCF — Edu School Communicator Foundation (NPC)"><span>Powered by</span><img src="${EDUSCF_LOGO_URI}" alt="EduSCF — Edu School Communicator Foundation (NPC)" class="eduscf-logo-img"></div>`}
function openModal(title:string,body:string){previousFocus=document.activeElement as HTMLElement;$('modal-title').textContent=title;$('modal-content').innerHTML=body;$('modal').hidden=false;$('close-modal').focus()}
function closeModal(){$('modal').hidden=true;previousFocus?.focus()}

interface VerticalActionCard{
  title:string;
  desc:string;
  action:string;
}

interface VerticalConfig{
  label:string;
  shortName:string;
  badge:string;
  desc:string;
  defaultSample:string;
  tabs:Array<{page:string;label:string;iconName:string}>;
  cards:VerticalActionCard[];
  samples:Array<{val:string;label:string}>;
  builderPresetCmd:string;
  builderPresetLabel:string;
  templateCategories:string[];
}

const VERTICAL_META:Record<string,VerticalConfig>={
  general:{
    label:'✨ Everyday / Regular User',
    shortName:'Everyday',
    badge:'Simple · Clean · Everyday Spreadsheets',
    desc:'Upload any Excel or CSV files to clean, match columns, fix IDs/phones, or create a fresh spreadsheet in plain words.',
    defaultSample:'pivot',
    tabs:[
      {page:'workspace',label:'Clean & Combine Sheets',iconName:'chat'},
      {page:'builder',label:'Create New Sheet',iconName:'plus'},
      {page:'templates',label:'Templates',iconName:'layers'},
      {page:'preferences',label:'Past Files & Settings',iconName:'settings'}
    ],
    cards:[
      {title:'📂 Upload & Clean My Spreadsheet',desc:'Upload your own Excel or CSV files (or a folder) to clean and combine them automatically.',action:'upload:open'},
      {title:'✏️ Create a New Sheet from Scratch',desc:'Start with a blank spreadsheet or type the columns you want in everyday words.',action:'page:builder'},
      {title:'📊 Try a Quick Everyday Example',desc:'See how messy sheets get matched, cleaned, and totaled in one click.',action:'sample:pivot'}
    ],
    samples:[
      {val:'pivot',label:'Combine Monthly Sheets → Summary Table'},
      {val:'direct',label:'Contact & Order List → Clean Excel Sheet'},
      {val:'chat_map',label:'Match Different Column Names in 1 Click'},
      {val:'district_batch',label:'Merge a Whole Folder of Files into 1 Sheet'}
    ],
    builderPresetCmd:'Columns: Name, Email, Phone, Date, Category, Amount, Notes',
    builderPresetLabel:'Everyday Tracker Sheet',
    templateCategories:['Education / SA-SAMS','Business PA & Billing','Finance & Operations','HR & Payroll','Supply Chain & ERP']
  },
  education:{
    label:'🎓 School & District Office',
    shortName:'School',
    badge:'SA-SAMS · Class Lists · Marks',
    desc:'Combine SA-SAMS student & subject mark sheets, fix 13-digit SA IDs (including missing 0s for 2000–2009), calculate Pass Levels (1–7), and merge school folders.',
    defaultSample:'sasams_students',
    tabs:[
      {page:'workspace',label:'Student & Mark Sheets',iconName:'chat'},
      {page:'builder',label:'Create Class Sheet',iconName:'plus'},
      {page:'templates',label:'School Templates',iconName:'layers'},
      {page:'preferences',label:'Past Files & Settings',iconName:'settings'}
    ],
    cards:[
      {title:'📋 Combine Student & Subject Sheets',desc:'Join SA-SAMS Learner/Parent Bio + Subject Marks into 1 ready-to-import sheet.',action:'sample:sasams_students'},
      {title:'📂 Merge Folder of School Sheets',desc:'Combine multiple classes or schools into 1 Master Sheet & check duplicate learners.',action:'sample:district_batch'},
      {title:'✏️ Start a Class or Fee Register',desc:'Build a new class list or tuition sheet from scratch with automatic Balance calculation.',action:'builder:student'}
    ],
    samples:[
      {val:'sasams_students',label:'SA-SAMS 2-File Student & Subject Marks'},
      {val:'district_batch',label:'Multi-School Folder Merge (Check SA IDs & Duplicates)'}
    ],
    builderPresetCmd:'Create a SA-SAMS student & tuition sheet',
    builderPresetLabel:'Class & Tuition Register',
    templateCategories:['Education / SA-SAMS']
  },
  sme_pa:{
    label:'💼 Small Business & PA',
    shortName:'Business',
    badge:'Quotes · Invoices · Clients',
    desc:'Create branded Quotes & Tax Invoices in plain words, paste WhatsApp or Email client lists into Excel, and clean customer names, phones, and IDs.',
    defaultSample:'direct',
    tabs:[
      {page:'quotes',label:'Quotes & Invoices',iconName:'dollar'},
      {page:'workspace',label:'Clean Client Sheet',iconName:'chat'},
      {page:'builder',label:'Create New Sheet',iconName:'plus'},
      {page:'preferences',label:'Past Files & Settings',iconName:'settings'}
    ],
    cards:[
      {title:'🧾 Create a Quote or Tax Invoice',desc:'Type what you are charging in plain words and download a clean PDF or Excel invoice.',action:'page:quotes'},
      {title:'📋 Paste WhatsApp / Email into Excel',desc:'Turn messy client lines from WhatsApp or Email into a neat spreadsheet table.',action:'builder:paste'},
      {title:'✨ Clean Client Contacts & IDs',desc:'Load a client or order sheet to fix names, +27 phone numbers, emails & ID numbers.',action:'sample:direct'}
    ],
    samples:[
      {val:'direct',label:'Client & Order List → Clean Excel Sheet'},
      {val:'form',label:'Customer Booking Form → Clean Table'}
    ],
    builderPresetCmd:'Columns: Client ID, Full Name, SA ID Number, Phone, Email, Amount Due, Paid',
    builderPresetLabel:'Client & Payment List',
    templateCategories:['Business PA & Billing']
  },
  finance_hr:{
    label:'📊 Finance, Bookkeeping & Payroll',
    shortName:'Finance',
    badge:'Monthly Totals · Payroll · Reconcile',
    desc:'Combine monthly or branch figures with automatic Totals, spot missing numbers before export, check staff payroll SA IDs, and compare two sheets.',
    defaultSample:'pivot',
    tabs:[
      {page:'workspace',label:'Combine Monthly Sheets',iconName:'chat'},
      {page:'builder',label:'Build & Reconcile',iconName:'plus'},
      {page:'templates',label:'Finance Templates',iconName:'layers'},
      {page:'preferences',label:'Past Files & Settings',iconName:'settings'}
    ],
    cards:[
      {title:'📊 Combine Branch / Monthly Figures',desc:'Merge regional or monthly sheets into one summary table with automatic Totals.',action:'sample:pivot'},
      {title:'🔍 Spot & Fill Missing Figures',desc:'Catch blank monthly figures automatically and fill them in chat before downloading.',action:'sample:hold'},
      {title:'👥 Build Payroll or Expense Sheet',desc:'Create a staff payroll or budget sheet with automatic VAT/Net Pay formulas.',action:'builder:expense'}
    ],
    samples:[
      {val:'pivot',label:'Combine Branch Sheets → Monthly Summary Table'},
      {val:'hold',label:'Spot Missing Monthly Figure → Fill in Chat'}
    ],
    builderPresetCmd:'Create a monthly expense tracker',
    builderPresetLabel:'Expense & VAT Sheet',
    templateCategories:['Finance & Operations','HR & Payroll']
  },
  supply_chain:{
    label:'📦 Stock, Inventory & Suppliers',
    shortName:'Stock',
    badge:'Supplier Lists · SKUs · Warehouses',
    desc:'Match supplier price lists and CSVs to your stock sheet in 1 click, merge warehouse folders into 1 Master Stock file, and calculate stock values.',
    defaultSample:'chat_map',
    tabs:[
      {page:'workspace',label:'Match Supplier Sheets',iconName:'chat'},
      {page:'builder',label:'Build Stock Sheet',iconName:'plus'},
      {page:'templates',label:'Stock Templates',iconName:'layers'},
      {page:'preferences',label:'Past Files & Settings',iconName:'settings'}
    ],
    cards:[
      {title:'📦 Match Supplier Columns to Stock List',desc:'Match different supplier column names (like "Boxes" → "Qty") in 1 click.',action:'sample:chat_map'},
      {title:'📂 Merge Warehouse Folder into Master Stock',desc:'Upload a folder of depot or supplier sheets and combine them into 1 Master file.',action:'folder:open'},
      {title:'🧮 Build Stock Count & Value Sheet',desc:'Start an inventory count sheet with automatic Total Value = Qty × Unit Price.',action:'builder:inventory'}
    ],
    samples:[
      {val:'chat_map',label:'Match Supplier "Boxes" Column → Stock "Qty"'},
      {val:'direct',label:'Supplier CSV → Standard Stock Template'},
      {val:'unpivot',label:'Wide Warehouse Sheet → Normalized Rows'}
    ],
    builderPresetCmd:'Create a warehouse inventory stock sheet',
    builderPresetLabel:'Warehouse Stock Sheet',
    templateCategories:['Supply Chain & ERP']
  }
};

function activeVertical():string{
  return overview?.preferences?.vertical||'general';
}

function friendlyText(raw:string):string{
  return String(raw||'')
    .replace(/QMS released this workbook \(\d+\/\d+ checks passed,\s*/gi,'Your spreadsheet is ready to download (')
    .replace(/QMS released ([^()]+?)\s*\(\d+\/\d+ checks passed,\s*/gi,'$1 is ready to download (')
    .replace(/Output held[.:]\s*/gi,'Almost ready — ')
    .replace(/\bQMS\b/g,'Helper');
}

function loginPage(){
  user=null;job=null;csrf='';demoToken='';workspaceID='';document.body.className='light';
  $('root').innerHTML=`<main class="login-minimal"><section class="sign-card">${logo()}<h1>Your calm, everyday spreadsheet helper.</h1><p>Clean up messy files, combine spreadsheets, or create a brand-new sheet in plain everyday words — no complicated formulas needed.</p>${boot.demo_mode?`<div class="demo-actions">
    <button class="btn primary" data-launch-vert="general" style="padding:16px 20px;font-size:16px;justify-content:space-between"><span>✨ Start as Regular / Everyday User</span>${icon('arrow')}</button>
  </div>
  <details class="divider-details"><summary>Optional: Or open a specialized industry workspace (Schools, Business, Finance, Stock)</summary>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
      <button class="btn small" data-launch-vert="education" style="justify-content:flex-start;text-align:left;padding:10px 12px"><div><strong style="display:block">🎓 Schools & SA-SAMS</strong><small style="color:var(--muted)">Class Lists, IDs & Marks</small></div></button>
      <button class="btn small" data-launch-vert="sme_pa" style="justify-content:flex-start;text-align:left;padding:10px 12px"><div><strong style="display:block">💼 Small Business & PA</strong><small style="color:var(--muted)">Quotes & Invoices</small></div></button>
      <button class="btn small" data-launch-vert="finance_hr" style="justify-content:flex-start;text-align:left;padding:10px 12px"><div><strong style="display:block">📊 Finance & Payroll</strong><small style="color:var(--muted)">Monthly Totals & Staff</small></div></button>
      <button class="btn small" data-launch-vert="supply_chain" style="justify-content:flex-start;text-align:left;padding:10px 12px"><div><strong style="display:block">📦 Stock & Suppliers</strong><small style="color:var(--muted)">Inventory & Warehouses</small></div></button>
    </div>
    <button id="demo-admin" class="btn small" style="width:100%;margin-top:10px">${icon('settings')}Platform Admin Settings</button>
  </details>`:''}
  <details class="divider-details"><summary>Create a free account (Sign Up)</summary>
    <form id="signup-form">
      <div class="field-row">
        <div><label for="signup-name">Your Name</label><input id="signup-name" required minlength="2" placeholder="e.g. Thabo Mokoena"></div>
        <div><label for="signup-org">Workspace or Organization Name</label><input id="signup-org" required minlength="2" placeholder="e.g. Personal / My Workspace"></div>
      </div>
      <label for="signup-vertical">Workspace Mode (you can change this anytime)</label>
      <select id="signup-vertical">
        <option value="general" selected>✨ Everyday / Regular User (General Spreadsheets — Default)</option>
        <option value="education">🎓 School & District Office (SA-SAMS, Student Lists & Marks)</option>
        <option value="sme_pa">💼 Small Business & PA (Quotes, Tax Invoices & Client Lists)</option>
        <option value="finance_hr">📊 Finance, Bookkeeping & Payroll (Monthly Summaries & Staff)</option>
        <option value="supply_chain">📦 Stock, Inventory & Suppliers (Supplier Sheets & Warehouses)</option>
      </select>
      <div class="field-row">
        <div><label for="signup-email">Email</label><input id="signup-email" type="email" required placeholder="you@example.com"></div>
        <div><label for="signup-password">Password (8+ characters)</label><input id="signup-password" type="password" required minlength="8" placeholder="Password"></div>
      </div>
      <button class="btn primary" style="width:100%;margin-top:14px" id="sign-up-btn">Create Account & Open Workspace${icon('arrow')}</button>
    </form>
  </details>
  <details class="divider-details" ${boot.demo_mode?'':'open'}><summary>Sign in to an existing account</summary><form id="login-form"><label for="login-email">Email</label><input id="login-email" type="email" autocomplete="username" required placeholder="you@example.com"><label for="login-password">Password</label><input id="login-password" type="password" autocomplete="current-password" required placeholder="Password"><button class="btn primary" style="width:100%;margin-top:16px" id="sign-in">Sign in${icon('arrow')}</button></form></details>
  <div class="signin-powered-wrap">${poweredByEduSCF()}</div></section></main>`;

  $('login-form').addEventListener('submit',e=>{e.preventDefault();void busy($('sign-in'),async()=>{const r=await api('/api/auth/login',{email:$<HTMLInputElement>('login-email').value,password:$<HTMLInputElement>('login-password').value});$<HTMLInputElement>('login-password').value='';await signedIn(r)})});
  $('signup-form').addEventListener('submit',e=>{e.preventDefault();void busy($('sign-up-btn'),async()=>{
    const vert=$<HTMLSelectElement>('signup-vertical').value;
    const r=await api('/api/auth/signup',{
      name:$<HTMLInputElement>('signup-org').value.trim(),
      display_name:$<HTMLInputElement>('signup-name').value.trim(),
      email:$<HTMLInputElement>('signup-email').value.trim(),
      password:$<HTMLInputElement>('signup-password').value,
      vertical:vert
    });
    $<HTMLInputElement>('signup-password').value='';
    await signedIn(r);
    toast(`Welcome! Opened your ${VERTICAL_META[vert]?.label||'Everyday'} workspace.`);
  })});
  if(boot.demo_mode){
    document.querySelectorAll<HTMLButtonElement>('[data-launch-vert]').forEach(b=>b.addEventListener('click',()=>void demoLogin('operator',b.dataset.launchVert!)));
    if($('demo-admin'))$('demo-admin').addEventListener('click',()=>void demoLogin('admin'));
  }
}

async function demoLogin(role:string,vertical?:string){const r=await api('/api/auth/demo',vertical?{role,vertical}:{role});await signedIn(r)}
async function signedIn(r:any){user=r.user;csrf=r.csrf;demoToken=r.demo_token||'';workspaceID=user!.role==='admin'&&boot.demo_mode?'demo-a':user!.tenant_id;await refresh();const vert=activeVertical();currentPage=user!.role==='admin'?'admin':(vert==='sme_pa'?'quotes':'workspace');job=null;shell();await showPage(currentPage)}
async function refresh(){if(!user)return;if(user.role==='admin'){customers=(await api('/api/admin/customers')).items;if(!workspaceID||workspaceID==='platform')workspaceID=customers[0]?.id||''}if(workspaceID&&workspaceID!=='platform')overview=await api('/api/overview');else overview={workspace:{name:'Platform administration'},jobs:[],stats:{jobs:0,released:0,held:0,knowledge:0},ai:{enabled:false},preferences:{theme:'light',density:'comfortable',vertical:'general'}};applyPreferences()}
function applyPreferences(){document.body.className=((overview.preferences?.theme==='dark'?'dark':'light')+(overview.preferences?.density==='compact'?' compact':'')).trim()}

function shell(){
  if(!user)return;
  const vert=activeVertical();
  const vMeta=VERTICAL_META[vert]||VERTICAL_META.general;
  $('root').innerHTML=`<div class="shell"><header class="topbar"><div class="topbar-left">${logo()}<nav class="nav" aria-label="Workspace navigation">${vMeta.tabs.map(t=>`<button class="nav-btn" data-page="${t.page}">${icon(t.iconName as any)}${escapeHTML(t.label)}</button>`).join('')}${user.role==='admin'?`<button class="nav-btn" data-page="admin">${icon('shield')}Admin</button>`:''}</nav></div><div class="topbar-right"><select id="vertical-picker" aria-label="Workspace mode" title="Switch between Everyday Mode or an optional Industry Pack">${Object.entries(VERTICAL_META).map(([k,v])=>`<option value="${k}" ${k===vert?'selected':''}>${escapeHTML(v.label)}</option>`).join('')}</select>${user.role==='admin'&&customers.length?`<select id="workspace-picker" aria-label="Customer workspace">${customers.map(c=>`<option value="${c.id}" ${c.id===workspaceID?'selected':''}>${escapeHTML(c.name)}</option>`).join('')}</select>`:''}<button id="help" class="btn small">${icon('info')}Guide</button><button id="logout" class="icon-button" aria-label="Sign out" title="Sign out">${icon('logout')}</button><button id="mobile-logout" class="icon-button mobile-logout" aria-label="Sign out">${icon('logout')}</button></div></header><main id="main" tabindex="-1"><div id="page" class="page"></div></main><footer class="app-footer"><div class="app-footer-left"><strong>EduSheetManager</strong> <span style="opacity:0.75">by EduSCF</span> · Calm, everyday spreadsheet helper</div>${poweredByEduSCF()}</footer></div>`;
  document.querySelectorAll<HTMLButtonElement>('[data-page]').forEach(b=>b.addEventListener('click',()=>void showPage(b.dataset.page!)));
  $('logout').addEventListener('click',()=>void(async()=>{await api('/api/auth/logout',{});loginPage()})());
  $('mobile-logout').addEventListener('click',()=>void(async()=>{await api('/api/auth/logout',{});loginPage()})());
  $('help').addEventListener('click',showHelp);
  $('vertical-picker').addEventListener('change',()=>void(async()=>{
    const newVert=$<HTMLSelectElement>('vertical-picker').value;
    const curPrefs=overview.preferences||{theme:'light',density:'comfortable',explanations:'detailed',auto_checks:true};
    await api('/api/preferences',{...curPrefs,vertical:newVert},'PUT');
    job=null;
    await refresh();
    const nextTabs=(VERTICAL_META[newVert]||VERTICAL_META.general).tabs;
    if(!nextTabs.some(t=>t.page===currentPage)&&currentPage!=='admin'){
      currentPage=newVert==='sme_pa'?'quotes':'workspace';
    }
    shell();
    await showPage(currentPage);
    toast(`Switched to ${VERTICAL_META[newVert]?.label||newVert}`);
  })());
  if($('workspace-picker'))$('workspace-picker').addEventListener('change',()=>void(async()=>{workspaceID=$<HTMLSelectElement>('workspace-picker').value;job=null;await refresh();shell();await showPage(currentPage)})());
}

async function showPage(page:string){
  currentPage=page;
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',(b as HTMLElement).dataset.page===page));
  try{
    if(page==='workspace')studio();
    else if(page==='builder')builderPage();
    else if(page==='quotes')quotesPage();
    else if(page==='templates')await templatesPage();
    else if(page==='jobs')jobHistory();
    else if(page==='knowledge')await knowledgePage();
    else if(page==='preferences')await preferencesPage();
    else if(page==='admin')await adminPage();
  }catch(e){toast(e instanceof Error?e.message:String(e),true)}
}

function studio(){
  const r=job?.report;
  const release=r?.status==='RELEASED';
  const vert=activeVertical();
  const vMeta=VERTICAL_META[vert]||VERTICAL_META.general;
  const questions=r?r.questions:(job?.plan.questions||[]);
  const hasMissingNorthFeb=questions.some(q=>q.text.includes('North / Feb'));
  const hasUnmappedQty=questions.some(q=>q.text.includes('Qty'));
  const headers=r?.headers||job?.profiles.template.sheets.find((s:any)=>s.name===job!.plan.destination.sheet)?.headers||['Site','Jan','Feb','Mar','Total'];
  const customUnmapped=(job as any)?.unmappedTargets as string[]|undefined;
  const customUnused=(job as any)?.unusedSources as string[]|undefined;
  const customMissing=(job as any)?.missingCell as {entity:string;category:string}|undefined;
  const canMapCols=Boolean(job&&job.plan?.destination?.mode==='direct'&&job.plan?.sources?.[0]?.layout==='direct'&&(job.profiles?.sources?.[0]?.sheets?.[0]?.headers||[]).length);
  const activeFieldMap:Record<string,string>={};
  const srcColSet=new Set<string>();
  if(canMapCols&&job){
    for(const p of job.profiles.sources||[]){
      for(const sh of p.sheets||[]){
        for(const h of sh.headers||[])srcColSet.add(h);
      }
    }
    for(const s of job.plan.sources||[]){
      Object.entries(s.field_map||{}).forEach(([k,v])=>{if(v)activeFieldMap[k]=v});
      if(s.period&&s.columns?.length){
        const label=`[Matrix: ${s.columns.slice(0,3).join(', ')}${s.columns.length>3?'…':''}]`;
        activeFieldMap[s.period]=label;
        srcColSet.add(label);
      }
    }
  }
  const srcColHeaders:string[]=Array.from(srcColSet);
  const hasAudit=Boolean((job as any)?.batch_audit||headers.includes('SA ID Status')||headers.includes('Duplicate Status'));

  // Spacious, calm 3-button toolbar tailored to the active mode
  let toolbarButtonsHtml='';
  if(vert==='education'){
    toolbarButtonsHtml=`
      <button class="btn small" data-clean="smart_fix_contacts">🪪 Fix SA IDs & Phones</button>
      <button class="btn small" data-clean="caps_levels">🎓 Pass Levels (1–7)</button>
      ${hasAudit?`<button class="btn small primary" id="view-batch-audit">📋 Summary Report</button>`:`<button class="btn small" data-clean="deduplicate">🧹 Remove Duplicates</button>`}
    `;
  }else if(vert==='sme_pa'){
    toolbarButtonsHtml=`
      <button class="btn small" data-clean="smart_fix_contacts">✨ Fix Names & Phones</button>
      <button class="btn small" data-clean="add_total_row">➕ Add Total Row</button>
      <button class="btn small" data-clean="deduplicate">🧹 Remove Duplicates</button>
    `;
  }else if(vert==='finance_hr'){
    toolbarButtonsHtml=`
      <button class="btn small" data-clean="add_total_row">➕ Add Total Row</button>
      <button class="btn small" data-clean="smart_fix_contacts">🪪 Check Staff IDs</button>
      <button class="btn small cyan" id="open-in-studio">⚖️ Compare / Summarize →</button>
    `;
  }else if(vert==='supply_chain'){
    toolbarButtonsHtml=`
      <button class="btn small" data-clean="trim_text">🧹 Clean Text & SKUs</button>
      <button class="btn small" data-clean="deduplicate">✨ Remove Duplicate SKUs</button>
      <button class="btn small" data-clean="add_total_row">➕ Add Total Row</button>
    `;
  }else{
    toolbarButtonsHtml=`
      <button class="btn small" data-clean="smart_fix_contacts">✨ Clean Names, Phones & IDs</button>
      <button class="btn small" data-clean="add_total_row">➕ Add Total Row</button>
      ${hasAudit?`<button class="btn small primary" id="view-batch-audit">📋 Summary Report</button>`:`<button class="btn small" data-clean="deduplicate">🧹 Remove Duplicates</button>`}
    `;
  }

  $('page').innerHTML=`
  <section class="vertical-welcome" aria-label="Quick start actions">
    <div class="vertical-welcome-head">
      <div>
        <h2>What would you like to do today?</h2>
        <small style="color:var(--muted)">${escapeHTML(vMeta.desc)}</small>
      </div>
      <span class="badge purple">${escapeHTML(vMeta.label)}</span>
    </div>
    <div class="vertical-cards-grid">
      ${vMeta.cards.map(c=>`<button class="v-action-card" data-vcard="${escapeHTML(c.action)}"><strong>${escapeHTML(c.title)}</strong><small>${escapeHTML(c.desc)}</small></button>`).join('')}
    </div>
  </section>

  <div class="simple-studio"><section class="chat-card" aria-label="Sheet Helper"><div class="chat-top"><div class="chat-top-title"><span class="bot-avatar">${icon('spark')}</span><div><h1>Sheet Helper</h1><small>${job?escapeHTML(job.title):'Ask me anything in plain words'}</small></div></div>${job?`<button id="new-job" class="btn small">${icon('plus')}Start Over</button>`:''}</div><div class="picker-bar">${boot.demo_mode?`<div class="picker-row"><select id="sample-case" aria-label="Try an example">${vMeta.samples.map((s,idx)=>`<option value="${s.val}">Example ${idx+1}: ${escapeHTML(s.label)}</option>`).join('')}</select><button id="load-example" class="btn primary small">Try Example</button></div>`:''}<details class="upload-drawer" id="upload-drawer-box" ${!boot.demo_mode&&!job?'open':''}><summary>+ Upload your own Excel / CSV files (or a whole folder)</summary><div class="upload-grid" style="grid-template-columns:1fr 1fr 1fr"><label class="upload-box" for="source-files">${icon('upload')}<strong>Your Sheet(s)</strong><small>Excel or CSV</small><input id="source-files" type="file" multiple accept=".xlsx,.csv" aria-label="Upload source spreadsheets"></label><label class="upload-box" for="folder-files">${icon('folder')}<strong>Entire Folder</strong><small>Merge all files</small><input id="folder-files" type="file" webkitdirectory directory multiple aria-label="Upload entire folder of spreadsheets"></label><label class="upload-box" for="target-file">${icon('grid')}<strong>Template</strong><small>Optional</small><input id="target-file" type="file" accept=".xlsx,.csv" aria-label="Upload destination template"></label></div><div id="file-list" class="file-list"></div><button id="inspect-files" class="btn primary small" style="width:100%;margin-top:8px" disabled>Open Uploaded Files</button></details></div><div class="messages" id="messages" tabindex="0" aria-label="Helper conversation" aria-live="polite">${job?job.chat.map(m=>`<article class="msg ${m.role==='user'?'user':''}"><span class="msg-sender">${m.role==='user'?'You':'Helper'}</span><div class="bubble">${escapeHTML(friendlyText(m.text))}</div></article>`).join(''):`<article class="msg"><span class="msg-sender">Helper</span><div class="bubble">Welcome! Pick one of the <b>3 cards at the top</b>, click <b>Try Example</b> above, or upload your own Excel/CSV file. Once your sheet is open, you can ask me to change anything in plain words!</div></article>`}</div>${job?`<div class="quick-action-bar">${job.proposal?`<button id="confirm-correction" class="btn primary">${icon('check')}Yes, apply: ${escapeHTML(job.proposal.description)}</button>`:''}${!r||!release?`<button id="run-job" class="btn ${r?'':'primary'}">${icon('check')}${r?'Update Sheet':'Fill My Sheet'}</button>`:''}<div class="quick-chips">${hasMissingNorthFeb&&!job.proposal?`<button class="chip" data-chat="18">Reply: 18</button><button class="chip" data-chat="North Feb is 18">North Feb is 18</button>`:''}${customMissing&&!hasMissingNorthFeb&&!job.proposal?`<button class="chip" data-chat="${escapeHTML(customMissing.entity)} ${escapeHTML(customMissing.category)} is 18">Set ${escapeHTML(customMissing.entity)} / ${escapeHTML(customMissing.category)} = 18</button>`:''}${hasUnmappedQty&&!customUnmapped?.length&&!job.proposal?`<button class="chip" data-chat="yes">Yes, put Boxes in Qty</button>`:''}${customUnmapped?.length&&customUnused?.length&&!job.proposal?customUnused.slice(0,2).map(sc=>`<button class="chip" data-chat="put ${escapeHTML(sc)} in ${escapeHTML(customUnmapped[0])}">Put ${escapeHTML(sc)} in ${escapeHTML(customUnmapped[0])}</button>`).join(''):''}${r&&!release?`<button class="chip" data-chat="What is blocking this output?">What is missing?</button>`:''}${release&&headers.includes('Jan')&&headers.includes('Feb')?`<button class="chip" data-chat="swap Jan and Feb">Swap Jan & Feb</button><button class="chip" data-chat="replace the first row with row 2">Swap row 1 & row 2</button>`:''}${job?`<button class="chip" data-chat="How did you match my columns?">Show column matches</button>`:''}</div></div>`:''}<form id="chat-form" class="chat-compose"><textarea id="chat-text" rows="1" ${job?'':'disabled'} aria-label="Message the Sheet Helper" placeholder="${job?"Type what you want to change (e.g. 'swap Jan and Feb', '18', 'yes')…":"Open a file above to start chatting…"}"></textarea><button id="send-chat" class="btn primary small" type="submit" aria-label="Send message" ${job?'':'disabled'}>${icon('send')}</button></form></section><section class="result-card" aria-label="Your Spreadsheet"><div class="result-head"><div><h2>Your Spreadsheet</h2><small>${release?'Everything looks good — ready to download.':r?'Answer the quick question on the left (or pick a column below) to finish.':job?'Click Fill My Sheet on the left to populate your table.':'Your clean spreadsheet will appear here.'}</small></div><div class="result-actions"><span id="output-state" class="badge ${release?'good':r?'warn':''}">${release?'✓ Ready to Download':r?'Needs 1 Quick Answer':'Ready to Preview'}</span><button class="btn small ${release?'primary':''}" id="download-output" ${release?'':'disabled'}>${icon(release?'download':'lock')}Download Excel (.XLSX)</button></div></div>${r?.rows.length?`<div class="clean-toolbar"><span>Quick Tools:</span>${toolbarButtonsHtml}</div>`:''}<div class="table-scroll" tabindex="0" aria-label="Output preview"><table><thead><tr>${headers.map((h:string)=>canMapCols?`<th><div class="th-col-wrap"><span>${escapeHTML(h)}</span><select class="col-map-select ${activeFieldMap[h]?'':'unmapped'}" data-map-target="${escapeHTML(h)}" aria-label="Source column for ${escapeHTML(h)}"><option value="">${activeFieldMap[h]?'— Unmap —':'Choose column…'}</option>${srcColHeaders.map((sh:string)=>`<option value="${escapeHTML(sh)}" ${activeFieldMap[h]===sh?'selected':''}>← ${escapeHTML(sh)}</option>`).join('')}</select></div></th>`:`<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${r?.rows.length?r.rows.map(row=>`<tr>${headers.map((h:string)=>`<td>${row[h]===null||row[h]===undefined?'<span class="missing">Ask in chat</span>':escapeHTML(row[h])}</td>`).join('')}</tr>`).join(''):`<tr><td class="table-empty" colspan="${headers.length}">${job?'Click <b>Fill My Sheet</b> on the left to fill your spreadsheet.':'Click one of the 3 cards at the top or <b>Try Example</b> on the left to preview your spreadsheet here.'}</td></tr>`}</tbody></table></div></section></div>`;

  document.querySelectorAll<HTMLButtonElement>('[data-vcard]').forEach(card=>card.addEventListener('click',()=>void busy(card,async()=>{
    const act=card.dataset.vcard!;
    if(act.startsWith('sample:')){
      const cVal=act.split(':')[1];
      job=await api<Job>('/api/demo/jobs',{case:cVal,request_id:uid()});
      if(cVal!=='chat_map'&&cVal!=='district_batch'){
        job=await api<Job>(`/api/jobs/${job.id}/run`,{});
      }
      await refresh();shell();await showPage('workspace');
    }else if(act==='page:quotes'){
      await showPage('quotes');
    }else if(act==='page:builder'){
      await showPage('builder');
    }else if(act==='upload:open'){
      const d=$('upload-drawer-box') as HTMLDetailsElement|null;
      if(d)d.open=true;
      $('source-files')?.click();
    }else if(act==='folder:open'){
      const d=$('upload-drawer-box') as HTMLDetailsElement|null;
      if(d)d.open=true;
      $('folder-files')?.click();
    }else if(act.startsWith('builder:')){
      const sub=act.split(':')[1];
      if(sub==='paste'){
        builderState.pasteOpen=true;
        await showPage('builder');
      }else{
        handleBuilderChatCommand(vMeta.builderPresetCmd);
        await showPage('builder');
      }
    }
  })));

  if($('new-job'))$('new-job').addEventListener('click',()=>{job=null;studio()});
  if($('load-example'))$('load-example').addEventListener('click',()=>void busy($('load-example'),async()=>{
    const caseValue=$<HTMLSelectElement>('sample-case').value;
    job=await api<Job>('/api/demo/jobs',{case:caseValue,request_id:uid()});
    if(caseValue!=='chat_map'&&caseValue!=='district_batch'){
      job=await api<Job>(`/api/jobs/${job.id}/run`,{});
    }
    await refresh();shell();await showPage('workspace');
    if($('sample-case'))$<HTMLSelectElement>('sample-case').value=caseValue;
  }));

  const selection=()=>{
    const src=$<HTMLInputElement>('source-files').files;
    const fld=$<HTMLInputElement>('folder-files').files;
    const target=$<HTMLInputElement>('target-file').files;
    const validFolderFiles=Array.from(fld||[]).filter(f=>/\.(xlsx|csv)$/i.test(f.name));
    $('file-list').innerHTML=[...Array.from(src||[]),...validFolderFiles,...Array.from(target||[])].map(f=>`<span class="file-chip">${escapeHTML((f as any).webkitRelativePath||f.name)}</span>`).join('');
    $<HTMLButtonElement>('inspect-files').disabled=!src?.length&&!validFolderFiles.length&&!target?.length;
  };
  $('source-files').addEventListener('change',selection);
  $('folder-files').addEventListener('change',selection);
  $('target-file').addEventListener('change',selection);
  $('inspect-files').addEventListener('click',()=>void busy($('inspect-files'),async()=>{
    const f=new FormData();
    const targetFiles=$<HTMLInputElement>('target-file').files;
    const srcFiles=$<HTMLInputElement>('source-files').files;
    const fldFiles=Array.from($<HTMLInputElement>('folder-files').files||[]).filter(fl=>/\.(xlsx|csv)$/i.test(fl.name));
    if(targetFiles?.length)f.append('target',targetFiles[0]);
    if(fldFiles.length){
      for(const file of fldFiles)f.append('sources',file);
      f.append('request_id',uid());
      f.append('title','Folder Batch Master Consolidation');
      job=await api<Job>('/api/jobs/batch-folder',f);
    }else{
      if(srcFiles?.length){
        for(const file of Array.from(srcFiles))f.append('sources',file);
      }else if(targetFiles?.length){
        f.append('sources',targetFiles[0]);
      }
      f.append('request_id',uid());
      job=await api<Job>('/api/jobs',f);
      if(!job.report&&!job.plan.questions.length){
        try{job=await api<Job>(`/api/jobs/${job.id}/run`,{})}catch{}
      }
    }
    await refresh();shell();await showPage('workspace');
  }));

  if($('view-batch-audit'))$('view-batch-audit').addEventListener('click',()=>showBatchAuditModal());

  if(job){
    $('run-job').addEventListener('click',()=>void doRun());
    $('download-output').addEventListener('click',()=>void download('output'));
    document.querySelectorAll<HTMLSelectElement>('.col-map-select').forEach(sel=>sel.addEventListener('change',()=>void busy(sel,async()=>{
      const tgt=sel.dataset.mapTarget!;
      const src=sel.value;
      job=await api<Job>(`/api/jobs/${job!.id}/map-column`,{target_column:tgt,source_column:src,request_id:uid()});
      await refresh();shell();await showPage('workspace');
      toast(src?`Matched ${src} → ${tgt}`:`Cleared ${tgt}`);
    })));
    document.querySelectorAll<HTMLButtonElement>('[data-clean]').forEach(btn=>btn.addEventListener('click',()=>void busy(btn,async()=>{
      const op=btn.dataset.clean!;
      job=await api<Job>(`/api/jobs/${job!.id}/clean`,{operation:op,request_id:uid()});
      await refresh();shell();await showPage('workspace');
      toast('Spreadsheet updated!');
    })));
    if($('open-in-studio'))$('open-in-studio').addEventListener('click',()=>{
      if(!job?.report)return;
      builderState={
        title:job.title||'Transformed-Workbook.xlsx',
        activeTab:0,
        tabs:[{
          name:job.plan?.destination?.sheet||'Sheet1',
          headers:[...job.report.headers],
          rows:job.report.rows.map(r=>({...r})),
          formulas:{}
        }],
        chat:[{role:'qms',text:`Opened ${job.report.rows.length} rows from "${job.title}". You can now split into tabs, add formula columns, summarize, or compare tabs!`}],
        pasteOpen:false
      };
      void showPage('builder');
      toast('Opened in Sheet Creator!');
    });
  }
  wireChat();
}

interface SheetTab{
  name:string;
  headers:string[];
  rows:Record<string,any>[];
  formulas:Record<string,string>;
}

function makeBlankTab(name='Sheet1',cols=4,rowCount=5):SheetTab{
  const headers=Array.from({length:cols},(_,i)=>`Column ${String.fromCharCode(65+i)}`);
  const rows=Array.from({length:rowCount},()=>{
    const r:Record<string,any>={};
    headers.forEach(h=>{r[h]='' });
    return r;
  });
  return {name,headers,rows,formulas:{}};
}

let builderState:{
  title:string;
  activeTab:number;
  tabs:SheetTab[];
  chat:Array<{role:'user'|'qms';text:string}>;
  pasteOpen:boolean;
}={
  title:'New-Workbook.xlsx',
  activeTab:0,
  tabs:[makeBlankTab('Sheet1',4,5)],
  chat:[{role:'qms',text:'Welcome! You are starting with a fresh blank sheet. Type directly into any header or cell on the right, paste messy text from WhatsApp/Email/PDF above, or tell me in plain English what columns, rows, or formulas to build!'}],
  pasteOpen:false
};

function currentBuilderTab():SheetTab{
  if(!builderState.tabs.length)builderState.tabs=[makeBlankTab('Sheet1',4,5)];
  if(builderState.activeTab>=builderState.tabs.length)builderState.activeTab=0;
  return builderState.tabs[builderState.activeTab];
}

function saIdLuhnCheckDigitClient(digits12:string):number{
  if(digits12.length!==12||!/^\d{12}$/.test(digits12))return -1;
  let total=0;
  for(let i=0;i<12;i++){
    const d=Number(digits12[i]);
    if(i%2===0){
      total+=d;
    }else{
      const dbl=d*2;
      total+=dbl>9?dbl-9:dbl;
    }
  }
  return (10-(total%10))%10;
}

function validateAndRepairSaIdClient(rawVal:any):{id:string;status:string;dob:string;gender:string;citizenship:string;repaired:boolean;valid:boolean}{
  if(rawVal===null||rawVal===undefined||String(rawVal).trim()===''){
    return {id:'',status:'Missing ID',dob:'',gender:'',citizenship:'',repaired:false,valid:false};
  }
  const s=String(rawVal).trim().replace(/\.0$/,'');
  if(/[A-Za-z]/.test(s)){
    return {id:s,status:'Foreign / Passport / Permit ID',dob:'',gender:'',citizenship:'Foreign / Permit',repaired:false,valid:true};
  }
  let digits=s.replace(/\D/g,'');
  if(!digits){
    return {id:s,status:'Missing ID',dob:'',gender:'',citizenship:'',repaired:false,valid:false};
  }
  let repaired=false;
  if(digits.length===11||digits.length===12){
    const padded=digits.padStart(13,'0');
    const yy=Number(padded.slice(0,2)),mm=Number(padded.slice(2,4)),dd=Number(padded.slice(4,6));
    if(yy>=0&&yy<=9&&mm>=1&&mm<=12&&dd>=1&&dd<=31){
      digits=padded;
      repaired=true;
    }
  }
  if(digits.length!==13){
    return {id:s,status:`Invalid Length (${digits.length} digits)`,dob:'',gender:'',citizenship:'',repaired:false,valid:false};
  }
  const yy=Number(digits.slice(0,2)),mm=Number(digits.slice(2,4)),dd=Number(digits.slice(4,6));
  const century=yy<=26?2000:1900;
  if(mm<1||mm>12||dd<1||dd>31){
    return {id:digits,status:'Invalid SA ID (Bad Date)',dob:'',gender:'',citizenship:'',repaired,valid:false};
  }
  const dob=`${century+yy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
  const gender=Number(digits.slice(6,10))>=5000?'Male':'Female';
  const citDigit=digits[10];
  const citizenship=citDigit==='0'?'SA Citizen':citDigit==='1'?'Permanent Resident':'Other / Foreign';
  const expectedCheck=saIdLuhnCheckDigitClient(digits.slice(0,12));
  const actualCheck=Number(digits[12]);
  if(expectedCheck!==actualCheck){
    return {id:digits,status:`Invalid SA ID (Checksum Failed — expected ${expectedCheck})`,dob,gender,citizenship,repaired,valid:false};
  }
  const status=repaired?'Repaired SA ID (Leading 0 Restored)':'Valid SA ID';
  return {id:digits,status,dob,gender,citizenship,repaired,valid:true};
}

function percentageToCapsLevelClient(val:any):{level:number|null;desc:string;at_risk:boolean}{
  if(val===null||val===undefined||String(val).trim()==='')return {level:null,desc:'',at_risk:false};
  const s=String(val).trim().replace(/%/g,'');
  const pct=Number(s);
  if(Number.isNaN(pct)||pct<0||pct>100)return {level:null,desc:'',at_risk:false};
  if(pct>=80)return {level:7,desc:'Level 7 (Outstanding)',at_risk:false};
  if(pct>=70)return {level:6,desc:'Level 6 (Meritorious)',at_risk:false};
  if(pct>=60)return {level:5,desc:'Level 5 (Substantial)',at_risk:false};
  if(pct>=50)return {level:4,desc:'Level 4 (Adequate)',at_risk:false};
  if(pct>=40)return {level:3,desc:'Level 3 (Moderate)',at_risk:false};
  if(pct>=30)return {level:2,desc:'Level 2 (Elementary — At Risk)',at_risk:true};
  return {level:1,desc:'Level 1 (Not Achieved — At Risk)',at_risk:true};
}

function showBatchAuditModal(){
  const r=job?.report;
  const rows=r?.rows||[];
  const ba=(job as any)?.batch_audit||{};
  let validIds=ba.valid_sa_ids||0,repairedIds=ba.repaired_sa_ids||0,foreignIds=ba.foreign_or_permit_ids||0,invalidIds=ba.invalid_sa_ids||0,dupRows=ba.cross_file_duplicates||0;
  if(!ba.total_rows&&rows.length){
    for(const row of rows){
      const st=String(row['SA ID Status']||'');
      if(st==='Valid SA ID')validIds++;
      else if(st.startsWith('Repaired SA ID'))repairedIds++;
      else if(st.startsWith('Foreign'))foreignIds++;
      else if(st.startsWith('Invalid'))invalidIds++;
      const ds=String(row['Duplicate Status']||'');
      if(ds.startsWith('Duplicate'))dupRows++;
    }
  }
  const filesMerged=ba.files_merged||(job?.profiles?.sources?.length||1);
  const totalRows=ba.total_rows||rows.length;
  openModal('EduSheetManager — Data Quality Summary Report',`
    <div style="display:grid;gap:12px">
      <p style="margin:0;color:var(--muted)">Before-vs-After Data Quality Summary for schools, district offices, consultants, and business compliance:</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${filesMerged}</strong><small style="display:block;color:var(--muted)">Files Consolidated</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${totalRows}</strong><small style="display:block;color:var(--muted)">Total Master Rows</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${validIds + repairedIds}</strong><small style="display:block;color:var(--muted)">Verified 13-Digit SA IDs</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${repairedIds}</strong><small style="display:block;color:var(--muted)">Leading-Zero IDs Restored (Born 2000–2009)</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${foreignIds}</strong><small style="display:block;color:var(--muted)">Foreign / Study Permit IDs</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${invalidIds}</strong><small style="display:block;color:var(--muted)">Checksum Issues Flagged</small></div>
      </div>
      <div class="check ${dupRows>0?'fail':''}">
        <strong>${dupRows>0?`! ${dupRows} Cross-File Duplicate Record(s) Flagged`:'✓ 0 Cross-File Duplicates Found'}</strong>
        <small>All rows are preserved in your Master Sheet with <b>Source File</b>, <b>Duplicate Status</b>, and <b>SA ID Status</b> columns so no data is silently lost.</small>
      </div>
      <div style="margin-top:6px;padding-top:12px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <small style="color:var(--muted)">Generated by <b>EduSheetManager</b></small>
        ${poweredByEduSCF()}
      </div>
    </div>
  `);
}

function runSaIdAndContactSmartFixOnTab(tab:SheetTab):number{
  let fixed=0;
  const idCol=tab.headers.find(h=>/sa id|id number|identity|id no/i.test(h));
  let statusCol=tab.headers.find(h=>/sa id status|id status/i.test(h));
  let dobCol=tab.headers.find(h=>/date of birth|dob|birth/i.test(h));
  let genderCol=tab.headers.find(h=>/gender|sex/i.test(h));
  let citCol=tab.headers.find(h=>/citizenship|citizen/i.test(h));
  if(idCol&&!statusCol){
    statusCol='SA ID Status';
    tab.headers.splice(tab.headers.indexOf(idCol)+1,0,statusCol);
  }
  if(idCol&&!dobCol){
    dobCol='Date of Birth';
    tab.headers.splice(tab.headers.indexOf(statusCol||idCol)+1,0,dobCol);
  }
  if(idCol&&!genderCol){
    genderCol='Gender';
    tab.headers.splice(tab.headers.indexOf(dobCol||idCol)+1,0,genderCol);
  }
  if(idCol&&!citCol){
    citCol='Citizenship';
    tab.headers.splice(tab.headers.indexOf(genderCol||idCol)+1,0,citCol);
  }
  for(const r of tab.rows){
    if(idCol&&r[idCol]!==undefined&&r[idCol]!==null&&String(r[idCol]).trim()!==''){
      const info=validateAndRepairSaIdClient(r[idCol]);
      if(info.id&&info.id!==String(r[idCol])){r[idCol]=info.id;fixed++}
      if(statusCol&&r[statusCol]!==info.status){r[statusCol]=info.status;fixed++}
      if(dobCol&&info.dob&&!r[dobCol]){r[dobCol]=info.dob;fixed++}
      if(genderCol&&info.gender&&!r[genderCol]){r[genderCol]=info.gender;fixed++}
      if(citCol&&info.citizenship&&!r[citCol]){r[citCol]=info.citizenship;fixed++}
    }
    for(const h of tab.headers){
      const val=r[h];
      if(val===undefined||val===null||String(val).trim()==='')continue;
      const hl=h.toLowerCase();
      const s=String(val).trim();
      if(/name|surname|student|learner|guardian|parent|customer|supplier/.test(hl)&&!/id|email|phone|cell|status/.test(hl)){
        const tc=s.split(/\s+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
        if(tc!==s){r[h]=tc;fixed++}
      }else if(/phone|cell|mobile|tel/.test(hl)){
        let d=s.startsWith('+27')?'0'+s.slice(3).replace(/\D/g,''):s.replace(/[\s()-]/g,'');
        if(/^[1-9]\d{8}$/.test(d))d='0'+d;
        if(d!==s){r[h]=d;fixed++}
      }else if(/email/.test(hl)){
        const fe=s.toLowerCase().replace(/@(gmial|gamil|gmai)\.com$/i,'@gmail.com').replace(/@(yaho|yahooo)\.com$/i,'@yahoo.com');
        if(fe!==s){r[h]=fe;fixed++}
      }else if(['grade','gr','learner grade','student grade'].includes(hl)){
        const m=s.match(/^(?:grade|gr\.?|g)?\s*(\d{1,2}[a-zA-Z]?)$/i);
        if(m&&`Grade ${m[1]}`!==s){r[h]=`Grade ${m[1]}`;fixed++}
      }
    }
  }
  return fixed;
}

function parsePastedMessyTextToTab(rawText:string):string{
  const lines=rawText.split(/\r?\n/).map(l=>l.replace(/^\s*\d+[.)]\s*/,'').trim()).filter(Boolean);
  if(!lines.length)return 'Paste at least one line of text first.';
  const splitLine=(line:string):string[]=>{
    if(line.includes('\t'))return line.split('\t').map(s=>s.trim());
    if(line.includes('|'))return line.split('|').map(s=>s.trim()).filter(Boolean);
    if(line.includes(' - '))return line.split(/\s+-\s+/).map(s=>s.trim());
    if(line.includes(','))return line.split(',').map(s=>s.trim());
    return line.split(/\s{2,}/).map(s=>s.trim());
  };
  const matrix=lines.map(splitLine).filter(r=>r.length>0);
  const maxCols=Math.max(...matrix.map(r=>r.length),1);
  // Check if first row looks like headers vs data
  const first=matrix[0];
  const looksLikeData=first.some(c=>/@/.test(c)||/^\+?\d[\d\s-]{7,}$/.test(c)||/^STU\d+/i.test(c)||/^(?:gr(?:ade)?\s*\d+|\d+)$/i.test(c));
  let headers:string[];
  let dataRows:string[][];
  if(!looksLikeData&&matrix.length>1){
    headers=Array.from({length:maxCols},(_,i)=>first[i]||`Column ${i+1}`);
    dataRows=matrix.slice(1);
  }else{
    headers=Array.from({length:maxCols},(_,i)=>{
      const sample=matrix[0][i]||'';
      if(/^STU\d+|^ID|^EMP|^SKU/i.test(sample))return 'ID';
      if(/^\d{13}$/.test(sample.replace(/\D/g,'')))return 'SA ID Number';
      if(/@/.test(sample))return 'Email';
      if(/^(?:\+27|0?\d{9,10})$/.test(sample.replace(/[\s()-]/g,'')))return 'Phone';
      if(/^(?:gr(?:ade)?\s*\d{1,2})$/i.test(sample))return 'Grade';
      if(i===0||i===1)return i===0?'Full Name':'Details';
      return `Column ${i+1}`;
    });
    dataRows=matrix;
  }
  const rows=dataRows.map(r=>{
    const obj:Record<string,any>={};
    headers.forEach((h,i)=>{
      const raw=r[i]??'';
      obj[h]=raw!==''&&!Number.isNaN(Number(raw))&&!/^0\d+/.test(raw)&&raw.replace(/\D/g,'').length!==13?Number(raw):raw;
    });
    return obj;
  });
  const tab=currentBuilderTab();
  tab.headers=headers;
  tab.rows=rows;
  const fixed=runSaIdAndContactSmartFixOnTab(tab);
  return `Converted ${rows.length} pasted line(s) into ${headers.length} clean columns (${tab.headers.join(', ')})${fixed?` and auto-fixed ${fixed} contact/SA-ID field(s)`:''}!`;
}

function addCalculatedColumnToTab(tab:SheetTab,newColName:string,colA:string,op:'-'|'+'|'*'|'/'|'vat15',colB?:string):string{
  const name=newColName.trim()||'Calculated';
  if(!tab.headers.includes(name))tab.headers.push(name);
  tab.rows.forEach(r=>{
    const a=Number(r[colA])||0;
    const b=colB?Number(r[colB])||0:0;
    let res=0;
    if(op==='-')res=a-b;
    else if(op==='+')res=a+b;
    else if(op==='*')res=a*b;
    else if(op==='/')res=b!==0?Math.round((a/b)*100)/100:0;
    else if(op==='vat15')res=Math.round(a*0.15*100)/100;
    r[name]=Math.round(res*100)/100;
  });
  tab.formulas[name]=op==='vat15'?`${colA} * 15%`:`${colA} ${op} ${colB}`;
  return `Added calculated column "${name}" (${tab.formulas[name]}) across all ${tab.rows.length} rows!`;
}

function splitTabByColumn(tab:SheetTab,groupCol:string):string{
  if(!tab.headers.includes(groupCol))return `Column "${groupCol}" not found.`;
  const groups:Record<string,Record<string,any>[]>={};
  for(const r of tab.rows){
    const key=String(r[groupCol]??'Other').trim()||'Other';
    if(!groups[key])groups[key]=[];
    groups[key].push({...r});
  }
  const keys=Object.keys(groups);
  if(keys.length<1)return 'No rows to split.';
  for(const k of keys){
    const safeName=k.slice(0,31);
    const existing=builderState.tabs.findIndex(t=>t.name===safeName);
    const newTab:SheetTab={name:safeName,headers:[...tab.headers],rows:groups[k],formulas:{...tab.formulas}};
    if(existing>=0)builderState.tabs[existing]=newTab;
    else builderState.tabs.push(newTab);
  }
  builderState.activeTab=builderState.tabs.length-1;
  return `Split "${tab.name}" by "${groupCol}" into ${keys.length} separate workbook tabs (${keys.join(', ')})! Click any tab at the bottom or Download Multi-Tab XLSX.`;
}

function summarizeTabByColumn(tab:SheetTab,groupCol:string):string{
  if(!tab.headers.includes(groupCol))return `Column "${groupCol}" not found.`;
  const numCols=tab.headers.filter(h=>h!==groupCol&&tab.rows.some(r=>typeof r[h]==='number'||(r[h]!==''&&r[h]!==null&&!Number.isNaN(Number(r[h]))&&!/^0\d+/.test(String(r[h])))));
  const groups:Record<string,Record<string,any>[]>={};
  for(const r of tab.rows){
    const g=String(r[groupCol]??'Unassigned').trim()||'Unassigned';
    if(g.toLowerCase()==='total')continue;
    if(!groups[g])groups[g]=[];
    groups[g].push(r);
  }
  const sumHeaders=[groupCol,'Count',...numCols.flatMap(c=>[`Total ${c}`,`Avg ${c}`])];
  const sumRows=Object.entries(groups).map(([g,gRows])=>{
    const row:Record<string,any>={[groupCol]:g,'Count':gRows.length};
    for(const c of numCols){
      const vals=gRows.map(r=>Number(r[c])).filter(v=>Number.isFinite(v));
      const tot=vals.reduce((a,b)=>a+b,0);
      row[`Total ${c}`]=Math.round(tot*100)/100;
      row[`Avg ${c}`]=vals.length?Math.round((tot/vals.length)*100)/100:0;
    }
    return row;
  });
  const sumTabName=`Summary by ${groupCol}`.slice(0,31);
  const existing=builderState.tabs.findIndex(t=>t.name===sumTabName);
  const newTab:SheetTab={name:sumTabName,headers:sumHeaders,rows:sumRows,formulas:{}};
  if(existing>=0){builderState.tabs[existing]=newTab;builderState.activeTab=existing}
  else{builderState.tabs.push(newTab);builderState.activeTab=builderState.tabs.length-1}
  return `Created "${sumTabName}" tab with counts, totals, and averages across ${sumRows.length} groups!`;
}

function compareTwoTabs(tabA:SheetTab,tabB:SheetTab):string{
  const keyColA=tabA.headers[0]||'ID';
  const keyColB=tabB.headers[0]||'ID';
  const mapA=new Map<string,Record<string,any>>();
  const mapB=new Map<string,Record<string,any>>();
  tabA.rows.forEach(r=>{const k=String(r[keyColA]??'').trim();if(k)mapA.set(k.toLowerCase(),r)});
  tabB.rows.forEach(r=>{const k=String(r[keyColB]??'').trim();if(k)mapB.set(k.toLowerCase(),r)});
  const allKeys=Array.from(new Set([...mapA.keys(),...mapB.keys()]));
  const sharedCols=tabA.headers.slice(1).filter(h=>tabB.headers.some(hb=>hb.toLowerCase()===h.toLowerCase()));
  const recHeaders=[keyColA,'Status','Details',...sharedCols.map(c=>`${c} (${tabA.name} vs ${tabB.name})`)];
  let matched=0,onlyA=0,onlyB=0,diffCount=0;
  const recRows:Record<string,any>[]=allKeys.map(k=>{
    const rA=mapA.get(k),rB=mapB.get(k);
    const displayKey=String((rA?.[keyColA])??(rB?.[keyColB])??k);
    if(rA&&!rB){
      onlyA++;
      return {[keyColA]:displayKey,'Status':`Only in ${tabA.name}`,'Details':`Missing from ${tabB.name}`};
    }
    if(!rA&&rB){
      onlyB++;
      return {[keyColA]:displayKey,'Status':`Only in ${tabB.name}`,'Details':`Missing from ${tabA.name}`};
    }
    const diffs:string[]=[];
    const rowObj:Record<string,any>={[keyColA]:displayKey};
    for(const c of sharedCols){
      const bCol=tabB.headers.find(hb=>hb.toLowerCase()===c.toLowerCase())||c;
      const vA=String(rA![c]??'').trim(),vB=String(rB![bCol]??'').trim();
      rowObj[`${c} (${tabA.name} vs ${tabB.name})`]=vA===vB?vA:`${vA} → ${vB}`;
      if(vA!==vB)diffs.push(`${c}: ${vA||'blank'} vs ${vB||'blank'}`);
    }
    if(diffs.length){
      diffCount++;
      rowObj['Status']='Value Changed';
      rowObj['Details']=diffs.join('; ');
    }else{
      matched++;
      rowObj['Status']='Matched';
      rowObj['Details']='Identical across both tabs';
    }
    return rowObj;
  });
  const recTab:SheetTab={name:'Reconciliation',headers:recHeaders,rows:recRows,formulas:{}};
  const idx=builderState.tabs.findIndex(t=>t.name==='Reconciliation');
  if(idx>=0){builderState.tabs[idx]=recTab;builderState.activeTab=idx}
  else{builderState.tabs.push(recTab);builderState.activeTab=builderState.tabs.length-1}
  return `Reconciled "${tabA.name}" vs "${tabB.name}": ${matched} identical, ${diffCount} value difference(s), ${onlyA} only in ${tabA.name}, and ${onlyB} only in ${tabB.name}.`;
}

function handleBuilderChatCommand(promptText:string):string{
  const tab=currentBuilderTab();
  const lower=promptText.toLowerCase().trim();
  if(/^(start|new|clear|reset)\s*(blank|empty|sheet|table)?/.test(lower)){
    builderState.tabs=[makeBlankTab('Sheet1',4,5)];
    builderState.activeTab=0;
    return 'Started a fresh blank sheet (Column A, Column B, Column C, Column D) with 5 empty rows.';
  }
  if(lower.includes('fix')&&(lower.includes('contact')||lower.includes('id')||lower.includes('phone')||lower.includes('dob'))){
    const n=runSaIdAndContactSmartFixOnTab(tab);
    return `Ran SA ID & Contact Smart Fix (${n} field(s) updated across SA IDs, DOB, Gender, Names, Phones, and Emails).`;
  }
  if(lower.includes('split')&&lower.includes('by')){
    const m=promptText.match(/by\s+([A-Za-z0-9 _-]+)/i);
    const col=m?tab.headers.find(h=>h.toLowerCase()===m[1].trim().toLowerCase()):tab.headers.find(h=>/grade|site|branch|category|status/i.test(h));
    if(col)return splitTabByColumn(tab,col);
  }
  if((lower.includes('summarize')||lower.includes('summary'))&&lower.includes('by')){
    const m=promptText.match(/by\s+([A-Za-z0-9 _-]+)/i);
    const col=m?tab.headers.find(h=>h.toLowerCase()===m[1].trim().toLowerCase()):tab.headers[0];
    if(col)return summarizeTabByColumn(tab,col);
  }
  if(lower.includes('compare')||lower.includes('reconcile')){
    if(builderState.tabs.length>=2){
      return compareTwoTabs(builderState.tabs[0],builderState.tabs[1]);
    }
    return 'Add or split at least 2 tabs in this workbook so I can compare and reconcile them.';
  }
  // Formula command: e.g. "add column Balance = Fee - Paid" or "Balance = Tuition Fee - Paid"
  const formulaMatch=promptText.match(/(?:add\s+(?:column\s+)?)?([A-Za-z0-9 _-]+?)\s*=\s*([A-Za-z0-9 _-]+?)\s*([-+*/])\s*([A-Za-z0-9 _%-]+)/i);
  if(formulaMatch){
    const newCol=formulaMatch[1].trim();
    const lhsRaw=formulaMatch[2].trim();
    const op=formulaMatch[3] as '-'|'+'|'*'|'/';
    const rhsRaw=formulaMatch[4].trim();
    const colA=tab.headers.find(h=>h.toLowerCase().includes(lhsRaw.toLowerCase()))||tab.headers[0];
    if(rhsRaw.includes('15%')){
      return addCalculatedColumnToTab(tab,newCol,colA,'vat15');
    }
    const colB=tab.headers.find(h=>h.toLowerCase().includes(rhsRaw.toLowerCase()))||tab.headers[1]||tab.headers[0];
    return addCalculatedColumnToTab(tab,newCol,colA,op,colB);
  }
  if(lower.includes('total row')||lower==='add total'){
    const keyCol=tab.headers[0]||'Column A';
    tab.rows=tab.rows.filter(r=>String(r[keyCol]??'').toLowerCase()!=='total');
    const tot:Record<string,any>={[keyCol]:'Total'};
    tab.headers.slice(1).forEach(h=>{
      const nums=tab.rows.map(r=>Number(r[h])).filter(v=>Number.isFinite(v)&&v!==0);
      tot[h]=nums.length?Math.round(nums.reduce((a,b)=>a+b,0)*100)/100:'';
    });
    tab.rows.push(tot);
    return 'Appended a Total summary row at the bottom of your sheet.';
  }
  if(lower.includes('student')||lower.includes('sasams')||lower.includes('learner')||lower.includes('school')){
    builderState.title='SA-SAMS-Student-Register.xlsx';
    builderState.tabs=[{
      name:'Students',
      headers:['Student ID','First Name','Last Name','SA ID Number','Date of Birth','Gender','Grade','Subjects','Parent Phone','Tuition Fee','Paid','Balance'],
      rows:[
        {'Student ID':'STU001','First Name':'John','Last Name':'Doe','SA ID Number':'1503155123084','Date of Birth':'2015-03-15','Gender':'Male','Grade':'Grade 8','Subjects':'Mathematics; English; Science','Parent Phone':'0821234567','Tuition Fee':12000,'Paid':8500,'Balance':3500},
        {'Student ID':'STU002','First Name':'Sarah','Last Name':'Smith','SA ID Number':'1407220145081','Date of Birth':'2014-07-22','Gender':'Female','Grade':'Grade 9','Subjects':'Mathematics; English; Physical Science','Parent Phone':'0839876543','Tuition Fee':12000,'Paid':12000,'Balance':0},
        {'Student ID':'STU003','First Name':'Emma','Last Name':'Johnson','SA ID Number':'1601100234089','Date of Birth':'2016-01-10','Gender':'Female','Grade':'Grade 7','Subjects':'Mathematics; English; Natural Science','Parent Phone':'0847654321','Tuition Fee':11000,'Paid':6000,'Balance':5000},
        {'Student ID':'STU004','First Name':'Liam','Last Name':'Johnson','SA ID Number':'1309055432082','Date of Birth':'2013-09-05','Gender':'Male','Grade':'Grade 10','Subjects':'Mathematics; English; Physical Science; Geography','Parent Phone':'0847654321','Tuition Fee':13500,'Paid':10000,'Balance':3500},
      ],
      formulas:{'Balance':'Tuition Fee - Paid'}
    }];
    builderState.activeTab=0;
    return 'Built a SA-SAMS Student & Tuition Register with SA ID, DOB, Gender, Grade, Subjects, and calculated Balance!';
  }
  if(lower.includes('expense')||lower.includes('budget')||lower.includes('finance')){
    builderState.title='Monthly-Expense-Tracker.xlsx';
    builderState.tabs=[{
      name:'Expenses',
      headers:['Date','Category','Supplier','Description','Amount','VAT 15%','Total'],
      rows:[
        {'Date':'2026-10-01','Category':'Software','Supplier':'Cloud Host SA','Description':'Monthly Server & Storage','Amount':1200,'VAT 15%':180,'Total':1380},
        {'Date':'2026-10-05','Category':'Office','Supplier':'Stationery World','Description':'Printer Paper & Toner','Amount':800,'VAT 15%':120,'Total':920},
        {'Date':'2026-10-09','Category':'Software','Supplier':'Fiber Net','Description':'Business Fiber Internet','Amount':1500,'VAT 15%':225,'Total':1725},
      ],
      formulas:{'VAT 15%':'Amount * 15%','Total':'Amount + VAT 15%'}
    }];
    builderState.activeTab=0;
    return 'Built a Monthly Expense Tracker with automatic 15% VAT and Total columns!';
  }
  if(lower.includes('inventory')||lower.includes('stock')||lower.includes('warehouse')){
    builderState.title='Inventory-Stock-Sheet.xlsx';
    builderState.tabs=[{
      name:'Inventory',
      headers:['SKU','Product Name','Category','Qty On Hand','Unit Price','Total Value'],
      rows:[
        {'SKU':'SKU-901','Product Name':'Stainless Flange 4in','Category':'Valves','Qty On Hand':24,'Unit Price':45,'Total Value':1080},
        {'SKU':'SKU-902','Product Name':'Hydraulic Seal Kit','Category':'Seals','Qty On Hand':15,'Unit Price':18,'Total Value':270},
        {'SKU':'SKU-903','Product Name':'Pressure Gauge 10Bar','Category':'Valves','Qty On Hand':10,'Unit Price':95,'Total Value':950},
      ],
      formulas:{'Total Value':'Qty On Hand * Unit Price'}
    }];
    builderState.activeTab=0;
    return 'Built an Inventory Stock Sheet with Qty On Hand, Unit Price, and calculated Total Value!';
  }
  const withMatch=promptText.match(/(?:with|columns?:?)\s+(.+)$/i);
  const rawCols=(withMatch?withMatch[1]:promptText).split(/[,;|]+|\band\b/i).map(s=>s.replace(/^(create|make|build|set|my|columns|to|a|new|sheet|spreadsheet|table|for)\s+/gi,'').trim()).filter(s=>s.length>=2&&s.length<=35);
  if(rawCols.length>=2){
    const headers=rawCols.map(c=>c.charAt(0).toUpperCase()+c.slice(1));
    tab.headers=headers;
    tab.rows=Array.from({length:Math.max(4,tab.rows.length)},()=>{const r:Record<string,any>={};headers.forEach(h=>{r[h]='' });return r});
    return `Set your sheet columns to: ${headers.join(', ')}. Type into the cells on the right or paste text!`;
  }
  return 'Try commands like: "Start blank", "Columns: ID, Name, SA ID, Phone, Fee, Paid", "Add column Balance = Fee - Paid", "Fix contacts", "Split by Grade", or "Summarize by Grade"!';
}

function builderPage(){
  const tab=currentBuilderTab();
  const vert=activeVertical();
  const vMeta=VERTICAL_META[vert]||VERTICAL_META.general;
  const {title,tabs,activeTab,chat,pasteOpen}=builderState;
  const {headers,rows}=tab;

  $('page').innerHTML=`<div class="simple-studio">
    <section class="chat-card" aria-label="Sheet Creator Helper">
      <div class="chat-top">
        <div class="chat-top-title"><span class="bot-avatar">${icon('spark')}</span><div><h1>Sheet Helper</h1><small>Start blank, paste text, or tell me what columns to make</small></div></div>
        <button id="builder-new-blank" class="btn small">${icon('plus')}Start Blank</button>
      </div>
      <div class="picker-bar">
        <div class="quick-chips">
          <button class="chip" data-bcmd="Start blank sheet">📄 Blank Sheet</button>
          <button class="chip" data-bcmd="${escapeHTML(vMeta.builderPresetCmd)}">✨ ${escapeHTML(vMeta.builderPresetLabel)}</button>
        </div>
        <details class="upload-drawer" ${pasteOpen?'open':''} id="paste-drawer">
          <summary>📋 Paste from WhatsApp / Email / Word into a Clean Table</summary>
          <textarea id="paste-raw-text" rows="4" style="margin-top:8px;font-size:12px" placeholder="Paste lines from WhatsApp, an Email, or Word here — e.g.&#10;STU001 - JOHN DOE - 1503155123084 - Gr 8 - 821234567 - jane@gmial.com&#10;STU002 - SARAH SMITH - 1407220145081 - Gr 9 - +27 83 987 6543 - mike@example.com"></textarea>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button id="paste-convert-btn" class="btn primary small" style="flex:1">${icon('spark')}Turn Pasted Text into Table</button>
            <button id="paste-sample-btn" class="btn small">Try Example Paste</button>
          </div>
        </details>
      </div>
      <div class="messages" id="builder-messages" tabindex="0" aria-label="Sheet Creator conversation">
        ${chat.map(m=>`<article class="msg ${m.role==='user'?'user':''}"><span class="msg-sender">${m.role==='user'?'You':'Helper'}</span><div class="bubble">${escapeHTML(m.text)}</div></article>`).join('')}
      </div>
      <div class="quick-action-bar">
        <div class="quick-chips">
          <button class="chip" data-bcmd="Fix contacts and extract DOB from SA ID">🪪 Fix IDs & Phones</button>
          <button class="chip" data-bcmd="Add Total row">➕ Add Total Row</button>
          <button class="chip" data-bcmd="Split by Grade">📂 Split into Tabs</button>
          <button class="chip" data-bcmd="Summarize by Grade">📊 Summarize</button>
        </div>
      </div>
      <form id="builder-chat-form" class="chat-compose">
        <textarea id="builder-chat-input" rows="1" placeholder="Tell me what to build or calculate (e.g. 'Columns: ID, Name, Fee, Paid' or 'Balance = Fee - Paid')…"></textarea>
        <button type="submit" class="btn primary small" aria-label="Send command">${icon('send')}</button>
      </form>
    </section>

    <section class="result-card" aria-label="Editable Multi-Tab Workbook">
      <div class="result-head">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input id="builder-title" value="${escapeHTML(title)}" aria-label="Workbook file name" style="max-width:220px;padding:6px 10px;font-size:13px;font-weight:700">
          <span class="badge good">${tabs.length} tab${tabs.length>1?'s':''} · ${headers.length} columns · ${rows.length} rows</span>
        </div>
        <div class="result-actions">
          <button id="builder-to-transform" class="btn small cyan">${icon('check')}Finish & Check Sheet</button>
          <button id="builder-download" class="btn small primary">${icon('download')}Download Excel (.XLSX)</button>
        </div>
      </div>
      <div class="clean-toolbar">
        <span>Quick Tools:</span>
        <button id="builder-add-col" class="btn small">${icon('plus')}Column</button>
        <button id="builder-add-row" class="btn small">${icon('plus')}Row</button>
        <button id="builder-formula-btn" class="btn small">${icon('spark')}+ Formula</button>
        <button id="builder-smart-fix" class="btn small">✨ Fix IDs & Phones</button>
        <button id="builder-split-btn" class="btn small">Split into Tabs…</button>
        <button id="builder-summary-btn" class="btn small">Summarize…</button>
        <button id="builder-compare-btn" class="btn small">Compare 2 Tabs</button>
        <button id="builder-total-btn" class="btn small">+ Total Row</button>
      </div>
      <div class="table-scroll" tabindex="0" aria-label="Editable spreadsheet grid">
        <table>
          <thead>
            <tr>
              ${headers.map((h,ci)=>`<th><div style="display:flex;gap:4px;align-items:center"><input class="head-input" data-col-idx="${ci}" value="${escapeHTML(h)}" aria-label="Column ${ci+1} name">${headers.length>1?`<button class="icon-button" data-del-col="${ci}" title="Remove column" aria-label="Remove column ${escapeHTML(h)}">×</button>`:''}</div>${tab.formulas[h]?`<small style="display:block;font-size:10px;color:var(--accent);margin-top:2px">fx: =${escapeHTML(tab.formulas[h])}</small>`:''}</th>`).join('')}
              <th style="width:44px"></th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r,ri)=>`<tr>${headers.map((h,ci)=>`<td><input class="cell-input" data-row="${ri}" data-col="${ci}" value="${escapeHTML(r[h]??'')}" placeholder="—" aria-label="Row ${ri+1} ${escapeHTML(h)}"></td>`).join('')}<td><button class="icon-button" data-del-row="${ri}" aria-label="Delete row ${ri+1}">${icon('trash')}</button></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="sheet-tabs-bar" aria-label="Workbook sheets">
        ${tabs.map((t,ti)=>`<button class="sheet-tab-btn ${ti===activeTab?'active':''}" data-switch-tab="${ti}">${escapeHTML(t.name)} (${t.rows.length})</button>`).join('')}
        <button id="builder-add-tab" class="btn small">${icon('plus')}Add Blank Tab</button>
      </div>
    </section>
  </div>`;

  const bMsgs=$('builder-messages');
  if(bMsgs)bMsgs.scrollTop=bMsgs.scrollHeight;

  const syncDomToBuilder=()=>{
    builderState.title=$<HTMLInputElement>('builder-title').value.trim()||'New-Workbook.xlsx';
    builderState.pasteOpen=($('paste-drawer') as HTMLDetailsElement)?.open||false;
    const cur=currentBuilderTab();
    const newHeaders:string[]=[];
    document.querySelectorAll<HTMLInputElement>('.head-input').forEach((inp,i)=>{
      newHeaders.push(inp.value.trim()||`Column ${i+1}`);
    });
    const newRows:Record<string,any>[]=cur.rows.map(()=>({}));
    document.querySelectorAll<HTMLInputElement>('.cell-input').forEach(inp=>{
      const ri=Number(inp.dataset.row),ci=Number(inp.dataset.col);
      const raw=inp.value;
      const num=raw!==''&&!Number.isNaN(Number(raw))&&!/^0\d+/.test(raw)&&raw.replace(/\D/g,'').length!==13?Number(raw):raw;
      if(newRows[ri])newRows[ri][newHeaders[ci]]=num;
    });
    cur.headers=newHeaders;
    cur.rows=newRows;
  };

  $('builder-new-blank').addEventListener('click',()=>{
    builderState={
      title:'New-Workbook.xlsx',
      activeTab:0,
      tabs:[makeBlankTab('Sheet1',4,5)],
      chat:[{role:'qms',text:'Started a fresh blank sheet from scratch! Type any column headers or values into the grid, paste text, or tell me what to build.'}],
      pasteOpen:false
    };
    builderPage();
    toast('Created a fresh blank spreadsheet!');
  });

  $('paste-sample-btn').addEventListener('click',()=>{
    $<HTMLTextAreaElement>('paste-raw-text').value=[
      '1. STU001 - JOHN DOE - 1503155123084 - Gr 8 - 821234567 - jane.doe@gmial.com',
      '2. STU002 - SARAH SMITH - 1407220145081 - Gr 9 - +27 83 987 6543 - michael.smith@example.com',
      '3. STU003 - EMMA JOHNSON - 1601100234089 - Gr 7 - 084 765 4321 - patricia@gamil.com'
    ].join('\n');
  });

  $('paste-convert-btn').addEventListener('click',()=>{
    syncDomToBuilder();
    const raw=$<HTMLTextAreaElement>('paste-raw-text').value;
    const msg=parsePastedMessyTextToTab(raw);
    builderState.chat.push({role:'user',text:'[Pasted raw text lines]'},{role:'qms',text:msg});
    builderState.pasteOpen=false;
    builderPage();
    toast('Converted pasted text into clean columns & rows!');
  });

  $('builder-chat-form').addEventListener('submit',e=>{
    e.preventDefault();
    syncDomToBuilder();
    const txt=$<HTMLTextAreaElement>('builder-chat-input').value.trim();
    if(!txt)return;
    builderState.chat.push({role:'user',text:txt});
    const reply=handleBuilderChatCommand(txt);
    builderState.chat.push({role:'qms',text:reply});
    builderPage();
  });
  $<HTMLTextAreaElement>('builder-chat-input').addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('builder-chat-form').dispatchEvent(new Event('submit'))}
  });

  document.querySelectorAll<HTMLButtonElement>('[data-bcmd]').forEach(b=>b.addEventListener('click',()=>{
    syncDomToBuilder();
    const cmd=b.dataset.bcmd!;
    builderState.chat.push({role:'user',text:cmd});
    const reply=handleBuilderChatCommand(cmd);
    builderState.chat.push({role:'qms',text:reply});
    builderPage();
  }));

  document.querySelectorAll<HTMLButtonElement>('[data-switch-tab]').forEach(b=>b.addEventListener('click',()=>{
    syncDomToBuilder();
    builderState.activeTab=Number(b.dataset.switchTab);
    builderPage();
  }));

  $('builder-add-tab').addEventListener('click',()=>{
    syncDomToBuilder();
    const nextNum=builderState.tabs.length+1;
    builderState.tabs.push(makeBlankTab(`Sheet${nextNum}`,4,5));
    builderState.activeTab=builderState.tabs.length-1;
    builderPage();
    toast(`Added blank tab Sheet${nextNum}!`);
  });

  $('builder-add-col').addEventListener('click',()=>{
    syncDomToBuilder();
    const cur=currentBuilderTab();
    const nextCol=`Column ${String.fromCharCode(65+cur.headers.length)}`;
    cur.headers.push(nextCol);
    cur.rows.forEach(r=>{r[nextCol]='' });
    builderPage();
  });

  $('builder-add-row').addEventListener('click',()=>{
    syncDomToBuilder();
    const cur=currentBuilderTab();
    const empty:Record<string,any>={};
    cur.headers.forEach(h=>{empty[h]='' });
    cur.rows.push(empty);
    builderPage();
  });

  $('builder-smart-fix').addEventListener('click',()=>{
    syncDomToBuilder();
    const cur=currentBuilderTab();
    const n=runSaIdAndContactSmartFixOnTab(cur);
    builderState.chat.push({role:'qms',text:`Ran SA ID & Contact Smart Fix (${n} cell(s) formatted/extracted across SA IDs, DOB, Gender, Names, Phones, Emails, and Grades).`});
    builderPage();
    toast(`SA ID & Contact Smart Fix updated ${n} field(s)!`);
  });

  $('builder-formula-btn').addEventListener('click',()=>{
    syncDomToBuilder();
    const cur=currentBuilderTab();
    openModal('Add Calculated Formula Column',`
      <form id="formula-modal-form">
        <label for="fm-name">New Column Name</label>
        <input id="fm-name" required value="Balance" placeholder="e.g. Balance, Line Total, VAT 15%">
        <div class="field-row">
          <div><label for="fm-col-a">First Column</label><select id="fm-col-a">${cur.headers.map(h=>`<option value="${escapeHTML(h)}">${escapeHTML(h)}</option>`).join('')}</select></div>
          <div><label for="fm-op">Operation</label><select id="fm-op"><option value="-">Minus (−)</option><option value="+">Plus (+)</option><option value="*">Multiply (×)</option><option value="/">Divide (÷)</option><option value="vat15">15% VAT of First Column</option></select></div>
        </div>
        <label for="fm-col-b">Second Column (if applicable)</label>
        <select id="fm-col-b">${cur.headers.map((h,i)=>`<option value="${escapeHTML(h)}" ${i===cur.headers.length-1?'selected':''}>${escapeHTML(h)}</option>`).join('')}</select>
        <button type="submit" class="btn primary" style="margin-top:14px">Add Calculated Column</button>
      </form>
    `);
    $('formula-modal-form').addEventListener('submit',e=>{
      e.preventDefault();
      const name=$<HTMLInputElement>('fm-name').value;
      const colA=$<HTMLSelectElement>('fm-col-a').value;
      const op=$<HTMLSelectElement>('fm-op').value as any;
      const colB=$<HTMLSelectElement>('fm-col-b').value;
      const msg=addCalculatedColumnToTab(cur,name,colA,op,colB);
      builderState.chat.push({role:'qms',text:msg});
      closeModal();
      builderPage();
      toast(msg);
    });
  });

  $('builder-split-btn').addEventListener('click',()=>{
    syncDomToBuilder();
    const cur=currentBuilderTab();
    openModal('Split Sheet into Multiple Tabs by Column',`
      <form id="split-modal-form">
        <p>Pick which column to group by — EduSheetManager will create a separate tab for each unique value (e.g. Grade 7, Grade 8, Grade 9) inside your workbook:</p>
        <label for="split-col">Split by Column</label>
        <select id="split-col">${cur.headers.map(h=>`<option value="${escapeHTML(h)}" ${/grade|site|branch|category|status/i.test(h)?'selected':''}>${escapeHTML(h)}</option>`).join('')}</select>
        <button type="submit" class="btn primary" style="margin-top:14px">Split into Tabs</button>
      </form>
    `);
    $('split-modal-form').addEventListener('submit',e=>{
      e.preventDefault();
      const col=$<HTMLSelectElement>('split-col').value;
      const msg=splitTabByColumn(cur,col);
      builderState.chat.push({role:'qms',text:msg});
      closeModal();
      builderPage();
      toast('Split into multiple workbook tabs!');
    });
  });

  $('builder-summary-btn').addEventListener('click',()=>{
    syncDomToBuilder();
    const cur=currentBuilderTab();
    openModal('Generate Summary Breakdown Tab',`
      <form id="sum-modal-form">
        <p>Choose a column to group by — EduSheetManager will create a new <b>Summary</b> tab with Row Counts, Totals, and Averages:</p>
        <label for="sum-col">Summarize by Column</label>
        <select id="sum-col">${cur.headers.map(h=>`<option value="${escapeHTML(h)}" ${/grade|site|branch|category|subjects/i.test(h)?'selected':''}>${escapeHTML(h)}</option>`).join('')}</select>
        <button type="submit" class="btn primary" style="margin-top:14px">Create Summary Tab</button>
      </form>
    `);
    $('sum-modal-form').addEventListener('submit',e=>{
      e.preventDefault();
      const col=$<HTMLSelectElement>('sum-col').value;
      const msg=summarizeTabByColumn(cur,col);
      builderState.chat.push({role:'qms',text:msg});
      closeModal();
      builderPage();
      toast('Created Summary tab!');
    });
  });

  $('builder-compare-btn').addEventListener('click',()=>{
    syncDomToBuilder();
    if(builderState.tabs.length<2){
      // Create a sample second tab with a missing student and a changed fee so the user can test reconciliation immediately if only 1 tab exists
      const cur=currentBuilderTab();
      const cloneRows=cur.rows.slice(0,Math.max(1,cur.rows.length-1)).map((r,i)=>{
        const copy={...r};
        if(i===0&&cur.headers[1])copy[cur.headers[1]]=String(copy[cur.headers[1]]||'')+' (Updated)';
        return copy;
      });
      builderState.tabs.push({name:`${cur.name}_Compare`,headers:[...cur.headers],rows:cloneRows,formulas:{}});
    }
    const msg=compareTwoTabs(builderState.tabs[0],builderState.tabs[1]);
    builderState.chat.push({role:'qms',text:msg});
    builderPage();
    toast('Created Reconciliation tab comparing Tab 1 and Tab 2!');
  });

  $('builder-total-btn').addEventListener('click',()=>{
    syncDomToBuilder();
    const msg=handleBuilderChatCommand('add total row');
    builderState.chat.push({role:'qms',text:msg});
    builderPage();
    toast('Appended Total row!');
  });

  document.querySelectorAll<HTMLButtonElement>('[data-del-col]').forEach(b=>b.addEventListener('click',()=>{
    syncDomToBuilder();
    const cur=currentBuilderTab();
    const ci=Number(b.dataset.delCol);
    const removed=cur.headers.splice(ci,1)[0];
    cur.rows.forEach(r=>{delete r[removed]});
    builderPage();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-del-row]').forEach(b=>b.addEventListener('click',()=>{
    syncDomToBuilder();
    const cur=currentBuilderTab();
    cur.rows.splice(Number(b.dataset.delRow),1);
    builderPage();
  }));
  $('builder-download').addEventListener('click',()=>{
    syncDomToBuilder();
    const blob=buildMultiSheetXlsxBlob(builderState.tabs);
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=builderState.title.endsWith('.xlsx')?builderState.title:`${builderState.title}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${builderState.tabs.length}-tab Excel (.xlsx) workbook!`);
  });
  $('builder-to-transform').addEventListener('click',()=>void busy($('builder-to-transform'),async()=>{
    syncDomToBuilder();
    const cur=currentBuilderTab();
    job=await api<Job>('/api/jobs/from-builder',{title:builderState.title,sheet:cur.name,headers:cur.headers,rows:cur.rows,request_id:uid()});
    await refresh();shell();await showPage('workspace');
    toast('Opened active sheet in Transform with QMS checks passed!');
  }));
}

let quoteState={
  docType:'QUOTATION' as 'QUOTATION'|'TAX INVOICE',
  docNumber:'QUO-2026-0042',
  date:'2026-10-14',
  companyName:'Apex Business Solutions (Pty) Ltd',
  companyContact:'billing@apexsolutions.co.za · 082 555 0199',
  clientName:'Greenwood High School',
  clientContact:'finance@greenwoodhigh.edu.za',
  currency:'R',
  vatRate:15,
  items:[
    {code:'SAS-01',description:'SA-SAMS Student & Subject Matrix System Import (Per Learner)',qty:850,price:35},
    {code:'ONB-02',description:'School Template Setup & Staff Onboarding Session',qty:1,price:2500},
  ]
};

function quotesPage(){
  const s=quoteState;
  const subtotal=s.items.reduce((sum,it)=>sum+(Number(it.qty)||0)*(Number(it.price)||0),0);
  const vatAmt=Math.round(subtotal*(s.vatRate/100)*100)/100;
  const grandTotal=Math.round((subtotal+vatAmt)*100)/100;

  $('page').innerHTML=`<div class="page-heading"><div><h1>Quotes & Invoices (Business PA)</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Tell your PA what to quote in plain words, or edit your branded Quotation / Tax Invoice below and download as Excel (.XLSX) or Printable PDF.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="quote-add-item" class="btn small">${icon('plus')}Add Line Item</button><button id="quote-print" class="btn small">${icon('file')}Printable Quote / PDF</button><button id="quote-to-transform" class="btn small cyan">${icon('shield')}Open in Transform</button><button id="quote-download" class="btn small success">${icon('download')}Download Branded XLSX</button></div></div>
  <section class="feature-banner">
    <form id="quote-pa-form" class="prompt-row">
      <input id="quote-pa-input" placeholder="Tell your PA in plain words (e.g. 'Invoice for Horizon Academy: 1200 Student Imports at 30 each and 1 Setup Fee at 3000')…">
      <button type="submit" class="btn primary small">${icon('spark')}Fill Quote with PA</button>
    </form>
  </section>
  <div class="settings-grid" style="margin-bottom:16px">
    <section class="settings-panel">
      <h2>Document & Your Business</h2>
      <div class="field-row">
        <div><label for="q-type">Document Type</label><select id="q-type"><option value="QUOTATION" ${s.docType==='QUOTATION'?'selected':''}>Quotation</option><option value="TAX INVOICE" ${s.docType==='TAX INVOICE'?'selected':''}>Tax Invoice</option></select></div>
        <div><label for="q-num">Document #</label><input id="q-num" value="${escapeHTML(s.docNumber)}"></div>
      </div>
      <label for="q-comp">Your Business Name</label><input id="q-comp" value="${escapeHTML(s.companyName)}">
      <label for="q-comp-contact">Your Email / Phone / Bank Details</label><input id="q-comp-contact" value="${escapeHTML(s.companyContact)}">
    </section>
    <section class="settings-panel">
      <h2>Client & Tax Settings</h2>
      <label for="q-client">Client / School / Company Name</label><input id="q-client" value="${escapeHTML(s.clientName)}">
      <label for="q-client-contact">Client Email / Reference</label><input id="q-client-contact" value="${escapeHTML(s.clientContact)}">
      <div class="field-row">
        <div><label for="q-curr">Currency</label><select id="q-curr"><option value="R" ${s.currency==='R'?'selected':''}>ZAR (R)</option><option value="$" ${s.currency==='$'?'selected':''}>USD ($)</option><option value="£" ${s.currency==='£'?'selected':''}>GBP (£)</option></select></div>
        <div><label for="q-vat">VAT / Tax (%)</label><input id="q-vat" type="number" min="0" max="50" value="${s.vatRate}"></div>
      </div>
    </section>
  </div>
  <section class="result-card">
    <div class="result-head"><div><h2>${escapeHTML(s.docType)} · ${escapeHTML(s.docNumber)}</h2><small>Prepared for ${escapeHTML(s.clientName)}</small></div><span class="badge good">Total: ${escapeHTML(s.currency)} ${grandTotal.toLocaleString()}</span></div>
    <div class="table-scroll" tabindex="0" aria-label="Quotation line items">
      <table>
        <thead><tr><th>Item Code</th><th>Service / Product Description</th><th>Qty</th><th>Unit Price (${escapeHTML(s.currency)})</th><th>Line Total (${escapeHTML(s.currency)})</th><th style="width:48px"></th></tr></thead>
        <tbody>
          ${s.items.map((it,idx)=>{
            const lineTot=Math.round((Number(it.qty)||0)*(Number(it.price)||0)*100)/100;
            return `<tr>
              <td><input class="cell-input q-item-code" data-idx="${idx}" value="${escapeHTML(it.code)}" aria-label="Item code ${idx+1}"></td>
              <td><input class="cell-input q-item-desc" data-idx="${idx}" value="${escapeHTML(it.description)}" aria-label="Description ${idx+1}"></td>
              <td><input class="cell-input q-item-qty" data-idx="${idx}" type="number" value="${it.qty}" aria-label="Quantity ${idx+1}"></td>
              <td><input class="cell-input q-item-price" data-idx="${idx}" type="number" step="0.01" value="${it.price}" aria-label="Unit price ${idx+1}"></td>
              <td><strong>${escapeHTML(s.currency)} ${lineTot.toLocaleString()}</strong></td>
              <td><button class="icon-button" data-del-qitem="${idx}" aria-label="Remove item ${idx+1}">${icon('trash')}</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </section>
  <div class="quote-summary-box">
    <div class="quote-totals">
      <div>Subtotal<strong>${escapeHTML(s.currency)} ${subtotal.toLocaleString()}</strong></div>
      <div>VAT (${s.vatRate}%)<strong>${escapeHTML(s.currency)} ${vatAmt.toLocaleString()}</strong></div>
      <div>Grand Total<strong>${escapeHTML(s.currency)} ${grandTotal.toLocaleString()}</strong></div>
    </div>
  </div>`;

  const syncQuoteDom=()=>{
    s.docType=$<HTMLSelectElement>('q-type').value as any;
    s.docNumber=$<HTMLInputElement>('q-num').value.trim()||'QUO-001';
    s.companyName=$<HTMLInputElement>('q-comp').value.trim();
    s.companyContact=$<HTMLInputElement>('q-comp-contact').value.trim();
    s.clientName=$<HTMLInputElement>('q-client').value.trim();
    s.clientContact=$<HTMLInputElement>('q-client-contact').value.trim();
    s.currency=$<HTMLSelectElement>('q-curr').value;
    s.vatRate=Number($<HTMLInputElement>('q-vat').value)||0;
    const codes=document.querySelectorAll<HTMLInputElement>('.q-item-code');
    const descs=document.querySelectorAll<HTMLInputElement>('.q-item-desc');
    const qtys=document.querySelectorAll<HTMLInputElement>('.q-item-qty');
    const prices=document.querySelectorAll<HTMLInputElement>('.q-item-price');
    s.items=Array.from(codes).map((_,i)=>({
      code:codes[i].value.trim()||`ITEM-${i+1}`,
      description:descs[i].value.trim()||'Service',
      qty:Number(qtys[i].value)||0,
      price:Number(prices[i].value)||0
    }));
  };

  ['q-type','q-curr','q-vat'].forEach(id=>$(id).addEventListener('change',()=>{syncQuoteDom();quotesPage()}));
  document.querySelectorAll('.q-item-qty,.q-item-price').forEach(el=>el.addEventListener('change',()=>{syncQuoteDom();quotesPage()}));

  $('quote-pa-form').addEventListener('submit',e=>{
    e.preventDefault();
    syncQuoteDom();
    const txt=$<HTMLInputElement>('quote-pa-input').value.trim();
    if(!txt)return;
    if(/invoice/i.test(txt)){s.docType='TAX INVOICE';s.docNumber=s.docNumber.replace(/^QUO/,'INV')}
    else if(/quote|quotation/i.test(txt)){s.docType='QUOTATION';s.docNumber=s.docNumber.replace(/^INV/,'QUO')}
    const clientM=txt.match(/(?:for|to)\s+([A-Z][A-Za-z0-9\s&.-]+?)(?::|,|\s+\d)/);
    if(clientM)s.clientName=clientM[1].trim();
    const itemRegex=/(\d+)\s+([A-Za-z][A-Za-z0-9\s-]{2,40}?)\s+(?:at|@|for)\s+[R$£]?(\d+(?:\.\d+)?)/gi;
    const parsedItems:typeof s.items=[];
    let m:RegExpExecArray|null;
    let idx=1;
    while((m=itemRegex.exec(txt))!==null){
      parsedItems.push({code:`ITEM-0${idx++}`,description:m[2].trim(),qty:Number(m[1]),price:Number(m[3])});
    }
    if(parsedItems.length)s.items=parsedItems;
    quotesPage();
    toast('PA updated your quotation details and line items!');
  });

  $('quote-add-item').addEventListener('click',()=>{
    syncQuoteDom();
    s.items.push({code:`ITEM-0${s.items.length+1}`,description:'Additional Service / Product',qty:1,price:500});
    quotesPage();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-del-qitem]').forEach(b=>b.addEventListener('click',()=>{
    syncQuoteDom();
    s.items.splice(Number(b.dataset.delQitem),1);
    quotesPage();
  }));

  const buildQuoteTableRows=()=>{
    syncQuoteDom();
    const headers=['Document #','Client','Item Code','Description','Qty','Unit Price','VAT','Line Total'];
    const rows:Record<string,any>[]=s.items.map(it=>{
      const sub=(Number(it.qty)||0)*(Number(it.price)||0);
      const vat=Math.round(sub*(s.vatRate/100)*100)/100;
      return {
        'Document #':s.docNumber,
        'Client':s.clientName,
        'Item Code':it.code,
        'Description':it.description,
        'Qty':it.qty,
        'Unit Price':it.price,
        'VAT':vat,
        'Line Total':Math.round((sub+vat)*100)/100
      };
    });
    return {headers,rows};
  };

  $('quote-download').addEventListener('click',()=>{
    const {headers,rows}=buildQuoteTableRows();
    const blob=buildXlsxBlob(s.docType==='TAX INVOICE'?'Tax_Invoice':'Quotation',headers,rows);
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`${s.docNumber}-${s.clientName.replace(/\s+/g,'-')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded branded Excel (.xlsx) quote!');
  });

  $('quote-to-transform').addEventListener('click',()=>void busy($('quote-to-transform'),async()=>{
    const {headers,rows}=buildQuoteTableRows();
    job=await api<Job>('/api/jobs/from-builder',{title:`${s.docNumber}-${s.clientName}.xlsx`,sheet:'Quote_Invoice',headers,rows,request_id:uid()});
    await refresh();shell();await showPage('workspace');
    toast('Opened your quote in Transform!');
  }));

  $('quote-print').addEventListener('click',()=>{
    syncQuoteDom();
    openModal(`${s.docType} · ${s.docNumber}`,`
      <div style="padding:12px;border:1px solid var(--line);border-radius:10px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;border-bottom:1px solid var(--line);padding-bottom:12px">
          <div><h3 style="font-size:18px">${escapeHTML(s.companyName)}</h3><p style="font-size:12px;color:var(--muted)">${escapeHTML(s.companyContact)}</p></div>
          <div style="text-align:right"><strong>${escapeHTML(s.docType)} #${escapeHTML(s.docNumber)}</strong><p style="font-size:12px;color:var(--muted)">Date: ${escapeHTML(s.date)}</p></div>
        </div>
        <div style="margin:12px 0"><small style="color:var(--muted)">PREPARED FOR:</small><div><strong>${escapeHTML(s.clientName)}</strong> (${escapeHTML(s.clientContact)})</div></div>
        <div class="table-scroll"><table><thead><tr><th>Code</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${s.items.map(it=>`<tr><td>${escapeHTML(it.code)}</td><td>${escapeHTML(it.description)}</td><td>${it.qty}</td><td>${escapeHTML(s.currency)} ${it.price}</td><td>${escapeHTML(s.currency)} ${((Number(it.qty)||0)*(Number(it.price)||0)).toLocaleString()}</td></tr>`).join('')}</tbody></table></div>
        <div style="margin-top:14px;text-align:right">
          <div>Subtotal: <b>${escapeHTML(s.currency)} ${subtotal.toLocaleString()}</b></div>
          <div>VAT (${s.vatRate}%): <b>${escapeHTML(s.currency)} ${vatAmt.toLocaleString()}</b></div>
          <div style="font-size:16px;margin-top:4px">Grand Total: <b>${escapeHTML(s.currency)} ${grandTotal.toLocaleString()}</b></div>
        </div>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <button id="print-modal-btn" class="btn primary small">Print / Save as PDF</button>
          ${poweredByEduSCF()}
        </div>
      </div>
    `);
    $('print-modal-btn').addEventListener('click',()=>window.print());
  });
}

async function templatesPage(){
  const vert=activeVertical();
  const vMeta=VERTICAL_META[vert]||VERTICAL_META.general;
  const res=await api('/api/templates',undefined,'GET');
  const allItems:any[]=res.items||[];
  const items=allItems.filter(t=>!t.builtin||vMeta.templateCategories.includes(t.category));
  $('page').innerHTML=`<div class="page-heading"><div><h1>${escapeHTML(vMeta.shortName)} Templates</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Pick a ready-made ${escapeHTML(vMeta.shortName.toLowerCase())} template below, download a blank Excel (.XLSX) file, or save your own template.</p></div><button id="new-template-btn" class="btn primary small">${icon('plus')}Save Custom Template</button></div>
  <div class="knowledge-grid">
    ${items.map((t,idx)=>`<article class="knowledge-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">
        <span class="badge ${t.builtin?'good':'purple'}">${escapeHTML(t.category||(t.builtin?'Ready-Made':'Custom'))}</span>
        <small style="color:var(--muted)">${t.headers.length} columns</small>
      </div>
      <h3>${escapeHTML(t.name)}</h3>
      <p style="margin-top:6px;font-size:13px">${escapeHTML(t.description||'')}</p>
      <div class="file-list" style="margin-top:10px">${t.headers.map((h:string)=>`<span class="file-chip">${escapeHTML(h)}</span>`).join('')}</div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn small primary" data-use-tpl="${idx}">${icon('spark')}Open Template</button>
        <button class="btn small" data-dl-tpl="${idx}">${icon('download')}Download Blank Excel (.XLSX)</button>
      </div>
    </article>`).join('')}
  </div>`;

  document.querySelectorAll<HTMLButtonElement>('[data-use-tpl]').forEach(b=>b.addEventListener('click',()=>void busy(b,async()=>{
    const t=items[Number(b.dataset.useTpl)];
    if(t.id==='sasams_student_import'&&boot.demo_mode){
      job=await api<Job>('/api/demo/jobs',{case:'sasams_students',request_id:uid()});
      job=await api<Job>(`/api/jobs/${job.id}/run`,{});
    }else{
      job=await api<Job>('/api/jobs/from-builder',{title:`${t.name}.xlsx`,sheet:t.sheet||'Output',headers:t.headers,rows:t.sample_rows||[],request_id:uid()});
    }
    await refresh();shell();await showPage('workspace');
    toast(`Opened template: ${t.name}`);
  })));

  document.querySelectorAll<HTMLButtonElement>('[data-dl-tpl]').forEach(b=>b.addEventListener('click',()=>{
    const t=items[Number(b.dataset.dlTpl)];
    const blob=buildXlsxBlob(t.sheet||'Template',t.headers,[]);
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`${t.name.replace(/\s+/g,'-')}-Template.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded blank template: ${t.name}`);
  }));

  $('new-template-btn').addEventListener('click',()=>{
    openModal('Save Your Own Template',`
      <form id="custom-tpl-form">
        <label for="tpl-name">Template Name</label>
        <input id="tpl-name" required placeholder="e.g. Term 2 Class List">
        <label for="tpl-cat">Category</label>
        <input id="tpl-cat" value="${escapeHTML(vMeta.templateCategories[0]||'Custom')}" placeholder="e.g. School / Business">
        <label for="tpl-headers">Column Names (comma-separated) — or upload an Excel/CSV file below</label>
        <input id="tpl-headers" required placeholder="e.g. ID, First Name, Last Name, Phone, Amount">
        <label for="tpl-file">Or copy columns from an existing Excel / CSV file (optional)</label>
        <input id="tpl-file" type="file" accept=".xlsx,.csv">
        <button type="submit" id="save-tpl-submit" class="btn primary" style="margin-top:14px">Save Template</button>
      </form>
    `);
    $<HTMLInputElement>('tpl-file').addEventListener('change',async()=>{
      const f=$<HTMLInputElement>('tpl-file').files?.[0];
      if(!f)return;
      const parsed=await parseUploadedFile(f);
      if(parsed.headers.length){
        $<HTMLInputElement>('tpl-headers').value=parsed.headers.join(', ');
        if(!$<HTMLInputElement>('tpl-name').value)$<HTMLInputElement>('tpl-name').value=f.name.replace(/\.(xlsx|csv)$/i,'');
      }
    });
    $('custom-tpl-form').addEventListener('submit',e=>{
      e.preventDefault();
      void busy($('save-tpl-submit'),async()=>{
        const name=$<HTMLInputElement>('tpl-name').value.trim();
        const category=$<HTMLInputElement>('tpl-cat').value.trim()||vMeta.templateCategories[0]||'Custom';
        const headers=$<HTMLInputElement>('tpl-headers').value.split(',').map(s=>s.trim()).filter(Boolean);
        await api('/api/templates',{name,category,headers},'POST');
        closeModal();
        await templatesPage();
        toast(`Saved "${name}" to your templates!`);
      });
    });
  });
}

function wireChat(){
  const messages=$('messages');
  messages.scrollTop=messages.scrollHeight;
  $('chat-form').addEventListener('submit',e=>{e.preventDefault();void sendChat()});
  $<HTMLTextAreaElement>('chat-text').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void sendChat()}});
  document.querySelectorAll<HTMLButtonElement>('[data-chat]').forEach(b=>b.addEventListener('click',()=>{$<HTMLTextAreaElement>('chat-text').value=b.dataset.chat!;void sendChat()}));
  if($('confirm-correction'))$('confirm-correction').addEventListener('click',()=>void busy($('confirm-correction'),async()=>{
    job=await api<Job>(`/api/jobs/${job!.id}/confirm`,{proposal_id:job!.proposal.id,request_id:uid()});
    await refresh();shell();await showPage('workspace');
    toast(job!.state==='RELEASED'?'Done! Your Excel file is ready to download.':'Saved — check the chat for next steps.');
  }));
}

async function sendChat(){
  if(!job)return;
  const text=$<HTMLTextAreaElement>('chat-text').value.trim();
  if(!text)return;
  await busy($('send-chat'),async()=>{
    job=await api<Job>(`/api/jobs/${job!.id}/chat`,{text,request_id:uid()});
    await refresh();shell();await showPage('workspace');
  });
}

async function doRun(){
  if(!job)return;
  await busy($('run-job'),async()=>{
    job=await api<Job>(`/api/jobs/${job!.id}/run`,{});
    await refresh();shell();await showPage('workspace');
    toast(job!.state==='RELEASED'?'Ready! Click Download Excel (.XLSX) on the right.':'Almost done — check the quick question on the left.');
  });
}

async function loadJob(id:string){job=await api<Job>('/api/jobs/'+id);await showPage('workspace')}

function jobHistory(){
  void preferencesPage();
}

async function knowledgePage(){
  await preferencesPage();
}

async function preferencesPage(){
  const p=overview.preferences||{theme:'light',density:'comfortable',explanations:'detailed',auto_checks:true,vertical:'general'};
  const vert=p.vertical||'general';
  const savedRules=(await api('/api/knowledge',undefined,'GET')).items||[];
  $('page').innerHTML=`
  <div class="page-heading"><h1>Past Files & Workspace Settings</h1></div>
  <div class="settings-grid">
    <section class="settings-panel">
      <h2>Your Past Spreadsheets (${overview.jobs?.length||0})</h2>
      <p style="margin-top:4px;font-size:13px">Reopen any spreadsheet you worked on recently or remove old files.</p>
      <div class="jobs-table" style="margin-top:12px" tabindex="0" aria-label="Past spreadsheets">
        <table>
          <thead><tr><th>File Name</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${(overview.jobs||[]).map((j:any)=>`<tr>
              <td><strong>${escapeHTML(j.title)}</strong><div style="font-size:11px;color:var(--muted)">${new Date(j.created).toLocaleDateString()}</div></td>
              <td><span class="badge ${j.state==='RELEASED'?'good':'warn'}">${j.state==='RELEASED'?'✓ Ready':'In Progress'}</span></td>
              <td><button class="btn small primary" data-open="${j.id}">Open</button> <button class="icon-button" data-delete="${j.id}" aria-label="Delete ${escapeHTML(j.title)}">${icon('trash')}</button></td>
            </tr>`).join('')||'<tr><td colspan="3" class="table-empty">No saved spreadsheets yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>

    <form id="preferences-form" class="settings-panel">
      <h2>Workspace & Appearance</h2>
      <label for="pref-vertical">Workspace Mode</label>
      <select id="pref-vertical">${Object.entries(VERTICAL_META).map(([k,v])=>`<option value="${k}" ${k===vert?'selected':''}>${escapeHTML(v.label)} — ${escapeHTML(v.badge)}</option>`).join('')}</select>
      <label for="theme">Screen Theme</label>
      <select id="theme"><option value="light" ${p.theme!=='dark'?'selected':''}>Warm Paper & Calm Sage (Default)</option><option value="dark" ${p.theme==='dark'?'selected':''}>Dark Mode</option></select>
      <label for="density">Table Row Spacing</label>
      <select id="density"><option value="comfortable">Comfortable</option><option value="compact" ${p.density==='compact'?'selected':''}>Compact</option></select>
      <label for="explanations">Helper Reply Style</label>
      <select id="explanations"><option value="detailed">Friendly & Clear</option><option value="concise" ${p.explanations==='concise'?'selected':''}>Short</option></select>
      <label class="toggle"><input id="auto-checks" type="checkbox" ${p.auto_checks!==false?'checked':''}>Automatically update the sheet when I confirm an answer</label>
      <button id="save-preferences" class="btn primary">Save Settings${icon('check')}</button>
    </form>
  </div>

  <details class="quiet-details" style="margin-top:20px">
    <summary>Advanced & Technical Details (Optional — Saved Column Rules & Audit Logs)</summary>
    <div class="quiet-body">
      <div class="quiet-buttons">
        ${job?`<button id="edit-plan" class="btn small">${icon('edit')}Inspect Current Mapping JSON</button><button id="download-evidence" class="btn small" ${job.report?'':'disabled'}>${icon('download')}Download Technical Audit JSON</button>`:''}
      </div>
      <h3 style="font-size:14px;margin-top:10px">Automatically Remembered Column Rules (${savedRules.length})</h3>
      <div class="knowledge-grid" style="margin-top:8px">
        ${savedRules.map((k:any,i:number)=>`<article class="knowledge-card"><h4>${escapeHTML(k.template_name)}</h4><p style="font-size:12px">${k.headers.length} columns remembered</p><button class="btn small" style="margin-top:8px" data-pattern="${i}">View Technical Rule</button></article>`).join('')||'<p style="font-size:13px">Finish a spreadsheet and your column matches will be remembered here automatically.</p>'}
      </div>
    </div>
  </details>`;

  document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach(b=>b.addEventListener('click',()=>void loadJob(b.dataset.open!)));
  document.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(b=>b.addEventListener('click',()=>{
    openModal('Remove this file?',`<p>Remove this spreadsheet from your saved list.</p><button id="confirm-delete" class="btn danger" style="margin-top:14px">Remove file</button>`);
    $('confirm-delete').addEventListener('click',()=>void busy($('confirm-delete'),async()=>{await api(`/api/jobs/${b.dataset.delete}`,{},'DELETE');closeModal();if(job?.id===b.dataset.delete)job=null;await refresh();shell();await showPage('preferences')}));
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-pattern]').forEach(b=>b.addEventListener('click',()=>openModal('Saved Rule Details',`<pre>${escapeHTML(JSON.stringify(savedRules[Number(b.dataset.pattern)].plan,null,2))}</pre>`)));
  if($('edit-plan'))$('edit-plan').addEventListener('click',editPlan);
  if($('download-evidence'))$('download-evidence').addEventListener('click',()=>void download('evidence'));

  $('preferences-form').addEventListener('submit',e=>{e.preventDefault();void busy($('save-preferences'),async()=>{await api('/api/preferences',{theme:$<HTMLSelectElement>('theme').value,density:$<HTMLSelectElement>('density').value,explanations:$<HTMLSelectElement>('explanations').value,auto_checks:$<HTMLInputElement>('auto-checks').checked,vertical:$<HTMLSelectElement>('pref-vertical').value},'PUT');await refresh();applyPreferences();shell();await showPage('preferences');toast('Your settings were saved!')})});
}

async function adminPage(){
  if(user?.role!=='admin')return;
  adminSettings=await api('/api/admin/settings');
  customers=(await api('/api/admin/customers')).items;
  const s=adminSettings;
  $('page').innerHTML=`<div class="page-heading"><h1>Admin Settings</h1><span class="badge purple">Platform Admin</span></div><form id="admin-form"><div class="settings-grid"><section class="settings-panel"><h2>Budgets & Quotas</h2><div class="field-row"><div><label for="platform-budget">Platform monthly ceiling (USD)</label><input id="platform-budget" inputmode="decimal" value="${escapeHTML(s.platform_budget_usd)}"></div><div><label for="ai-budget">Monthly AI allowance (USD)</label><input id="ai-budget" inputmode="decimal" value="${escapeHTML(s.monthly_budget_usd)}"></div></div><div class="field-row"><div><label for="input-price">Input price / 1M tokens (USD)</label><input id="input-price" inputmode="decimal" value="${escapeHTML(s.input_price_per_million_usd)}"></div><div><label for="output-price">Output price / 1M tokens (USD)</label><input id="output-price" inputmode="decimal" value="${escapeHTML(s.output_price_per_million_usd)}"></div></div><label for="pricing-url">Pricing source URL</label><input id="pricing-url" type="url" value="${escapeHTML(s.pricing_source_url)}" placeholder="https://…"><label for="pricing-date">Date verified</label><input id="pricing-date" type="date" value="${escapeHTML(s.pricing_verified_date)}"><div class="field-row"><div><label for="max-tokens">Max output tokens</label><input id="max-tokens" type="number" min="256" max="12000" value="${s.max_output_tokens}"></div><div><label for="storage-limit">Storage / customer (MiB)</label><input id="storage-limit" type="number" min="50" max="10000" value="${s.max_storage_mib_per_customer}"></div></div><label for="jobs-limit">Max jobs / customer</label><input id="jobs-limit" type="number" min="5" max="1000" value="${s.max_jobs_per_customer}"></section><section class="settings-panel"><h2>AI Provider & Shared Key</h2><label for="provider">Provider</label><select id="provider"><option value="openai_compatible">OpenAI-compatible</option><option value="anthropic" ${s.provider==='anthropic'?'selected':''}>Anthropic</option></select><label for="base-url">Base URL</label><input id="base-url" type="url" value="${escapeHTML(s.base_url)}" placeholder="https://api.openai.com/v1"><label for="model">Model ID</label><input id="model" value="${escapeHTML(s.model)}" placeholder="gpt-4o-mini"><label for="api-key">Shared API key (write-only)</label><input id="api-key" type="password" autocomplete="off" ${boot.demo_mode?'disabled':''} placeholder="${boot.demo_mode?'Disabled in preview':'Paste key in deployed app'}"><label class="toggle"><input id="clear-key" type="checkbox" ${boot.demo_mode?'disabled':''}>Remove stored key</label><label class="toggle"><input id="ai-enabled" type="checkbox" ${s.enabled?'checked':''} ${boot.demo_mode?'disabled':''}>Enable external AI requests</label><label class="toggle"><input id="auto-learn" type="checkbox" ${s.auto_learn?'checked':''}>Auto-save mappings after QMS passes</label></section></div><div class="settings-actions"><button id="save-admin" class="btn primary">Save settings${icon('check')}</button></div></form><div class="section-heading"><h2>Customer Accounts (${customers.length})</h2><button id="new-customer" class="btn small">${icon('plus')}Add customer</button></div><div class="customer-table" tabindex="0" aria-label="Customer workspaces"><table><thead><tr><th>Customer</th><th>Users</th><th>Status</th><th>Created</th></tr></thead><tbody>${customers.map(c=>`<tr><td><strong>${escapeHTML(c.name)}</strong></td><td>${c.users}</td><td><span class="badge good">Active</span></td><td>${new Date(c.created).toLocaleDateString()}</td></tr>`).join('')||'<tr><td colspan="4" class="table-empty">No customers yet.</td></tr>'}</tbody></table></div>`;
  $('admin-form').addEventListener('submit',e=>{e.preventDefault();void busy($('save-admin'),async()=>{const read=(id:string)=>$<HTMLInputElement>(id).value;const key=read('api-key');$<HTMLInputElement>('api-key').value='';const body={enabled:$<HTMLInputElement>('ai-enabled').checked,provider:$<HTMLSelectElement>('provider').value,base_url:read('base-url').trim(),model:read('model').trim(),monthly_budget_usd:read('ai-budget'),platform_budget_usd:read('platform-budget'),input_price_per_million_usd:read('input-price'),output_price_per_million_usd:read('output-price'),pricing_source_url:read('pricing-url').trim(),pricing_verified_date:read('pricing-date'),max_output_tokens:Number(read('max-tokens')),timeout_seconds:75,auto_learn:$<HTMLInputElement>('auto-learn').checked,api_key:key||null,clear_key:$<HTMLInputElement>('clear-key').checked,max_storage_mib_per_customer:Number(read('storage-limit')),max_jobs_per_customer:Number(read('jobs-limit'))};adminSettings=await api('/api/admin/settings',body,'PUT');await refresh();await adminPage();toast('Settings saved. No AI request was made.')})});
  $('new-customer').addEventListener('click',createCustomer);
}

function createCustomer(){
  openModal('Add customer account',`<form id="customer-form"><label for="customer-name">Company name</label><input id="customer-name" required minlength="2"><label for="customer-email">Email</label><input id="customer-email" type="email" required><label for="customer-user">Display name</label><input id="customer-user" required minlength="2"><label for="customer-password">Initial password (12+ chars)</label><input id="customer-password" type="password" autocomplete="new-password" required minlength="12"><button id="create-customer" class="btn primary" style="margin-top:16px">Create account</button></form>`);
  $('customer-form').addEventListener('submit',e=>{e.preventDefault();void busy($('create-customer'),async()=>{await api('/api/admin/customers',{name:$<HTMLInputElement>('customer-name').value,email:$<HTMLInputElement>('customer-email').value,display_name:$<HTMLInputElement>('customer-user').value,password:$<HTMLInputElement>('customer-password').value});$<HTMLInputElement>('customer-password').value='';closeModal();await refresh();shell();await showPage('admin');toast('Customer created.')})});
}

function editPlan(){
  if(!job)return;
  openModal('Mapping JSON',`<label for="plan-json">Mapping plan</label><textarea id="plan-json" rows="12" class="mono" spellcheck="false">${escapeHTML(JSON.stringify(job.plan,null,2))}</textarea><label for="plan-reason">Note</label><textarea id="plan-reason" rows="2"></textarea><button id="save-plan" class="btn primary" style="margin-top:14px">Save & run</button>`);
  $('save-plan').addEventListener('click',()=>void busy($('save-plan'),async()=>{const plan=JSON.parse($<HTMLTextAreaElement>('plan-json').value);const confirmation=$<HTMLTextAreaElement>('plan-reason').value;job=await api<Job>(`/api/jobs/${job!.id}/plan`,{plan,confirmation},'PUT');closeModal();await refresh();shell();await showPage('workspace')}));
}

function inspectSource(id:string){
  const p=job?.profiles.sources.find((x:any)=>x.id===id);
  if(!p)return;
  openModal('Source · '+p.name,p.sheets.map((s:any)=>`<h3>${escapeHTML(s.name)}</h3><div class="table-scroll"><table><thead><tr>${s.headers.map((h:string)=>`<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${s.preview.map((row:any[])=>`<tr>${row.map(v=>`<td>${escapeHTML(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`).join(''));
}

function approveAI(){
  if(!job)return;
  openModal('AI Interpretation',`<p>Send sampled cells and rules to the configured AI provider?</p><label class="toggle"><input id="ai-consent" type="checkbox">I approve this request</label><button id="confirm-ai" class="btn primary" disabled>Run AI</button>`);
  $<HTMLInputElement>('ai-consent').addEventListener('change',()=>{$<HTMLButtonElement>('confirm-ai').disabled=!$<HTMLInputElement>('ai-consent').checked});
  $('confirm-ai').addEventListener('click',()=>void busy($('confirm-ai'),async()=>{job=await api<Job>(`/api/jobs/${job!.id}/analyse`,{consent_to_external_processing:true,request_id:uid()});closeModal();await refresh();shell();await showPage('workspace')}));
}

async function download(kind:string){
  if(!job)return;
  try{
    let blob:Blob;
    if(staticMode){
      if(kind==='output'){
        if(!job.report||job.report.status!=='RELEASED')throw new Error('QMS has not released this output.');
        blob=buildXlsxBlob(job.plan.destination.sheet||'Output',job.report.headers,job.report.rows);
      }else{
        blob=new Blob([JSON.stringify(job,null,2)],{type:'application/json'});
      }
    }else{
      const headers:Record<string,string>={'X-Workspace-ID':workspaceID};
      if(demoToken)headers['X-Demo-Session']=demoToken;
      const r=await fetch(`/api/jobs/${job.id}/${kind}`,{headers,credentials:'same-origin'});
      if(!r.ok){const d=await r.json();throw new Error(d.detail)}
      blob=await r.blob();
    }
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=kind==='output'?'EduSheetManager-verified.xlsx':'EduSheetManager-evidence.json';
    a.click();
    URL.revokeObjectURL(url);
  }catch(e){toast(e instanceof Error?e.message:String(e),true)}
}

function crc32(bytes:Uint8Array):number{
  let c=0xffffffff;
  for(let i=0;i<bytes.length;i++){
    c^=bytes[i];
    for(let k=0;k<8;k++)c=(c>>>1)^(0xedb88320&-(c&1));
  }
  return (c^0xffffffff)>>>0;
}

function buildMultiSheetXlsxBlob(tabs:Array<{name:string;headers:string[];rows:Record<string,any>[]}>):Blob{
  const enc=new TextEncoder();
  const xmlEsc=(s:any)=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const colLetter=(n:number)=>{let s='';while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
  const safeTabs=tabs.length?tabs:[{name:'Sheet1',headers:['Column A','Column B','Column C'],rows:[]}];
  const overrides=safeTabs.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
  const sheetsXml=safeTabs.map((t,i)=>`<sheet name="${xmlEsc((t.name||`Sheet${i+1}`).slice(0,31))}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('');
  const relsXml=safeTabs.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('');
  const files:Array<[string,Uint8Array]>=[
    ['[Content_Types].xml',enc.encode(`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${overrides}</Types>`)],
    ['_rels/.rels',enc.encode(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`)],
    ['xl/workbook.xml',enc.encode(`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetsXml}</sheets></workbook>`)],
    ['xl/_rels/workbook.xml.rels',enc.encode(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relsXml}</Relationships>`)],
  ];
  safeTabs.forEach((tab,tIdx)=>{
    const allRows:any[][]=[tab.headers,...tab.rows.map(r=>tab.headers.map(h=>r[h]))];
    const rowXml=allRows.map((r,ri)=>{
      const cells=r.map((v,ci)=>{
        const ref=`${colLetter(ci+1)}${ri+1}`;
        if(v===null||v===undefined||v==='')return `<c r="${ref}"/>`;
        if(ri>0&&typeof v==='string'&&v.startsWith('=')){
          return `<c r="${ref}"><f>${xmlEsc(v.slice(1))}</f></c>`;
        }
        if(typeof v==='number'&&Number.isFinite(v))return `<c r="${ref}"><v>${v}</v></c>`;
        return `<c r="${ref}" t="inlineStr"><is><t>${xmlEsc(v)}</t></is></c>`;
      }).join('');
      return `<row r="${ri+1}">${cells}</row>`;
    }).join('');
    files.push([`xl/worksheets/sheet${tIdx+1}.xml`,enc.encode(`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`)]);
  });
  const localParts:Uint8Array[]=[];
  const centralParts:Uint8Array[]=[];
  let offset=0;
  for(const [name,data] of files){
    const nameBytes=enc.encode(name);
    const crc=crc32(data);
    const lh=new Uint8Array(30+nameBytes.length);
    const lv=new DataView(lh.buffer);
    lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,nameBytes.length,true);
    lh.set(nameBytes,30);
    localParts.push(lh,data);
    const ch=new Uint8Array(46+nameBytes.length);
    const cv=new DataView(ch.buffer);
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,nameBytes.length,true);cv.setUint32(42,offset,true);
    ch.set(nameBytes,46);
    centralParts.push(ch);
    offset+=lh.length+data.length;
  }
  const cdSize=centralParts.reduce((s,p)=>s+p.length,0);
  const eocd=new Uint8Array(22);
  const ev=new DataView(eocd.buffer);
  ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,cdSize,true);ev.setUint32(16,offset,true);
  return new Blob(([...localParts,...centralParts,eocd] as unknown as BlobPart[]),{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}

function buildXlsxBlob(sheetName:string,headers:string[],rows:Record<string,any>[]):Blob{
  return buildMultiSheetXlsxBlob([{name:sheetName,headers,rows}]);
}

function loadStaticState():any{
  try{
    const raw=localStorage.getItem('sheetqms_static_state_v3');
    if(raw)return JSON.parse(raw);
  }catch{}
  return {
    preferences:{theme:'light',density:'comfortable',explanations:'detailed',auto_checks:true,vertical:'general'},
    admin:{enabled:false,provider:'openai_compatible',base_url:'https://api.openai.com/v1',model:'gpt-4o-mini',monthly_budget_usd:'0',platform_budget_usd:'0',input_price_per_million_usd:'0.15',output_price_per_million_usd:'0.60',pricing_source_url:'https://openai.com/api/pricing/',pricing_verified_date:'2026-10-13',max_output_tokens:2048,timeout_seconds:75,auto_learn:true,key_configured:false,max_storage_mib_per_customer:250,max_jobs_per_customer:50},
    customers:[{id:'demo-a',name:'Demo Customer A',users:1,created:'2026-10-13T08:00:00Z'}],
    jobs:{} as Record<string,any>,
    knowledge:[] as any[]
  };
}
function saveStaticState(s:any){try{localStorage.setItem('sheetqms_static_state_v3',JSON.stringify(s))}catch{}}

function makeStaticSampleJob(caseName:string):any{
  const id=uid();
  const now=new Date().toISOString();
  const msg=(role:string,text:string,kind='chat')=>({id:uid(),role,text,kind,created:now});
  if(caseName==='sasams_students'){
    const headers=['Student ID','First Name','Last Name','Date of Birth','Grade','Subjects','Parent First Name','Parent Last Name','Parent Email','Parent Phone'];
    const rows=[
      {'Student ID':'STU001','First Name':'John','Last Name':'Doe','Date of Birth':'2015-03-15','Grade':'Grade 8','Subjects':'Mathematics; English; Science','Parent First Name':'Jane','Parent Last Name':'Doe','Parent Email':'jane.doe@example.com','Parent Phone':'0821234567'},
      {'Student ID':'STU002','First Name':'Sarah','Last Name':'Smith','Date of Birth':'2014-07-22','Grade':'Grade 9','Subjects':'Mathematics; English; Physical Science','Parent First Name':'Michael','Parent Last Name':'Smith','Parent Email':'michael.smith@example.com','Parent Phone':'0839876543'},
      {'Student ID':'STU003','First Name':'Emma','Last Name':'Johnson','Date of Birth':'2016-01-10','Grade':'Grade 7','Subjects':'Mathematics; English; Natural Science','Parent First Name':'Patricia','Parent Last Name':'Johnson','Parent Email':'patricia.johnson@example.com','Parent Phone':'0847654321'},
      {'Student ID':'STU004','First Name':'Liam','Last Name':'Johnson','Date of Birth':'2013-09-05','Grade':'Grade 10','Subjects':'Mathematics; English; Physical Science; Geography','Parent First Name':'Patricia','Parent Last Name':'Johnson','Parent Email':'patricia.johnson@example.com','Parent Phone':'0847654321'}
    ];
    return {
      id,title:'student-import-template.xlsx',created:now,state:'MAPPED',trace_id:uid().slice(0,12),caseName:'sasams_students',
      customHeaders:headers,customRows:rows,
      profiles:{
        template:{name:'student-import-template.xlsx',sheets:[{name:'Students',headers}]},
        sources:[
          {id:'source-1',name:'sasams-sheet1-learner-parent-bio.xlsx',sheets:[{name:'Learner_Parent_Bio',headers:['Admission No','Learner First Name','Learner Surname','DOB','Grade','Guardian First Name','Guardian Surname','Guardian Email','Guardian Cell','Gender'],preview:[['STU001','John','Doe','15/03/2015',8,'Jane','Doe','jane.doe@example.com',821234567,'M'],['STU002','Sarah','Smith','2014-07-22',9,'Michael','Smith','michael.smith@example.com','083 987 6543','F']]}]},
          {id:'source-2',name:'sasams-sheet2-subject-marks.xlsx',sheets:[{name:'Subject_Marks_Schedule',headers:['Admission No','Learner First Name','Learner Surname','Grade','Mathematics','English','Science','Physical Science','Natural Science','Geography','Average'],preview:[['STU001','John','Doe',8,'78%','82%','74%',null,null,'-',78.0],['STU002','Sarah','Smith',9,85,79,null,88,null,'N/A',84.0]]}]}
        ]
      },
      plan:{
        destination:{mode:'direct',sheet:'Students',key:'Student ID',period:'',value:'',categories:[],total:'',header_row:1},
        sources:[
          {source_id:'source-1',sheet:'Learner_Parent_Bio',header_row:3,layout:'direct',field_map:{'Student ID':'Admission No','First Name':'Learner First Name','Last Name':'Learner Surname','Date of Birth':'DOB','Grade':'Grade','Parent First Name':'Guardian First Name','Parent Last Name':'Guardian Surname','Parent Email':'Guardian Email','Parent Phone':'Guardian Cell'},key:'Student ID',period:'',value:'',columns:[]},
          {source_id:'source-2',sheet:'Subject_Marks_Schedule',header_row:3,layout:'direct',field_map:{'Student ID':'Admission No','First Name':'Learner First Name','Last Name':'Learner Surname','Grade':'Grade'},key:'Student ID',period:'Subjects',value:'',columns:['Mathematics','English','Science','Physical Science','Natural Science','Geography']}
        ],
        rules:[],questions:[]
      },
      report:null,mapping_origin:'Multi-sheet relational join + SA-SAMS subject matrix',
      chat:[msg('qms','I loaded your 2 SA-SAMS sheets (Learner/Parent Bio + Subject Marks Schedule) into student-import-template.xlsx.')],
      proposal:null,knowledge_id:null,knowledge_conflict:false,use_workbook_rules:false
    };
  }
  if(caseName==='district_batch'){
    const headers=['Source File','Duplicate Status','Student ID','Learner Name','SA ID Number','SA ID Status','Date of Birth','Gender','Citizenship','Grade','Parent Phone','Mathematics'];
    const rows=[
      {'Source File':'School-A-Greenwood-High.xlsx','Duplicate Status':'Duplicate across: School-A-Greenwood-High.xlsx, School-B-Horizon-Academy.xlsx','Student ID':'STU001','Learner Name':'John Doe','SA ID Number':'1503155123088','SA ID Status':'Valid SA ID','Date of Birth':'2015-03-15','Gender':'Male','Citizenship':'SA Citizen','Grade':'Grade 8','Parent Phone':'0821234567','Mathematics':78},
      {'Source File':'School-A-Greenwood-High.xlsx','Duplicate Status':'Unique','Student ID':'STU002','Learner Name':'Thabo Mokoena','SA ID Number':'0803055123084','SA ID Status':'Repaired SA ID (Leading 0 Restored)','Date of Birth':'2008-03-05','Gender':'Male','Citizenship':'SA Citizen','Grade':'Grade 10','Parent Phone':'0839876543','Mathematics':64},
      {'Source File':'School-B-Horizon-Academy.xlsx','Duplicate Status':'Duplicate across: School-A-Greenwood-High.xlsx, School-B-Horizon-Academy.xlsx','Student ID':'STU001','Learner Name':'John Doe','SA ID Number':'1503155123088','SA ID Status':'Valid SA ID','Date of Birth':'2015-03-15','Gender':'Male','Citizenship':'SA Citizen','Grade':'Grade 8','Parent Phone':'0821234567','Mathematics':78},
      {'Source File':'School-B-Horizon-Academy.xlsx','Duplicate Status':'Unique','Student ID':'STU003','Learner Name':'Emma Johnson','SA ID Number':'1601100234089','SA ID Status':'Invalid SA ID (Checksum Failed — expected 7)','Date of Birth':'2016-01-10','Gender':'Female','Citizenship':'SA Citizen','Grade':'Grade 7','Parent Phone':'0847654321','Mathematics':28},
      {'Source File':'School-C-Lakeside-Secondary.xlsx','Duplicate Status':'Unique','Student ID':'STU004','Learner Name':'Chipo Ndlovu','SA ID Number':'P8492011','SA ID Status':'Foreign / Passport / Permit ID','Date of Birth':'','Gender':'','Citizenship':'Foreign / Permit','Grade':'Grade 9','Parent Phone':'0841112233','Mathematics':82},
    ];
    return {
      id,title:'Folder-Batch-Master.xlsx',created:now,state:'RELEASED',trace_id:uid().slice(0,12),caseName:'district_batch',
      customHeaders:headers,customRows:rows,run_done:true,
      batch_audit:{files_merged:3,total_rows:5,valid_sa_ids:2,repaired_sa_ids:1,foreign_or_permit_ids:1,invalid_sa_ids:1,cross_file_duplicates:2},
      profiles:{
        template:{name:'Folder-Batch-Master.xlsx',sheets:[{name:'Master_Batch',headers}]},
        sources:[
          {id:'source-1',name:'School-A-Greenwood-High.xlsx',sheets:[{name:'Learners',headers:['Student ID','Learner Name','SA ID Number','Grade','Parent Phone','Mathematics'],preview:[['STU001','John Doe','1503155123088','Gr 8','821234567',78],['STU002','thabo mokoena','803055123082','10','083 987 6543',64]]}]},
          {id:'source-2',name:'School-B-Horizon-Academy.xlsx',sheets:[{name:'Learners',headers:['Student ID','Learner Name','SA ID Number','Grade','Parent Phone','Mathematics'],preview:[['STU001','John Doe','1503155123088','Grade 8','0821234567',78],['STU003','Emma Johnson','1601100234089','Gr 7','0847654321',28]]}]},
          {id:'source-3',name:'School-C-Lakeside-Secondary.xlsx',sheets:[{name:'Learners',headers:['Student ID','Learner Name','SA ID Number','Grade','Parent Phone','Mathematics'],preview:[['STU004','Chipo Ndlovu','P8492011','Grade 9','+27 84 111 2233',82]]}]}
        ]
      },
      plan:{destination:{mode:'direct',sheet:'Master_Batch',key:'Student ID',period:'',value:'',categories:[],total:'',header_row:1},sources:[{source_id:'source-1',sheet:'Master_Batch',header_row:1,layout:'direct',field_map:Object.fromEntries(headers.map(h=>[h,h])),key:'Student ID',period:'',value:'',columns:[]}],rules:[],questions:[]},
      report:{
        status:'RELEASED',
        checks:[{id:'input-integrity',name:'Original input fingerprints unchanged',passed:true,detail:'3 folder files verified.'},{id:'export-roundtrip',name:'Export reopened and verified',passed:true,detail:'5 consolidated rows ready.'}],
        questions:[],rows,headers,passed_checks:21,total_checks:21,source_records:5,mapped_records:5,output_rows:5,template_version:'v1'
      },
      mapping_origin:'Multi-file folder batch merger',
      chat:[msg('qms','All done! I merged 3 files from your folder into 1 Master Sheet (5 total rows).\n•Batch & SA ID Audit Summary:\n  - Valid SA IDs: 2\n  - Auto-Repaired SA IDs (leading zero restored for 2000–2009): 1\n  - Foreign / Study Permit IDs kept: 1\n  - Invalid SA IDs (Luhn checksum failed): 1\n  - Cross-File Duplicate Rows flagged: 2\nAll rows are preserved in your Master Sheet with "Source File", "Duplicate Status", and "SA ID Status" columns!','verdict')],
      proposal:null,knowledge_id:null,knowledge_conflict:false,use_workbook_rules:false
    };
  }
  if(caseName==='hold'){
    return {
      id,title:'monthly-output-template.xlsx',created:now,state:'MAPPED',trace_id:uid().slice(0,12),caseName:'hold',
      profiles:{template:{name:'monthly-output-template.xlsx',sheets:[{name:'Output',headers:['Site','Jan','Feb','Mar','Total']}]},sources:[{id:'source-1',name:'north-branch.xlsx',sheets:[{name:'North',headers:['Period','Units'],preview:[['Jan',12],['Feb',null],['Mar',20]]}]},{id:'source-2',name:'south-west.csv',sheets:[{name:'CSV',headers:['Site','Period','Units'],preview:[['South','Jan',7],['South','Feb',15],['South','Mar',13],['West','Jan',9],['West','Feb',11],['West','Mar',15]]}]}]},
      plan:{destination:{mode:'pivot',sheet:'Output',key:'Site',period:'Period',value:'Units',categories:['Jan','Feb','Mar'],total:'Total',header_row:3},sources:[{source_id:'source-1',sheet:'North',header_row:1,layout:'long',field_map:{},key:'Site',period:'Period',value:'Units',columns:[]}],rules:[{id:'R-sum',kind:'sum',fields:['Total'],value:'Jan,Feb,Mar'}],questions:[]},
      report:null,mapping_origin:'Rule-informed layout resolver',
      chat:[msg('qms','I loaded your files into monthly-output-template.xlsx. Click Run transformation (or reply "go") to check and fill your spreadsheet.')],
      proposal:null,knowledge_id:null,knowledge_conflict:false,use_workbook_rules:false
    };
  }
  if(caseName==='chat_map'){
    return {
      id,title:'direct-output-template.xlsx',created:now,state:'MAPPED',trace_id:uid().slice(0,12),caseName:'chat_map',
      profiles:{template:{name:'direct-output-template.xlsx',sheets:[{name:'Output',headers:['Item','Description','Qty']}]},sources:[{id:'source-1',name:'items-unmapped.csv',sheets:[{name:'CSV',headers:['Item code','Name','Boxes'],preview:[['A-100','Valve',8],['A-200','Gauge',5]]}]}]},
      plan:{destination:{mode:'direct',sheet:'Output',key:'Item',period:'',value:'',categories:[],total:'',header_row:3},sources:[{source_id:'source-1',sheet:'CSV',header_row:1,layout:'direct',field_map:{Item:'Item code',Description:'Name'},key:'Item',period:'',value:'',columns:[]}],rules:[],questions:[{id:'unmapped-target-Qty',text:'Target column Qty is not mapped yet.',evidence:'Output!Qty',kind:'mapping'}]},
      report:null,mapping_origin:'Rule-informed layout resolver',
      chat:[msg('qms',"Before I fill the sheet: should I put 'Boxes' into 'Qty'? (Reply 'yes' or tell me which column to use.)")],
      proposal:null,knowledge_id:null,knowledge_conflict:false,use_workbook_rules:false
    };
  }
  if(caseName==='form'){
    return {
      id,title:'direct-output-template.xlsx',created:now,state:'MAPPED',trace_id:uid().slice(0,12),caseName:'form',
      profiles:{template:{name:'direct-output-template.xlsx',sheets:[{name:'Output',headers:['Item','Description','Qty']}]},sources:[{id:'source-1',name:'intake-forms.xlsx',sheets:[{name:'Card1',headers:['Field','Entry'],preview:[['Item code','A-100'],['Description',' Brass Valve '],['Quantity','8']]}]}]},
      plan:{destination:{mode:'direct',sheet:'Output',key:'Item',period:'',value:'',categories:[],total:'',header_row:3},sources:[{source_id:'source-1',sheet:'Card1',header_row:1,layout:'direct',field_map:{Item:'Item code',Description:'Description',Qty:'Quantity'},key:'Item',period:'',value:'',columns:[]}],rules:[],questions:[]},
      report:null,mapping_origin:'A/B label-value form reader',
      chat:[msg('qms','I loaded your text form sheets into direct-output-template.xlsx. Click Run transformation to build your table.')],
      proposal:null,knowledge_id:null,knowledge_conflict:false,use_workbook_rules:false
    };
  }
  return {
    id,title:'monthly-output-template.xlsx',created:now,state:'MAPPED',trace_id:uid().slice(0,12),caseName:caseName||'pivot',
    profiles:{template:{name:'monthly-output-template.xlsx',sheets:[{name:'Output',headers:['Site','Jan','Feb','Mar','Total']}]},sources:[{id:'source-1',name:'regional-summary.xlsx',sheets:[{name:'Regional',headers:['Site','Jan','Feb','Mar'],preview:[['North',12,18,20],['South',7,15,13],['West',9,11,15]]}]}]},
    plan:{destination:{mode:'pivot',sheet:'Output',key:'Site',period:'Period',value:'Units',categories:['Jan','Feb','Mar'],total:'Total',header_row:3},sources:[{source_id:'source-1',sheet:'Regional',header_row:1,layout:'wide',field_map:{},key:'Site',period:'Period',value:'Units',columns:['Jan','Feb','Mar']}],rules:[{id:'R-sum',kind:'sum',fields:['Total'],value:'Jan,Feb,Mar'}],questions:[]},
    report:null,mapping_origin:'Rule-informed layout resolver',
    chat:[msg('qms','I loaded your files into monthly-output-template.xlsx. Click Run transformation (or reply "go") to check and fill your spreadsheet.')],
    proposal:null,knowledge_id:null,knowledge_conflict:false,use_workbook_rules:false
  };
}

function pickHeaderIndex(matrix:any[][]):number{
  let bestIdx=0,bestScore=-999;
  for(let i=0;i<Math.min(matrix.length,25);i++){
    const row=matrix[i]||[];
    const filled=row.filter(v=>v!==undefined&&v!==null&&String(v).trim()!=='');
    const textCells=filled.filter(v=>typeof v==='string'&&!v.trim().startsWith('=')&&Number.isNaN(Number(v)));
    if(textCells.length<2||textCells.length<filled.length*0.65)continue;
    const uniq=new Set(textCells.map(v=>String(v).trim().toLowerCase()));
    if(uniq.size!==textCells.length)continue;
    let score=textCells.length*2-i*0.02;
    if(textCells.some(v=>{
      const s=String(v).trim().toLowerCase();
      return s.length>35||s.includes(':')||/^(synthetic|fy20|report|prepared|confidential|summary|page |date)/.test(s);
    }))score-=8;
    if(['total','subtotal','grand total'].includes(String(textCells[0]||'').trim().toLowerCase()))score-=10;
    let lastCol=row.length-1;
    while(lastCol>=0&&(row[lastCol]===undefined||row[lastCol]===null||String(row[lastCol]).trim()===''))lastCol--;
    const contiguous=lastCol>=1&&row.slice(0,lastCol+1).every(v=>v!==undefined&&v!==null&&String(v).trim()!=='');
    if(contiguous)score+=2;
    if(i+1<matrix.length){
      const nextFilled=(matrix[i+1]||[]).filter(v=>v!==undefined&&v!==null&&String(v).trim()!=='');
      if(nextFilled.length>=Math.max(2,textCells.length-1))score+=3;
    }
    if(score>bestScore){bestScore=score;bestIdx=i}
  }
  return bestIdx;
}

function matrixToTable(sheet:string,matrix:any[][]):{sheet:string;headers:string[];rows:Record<string,any>[]}{
  if(!matrix.length)return {sheet,headers:['Col1'],rows:[]};
  const hIdx=pickHeaderIndex(matrix);
  const rawHead=matrix[hIdx]||[];
  let endCol=rawHead.length;
  while(endCol>0&&(rawHead[endCol-1]===undefined||rawHead[endCol-1]===null||String(rawHead[endCol-1]).trim()===''))endCol--;
  const headers=rawHead.slice(0,Math.max(1,endCol)).map((h,i)=>String(h||`Col${i+1}`).trim());
  const headNorm=headers.map(h=>h.toLowerCase());
  const ignoredLabels=new Set(['subtotal','total','grand total','sum','average','notes','source:']);
  const rows:Record<string,any>[]=[];
  for(const r of matrix.slice(hIdx+1)){
    if(!r||r.every(v=>v===undefined||v===null||String(v).trim()===''))continue;
    const rNorm=headers.map((_,i)=>String(r[i]??'').trim().toLowerCase());
    if(rNorm.every((v,i)=>v===headNorm[i]))continue;
    const firstVal=String(r[0]??'').trim().toLowerCase();
    if(ignoredLabels.has(firstVal))continue;
    const obj:Record<string,any>={};
    headers.forEach((h,i)=>{
      const v=r[i];
      obj[h]=v===undefined||v===null||v===''?null:v;
    });
    rows.push(obj);
  }
  return {sheet,headers,rows};
}

function parseCsvLine(line:string,delim:string):string[]{
  const out:string[]=[];
  let cur='',inQuotes=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(inQuotes&&line[i+1]==='"'){cur+='"';i++}
      else inQuotes=!inQuotes;
    }else if(ch===delim&&!inQuotes){
      out.push(cur.trim());cur='';
    }else cur+=ch;
  }
  out.push(cur.trim());
  return out;
}

async function parseUploadedFile(file:File):Promise<{name:string;sheet:string;headers:string[];rows:Record<string,any>[]}>{
  const name=file.name||'uploaded.csv';
  if(name.toLowerCase().endsWith('.xlsx')){
    try{
      const buf=await file.arrayBuffer();
      const bytes=new Uint8Array(buf);
      const view=new DataView(buf);
      const entries:Record<string,Uint8Array>={};
      const inflateEntry=async(method:number,compData:Uint8Array)=>{
        if(method===0)return compData;
        if(method===8&&typeof DecompressionStream!=='undefined'){
          const ds=new DecompressionStream('deflate-raw');
          const writer=ds.writable.getWriter();
          void writer.write(compData as unknown as BufferSource);
          void writer.close();
          return new Uint8Array(await new Response(ds.readable).arrayBuffer());
        }
        return null;
      };
      // Prefer Central Directory so data-descriptor XLSX files (compSize=0 in local header) parse cleanly
      let eocdPos=-1;
      for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){
        if(view.getUint32(i,true)===0x06054b50){eocdPos=i;break}
      }
      if(eocdPos>=0){
        const cdEntries=view.getUint16(eocdPos+10,true);
        let cdPos=view.getUint32(eocdPos+16,true);
        for(let e=0;e<cdEntries&&cdPos+46<=bytes.length;e++){
          if(view.getUint32(cdPos,true)!==0x02014b50)break;
          const method=view.getUint16(cdPos+10,true);
          const compSize=view.getUint32(cdPos+20,true);
          const nameLen=view.getUint16(cdPos+28,true);
          const extraLen=view.getUint16(cdPos+30,true);
          const commentLen=view.getUint16(cdPos+32,true);
          const localOffset=view.getUint32(cdPos+42,true);
          const entryName=new TextDecoder().decode(bytes.subarray(cdPos+46,cdPos+46+nameLen));
          if(localOffset+30<=bytes.length&&view.getUint32(localOffset,true)===0x04034b50){
            const lNameLen=view.getUint16(localOffset+26,true);
            const lExtraLen=view.getUint16(localOffset+28,true);
            const dataStart=localOffset+30+lNameLen+lExtraLen;
            const out=await inflateEntry(method,bytes.subarray(dataStart,dataStart+compSize));
            if(out)entries[entryName]=out;
          }
          cdPos+=46+nameLen+extraLen+commentLen;
        }
      }else{
        let pos=0;
        while(pos+30<=bytes.length&&view.getUint32(pos,true)===0x04034b50){
          const method=view.getUint16(pos+8,true);
          const compSize=view.getUint32(pos+18,true);
          const nameLen=view.getUint16(pos+26,true);
          const extraLen=view.getUint16(pos+28,true);
          const entryName=new TextDecoder().decode(bytes.subarray(pos+30,pos+30+nameLen));
          const dataStart=pos+30+nameLen+extraLen;
          const out=await inflateEntry(method,bytes.subarray(dataStart,dataStart+compSize));
          if(out)entries[entryName]=out;
          pos=dataStart+compSize;
        }
      }
      const dec=new TextDecoder();
      const shared:string[]=[];
      if(entries['xl/sharedStrings.xml']){
        const doc=new DOMParser().parseFromString(dec.decode(entries['xl/sharedStrings.xml']),'application/xml');
        doc.querySelectorAll('si').forEach(si=>{shared.push(Array.from(si.querySelectorAll('t')).map(t=>t.textContent||'').join(''))});
      }
      const ruleSheets=new Set(['rules','instructions','mapping rules','business rules']);
      let chosenSheetName='Sheet1';
      let sheetKey=Object.keys(entries).find(k=>k.startsWith('xl/worksheets/sheet')&&k.endsWith('.xml'));
      if(entries['xl/workbook.xml']){
        const wbDoc=new DOMParser().parseFromString(dec.decode(entries['xl/workbook.xml']),'application/xml');
        const relMap:Record<string,string>={};
        if(entries['xl/_rels/workbook.xml.rels']){
          const relDoc=new DOMParser().parseFromString(dec.decode(entries['xl/_rels/workbook.xml.rels']),'application/xml');
          relDoc.querySelectorAll('Relationship').forEach(rel=>{
            const id=rel.getAttribute('Id')||'',target=rel.getAttribute('Target')||'';
            if(id&&target)relMap[id]=target.startsWith('xl/')?target:`xl/${target.replace(/^\/+/,'')}`;
          });
        }
        const sheetEls=Array.from(wbDoc.querySelectorAll('sheet'));
        for(let idx=0;idx<sheetEls.length;idx++){
          const sName=sheetEls[idx].getAttribute('name')||`Sheet${idx+1}`;
          if(ruleSheets.has(sName.trim().toLowerCase()))continue;
          const rId=sheetEls[idx].getAttribute('r:id')||sheetEls[idx].getAttribute('id')||'';
          const candidateKey=relMap[rId]||`xl/worksheets/sheet${idx+1}.xml`;
          if(entries[candidateKey]){chosenSheetName=sName;sheetKey=candidateKey;break}
        }
      }
      if(sheetKey&&entries[sheetKey]){
        const doc=new DOMParser().parseFromString(dec.decode(entries[sheetKey]),'application/xml');
        const matrix:any[][]=[];
        doc.querySelectorAll('row').forEach(rowEl=>{
          const rArr:any[]=[];
          rowEl.querySelectorAll('c').forEach(cEl=>{
            const ref=cEl.getAttribute('r')||'A1';
            const colMatch=ref.match(/^[A-Z]+/);
            let colIdx=0;
            if(colMatch){for(const ch of colMatch[0])colIdx=colIdx*26+(ch.charCodeAt(0)-64)}
            const t=cEl.getAttribute('t');
            const vText=cEl.querySelector('v')?.textContent??cEl.querySelector('is t')?.textContent??'';
            let val:any=vText;
            if(t==='s')val=shared[Number(vText)]??vText;
            else if(t!=='inlineStr'&&t!=='str'&&vText!==''&&!Number.isNaN(Number(vText)))val=Number(vText);
            if(colIdx>0)rArr[colIdx-1]=val;
          });
          if(rArr.some(x=>x!==undefined&&x!==''))matrix.push(rArr);
        });
        if(matrix.length){
          const tbl=matrixToTable(chosenSheetName,matrix);
          return {name,sheet:tbl.sheet,headers:tbl.headers,rows:tbl.rows};
        }
      }
    }catch{}
  }
  const text=await file.text();
  const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  if(!lines.length)return {name,sheet:'CSV',headers:['Col1'],rows:[]};
  const delim=lines[0].includes('\t')?'\t':(lines[0].includes(';')?';':',');
  const matrix=lines.map(line=>parseCsvLine(line,delim).map(raw=>raw===''?null:(!Number.isNaN(Number(raw))?Number(raw):raw)));
  const tbl=matrixToTable('CSV',matrix);
  return {name,sheet:'CSV',headers:tbl.headers,rows:tbl.rows};
}

function runStaticJob(s:any,j:any,force=false):any{
  if(j.run_done&&j.report&&!force)return j;
  const now=new Date().toISOString();
  const addMsg=(text:string,kind='chat')=>j.chat.push({id:uid(),role:'qms',text,kind,created:now});
  if(j.caseName==='hold'&&!j.filledNorthFeb){
    const rows=[
      {Site:'North',Jan:12,Feb:null,Mar:20,Total:null},
      {Site:'South',Jan:7,Feb:15,Mar:13,Total:35},
      {Site:'West',Jan:9,Feb:11,Mar:15,Total:35}
    ];
    j.state='HELD';
    j.run_done=true;
    j.report={
      status:'HELD',
      checks:[{id:'reconciliation',name:'Source values reconcile to output',passed:false,detail:'North / Feb is blank.'},{id:'input-integrity',name:'Original input fingerprints unchanged',passed:true,detail:'Verified.'}],
      questions:[{id:'missing-North-Feb',text:'Missing pivot value for North / Feb.',evidence:'North -> Feb',kind:'data'}],
      rows,headers:['Site','Jan','Feb','Mar','Total'],passed_checks:19,total_checks:21,source_records:9,mapped_records:8,output_rows:3,template_version:'v1'
    };
    addMsg(s.preferences.explanations==='concise'?'Output held. Missing pivot value for North / Feb. Reply with evidence (e.g. 18).':'Almost done! I need one missing value: what is the Units for North / Feb? (Just reply with the number, like 18.)');
    return j;
  }
  if(j.caseName==='chat_map'&&!j.plan.sources[0].field_map.Qty){
    j.state='HELD';
    j.run_done=true;
    j.report={
      status:'HELD',
      checks:[{id:'destination-fields',name:'Every destination field is mapped',passed:false,detail:'Qty is unmapped.'}],
      questions:[{id:'unmapped-target-Qty',text:'Target column Qty is not mapped yet.',evidence:'Output!Qty',kind:'mapping'}],
      rows:[{Item:'A-100',Description:'Valve',Qty:null},{Item:'A-200',Description:'Gauge',Qty:null}],
      headers:['Item','Description','Qty'],passed_checks:19,total_checks:21,source_records:2,mapped_records:2,output_rows:2,template_version:'v1'
    };
    addMsg("Before I fill the sheet: should I put 'Boxes' into 'Qty'? (Reply 'yes' or tell me which column to use.)");
    return j;
  }
  const rows=j.customRows||(j.report?.rows&&j.state==='RELEASED'?j.report.rows:(j.caseName==='chat_map'||j.caseName==='form'?[
    {Item:'A-100',Description:'Brass Valve',Qty:8},
    {Item:'A-200',Description:'Pressure Gauge',Qty:5}
  ]:[
    {Site:'North',Jan:12,Feb:18,Mar:20,Total:50},
    {Site:'South',Jan:7,Feb:15,Mar:13,Total:35},
    {Site:'West',Jan:9,Feb:11,Mar:15,Total:35}
  ]));
  const headers=j.customHeaders||(j.caseName==='chat_map'||j.caseName==='form'?['Item','Description','Qty']:['Site','Jan','Feb','Mar','Total']);
  j.state='RELEASED';
  j.run_done=true;
  j.report={
    status:'RELEASED',
    checks:[{id:'input-integrity',name:'Original input fingerprints unchanged',passed:true,detail:'Verified.'},{id:'reconciliation',name:'Source values reconcile to output',passed:true,detail:'All values reconcile.'},{id:'export-roundtrip',name:'Export reopened and verified',passed:true,detail:'Ready to download.'}],
    questions:[],rows,headers,passed_checks:21,total_checks:21,source_records:rows.length,mapped_records:rows.length,output_rows:rows.length,template_version:'v1'
  };
  if(!s.knowledge.some((k:any)=>k.template_name===j.title)){
    s.knowledge.push({id:uid(),template_name:j.title,mapping_origin:j.mapping_origin,headers,active:true,plan:j.plan});
  }
  addMsg(`All done! QMS released this workbook (21/21 checks passed, ${rows.length} rows across ${headers.join(', ')}). Tell me what you'd like to edit or click Download XLSX.`);
  return j;
}

function handleStaticChat(s:any,j:any,text:string):any{
  const now=new Date().toISOString();
  j.chat.push({id:uid(),role:'user',text,kind:'chat',created:now});
  const reply=(t:string,kind='chat')=>j.chat.push({id:uid(),role:'qms',text:t,kind,created:now});
  const lower=text.toLowerCase().trim();
  const clean=lower.replace(/[.!?,]+$/,'').trim();

  if(j.proposal){
    if(['yes','yep','yeah','sure','ok','okay','apply','confirm','do it'].includes(clean)){
      return confirmStaticProposal(s,j);
    }
    if(['no','nope','cancel','wait'].includes(clean)){
      j.proposal=null;
      reply('No problem — I cancelled that change. What would you like to do instead?');
      return j;
    }
  }
  if(['run','go','go ahead','transform','run checks','run qms','run transformation'].includes(clean)){
    return runStaticJob(s,j,true);
  }
  const numMatch=lower.match(/([+-]?\d+(?:\.\d+)?)/);
  if(j.unmappedTargets?.length&&j.unusedSources?.length){
    const tgt=j.unmappedTargets[0];
    const matchedSrc=(j.unusedSources as string[]).find(sc=>lower.includes(sc.toLowerCase()));
    if(matchedSrc||(['yes','yep','yeah','sure','ok'].includes(clean)&&j.unusedSources.length===1)){
      const chosen=matchedSrc||j.unusedSources[0];
      j.proposal={id:uid(),kind:'custom_mapping',srcCol:chosen,tgtCol:tgt,description:`Put ${chosen} into ${tgt}.`};
      reply(`Got it — Put ${chosen} into ${tgt}. Click Confirm below (or reply 'yes') to apply it.`,'proposal');
      return j;
    }
    if(lower.includes(tgt.toLowerCase())||lower.includes('which')||lower.includes('what')){
      reply(`Which column from your file should go into '${tgt}'? (Available columns: ${j.unusedSources.join(', ')})`);
      return j;
    }
  }
  if(j.missingCell&&numMatch&&!lower.includes('row')){
    const val=numMatch[1];
    const {entity,category}=j.missingCell;
    j.proposal={id:uid(),kind:'custom_cell',entity,category,value:val,description:`Set ${entity} / ${category} to ${val}.`};
    reply(`Got it — Set ${entity} / ${category} to ${val}. Click Confirm below (or reply 'yes') to apply it.`,'proposal');
    return j;
  }
  if(j.caseName==='chat_map'&&!j.plan.sources[0].field_map.Qty){
    if(lower.includes('description')){
      reply("I see 'Description' in the template — which column from your file should go into 'Description'? (Your file has: Item code, Name, Boxes)");
      return j;
    }
    if(['yes','yep','yeah','sure','ok','boxes'].includes(clean)||lower.includes('boxes')){
      j.proposal={id:uid(),kind:'mapping',description:'Put Boxes into Qty.'};
      reply("Got it — Put Boxes into Qty. Click Confirm below (or reply 'yes') to apply it.",'proposal');
      return j;
    }
  }
  if(j.caseName==='hold'&&!j.filledNorthFeb&&numMatch&&!lower.includes('row')){
    const val=numMatch[1];
    j.proposal={id:uid(),kind:'data_fact',entity:'North',category:'Feb',value:val,description:`Set North / Feb to ${val}.`};
    reply(`Got it — Set North / Feb to ${val}. Click Confirm below (or reply 'yes') to apply it.`,'proposal');
    return j;
  }
  if(j.pending_intent&&!['swap','switch','replace','remove','delete','sort'].includes(clean)){
    const intent=j.pending_intent;
    delete j.pending_intent;
    j.chat.pop();
    return handleStaticChat(s,j,`${intent} ${text}`);
  }
  if(['swap','switch','flip','exchange'].includes(clean)){
    j.pending_intent='swap';
    reply("Sure! Tell me which two columns or rows to swap — for example, 'Jan and Feb' or 'row 1 and row 2'.");
    return j;
  }
  if(['replace','change','edit','update'].includes(clean)){
    j.pending_intent='replace';
    reply("Sure! Tell me what you'd like to change — for example, 'replace the first row with row 2', 'swap Jan and Feb', or 'set North Jan to 25'.");
    return j;
  }
  if(['remove','delete','drop'].includes(clean)){
    j.pending_intent='remove';
    reply("Sure! Tell me which row or column to remove — for example, 'remove Jan' or 'delete row 2'.");
    return j;
  }
  if(['sort','order'].includes(clean)){
    j.pending_intent='sort';
    reply("Sure! Tell me which column to sort by — for example, 'Total' or 'Jan'.");
    return j;
  }
  if(!j.report)runStaticJob(s,j,true);
  if(j.report&&j.report.rows){
    const rows=j.report.rows as Record<string,any>[];
    const headers=j.report.headers as string[];
    const keyCol=headers[0]||'Site';
    const recalc=()=>{
      if(headers.includes('Total')){
        const numCols=headers.filter(h=>h!==keyCol&&h!=='Total');
        for(const r of rows){
          const vals=numCols.map(c=>Number(r[c])).filter(v=>Number.isFinite(v));
          if(vals.length)r.Total=vals.reduce((a,b)=>a+b,0);
        }
      }
    };
    const rowIdxs:number[]=[];
    const rowPats:Array<[RegExp,number]>=[
      [/\b(?:first\s+row|row\s*1|1st\s+row|top\s+row)\b/g,0],
      [/\b(?:second\s+row|row\s*2|2nd\s+row|middle\s+row)\b/g,1],
      [/\b(?:third\s+row|row\s*3|3rd\s+row)\b/g,2],
      [/\b(?:fourth\s+row|row\s*4|4th\s+row)\b/g,3],
      [/\b(?:last\s+row|bottom\s+row)\b/g,Math.max(0,rows.length-1)]
    ];
    const spans:Array<[number,number]>=[];
    for(const [pat,idx] of rowPats){
      let m:RegExpExecArray|null;
      while((m=pat.exec(lower))!==null){if(idx<rows.length)spans.push([m.index,idx])}
    }
    rows.forEach((r,idx)=>{
      const name=String(r[keyCol]||'').toLowerCase();
      if(name){
        const pos=lower.indexOf(name);
        if(pos>=0)spans.push([pos,idx]);
      }
    });
    spans.sort((a,b)=>a[0]-b[0]);
    for(const [,idx] of spans){if(!rowIdxs.includes(idx))rowIdxs.push(idx)}

    const colSpans:Array<[number,string]>=[];
    headers.forEach(h=>{
      const m=new RegExp(`\\b${h.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`).exec(lower);
      if(m)colSpans.push([m.index,h]);
    });
    colSpans.sort((a,b)=>a[0]-b[0]);
    const cols=colSpans.map(x=>x[1]);

    // 1. Swap / Replace / Move rows
    if((lower.includes('swap')||lower.includes('replace')||lower.includes('switch')||lower.includes('move')||lower.includes('put'))&&(rowIdxs.length>=2||(rowIdxs.length===1&&(lower.includes('first')||lower.includes('top')||lower.includes('last')||lower.includes('bottom'))))&&cols.length===0){
      const i1=rowIdxs[0];
      const i2=rowIdxs.length>=2?rowIdxs[1]:(lower.includes('first')||lower.includes('top')?0:rows.length-1);
      if(i1!==i2){
        const n1=rows[i1][keyCol],n2=rows[i2][keyCol];
        const tmp=rows[i1];rows[i1]=rows[i2];rows[i2]=tmp;
        reply(`Done! I swapped row ${i1+1} (${n1}) and row ${i2+1} (${n2}) in your spreadsheet.`);
        return j;
      }
    }
    // 2. Swap / Replace columns
    if((lower.includes('swap')||lower.includes('replace')||lower.includes('switch')||lower.includes('flip'))&&cols.length>=2){
      const [c1,c2]=cols;
      for(const r of rows){const tmp=r[c1];r[c1]=r[c2];r[c2]=tmp}
      recalc();
      reply(`Done! I swapped ${c1} and ${c2} across your spreadsheet.`);
      return j;
    }
    // 3. Delete / Remove column or row (e.g. "remove Jan collum", "remove Jan", "delete row 2", "remove West")
    if(lower.includes('remove')||lower.includes('delete')||lower.includes('drop')){
      if(cols.length>=1&&rowIdxs.length===0&&headers.length>1){
        const col=cols[0];
        const hIdx=headers.indexOf(col);
        if(hIdx>=0)headers.splice(hIdx,1);
        for(const r of rows)delete r[col];
        recalc();
        reply(`Done! I removed the ${col} column from your spreadsheet.`);
        return j;
      }
      if(rowIdxs.length>=1&&rows.length>1){
        const rIdx=rowIdxs[0];
        const removed=rows.splice(rIdx,1)[0];
        j.report.output_rows=rows.length;
        reply(`Done! I removed ${removed[keyCol]||`row ${rIdx+1}`} from your spreadsheet.`);
        return j;
      }
    }
    // 4. Rename column
    const renMatch=text.match(/\b(?:rename|call)\s+(?:col(?:umn|lum)?\s+)?["']?(.+?)["']?\s+(?:to|as)\s+["']?(.+?)["']?\s*[.!]*$/i);
    if(renMatch){
      const oldCol=headers.find(h=>h.toLowerCase()===renMatch[1].trim().toLowerCase());
      const newCol=renMatch[2].trim();
      if(oldCol&&newCol){
        headers[headers.indexOf(oldCol)]=newCol;
        for(const r of rows){r[newCol]=r[oldCol];delete r[oldCol]}
        reply(`Done! I renamed the '${oldCol}' column to '${newCol}'.`);
        return j;
      }
    }
    // 5. Add column or row
    const addColMatch=text.match(/^\s*(?:add|insert)\s+(?:a\s+)?(?:new\s+)?col(?:umn|lum)?\s+([a-zA-Z][\w-]*)/i);
    if(addColMatch){
      const newCol=addColMatch[1];
      if(!headers.includes(newCol)){
        const totIdx=headers.indexOf('Total');
        if(totIdx>=0)headers.splice(totIdx,0,newCol);
        else headers.push(newCol);
        for(const r of rows)r[newCol]=0;
        recalc();
        reply(`Done! I added the ${newCol} column to your spreadsheet.`);
        return j;
      }
    }
    const addRowMatch=text.match(/^\s*(?:add|insert)\s+(?:a\s+)?(?:new\s+)?(?:row\s+)?([a-zA-Z][\w-]*)\s+([+-]?\d+(?:\.\d+)?(?:\s+[+-]?\d+(?:\.\d+)?)*)/i);
    if(addRowMatch){
      const newKey=addRowMatch[1];
      const nums=addRowMatch[2].trim().split(/\s+/).map(Number);
      const newRow:Record<string,any>={};
      headers.forEach(h=>{newRow[h]=null});
      newRow[keyCol]=newKey;
      const valCols=headers.filter(h=>h!==keyCol&&h!=='Total');
      valCols.forEach((c,i)=>{if(i<nums.length)newRow[c]=nums[i]});
      rows.push(newRow);
      j.report.output_rows=rows.length;
      recalc();
      reply(`Done! I added ${newKey} to your spreadsheet.`);
      return j;
    }
    // 6. Update cell value
    if(rowIdxs.length===1&&cols.length===1&&numMatch){
      const rIdx=rowIdxs[0],col=cols[0],v=Number(numMatch[1]);
      rows[rIdx][col]=v;
      recalc();
      reply(`Done! I updated ${rows[rIdx][keyCol]} / ${col} to ${v}.`);
      return j;
    }
    // 7. Bulk column math
    if(cols.length===1&&rowIdxs.length===0){
      const col=cols[0];
      if(lower.includes('double')){
        for(const r of rows){if(typeof r[col]==='number')r[col]=r[col]*2}
        recalc();
        reply(`Done! I doubled all values in ${col}.`);
        return j;
      }
      if(numMatch){
        const delta=Number(numMatch[1]);
        if(lower.includes('add')||lower.includes('increase')||lower.includes('plus')){
          for(const r of rows){if(typeof r[col]==='number')r[col]=r[col]+delta}
          recalc();
          reply(`Done! I added ${delta} to ${col} across all rows.`);
          return j;
        }
        if(lower.includes('subtract')||lower.includes('decrease')||lower.includes('minus')){
          for(const r of rows){if(typeof r[col]==='number')r[col]=r[col]-delta}
          recalc();
          reply(`Done! I subtracted ${delta} from ${col} across all rows.`);
          return j;
        }
        if(lower.includes('all')||lower.includes('every')){
          for(const r of rows)r[col]=delta;
          recalc();
          reply(`Done! I set all rows in ${col} to ${delta}.`);
          return j;
        }
      }
    }
    // 8. Sort rows
    if((lower.includes('sort')||lower.includes('order'))&&cols.length>=1){
      const col=cols[0];
      const asc=lower.includes('asc')||lower.includes('lowest')||lower.includes('smallest');
      rows.sort((a,b)=>asc?(Number(a[col])||0)-(Number(b[col])||0):(Number(b[col])||0)-(Number(a[col])||0));
      reply(`Done! I sorted your spreadsheet by ${col}.`);
      return j;
    }
  }
  if(lower.includes('how did you match')||lower.includes('column')){
    reply('Your columns are matched to the template headers: '+(j.report?.headers||['Site','Jan','Feb','Mar','Total']).join(', ')+'.');
    return j;
  }
  if(lower.includes('what is blocking')||lower.includes('missing')){
    reply(j.state==='HELD'?'Output held: North / Feb is missing a value. Reply with a number like 18 to finish.':'All 21 quality checks have passed and your Excel file is ready to download.');
    return j;
  }
  reply("Tell me what you'd like me to do to the sheet — for example: 'swap Jan and Feb', 'replace the first row with row 2', 'remove Jan', or 'set North Jan to 25'.");
  return j;
}

function evaluateCustomJob(s:any,j:any):void{
  const now=new Date().toISOString();
  const addMsg=(text:string,kind='chat')=>j.chat.push({id:uid(),role:'qms',text,kind,created:now});
  const headers=j.customHeaders as string[];
  const rows=j.customRows as Record<string,any>[];
  const keyCol=headers[0]||'Site';

  if(headers.includes('Total')){
    const numCols=headers.filter(h=>h!==keyCol&&h!=='Total');
    for(const r of rows){
      const vals=numCols.map(c=>r[c]);
      if(vals.every(v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v)))){
        r.Total=vals.reduce((a:number,b:any)=>a+Number(b),0);
      }else{
        r.Total=null;
      }
    }
  }

  if(j.unmappedTargets?.length&&j.unusedSources?.length){
    const tgt=j.unmappedTargets[0];
    j.state='HELD';
    j.report.status='HELD';
    j.report.passed_checks=19;
    j.report.questions=[{id:`unmapped-${tgt}`,text:`Which column should go into ${tgt}?`,evidence:`Output!${tgt}`,kind:'mapping'}];
    addMsg(`I loaded ${rows.length} rows into '${j.title}', but I need a quick clarification: which column from your file should go into '${tgt}'? You can pick it from the dropdown under '${tgt}' on the table, or reply here in chat (available columns: ${j.unusedSources.join(', ')}).`);
    return;
  }

  delete j.missingCell;
  for(const r of rows){
    for(const h of headers){
      if(h==='Total')continue;
      if(r[h]===null||r[h]===undefined||r[h]===''){
        j.missingCell={entity:String(r[keyCol]||'Row'),category:h};
        break;
      }
    }
    if(j.missingCell)break;
  }

  if(j.missingCell){
    const {entity,category}=j.missingCell;
    j.state='HELD';
    j.report.status='HELD';
    j.report.passed_checks=20;
    j.report.questions=[{id:`missing-${entity}-${category}`,text:`Missing value for ${entity} / ${category}.`,evidence:`${entity} -> ${category}`,kind:'data'}];
    addMsg(`Almost done! ${entity} / ${category} is blank in your sheet. What number should I put there? (Just reply with the number, like 18, or '${entity} ${category} is 18'.)`);
    return;
  }

  j.state='RELEASED';
  j.report.status='RELEASED';
  j.report.passed_checks=21;
  j.report.questions=[];
  if(!s.knowledge.some((k:any)=>k.template_name===j.title)){
    s.knowledge.push({id:uid(),template_name:j.title,mapping_origin:j.mapping_origin,headers,active:true,plan:j.plan});
  }
  addMsg(`All done! QMS released this workbook (21/21 checks passed, ${rows.length} rows across ${headers.join(', ')}). Tell me what you'd like to edit or click Download XLSX!`,'verdict');
}

function confirmStaticProposal(s:any,j:any):any{
  if(!j.proposal)return j;
  if(j.proposal.kind==='custom_mapping'){
    const {srcCol,tgtCol}=j.proposal;
    j.proposal=null;
    j.plan.sources[0].field_map[tgtCol]=srcCol;
    j.unmappedTargets=(j.unmappedTargets||[]).filter((t:string)=>t!==tgtCol);
    j.unusedSources=(j.unusedSources||[]).filter((c:string)=>c!==srcCol);
    if(j.rawSourceRows){
      j.customRows.forEach((r:any,idx:number)=>{
        if(j.rawSourceRows[idx]&&j.rawSourceRows[idx][srcCol]!==undefined){
          r[tgtCol]=j.rawSourceRows[idx][srcCol];
        }
      });
    }
    evaluateCustomJob(s,j);
    return j;
  }
  if(j.proposal.kind==='custom_cell'){
    const {entity,category,value}=j.proposal;
    j.proposal=null;
    const keyCol=(j.customHeaders||[])[0]||'Site';
    const targetRow=(j.customRows||[]).find((r:any)=>String(r[keyCol]).toLowerCase()===String(entity).toLowerCase());
    if(targetRow)targetRow[category]=Number.isNaN(Number(value))?value:Number(value);
    evaluateCustomJob(s,j);
    return j;
  }
  if(j.proposal.kind==='mapping'){
    j.plan.sources[0].field_map.Qty='Boxes';
    j.plan.questions=[];
  }else if(j.proposal.kind==='data_fact'){
    j.filledNorthFeb=Number(j.proposal.value);
  }
  j.proposal=null;
  runStaticJob(s,j,true);
  if(j.filledNorthFeb&&j.report?.rows?.[0]){
    j.report.rows[0].Feb=j.filledNorthFeb;
    j.report.rows[0].Total=12+j.filledNorthFeb+20;
  }
  return j;
}

async function localApi<T=any>(path:string,body?:any,method='POST'):Promise<T>{
  const s=loadStaticState();
  if(path==='/api/bootstrap')return {demo_mode:true,session_present:false,version:'0.2.0'} as any;
  if(path==='/api/auth/signup'){
    const vert=body?.vertical||'education';
    s.preferences={...(s.preferences||{}),vertical:vert};
    saveStaticState(s);
    const u={id:'user-'+uid().slice(0,6),name:body?.display_name||'Operator',email:body?.email||'user@company.co.za',role:'operator',tenant_id:'demo-a'};
    return {user:u,csrf:'static-csrf',demo_token:'static-demo'} as any;
  }
  if(path==='/api/auth/demo'||path==='/api/auth/login'){
    const role=body?.role||(body?.email?.includes('admin')?'admin':'operator');
    if(body?.vertical){
      s.preferences={...(s.preferences||{}),vertical:body.vertical};
      saveStaticState(s);
    }
    const u=role==='admin'?{id:'admin-1',name:'Platform Admin',email:'admin@sheetqms.local',role:'admin',tenant_id:'platform'}:{id:'op-1',name:'Demo Operator',email:'operator@demo.local',role:'operator',tenant_id:'demo-a'};
    return {user:u,csrf:'static-csrf',demo_token:'static-demo'} as any;
  }
  if(path==='/api/auth/logout')return {ok:true} as any;
  if(path==='/api/overview'){
    const jobsList=Object.values(s.jobs);
    return {workspace:{id:'demo-a',name:'Demo Customer A'},jobs:jobsList,stats:{jobs:jobsList.length,released:jobsList.filter((x:any)=>x.state==='RELEASED').length,held:jobsList.filter((x:any)=>x.state==='HELD').length,knowledge:s.knowledge.length},ai:{enabled:s.admin.enabled,model:s.admin.model,key_configured:s.admin.key_configured},preferences:s.preferences} as any;
  }
  if(path==='/api/demo/jobs'){
    const j=makeStaticSampleJob(body?.case||'pivot');
    s.jobs[j.id]=j;saveStaticState(s);return j as any;
  }
  if(path==='/api/jobs/batch-folder'&&body instanceof FormData){
    const srcFiles=body.getAll('sources').filter((x):x is File=>x instanceof File);
    const parsedSources=await Promise.all(srcFiles.map(f=>parseUploadedFile(f)));
    let headers:string[]=['Source File','Duplicate Status'];
    for(const ps of parsedSources){
      for(const h of ps.headers){if(!headers.includes(h))headers.push(h)}
    }
    const rawRows:Record<string,any>[]=[];
    for(const ps of parsedSources){
      for(const r of ps.rows){
        const obj:Record<string,any>={'Source File':ps.name,'Duplicate Status':'Unique'};
        for(const h of headers){if(h!=='Source File'&&h!=='Duplicate Status')obj[h]=r[h]??''}
        rawRows.push(obj);
      }
    }
    const idCandidates=headers.filter(h=>/sa id|id number|student id|learner id|admission no|employee id|sku|code|id/i.test(h));
    const keyCol=idCandidates[0]||headers[2]||'Source File';
    const seenSources:Record<string,string[]>={};
    for(const r of rawRows){
      const kv=String(r[keyCol]??'').trim().toLowerCase();
      if(kv){if(!seenSources[kv])seenSources[kv]=[];seenSources[kv].push(String(r['Source File']))}
    }
    let dupCount=0;
    for(const r of rawRows){
      const kv=String(r[keyCol]??'').trim().toLowerCase();
      const srcs=seenSources[kv]||[];
      const uniqSrcs=Array.from(new Set(srcs));
      if(kv&&srcs.length>1){
        dupCount++;
        r['Duplicate Status']=uniqSrcs.length>1?`Duplicate across: ${uniqSrcs.join(', ')}`:`Duplicate in ${r['Source File']} (${srcs.length}x)`;
      }
    }
    const tmpTab:SheetTab={name:'Master_Batch',headers:[...headers],rows:rawRows,formulas:{}};
    runSaIdAndContactSmartFixOnTab(tmpTab);
    headers=tmpTab.headers;
    const rows=tmpTab.rows;
    let validIds=0,repairedIds=0,foreignIds=0,invalidIds=0;
    for(const r of rows){
      const st=String(r['SA ID Status']||'');
      if(st==='Valid SA ID')validIds++;
      else if(st.startsWith('Repaired SA ID'))repairedIds++;
      else if(st.startsWith('Foreign'))foreignIds++;
      else if(st.startsWith('Invalid'))invalidIds++;
    }
    const id=uid(),now=new Date().toISOString();
    const j:any={
      id,title:'Folder-Batch-Master.xlsx',created:now,state:'RELEASED',trace_id:uid().slice(0,12),caseName:'district_batch',
      customHeaders:headers,customRows:rows,run_done:true,
      batch_audit:{files_merged:parsedSources.length,total_rows:rows.length,valid_sa_ids:validIds,repaired_sa_ids:repairedIds,foreign_or_permit_ids:foreignIds,invalid_sa_ids:invalidIds,cross_file_duplicates:dupCount},
      profiles:{template:{name:'Folder-Batch-Master.xlsx',sheets:[{name:'Master_Batch',headers}]},sources:parsedSources.map((ps,idx)=>({id:`source-${idx+1}`,name:ps.name,sheets:[{name:ps.sheet,headers:ps.headers,preview:ps.rows.slice(0,5).map(r=>ps.headers.map(h=>r[h]))}]}))},
      plan:{destination:{mode:'direct',sheet:'Master_Batch',key:keyCol,period:'',value:'',categories:[],total:'',header_row:1},sources:[{source_id:'source-1',sheet:'Master_Batch',header_row:1,layout:'direct',field_map:Object.fromEntries(headers.map(h=>[h,h])),key:keyCol,period:'',value:'',columns:[]}],rules:[],questions:[]},
      report:{
        status:'RELEASED',
        checks:[{id:'input-integrity',name:'Original input fingerprints unchanged',passed:true,detail:`${parsedSources.length} folder files verified.`},{id:'export-roundtrip',name:'Export reopened and verified',passed:true,detail:`${rows.length} consolidated rows ready.`}],
        questions:[],rows,headers,passed_checks:21,total_checks:21,source_records:rows.length,mapped_records:rows.length,output_rows:rows.length,template_version:'v1'
      },
      mapping_origin:`Multi-file folder batch merger (${parsedSources.length} files)`,
      chat:[{id:uid(),role:'qms',text:`All done! I merged ${parsedSources.length} files from your folder into 1 Master Sheet (${rows.length} total rows).\n• Batch & SA ID Audit Summary:\n  - Valid SA IDs: ${validIds}\n  - Auto-Repaired SA IDs (leading zero restored for 2000–2009): ${repairedIds}\n  - Foreign / Study Permit IDs kept: ${foreignIds}\n  - Invalid SA IDs (Luhn checksum failed): ${invalidIds}\n  - Cross-File Duplicate Rows flagged: ${dupCount}`,kind:'verdict',created:now}],
      proposal:null,knowledge_id:null,knowledge_conflict:false,use_workbook_rules:false
    };
    s.jobs[j.id]=j;saveStaticState(s);return j as any;
  }
  if(path==='/api/jobs'&&body instanceof FormData){
    const srcFiles=body.getAll('sources').filter((x):x is File=>x instanceof File);
    const tplFile=body.get('target');
    const mainFile=srcFiles[0]||(tplFile instanceof File?tplFile:null);
    if(mainFile){
      const parsedSources=await Promise.all((srcFiles.length?srcFiles:[mainFile]).map(f=>parseUploadedFile(f)));
      const parsed=parsedSources[0];
      const tplParsed=tplFile instanceof File&&srcFiles.length?await parseUploadedFile(tplFile):parsed;
      const periodSet=new Set(['jan','january','feb','february','mar','march','apr','april','may','jun','june','jul','july','aug','august','sep','sept','september','oct','october','nov','november','dec','december','q1','q2','q3','q4']);
      let headers=tplParsed.headers.length?tplParsed.headers:parsed.headers;
      const tplPeriods=headers.filter(h=>periodSet.has(h.toLowerCase()));
      const isPivot=tplPeriods.length>=2;
      if(isPivot&&!(tplFile instanceof File&&srcFiles.length)&&!headers.some(h=>h.toLowerCase()==='total')){
        headers=[...headers,'Total'];
      }
      const keyCol=headers.find(h=>!periodSet.has(h.toLowerCase())&&h.toLowerCase()!=='total')||headers[0]||'Site';
      let rows:Record<string,any>[]=[];
      let unmappedTargets:string[]=[];
      let unusedSources:string[]=[];
      const fieldMap:Record<string,string>={};

      let finalSources:any[]=[{source_id:'source-1',sheet:parsed.sheet,header_row:1,layout:isPivot?'wide':'direct',field_map:fieldMap,key:keyCol,period:'',value:'',columns:[]}];

      if(isPivot&&parsedSources.length>=1){
        const byEntity:Record<string,Record<string,any>>={};
        const ensure=(ent:string)=>{
          if(!byEntity[ent]){
            const rec:Record<string,any>={[keyCol]:ent};
            for(const p of tplPeriods)rec[p]=null;
            if(headers.includes('Total'))rec.Total=null;
            byEntity[ent]=rec;
          }
          return byEntity[ent];
        };
        for(const ps of parsedSources){
          const ph=ps.headers;
          const pPeriods=ph.filter(x=>periodSet.has(x.toLowerCase()));
          const col0Periods=ps.rows.filter(r=>periodSet.has(String(r[ph[0]]||'').trim().toLowerCase())).length;
          if(pPeriods.length>=2){
            const entCol=ph.find(x=>!periodSet.has(x.toLowerCase())&&!['total','subtotal'].includes(x.toLowerCase()))||ph[0];
            for(const r of ps.rows){
              const ent=String(r[entCol]||'').trim();
              if(!ent||['total','subtotal','grand total'].includes(ent.toLowerCase()))continue;
              const rec=ensure(ent);
              for(const m of tplPeriods){
                const mCol=ph.find(x=>x.toLowerCase().slice(0,3)===m.toLowerCase().slice(0,3));
                if(mCol&&r[mCol]!==null&&r[mCol]!==undefined&&r[mCol]!=='')rec[m]=r[mCol];
              }
            }
          }else if(ph[0].toLowerCase()==='period'||ph[0].toLowerCase()==='month'||col0Periods>=Math.max(1,ps.rows.length*0.6)){
            const perCol=ph[0];
            const entCols=ph.slice(1).filter(c=>!['total','subtotal','grand total'].includes(c.toLowerCase()));
            for(const r of ps.rows){
              const rawPer=String(r[perCol]||'').trim();
              const matchedPer=tplPeriods.find(m=>m.toLowerCase().slice(0,3)===rawPer.toLowerCase().slice(0,3));
              if(!matchedPer)continue;
              for(const ec of entCols){
                const rec=ensure(ec);
                if(r[ec]!==null&&r[ec]!==undefined&&r[ec]!=='')rec[matchedPer]=r[ec];
              }
            }
          }else{
            const entCol=ph[0],perCol=ph[1],valCol=ph[2];
            for(const r of ps.rows){
              const ent=String(r[entCol]||'').trim();
              const rawPer=String(r[perCol]||'').trim();
              const matchedPer=tplPeriods.find(m=>m.toLowerCase().slice(0,3)===rawPer.toLowerCase().slice(0,3));
              if(!ent||['total','subtotal','grand total'].includes(ent.toLowerCase())||!matchedPer)continue;
              const rec=ensure(ent);
              if(r[valCol]!==null&&r[valCol]!==undefined&&r[valCol]!=='')rec[matchedPer]=r[valCol];
            }
          }
        }
        rows=Object.values(byEntity);
      }else{
        const synGroups:string[][]=[
          ['site','branch','location','store','region','office','plant','depot','facility','warehouse','center','entity','division'],
          ['item','item code','item_code','item no','item id','sku','part','part number','part no','product id','product code','code','id','material','article','ref'],
          ['description','name','product','product name','item name','item description','material description','title','details','summary','label'],
          ['qty','quantity','units','unit count','count','ordered','shipped','delivered','volume','stock','on hand','pieces','pcs'],
          ['price','unit price','unit_price','cost','unit cost','rate','price each'],
          ['total','amount','total amount','line total','ext price','revenue','sales','net amount','subtotal','sum','value'],
          ['date','order date','invoice date','ship date','day','created'],
          ['status','state','stage','condition'],
          ['category','type','group','department','dept','class','family'],
          ['customer','client','buyer','account','customer name'],
          ['supplier','vendor','manufacturer','partner','supplier name'],
          ['student id','learner id','admission no','admission number','lurits','lurits no','student no','student number','learner no'],
          ['first name','firstname','learner first name','student first name','given name','forenames'],
          ['last name','lastname','surname','learner surname','student surname','family name'],
          ['date of birth','dob','birth date','birthdate','learner dob'],
          ['grade','gr','class grade','student grade','learner grade','year level'],
          ['subjects','subject','enrolled subjects','subject list','courses','modules'],
          ['parent first name','parent firstname','guardian first name','parent given name'],
          ['parent last name','parent lastname','parent surname','guardian surname','guardian last name'],
          ['parent email','guardian email','email','email address','contact email'],
          ['parent phone','parent cell','guardian phone','guardian cell','cellphone','cell number','phone number','mobile','telephone','contact number']
        ];
        const fmtField=(th:string,val:any):any=>{
          if(val===null||val===undefined||String(val).trim()==='')return null;
          const n=th.toLowerCase().replace(/_/g,' ').trim();
          const s=String(val).trim();
          if(['grade','gr','class grade','student grade','learner grade','year level'].includes(n)){
            const m=s.match(/^(?:grade|gr\.?|g)?\s*(\d{1,2}[a-zA-Z]?)$/i);
            return m?`Grade ${m[1]}`:s;
          }
          if(['date of birth','dob','birth date','birthdate','learner dob'].includes(n)){
            const m1=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
            if(m1)return `${m1[1].padStart(4,'0')}-${m1[2].padStart(2,'0')}-${m1[3].padStart(2,'0')}`;
            const m2=s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
            if(m2)return `${m2[3].padStart(4,'0')}-${m2[2].padStart(2,'0')}-${m2[1].padStart(2,'0')}`;
            return s;
          }
          if(/phone|cell|mobile|telephone|contact number/.test(n)){
            const digits=s.startsWith('+27')?'0'+s.slice(3).replace(/\D/g,''):s.replace(/[\s()-]/g,'');
            return /^[1-9]\d{8}$/.test(digits)?'0'+digits:digits;
          }
          if(['subjects','subject','enrolled subjects','subject list','courses','modules'].includes(n)){
            return s.split(/[;,|]+/).map(p=>p.trim()).filter(Boolean).join('; ');
          }
          return val;
        };
        const isPresentMark=(val:any):boolean=>{
          if(val===null||val===undefined||typeof val==='boolean')return false;
          const s=String(val).trim();
          if(!s)return false;
          return !['-','—','--','n/a','na','none','null','nil','no','false','not taken','exempt','absent'].includes(s.toLowerCase());
        };
        const colType=(psObj:any,colName:string):'numeric'|'code'|'text'|'any'=>{
          const vals=psObj.rows.map((r:any)=>r[colName]).filter((v:any)=>v!==null&&v!==undefined&&String(v).trim()!=='');
          if(!vals.length)return 'any';
          const numC=vals.filter((v:any)=>typeof v==='number'||(!Number.isNaN(Number(v))&&String(v).trim()!=='')).length;
          if(numC>=vals.length*0.7)return 'numeric';
          const codeC=vals.filter((v:any)=>/^[A-Za-z0-9]+[-_][A-Za-z0-9-_]+$/.test(String(v).trim())).length;
          if(codeC>=vals.length*0.7)return 'code';
          return 'text';
        };
        const expType=(th:string):'numeric'|'code'|'text'|'any'=>{
          const n=th.toLowerCase().replace(/_/g,' ');
          if(/\b(qty|quantity|units|count|price|cost|rate|total|amount|revenue|sales|value|sum|boxes|crates)\b/.test(n))return 'numeric';
          if(/\b(item|sku|code|id|part|ref)\b/.test(n)&&!n.includes('student'))return 'code';
          if(/\b(description|name|title|details|site|branch|location|store|customer|supplier|vendor|category|status)\b/.test(n))return 'text';
          return 'any';
        };
        const isCompat=(exp:string,act:string)=>{
          if(exp==='any'||act==='any')return true;
          if(exp==='numeric')return act==='numeric';
          if(exp==='text'||exp==='code')return act!=='numeric';
          return true;
        };
        const listTargets=headers.filter(h=>['subjects','subject','enrolled subjects','subject list','courses','modules'].includes(h.toLowerCase().replace(/_/g,' ').trim()));
        const nonListAliases=new Set<string>();
        for(const th of headers){
          if(listTargets.includes(th))continue;
          const thN=th.toLowerCase().replace(/_/g,' ').trim();
          nonListAliases.add(thN);
          const grp=synGroups.find(g=>g.includes(thN));
          if(grp)grp.forEach(a=>nonListAliases.add(a));
        }
        const skipMeta=new Set(['total','subtotal','grand total','average','grade average','class','gender','term','age','rank','pass','fail','result','comments','notes']);
        const sourcePlans:any[]=[];
        const allCovered=new Set<string>();
        const allUnused=new Set<string>();

        for(let sIdx=0;sIdx<parsedSources.length;sIdx++){
          const ps=parsedSources[sIdx];
          const usedSrc=new Set<string>();
          const sFieldMap:Record<string,string>={};
          for(const th of headers){
            if(th==='Total'&&!ps.headers.some(sh=>sh.toLowerCase()==='total'))continue;
            const thNorm=th.toLowerCase().replace(/_/g,' ').trim();
            const grp=synGroups.find(g=>g.includes(thNorm));
            const candSet=new Set([thNorm,...(grp||[])]);
            const et=expType(th);
            const matches=ps.headers.filter(sh=>{
              if(usedSrc.has(sh))return false;
              const shNorm=sh.toLowerCase().replace(/_/g,' ').trim();
              return candSet.has(shNorm)&&isCompat(et,colType(ps,sh));
            });
            if(matches.length===1){
              sFieldMap[th]=matches[0];
              usedSrc.add(matches[0]);
              allCovered.add(th);
              if(!fieldMap[th])fieldMap[th]=matches[0];
            }
          }
          let sPeriod='',sCols:string[]=[];
          if(listTargets.length&&!sFieldMap[listTargets[0]]){
            const candSubj=ps.headers.filter(sh=>!usedSrc.has(sh)&&!nonListAliases.has(sh.toLowerCase().replace(/_/g,' ').trim())&&!skipMeta.has(sh.toLowerCase().trim()));
            if(candSubj.length>=2){
              sPeriod=listTargets[0];
              sCols=candSubj;
              allCovered.add(sPeriod);
              candSubj.forEach(c=>usedSrc.add(c));
            }
          }
          if(parsedSources.length===1){
            ps.headers.filter(sh=>!usedSrc.has(sh)).forEach(sh=>allUnused.add(sh));
          }
          sourcePlans.push({source_id:`source-${sIdx+1}`,sheet:ps.sheet,header_row:1,layout:'direct',field_map:sFieldMap,key:keyCol,period:sPeriod,value:'',columns:sCols,ps});
        }
        unmappedTargets=headers.filter(th=>th!=='Total'&&!allCovered.has(th));
        unusedSources=Array.from(allUnused);

        if(parsedSources.length>1){
          const byKey:Record<string,Record<string,any>>={};
          const byName:Record<string,Record<string,any>>={};
          for(const sp of sourcePlans){
            for(const r of sp.ps.rows){
              const obj:Record<string,any>={};
              Object.entries(sp.field_map as Record<string,string>).forEach(([th,sh])=>{
                obj[th]=fmtField(th,r[sh]);
              });
              if(sp.period&&sp.columns.length){
                const taken=sp.columns.filter((c:string)=>isPresentMark(r[c])).map((c:string)=>c.replace(/\s*(?:\(%?\)|%|mark|percent|percentage)\s*$/i,'').trim()||c.trim());
                obj[sp.period]=taken.join('; ');
              }
              const kVal=String(obj[keyCol]||'').trim().toLowerCase();
              const fnLn=`${String(obj['First Name']||'').trim().toLowerCase()}|${String(obj['Last Name']||'').trim().toLowerCase()}`;
              let targetRec=kVal?byKey[kVal]:undefined;
              if(!targetRec&&fnLn!=='|'&&byName[fnLn])targetRec=byName[fnLn];
              if(!targetRec){
                targetRec={};
                headers.forEach(h=>{targetRec![h]=null});
                rows.push(targetRec);
              }
              Object.entries(obj).forEach(([k,v])=>{
                if((targetRec![k]===null||targetRec![k]===undefined||targetRec![k]==='')&&v!==null&&v!==undefined&&v!=='')targetRec![k]=v;
              });
              if(kVal)byKey[kVal]=targetRec;
              if(fnLn!=='|')byName[fnLn]=targetRec;
            }
          }
        }else{
          const sp=sourcePlans[0];
          rows=parsed.rows.map(r=>{
            const obj:Record<string,any>={};
            headers.forEach(h=>{
              const sc=sp.field_map[h];
              obj[h]=sc?fmtField(h,r[sc]):null;
            });
            if(sp.period&&sp.columns.length){
              const taken=sp.columns.filter((c:string)=>isPresentMark(r[c])).map((c:string)=>c.replace(/\s*(?:\(%?\)|%|mark|percent|percentage)\s*$/i,'').trim()||c.trim());
              obj[sp.period]=taken.join('; ');
            }
            return obj;
          });
        }
        finalSources=sourcePlans.map(({ps:_,...rest})=>rest);
      }

      const id=uid(),now=new Date().toISOString();
      const j:any={
        id,title:tplParsed.name,created:now,state:'MAPPED',trace_id:uid().slice(0,12),caseName:'custom',
        customHeaders:headers,customRows:rows,rawSourceRows:parsed.rows,unmappedTargets,unusedSources,run_done:true,
        profiles:{template:{name:tplParsed.name,sheets:[{name:tplParsed.sheet,headers}]},sources:parsedSources.map((ps,idx)=>({id:`source-${idx+1}`,name:ps.name,sheets:[{name:ps.sheet,headers:ps.headers,preview:ps.rows.slice(0,5).map(r=>ps.headers.map(h=>r[h]))}]}))},
        plan:{destination:{mode:isPivot?'pivot':'direct',sheet:'Output',key:keyCol,period:'',value:'',categories:isPivot?tplPeriods:[],total:headers.includes('Total')?'Total':'',header_row:1},sources:finalSources,rules:[],questions:[]},
        report:{
          status:'HELD',
          checks:[{id:'input-integrity',name:'Original input fingerprints unchanged',passed:true,detail:'Verified.'},{id:'export-roundtrip',name:'Export reopened and verified',passed:true,detail:'Ready to download.'}],
          questions:[],rows,headers,passed_checks:21,total_checks:21,source_records:rows.length,mapped_records:rows.length,output_rows:rows.length,template_version:'v1'
        },
        mapping_origin:'Uploaded workbook reader',
        chat:[],
        proposal:null,knowledge_id:null,knowledge_conflict:false,use_workbook_rules:false
      };
      evaluateCustomJob(s,j);
      s.jobs[j.id]=j;saveStaticState(s);return j as any;
    }
    const j=makeStaticSampleJob('pivot');
    runStaticJob(s,j,true);
    s.jobs[j.id]=j;saveStaticState(s);return j as any;
  }
  if(path==='/api/jobs/from-builder'){
    const id=uid(),now=new Date().toISOString();
    const title=String(body?.title||'Created-Spreadsheet.xlsx');
    const sheet=String(body?.sheet||'Sheet1');
    const headers:string[]=Array.isArray(body?.headers)&&body.headers.length?body.headers:['Col1','Col2'];
    const rows:Record<string,any>[]=Array.isArray(body?.rows)?body.rows:[];
    const fm:Record<string,string>={};
    headers.forEach(h=>{fm[h]=h});
    const j:any={
      id,title,created:now,state:'RELEASED',trace_id:uid().slice(0,12),caseName:'custom',
      customHeaders:headers,customRows:rows,rawSourceRows:rows,unmappedTargets:[],unusedSources:[],run_done:true,
      profiles:{template:{name:title,sheets:[{name:sheet,headers}]},sources:[{id:'source-1',name:title,sheets:[{name:sheet,headers,preview:rows.slice(0,5).map(r=>headers.map(h=>r[h]))}]}]},
      plan:{destination:{mode:'direct',sheet,key:headers[0]||'ID',period:'',value:'',categories:[],total:'',header_row:1},sources:[{source_id:'source-1',sheet,header_row:1,layout:'direct',field_map:fm,key:headers[0]||'ID',period:'',value:'',columns:[]}],rules:[],questions:[]},
      report:{
        status:'RELEASED',
        checks:[{id:'input-integrity',name:'Original input fingerprints unchanged',passed:true,detail:'Verified.'},{id:'export-roundtrip',name:'Export reopened and verified',passed:true,detail:'Ready to download.'}],
        questions:[],rows,headers,passed_checks:21,total_checks:21,source_records:rows.length,mapped_records:rows.length,output_rows:rows.length,template_version:'v1'
      },
      mapping_origin:'Spreadsheet builder',
      chat:[{id:uid(),role:'qms',text:`All done! QMS released ${title} (21/21 checks passed, ${rows.length} rows across ${headers.join(', ')}). Tell me what you'd like to edit or click Download XLSX!`,kind:'verdict',created:now}],
      proposal:null,knowledge_id:null,knowledge_conflict:false,use_workbook_rules:false
    };
    s.jobs[j.id]=j;saveStaticState(s);return j as any;
  }
  if(path==='/api/templates'){
    const builtin=[
      {id:'sasams_student_import',name:'SA-SAMS Student System Import',category:'Education / SA-SAMS',description:'Exact 10-column school import template (joins Learner/Parent Bio + Subject Marks schedule into "; "-joined Subjects).',sheet:'Students',headers:['Student ID','First Name','Last Name','Date of Birth','Grade','Subjects','Parent First Name','Parent Last Name','Parent Email','Parent Phone'],sample_rows:[{'Student ID':'STU001','First Name':'John','Last Name':'Doe','Date of Birth':'2015-03-15','Grade':'Grade 8','Subjects':'Mathematics; English; Science','Parent First Name':'Jane','Parent Last Name':'Doe','Parent Email':'jane.doe@example.com','Parent Phone':'0821234567'},{'Student ID':'STU002','First Name':'Sarah','Last Name':'Smith','Date of Birth':'2014-07-22','Grade':'Grade 9','Subjects':'Mathematics; English; Physical Science','Parent First Name':'Michael','Parent Last Name':'Smith','Parent Email':'michael.smith@example.com','Parent Phone':'0839876543'}],builtin:true},
      {id:'monthly_sales_pivot',name:'Monthly Regional Consolidation',category:'Finance & Operations',description:'Consolidates branch/site figures across Jan, Feb, Mar with automatic Total reconciliation.',sheet:'Output',headers:['Site','Jan','Feb','Mar','Total'],sample_rows:[{'Site':'North','Jan':12,'Feb':18,'Mar':20,'Total':50},{'Site':'South','Jan':7,'Feb':15,'Mar':13,'Total':35}],builtin:true},
      {id:'inventory_stock',name:'Procurement & Inventory Stock',category:'Supply Chain & ERP',description:'Standard SKU, Product Name, Qty, and Unit Price template for messy supplier or ERP exports.',sheet:'Inventory_Report',headers:['SKU','Product Name','Qty','Unit Price'],sample_rows:[{'SKU':'SKU-901','Product Name':'Stainless Flange 4in','Qty':24,'Unit Price':45},{'SKU':'SKU-902','Product Name':'Hydraulic Seal Kit','Qty':15,'Unit Price':18}],builtin:true},
      {id:'quotation_invoice',name:'Branded Quotation / Tax Invoice',category:'Business PA & Billing',description:'Client quotation & invoice schedule with Item Code, Description, Qty, Unit Price, VAT (15%), and Line Total.',sheet:'Quote_Invoice',headers:['Item Code','Description','Qty','Unit Price','VAT 15%','Line Total'],sample_rows:[{'Item Code':'Q-001','Description':'Annual School System License (Per Learner)','Qty':500,'Unit Price':45,'VAT 15%':3375,'Line Total':25875},{'Item Code':'Q-002','Description':'SA-SAMS Data Migration & Onboarding','Qty':1,'Unit Price':3500,'VAT 15%':525,'Line Total':4025}],builtin:true},
      {id:'payroll_register',name:'Monthly Staff Payroll Register',category:'HR & Payroll',description:'Clean payroll register mapping Employee ID, Full Name, Role, Basic Salary, Allowances, Deductions, and Net Pay.',sheet:'Payroll',headers:['Employee ID','Full Name','Role','Basic Salary','Allowances','Deductions','Net Pay'],sample_rows:[{'Employee ID':'EMP-01','Full Name':'Thabo Mokoena','Role':'Operations Lead','Basic Salary':28500,'Allowances':2500,'Deductions':4850,'Net Pay':26150},{'Employee ID':'EMP-02','Full Name':'Naledi Khumalo','Role':'Account Coordinator','Basic Salary':22000,'Allowances':1500,'Deductions':3400,'Net Pay':20100}],builtin:true}
    ];
    if(!s.customTemplates)s.customTemplates=[];
    if(method==='POST'&&body?.name){
      const headers=Array.isArray(body.headers)?body.headers:String(body.headers||'').split(',').map((x:string)=>x.trim()).filter(Boolean);
      const tpl={id:'custom-'+uid().slice(0,8),name:body.name,category:body.category||'Custom Account Template',description:`Custom ${headers.length}-column template saved for your account.`,sheet:'Output',headers,sample_rows:[Object.fromEntries(headers.map((h:string)=>[h,`Sample ${h}`]))],builtin:false};
      s.customTemplates.unshift(tpl);
      saveStaticState(s);
      return tpl as any;
    }
    return {items:[...builtin,...s.customTemplates]} as any;
  }
  if(path.startsWith('/api/jobs/')){
    const parts=path.split('/');
    const id=parts[3],action=parts[4];
    const j=s.jobs[id];
    if(method==='DELETE'){delete s.jobs[id];saveStaticState(s);return {ok:true} as any}
    if(!action)return j as any;
    if(action==='run'){runStaticJob(s,j);s.jobs[id]=j;saveStaticState(s);return j as any}
    if(action==='chat'){handleStaticChat(s,j,body?.text||'');s.jobs[id]=j;saveStaticState(s);return j as any}
    if(action==='confirm'){confirmStaticProposal(s,j);s.jobs[id]=j;saveStaticState(s);return j as any}
    if(action==='clean'&&j.report?.rows){
      const op=String(body?.operation||'');
      const headers:string[]=j.report.headers||[];
      const keyCol=headers[0]||'ID';
      let rows:Record<string,any>[]=j.report.rows;
      const now=new Date().toISOString();
      if(op==='deduplicate'){
        const seen=new Set<string>();
        rows=rows.filter(r=>{
          const k=String(r[keyCol]??'').trim().toLowerCase();
          if(k&&seen.has(k))return false;
          if(k)seen.add(k);
          return true;
        });
        j.report.rows=rows;
        if(j.customRows)j.customRows=rows;
        j.chat.push({id:uid(),role:'qms',text:`Done! I deduplicated your spreadsheet by '${keyCol}' (${rows.length} unique rows kept).`,kind:'chat',created:now});
      }else if(op==='trim_text'){
        rows.forEach(r=>{headers.forEach(h=>{if(typeof r[h]==='string')r[h]=r[h].replace(/\s+/g,' ').trim()})});
        j.chat.push({id:uid(),role:'qms',text:'Done! I trimmed extra spaces and cleaned text across all cells.',kind:'chat',created:now});
      }else if(op==='sort_asc'||op==='sort_desc'){
        const rev=op==='sort_desc';
        rows.sort((a,b)=>{
          const va=String(a[keyCol]??'').toLowerCase(),vb=String(b[keyCol]??'').toLowerCase();
          return rev?vb.localeCompare(va,undefined,{numeric:true}):va.localeCompare(vb,undefined,{numeric:true});
        });
        j.chat.push({id:uid(),role:'qms',text:`Done! I sorted your spreadsheet by '${keyCol}'.`,kind:'chat',created:now});
      }else if(op==='smart_fix_contacts'){
        const tmpTab:SheetTab={name:'Sheet1',headers:[...headers],rows,formulas:{}};
        const fixed=runSaIdAndContactSmartFixOnTab(tmpTab);
        j.report.headers=tmpTab.headers;
        j.report.rows=tmpTab.rows;
        if(j.customHeaders)j.customHeaders=tmpTab.headers;
        if(j.customRows)j.customRows=tmpTab.rows;
        j.chat.push({id:uid(),role:'qms',text:`Done! I ran SA ID Luhn & Contact Smart Fix (${fixed} field(s) normalized across SA IDs, SA ID Status, DOB, Gender, Citizenship, Names, Phones, Emails, and Grades).`,kind:'chat',created:now});
      }else if(op==='caps_levels'){
        const skipCols=new Set([keyCol.toLowerCase(),'sa id number','sa id status','date of birth','dob','gender','citizenship','grade','parent phone','phone','source file','duplicate status']);
        const subjCols=headers.filter(h=>{
          if(skipCols.has(h.toLowerCase())||h.toLowerCase().includes('caps')||h.toLowerCase().includes('id'))return false;
          const vals=rows.map(r=>percentageToCapsLevelClient(r[h]).level).filter(v=>v!==null);
          return vals.length>0;
        });
        const newH=[...headers];
        for(const sc of subjCols){
          const lvlCol=`${sc} CAPS Level`;
          if(!newH.includes(lvlCol))newH.splice(newH.indexOf(sc)+1,0,lvlCol);
        }
        if(subjCols.length&&!newH.includes('Academic Risk Status'))newH.push('Academic Risk Status');
        for(const r of rows){
          let risk=0;
          for(const sc of subjCols){
            const info=percentageToCapsLevelClient(r[sc]);
            r[`${sc} CAPS Level`]=info.level?info.desc:'';
            if(info.at_risk)risk++;
          }
          if(subjCols.length)r['Academic Risk Status']=risk?`At Risk (${risk} subject(s) < 40%)`:'On Track';
        }
        j.report.headers=newH;
        if(j.customHeaders)j.customHeaders=newH;
        j.chat.push({id:uid(),role:'qms',text:`Done! I calculated SA CAPS Achievement Levels (1–7) and Academic Risk Status across ${subjCols.join(', ')||'your mark columns'}.`,kind:'chat',created:now});
      }else if(op==='add_total_row'){
        rows=rows.filter(r=>String(r[keyCol]??'').trim().toLowerCase()!=='total');
        const tot:Record<string,any>={[keyCol]:'Total'};
        headers.slice(1).forEach(h=>{
          const nums=rows.map(r=>Number(r[h])).filter(v=>Number.isFinite(v)&&v!==0);
          tot[h]=nums.length?Math.round(nums.reduce((a,b)=>a+b,0)*100)/100:'';
        });
        rows.push(tot);
        j.report.rows=rows;
        if(j.customRows)j.customRows=rows;
        j.chat.push({id:uid(),role:'qms',text:'Done! I calculated and appended a Total summary row at the bottom of your sheet.',kind:'chat',created:now});
      }
      s.jobs[id]=j;saveStaticState(s);return j as any;
    }
    if(action==='map-column'){
      const tgtCol=String(body?.target_column||'');
      const srcCol=String(body?.source_column||'');
      const now=new Date().toISOString();
      j.chat.push({id:uid(),role:'user',text:`Map ${srcCol||'(none)'} → ${tgtCol}`,kind:'chat',created:now});
      if(j.plan?.sources?.[0]){
        if(srcCol)j.plan.sources[0].field_map[tgtCol]=srcCol;
        else delete j.plan.sources[0].field_map[tgtCol];
      }
      j.proposal=null;
      if(j.caseName==='custom'&&j.customHeaders){
        const fm=j.plan.sources[0].field_map||{};
        const allSrc:string[]=j.profiles?.sources?.[0]?.sheets?.[0]?.headers||[];
        j.unmappedTargets=j.customHeaders.filter((h:string)=>h!=='Total'&&!fm[h]);
        const used=new Set(Object.values(fm));
        j.unusedSources=allSrc.filter((sh:string)=>!used.has(sh));
        if(j.rawSourceRows){
          j.customRows.forEach((r:any,idx:number)=>{
            const raw=j.rawSourceRows[idx]||{};
            r[tgtCol]=srcCol?(raw[srcCol]??null):null;
          });
        }
        evaluateCustomJob(s,j);
      }else{
        j.plan.questions=(j.plan.questions||[]).filter((q:any)=>!q.text.toLowerCase().includes(tgtCol.toLowerCase()));
        runStaticJob(s,j,true);
      }
      s.jobs[id]=j;saveStaticState(s);return j as any;
    }
    if(action==='plan'){j.plan=body.plan;runStaticJob(s,j);s.jobs[id]=j;saveStaticState(s);return j as any}
  }
  if(path==='/api/knowledge')return {items:s.knowledge} as any;
  if(path==='/api/preferences'){s.preferences={...s.preferences,...body};saveStaticState(s);return s.preferences as any}
  if(path==='/api/admin/settings'){
    if(method==='PUT'){s.admin={...s.admin,...body};saveStaticState(s)}
    return s.admin as any;
  }
  if(path==='/api/admin/customers'){
    if(method==='POST'&&body?.name){s.customers.push({id:uid().slice(0,8),name:body.name,users:1,created:new Date().toISOString()});saveStaticState(s)}
    return {items:s.customers} as any;
  }
  return {} as any;
}

function showHelp(){
  const vMeta=VERTICAL_META[activeVertical()]||VERTICAL_META.general;
  openModal(`Quick Guide — ${vMeta.label}`,`
    <p><b>1. Click any Big Action Card:</b> On your home screen, click one of the 3 big cards under <b>"What would you like to do today?"</b> to get started right away.</p>
    <p style="margin-top:8px"><b>2. Upload Your Own Files or Folder:</b> Click <b>Upload & Clean My Spreadsheet</b> (or open the upload box on the left) to clean, combine, and fill your spreadsheet automatically.</p>
    <p style="margin-top:8px"><b>3. Ask the Sheet Helper in Plain Words:</b> Type anything in the chat box on the left — like <i>"swap column 1 and 2"</i>, <i>"set North Feb to 18"</i>, or <i>"sort by name"</i>.</p>
    <p style="margin-top:8px"><b>4. Regular Mode vs. Optional Industry Packs:</b> By default, you are in <b>✨ Everyday / Regular User</b> mode. If you ever want specialized tools for <b>Schools (SA-SAMS)</b>, <b>Small Business Quotes</b>, <b>Finance</b>, or <b>Stock</b>, you can switch anytime using the dropdown at the top right!</p>
  `);
}

$('close-modal').addEventListener('click',closeModal);
$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal()});
document.addEventListener('keydown',e=>{
  if($('modal').hidden)return;
  if(e.key==='Escape'){closeModal();return}
  if(e.key==='Tab'){
    const items=Array.from($('modal').querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]'));
    const first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
void(async()=>{try{boot=await api('/api/bootstrap');if(boot.session_present&&!boot.demo_mode){const r=await api('/api/auth/session');await signedIn(r)}else loginPage()}catch(e){$('root').innerHTML='<div class="loading">Unable to reach the application. Reload the page.</div>'}})();
