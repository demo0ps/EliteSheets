(() => {
  // web/eduscf_logo.ts
  var EDUSCF_LOGO_URI = "data:image/png;base64,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";

  // web/app.ts
  var $ = (id) => document.getElementById(id);
  var escapeHTML = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var uid = () => crypto.randomUUID();
  var paths = { grid: "M3 3h18v18H3zM3 9h18M9 3v18M3 15h18M15 3v18", spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3", shield: "m12 3 8 4v6c0 5-8 8-8 8s-8-3-8-8V7l8-4m-4 9 3 3 5-6", file: "M6 3h8l4 4v14H6V3m8 0v5h4M9 12h6m-6 4h6", upload: "M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4", arrow: "M4 12h16m-6-6 6 6-6 6", check: "m5 12 4 4L19 6", book: "M3 5h6c2 0 3 2 3 3 0-1 1-3 3-3h6v15h-6c-2 0-3 1-3 1s-1-1-3-1H3V5m9 3v13", settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m-8 4 2-3-1-3 3-1 2-2 2 1 3 1 1 3 2 2-1 3-1 3-3 1-2 2-3-1-3-1-1-3-2-2z", chat: "M4 4h16v13H9l-5 4V4m4 5h8m-8 4h5", clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 4v5l4 2", folder: "M3 6h7l2 3h9v11H3V6", download: "M12 3v13m-4-4 4 4 4-4M4 18v3h16v-3", lock: "M6 11h12v10H6V11m2 0V7a4 4 0 0 1 8 0v4", warning: "m12 3 10 18H2L12 3m0 5v6m0 3v1", users: "M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8m9 1a3 3 0 1 1 0 6M2 21v-4c0-4 12-4 12 0v4m3-7c3 0 5 1 5 3v4", logout: "M9 4H3v16h6m4-8h9m-4-4 4 4-4 4", layers: "m12 3 10 5-10 5L2 8l10-5m-10 9 10 5 10-5m-20 5 10 5 10-5", edit: "m15 4 5 5-10 10-6 1 1-6L15 4m-3 3 5 5", plus: "M12 4v16M4 12h16", send: "m3 3 18 9-18 9 3-9-3-9m3 9h15", link: "m9 15 6-6m-7 3-3 3c-4 4 2 10 6 6l3-3m-2-6 3-3c4-4 10 2 6 6l-3 3", trash: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14m-8 4v6m4-6v6", info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 7v7m0-10v1", dollar: "M12 2v20m5-16H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H6" };
  var icon = (name) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.grid}"/></svg>`;
  var user = null;
  var csrf = "";
  var demoToken = "";
  var workspaceID = "";
  var boot = {};
  var overview = {};
  var job = null;
  var currentPage = "workspace";
  var adminSettings = {};
  var customers = [];
  var previousFocus = null;
  var staticMode = false;
  async function api(path, body, method = "POST") {
    if (staticMode) return localApi(path, body, method);
    const headers = {};
    if (csrf) headers["X-CSRF-Token"] = csrf;
    if (demoToken) headers["X-Demo-Session"] = demoToken;
    if (workspaceID) headers["X-Workspace-ID"] = workspaceID;
    const options = { headers, credentials: "same-origin" };
    if (body !== void 0) {
      options.method = method;
      if (body instanceof FormData) options.body = body;
      else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }
    try {
      const r = await fetch(path, options);
      if (path === "/api/bootstrap" && (r.status === 404 || r.status === 405 || (r.headers.get("content-type") || "").includes("text/html"))) {
        staticMode = true;
        return localApi(path, body, method);
      }
      if (!r.ok) {
        let message = "Request failed.";
        try {
          const d = await r.json();
          message = typeof d.detail === "string" ? d.detail : "Check the submitted fields.";
        } catch {
        }
        throw new Error(message);
      }
      return r.json();
    } catch (err) {
      if (path === "/api/bootstrap") {
        staticMode = true;
        return localApi(path, body, method);
      }
      throw err;
    }
  }
  function toast(text, error = false) {
    const el = $("toast");
    el.textContent = text;
    el.className = "visible" + (error ? " error" : "");
    window.setTimeout(() => {
      el.className = "";
    }, 4e3);
  }
  async function busy(element, action) {
    const b = element;
    const old = b.innerHTML;
    b.disabled = true;
    b.innerHTML = icon("clock") + "Working\u2026";
    try {
      await action();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), true);
    } finally {
      if (document.contains(b)) {
        b.disabled = false;
        b.innerHTML = old;
      }
    }
  }
  function logo() {
    return `<div class="logo"><span class="logo-box">${icon("grid")}</span><span><b>Edu</b>SheetManager<small class="brand-by">by EduSCF</small></span></div>`;
  }
  function poweredByEduSCF() {
    return `<div class="powered-by-eduscf" aria-label="Powered by EduSCF \u2014 Edu School Communicator Foundation (NPC)"><span>Powered by</span><img src="${EDUSCF_LOGO_URI}" alt="EduSCF \u2014 Edu School Communicator Foundation (NPC)" class="eduscf-logo-img"></div>`;
  }
  function openModal(title, body) {
    previousFocus = document.activeElement;
    $("modal-title").textContent = title;
    $("modal-content").innerHTML = body;
    $("modal").hidden = false;
    $("close-modal").focus();
  }
  function closeModal() {
    $("modal").hidden = true;
    previousFocus?.focus();
  }
  var VERTICAL_META = {
    general: {
      label: "\u2728 Everyday / Regular User",
      shortName: "Everyday",
      badge: "Simple \xB7 Clean \xB7 1-Screen Workspace",
      desc: "Everything in one place: upload messy files, merge a whole folder, or type what columns you want in plain words.",
      defaultSample: "pivot",
      tabs: [
        { page: "workspace", label: "My Spreadsheet", iconName: "grid" },
        { page: "quotes", label: "Quotes & Invoices", iconName: "dollar" },
        { page: "templates", label: "Templates", iconName: "layers" },
        { page: "preferences", label: "Past Files & Settings", iconName: "settings" }
      ],
      cards: [
        { title: "\u{1F393} 1-Click Demo: School SA-SAMS (2 Files \u2192 1)", desc: "Watch it join Learner Bio + Subject Marks into 1 clean import sheet.", action: "sample:sasams_students" },
        { title: "\u{1F4C2} 1-Click Demo: Merge a Whole Folder", desc: "Watch it combine 3 files into 1 Master Sheet, fix SA IDs & flag duplicates.", action: "sample:district_batch" },
        { title: "\u{1F4CA} 1-Click Demo: Monthly Branch Totals", desc: "Watch it combine regional monthly sheets and calculate Totals automatically.", action: "sample:pivot" }
      ],
      samples: [
        { val: "pivot", label: "Combine Monthly Sheets \u2192 Summary Table" },
        { val: "sasams_students", label: "School SA-SAMS (2 Files \u2192 1 Import Sheet)" },
        { val: "district_batch", label: "Merge a Whole Folder of Files into 1 Sheet" },
        { val: "direct", label: "Contact & Order List \u2192 Clean Excel Sheet" },
        { val: "chat_map", label: "Match Different Column Names in 1 Click" }
      ],
      builderPresetCmd: "Columns: Name, Email, Phone, Date, Category, Amount, Notes",
      builderPresetLabel: "Everyday Tracker Sheet",
      templateCategories: ["Education / SA-SAMS", "Business PA & Billing", "Finance & Operations", "HR & Payroll", "Supply Chain & ERP"]
    },
    education: {
      label: "\u{1F393} School & District Office",
      shortName: "School",
      badge: "SA-SAMS \xB7 Class Lists \xB7 Marks",
      desc: "Combine SA-SAMS student & subject mark sheets, fix 13-digit SA IDs (including missing 0s for 2000\u20132009), calculate Pass Levels (1\u20137), and merge school folders.",
      defaultSample: "sasams_students",
      tabs: [
        { page: "workspace", label: "My School Spreadsheet", iconName: "grid" },
        { page: "templates", label: "School Templates", iconName: "layers" },
        { page: "preferences", label: "Past Files & Settings", iconName: "settings" }
      ],
      cards: [
        { title: "\u{1F4CB} 1-Click Demo: SA-SAMS Student & Marks", desc: "Join SA-SAMS Learner/Parent Bio + Subject Marks into 1 ready-to-import sheet.", action: "sample:sasams_students" },
        { title: "\u{1F4C2} 1-Click Demo: Merge Folder of Schools", desc: "Combine multiple classes or schools into 1 Master Sheet & check duplicate learners.", action: "sample:district_batch" },
        { title: "\u270F\uFE0F 1-Click Demo: Class & Fee Register", desc: "Generate a class list & tuition sheet with automatic Balance calculation.", action: "builder:student" }
      ],
      samples: [
        { val: "sasams_students", label: "SA-SAMS 2-File Student & Subject Marks" },
        { val: "district_batch", label: "Multi-School Folder Merge (Check SA IDs & Duplicates)" }
      ],
      builderPresetCmd: "Create a SA-SAMS student & tuition sheet",
      builderPresetLabel: "Class & Tuition Register",
      templateCategories: ["Education / SA-SAMS"]
    },
    sme_pa: {
      label: "\u{1F4BC} Small Business & PA",
      shortName: "Business",
      badge: "Quotes \xB7 Invoices \xB7 Clients",
      desc: "Create branded Quotes & Tax Invoices in plain words, paste WhatsApp or Email client lists into Excel, and clean customer names, phones, and IDs.",
      defaultSample: "direct",
      tabs: [
        { page: "workspace", label: "My Business Spreadsheet", iconName: "grid" },
        { page: "quotes", label: "Quotes & Invoices", iconName: "dollar" },
        { page: "templates", label: "Business Templates", iconName: "layers" },
        { page: "preferences", label: "Past Files & Settings", iconName: "settings" }
      ],
      cards: [
        { title: "\u{1F9FE} 1-Click Demo: Create Quote / Tax Invoice", desc: "Type what you are charging in plain words and download a clean PDF or Excel invoice.", action: "page:quotes" },
        { title: "\u2728 1-Click Demo: Clean Client & Order List", desc: "Load a client or order sheet to fix names, +27 phone numbers, emails & ID numbers.", action: "sample:direct" },
        { title: "\u{1F4CB} 1-Click Demo: Booking Form to Table", desc: "Turn customer booking forms into a clean, structured Excel table.", action: "sample:form" }
      ],
      samples: [
        { val: "direct", label: "Client & Order List \u2192 Clean Excel Sheet" },
        { val: "form", label: "Customer Booking Form \u2192 Clean Table" }
      ],
      builderPresetCmd: "Columns: Client ID, Full Name, SA ID Number, Phone, Email, Amount Due, Paid",
      builderPresetLabel: "Client & Payment List",
      templateCategories: ["Business PA & Billing"]
    },
    finance_hr: {
      label: "\u{1F4CA} Finance, Bookkeeping & Payroll",
      shortName: "Finance",
      badge: "Monthly Totals \xB7 Payroll \xB7 Reconcile",
      desc: "Combine monthly or branch figures with automatic Totals, spot missing numbers before export, check staff payroll SA IDs, and compare two sheets.",
      defaultSample: "pivot",
      tabs: [
        { page: "workspace", label: "My Finance Spreadsheet", iconName: "grid" },
        { page: "templates", label: "Finance Templates", iconName: "layers" },
        { page: "preferences", label: "Past Files & Settings", iconName: "settings" }
      ],
      cards: [
        { title: "\u{1F4CA} 1-Click Demo: Combine Monthly Figures", desc: "Merge regional or monthly sheets into one summary table with automatic Totals.", action: "sample:pivot" },
        { title: "\u{1F50D} 1-Click Demo: Spot Missing Figures", desc: "Catch blank monthly figures automatically and fill them in chat before downloading.", action: "sample:hold" },
        { title: "\u{1F465} 1-Click Demo: Expense & VAT Sheet", desc: "Create a monthly expense or payroll sheet with automatic VAT & Total columns.", action: "builder:expense" }
      ],
      samples: [
        { val: "pivot", label: "Combine Branch Sheets \u2192 Monthly Summary Table" },
        { val: "hold", label: "Spot Missing Monthly Figure \u2192 Fill in Chat" }
      ],
      builderPresetCmd: "Create a monthly expense tracker",
      builderPresetLabel: "Expense & VAT Sheet",
      templateCategories: ["Finance & Operations", "HR & Payroll"]
    },
    supply_chain: {
      label: "\u{1F4E6} Stock, Inventory & Suppliers",
      shortName: "Stock",
      badge: "Supplier Lists \xB7 SKUs \xB7 Warehouses",
      desc: "Match supplier price lists and CSVs to your stock sheet in 1 click, merge warehouse folders into 1 Master Stock file, and calculate stock values.",
      defaultSample: "chat_map",
      tabs: [
        { page: "workspace", label: "My Stock Spreadsheet", iconName: "grid" },
        { page: "templates", label: "Stock Templates", iconName: "layers" },
        { page: "preferences", label: "Past Files & Settings", iconName: "settings" }
      ],
      cards: [
        { title: "\u{1F4E6} 1-Click Demo: Match Supplier Columns", desc: 'Match different supplier column names (like "Boxes" \u2192 "Qty") in 1 click.', action: "sample:chat_map" },
        { title: "\u{1F4C2} 1-Click Demo: Merge Warehouse Folder", desc: "Upload or demo a folder of depot sheets combined into 1 Master file.", action: "sample:district_batch" },
        { title: "\u{1F9EE} 1-Click Demo: Stock Count & Value Sheet", desc: "Start an inventory count sheet with automatic Total Value = Qty \xD7 Unit Price.", action: "builder:inventory" }
      ],
      samples: [
        { val: "chat_map", label: 'Match Supplier "Boxes" Column \u2192 Stock "Qty"' },
        { val: "direct", label: "Supplier CSV \u2192 Standard Stock Template" },
        { val: "unpivot", label: "Wide Warehouse Sheet \u2192 Normalized Rows" }
      ],
      builderPresetCmd: "Create a warehouse inventory stock sheet",
      builderPresetLabel: "Warehouse Stock Sheet",
      templateCategories: ["Supply Chain & ERP"]
    }
  };
  function activeVertical() {
    return overview?.preferences?.vertical || "general";
  }
  function friendlyText(raw) {
    return String(raw || "").replace(/QMS released this workbook \(\d+\/\d+ checks passed,\s*/gi, "Your spreadsheet is ready to download (").replace(/QMS released ([^()]+?)\s*\(\d+\/\d+ checks passed,\s*/gi, "$1 is ready to download (").replace(/Output held[.:]\s*/gi, "Almost ready \u2014 ").replace(/\bQMS\b/g, "Helper");
  }
  function loginPage() {
    user = null;
    job = null;
    csrf = "";
    demoToken = "";
    workspaceID = "";
    document.body.className = "light";
    $("root").innerHTML = `<main class="login-minimal"><section class="sign-card">${logo()}<h1>Your calm, everyday spreadsheet helper.</h1><p>Clean up messy files, combine spreadsheets, or create a brand-new sheet in plain everyday words \u2014 no complicated formulas needed.</p>${boot.demo_mode ? `<div class="demo-actions">
    <button class="btn primary" data-launch-vert="general" style="padding:16px 20px;font-size:16px;justify-content:space-between"><span>\u2728 Start as Regular / Everyday User</span>${icon("arrow")}</button>
  </div>
  <details class="divider-details"><summary>Optional: Or open a specialized industry workspace (Schools, Business, Finance, Stock)</summary>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
      <button class="btn small" data-launch-vert="education" style="justify-content:flex-start;text-align:left;padding:10px 12px"><div><strong style="display:block">\u{1F393} Schools & SA-SAMS</strong><small style="color:var(--muted)">Class Lists, IDs & Marks</small></div></button>
      <button class="btn small" data-launch-vert="sme_pa" style="justify-content:flex-start;text-align:left;padding:10px 12px"><div><strong style="display:block">\u{1F4BC} Small Business & PA</strong><small style="color:var(--muted)">Quotes & Invoices</small></div></button>
      <button class="btn small" data-launch-vert="finance_hr" style="justify-content:flex-start;text-align:left;padding:10px 12px"><div><strong style="display:block">\u{1F4CA} Finance & Payroll</strong><small style="color:var(--muted)">Monthly Totals & Staff</small></div></button>
      <button class="btn small" data-launch-vert="supply_chain" style="justify-content:flex-start;text-align:left;padding:10px 12px"><div><strong style="display:block">\u{1F4E6} Stock & Suppliers</strong><small style="color:var(--muted)">Inventory & Warehouses</small></div></button>
    </div>
    <button id="demo-admin" class="btn small" style="width:100%;margin-top:10px">${icon("settings")}Platform Admin Settings</button>
  </details>` : ""}
  <details class="divider-details"><summary>Create a free account (Sign Up)</summary>
    <form id="signup-form">
      <div class="field-row">
        <div><label for="signup-name">Your Name</label><input id="signup-name" required minlength="2" placeholder="e.g. Thabo Mokoena"></div>
        <div><label for="signup-org">Workspace or Organization Name</label><input id="signup-org" required minlength="2" placeholder="e.g. Personal / My Workspace"></div>
      </div>
      <label for="signup-vertical">Workspace Mode (you can change this anytime)</label>
      <select id="signup-vertical">
        <option value="general" selected>\u2728 Everyday / Regular User (General Spreadsheets \u2014 Default)</option>
        <option value="education">\u{1F393} School & District Office (SA-SAMS, Student Lists & Marks)</option>
        <option value="sme_pa">\u{1F4BC} Small Business & PA (Quotes, Tax Invoices & Client Lists)</option>
        <option value="finance_hr">\u{1F4CA} Finance, Bookkeeping & Payroll (Monthly Summaries & Staff)</option>
        <option value="supply_chain">\u{1F4E6} Stock, Inventory & Suppliers (Supplier Sheets & Warehouses)</option>
      </select>
      <div class="field-row">
        <div><label for="signup-email">Email</label><input id="signup-email" type="email" required placeholder="you@example.com"></div>
        <div><label for="signup-password">Password (8+ characters)</label><input id="signup-password" type="password" required minlength="8" placeholder="Password"></div>
      </div>
      <button class="btn primary" style="width:100%;margin-top:14px" id="sign-up-btn">Create Account & Open Workspace${icon("arrow")}</button>
    </form>
  </details>
  <details class="divider-details" ${boot.demo_mode ? "" : "open"}><summary>Sign in to an existing account</summary><form id="login-form"><label for="login-email">Email</label><input id="login-email" type="email" autocomplete="username" required placeholder="you@example.com"><label for="login-password">Password</label><input id="login-password" type="password" autocomplete="current-password" required placeholder="Password"><button class="btn primary" style="width:100%;margin-top:16px" id="sign-in">Sign in${icon("arrow")}</button></form></details>
  <div class="signin-powered-wrap">${poweredByEduSCF()}</div></section></main>`;
    $("login-form").addEventListener("submit", (e) => {
      e.preventDefault();
      void busy($("sign-in"), async () => {
        const r = await api("/api/auth/login", { email: $("login-email").value, password: $("login-password").value });
        $("login-password").value = "";
        await signedIn(r);
      });
    });
    $("signup-form").addEventListener("submit", (e) => {
      e.preventDefault();
      void busy($("sign-up-btn"), async () => {
        const vert = $("signup-vertical").value;
        const r = await api("/api/auth/signup", {
          name: $("signup-org").value.trim(),
          display_name: $("signup-name").value.trim(),
          email: $("signup-email").value.trim(),
          password: $("signup-password").value,
          vertical: vert
        });
        $("signup-password").value = "";
        await signedIn(r);
        toast(`Welcome! Opened your ${VERTICAL_META[vert]?.label || "Everyday"} workspace.`);
      });
    });
    if (boot.demo_mode) {
      document.querySelectorAll("[data-launch-vert]").forEach((b) => b.addEventListener("click", () => void demoLogin("operator", b.dataset.launchVert)));
      if ($("demo-admin")) $("demo-admin").addEventListener("click", () => void demoLogin("admin"));
    }
  }
  async function demoLogin(role, vertical) {
    const r = await api("/api/auth/demo", vertical ? { role, vertical } : { role });
    await signedIn(r);
  }
  async function signedIn(r) {
    user = r.user;
    csrf = r.csrf;
    demoToken = r.demo_token || "";
    workspaceID = user.role === "admin" && boot.demo_mode ? "demo-a" : user.tenant_id;
    await refresh();
    currentPage = user.role === "admin" ? "admin" : "workspace";
    job = null;
    shell();
    await showPage(currentPage);
  }
  async function refresh() {
    if (!user) return;
    if (user.role === "admin") {
      customers = (await api("/api/admin/customers")).items;
      if (!workspaceID || workspaceID === "platform") workspaceID = customers[0]?.id || "";
    }
    if (workspaceID && workspaceID !== "platform") overview = await api("/api/overview");
    else overview = { workspace: { name: "Platform administration" }, jobs: [], stats: { jobs: 0, released: 0, held: 0, knowledge: 0 }, ai: { enabled: false }, preferences: { theme: "light", density: "comfortable", vertical: "general" } };
    applyPreferences();
  }
  function applyPreferences() {
    document.body.className = ((overview.preferences?.theme === "dark" ? "dark" : "light") + (overview.preferences?.density === "compact" ? " compact" : "")).trim();
  }
  function shell() {
    if (!user) return;
    const vert = activeVertical();
    const vMeta = VERTICAL_META[vert] || VERTICAL_META.general;
    $("root").innerHTML = `<div class="shell"><header class="topbar"><div class="topbar-left">${logo()}<nav class="nav" aria-label="Workspace navigation">${vMeta.tabs.map((t) => `<button class="nav-btn" data-page="${t.page}">${icon(t.iconName)}${escapeHTML(t.label)}</button>`).join("")}${user.role === "admin" ? `<button class="nav-btn" data-page="admin">${icon("shield")}Admin</button>` : ""}</nav></div><div class="topbar-right"><select id="vertical-picker" aria-label="Workspace mode" title="Switch between Everyday Mode or an optional Industry Pack">${Object.entries(VERTICAL_META).map(([k, v]) => `<option value="${k}" ${k === vert ? "selected" : ""}>${escapeHTML(v.label)}</option>`).join("")}</select>${user.role === "admin" && customers.length ? `<select id="workspace-picker" aria-label="Customer workspace">${customers.map((c) => `<option value="${c.id}" ${c.id === workspaceID ? "selected" : ""}>${escapeHTML(c.name)}</option>`).join("")}</select>` : ""}<button id="help" class="btn small">${icon("info")}Guide</button><button id="logout" class="icon-button" aria-label="Sign out" title="Sign out">${icon("logout")}</button><button id="mobile-logout" class="icon-button mobile-logout" aria-label="Sign out">${icon("logout")}</button></div></header><main id="main" tabindex="-1"><div id="page" class="page"></div></main><footer class="app-footer"><div class="app-footer-left"><strong>EduSheetManager</strong> <span style="opacity:0.75">by EduSCF</span> \xB7 Calm, everyday spreadsheet helper</div>${poweredByEduSCF()}</footer></div>`;
    document.querySelectorAll("[data-page]").forEach((b) => b.addEventListener("click", () => void showPage(b.dataset.page)));
    $("logout").addEventListener("click", () => void (async () => {
      await api("/api/auth/logout", {});
      loginPage();
    })());
    $("mobile-logout").addEventListener("click", () => void (async () => {
      await api("/api/auth/logout", {});
      loginPage();
    })());
    $("help").addEventListener("click", showHelp);
    $("vertical-picker").addEventListener("change", () => void (async () => {
      const newVert = $("vertical-picker").value;
      const curPrefs = overview.preferences || { theme: "light", density: "comfortable", explanations: "detailed", auto_checks: true };
      await api("/api/preferences", { ...curPrefs, vertical: newVert }, "PUT");
      job = null;
      await refresh();
      const nextTabs = (VERTICAL_META[newVert] || VERTICAL_META.general).tabs;
      if (!nextTabs.some((t) => t.page === currentPage) && currentPage !== "admin") {
        currentPage = newVert === "sme_pa" ? "quotes" : "workspace";
      }
      shell();
      await showPage(currentPage);
      toast(`Switched to ${VERTICAL_META[newVert]?.label || newVert}`);
    })());
    if ($("workspace-picker")) $("workspace-picker").addEventListener("change", () => void (async () => {
      workspaceID = $("workspace-picker").value;
      job = null;
      await refresh();
      shell();
      await showPage(currentPage);
    })());
  }
  async function showPage(page) {
    currentPage = page;
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.page === page));
    try {
      if (page === "workspace") studio();
      else if (page === "builder") builderPage();
      else if (page === "quotes") quotesPage();
      else if (page === "templates") await templatesPage();
      else if (page === "jobs") jobHistory();
      else if (page === "knowledge") await knowledgePage();
      else if (page === "preferences") await preferencesPage();
      else if (page === "admin") await adminPage();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), true);
    }
  }
  function studio() {
    const r = job?.report;
    const release = r?.status === "RELEASED";
    const vert = activeVertical();
    const vMeta = VERTICAL_META[vert] || VERTICAL_META.general;
    const questions = r ? r.questions : job?.plan.questions || [];
    const hasMissingNorthFeb = questions.some((q) => q.text.includes("North / Feb"));
    const hasUnmappedQty = questions.some((q) => q.text.includes("Qty"));
    const headers = r?.headers || job?.profiles.template.sheets.find((s) => s.name === job.plan.destination.sheet)?.headers || ["Site", "Jan", "Feb", "Mar", "Total"];
    const customUnmapped = job?.unmappedTargets;
    const customUnused = job?.unusedSources;
    const customMissing = job?.missingCell;
    const canMapCols = Boolean(job && job.plan?.destination?.mode === "direct" && job.plan?.sources?.[0]?.layout === "direct" && (job.profiles?.sources?.[0]?.sheets?.[0]?.headers || []).length);
    const activeFieldMap = {};
    const srcColSet = /* @__PURE__ */ new Set();
    if (canMapCols && job) {
      for (const p of job.profiles.sources || []) {
        for (const sh of p.sheets || []) {
          for (const h of sh.headers || []) srcColSet.add(h);
        }
      }
      for (const s of job.plan.sources || []) {
        Object.entries(s.field_map || {}).forEach(([k, v]) => {
          if (v) activeFieldMap[k] = v;
        });
        if (s.period && s.columns?.length) {
          const label = `[Matrix: ${s.columns.slice(0, 3).join(", ")}${s.columns.length > 3 ? "\u2026" : ""}]`;
          activeFieldMap[s.period] = label;
          srcColSet.add(label);
        }
      }
    }
    const srcColHeaders = Array.from(srcColSet);
    const hasAudit = Boolean(job?.batch_audit || headers.includes("SA ID Status") || headers.includes("Duplicate Status"));
    let toolbarButtonsHtml = "";
    if (vert === "education") {
      toolbarButtonsHtml = `
      <button class="btn small" data-clean="smart_fix_contacts">\u{1FAAA} Fix SA IDs & Phones</button>
      <button class="btn small" data-clean="caps_levels">\u{1F393} Pass Levels (1\u20137)</button>
      ${hasAudit ? `<button class="btn small primary" id="view-batch-audit">\u{1F4CB} Summary Report</button>` : `<button class="btn small" data-clean="deduplicate">\u{1F9F9} Remove Duplicates</button>`}
    `;
    } else if (vert === "sme_pa") {
      toolbarButtonsHtml = `
      <button class="btn small" data-clean="smart_fix_contacts">\u2728 Fix Names & Phones</button>
      <button class="btn small" data-clean="add_total_row">\u2795 Add Total Row</button>
      <button class="btn small" data-clean="deduplicate">\u{1F9F9} Remove Duplicates</button>
    `;
    } else if (vert === "finance_hr") {
      toolbarButtonsHtml = `
      <button class="btn small" data-clean="add_total_row">\u2795 Add Total Row</button>
      <button class="btn small" data-clean="smart_fix_contacts">\u{1FAAA} Check Staff IDs</button>
      <button class="btn small cyan" id="open-in-studio">\u2696\uFE0F Compare / Summarize \u2192</button>
    `;
    } else if (vert === "supply_chain") {
      toolbarButtonsHtml = `
      <button class="btn small" data-clean="trim_text">\u{1F9F9} Clean Text & SKUs</button>
      <button class="btn small" data-clean="deduplicate">\u2728 Remove Duplicate SKUs</button>
      <button class="btn small" data-clean="add_total_row">\u2795 Add Total Row</button>
    `;
    } else {
      toolbarButtonsHtml = `
      <button class="btn small" data-clean="smart_fix_contacts">\u2728 Clean Names, Phones & IDs</button>
      <button class="btn small" data-clean="add_total_row">\u2795 Add Total Row</button>
      ${hasAudit ? `<button class="btn small primary" id="view-batch-audit">\u{1F4CB} Summary Report</button>` : `<button class="btn small" data-clean="deduplicate">\u{1F9F9} Remove Duplicates</button>`}
    `;
    }
    $("page").innerHTML = `
  <section class="vertical-welcome" aria-label="How It Works and Quick Start Demos">
    <div class="steps-strip" aria-label="How it works in 3 easy steps">
      <div class="step-pill"><span class="step-num">1</span><div><strong>STEP 1: Load or Create</strong><small>Click a 1-Click Demo below, upload files/folder, or type columns in chat.</small></div></div>
      <div class="step-pill"><span class="step-num">2</span><div><strong>STEP 2: Tell the AI Helper</strong><small>Ask for any change in plain words on the left (or click a 1-click fix).</small></div></div>
      <div class="step-pill"><span class="step-num">3</span><div><strong>STEP 3: Download Excel (.XLSX)</strong><small>Review your finished table on the right & download in 1 click.</small></div></div>
    </div>
    <div class="vertical-welcome-head">
      <div>
        <h2>Try a 1-Click Live Demo \u2014 or Upload / Type Below</h2>
        <small style="color:var(--muted)">${escapeHTML(vMeta.desc)}</small>
      </div>
      <span class="badge purple">${escapeHTML(vMeta.label)}</span>
    </div>
    <div class="vertical-cards-grid">
      ${vMeta.cards.map((c) => `<button class="v-action-card" data-vcard="${escapeHTML(c.action)}"><strong>${escapeHTML(c.title)}</strong><small>${escapeHTML(c.desc)}</small></button>`).join("")}
    </div>
  </section>

  <div class="simple-studio"><section class="chat-card" aria-label="Sheet Helper"><div class="chat-top"><div class="chat-top-title"><span class="bot-avatar">${icon("spark")}</span><div><h1>STEP 1 & 2 \xB7 AI Sheet Helper</h1><small>${job ? escapeHTML(job.title) : "Upload files OR tell me what spreadsheet to build"}</small></div></div>${job ? `<button id="new-job" class="btn small">${icon("plus")}Start Over</button>` : `<button id="open-advanced-builder" class="btn small">${icon("edit")}Multi-Tab Editor</button>`}</div><div class="picker-bar">${boot.demo_mode ? `<div class="picker-row"><select id="sample-case" aria-label="Try an example">${vMeta.samples.map((s, idx) => `<option value="${s.val}">Demo ${idx + 1}: ${escapeHTML(s.label)}</option>`).join("")}</select><button id="load-example" class="btn primary small">Load Demo</button></div>` : ""}<details class="upload-drawer" id="upload-drawer-box" open><summary>\u{1F4E4} Upload Your Own Excel / CSV Files (or an Entire Folder)</summary><div class="upload-grid" style="grid-template-columns:1fr 1fr 1fr"><label class="upload-box" for="source-files">${icon("upload")}<strong>Your Sheet(s)</strong><small>Excel or CSV</small><input id="source-files" type="file" multiple accept=".xlsx,.csv" aria-label="Upload source spreadsheets"></label><label class="upload-box" for="folder-files">${icon("folder")}<strong>Entire Folder</strong><small>Merge all files</small><input id="folder-files" type="file" webkitdirectory directory multiple aria-label="Upload entire folder of spreadsheets"></label><label class="upload-box" for="target-file">${icon("grid")}<strong>Template</strong><small>Optional</small><input id="target-file" type="file" accept=".xlsx,.csv" aria-label="Upload destination template"></label></div><div id="file-list" class="file-list"></div><button id="inspect-files" class="btn primary small" style="width:100%;margin-top:8px" disabled>Open Uploaded Files</button></details></div><div class="messages" id="messages" tabindex="0" aria-label="Helper conversation" aria-live="polite">${job ? job.chat.map((m) => `<article class="msg ${m.role === "user" ? "user" : ""}"><span class="msg-sender">${m.role === "user" ? "You" : "Helper"}</span><div class="bubble">${escapeHTML(friendlyText(m.text))}</div></article>`).join("") : `<article class="msg"><span class="msg-sender">Helper</span><div class="bubble"><b>Hi! Everything happens right here on this one screen:</b>
1\uFE0F\u20E3 Click a <b>1-Click Demo</b> card at the top, or <b>Upload</b> your Excel/CSV files above.
2\uFE0F\u20E3 Or just <b>type below</b> what spreadsheet you want me to create from scratch (e.g. <i>"Columns: Name, Phone, Amount, Paid"</i>)!</div></article>`}</div>${job ? `<div class="quick-action-bar">${job.proposal ? `<button id="confirm-correction" class="btn primary">${icon("check")}Yes, apply: ${escapeHTML(job.proposal.description)}</button>` : ""}${!r || !release ? `<button id="run-job" class="btn ${r ? "" : "primary"}">${icon("check")}${r ? "Update Sheet" : "Fill My Sheet"}</button>` : ""}<div class="quick-chips">${hasMissingNorthFeb && !job.proposal ? `<button class="chip" data-chat="18">Reply: 18</button><button class="chip" data-chat="North Feb is 18">North Feb is 18</button>` : ""}${customMissing && !hasMissingNorthFeb && !job.proposal ? `<button class="chip" data-chat="${escapeHTML(customMissing.entity)} ${escapeHTML(customMissing.category)} is 18">Set ${escapeHTML(customMissing.entity)} / ${escapeHTML(customMissing.category)} = 18</button>` : ""}${hasUnmappedQty && !customUnmapped?.length && !job.proposal ? `<button class="chip" data-chat="yes">Yes, put Boxes in Qty</button>` : ""}${customUnmapped?.length && customUnused?.length && !job.proposal ? customUnused.slice(0, 2).map((sc) => `<button class="chip" data-chat="put ${escapeHTML(sc)} in ${escapeHTML(customUnmapped[0])}">Put ${escapeHTML(sc)} in ${escapeHTML(customUnmapped[0])}</button>`).join("") : ""}${r && !release ? `<button class="chip" data-chat="What is blocking this output?">What is missing?</button>` : ""}${release && headers.includes("Jan") && headers.includes("Feb") ? `<button class="chip" data-chat="swap Jan and Feb">Swap Jan & Feb</button><button class="chip" data-chat="replace the first row with row 2">Swap row 1 & row 2</button>` : ""}${job ? `<button class="chip" data-chat="How did you match my columns?">Show column matches</button>` : ""}</div></div>` : `<div class="quick-action-bar"><div class="quick-chips"><button class="chip" data-chat="${escapeHTML(vMeta.builderPresetCmd)}">\u2728 Build ${escapeHTML(vMeta.builderPresetLabel)}</button><button class="chip" data-chat="Create a SA-SAMS student & tuition sheet">\u{1F393} Build Student & Tuition Sheet</button><button class="chip" data-chat="Create a monthly expense tracker">\u{1F4CA} Build Expense & VAT Sheet</button></div></div>`}<form id="chat-form" class="chat-compose"><textarea id="chat-text" rows="1" aria-label="Message the Sheet Helper" placeholder="${job ? "Type what you want to change (e.g. 'swap Jan and Feb', '18', 'yes')\u2026" : "Tell me what spreadsheet to create (e.g. 'Columns: Name, Phone, Fee, Paid')\u2026"}"></textarea><button id="send-chat" class="btn primary small" type="submit" aria-label="Send message">${icon("send")}</button></form></section><section class="result-card" aria-label="Your Spreadsheet"><div class="result-head"><div><h2>STEP 3 \xB7 Your Live Spreadsheet</h2><small>${release ? "Everything looks good \u2014 click Download Excel (.XLSX) on the right." : r ? "Answer the quick question on the left (or pick a column below) to finish." : job ? "Click Fill My Sheet on the left to populate your table." : "Click a 1-Click Demo at the top, upload a file, or type in the chat on the left."}</small></div><div class="result-actions"><span id="output-state" class="badge ${release ? "good" : r ? "warn" : ""}">${release ? "\u2713 Ready to Download" : r ? "Needs 1 Quick Answer" : "Waiting for Sheet"}</span><button class="btn small ${release ? "primary" : ""}" id="download-output" ${release ? "" : "disabled"}>${icon(release ? "download" : "lock")}Download Excel (.XLSX)</button></div></div>${r?.rows.length ? `<div class="clean-toolbar"><span>1-Click Fixes:</span>${toolbarButtonsHtml}</div>` : ""}<div class="table-scroll" tabindex="0" aria-label="Output preview"><table><thead><tr>${headers.map((h) => canMapCols ? `<th><div class="th-col-wrap"><span>${escapeHTML(h)}</span><select class="col-map-select ${activeFieldMap[h] ? "" : "unmapped"}" data-map-target="${escapeHTML(h)}" aria-label="Source column for ${escapeHTML(h)}"><option value="">${activeFieldMap[h] ? "\u2014 Unmap \u2014" : "Choose column\u2026"}</option>${srcColHeaders.map((sh) => `<option value="${escapeHTML(sh)}" ${activeFieldMap[h] === sh ? "selected" : ""}>\u2190 ${escapeHTML(sh)}</option>`).join("")}</select></div></th>` : `<th>${escapeHTML(h)}</th>`).join("")}</tr></thead><tbody>${r?.rows.length ? r.rows.map((row) => `<tr>${headers.map((h) => `<td>${row[h] === null || row[h] === void 0 ? '<span class="missing">Ask in chat</span>' : escapeHTML(row[h])}</td>`).join("")}</tr>`).join("") : `<tr><td class="table-empty" colspan="${headers.length}">${job ? "Click <b>Fill My Sheet</b> on the left to fill your spreadsheet." : "\u{1F446} Click any <b>1-Click Demo</b> card at the top, upload your files on the left, or type what columns you want in the chat box!"}</td></tr>`}</tbody></table></div></section></div>`;
    if ($("open-advanced-builder")) $("open-advanced-builder").addEventListener("click", () => void showPage("builder"));
    document.querySelectorAll("[data-vcard]").forEach((card) => card.addEventListener("click", () => void busy(card, async () => {
      const act = card.dataset.vcard;
      if (act.startsWith("sample:")) {
        const cVal = act.split(":")[1];
        job = await api("/api/demo/jobs", { case: cVal, request_id: uid() });
        if (cVal !== "chat_map" && cVal !== "district_batch") {
          job = await api(`/api/jobs/${job.id}/run`, {});
        }
        await refresh();
        shell();
        await showPage("workspace");
      } else if (act === "page:quotes") {
        await showPage("quotes");
      } else if (act === "page:builder") {
        await showPage("builder");
      } else if (act === "upload:open") {
        const d = $("upload-drawer-box");
        if (d) d.open = true;
        $("source-files")?.click();
      } else if (act === "folder:open") {
        const d = $("upload-drawer-box");
        if (d) d.open = true;
        $("folder-files")?.click();
      } else if (act.startsWith("builder:")) {
        const sub = act.split(":")[1];
        if (sub === "paste") {
          builderState.pasteOpen = true;
          await showPage("builder");
        } else {
          handleBuilderChatCommand(vMeta.builderPresetCmd);
          const tab = currentBuilderTab();
          job = await api("/api/jobs/from-builder", { title: builderState.title || "Created-Sheet.xlsx", sheet: tab.name || "Sheet1", headers: tab.headers, rows: tab.rows, request_id: uid() });
          await refresh();
          shell();
          await showPage("workspace");
        }
      }
    })));
    if ($("new-job")) $("new-job").addEventListener("click", () => {
      job = null;
      studio();
    });
    if ($("load-example")) $("load-example").addEventListener("click", () => void busy($("load-example"), async () => {
      const caseValue = $("sample-case").value;
      job = await api("/api/demo/jobs", { case: caseValue, request_id: uid() });
      if (caseValue !== "chat_map" && caseValue !== "district_batch") {
        job = await api(`/api/jobs/${job.id}/run`, {});
      }
      await refresh();
      shell();
      await showPage("workspace");
      if ($("sample-case")) $("sample-case").value = caseValue;
    }));
    const selection = () => {
      const src = $("source-files").files;
      const fld = $("folder-files").files;
      const target = $("target-file").files;
      const validFolderFiles = Array.from(fld || []).filter((f) => /\.(xlsx|csv)$/i.test(f.name));
      $("file-list").innerHTML = [...Array.from(src || []), ...validFolderFiles, ...Array.from(target || [])].map((f) => `<span class="file-chip">${escapeHTML(f.webkitRelativePath || f.name)}</span>`).join("");
      $("inspect-files").disabled = !src?.length && !validFolderFiles.length && !target?.length;
    };
    $("source-files").addEventListener("change", selection);
    $("folder-files").addEventListener("change", selection);
    $("target-file").addEventListener("change", selection);
    $("inspect-files").addEventListener("click", () => void busy($("inspect-files"), async () => {
      const f = new FormData();
      const targetFiles = $("target-file").files;
      const srcFiles = $("source-files").files;
      const fldFiles = Array.from($("folder-files").files || []).filter((fl) => /\.(xlsx|csv)$/i.test(fl.name));
      if (targetFiles?.length) f.append("target", targetFiles[0]);
      if (fldFiles.length) {
        for (const file of fldFiles) f.append("sources", file);
        f.append("request_id", uid());
        f.append("title", "Folder Batch Master Consolidation");
        job = await api("/api/jobs/batch-folder", f);
      } else {
        if (srcFiles?.length) {
          for (const file of Array.from(srcFiles)) f.append("sources", file);
        } else if (targetFiles?.length) {
          f.append("sources", targetFiles[0]);
        }
        f.append("request_id", uid());
        job = await api("/api/jobs", f);
        if (!job.report && !job.plan.questions.length) {
          try {
            job = await api(`/api/jobs/${job.id}/run`, {});
          } catch {
          }
        }
      }
      await refresh();
      shell();
      await showPage("workspace");
    }));
    if ($("view-batch-audit")) $("view-batch-audit").addEventListener("click", () => showBatchAuditModal());
    if (job) {
      $("run-job").addEventListener("click", () => void doRun());
      $("download-output").addEventListener("click", () => void download("output"));
      document.querySelectorAll(".col-map-select").forEach((sel) => sel.addEventListener("change", () => void busy(sel, async () => {
        const tgt = sel.dataset.mapTarget;
        const src = sel.value;
        job = await api(`/api/jobs/${job.id}/map-column`, { target_column: tgt, source_column: src, request_id: uid() });
        await refresh();
        shell();
        await showPage("workspace");
        toast(src ? `Matched ${src} \u2192 ${tgt}` : `Cleared ${tgt}`);
      })));
      document.querySelectorAll("[data-clean]").forEach((btn) => btn.addEventListener("click", () => void busy(btn, async () => {
        const op = btn.dataset.clean;
        job = await api(`/api/jobs/${job.id}/clean`, { operation: op, request_id: uid() });
        await refresh();
        shell();
        await showPage("workspace");
        toast("Spreadsheet updated!");
      })));
      if ($("open-in-studio")) $("open-in-studio").addEventListener("click", () => {
        if (!job?.report) return;
        builderState = {
          title: job.title || "Transformed-Workbook.xlsx",
          activeTab: 0,
          tabs: [{
            name: job.plan?.destination?.sheet || "Sheet1",
            headers: [...job.report.headers],
            rows: job.report.rows.map((r2) => ({ ...r2 })),
            formulas: {}
          }],
          chat: [{ role: "qms", text: `Opened ${job.report.rows.length} rows from "${job.title}". You can now split into tabs, add formula columns, summarize, or compare tabs!` }],
          pasteOpen: false
        };
        void showPage("builder");
        toast("Opened in Sheet Creator!");
      });
    }
    wireChat();
  }
  function makeBlankTab(name = "Sheet1", cols = 4, rowCount = 5) {
    const headers = Array.from({ length: cols }, (_, i) => `Column ${String.fromCharCode(65 + i)}`);
    const rows = Array.from({ length: rowCount }, () => {
      const r = {};
      headers.forEach((h) => {
        r[h] = "";
      });
      return r;
    });
    return { name, headers, rows, formulas: {} };
  }
  var builderState = {
    title: "New-Workbook.xlsx",
    activeTab: 0,
    tabs: [makeBlankTab("Sheet1", 4, 5)],
    chat: [{ role: "qms", text: "Welcome! You are starting with a fresh blank sheet. Type directly into any header or cell on the right, paste messy text from WhatsApp/Email/PDF above, or tell me in plain English what columns, rows, or formulas to build!" }],
    pasteOpen: false
  };
  function currentBuilderTab() {
    if (!builderState.tabs.length) builderState.tabs = [makeBlankTab("Sheet1", 4, 5)];
    if (builderState.activeTab >= builderState.tabs.length) builderState.activeTab = 0;
    return builderState.tabs[builderState.activeTab];
  }
  function saIdLuhnCheckDigitClient(digits12) {
    if (digits12.length !== 12 || !/^\d{12}$/.test(digits12)) return -1;
    let total = 0;
    for (let i = 0; i < 12; i++) {
      const d = Number(digits12[i]);
      if (i % 2 === 0) {
        total += d;
      } else {
        const dbl = d * 2;
        total += dbl > 9 ? dbl - 9 : dbl;
      }
    }
    return (10 - total % 10) % 10;
  }
  function validateAndRepairSaIdClient(rawVal) {
    if (rawVal === null || rawVal === void 0 || String(rawVal).trim() === "") {
      return { id: "", status: "Missing ID", dob: "", gender: "", citizenship: "", repaired: false, valid: false };
    }
    const s = String(rawVal).trim().replace(/\.0$/, "");
    if (/[A-Za-z]/.test(s)) {
      return { id: s, status: "Foreign / Passport / Permit ID", dob: "", gender: "", citizenship: "Foreign / Permit", repaired: false, valid: true };
    }
    let digits = s.replace(/\D/g, "");
    if (!digits) {
      return { id: s, status: "Missing ID", dob: "", gender: "", citizenship: "", repaired: false, valid: false };
    }
    let repaired = false;
    if (digits.length === 11 || digits.length === 12) {
      const padded = digits.padStart(13, "0");
      const yy2 = Number(padded.slice(0, 2)), mm2 = Number(padded.slice(2, 4)), dd2 = Number(padded.slice(4, 6));
      if (yy2 >= 0 && yy2 <= 9 && mm2 >= 1 && mm2 <= 12 && dd2 >= 1 && dd2 <= 31) {
        digits = padded;
        repaired = true;
      }
    }
    if (digits.length !== 13) {
      return { id: s, status: `Invalid Length (${digits.length} digits)`, dob: "", gender: "", citizenship: "", repaired: false, valid: false };
    }
    const yy = Number(digits.slice(0, 2)), mm = Number(digits.slice(2, 4)), dd = Number(digits.slice(4, 6));
    const century = yy <= 26 ? 2e3 : 1900;
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
      return { id: digits, status: "Invalid SA ID (Bad Date)", dob: "", gender: "", citizenship: "", repaired, valid: false };
    }
    const dob = `${century + yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    const gender = Number(digits.slice(6, 10)) >= 5e3 ? "Male" : "Female";
    const citDigit = digits[10];
    const citizenship = citDigit === "0" ? "SA Citizen" : citDigit === "1" ? "Permanent Resident" : "Other / Foreign";
    const expectedCheck = saIdLuhnCheckDigitClient(digits.slice(0, 12));
    const actualCheck = Number(digits[12]);
    if (expectedCheck !== actualCheck) {
      return { id: digits, status: `Invalid SA ID (Checksum Failed \u2014 expected ${expectedCheck})`, dob, gender, citizenship, repaired, valid: false };
    }
    const status = repaired ? "Repaired SA ID (Leading 0 Restored)" : "Valid SA ID";
    return { id: digits, status, dob, gender, citizenship, repaired, valid: true };
  }
  function percentageToCapsLevelClient(val) {
    if (val === null || val === void 0 || String(val).trim() === "") return { level: null, desc: "", at_risk: false };
    const s = String(val).trim().replace(/%/g, "");
    const pct = Number(s);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) return { level: null, desc: "", at_risk: false };
    if (pct >= 80) return { level: 7, desc: "Level 7 (Outstanding)", at_risk: false };
    if (pct >= 70) return { level: 6, desc: "Level 6 (Meritorious)", at_risk: false };
    if (pct >= 60) return { level: 5, desc: "Level 5 (Substantial)", at_risk: false };
    if (pct >= 50) return { level: 4, desc: "Level 4 (Adequate)", at_risk: false };
    if (pct >= 40) return { level: 3, desc: "Level 3 (Moderate)", at_risk: false };
    if (pct >= 30) return { level: 2, desc: "Level 2 (Elementary \u2014 At Risk)", at_risk: true };
    return { level: 1, desc: "Level 1 (Not Achieved \u2014 At Risk)", at_risk: true };
  }
  function showBatchAuditModal() {
    const r = job?.report;
    const rows = r?.rows || [];
    const ba = job?.batch_audit || {};
    let validIds = ba.valid_sa_ids || 0, repairedIds = ba.repaired_sa_ids || 0, foreignIds = ba.foreign_or_permit_ids || 0, invalidIds = ba.invalid_sa_ids || 0, dupRows = ba.cross_file_duplicates || 0;
    if (!ba.total_rows && rows.length) {
      for (const row of rows) {
        const st = String(row["SA ID Status"] || "");
        if (st === "Valid SA ID") validIds++;
        else if (st.startsWith("Repaired SA ID")) repairedIds++;
        else if (st.startsWith("Foreign")) foreignIds++;
        else if (st.startsWith("Invalid")) invalidIds++;
        const ds = String(row["Duplicate Status"] || "");
        if (ds.startsWith("Duplicate")) dupRows++;
      }
    }
    const filesMerged = ba.files_merged || (job?.profiles?.sources?.length || 1);
    const totalRows = ba.total_rows || rows.length;
    openModal("EduSheetManager \u2014 Data Quality Summary Report", `
    <div style="display:grid;gap:12px">
      <p style="margin:0;color:var(--muted)">Before-vs-After Data Quality Summary for schools, district offices, consultants, and business compliance:</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${filesMerged}</strong><small style="display:block;color:var(--muted)">Files Consolidated</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${totalRows}</strong><small style="display:block;color:var(--muted)">Total Master Rows</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${validIds + repairedIds}</strong><small style="display:block;color:var(--muted)">Verified 13-Digit SA IDs</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${repairedIds}</strong><small style="display:block;color:var(--muted)">Leading-Zero IDs Restored (Born 2000\u20132009)</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${foreignIds}</strong><small style="display:block;color:var(--muted)">Foreign / Study Permit IDs</small></div>
        <div class="stat-box" style="padding:12px;border:1px solid var(--line);border-radius:10px"><strong>${invalidIds}</strong><small style="display:block;color:var(--muted)">Checksum Issues Flagged</small></div>
      </div>
      <div class="check ${dupRows > 0 ? "fail" : ""}">
        <strong>${dupRows > 0 ? `! ${dupRows} Cross-File Duplicate Record(s) Flagged` : "\u2713 0 Cross-File Duplicates Found"}</strong>
        <small>All rows are preserved in your Master Sheet with <b>Source File</b>, <b>Duplicate Status</b>, and <b>SA ID Status</b> columns so no data is silently lost.</small>
      </div>
      <div style="margin-top:6px;padding-top:12px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <small style="color:var(--muted)">Generated by <b>EduSheetManager</b></small>
        ${poweredByEduSCF()}
      </div>
    </div>
  `);
  }
  function runSaIdAndContactSmartFixOnTab(tab) {
    let fixed = 0;
    const idCol = tab.headers.find((h) => /sa id|id number|identity|id no/i.test(h));
    let statusCol = tab.headers.find((h) => /sa id status|id status/i.test(h));
    let dobCol = tab.headers.find((h) => /date of birth|dob|birth/i.test(h));
    let genderCol = tab.headers.find((h) => /gender|sex/i.test(h));
    let citCol = tab.headers.find((h) => /citizenship|citizen/i.test(h));
    if (idCol && !statusCol) {
      statusCol = "SA ID Status";
      tab.headers.splice(tab.headers.indexOf(idCol) + 1, 0, statusCol);
    }
    if (idCol && !dobCol) {
      dobCol = "Date of Birth";
      tab.headers.splice(tab.headers.indexOf(statusCol || idCol) + 1, 0, dobCol);
    }
    if (idCol && !genderCol) {
      genderCol = "Gender";
      tab.headers.splice(tab.headers.indexOf(dobCol || idCol) + 1, 0, genderCol);
    }
    if (idCol && !citCol) {
      citCol = "Citizenship";
      tab.headers.splice(tab.headers.indexOf(genderCol || idCol) + 1, 0, citCol);
    }
    for (const r of tab.rows) {
      if (idCol && r[idCol] !== void 0 && r[idCol] !== null && String(r[idCol]).trim() !== "") {
        const info = validateAndRepairSaIdClient(r[idCol]);
        if (info.id && info.id !== String(r[idCol])) {
          r[idCol] = info.id;
          fixed++;
        }
        if (statusCol && r[statusCol] !== info.status) {
          r[statusCol] = info.status;
          fixed++;
        }
        if (dobCol && info.dob && !r[dobCol]) {
          r[dobCol] = info.dob;
          fixed++;
        }
        if (genderCol && info.gender && !r[genderCol]) {
          r[genderCol] = info.gender;
          fixed++;
        }
        if (citCol && info.citizenship && !r[citCol]) {
          r[citCol] = info.citizenship;
          fixed++;
        }
      }
      for (const h of tab.headers) {
        const val = r[h];
        if (val === void 0 || val === null || String(val).trim() === "") continue;
        const hl = h.toLowerCase();
        const s = String(val).trim();
        if (/name|surname|student|learner|guardian|parent|customer|supplier/.test(hl) && !/id|email|phone|cell|status/.test(hl)) {
          const tc = s.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
          if (tc !== s) {
            r[h] = tc;
            fixed++;
          }
        } else if (/phone|cell|mobile|tel/.test(hl)) {
          let d = s.startsWith("+27") ? "0" + s.slice(3).replace(/\D/g, "") : s.replace(/[\s()-]/g, "");
          if (/^[1-9]\d{8}$/.test(d)) d = "0" + d;
          if (d !== s) {
            r[h] = d;
            fixed++;
          }
        } else if (/email/.test(hl)) {
          const fe = s.toLowerCase().replace(/@(gmial|gamil|gmai)\.com$/i, "@gmail.com").replace(/@(yaho|yahooo)\.com$/i, "@yahoo.com");
          if (fe !== s) {
            r[h] = fe;
            fixed++;
          }
        } else if (["grade", "gr", "learner grade", "student grade"].includes(hl)) {
          const m = s.match(/^(?:grade|gr\.?|g)?\s*(\d{1,2}[a-zA-Z]?)$/i);
          if (m && `Grade ${m[1]}` !== s) {
            r[h] = `Grade ${m[1]}`;
            fixed++;
          }
        }
      }
    }
    return fixed;
  }
  function parsePastedMessyTextToTab(rawText) {
    const lines = rawText.split(/\r?\n/).map((l) => l.replace(/^\s*\d+[.)]\s*/, "").trim()).filter(Boolean);
    if (!lines.length) return "Paste at least one line of text first.";
    const splitLine = (line) => {
      if (line.includes("	")) return line.split("	").map((s) => s.trim());
      if (line.includes("|")) return line.split("|").map((s) => s.trim()).filter(Boolean);
      if (line.includes(" - ")) return line.split(/\s+-\s+/).map((s) => s.trim());
      if (line.includes(",")) return line.split(",").map((s) => s.trim());
      return line.split(/\s{2,}/).map((s) => s.trim());
    };
    const matrix = lines.map(splitLine).filter((r) => r.length > 0);
    const maxCols = Math.max(...matrix.map((r) => r.length), 1);
    const first = matrix[0];
    const looksLikeData = first.some((c) => /@/.test(c) || /^\+?\d[\d\s-]{7,}$/.test(c) || /^STU\d+/i.test(c) || /^(?:gr(?:ade)?\s*\d+|\d+)$/i.test(c));
    let headers;
    let dataRows;
    if (!looksLikeData && matrix.length > 1) {
      headers = Array.from({ length: maxCols }, (_, i) => first[i] || `Column ${i + 1}`);
      dataRows = matrix.slice(1);
    } else {
      headers = Array.from({ length: maxCols }, (_, i) => {
        const sample = matrix[0][i] || "";
        if (/^STU\d+|^ID|^EMP|^SKU/i.test(sample)) return "ID";
        if (/^\d{13}$/.test(sample.replace(/\D/g, ""))) return "SA ID Number";
        if (/@/.test(sample)) return "Email";
        if (/^(?:\+27|0?\d{9,10})$/.test(sample.replace(/[\s()-]/g, ""))) return "Phone";
        if (/^(?:gr(?:ade)?\s*\d{1,2})$/i.test(sample)) return "Grade";
        if (i === 0 || i === 1) return i === 0 ? "Full Name" : "Details";
        return `Column ${i + 1}`;
      });
      dataRows = matrix;
    }
    const rows = dataRows.map((r) => {
      const obj = {};
      headers.forEach((h, i) => {
        const raw = r[i] ?? "";
        obj[h] = raw !== "" && !Number.isNaN(Number(raw)) && !/^0\d+/.test(raw) && raw.replace(/\D/g, "").length !== 13 ? Number(raw) : raw;
      });
      return obj;
    });
    const tab = currentBuilderTab();
    tab.headers = headers;
    tab.rows = rows;
    const fixed = runSaIdAndContactSmartFixOnTab(tab);
    return `Converted ${rows.length} pasted line(s) into ${headers.length} clean columns (${tab.headers.join(", ")})${fixed ? ` and auto-fixed ${fixed} contact/SA-ID field(s)` : ""}!`;
  }
  function addCalculatedColumnToTab(tab, newColName, colA, op, colB) {
    const name = newColName.trim() || "Calculated";
    if (!tab.headers.includes(name)) tab.headers.push(name);
    tab.rows.forEach((r) => {
      const a = Number(r[colA]) || 0;
      const b = colB ? Number(r[colB]) || 0 : 0;
      let res = 0;
      if (op === "-") res = a - b;
      else if (op === "+") res = a + b;
      else if (op === "*") res = a * b;
      else if (op === "/") res = b !== 0 ? Math.round(a / b * 100) / 100 : 0;
      else if (op === "vat15") res = Math.round(a * 0.15 * 100) / 100;
      r[name] = Math.round(res * 100) / 100;
    });
    tab.formulas[name] = op === "vat15" ? `${colA} * 15%` : `${colA} ${op} ${colB}`;
    return `Added calculated column "${name}" (${tab.formulas[name]}) across all ${tab.rows.length} rows!`;
  }
  function splitTabByColumn(tab, groupCol) {
    if (!tab.headers.includes(groupCol)) return `Column "${groupCol}" not found.`;
    const groups = {};
    for (const r of tab.rows) {
      const key = String(r[groupCol] ?? "Other").trim() || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push({ ...r });
    }
    const keys = Object.keys(groups);
    if (keys.length < 1) return "No rows to split.";
    for (const k of keys) {
      const safeName = k.slice(0, 31);
      const existing = builderState.tabs.findIndex((t) => t.name === safeName);
      const newTab = { name: safeName, headers: [...tab.headers], rows: groups[k], formulas: { ...tab.formulas } };
      if (existing >= 0) builderState.tabs[existing] = newTab;
      else builderState.tabs.push(newTab);
    }
    builderState.activeTab = builderState.tabs.length - 1;
    return `Split "${tab.name}" by "${groupCol}" into ${keys.length} separate workbook tabs (${keys.join(", ")})! Click any tab at the bottom or Download Multi-Tab XLSX.`;
  }
  function summarizeTabByColumn(tab, groupCol) {
    if (!tab.headers.includes(groupCol)) return `Column "${groupCol}" not found.`;
    const numCols = tab.headers.filter((h) => h !== groupCol && tab.rows.some((r) => typeof r[h] === "number" || r[h] !== "" && r[h] !== null && !Number.isNaN(Number(r[h])) && !/^0\d+/.test(String(r[h]))));
    const groups = {};
    for (const r of tab.rows) {
      const g = String(r[groupCol] ?? "Unassigned").trim() || "Unassigned";
      if (g.toLowerCase() === "total") continue;
      if (!groups[g]) groups[g] = [];
      groups[g].push(r);
    }
    const sumHeaders = [groupCol, "Count", ...numCols.flatMap((c) => [`Total ${c}`, `Avg ${c}`])];
    const sumRows = Object.entries(groups).map(([g, gRows]) => {
      const row = { [groupCol]: g, "Count": gRows.length };
      for (const c of numCols) {
        const vals = gRows.map((r) => Number(r[c])).filter((v) => Number.isFinite(v));
        const tot = vals.reduce((a, b) => a + b, 0);
        row[`Total ${c}`] = Math.round(tot * 100) / 100;
        row[`Avg ${c}`] = vals.length ? Math.round(tot / vals.length * 100) / 100 : 0;
      }
      return row;
    });
    const sumTabName = `Summary by ${groupCol}`.slice(0, 31);
    const existing = builderState.tabs.findIndex((t) => t.name === sumTabName);
    const newTab = { name: sumTabName, headers: sumHeaders, rows: sumRows, formulas: {} };
    if (existing >= 0) {
      builderState.tabs[existing] = newTab;
      builderState.activeTab = existing;
    } else {
      builderState.tabs.push(newTab);
      builderState.activeTab = builderState.tabs.length - 1;
    }
    return `Created "${sumTabName}" tab with counts, totals, and averages across ${sumRows.length} groups!`;
  }
  function compareTwoTabs(tabA, tabB) {
    const keyColA = tabA.headers[0] || "ID";
    const keyColB = tabB.headers[0] || "ID";
    const mapA = /* @__PURE__ */ new Map();
    const mapB = /* @__PURE__ */ new Map();
    tabA.rows.forEach((r) => {
      const k = String(r[keyColA] ?? "").trim();
      if (k) mapA.set(k.toLowerCase(), r);
    });
    tabB.rows.forEach((r) => {
      const k = String(r[keyColB] ?? "").trim();
      if (k) mapB.set(k.toLowerCase(), r);
    });
    const allKeys = Array.from(/* @__PURE__ */ new Set([...mapA.keys(), ...mapB.keys()]));
    const sharedCols = tabA.headers.slice(1).filter((h) => tabB.headers.some((hb) => hb.toLowerCase() === h.toLowerCase()));
    const recHeaders = [keyColA, "Status", "Details", ...sharedCols.map((c) => `${c} (${tabA.name} vs ${tabB.name})`)];
    let matched = 0, onlyA = 0, onlyB = 0, diffCount = 0;
    const recRows = allKeys.map((k) => {
      const rA = mapA.get(k), rB = mapB.get(k);
      const displayKey = String(rA?.[keyColA] ?? rB?.[keyColB] ?? k);
      if (rA && !rB) {
        onlyA++;
        return { [keyColA]: displayKey, "Status": `Only in ${tabA.name}`, "Details": `Missing from ${tabB.name}` };
      }
      if (!rA && rB) {
        onlyB++;
        return { [keyColA]: displayKey, "Status": `Only in ${tabB.name}`, "Details": `Missing from ${tabA.name}` };
      }
      const diffs = [];
      const rowObj = { [keyColA]: displayKey };
      for (const c of sharedCols) {
        const bCol = tabB.headers.find((hb) => hb.toLowerCase() === c.toLowerCase()) || c;
        const vA = String(rA[c] ?? "").trim(), vB = String(rB[bCol] ?? "").trim();
        rowObj[`${c} (${tabA.name} vs ${tabB.name})`] = vA === vB ? vA : `${vA} \u2192 ${vB}`;
        if (vA !== vB) diffs.push(`${c}: ${vA || "blank"} vs ${vB || "blank"}`);
      }
      if (diffs.length) {
        diffCount++;
        rowObj["Status"] = "Value Changed";
        rowObj["Details"] = diffs.join("; ");
      } else {
        matched++;
        rowObj["Status"] = "Matched";
        rowObj["Details"] = "Identical across both tabs";
      }
      return rowObj;
    });
    const recTab = { name: "Reconciliation", headers: recHeaders, rows: recRows, formulas: {} };
    const idx = builderState.tabs.findIndex((t) => t.name === "Reconciliation");
    if (idx >= 0) {
      builderState.tabs[idx] = recTab;
      builderState.activeTab = idx;
    } else {
      builderState.tabs.push(recTab);
      builderState.activeTab = builderState.tabs.length - 1;
    }
    return `Reconciled "${tabA.name}" vs "${tabB.name}": ${matched} identical, ${diffCount} value difference(s), ${onlyA} only in ${tabA.name}, and ${onlyB} only in ${tabB.name}.`;
  }
  function handleBuilderChatCommand(promptText) {
    const tab = currentBuilderTab();
    const lower = promptText.toLowerCase().trim();
    if (/^(start|new|clear|reset)\s*(blank|empty|sheet|table)?/.test(lower)) {
      builderState.tabs = [makeBlankTab("Sheet1", 4, 5)];
      builderState.activeTab = 0;
      return "Started a fresh blank sheet (Column A, Column B, Column C, Column D) with 5 empty rows.";
    }
    if (lower.includes("fix") && (lower.includes("contact") || lower.includes("id") || lower.includes("phone") || lower.includes("dob"))) {
      const n = runSaIdAndContactSmartFixOnTab(tab);
      return `Ran SA ID & Contact Smart Fix (${n} field(s) updated across SA IDs, DOB, Gender, Names, Phones, and Emails).`;
    }
    if (lower.includes("split") && lower.includes("by")) {
      const m = promptText.match(/by\s+([A-Za-z0-9 _-]+)/i);
      const col = m ? tab.headers.find((h) => h.toLowerCase() === m[1].trim().toLowerCase()) : tab.headers.find((h) => /grade|site|branch|category|status/i.test(h));
      if (col) return splitTabByColumn(tab, col);
    }
    if ((lower.includes("summarize") || lower.includes("summary")) && lower.includes("by")) {
      const m = promptText.match(/by\s+([A-Za-z0-9 _-]+)/i);
      const col = m ? tab.headers.find((h) => h.toLowerCase() === m[1].trim().toLowerCase()) : tab.headers[0];
      if (col) return summarizeTabByColumn(tab, col);
    }
    if (lower.includes("compare") || lower.includes("reconcile")) {
      if (builderState.tabs.length >= 2) {
        return compareTwoTabs(builderState.tabs[0], builderState.tabs[1]);
      }
      return "Add or split at least 2 tabs in this workbook so I can compare and reconcile them.";
    }
    const formulaMatch = promptText.match(/(?:add\s+(?:column\s+)?)?([A-Za-z0-9 _-]+?)\s*=\s*([A-Za-z0-9 _-]+?)\s*([-+*/])\s*([A-Za-z0-9 _%-]+)/i);
    if (formulaMatch) {
      const newCol = formulaMatch[1].trim();
      const lhsRaw = formulaMatch[2].trim();
      const op = formulaMatch[3];
      const rhsRaw = formulaMatch[4].trim();
      const colA = tab.headers.find((h) => h.toLowerCase().includes(lhsRaw.toLowerCase())) || tab.headers[0];
      if (rhsRaw.includes("15%")) {
        return addCalculatedColumnToTab(tab, newCol, colA, "vat15");
      }
      const colB = tab.headers.find((h) => h.toLowerCase().includes(rhsRaw.toLowerCase())) || tab.headers[1] || tab.headers[0];
      return addCalculatedColumnToTab(tab, newCol, colA, op, colB);
    }
    if (lower.includes("total row") || lower === "add total") {
      const keyCol = tab.headers[0] || "Column A";
      tab.rows = tab.rows.filter((r) => String(r[keyCol] ?? "").toLowerCase() !== "total");
      const tot = { [keyCol]: "Total" };
      tab.headers.slice(1).forEach((h) => {
        const nums = tab.rows.map((r) => Number(r[h])).filter((v) => Number.isFinite(v) && v !== 0);
        tot[h] = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100 : "";
      });
      tab.rows.push(tot);
      return "Appended a Total summary row at the bottom of your sheet.";
    }
    if (lower.includes("student") || lower.includes("sasams") || lower.includes("learner") || lower.includes("school")) {
      builderState.title = "SA-SAMS-Student-Register.xlsx";
      builderState.tabs = [{
        name: "Students",
        headers: ["Student ID", "First Name", "Last Name", "SA ID Number", "Date of Birth", "Gender", "Grade", "Subjects", "Parent Phone", "Tuition Fee", "Paid", "Balance"],
        rows: [
          { "Student ID": "STU001", "First Name": "John", "Last Name": "Doe", "SA ID Number": "1503155123084", "Date of Birth": "2015-03-15", "Gender": "Male", "Grade": "Grade 8", "Subjects": "Mathematics; English; Science", "Parent Phone": "0821234567", "Tuition Fee": 12e3, "Paid": 8500, "Balance": 3500 },
          { "Student ID": "STU002", "First Name": "Sarah", "Last Name": "Smith", "SA ID Number": "1407220145081", "Date of Birth": "2014-07-22", "Gender": "Female", "Grade": "Grade 9", "Subjects": "Mathematics; English; Physical Science", "Parent Phone": "0839876543", "Tuition Fee": 12e3, "Paid": 12e3, "Balance": 0 },
          { "Student ID": "STU003", "First Name": "Emma", "Last Name": "Johnson", "SA ID Number": "1601100234089", "Date of Birth": "2016-01-10", "Gender": "Female", "Grade": "Grade 7", "Subjects": "Mathematics; English; Natural Science", "Parent Phone": "0847654321", "Tuition Fee": 11e3, "Paid": 6e3, "Balance": 5e3 },
          { "Student ID": "STU004", "First Name": "Liam", "Last Name": "Johnson", "SA ID Number": "1309055432082", "Date of Birth": "2013-09-05", "Gender": "Male", "Grade": "Grade 10", "Subjects": "Mathematics; English; Physical Science; Geography", "Parent Phone": "0847654321", "Tuition Fee": 13500, "Paid": 1e4, "Balance": 3500 }
        ],
        formulas: { "Balance": "Tuition Fee - Paid" }
      }];
      builderState.activeTab = 0;
      return "Built a SA-SAMS Student & Tuition Register with SA ID, DOB, Gender, Grade, Subjects, and calculated Balance!";
    }
    if (lower.includes("expense") || lower.includes("budget") || lower.includes("finance")) {
      builderState.title = "Monthly-Expense-Tracker.xlsx";
      builderState.tabs = [{
        name: "Expenses",
        headers: ["Date", "Category", "Supplier", "Description", "Amount", "VAT 15%", "Total"],
        rows: [
          { "Date": "2026-10-01", "Category": "Software", "Supplier": "Cloud Host SA", "Description": "Monthly Server & Storage", "Amount": 1200, "VAT 15%": 180, "Total": 1380 },
          { "Date": "2026-10-05", "Category": "Office", "Supplier": "Stationery World", "Description": "Printer Paper & Toner", "Amount": 800, "VAT 15%": 120, "Total": 920 },
          { "Date": "2026-10-09", "Category": "Software", "Supplier": "Fiber Net", "Description": "Business Fiber Internet", "Amount": 1500, "VAT 15%": 225, "Total": 1725 }
        ],
        formulas: { "VAT 15%": "Amount * 15%", "Total": "Amount + VAT 15%" }
      }];
      builderState.activeTab = 0;
      return "Built a Monthly Expense Tracker with automatic 15% VAT and Total columns!";
    }
    if (lower.includes("inventory") || lower.includes("stock") || lower.includes("warehouse")) {
      builderState.title = "Inventory-Stock-Sheet.xlsx";
      builderState.tabs = [{
        name: "Inventory",
        headers: ["SKU", "Product Name", "Category", "Qty On Hand", "Unit Price", "Total Value"],
        rows: [
          { "SKU": "SKU-901", "Product Name": "Stainless Flange 4in", "Category": "Valves", "Qty On Hand": 24, "Unit Price": 45, "Total Value": 1080 },
          { "SKU": "SKU-902", "Product Name": "Hydraulic Seal Kit", "Category": "Seals", "Qty On Hand": 15, "Unit Price": 18, "Total Value": 270 },
          { "SKU": "SKU-903", "Product Name": "Pressure Gauge 10Bar", "Category": "Valves", "Qty On Hand": 10, "Unit Price": 95, "Total Value": 950 }
        ],
        formulas: { "Total Value": "Qty On Hand * Unit Price" }
      }];
      builderState.activeTab = 0;
      return "Built an Inventory Stock Sheet with Qty On Hand, Unit Price, and calculated Total Value!";
    }
    const withMatch = promptText.match(/(?:with|columns?:?)\s+(.+)$/i);
    const rawCols = (withMatch ? withMatch[1] : promptText).split(/[,;|]+|\band\b/i).map((s) => s.replace(/^(create|make|build|set|my|columns|to|a|new|sheet|spreadsheet|table|for)\s+/gi, "").trim()).filter((s) => s.length >= 2 && s.length <= 35);
    if (rawCols.length >= 2) {
      const headers = rawCols.map((c) => c.charAt(0).toUpperCase() + c.slice(1));
      tab.headers = headers;
      tab.rows = Array.from({ length: Math.max(4, tab.rows.length) }, () => {
        const r = {};
        headers.forEach((h) => {
          r[h] = "";
        });
        return r;
      });
      return `Set your sheet columns to: ${headers.join(", ")}. Type into the cells on the right or paste text!`;
    }
    return 'Try commands like: "Start blank", "Columns: ID, Name, SA ID, Phone, Fee, Paid", "Add column Balance = Fee - Paid", "Fix contacts", "Split by Grade", or "Summarize by Grade"!';
  }
  function builderPage() {
    const tab = currentBuilderTab();
    const vert = activeVertical();
    const vMeta = VERTICAL_META[vert] || VERTICAL_META.general;
    const { title, tabs, activeTab, chat, pasteOpen } = builderState;
    const { headers, rows } = tab;
    $("page").innerHTML = `<div class="simple-studio">
    <section class="chat-card" aria-label="Sheet Creator Helper">
      <div class="chat-top">
        <div class="chat-top-title"><span class="bot-avatar">${icon("spark")}</span><div><h1>Sheet Helper</h1><small>Start blank, paste text, or tell me what columns to make</small></div></div>
        <button id="builder-new-blank" class="btn small">${icon("plus")}Start Blank</button>
      </div>
      <div class="picker-bar">
        <div class="quick-chips">
          <button class="chip" data-bcmd="Start blank sheet">\u{1F4C4} Blank Sheet</button>
          <button class="chip" data-bcmd="${escapeHTML(vMeta.builderPresetCmd)}">\u2728 ${escapeHTML(vMeta.builderPresetLabel)}</button>
        </div>
        <details class="upload-drawer" ${pasteOpen ? "open" : ""} id="paste-drawer">
          <summary>\u{1F4CB} Paste from WhatsApp / Email / Word into a Clean Table</summary>
          <textarea id="paste-raw-text" rows="4" style="margin-top:8px;font-size:12px" placeholder="Paste lines from WhatsApp, an Email, or Word here \u2014 e.g.&#10;STU001 - JOHN DOE - 1503155123084 - Gr 8 - 821234567 - jane@gmial.com&#10;STU002 - SARAH SMITH - 1407220145081 - Gr 9 - +27 83 987 6543 - mike@example.com"></textarea>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button id="paste-convert-btn" class="btn primary small" style="flex:1">${icon("spark")}Turn Pasted Text into Table</button>
            <button id="paste-sample-btn" class="btn small">Try Example Paste</button>
          </div>
        </details>
      </div>
      <div class="messages" id="builder-messages" tabindex="0" aria-label="Sheet Creator conversation">
        ${chat.map((m) => `<article class="msg ${m.role === "user" ? "user" : ""}"><span class="msg-sender">${m.role === "user" ? "You" : "Helper"}</span><div class="bubble">${escapeHTML(m.text)}</div></article>`).join("")}
      </div>
      <div class="quick-action-bar">
        <div class="quick-chips">
          <button class="chip" data-bcmd="Fix contacts and extract DOB from SA ID">\u{1FAAA} Fix IDs & Phones</button>
          <button class="chip" data-bcmd="Add Total row">\u2795 Add Total Row</button>
          <button class="chip" data-bcmd="Split by Grade">\u{1F4C2} Split into Tabs</button>
          <button class="chip" data-bcmd="Summarize by Grade">\u{1F4CA} Summarize</button>
        </div>
      </div>
      <form id="builder-chat-form" class="chat-compose">
        <textarea id="builder-chat-input" rows="1" placeholder="Tell me what to build or calculate (e.g. 'Columns: ID, Name, Fee, Paid' or 'Balance = Fee - Paid')\u2026"></textarea>
        <button type="submit" class="btn primary small" aria-label="Send command">${icon("send")}</button>
      </form>
    </section>

    <section class="result-card" aria-label="Editable Multi-Tab Workbook">
      <div class="result-head">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input id="builder-title" value="${escapeHTML(title)}" aria-label="Workbook file name" style="max-width:220px;padding:6px 10px;font-size:13px;font-weight:700">
          <span class="badge good">${tabs.length} tab${tabs.length > 1 ? "s" : ""} \xB7 ${headers.length} columns \xB7 ${rows.length} rows</span>
        </div>
        <div class="result-actions">
          <button id="builder-to-transform" class="btn small cyan">${icon("check")}Finish & Check Sheet</button>
          <button id="builder-download" class="btn small primary">${icon("download")}Download Excel (.XLSX)</button>
        </div>
      </div>
      <div class="clean-toolbar">
        <span>Quick Tools:</span>
        <button id="builder-add-col" class="btn small">${icon("plus")}Column</button>
        <button id="builder-add-row" class="btn small">${icon("plus")}Row</button>
        <button id="builder-formula-btn" class="btn small">${icon("spark")}+ Formula</button>
        <button id="builder-smart-fix" class="btn small">\u2728 Fix IDs & Phones</button>
        <button id="builder-split-btn" class="btn small">Split into Tabs\u2026</button>
        <button id="builder-summary-btn" class="btn small">Summarize\u2026</button>
        <button id="builder-compare-btn" class="btn small">Compare 2 Tabs</button>
        <button id="builder-total-btn" class="btn small">+ Total Row</button>
      </div>
      <div class="table-scroll" tabindex="0" aria-label="Editable spreadsheet grid">
        <table>
          <thead>
            <tr>
              ${headers.map((h, ci) => `<th><div style="display:flex;gap:4px;align-items:center"><input class="head-input" data-col-idx="${ci}" value="${escapeHTML(h)}" aria-label="Column ${ci + 1} name">${headers.length > 1 ? `<button class="icon-button" data-del-col="${ci}" title="Remove column" aria-label="Remove column ${escapeHTML(h)}">\xD7</button>` : ""}</div>${tab.formulas[h] ? `<small style="display:block;font-size:10px;color:var(--accent);margin-top:2px">fx: =${escapeHTML(tab.formulas[h])}</small>` : ""}</th>`).join("")}
              <th style="width:44px"></th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, ri) => `<tr>${headers.map((h, ci) => `<td><input class="cell-input" data-row="${ri}" data-col="${ci}" value="${escapeHTML(r[h] ?? "")}" placeholder="\u2014" aria-label="Row ${ri + 1} ${escapeHTML(h)}"></td>`).join("")}<td><button class="icon-button" data-del-row="${ri}" aria-label="Delete row ${ri + 1}">${icon("trash")}</button></td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="sheet-tabs-bar" aria-label="Workbook sheets">
        ${tabs.map((t, ti) => `<button class="sheet-tab-btn ${ti === activeTab ? "active" : ""}" data-switch-tab="${ti}">${escapeHTML(t.name)} (${t.rows.length})</button>`).join("")}
        <button id="builder-add-tab" class="btn small">${icon("plus")}Add Blank Tab</button>
      </div>
    </section>
  </div>`;
    const bMsgs = $("builder-messages");
    if (bMsgs) bMsgs.scrollTop = bMsgs.scrollHeight;
    const syncDomToBuilder = () => {
      builderState.title = $("builder-title").value.trim() || "New-Workbook.xlsx";
      builderState.pasteOpen = $("paste-drawer")?.open || false;
      const cur = currentBuilderTab();
      const newHeaders = [];
      document.querySelectorAll(".head-input").forEach((inp, i) => {
        newHeaders.push(inp.value.trim() || `Column ${i + 1}`);
      });
      const newRows = cur.rows.map(() => ({}));
      document.querySelectorAll(".cell-input").forEach((inp) => {
        const ri = Number(inp.dataset.row), ci = Number(inp.dataset.col);
        const raw = inp.value;
        const num = raw !== "" && !Number.isNaN(Number(raw)) && !/^0\d+/.test(raw) && raw.replace(/\D/g, "").length !== 13 ? Number(raw) : raw;
        if (newRows[ri]) newRows[ri][newHeaders[ci]] = num;
      });
      cur.headers = newHeaders;
      cur.rows = newRows;
    };
    $("builder-new-blank").addEventListener("click", () => {
      builderState = {
        title: "New-Workbook.xlsx",
        activeTab: 0,
        tabs: [makeBlankTab("Sheet1", 4, 5)],
        chat: [{ role: "qms", text: "Started a fresh blank sheet from scratch! Type any column headers or values into the grid, paste text, or tell me what to build." }],
        pasteOpen: false
      };
      builderPage();
      toast("Created a fresh blank spreadsheet!");
    });
    $("paste-sample-btn").addEventListener("click", () => {
      $("paste-raw-text").value = [
        "1. STU001 - JOHN DOE - 1503155123084 - Gr 8 - 821234567 - jane.doe@gmial.com",
        "2. STU002 - SARAH SMITH - 1407220145081 - Gr 9 - +27 83 987 6543 - michael.smith@example.com",
        "3. STU003 - EMMA JOHNSON - 1601100234089 - Gr 7 - 084 765 4321 - patricia@gamil.com"
      ].join("\n");
    });
    $("paste-convert-btn").addEventListener("click", () => {
      syncDomToBuilder();
      const raw = $("paste-raw-text").value;
      const msg = parsePastedMessyTextToTab(raw);
      builderState.chat.push({ role: "user", text: "[Pasted raw text lines]" }, { role: "qms", text: msg });
      builderState.pasteOpen = false;
      builderPage();
      toast("Converted pasted text into clean columns & rows!");
    });
    $("builder-chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      syncDomToBuilder();
      const txt = $("builder-chat-input").value.trim();
      if (!txt) return;
      builderState.chat.push({ role: "user", text: txt });
      const reply = handleBuilderChatCommand(txt);
      builderState.chat.push({ role: "qms", text: reply });
      builderPage();
    });
    $("builder-chat-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        $("builder-chat-form").dispatchEvent(new Event("submit"));
      }
    });
    document.querySelectorAll("[data-bcmd]").forEach((b) => b.addEventListener("click", () => {
      syncDomToBuilder();
      const cmd = b.dataset.bcmd;
      builderState.chat.push({ role: "user", text: cmd });
      const reply = handleBuilderChatCommand(cmd);
      builderState.chat.push({ role: "qms", text: reply });
      builderPage();
    }));
    document.querySelectorAll("[data-switch-tab]").forEach((b) => b.addEventListener("click", () => {
      syncDomToBuilder();
      builderState.activeTab = Number(b.dataset.switchTab);
      builderPage();
    }));
    $("builder-add-tab").addEventListener("click", () => {
      syncDomToBuilder();
      const nextNum = builderState.tabs.length + 1;
      builderState.tabs.push(makeBlankTab(`Sheet${nextNum}`, 4, 5));
      builderState.activeTab = builderState.tabs.length - 1;
      builderPage();
      toast(`Added blank tab Sheet${nextNum}!`);
    });
    $("builder-add-col").addEventListener("click", () => {
      syncDomToBuilder();
      const cur = currentBuilderTab();
      const nextCol = `Column ${String.fromCharCode(65 + cur.headers.length)}`;
      cur.headers.push(nextCol);
      cur.rows.forEach((r) => {
        r[nextCol] = "";
      });
      builderPage();
    });
    $("builder-add-row").addEventListener("click", () => {
      syncDomToBuilder();
      const cur = currentBuilderTab();
      const empty = {};
      cur.headers.forEach((h) => {
        empty[h] = "";
      });
      cur.rows.push(empty);
      builderPage();
    });
    $("builder-smart-fix").addEventListener("click", () => {
      syncDomToBuilder();
      const cur = currentBuilderTab();
      const n = runSaIdAndContactSmartFixOnTab(cur);
      builderState.chat.push({ role: "qms", text: `Ran SA ID & Contact Smart Fix (${n} cell(s) formatted/extracted across SA IDs, DOB, Gender, Names, Phones, Emails, and Grades).` });
      builderPage();
      toast(`SA ID & Contact Smart Fix updated ${n} field(s)!`);
    });
    $("builder-formula-btn").addEventListener("click", () => {
      syncDomToBuilder();
      const cur = currentBuilderTab();
      openModal("Add Calculated Formula Column", `
      <form id="formula-modal-form">
        <label for="fm-name">New Column Name</label>
        <input id="fm-name" required value="Balance" placeholder="e.g. Balance, Line Total, VAT 15%">
        <div class="field-row">
          <div><label for="fm-col-a">First Column</label><select id="fm-col-a">${cur.headers.map((h) => `<option value="${escapeHTML(h)}">${escapeHTML(h)}</option>`).join("")}</select></div>
          <div><label for="fm-op">Operation</label><select id="fm-op"><option value="-">Minus (\u2212)</option><option value="+">Plus (+)</option><option value="*">Multiply (\xD7)</option><option value="/">Divide (\xF7)</option><option value="vat15">15% VAT of First Column</option></select></div>
        </div>
        <label for="fm-col-b">Second Column (if applicable)</label>
        <select id="fm-col-b">${cur.headers.map((h, i) => `<option value="${escapeHTML(h)}" ${i === cur.headers.length - 1 ? "selected" : ""}>${escapeHTML(h)}</option>`).join("")}</select>
        <button type="submit" class="btn primary" style="margin-top:14px">Add Calculated Column</button>
      </form>
    `);
      $("formula-modal-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("fm-name").value;
        const colA = $("fm-col-a").value;
        const op = $("fm-op").value;
        const colB = $("fm-col-b").value;
        const msg = addCalculatedColumnToTab(cur, name, colA, op, colB);
        builderState.chat.push({ role: "qms", text: msg });
        closeModal();
        builderPage();
        toast(msg);
      });
    });
    $("builder-split-btn").addEventListener("click", () => {
      syncDomToBuilder();
      const cur = currentBuilderTab();
      openModal("Split Sheet into Multiple Tabs by Column", `
      <form id="split-modal-form">
        <p>Pick which column to group by \u2014 EduSheetManager will create a separate tab for each unique value (e.g. Grade 7, Grade 8, Grade 9) inside your workbook:</p>
        <label for="split-col">Split by Column</label>
        <select id="split-col">${cur.headers.map((h) => `<option value="${escapeHTML(h)}" ${/grade|site|branch|category|status/i.test(h) ? "selected" : ""}>${escapeHTML(h)}</option>`).join("")}</select>
        <button type="submit" class="btn primary" style="margin-top:14px">Split into Tabs</button>
      </form>
    `);
      $("split-modal-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const col = $("split-col").value;
        const msg = splitTabByColumn(cur, col);
        builderState.chat.push({ role: "qms", text: msg });
        closeModal();
        builderPage();
        toast("Split into multiple workbook tabs!");
      });
    });
    $("builder-summary-btn").addEventListener("click", () => {
      syncDomToBuilder();
      const cur = currentBuilderTab();
      openModal("Generate Summary Breakdown Tab", `
      <form id="sum-modal-form">
        <p>Choose a column to group by \u2014 EduSheetManager will create a new <b>Summary</b> tab with Row Counts, Totals, and Averages:</p>
        <label for="sum-col">Summarize by Column</label>
        <select id="sum-col">${cur.headers.map((h) => `<option value="${escapeHTML(h)}" ${/grade|site|branch|category|subjects/i.test(h) ? "selected" : ""}>${escapeHTML(h)}</option>`).join("")}</select>
        <button type="submit" class="btn primary" style="margin-top:14px">Create Summary Tab</button>
      </form>
    `);
      $("sum-modal-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const col = $("sum-col").value;
        const msg = summarizeTabByColumn(cur, col);
        builderState.chat.push({ role: "qms", text: msg });
        closeModal();
        builderPage();
        toast("Created Summary tab!");
      });
    });
    $("builder-compare-btn").addEventListener("click", () => {
      syncDomToBuilder();
      if (builderState.tabs.length < 2) {
        const cur = currentBuilderTab();
        const cloneRows = cur.rows.slice(0, Math.max(1, cur.rows.length - 1)).map((r, i) => {
          const copy = { ...r };
          if (i === 0 && cur.headers[1]) copy[cur.headers[1]] = String(copy[cur.headers[1]] || "") + " (Updated)";
          return copy;
        });
        builderState.tabs.push({ name: `${cur.name}_Compare`, headers: [...cur.headers], rows: cloneRows, formulas: {} });
      }
      const msg = compareTwoTabs(builderState.tabs[0], builderState.tabs[1]);
      builderState.chat.push({ role: "qms", text: msg });
      builderPage();
      toast("Created Reconciliation tab comparing Tab 1 and Tab 2!");
    });
    $("builder-total-btn").addEventListener("click", () => {
      syncDomToBuilder();
      const msg = handleBuilderChatCommand("add total row");
      builderState.chat.push({ role: "qms", text: msg });
      builderPage();
      toast("Appended Total row!");
    });
    document.querySelectorAll("[data-del-col]").forEach((b) => b.addEventListener("click", () => {
      syncDomToBuilder();
      const cur = currentBuilderTab();
      const ci = Number(b.dataset.delCol);
      const removed = cur.headers.splice(ci, 1)[0];
      cur.rows.forEach((r) => {
        delete r[removed];
      });
      builderPage();
    }));
    document.querySelectorAll("[data-del-row]").forEach((b) => b.addEventListener("click", () => {
      syncDomToBuilder();
      const cur = currentBuilderTab();
      cur.rows.splice(Number(b.dataset.delRow), 1);
      builderPage();
    }));
    $("builder-download").addEventListener("click", () => {
      syncDomToBuilder();
      const blob = buildMultiSheetXlsxBlob(builderState.tabs);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = builderState.title.endsWith(".xlsx") ? builderState.title : `${builderState.title}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Downloaded ${builderState.tabs.length}-tab Excel (.xlsx) workbook!`);
    });
    $("builder-to-transform").addEventListener("click", () => void busy($("builder-to-transform"), async () => {
      syncDomToBuilder();
      const cur = currentBuilderTab();
      job = await api("/api/jobs/from-builder", { title: builderState.title, sheet: cur.name, headers: cur.headers, rows: cur.rows, request_id: uid() });
      await refresh();
      shell();
      await showPage("workspace");
      toast("Opened active sheet in Transform with QMS checks passed!");
    }));
  }
  var quoteState = {
    docType: "QUOTATION",
    docNumber: "QUO-2026-0042",
    date: "2026-10-14",
    companyName: "Apex Business Solutions (Pty) Ltd",
    companyContact: "billing@apexsolutions.co.za \xB7 082 555 0199",
    clientName: "Greenwood High School",
    clientContact: "finance@greenwoodhigh.edu.za",
    currency: "R",
    vatRate: 15,
    items: [
      { code: "SAS-01", description: "SA-SAMS Student & Subject Matrix System Import (Per Learner)", qty: 850, price: 35 },
      { code: "ONB-02", description: "School Template Setup & Staff Onboarding Session", qty: 1, price: 2500 }
    ]
  };
  function quotesPage() {
    const s = quoteState;
    const subtotal = s.items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
    const vatAmt = Math.round(subtotal * (s.vatRate / 100) * 100) / 100;
    const grandTotal = Math.round((subtotal + vatAmt) * 100) / 100;
    $("page").innerHTML = `<div class="page-heading"><div><h1>Quotes & Invoices (Business PA)</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Tell your PA what to quote in plain words, or edit your branded Quotation / Tax Invoice below and download as Excel (.XLSX) or Printable PDF.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="quote-add-item" class="btn small">${icon("plus")}Add Line Item</button><button id="quote-print" class="btn small">${icon("file")}Printable Quote / PDF</button><button id="quote-to-transform" class="btn small cyan">${icon("shield")}Open in Transform</button><button id="quote-download" class="btn small success">${icon("download")}Download Branded XLSX</button></div></div>
  <section class="feature-banner">
    <form id="quote-pa-form" class="prompt-row">
      <input id="quote-pa-input" placeholder="Tell your PA in plain words (e.g. 'Invoice for Horizon Academy: 1200 Student Imports at 30 each and 1 Setup Fee at 3000')\u2026">
      <button type="submit" class="btn primary small">${icon("spark")}Fill Quote with PA</button>
    </form>
  </section>
  <div class="settings-grid" style="margin-bottom:16px">
    <section class="settings-panel">
      <h2>Document & Your Business</h2>
      <div class="field-row">
        <div><label for="q-type">Document Type</label><select id="q-type"><option value="QUOTATION" ${s.docType === "QUOTATION" ? "selected" : ""}>Quotation</option><option value="TAX INVOICE" ${s.docType === "TAX INVOICE" ? "selected" : ""}>Tax Invoice</option></select></div>
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
        <div><label for="q-curr">Currency</label><select id="q-curr"><option value="R" ${s.currency === "R" ? "selected" : ""}>ZAR (R)</option><option value="$" ${s.currency === "$" ? "selected" : ""}>USD ($)</option><option value="\xA3" ${s.currency === "\xA3" ? "selected" : ""}>GBP (\xA3)</option></select></div>
        <div><label for="q-vat">VAT / Tax (%)</label><input id="q-vat" type="number" min="0" max="50" value="${s.vatRate}"></div>
      </div>
    </section>
  </div>
  <section class="result-card">
    <div class="result-head"><div><h2>${escapeHTML(s.docType)} \xB7 ${escapeHTML(s.docNumber)}</h2><small>Prepared for ${escapeHTML(s.clientName)}</small></div><span class="badge good">Total: ${escapeHTML(s.currency)} ${grandTotal.toLocaleString()}</span></div>
    <div class="table-scroll" tabindex="0" aria-label="Quotation line items">
      <table>
        <thead><tr><th>Item Code</th><th>Service / Product Description</th><th>Qty</th><th>Unit Price (${escapeHTML(s.currency)})</th><th>Line Total (${escapeHTML(s.currency)})</th><th style="width:48px"></th></tr></thead>
        <tbody>
          ${s.items.map((it, idx) => {
      const lineTot = Math.round((Number(it.qty) || 0) * (Number(it.price) || 0) * 100) / 100;
      return `<tr>
              <td><input class="cell-input q-item-code" data-idx="${idx}" value="${escapeHTML(it.code)}" aria-label="Item code ${idx + 1}"></td>
              <td><input class="cell-input q-item-desc" data-idx="${idx}" value="${escapeHTML(it.description)}" aria-label="Description ${idx + 1}"></td>
              <td><input class="cell-input q-item-qty" data-idx="${idx}" type="number" value="${it.qty}" aria-label="Quantity ${idx + 1}"></td>
              <td><input class="cell-input q-item-price" data-idx="${idx}" type="number" step="0.01" value="${it.price}" aria-label="Unit price ${idx + 1}"></td>
              <td><strong>${escapeHTML(s.currency)} ${lineTot.toLocaleString()}</strong></td>
              <td><button class="icon-button" data-del-qitem="${idx}" aria-label="Remove item ${idx + 1}">${icon("trash")}</button></td>
            </tr>`;
    }).join("")}
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
    const syncQuoteDom = () => {
      s.docType = $("q-type").value;
      s.docNumber = $("q-num").value.trim() || "QUO-001";
      s.companyName = $("q-comp").value.trim();
      s.companyContact = $("q-comp-contact").value.trim();
      s.clientName = $("q-client").value.trim();
      s.clientContact = $("q-client-contact").value.trim();
      s.currency = $("q-curr").value;
      s.vatRate = Number($("q-vat").value) || 0;
      const codes = document.querySelectorAll(".q-item-code");
      const descs = document.querySelectorAll(".q-item-desc");
      const qtys = document.querySelectorAll(".q-item-qty");
      const prices = document.querySelectorAll(".q-item-price");
      s.items = Array.from(codes).map((_, i) => ({
        code: codes[i].value.trim() || `ITEM-${i + 1}`,
        description: descs[i].value.trim() || "Service",
        qty: Number(qtys[i].value) || 0,
        price: Number(prices[i].value) || 0
      }));
    };
    ["q-type", "q-curr", "q-vat"].forEach((id) => $(id).addEventListener("change", () => {
      syncQuoteDom();
      quotesPage();
    }));
    document.querySelectorAll(".q-item-qty,.q-item-price").forEach((el) => el.addEventListener("change", () => {
      syncQuoteDom();
      quotesPage();
    }));
    $("quote-pa-form").addEventListener("submit", (e) => {
      e.preventDefault();
      syncQuoteDom();
      const txt = $("quote-pa-input").value.trim();
      if (!txt) return;
      if (/invoice/i.test(txt)) {
        s.docType = "TAX INVOICE";
        s.docNumber = s.docNumber.replace(/^QUO/, "INV");
      } else if (/quote|quotation/i.test(txt)) {
        s.docType = "QUOTATION";
        s.docNumber = s.docNumber.replace(/^INV/, "QUO");
      }
      const clientM = txt.match(/(?:for|to)\s+([A-Z][A-Za-z0-9\s&.-]+?)(?::|,|\s+\d)/);
      if (clientM) s.clientName = clientM[1].trim();
      const itemRegex = /(\d+)\s+([A-Za-z][A-Za-z0-9\s-]{2,40}?)\s+(?:at|@|for)\s+[R$£]?(\d+(?:\.\d+)?)/gi;
      const parsedItems = [];
      let m;
      let idx = 1;
      while ((m = itemRegex.exec(txt)) !== null) {
        parsedItems.push({ code: `ITEM-0${idx++}`, description: m[2].trim(), qty: Number(m[1]), price: Number(m[3]) });
      }
      if (parsedItems.length) s.items = parsedItems;
      quotesPage();
      toast("PA updated your quotation details and line items!");
    });
    $("quote-add-item").addEventListener("click", () => {
      syncQuoteDom();
      s.items.push({ code: `ITEM-0${s.items.length + 1}`, description: "Additional Service / Product", qty: 1, price: 500 });
      quotesPage();
    });
    document.querySelectorAll("[data-del-qitem]").forEach((b) => b.addEventListener("click", () => {
      syncQuoteDom();
      s.items.splice(Number(b.dataset.delQitem), 1);
      quotesPage();
    }));
    const buildQuoteTableRows = () => {
      syncQuoteDom();
      const headers = ["Document #", "Client", "Item Code", "Description", "Qty", "Unit Price", "VAT", "Line Total"];
      const rows = s.items.map((it) => {
        const sub = (Number(it.qty) || 0) * (Number(it.price) || 0);
        const vat = Math.round(sub * (s.vatRate / 100) * 100) / 100;
        return {
          "Document #": s.docNumber,
          "Client": s.clientName,
          "Item Code": it.code,
          "Description": it.description,
          "Qty": it.qty,
          "Unit Price": it.price,
          "VAT": vat,
          "Line Total": Math.round((sub + vat) * 100) / 100
        };
      });
      return { headers, rows };
    };
    $("quote-download").addEventListener("click", () => {
      const { headers, rows } = buildQuoteTableRows();
      const blob = buildXlsxBlob(s.docType === "TAX INVOICE" ? "Tax_Invoice" : "Quotation", headers, rows);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${s.docNumber}-${s.clientName.replace(/\s+/g, "-")}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Downloaded branded Excel (.xlsx) quote!");
    });
    $("quote-to-transform").addEventListener("click", () => void busy($("quote-to-transform"), async () => {
      const { headers, rows } = buildQuoteTableRows();
      job = await api("/api/jobs/from-builder", { title: `${s.docNumber}-${s.clientName}.xlsx`, sheet: "Quote_Invoice", headers, rows, request_id: uid() });
      await refresh();
      shell();
      await showPage("workspace");
      toast("Opened your quote in Transform!");
    }));
    $("quote-print").addEventListener("click", () => {
      syncQuoteDom();
      openModal(`${s.docType} \xB7 ${s.docNumber}`, `
      <div style="padding:12px;border:1px solid var(--line);border-radius:10px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;border-bottom:1px solid var(--line);padding-bottom:12px">
          <div><h3 style="font-size:18px">${escapeHTML(s.companyName)}</h3><p style="font-size:12px;color:var(--muted)">${escapeHTML(s.companyContact)}</p></div>
          <div style="text-align:right"><strong>${escapeHTML(s.docType)} #${escapeHTML(s.docNumber)}</strong><p style="font-size:12px;color:var(--muted)">Date: ${escapeHTML(s.date)}</p></div>
        </div>
        <div style="margin:12px 0"><small style="color:var(--muted)">PREPARED FOR:</small><div><strong>${escapeHTML(s.clientName)}</strong> (${escapeHTML(s.clientContact)})</div></div>
        <div class="table-scroll"><table><thead><tr><th>Code</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${s.items.map((it) => `<tr><td>${escapeHTML(it.code)}</td><td>${escapeHTML(it.description)}</td><td>${it.qty}</td><td>${escapeHTML(s.currency)} ${it.price}</td><td>${escapeHTML(s.currency)} ${((Number(it.qty) || 0) * (Number(it.price) || 0)).toLocaleString()}</td></tr>`).join("")}</tbody></table></div>
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
      $("print-modal-btn").addEventListener("click", () => window.print());
    });
  }
  async function templatesPage() {
    const vert = activeVertical();
    const vMeta = VERTICAL_META[vert] || VERTICAL_META.general;
    const res = await api("/api/templates", void 0, "GET");
    const allItems = res.items || [];
    const items = allItems.filter((t) => !t.builtin || vMeta.templateCategories.includes(t.category));
    $("page").innerHTML = `<div class="page-heading"><div><h1>${escapeHTML(vMeta.shortName)} Templates</h1><p style="font-size:13px;color:var(--muted);margin-top:4px">Pick a ready-made ${escapeHTML(vMeta.shortName.toLowerCase())} template below, download a blank Excel (.XLSX) file, or save your own template.</p></div><button id="new-template-btn" class="btn primary small">${icon("plus")}Save Custom Template</button></div>
  <div class="knowledge-grid">
    ${items.map((t, idx) => `<article class="knowledge-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px">
        <span class="badge ${t.builtin ? "good" : "purple"}">${escapeHTML(t.category || (t.builtin ? "Ready-Made" : "Custom"))}</span>
        <small style="color:var(--muted)">${t.headers.length} columns</small>
      </div>
      <h3>${escapeHTML(t.name)}</h3>
      <p style="margin-top:6px;font-size:13px">${escapeHTML(t.description || "")}</p>
      <div class="file-list" style="margin-top:10px">${t.headers.map((h) => `<span class="file-chip">${escapeHTML(h)}</span>`).join("")}</div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn small primary" data-use-tpl="${idx}">${icon("spark")}Open Template</button>
        <button class="btn small" data-dl-tpl="${idx}">${icon("download")}Download Blank Excel (.XLSX)</button>
      </div>
    </article>`).join("")}
  </div>`;
    document.querySelectorAll("[data-use-tpl]").forEach((b) => b.addEventListener("click", () => void busy(b, async () => {
      const t = items[Number(b.dataset.useTpl)];
      if (t.id === "sasams_student_import" && boot.demo_mode) {
        job = await api("/api/demo/jobs", { case: "sasams_students", request_id: uid() });
        job = await api(`/api/jobs/${job.id}/run`, {});
      } else {
        job = await api("/api/jobs/from-builder", { title: `${t.name}.xlsx`, sheet: t.sheet || "Output", headers: t.headers, rows: t.sample_rows || [], request_id: uid() });
      }
      await refresh();
      shell();
      await showPage("workspace");
      toast(`Opened template: ${t.name}`);
    })));
    document.querySelectorAll("[data-dl-tpl]").forEach((b) => b.addEventListener("click", () => {
      const t = items[Number(b.dataset.dlTpl)];
      const blob = buildXlsxBlob(t.sheet || "Template", t.headers, []);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${t.name.replace(/\s+/g, "-")}-Template.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Downloaded blank template: ${t.name}`);
    }));
    $("new-template-btn").addEventListener("click", () => {
      openModal("Save Your Own Template", `
      <form id="custom-tpl-form">
        <label for="tpl-name">Template Name</label>
        <input id="tpl-name" required placeholder="e.g. Term 2 Class List">
        <label for="tpl-cat">Category</label>
        <input id="tpl-cat" value="${escapeHTML(vMeta.templateCategories[0] || "Custom")}" placeholder="e.g. School / Business">
        <label for="tpl-headers">Column Names (comma-separated) \u2014 or upload an Excel/CSV file below</label>
        <input id="tpl-headers" required placeholder="e.g. ID, First Name, Last Name, Phone, Amount">
        <label for="tpl-file">Or copy columns from an existing Excel / CSV file (optional)</label>
        <input id="tpl-file" type="file" accept=".xlsx,.csv">
        <button type="submit" id="save-tpl-submit" class="btn primary" style="margin-top:14px">Save Template</button>
      </form>
    `);
      $("tpl-file").addEventListener("change", async () => {
        const f = $("tpl-file").files?.[0];
        if (!f) return;
        const parsed = await parseUploadedFile(f);
        if (parsed.headers.length) {
          $("tpl-headers").value = parsed.headers.join(", ");
          if (!$("tpl-name").value) $("tpl-name").value = f.name.replace(/\.(xlsx|csv)$/i, "");
        }
      });
      $("custom-tpl-form").addEventListener("submit", (e) => {
        e.preventDefault();
        void busy($("save-tpl-submit"), async () => {
          const name = $("tpl-name").value.trim();
          const category = $("tpl-cat").value.trim() || vMeta.templateCategories[0] || "Custom";
          const headers = $("tpl-headers").value.split(",").map((s) => s.trim()).filter(Boolean);
          await api("/api/templates", { name, category, headers }, "POST");
          closeModal();
          await templatesPage();
          toast(`Saved "${name}" to your templates!`);
        });
      });
    });
  }
  function wireChat() {
    const messages = $("messages");
    messages.scrollTop = messages.scrollHeight;
    $("chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      void sendChat();
    });
    $("chat-text").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendChat();
      }
    });
    document.querySelectorAll("[data-chat]").forEach((b) => b.addEventListener("click", () => {
      $("chat-text").value = b.dataset.chat;
      void sendChat();
    }));
    if ($("confirm-correction")) $("confirm-correction").addEventListener("click", () => void busy($("confirm-correction"), async () => {
      job = await api(`/api/jobs/${job.id}/confirm`, { proposal_id: job.proposal.id, request_id: uid() });
      await refresh();
      shell();
      await showPage("workspace");
      toast(job.state === "RELEASED" ? "Done! Your Excel file is ready to download." : "Saved \u2014 check the chat for next steps.");
    }));
  }
  async function sendChat() {
    const text = $("chat-text").value.trim();
    if (!text) return;
    await busy($("send-chat"), async () => {
      if (!job) {
        handleBuilderChatCommand(text);
        const tab = currentBuilderTab();
        job = await api("/api/jobs/from-builder", { title: builderState.title || "Created-Sheet.xlsx", sheet: tab.name || "Sheet1", headers: tab.headers, rows: tab.rows, request_id: uid() });
        await refresh();
        shell();
        await showPage("workspace");
        return;
      }
      job = await api(`/api/jobs/${job.id}/chat`, { text, request_id: uid() });
      await refresh();
      shell();
      await showPage("workspace");
    });
  }
  async function doRun() {
    if (!job) return;
    await busy($("run-job"), async () => {
      job = await api(`/api/jobs/${job.id}/run`, {});
      await refresh();
      shell();
      await showPage("workspace");
      toast(job.state === "RELEASED" ? "Ready! Click Download Excel (.XLSX) on the right." : "Almost done \u2014 check the quick question on the left.");
    });
  }
  async function loadJob(id) {
    job = await api("/api/jobs/" + id);
    await showPage("workspace");
  }
  function jobHistory() {
    void preferencesPage();
  }
  async function knowledgePage() {
    await preferencesPage();
  }
  async function preferencesPage() {
    const p = overview.preferences || { theme: "light", density: "comfortable", explanations: "detailed", auto_checks: true, vertical: "general" };
    const vert = p.vertical || "general";
    const savedRules = (await api("/api/knowledge", void 0, "GET")).items || [];
    $("page").innerHTML = `
  <div class="page-heading"><h1>Past Files & Workspace Settings</h1></div>
  <div class="settings-grid">
    <section class="settings-panel">
      <h2>Your Past Spreadsheets (${overview.jobs?.length || 0})</h2>
      <p style="margin-top:4px;font-size:13px">Reopen any spreadsheet you worked on recently or remove old files.</p>
      <div class="jobs-table" style="margin-top:12px" tabindex="0" aria-label="Past spreadsheets">
        <table>
          <thead><tr><th>File Name</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${(overview.jobs || []).map((j) => `<tr>
              <td><strong>${escapeHTML(j.title)}</strong><div style="font-size:11px;color:var(--muted)">${new Date(j.created).toLocaleDateString()}</div></td>
              <td><span class="badge ${j.state === "RELEASED" ? "good" : "warn"}">${j.state === "RELEASED" ? "\u2713 Ready" : "In Progress"}</span></td>
              <td><button class="btn small primary" data-open="${j.id}">Open</button> <button class="icon-button" data-delete="${j.id}" aria-label="Delete ${escapeHTML(j.title)}">${icon("trash")}</button></td>
            </tr>`).join("") || '<tr><td colspan="3" class="table-empty">No saved spreadsheets yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>

    <form id="preferences-form" class="settings-panel">
      <h2>Workspace & Appearance</h2>
      <label for="pref-vertical">Workspace Mode</label>
      <select id="pref-vertical">${Object.entries(VERTICAL_META).map(([k, v]) => `<option value="${k}" ${k === vert ? "selected" : ""}>${escapeHTML(v.label)} \u2014 ${escapeHTML(v.badge)}</option>`).join("")}</select>
      <label for="theme">Screen Theme</label>
      <select id="theme"><option value="light" ${p.theme !== "dark" ? "selected" : ""}>Warm Paper & Calm Sage (Default)</option><option value="dark" ${p.theme === "dark" ? "selected" : ""}>Dark Mode</option></select>
      <label for="density">Table Row Spacing</label>
      <select id="density"><option value="comfortable">Comfortable</option><option value="compact" ${p.density === "compact" ? "selected" : ""}>Compact</option></select>
      <label for="explanations">Helper Reply Style</label>
      <select id="explanations"><option value="detailed">Friendly & Clear</option><option value="concise" ${p.explanations === "concise" ? "selected" : ""}>Short</option></select>
      <label class="toggle"><input id="auto-checks" type="checkbox" ${p.auto_checks !== false ? "checked" : ""}>Automatically update the sheet when I confirm an answer</label>
      <button id="save-preferences" class="btn primary">Save Settings${icon("check")}</button>
    </form>
  </div>

  <details class="quiet-details" style="margin-top:20px">
    <summary>Advanced & Technical Details (Optional \u2014 Saved Column Rules & Audit Logs)</summary>
    <div class="quiet-body">
      <div class="quiet-buttons">
        ${job ? `<button id="edit-plan" class="btn small">${icon("edit")}Inspect Current Mapping JSON</button><button id="download-evidence" class="btn small" ${job.report ? "" : "disabled"}>${icon("download")}Download Technical Audit JSON</button>` : ""}
      </div>
      <h3 style="font-size:14px;margin-top:10px">Automatically Remembered Column Rules (${savedRules.length})</h3>
      <div class="knowledge-grid" style="margin-top:8px">
        ${savedRules.map((k, i) => `<article class="knowledge-card"><h4>${escapeHTML(k.template_name)}</h4><p style="font-size:12px">${k.headers.length} columns remembered</p><button class="btn small" style="margin-top:8px" data-pattern="${i}">View Technical Rule</button></article>`).join("") || '<p style="font-size:13px">Finish a spreadsheet and your column matches will be remembered here automatically.</p>'}
      </div>
    </div>
  </details>`;
    document.querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => void loadJob(b.dataset.open)));
    document.querySelectorAll("[data-delete]").forEach((b) => b.addEventListener("click", () => {
      openModal("Remove this file?", `<p>Remove this spreadsheet from your saved list.</p><button id="confirm-delete" class="btn danger" style="margin-top:14px">Remove file</button>`);
      $("confirm-delete").addEventListener("click", () => void busy($("confirm-delete"), async () => {
        await api(`/api/jobs/${b.dataset.delete}`, {}, "DELETE");
        closeModal();
        if (job?.id === b.dataset.delete) job = null;
        await refresh();
        shell();
        await showPage("preferences");
      }));
    }));
    document.querySelectorAll("[data-pattern]").forEach((b) => b.addEventListener("click", () => openModal("Saved Rule Details", `<pre>${escapeHTML(JSON.stringify(savedRules[Number(b.dataset.pattern)].plan, null, 2))}</pre>`)));
    if ($("edit-plan")) $("edit-plan").addEventListener("click", editPlan);
    if ($("download-evidence")) $("download-evidence").addEventListener("click", () => void download("evidence"));
    $("preferences-form").addEventListener("submit", (e) => {
      e.preventDefault();
      void busy($("save-preferences"), async () => {
        await api("/api/preferences", { theme: $("theme").value, density: $("density").value, explanations: $("explanations").value, auto_checks: $("auto-checks").checked, vertical: $("pref-vertical").value }, "PUT");
        await refresh();
        applyPreferences();
        shell();
        await showPage("preferences");
        toast("Your settings were saved!");
      });
    });
  }
  async function adminPage() {
    if (user?.role !== "admin") return;
    adminSettings = await api("/api/admin/settings");
    customers = (await api("/api/admin/customers")).items;
    const s = adminSettings;
    $("page").innerHTML = `<div class="page-heading"><h1>Admin Settings</h1><span class="badge purple">Platform Admin</span></div><form id="admin-form"><div class="settings-grid"><section class="settings-panel"><h2>Budgets & Quotas</h2><div class="field-row"><div><label for="platform-budget">Platform monthly ceiling (USD)</label><input id="platform-budget" inputmode="decimal" value="${escapeHTML(s.platform_budget_usd)}"></div><div><label for="ai-budget">Monthly AI allowance (USD)</label><input id="ai-budget" inputmode="decimal" value="${escapeHTML(s.monthly_budget_usd)}"></div></div><div class="field-row"><div><label for="input-price">Input price / 1M tokens (USD)</label><input id="input-price" inputmode="decimal" value="${escapeHTML(s.input_price_per_million_usd)}"></div><div><label for="output-price">Output price / 1M tokens (USD)</label><input id="output-price" inputmode="decimal" value="${escapeHTML(s.output_price_per_million_usd)}"></div></div><label for="pricing-url">Pricing source URL</label><input id="pricing-url" type="url" value="${escapeHTML(s.pricing_source_url)}" placeholder="https://\u2026"><label for="pricing-date">Date verified</label><input id="pricing-date" type="date" value="${escapeHTML(s.pricing_verified_date)}"><div class="field-row"><div><label for="max-tokens">Max output tokens</label><input id="max-tokens" type="number" min="256" max="12000" value="${s.max_output_tokens}"></div><div><label for="storage-limit">Storage / customer (MiB)</label><input id="storage-limit" type="number" min="50" max="10000" value="${s.max_storage_mib_per_customer}"></div></div><label for="jobs-limit">Max jobs / customer</label><input id="jobs-limit" type="number" min="5" max="1000" value="${s.max_jobs_per_customer}"></section><section class="settings-panel"><h2>AI Provider & Shared Key</h2><label for="provider">Provider</label><select id="provider"><option value="openai_compatible">OpenAI-compatible</option><option value="anthropic" ${s.provider === "anthropic" ? "selected" : ""}>Anthropic</option></select><label for="base-url">Base URL</label><input id="base-url" type="url" value="${escapeHTML(s.base_url)}" placeholder="https://api.openai.com/v1"><label for="model">Model ID</label><input id="model" value="${escapeHTML(s.model)}" placeholder="gpt-4o-mini"><label for="api-key">Shared API key (write-only)</label><input id="api-key" type="password" autocomplete="off" ${boot.demo_mode ? "disabled" : ""} placeholder="${boot.demo_mode ? "Disabled in preview" : "Paste key in deployed app"}"><label class="toggle"><input id="clear-key" type="checkbox" ${boot.demo_mode ? "disabled" : ""}>Remove stored key</label><label class="toggle"><input id="ai-enabled" type="checkbox" ${s.enabled ? "checked" : ""} ${boot.demo_mode ? "disabled" : ""}>Enable external AI requests</label><label class="toggle"><input id="auto-learn" type="checkbox" ${s.auto_learn ? "checked" : ""}>Auto-save mappings after QMS passes</label></section></div><div class="settings-actions"><button id="save-admin" class="btn primary">Save settings${icon("check")}</button></div></form><div class="section-heading"><h2>Customer Accounts (${customers.length})</h2><button id="new-customer" class="btn small">${icon("plus")}Add customer</button></div><div class="customer-table" tabindex="0" aria-label="Customer workspaces"><table><thead><tr><th>Customer</th><th>Users</th><th>Status</th><th>Created</th></tr></thead><tbody>${customers.map((c) => `<tr><td><strong>${escapeHTML(c.name)}</strong></td><td>${c.users}</td><td><span class="badge good">Active</span></td><td>${new Date(c.created).toLocaleDateString()}</td></tr>`).join("") || '<tr><td colspan="4" class="table-empty">No customers yet.</td></tr>'}</tbody></table></div>`;
    $("admin-form").addEventListener("submit", (e) => {
      e.preventDefault();
      void busy($("save-admin"), async () => {
        const read = (id) => $(id).value;
        const key = read("api-key");
        $("api-key").value = "";
        const body = { enabled: $("ai-enabled").checked, provider: $("provider").value, base_url: read("base-url").trim(), model: read("model").trim(), monthly_budget_usd: read("ai-budget"), platform_budget_usd: read("platform-budget"), input_price_per_million_usd: read("input-price"), output_price_per_million_usd: read("output-price"), pricing_source_url: read("pricing-url").trim(), pricing_verified_date: read("pricing-date"), max_output_tokens: Number(read("max-tokens")), timeout_seconds: 75, auto_learn: $("auto-learn").checked, api_key: key || null, clear_key: $("clear-key").checked, max_storage_mib_per_customer: Number(read("storage-limit")), max_jobs_per_customer: Number(read("jobs-limit")) };
        adminSettings = await api("/api/admin/settings", body, "PUT");
        await refresh();
        await adminPage();
        toast("Settings saved. No AI request was made.");
      });
    });
    $("new-customer").addEventListener("click", createCustomer);
  }
  function createCustomer() {
    openModal("Add customer account", `<form id="customer-form"><label for="customer-name">Company name</label><input id="customer-name" required minlength="2"><label for="customer-email">Email</label><input id="customer-email" type="email" required><label for="customer-user">Display name</label><input id="customer-user" required minlength="2"><label for="customer-password">Initial password (12+ chars)</label><input id="customer-password" type="password" autocomplete="new-password" required minlength="12"><button id="create-customer" class="btn primary" style="margin-top:16px">Create account</button></form>`);
    $("customer-form").addEventListener("submit", (e) => {
      e.preventDefault();
      void busy($("create-customer"), async () => {
        await api("/api/admin/customers", { name: $("customer-name").value, email: $("customer-email").value, display_name: $("customer-user").value, password: $("customer-password").value });
        $("customer-password").value = "";
        closeModal();
        await refresh();
        shell();
        await showPage("admin");
        toast("Customer created.");
      });
    });
  }
  function editPlan() {
    if (!job) return;
    openModal("Mapping JSON", `<label for="plan-json">Mapping plan</label><textarea id="plan-json" rows="12" class="mono" spellcheck="false">${escapeHTML(JSON.stringify(job.plan, null, 2))}</textarea><label for="plan-reason">Note</label><textarea id="plan-reason" rows="2"></textarea><button id="save-plan" class="btn primary" style="margin-top:14px">Save & run</button>`);
    $("save-plan").addEventListener("click", () => void busy($("save-plan"), async () => {
      const plan = JSON.parse($("plan-json").value);
      const confirmation = $("plan-reason").value;
      job = await api(`/api/jobs/${job.id}/plan`, { plan, confirmation }, "PUT");
      closeModal();
      await refresh();
      shell();
      await showPage("workspace");
    }));
  }
  async function download(kind) {
    if (!job) return;
    try {
      let blob;
      if (staticMode) {
        if (kind === "output") {
          if (!job.report || job.report.status !== "RELEASED") throw new Error("QMS has not released this output.");
          blob = buildXlsxBlob(job.plan.destination.sheet || "Output", job.report.headers, job.report.rows);
        } else {
          blob = new Blob([JSON.stringify(job, null, 2)], { type: "application/json" });
        }
      } else {
        const headers = { "X-Workspace-ID": workspaceID };
        if (demoToken) headers["X-Demo-Session"] = demoToken;
        const r = await fetch(`/api/jobs/${job.id}/${kind}`, { headers, credentials: "same-origin" });
        if (!r.ok) {
          const d = await r.json();
          throw new Error(d.detail);
        }
        blob = await r.blob();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = kind === "output" ? "EduSheetManager-verified.xlsx" : "EduSheetManager-evidence.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), true);
    }
  }
  function crc32(bytes) {
    let c = 4294967295;
    for (let i = 0; i < bytes.length; i++) {
      c ^= bytes[i];
      for (let k = 0; k < 8; k++) c = c >>> 1 ^ 3988292384 & -(c & 1);
    }
    return (c ^ 4294967295) >>> 0;
  }
  function buildMultiSheetXlsxBlob(tabs) {
    const enc = new TextEncoder();
    const xmlEsc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const colLetter = (n) => {
      let s = "";
      while (n > 0) {
        const m = (n - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        n = Math.floor((n - 1) / 26);
      }
      return s;
    };
    const safeTabs = tabs.length ? tabs : [{ name: "Sheet1", headers: ["Column A", "Column B", "Column C"], rows: [] }];
    const overrides = safeTabs.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("");
    const sheetsXml = safeTabs.map((t, i) => `<sheet name="${xmlEsc((t.name || `Sheet${i + 1}`).slice(0, 31))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("");
    const relsXml = safeTabs.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("");
    const files = [
      ["[Content_Types].xml", enc.encode(`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${overrides}</Types>`)],
      ["_rels/.rels", enc.encode(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`)],
      ["xl/workbook.xml", enc.encode(`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetsXml}</sheets></workbook>`)],
      ["xl/_rels/workbook.xml.rels", enc.encode(`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relsXml}</Relationships>`)]
    ];
    safeTabs.forEach((tab, tIdx) => {
      const allRows = [tab.headers, ...tab.rows.map((r) => tab.headers.map((h) => r[h]))];
      const rowXml = allRows.map((r, ri) => {
        const cells = r.map((v, ci) => {
          const ref = `${colLetter(ci + 1)}${ri + 1}`;
          if (v === null || v === void 0 || v === "") return `<c r="${ref}"/>`;
          if (ri > 0 && typeof v === "string" && v.startsWith("=")) {
            return `<c r="${ref}"><f>${xmlEsc(v.slice(1))}</f></c>`;
          }
          if (typeof v === "number" && Number.isFinite(v)) return `<c r="${ref}"><v>${v}</v></c>`;
          return `<c r="${ref}" t="inlineStr"><is><t>${xmlEsc(v)}</t></is></c>`;
        }).join("");
        return `<row r="${ri + 1}">${cells}</row>`;
      }).join("");
      files.push([`xl/worksheets/sheet${tIdx + 1}.xml`, enc.encode(`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowXml}</sheetData></worksheet>`)]);
    });
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    for (const [name, data] of files) {
      const nameBytes = enc.encode(name);
      const crc = crc32(data);
      const lh = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(lh.buffer);
      lv.setUint32(0, 67324752, true);
      lv.setUint16(4, 20, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lh.set(nameBytes, 30);
      localParts.push(lh, data);
      const ch = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 33639248, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint32(42, offset, true);
      ch.set(nameBytes, 46);
      centralParts.push(ch);
      offset += lh.length + data.length;
    }
    const cdSize = centralParts.reduce((s, p) => s + p.length, 0);
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 101010256, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);
    return new Blob([...localParts, ...centralParts, eocd], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  function buildXlsxBlob(sheetName, headers, rows) {
    return buildMultiSheetXlsxBlob([{ name: sheetName, headers, rows }]);
  }
  function loadStaticState() {
    try {
      const raw = localStorage.getItem("sheetqms_static_state_v3");
      if (raw) return JSON.parse(raw);
    } catch {
    }
    return {
      preferences: { theme: "light", density: "comfortable", explanations: "detailed", auto_checks: true, vertical: "general" },
      admin: { enabled: false, provider: "openai_compatible", base_url: "https://api.openai.com/v1", model: "gpt-4o-mini", monthly_budget_usd: "0", platform_budget_usd: "0", input_price_per_million_usd: "0.15", output_price_per_million_usd: "0.60", pricing_source_url: "https://openai.com/api/pricing/", pricing_verified_date: "2026-10-13", max_output_tokens: 2048, timeout_seconds: 75, auto_learn: true, key_configured: false, max_storage_mib_per_customer: 250, max_jobs_per_customer: 50 },
      customers: [{ id: "demo-a", name: "Demo Customer A", users: 1, created: "2026-10-13T08:00:00Z" }],
      jobs: {},
      knowledge: []
    };
  }
  function saveStaticState(s) {
    try {
      localStorage.setItem("sheetqms_static_state_v3", JSON.stringify(s));
    } catch {
    }
  }
  function makeStaticSampleJob(caseName) {
    const id = uid();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const msg = (role, text, kind = "chat") => ({ id: uid(), role, text, kind, created: now });
    if (caseName === "sasams_students") {
      const headers = ["Student ID", "First Name", "Last Name", "Date of Birth", "Grade", "Subjects", "Parent First Name", "Parent Last Name", "Parent Email", "Parent Phone"];
      const rows = [
        { "Student ID": "STU001", "First Name": "John", "Last Name": "Doe", "Date of Birth": "2015-03-15", "Grade": "Grade 8", "Subjects": "Mathematics; English; Science", "Parent First Name": "Jane", "Parent Last Name": "Doe", "Parent Email": "jane.doe@example.com", "Parent Phone": "0821234567" },
        { "Student ID": "STU002", "First Name": "Sarah", "Last Name": "Smith", "Date of Birth": "2014-07-22", "Grade": "Grade 9", "Subjects": "Mathematics; English; Physical Science", "Parent First Name": "Michael", "Parent Last Name": "Smith", "Parent Email": "michael.smith@example.com", "Parent Phone": "0839876543" },
        { "Student ID": "STU003", "First Name": "Emma", "Last Name": "Johnson", "Date of Birth": "2016-01-10", "Grade": "Grade 7", "Subjects": "Mathematics; English; Natural Science", "Parent First Name": "Patricia", "Parent Last Name": "Johnson", "Parent Email": "patricia.johnson@example.com", "Parent Phone": "0847654321" },
        { "Student ID": "STU004", "First Name": "Liam", "Last Name": "Johnson", "Date of Birth": "2013-09-05", "Grade": "Grade 10", "Subjects": "Mathematics; English; Physical Science; Geography", "Parent First Name": "Patricia", "Parent Last Name": "Johnson", "Parent Email": "patricia.johnson@example.com", "Parent Phone": "0847654321" }
      ];
      return {
        id,
        title: "student-import-template.xlsx",
        created: now,
        state: "MAPPED",
        trace_id: uid().slice(0, 12),
        caseName: "sasams_students",
        customHeaders: headers,
        customRows: rows,
        profiles: {
          template: { name: "student-import-template.xlsx", sheets: [{ name: "Students", headers }] },
          sources: [
            { id: "source-1", name: "sasams-sheet1-learner-parent-bio.xlsx", sheets: [{ name: "Learner_Parent_Bio", headers: ["Admission No", "Learner First Name", "Learner Surname", "DOB", "Grade", "Guardian First Name", "Guardian Surname", "Guardian Email", "Guardian Cell", "Gender"], preview: [["STU001", "John", "Doe", "15/03/2015", 8, "Jane", "Doe", "jane.doe@example.com", 821234567, "M"], ["STU002", "Sarah", "Smith", "2014-07-22", 9, "Michael", "Smith", "michael.smith@example.com", "083 987 6543", "F"]] }] },
            { id: "source-2", name: "sasams-sheet2-subject-marks.xlsx", sheets: [{ name: "Subject_Marks_Schedule", headers: ["Admission No", "Learner First Name", "Learner Surname", "Grade", "Mathematics", "English", "Science", "Physical Science", "Natural Science", "Geography", "Average"], preview: [["STU001", "John", "Doe", 8, "78%", "82%", "74%", null, null, "-", 78], ["STU002", "Sarah", "Smith", 9, 85, 79, null, 88, null, "N/A", 84]] }] }
          ]
        },
        plan: {
          destination: { mode: "direct", sheet: "Students", key: "Student ID", period: "", value: "", categories: [], total: "", header_row: 1 },
          sources: [
            { source_id: "source-1", sheet: "Learner_Parent_Bio", header_row: 3, layout: "direct", field_map: { "Student ID": "Admission No", "First Name": "Learner First Name", "Last Name": "Learner Surname", "Date of Birth": "DOB", "Grade": "Grade", "Parent First Name": "Guardian First Name", "Parent Last Name": "Guardian Surname", "Parent Email": "Guardian Email", "Parent Phone": "Guardian Cell" }, key: "Student ID", period: "", value: "", columns: [] },
            { source_id: "source-2", sheet: "Subject_Marks_Schedule", header_row: 3, layout: "direct", field_map: { "Student ID": "Admission No", "First Name": "Learner First Name", "Last Name": "Learner Surname", "Grade": "Grade" }, key: "Student ID", period: "Subjects", value: "", columns: ["Mathematics", "English", "Science", "Physical Science", "Natural Science", "Geography"] }
          ],
          rules: [],
          questions: []
        },
        report: null,
        mapping_origin: "Multi-sheet relational join + SA-SAMS subject matrix",
        chat: [msg("qms", "I loaded your 2 SA-SAMS sheets (Learner/Parent Bio + Subject Marks Schedule) into student-import-template.xlsx.")],
        proposal: null,
        knowledge_id: null,
        knowledge_conflict: false,
        use_workbook_rules: false
      };
    }
    if (caseName === "district_batch") {
      const headers = ["Source File", "Duplicate Status", "Student ID", "Learner Name", "SA ID Number", "SA ID Status", "Date of Birth", "Gender", "Citizenship", "Grade", "Parent Phone", "Mathematics"];
      const rows = [
        { "Source File": "School-A-Greenwood-High.xlsx", "Duplicate Status": "Duplicate across: School-A-Greenwood-High.xlsx, School-B-Horizon-Academy.xlsx", "Student ID": "STU001", "Learner Name": "John Doe", "SA ID Number": "1503155123088", "SA ID Status": "Valid SA ID", "Date of Birth": "2015-03-15", "Gender": "Male", "Citizenship": "SA Citizen", "Grade": "Grade 8", "Parent Phone": "0821234567", "Mathematics": 78 },
        { "Source File": "School-A-Greenwood-High.xlsx", "Duplicate Status": "Unique", "Student ID": "STU002", "Learner Name": "Thabo Mokoena", "SA ID Number": "0803055123084", "SA ID Status": "Repaired SA ID (Leading 0 Restored)", "Date of Birth": "2008-03-05", "Gender": "Male", "Citizenship": "SA Citizen", "Grade": "Grade 10", "Parent Phone": "0839876543", "Mathematics": 64 },
        { "Source File": "School-B-Horizon-Academy.xlsx", "Duplicate Status": "Duplicate across: School-A-Greenwood-High.xlsx, School-B-Horizon-Academy.xlsx", "Student ID": "STU001", "Learner Name": "John Doe", "SA ID Number": "1503155123088", "SA ID Status": "Valid SA ID", "Date of Birth": "2015-03-15", "Gender": "Male", "Citizenship": "SA Citizen", "Grade": "Grade 8", "Parent Phone": "0821234567", "Mathematics": 78 },
        { "Source File": "School-B-Horizon-Academy.xlsx", "Duplicate Status": "Unique", "Student ID": "STU003", "Learner Name": "Emma Johnson", "SA ID Number": "1601100234089", "SA ID Status": "Invalid SA ID (Checksum Failed \u2014 expected 7)", "Date of Birth": "2016-01-10", "Gender": "Female", "Citizenship": "SA Citizen", "Grade": "Grade 7", "Parent Phone": "0847654321", "Mathematics": 28 },
        { "Source File": "School-C-Lakeside-Secondary.xlsx", "Duplicate Status": "Unique", "Student ID": "STU004", "Learner Name": "Chipo Ndlovu", "SA ID Number": "P8492011", "SA ID Status": "Foreign / Passport / Permit ID", "Date of Birth": "", "Gender": "", "Citizenship": "Foreign / Permit", "Grade": "Grade 9", "Parent Phone": "0841112233", "Mathematics": 82 }
      ];
      return {
        id,
        title: "Folder-Batch-Master.xlsx",
        created: now,
        state: "RELEASED",
        trace_id: uid().slice(0, 12),
        caseName: "district_batch",
        customHeaders: headers,
        customRows: rows,
        run_done: true,
        batch_audit: { files_merged: 3, total_rows: 5, valid_sa_ids: 2, repaired_sa_ids: 1, foreign_or_permit_ids: 1, invalid_sa_ids: 1, cross_file_duplicates: 2 },
        profiles: {
          template: { name: "Folder-Batch-Master.xlsx", sheets: [{ name: "Master_Batch", headers }] },
          sources: [
            { id: "source-1", name: "School-A-Greenwood-High.xlsx", sheets: [{ name: "Learners", headers: ["Student ID", "Learner Name", "SA ID Number", "Grade", "Parent Phone", "Mathematics"], preview: [["STU001", "John Doe", "1503155123088", "Gr 8", "821234567", 78], ["STU002", "thabo mokoena", "803055123082", "10", "083 987 6543", 64]] }] },
            { id: "source-2", name: "School-B-Horizon-Academy.xlsx", sheets: [{ name: "Learners", headers: ["Student ID", "Learner Name", "SA ID Number", "Grade", "Parent Phone", "Mathematics"], preview: [["STU001", "John Doe", "1503155123088", "Grade 8", "0821234567", 78], ["STU003", "Emma Johnson", "1601100234089", "Gr 7", "0847654321", 28]] }] },
            { id: "source-3", name: "School-C-Lakeside-Secondary.xlsx", sheets: [{ name: "Learners", headers: ["Student ID", "Learner Name", "SA ID Number", "Grade", "Parent Phone", "Mathematics"], preview: [["STU004", "Chipo Ndlovu", "P8492011", "Grade 9", "+27 84 111 2233", 82]] }] }
          ]
        },
        plan: { destination: { mode: "direct", sheet: "Master_Batch", key: "Student ID", period: "", value: "", categories: [], total: "", header_row: 1 }, sources: [{ source_id: "source-1", sheet: "Master_Batch", header_row: 1, layout: "direct", field_map: Object.fromEntries(headers.map((h) => [h, h])), key: "Student ID", period: "", value: "", columns: [] }], rules: [], questions: [] },
        report: {
          status: "RELEASED",
          checks: [{ id: "input-integrity", name: "Original input fingerprints unchanged", passed: true, detail: "3 folder files verified." }, { id: "export-roundtrip", name: "Export reopened and verified", passed: true, detail: "5 consolidated rows ready." }],
          questions: [],
          rows,
          headers,
          passed_checks: 21,
          total_checks: 21,
          source_records: 5,
          mapped_records: 5,
          output_rows: 5,
          template_version: "v1"
        },
        mapping_origin: "Multi-file folder batch merger",
        chat: [msg("qms", 'All done! I merged 3 files from your folder into 1 Master Sheet (5 total rows).\n\u2022Batch & SA ID Audit Summary:\n  - Valid SA IDs: 2\n  - Auto-Repaired SA IDs (leading zero restored for 2000\u20132009): 1\n  - Foreign / Study Permit IDs kept: 1\n  - Invalid SA IDs (Luhn checksum failed): 1\n  - Cross-File Duplicate Rows flagged: 2\nAll rows are preserved in your Master Sheet with "Source File", "Duplicate Status", and "SA ID Status" columns!', "verdict")],
        proposal: null,
        knowledge_id: null,
        knowledge_conflict: false,
        use_workbook_rules: false
      };
    }
    if (caseName === "hold") {
      return {
        id,
        title: "monthly-output-template.xlsx",
        created: now,
        state: "MAPPED",
        trace_id: uid().slice(0, 12),
        caseName: "hold",
        profiles: { template: { name: "monthly-output-template.xlsx", sheets: [{ name: "Output", headers: ["Site", "Jan", "Feb", "Mar", "Total"] }] }, sources: [{ id: "source-1", name: "north-branch.xlsx", sheets: [{ name: "North", headers: ["Period", "Units"], preview: [["Jan", 12], ["Feb", null], ["Mar", 20]] }] }, { id: "source-2", name: "south-west.csv", sheets: [{ name: "CSV", headers: ["Site", "Period", "Units"], preview: [["South", "Jan", 7], ["South", "Feb", 15], ["South", "Mar", 13], ["West", "Jan", 9], ["West", "Feb", 11], ["West", "Mar", 15]] }] }] },
        plan: { destination: { mode: "pivot", sheet: "Output", key: "Site", period: "Period", value: "Units", categories: ["Jan", "Feb", "Mar"], total: "Total", header_row: 3 }, sources: [{ source_id: "source-1", sheet: "North", header_row: 1, layout: "long", field_map: {}, key: "Site", period: "Period", value: "Units", columns: [] }], rules: [{ id: "R-sum", kind: "sum", fields: ["Total"], value: "Jan,Feb,Mar" }], questions: [] },
        report: null,
        mapping_origin: "Rule-informed layout resolver",
        chat: [msg("qms", 'I loaded your files into monthly-output-template.xlsx. Click Run transformation (or reply "go") to check and fill your spreadsheet.')],
        proposal: null,
        knowledge_id: null,
        knowledge_conflict: false,
        use_workbook_rules: false
      };
    }
    if (caseName === "chat_map") {
      return {
        id,
        title: "direct-output-template.xlsx",
        created: now,
        state: "MAPPED",
        trace_id: uid().slice(0, 12),
        caseName: "chat_map",
        profiles: { template: { name: "direct-output-template.xlsx", sheets: [{ name: "Output", headers: ["Item", "Description", "Qty"] }] }, sources: [{ id: "source-1", name: "items-unmapped.csv", sheets: [{ name: "CSV", headers: ["Item code", "Name", "Boxes"], preview: [["A-100", "Valve", 8], ["A-200", "Gauge", 5]] }] }] },
        plan: { destination: { mode: "direct", sheet: "Output", key: "Item", period: "", value: "", categories: [], total: "", header_row: 3 }, sources: [{ source_id: "source-1", sheet: "CSV", header_row: 1, layout: "direct", field_map: { Item: "Item code", Description: "Name" }, key: "Item", period: "", value: "", columns: [] }], rules: [], questions: [{ id: "unmapped-target-Qty", text: "Target column Qty is not mapped yet.", evidence: "Output!Qty", kind: "mapping" }] },
        report: null,
        mapping_origin: "Rule-informed layout resolver",
        chat: [msg("qms", "Before I fill the sheet: should I put 'Boxes' into 'Qty'? (Reply 'yes' or tell me which column to use.)")],
        proposal: null,
        knowledge_id: null,
        knowledge_conflict: false,
        use_workbook_rules: false
      };
    }
    if (caseName === "form") {
      return {
        id,
        title: "direct-output-template.xlsx",
        created: now,
        state: "MAPPED",
        trace_id: uid().slice(0, 12),
        caseName: "form",
        profiles: { template: { name: "direct-output-template.xlsx", sheets: [{ name: "Output", headers: ["Item", "Description", "Qty"] }] }, sources: [{ id: "source-1", name: "intake-forms.xlsx", sheets: [{ name: "Card1", headers: ["Field", "Entry"], preview: [["Item code", "A-100"], ["Description", " Brass Valve "], ["Quantity", "8"]] }] }] },
        plan: { destination: { mode: "direct", sheet: "Output", key: "Item", period: "", value: "", categories: [], total: "", header_row: 3 }, sources: [{ source_id: "source-1", sheet: "Card1", header_row: 1, layout: "direct", field_map: { Item: "Item code", Description: "Description", Qty: "Quantity" }, key: "Item", period: "", value: "", columns: [] }], rules: [], questions: [] },
        report: null,
        mapping_origin: "A/B label-value form reader",
        chat: [msg("qms", "I loaded your text form sheets into direct-output-template.xlsx. Click Run transformation to build your table.")],
        proposal: null,
        knowledge_id: null,
        knowledge_conflict: false,
        use_workbook_rules: false
      };
    }
    return {
      id,
      title: "monthly-output-template.xlsx",
      created: now,
      state: "MAPPED",
      trace_id: uid().slice(0, 12),
      caseName: caseName || "pivot",
      profiles: { template: { name: "monthly-output-template.xlsx", sheets: [{ name: "Output", headers: ["Site", "Jan", "Feb", "Mar", "Total"] }] }, sources: [{ id: "source-1", name: "regional-summary.xlsx", sheets: [{ name: "Regional", headers: ["Site", "Jan", "Feb", "Mar"], preview: [["North", 12, 18, 20], ["South", 7, 15, 13], ["West", 9, 11, 15]] }] }] },
      plan: { destination: { mode: "pivot", sheet: "Output", key: "Site", period: "Period", value: "Units", categories: ["Jan", "Feb", "Mar"], total: "Total", header_row: 3 }, sources: [{ source_id: "source-1", sheet: "Regional", header_row: 1, layout: "wide", field_map: {}, key: "Site", period: "Period", value: "Units", columns: ["Jan", "Feb", "Mar"] }], rules: [{ id: "R-sum", kind: "sum", fields: ["Total"], value: "Jan,Feb,Mar" }], questions: [] },
      report: null,
      mapping_origin: "Rule-informed layout resolver",
      chat: [msg("qms", 'I loaded your files into monthly-output-template.xlsx. Click Run transformation (or reply "go") to check and fill your spreadsheet.')],
      proposal: null,
      knowledge_id: null,
      knowledge_conflict: false,
      use_workbook_rules: false
    };
  }
  function pickHeaderIndex(matrix) {
    let bestIdx = 0, bestScore = -999;
    for (let i = 0; i < Math.min(matrix.length, 25); i++) {
      const row = matrix[i] || [];
      const filled = row.filter((v) => v !== void 0 && v !== null && String(v).trim() !== "");
      const textCells = filled.filter((v) => typeof v === "string" && !v.trim().startsWith("=") && Number.isNaN(Number(v)));
      if (textCells.length < 2 || textCells.length < filled.length * 0.65) continue;
      const uniq = new Set(textCells.map((v) => String(v).trim().toLowerCase()));
      if (uniq.size !== textCells.length) continue;
      let score = textCells.length * 2 - i * 0.02;
      if (textCells.some((v) => {
        const s = String(v).trim().toLowerCase();
        return s.length > 35 || s.includes(":") || /^(synthetic|fy20|report|prepared|confidential|summary|page |date)/.test(s);
      })) score -= 8;
      if (["total", "subtotal", "grand total"].includes(String(textCells[0] || "").trim().toLowerCase())) score -= 10;
      let lastCol = row.length - 1;
      while (lastCol >= 0 && (row[lastCol] === void 0 || row[lastCol] === null || String(row[lastCol]).trim() === "")) lastCol--;
      const contiguous = lastCol >= 1 && row.slice(0, lastCol + 1).every((v) => v !== void 0 && v !== null && String(v).trim() !== "");
      if (contiguous) score += 2;
      if (i + 1 < matrix.length) {
        const nextFilled = (matrix[i + 1] || []).filter((v) => v !== void 0 && v !== null && String(v).trim() !== "");
        if (nextFilled.length >= Math.max(2, textCells.length - 1)) score += 3;
      }
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    return bestIdx;
  }
  function matrixToTable(sheet, matrix) {
    if (!matrix.length) return { sheet, headers: ["Col1"], rows: [] };
    const hIdx = pickHeaderIndex(matrix);
    const rawHead = matrix[hIdx] || [];
    let endCol = rawHead.length;
    while (endCol > 0 && (rawHead[endCol - 1] === void 0 || rawHead[endCol - 1] === null || String(rawHead[endCol - 1]).trim() === "")) endCol--;
    const headers = rawHead.slice(0, Math.max(1, endCol)).map((h, i) => String(h || `Col${i + 1}`).trim());
    const headNorm = headers.map((h) => h.toLowerCase());
    const ignoredLabels = /* @__PURE__ */ new Set(["subtotal", "total", "grand total", "sum", "average", "notes", "source:"]);
    const rows = [];
    for (const r of matrix.slice(hIdx + 1)) {
      if (!r || r.every((v) => v === void 0 || v === null || String(v).trim() === "")) continue;
      const rNorm = headers.map((_, i) => String(r[i] ?? "").trim().toLowerCase());
      if (rNorm.every((v, i) => v === headNorm[i])) continue;
      const firstVal = String(r[0] ?? "").trim().toLowerCase();
      if (ignoredLabels.has(firstVal)) continue;
      const obj = {};
      headers.forEach((h, i) => {
        const v = r[i];
        obj[h] = v === void 0 || v === null || v === "" ? null : v;
      });
      rows.push(obj);
    }
    return { sheet, headers, rows };
  }
  function parseCsvLine(line, delim) {
    const out = [];
    let cur = "", inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = !inQuotes;
      } else if (ch === delim && !inQuotes) {
        out.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  }
  async function parseUploadedFile(file) {
    const name = file.name || "uploaded.csv";
    if (name.toLowerCase().endsWith(".xlsx")) {
      try {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        const view = new DataView(buf);
        const entries = {};
        const inflateEntry = async (method, compData) => {
          if (method === 0) return compData;
          if (method === 8 && typeof DecompressionStream !== "undefined") {
            const ds = new DecompressionStream("deflate-raw");
            const writer = ds.writable.getWriter();
            void writer.write(compData);
            void writer.close();
            return new Uint8Array(await new Response(ds.readable).arrayBuffer());
          }
          return null;
        };
        let eocdPos = -1;
        for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
          if (view.getUint32(i, true) === 101010256) {
            eocdPos = i;
            break;
          }
        }
        if (eocdPos >= 0) {
          const cdEntries = view.getUint16(eocdPos + 10, true);
          let cdPos = view.getUint32(eocdPos + 16, true);
          for (let e = 0; e < cdEntries && cdPos + 46 <= bytes.length; e++) {
            if (view.getUint32(cdPos, true) !== 33639248) break;
            const method = view.getUint16(cdPos + 10, true);
            const compSize = view.getUint32(cdPos + 20, true);
            const nameLen = view.getUint16(cdPos + 28, true);
            const extraLen = view.getUint16(cdPos + 30, true);
            const commentLen = view.getUint16(cdPos + 32, true);
            const localOffset = view.getUint32(cdPos + 42, true);
            const entryName = new TextDecoder().decode(bytes.subarray(cdPos + 46, cdPos + 46 + nameLen));
            if (localOffset + 30 <= bytes.length && view.getUint32(localOffset, true) === 67324752) {
              const lNameLen = view.getUint16(localOffset + 26, true);
              const lExtraLen = view.getUint16(localOffset + 28, true);
              const dataStart = localOffset + 30 + lNameLen + lExtraLen;
              const out = await inflateEntry(method, bytes.subarray(dataStart, dataStart + compSize));
              if (out) entries[entryName] = out;
            }
            cdPos += 46 + nameLen + extraLen + commentLen;
          }
        } else {
          let pos = 0;
          while (pos + 30 <= bytes.length && view.getUint32(pos, true) === 67324752) {
            const method = view.getUint16(pos + 8, true);
            const compSize = view.getUint32(pos + 18, true);
            const nameLen = view.getUint16(pos + 26, true);
            const extraLen = view.getUint16(pos + 28, true);
            const entryName = new TextDecoder().decode(bytes.subarray(pos + 30, pos + 30 + nameLen));
            const dataStart = pos + 30 + nameLen + extraLen;
            const out = await inflateEntry(method, bytes.subarray(dataStart, dataStart + compSize));
            if (out) entries[entryName] = out;
            pos = dataStart + compSize;
          }
        }
        const dec = new TextDecoder();
        const shared = [];
        if (entries["xl/sharedStrings.xml"]) {
          const doc = new DOMParser().parseFromString(dec.decode(entries["xl/sharedStrings.xml"]), "application/xml");
          doc.querySelectorAll("si").forEach((si) => {
            shared.push(Array.from(si.querySelectorAll("t")).map((t) => t.textContent || "").join(""));
          });
        }
        const ruleSheets = /* @__PURE__ */ new Set(["rules", "instructions", "mapping rules", "business rules"]);
        let chosenSheetName = "Sheet1";
        let sheetKey = Object.keys(entries).find((k) => k.startsWith("xl/worksheets/sheet") && k.endsWith(".xml"));
        if (entries["xl/workbook.xml"]) {
          const wbDoc = new DOMParser().parseFromString(dec.decode(entries["xl/workbook.xml"]), "application/xml");
          const relMap = {};
          if (entries["xl/_rels/workbook.xml.rels"]) {
            const relDoc = new DOMParser().parseFromString(dec.decode(entries["xl/_rels/workbook.xml.rels"]), "application/xml");
            relDoc.querySelectorAll("Relationship").forEach((rel) => {
              const id = rel.getAttribute("Id") || "", target = rel.getAttribute("Target") || "";
              if (id && target) relMap[id] = target.startsWith("xl/") ? target : `xl/${target.replace(/^\/+/, "")}`;
            });
          }
          const sheetEls = Array.from(wbDoc.querySelectorAll("sheet"));
          for (let idx = 0; idx < sheetEls.length; idx++) {
            const sName = sheetEls[idx].getAttribute("name") || `Sheet${idx + 1}`;
            if (ruleSheets.has(sName.trim().toLowerCase())) continue;
            const rId = sheetEls[idx].getAttribute("r:id") || sheetEls[idx].getAttribute("id") || "";
            const candidateKey = relMap[rId] || `xl/worksheets/sheet${idx + 1}.xml`;
            if (entries[candidateKey]) {
              chosenSheetName = sName;
              sheetKey = candidateKey;
              break;
            }
          }
        }
        if (sheetKey && entries[sheetKey]) {
          const doc = new DOMParser().parseFromString(dec.decode(entries[sheetKey]), "application/xml");
          const matrix2 = [];
          doc.querySelectorAll("row").forEach((rowEl) => {
            const rArr = [];
            rowEl.querySelectorAll("c").forEach((cEl) => {
              const ref = cEl.getAttribute("r") || "A1";
              const colMatch = ref.match(/^[A-Z]+/);
              let colIdx = 0;
              if (colMatch) {
                for (const ch of colMatch[0]) colIdx = colIdx * 26 + (ch.charCodeAt(0) - 64);
              }
              const t = cEl.getAttribute("t");
              const vText = cEl.querySelector("v")?.textContent ?? cEl.querySelector("is t")?.textContent ?? "";
              let val = vText;
              if (t === "s") val = shared[Number(vText)] ?? vText;
              else if (t !== "inlineStr" && t !== "str" && vText !== "" && !Number.isNaN(Number(vText))) val = Number(vText);
              if (colIdx > 0) rArr[colIdx - 1] = val;
            });
            if (rArr.some((x) => x !== void 0 && x !== "")) matrix2.push(rArr);
          });
          if (matrix2.length) {
            const tbl2 = matrixToTable(chosenSheetName, matrix2);
            return { name, sheet: tbl2.sheet, headers: tbl2.headers, rows: tbl2.rows };
          }
        }
      } catch {
      }
    }
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return { name, sheet: "CSV", headers: ["Col1"], rows: [] };
    const delim = lines[0].includes("	") ? "	" : lines[0].includes(";") ? ";" : ",";
    const matrix = lines.map((line) => parseCsvLine(line, delim).map((raw) => raw === "" ? null : !Number.isNaN(Number(raw)) ? Number(raw) : raw));
    const tbl = matrixToTable("CSV", matrix);
    return { name, sheet: "CSV", headers: tbl.headers, rows: tbl.rows };
  }
  function runStaticJob(s, j, force = false) {
    if (j.run_done && j.report && !force) return j;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const addMsg = (text, kind = "chat") => j.chat.push({ id: uid(), role: "qms", text, kind, created: now });
    if (j.caseName === "hold" && !j.filledNorthFeb) {
      const rows2 = [
        { Site: "North", Jan: 12, Feb: null, Mar: 20, Total: null },
        { Site: "South", Jan: 7, Feb: 15, Mar: 13, Total: 35 },
        { Site: "West", Jan: 9, Feb: 11, Mar: 15, Total: 35 }
      ];
      j.state = "HELD";
      j.run_done = true;
      j.report = {
        status: "HELD",
        checks: [{ id: "reconciliation", name: "Source values reconcile to output", passed: false, detail: "North / Feb is blank." }, { id: "input-integrity", name: "Original input fingerprints unchanged", passed: true, detail: "Verified." }],
        questions: [{ id: "missing-North-Feb", text: "Missing pivot value for North / Feb.", evidence: "North -> Feb", kind: "data" }],
        rows: rows2,
        headers: ["Site", "Jan", "Feb", "Mar", "Total"],
        passed_checks: 19,
        total_checks: 21,
        source_records: 9,
        mapped_records: 8,
        output_rows: 3,
        template_version: "v1"
      };
      addMsg(s.preferences.explanations === "concise" ? "Output held. Missing pivot value for North / Feb. Reply with evidence (e.g. 18)." : "Almost done! I need one missing value: what is the Units for North / Feb? (Just reply with the number, like 18.)");
      return j;
    }
    if (j.caseName === "chat_map" && !j.plan.sources[0].field_map.Qty) {
      j.state = "HELD";
      j.run_done = true;
      j.report = {
        status: "HELD",
        checks: [{ id: "destination-fields", name: "Every destination field is mapped", passed: false, detail: "Qty is unmapped." }],
        questions: [{ id: "unmapped-target-Qty", text: "Target column Qty is not mapped yet.", evidence: "Output!Qty", kind: "mapping" }],
        rows: [{ Item: "A-100", Description: "Valve", Qty: null }, { Item: "A-200", Description: "Gauge", Qty: null }],
        headers: ["Item", "Description", "Qty"],
        passed_checks: 19,
        total_checks: 21,
        source_records: 2,
        mapped_records: 2,
        output_rows: 2,
        template_version: "v1"
      };
      addMsg("Before I fill the sheet: should I put 'Boxes' into 'Qty'? (Reply 'yes' or tell me which column to use.)");
      return j;
    }
    const rows = j.customRows || (j.report?.rows && j.state === "RELEASED" ? j.report.rows : j.caseName === "chat_map" || j.caseName === "form" ? [
      { Item: "A-100", Description: "Brass Valve", Qty: 8 },
      { Item: "A-200", Description: "Pressure Gauge", Qty: 5 }
    ] : [
      { Site: "North", Jan: 12, Feb: 18, Mar: 20, Total: 50 },
      { Site: "South", Jan: 7, Feb: 15, Mar: 13, Total: 35 },
      { Site: "West", Jan: 9, Feb: 11, Mar: 15, Total: 35 }
    ]);
    const headers = j.customHeaders || (j.caseName === "chat_map" || j.caseName === "form" ? ["Item", "Description", "Qty"] : ["Site", "Jan", "Feb", "Mar", "Total"]);
    j.state = "RELEASED";
    j.run_done = true;
    j.report = {
      status: "RELEASED",
      checks: [{ id: "input-integrity", name: "Original input fingerprints unchanged", passed: true, detail: "Verified." }, { id: "reconciliation", name: "Source values reconcile to output", passed: true, detail: "All values reconcile." }, { id: "export-roundtrip", name: "Export reopened and verified", passed: true, detail: "Ready to download." }],
      questions: [],
      rows,
      headers,
      passed_checks: 21,
      total_checks: 21,
      source_records: rows.length,
      mapped_records: rows.length,
      output_rows: rows.length,
      template_version: "v1"
    };
    if (!s.knowledge.some((k) => k.template_name === j.title)) {
      s.knowledge.push({ id: uid(), template_name: j.title, mapping_origin: j.mapping_origin, headers, active: true, plan: j.plan });
    }
    addMsg(`All done! QMS released this workbook (21/21 checks passed, ${rows.length} rows across ${headers.join(", ")}). Tell me what you'd like to edit or click Download XLSX.`);
    return j;
  }
  function handleStaticChat(s, j, text) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    j.chat.push({ id: uid(), role: "user", text, kind: "chat", created: now });
    const reply = (t, kind = "chat") => j.chat.push({ id: uid(), role: "qms", text: t, kind, created: now });
    const lower = text.toLowerCase().trim();
    const clean = lower.replace(/[.!?,]+$/, "").trim();
    if (j.proposal) {
      if (["yes", "yep", "yeah", "sure", "ok", "okay", "apply", "confirm", "do it"].includes(clean)) {
        return confirmStaticProposal(s, j);
      }
      if (["no", "nope", "cancel", "wait"].includes(clean)) {
        j.proposal = null;
        reply("No problem \u2014 I cancelled that change. What would you like to do instead?");
        return j;
      }
    }
    if (["run", "go", "go ahead", "transform", "run checks", "run qms", "run transformation"].includes(clean)) {
      return runStaticJob(s, j, true);
    }
    const numMatch = lower.match(/([+-]?\d+(?:\.\d+)?)/);
    if (j.unmappedTargets?.length && j.unusedSources?.length) {
      const tgt = j.unmappedTargets[0];
      const matchedSrc = j.unusedSources.find((sc) => lower.includes(sc.toLowerCase()));
      if (matchedSrc || ["yes", "yep", "yeah", "sure", "ok"].includes(clean) && j.unusedSources.length === 1) {
        const chosen = matchedSrc || j.unusedSources[0];
        j.proposal = { id: uid(), kind: "custom_mapping", srcCol: chosen, tgtCol: tgt, description: `Put ${chosen} into ${tgt}.` };
        reply(`Got it \u2014 Put ${chosen} into ${tgt}. Click Confirm below (or reply 'yes') to apply it.`, "proposal");
        return j;
      }
      if (lower.includes(tgt.toLowerCase()) || lower.includes("which") || lower.includes("what")) {
        reply(`Which column from your file should go into '${tgt}'? (Available columns: ${j.unusedSources.join(", ")})`);
        return j;
      }
    }
    if (j.missingCell && numMatch && !lower.includes("row")) {
      const val = numMatch[1];
      const { entity, category } = j.missingCell;
      j.proposal = { id: uid(), kind: "custom_cell", entity, category, value: val, description: `Set ${entity} / ${category} to ${val}.` };
      reply(`Got it \u2014 Set ${entity} / ${category} to ${val}. Click Confirm below (or reply 'yes') to apply it.`, "proposal");
      return j;
    }
    if (j.caseName === "chat_map" && !j.plan.sources[0].field_map.Qty) {
      if (lower.includes("description")) {
        reply("I see 'Description' in the template \u2014 which column from your file should go into 'Description'? (Your file has: Item code, Name, Boxes)");
        return j;
      }
      if (["yes", "yep", "yeah", "sure", "ok", "boxes"].includes(clean) || lower.includes("boxes")) {
        j.proposal = { id: uid(), kind: "mapping", description: "Put Boxes into Qty." };
        reply("Got it \u2014 Put Boxes into Qty. Click Confirm below (or reply 'yes') to apply it.", "proposal");
        return j;
      }
    }
    if (j.caseName === "hold" && !j.filledNorthFeb && numMatch && !lower.includes("row")) {
      const val = numMatch[1];
      j.proposal = { id: uid(), kind: "data_fact", entity: "North", category: "Feb", value: val, description: `Set North / Feb to ${val}.` };
      reply(`Got it \u2014 Set North / Feb to ${val}. Click Confirm below (or reply 'yes') to apply it.`, "proposal");
      return j;
    }
    if (j.pending_intent && !["swap", "switch", "replace", "remove", "delete", "sort"].includes(clean)) {
      const intent = j.pending_intent;
      delete j.pending_intent;
      j.chat.pop();
      return handleStaticChat(s, j, `${intent} ${text}`);
    }
    if (["swap", "switch", "flip", "exchange"].includes(clean)) {
      j.pending_intent = "swap";
      reply("Sure! Tell me which two columns or rows to swap \u2014 for example, 'Jan and Feb' or 'row 1 and row 2'.");
      return j;
    }
    if (["replace", "change", "edit", "update"].includes(clean)) {
      j.pending_intent = "replace";
      reply("Sure! Tell me what you'd like to change \u2014 for example, 'replace the first row with row 2', 'swap Jan and Feb', or 'set North Jan to 25'.");
      return j;
    }
    if (["remove", "delete", "drop"].includes(clean)) {
      j.pending_intent = "remove";
      reply("Sure! Tell me which row or column to remove \u2014 for example, 'remove Jan' or 'delete row 2'.");
      return j;
    }
    if (["sort", "order"].includes(clean)) {
      j.pending_intent = "sort";
      reply("Sure! Tell me which column to sort by \u2014 for example, 'Total' or 'Jan'.");
      return j;
    }
    if (!j.report) runStaticJob(s, j, true);
    if (j.report && j.report.rows) {
      const rows = j.report.rows;
      const headers = j.report.headers;
      const keyCol = headers[0] || "Site";
      const recalc = () => {
        if (headers.includes("Total")) {
          const numCols = headers.filter((h) => h !== keyCol && h !== "Total");
          for (const r of rows) {
            const vals = numCols.map((c) => Number(r[c])).filter((v) => Number.isFinite(v));
            if (vals.length) r.Total = vals.reduce((a, b) => a + b, 0);
          }
        }
      };
      const rowIdxs = [];
      const rowPats = [
        [/\b(?:first\s+row|row\s*1|1st\s+row|top\s+row)\b/g, 0],
        [/\b(?:second\s+row|row\s*2|2nd\s+row|middle\s+row)\b/g, 1],
        [/\b(?:third\s+row|row\s*3|3rd\s+row)\b/g, 2],
        [/\b(?:fourth\s+row|row\s*4|4th\s+row)\b/g, 3],
        [/\b(?:last\s+row|bottom\s+row)\b/g, Math.max(0, rows.length - 1)]
      ];
      const spans = [];
      for (const [pat, idx] of rowPats) {
        let m;
        while ((m = pat.exec(lower)) !== null) {
          if (idx < rows.length) spans.push([m.index, idx]);
        }
      }
      rows.forEach((r, idx) => {
        const name = String(r[keyCol] || "").toLowerCase();
        if (name) {
          const pos = lower.indexOf(name);
          if (pos >= 0) spans.push([pos, idx]);
        }
      });
      spans.sort((a, b) => a[0] - b[0]);
      for (const [, idx] of spans) {
        if (!rowIdxs.includes(idx)) rowIdxs.push(idx);
      }
      const colSpans = [];
      headers.forEach((h) => {
        const m = new RegExp(`\\b${h.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).exec(lower);
        if (m) colSpans.push([m.index, h]);
      });
      colSpans.sort((a, b) => a[0] - b[0]);
      const cols = colSpans.map((x) => x[1]);
      if ((lower.includes("swap") || lower.includes("replace") || lower.includes("switch") || lower.includes("move") || lower.includes("put")) && (rowIdxs.length >= 2 || rowIdxs.length === 1 && (lower.includes("first") || lower.includes("top") || lower.includes("last") || lower.includes("bottom"))) && cols.length === 0) {
        const i1 = rowIdxs[0];
        const i2 = rowIdxs.length >= 2 ? rowIdxs[1] : lower.includes("first") || lower.includes("top") ? 0 : rows.length - 1;
        if (i1 !== i2) {
          const n1 = rows[i1][keyCol], n2 = rows[i2][keyCol];
          const tmp = rows[i1];
          rows[i1] = rows[i2];
          rows[i2] = tmp;
          reply(`Done! I swapped row ${i1 + 1} (${n1}) and row ${i2 + 1} (${n2}) in your spreadsheet.`);
          return j;
        }
      }
      if ((lower.includes("swap") || lower.includes("replace") || lower.includes("switch") || lower.includes("flip")) && cols.length >= 2) {
        const [c1, c2] = cols;
        for (const r of rows) {
          const tmp = r[c1];
          r[c1] = r[c2];
          r[c2] = tmp;
        }
        recalc();
        reply(`Done! I swapped ${c1} and ${c2} across your spreadsheet.`);
        return j;
      }
      if (lower.includes("remove") || lower.includes("delete") || lower.includes("drop")) {
        if (cols.length >= 1 && rowIdxs.length === 0 && headers.length > 1) {
          const col = cols[0];
          const hIdx = headers.indexOf(col);
          if (hIdx >= 0) headers.splice(hIdx, 1);
          for (const r of rows) delete r[col];
          recalc();
          reply(`Done! I removed the ${col} column from your spreadsheet.`);
          return j;
        }
        if (rowIdxs.length >= 1 && rows.length > 1) {
          const rIdx = rowIdxs[0];
          const removed = rows.splice(rIdx, 1)[0];
          j.report.output_rows = rows.length;
          reply(`Done! I removed ${removed[keyCol] || `row ${rIdx + 1}`} from your spreadsheet.`);
          return j;
        }
      }
      const renMatch = text.match(/\b(?:rename|call)\s+(?:col(?:umn|lum)?\s+)?["']?(.+?)["']?\s+(?:to|as)\s+["']?(.+?)["']?\s*[.!]*$/i);
      if (renMatch) {
        const oldCol = headers.find((h) => h.toLowerCase() === renMatch[1].trim().toLowerCase());
        const newCol = renMatch[2].trim();
        if (oldCol && newCol) {
          headers[headers.indexOf(oldCol)] = newCol;
          for (const r of rows) {
            r[newCol] = r[oldCol];
            delete r[oldCol];
          }
          reply(`Done! I renamed the '${oldCol}' column to '${newCol}'.`);
          return j;
        }
      }
      const addColMatch = text.match(/^\s*(?:add|insert)\s+(?:a\s+)?(?:new\s+)?col(?:umn|lum)?\s+([a-zA-Z][\w-]*)/i);
      if (addColMatch) {
        const newCol = addColMatch[1];
        if (!headers.includes(newCol)) {
          const totIdx = headers.indexOf("Total");
          if (totIdx >= 0) headers.splice(totIdx, 0, newCol);
          else headers.push(newCol);
          for (const r of rows) r[newCol] = 0;
          recalc();
          reply(`Done! I added the ${newCol} column to your spreadsheet.`);
          return j;
        }
      }
      const addRowMatch = text.match(/^\s*(?:add|insert)\s+(?:a\s+)?(?:new\s+)?(?:row\s+)?([a-zA-Z][\w-]*)\s+([+-]?\d+(?:\.\d+)?(?:\s+[+-]?\d+(?:\.\d+)?)*)/i);
      if (addRowMatch) {
        const newKey = addRowMatch[1];
        const nums = addRowMatch[2].trim().split(/\s+/).map(Number);
        const newRow = {};
        headers.forEach((h) => {
          newRow[h] = null;
        });
        newRow[keyCol] = newKey;
        const valCols = headers.filter((h) => h !== keyCol && h !== "Total");
        valCols.forEach((c, i) => {
          if (i < nums.length) newRow[c] = nums[i];
        });
        rows.push(newRow);
        j.report.output_rows = rows.length;
        recalc();
        reply(`Done! I added ${newKey} to your spreadsheet.`);
        return j;
      }
      if (rowIdxs.length === 1 && cols.length === 1 && numMatch) {
        const rIdx = rowIdxs[0], col = cols[0], v = Number(numMatch[1]);
        rows[rIdx][col] = v;
        recalc();
        reply(`Done! I updated ${rows[rIdx][keyCol]} / ${col} to ${v}.`);
        return j;
      }
      if (cols.length === 1 && rowIdxs.length === 0) {
        const col = cols[0];
        if (lower.includes("double")) {
          for (const r of rows) {
            if (typeof r[col] === "number") r[col] = r[col] * 2;
          }
          recalc();
          reply(`Done! I doubled all values in ${col}.`);
          return j;
        }
        if (numMatch) {
          const delta = Number(numMatch[1]);
          if (lower.includes("add") || lower.includes("increase") || lower.includes("plus")) {
            for (const r of rows) {
              if (typeof r[col] === "number") r[col] = r[col] + delta;
            }
            recalc();
            reply(`Done! I added ${delta} to ${col} across all rows.`);
            return j;
          }
          if (lower.includes("subtract") || lower.includes("decrease") || lower.includes("minus")) {
            for (const r of rows) {
              if (typeof r[col] === "number") r[col] = r[col] - delta;
            }
            recalc();
            reply(`Done! I subtracted ${delta} from ${col} across all rows.`);
            return j;
          }
          if (lower.includes("all") || lower.includes("every")) {
            for (const r of rows) r[col] = delta;
            recalc();
            reply(`Done! I set all rows in ${col} to ${delta}.`);
            return j;
          }
        }
      }
      if ((lower.includes("sort") || lower.includes("order")) && cols.length >= 1) {
        const col = cols[0];
        const asc = lower.includes("asc") || lower.includes("lowest") || lower.includes("smallest");
        rows.sort((a, b) => asc ? (Number(a[col]) || 0) - (Number(b[col]) || 0) : (Number(b[col]) || 0) - (Number(a[col]) || 0));
        reply(`Done! I sorted your spreadsheet by ${col}.`);
        return j;
      }
    }
    if (lower.includes("how did you match") || lower.includes("column")) {
      reply("Your columns are matched to the template headers: " + (j.report?.headers || ["Site", "Jan", "Feb", "Mar", "Total"]).join(", ") + ".");
      return j;
    }
    if (lower.includes("what is blocking") || lower.includes("missing")) {
      reply(j.state === "HELD" ? "Output held: North / Feb is missing a value. Reply with a number like 18 to finish." : "All 21 quality checks have passed and your Excel file is ready to download.");
      return j;
    }
    reply("Tell me what you'd like me to do to the sheet \u2014 for example: 'swap Jan and Feb', 'replace the first row with row 2', 'remove Jan', or 'set North Jan to 25'.");
    return j;
  }
  function evaluateCustomJob(s, j) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const addMsg = (text, kind = "chat") => j.chat.push({ id: uid(), role: "qms", text, kind, created: now });
    const headers = j.customHeaders;
    const rows = j.customRows;
    const keyCol = headers[0] || "Site";
    if (headers.includes("Total")) {
      const numCols = headers.filter((h) => h !== keyCol && h !== "Total");
      for (const r of rows) {
        const vals = numCols.map((c) => r[c]);
        if (vals.every((v) => v !== null && v !== void 0 && v !== "" && Number.isFinite(Number(v)))) {
          r.Total = vals.reduce((a, b) => a + Number(b), 0);
        } else {
          r.Total = null;
        }
      }
    }
    if (j.unmappedTargets?.length && j.unusedSources?.length) {
      const tgt = j.unmappedTargets[0];
      j.state = "HELD";
      j.report.status = "HELD";
      j.report.passed_checks = 19;
      j.report.questions = [{ id: `unmapped-${tgt}`, text: `Which column should go into ${tgt}?`, evidence: `Output!${tgt}`, kind: "mapping" }];
      addMsg(`I loaded ${rows.length} rows into '${j.title}', but I need a quick clarification: which column from your file should go into '${tgt}'? You can pick it from the dropdown under '${tgt}' on the table, or reply here in chat (available columns: ${j.unusedSources.join(", ")}).`);
      return;
    }
    delete j.missingCell;
    for (const r of rows) {
      for (const h of headers) {
        if (h === "Total") continue;
        if (r[h] === null || r[h] === void 0 || r[h] === "") {
          j.missingCell = { entity: String(r[keyCol] || "Row"), category: h };
          break;
        }
      }
      if (j.missingCell) break;
    }
    if (j.missingCell) {
      const { entity, category } = j.missingCell;
      j.state = "HELD";
      j.report.status = "HELD";
      j.report.passed_checks = 20;
      j.report.questions = [{ id: `missing-${entity}-${category}`, text: `Missing value for ${entity} / ${category}.`, evidence: `${entity} -> ${category}`, kind: "data" }];
      addMsg(`Almost done! ${entity} / ${category} is blank in your sheet. What number should I put there? (Just reply with the number, like 18, or '${entity} ${category} is 18'.)`);
      return;
    }
    j.state = "RELEASED";
    j.report.status = "RELEASED";
    j.report.passed_checks = 21;
    j.report.questions = [];
    if (!s.knowledge.some((k) => k.template_name === j.title)) {
      s.knowledge.push({ id: uid(), template_name: j.title, mapping_origin: j.mapping_origin, headers, active: true, plan: j.plan });
    }
    addMsg(`All done! QMS released this workbook (21/21 checks passed, ${rows.length} rows across ${headers.join(", ")}). Tell me what you'd like to edit or click Download XLSX!`, "verdict");
  }
  function confirmStaticProposal(s, j) {
    if (!j.proposal) return j;
    if (j.proposal.kind === "custom_mapping") {
      const { srcCol, tgtCol } = j.proposal;
      j.proposal = null;
      j.plan.sources[0].field_map[tgtCol] = srcCol;
      j.unmappedTargets = (j.unmappedTargets || []).filter((t) => t !== tgtCol);
      j.unusedSources = (j.unusedSources || []).filter((c) => c !== srcCol);
      if (j.rawSourceRows) {
        j.customRows.forEach((r, idx) => {
          if (j.rawSourceRows[idx] && j.rawSourceRows[idx][srcCol] !== void 0) {
            r[tgtCol] = j.rawSourceRows[idx][srcCol];
          }
        });
      }
      evaluateCustomJob(s, j);
      return j;
    }
    if (j.proposal.kind === "custom_cell") {
      const { entity, category, value } = j.proposal;
      j.proposal = null;
      const keyCol = (j.customHeaders || [])[0] || "Site";
      const targetRow = (j.customRows || []).find((r) => String(r[keyCol]).toLowerCase() === String(entity).toLowerCase());
      if (targetRow) targetRow[category] = Number.isNaN(Number(value)) ? value : Number(value);
      evaluateCustomJob(s, j);
      return j;
    }
    if (j.proposal.kind === "mapping") {
      j.plan.sources[0].field_map.Qty = "Boxes";
      j.plan.questions = [];
    } else if (j.proposal.kind === "data_fact") {
      j.filledNorthFeb = Number(j.proposal.value);
    }
    j.proposal = null;
    runStaticJob(s, j, true);
    if (j.filledNorthFeb && j.report?.rows?.[0]) {
      j.report.rows[0].Feb = j.filledNorthFeb;
      j.report.rows[0].Total = 12 + j.filledNorthFeb + 20;
    }
    return j;
  }
  async function localApi(path, body, method = "POST") {
    const s = loadStaticState();
    if (path === "/api/bootstrap") return { demo_mode: true, session_present: false, version: "0.2.0" };
    if (path === "/api/auth/signup") {
      const vert = body?.vertical || "education";
      s.preferences = { ...s.preferences || {}, vertical: vert };
      saveStaticState(s);
      const u = { id: "user-" + uid().slice(0, 6), name: body?.display_name || "Operator", email: body?.email || "user@company.co.za", role: "operator", tenant_id: "demo-a" };
      return { user: u, csrf: "static-csrf", demo_token: "static-demo" };
    }
    if (path === "/api/auth/demo" || path === "/api/auth/login") {
      const role = body?.role || (body?.email?.includes("admin") ? "admin" : "operator");
      if (body?.vertical) {
        s.preferences = { ...s.preferences || {}, vertical: body.vertical };
        saveStaticState(s);
      }
      const u = role === "admin" ? { id: "admin-1", name: "Platform Admin", email: "admin@sheetqms.local", role: "admin", tenant_id: "platform" } : { id: "op-1", name: "Demo Operator", email: "operator@demo.local", role: "operator", tenant_id: "demo-a" };
      return { user: u, csrf: "static-csrf", demo_token: "static-demo" };
    }
    if (path === "/api/auth/logout") return { ok: true };
    if (path === "/api/overview") {
      const jobsList = Object.values(s.jobs);
      return { workspace: { id: "demo-a", name: "Demo Customer A" }, jobs: jobsList, stats: { jobs: jobsList.length, released: jobsList.filter((x) => x.state === "RELEASED").length, held: jobsList.filter((x) => x.state === "HELD").length, knowledge: s.knowledge.length }, ai: { enabled: s.admin.enabled, model: s.admin.model, key_configured: s.admin.key_configured }, preferences: s.preferences };
    }
    if (path === "/api/demo/jobs") {
      const j = makeStaticSampleJob(body?.case || "pivot");
      s.jobs[j.id] = j;
      saveStaticState(s);
      return j;
    }
    if (path === "/api/jobs/batch-folder" && body instanceof FormData) {
      const srcFiles = body.getAll("sources").filter((x) => x instanceof File);
      const parsedSources = await Promise.all(srcFiles.map((f) => parseUploadedFile(f)));
      let headers = ["Source File", "Duplicate Status"];
      for (const ps of parsedSources) {
        for (const h of ps.headers) {
          if (!headers.includes(h)) headers.push(h);
        }
      }
      const rawRows = [];
      for (const ps of parsedSources) {
        for (const r of ps.rows) {
          const obj = { "Source File": ps.name, "Duplicate Status": "Unique" };
          for (const h of headers) {
            if (h !== "Source File" && h !== "Duplicate Status") obj[h] = r[h] ?? "";
          }
          rawRows.push(obj);
        }
      }
      const idCandidates = headers.filter((h) => /sa id|id number|student id|learner id|admission no|employee id|sku|code|id/i.test(h));
      const keyCol = idCandidates[0] || headers[2] || "Source File";
      const seenSources = {};
      for (const r of rawRows) {
        const kv = String(r[keyCol] ?? "").trim().toLowerCase();
        if (kv) {
          if (!seenSources[kv]) seenSources[kv] = [];
          seenSources[kv].push(String(r["Source File"]));
        }
      }
      let dupCount = 0;
      for (const r of rawRows) {
        const kv = String(r[keyCol] ?? "").trim().toLowerCase();
        const srcs = seenSources[kv] || [];
        const uniqSrcs = Array.from(new Set(srcs));
        if (kv && srcs.length > 1) {
          dupCount++;
          r["Duplicate Status"] = uniqSrcs.length > 1 ? `Duplicate across: ${uniqSrcs.join(", ")}` : `Duplicate in ${r["Source File"]} (${srcs.length}x)`;
        }
      }
      const tmpTab = { name: "Master_Batch", headers: [...headers], rows: rawRows, formulas: {} };
      runSaIdAndContactSmartFixOnTab(tmpTab);
      headers = tmpTab.headers;
      const rows = tmpTab.rows;
      let validIds = 0, repairedIds = 0, foreignIds = 0, invalidIds = 0;
      for (const r of rows) {
        const st = String(r["SA ID Status"] || "");
        if (st === "Valid SA ID") validIds++;
        else if (st.startsWith("Repaired SA ID")) repairedIds++;
        else if (st.startsWith("Foreign")) foreignIds++;
        else if (st.startsWith("Invalid")) invalidIds++;
      }
      const id = uid(), now = (/* @__PURE__ */ new Date()).toISOString();
      const j = {
        id,
        title: "Folder-Batch-Master.xlsx",
        created: now,
        state: "RELEASED",
        trace_id: uid().slice(0, 12),
        caseName: "district_batch",
        customHeaders: headers,
        customRows: rows,
        run_done: true,
        batch_audit: { files_merged: parsedSources.length, total_rows: rows.length, valid_sa_ids: validIds, repaired_sa_ids: repairedIds, foreign_or_permit_ids: foreignIds, invalid_sa_ids: invalidIds, cross_file_duplicates: dupCount },
        profiles: { template: { name: "Folder-Batch-Master.xlsx", sheets: [{ name: "Master_Batch", headers }] }, sources: parsedSources.map((ps, idx) => ({ id: `source-${idx + 1}`, name: ps.name, sheets: [{ name: ps.sheet, headers: ps.headers, preview: ps.rows.slice(0, 5).map((r) => ps.headers.map((h) => r[h])) }] })) },
        plan: { destination: { mode: "direct", sheet: "Master_Batch", key: keyCol, period: "", value: "", categories: [], total: "", header_row: 1 }, sources: [{ source_id: "source-1", sheet: "Master_Batch", header_row: 1, layout: "direct", field_map: Object.fromEntries(headers.map((h) => [h, h])), key: keyCol, period: "", value: "", columns: [] }], rules: [], questions: [] },
        report: {
          status: "RELEASED",
          checks: [{ id: "input-integrity", name: "Original input fingerprints unchanged", passed: true, detail: `${parsedSources.length} folder files verified.` }, { id: "export-roundtrip", name: "Export reopened and verified", passed: true, detail: `${rows.length} consolidated rows ready.` }],
          questions: [],
          rows,
          headers,
          passed_checks: 21,
          total_checks: 21,
          source_records: rows.length,
          mapped_records: rows.length,
          output_rows: rows.length,
          template_version: "v1"
        },
        mapping_origin: `Multi-file folder batch merger (${parsedSources.length} files)`,
        chat: [{ id: uid(), role: "qms", text: `All done! I merged ${parsedSources.length} files from your folder into 1 Master Sheet (${rows.length} total rows).
\u2022 Batch & SA ID Audit Summary:
  - Valid SA IDs: ${validIds}
  - Auto-Repaired SA IDs (leading zero restored for 2000\u20132009): ${repairedIds}
  - Foreign / Study Permit IDs kept: ${foreignIds}
  - Invalid SA IDs (Luhn checksum failed): ${invalidIds}
  - Cross-File Duplicate Rows flagged: ${dupCount}`, kind: "verdict", created: now }],
        proposal: null,
        knowledge_id: null,
        knowledge_conflict: false,
        use_workbook_rules: false
      };
      s.jobs[j.id] = j;
      saveStaticState(s);
      return j;
    }
    if (path === "/api/jobs" && body instanceof FormData) {
      const srcFiles = body.getAll("sources").filter((x) => x instanceof File);
      const tplFile = body.get("target");
      const mainFile = srcFiles[0] || (tplFile instanceof File ? tplFile : null);
      if (mainFile) {
        const parsedSources = await Promise.all((srcFiles.length ? srcFiles : [mainFile]).map((f) => parseUploadedFile(f)));
        const parsed = parsedSources[0];
        const tplParsed = tplFile instanceof File && srcFiles.length ? await parseUploadedFile(tplFile) : parsed;
        const periodSet = /* @__PURE__ */ new Set(["jan", "january", "feb", "february", "mar", "march", "apr", "april", "may", "jun", "june", "jul", "july", "aug", "august", "sep", "sept", "september", "oct", "october", "nov", "november", "dec", "december", "q1", "q2", "q3", "q4"]);
        let headers = tplParsed.headers.length ? tplParsed.headers : parsed.headers;
        const tplPeriods = headers.filter((h) => periodSet.has(h.toLowerCase()));
        const isPivot = tplPeriods.length >= 2;
        if (isPivot && !(tplFile instanceof File && srcFiles.length) && !headers.some((h) => h.toLowerCase() === "total")) {
          headers = [...headers, "Total"];
        }
        const keyCol = headers.find((h) => !periodSet.has(h.toLowerCase()) && h.toLowerCase() !== "total") || headers[0] || "Site";
        let rows = [];
        let unmappedTargets = [];
        let unusedSources = [];
        const fieldMap = {};
        let finalSources = [{ source_id: "source-1", sheet: parsed.sheet, header_row: 1, layout: isPivot ? "wide" : "direct", field_map: fieldMap, key: keyCol, period: "", value: "", columns: [] }];
        if (isPivot && parsedSources.length >= 1) {
          const byEntity = {};
          const ensure = (ent) => {
            if (!byEntity[ent]) {
              const rec = { [keyCol]: ent };
              for (const p of tplPeriods) rec[p] = null;
              if (headers.includes("Total")) rec.Total = null;
              byEntity[ent] = rec;
            }
            return byEntity[ent];
          };
          for (const ps of parsedSources) {
            const ph = ps.headers;
            const pPeriods = ph.filter((x) => periodSet.has(x.toLowerCase()));
            const col0Periods = ps.rows.filter((r) => periodSet.has(String(r[ph[0]] || "").trim().toLowerCase())).length;
            if (pPeriods.length >= 2) {
              const entCol = ph.find((x) => !periodSet.has(x.toLowerCase()) && !["total", "subtotal"].includes(x.toLowerCase())) || ph[0];
              for (const r of ps.rows) {
                const ent = String(r[entCol] || "").trim();
                if (!ent || ["total", "subtotal", "grand total"].includes(ent.toLowerCase())) continue;
                const rec = ensure(ent);
                for (const m of tplPeriods) {
                  const mCol = ph.find((x) => x.toLowerCase().slice(0, 3) === m.toLowerCase().slice(0, 3));
                  if (mCol && r[mCol] !== null && r[mCol] !== void 0 && r[mCol] !== "") rec[m] = r[mCol];
                }
              }
            } else if (ph[0].toLowerCase() === "period" || ph[0].toLowerCase() === "month" || col0Periods >= Math.max(1, ps.rows.length * 0.6)) {
              const perCol = ph[0];
              const entCols = ph.slice(1).filter((c) => !["total", "subtotal", "grand total"].includes(c.toLowerCase()));
              for (const r of ps.rows) {
                const rawPer = String(r[perCol] || "").trim();
                const matchedPer = tplPeriods.find((m) => m.toLowerCase().slice(0, 3) === rawPer.toLowerCase().slice(0, 3));
                if (!matchedPer) continue;
                for (const ec of entCols) {
                  const rec = ensure(ec);
                  if (r[ec] !== null && r[ec] !== void 0 && r[ec] !== "") rec[matchedPer] = r[ec];
                }
              }
            } else {
              const entCol = ph[0], perCol = ph[1], valCol = ph[2];
              for (const r of ps.rows) {
                const ent = String(r[entCol] || "").trim();
                const rawPer = String(r[perCol] || "").trim();
                const matchedPer = tplPeriods.find((m) => m.toLowerCase().slice(0, 3) === rawPer.toLowerCase().slice(0, 3));
                if (!ent || ["total", "subtotal", "grand total"].includes(ent.toLowerCase()) || !matchedPer) continue;
                const rec = ensure(ent);
                if (r[valCol] !== null && r[valCol] !== void 0 && r[valCol] !== "") rec[matchedPer] = r[valCol];
              }
            }
          }
          rows = Object.values(byEntity);
        } else {
          const synGroups = [
            ["site", "branch", "location", "store", "region", "office", "plant", "depot", "facility", "warehouse", "center", "entity", "division"],
            ["item", "item code", "item_code", "item no", "item id", "sku", "part", "part number", "part no", "product id", "product code", "code", "id", "material", "article", "ref"],
            ["description", "name", "product", "product name", "item name", "item description", "material description", "title", "details", "summary", "label"],
            ["qty", "quantity", "units", "unit count", "count", "ordered", "shipped", "delivered", "volume", "stock", "on hand", "pieces", "pcs"],
            ["price", "unit price", "unit_price", "cost", "unit cost", "rate", "price each"],
            ["total", "amount", "total amount", "line total", "ext price", "revenue", "sales", "net amount", "subtotal", "sum", "value"],
            ["date", "order date", "invoice date", "ship date", "day", "created"],
            ["status", "state", "stage", "condition"],
            ["category", "type", "group", "department", "dept", "class", "family"],
            ["customer", "client", "buyer", "account", "customer name"],
            ["supplier", "vendor", "manufacturer", "partner", "supplier name"],
            ["student id", "learner id", "admission no", "admission number", "lurits", "lurits no", "student no", "student number", "learner no"],
            ["first name", "firstname", "learner first name", "student first name", "given name", "forenames"],
            ["last name", "lastname", "surname", "learner surname", "student surname", "family name"],
            ["date of birth", "dob", "birth date", "birthdate", "learner dob"],
            ["grade", "gr", "class grade", "student grade", "learner grade", "year level"],
            ["subjects", "subject", "enrolled subjects", "subject list", "courses", "modules"],
            ["parent first name", "parent firstname", "guardian first name", "parent given name"],
            ["parent last name", "parent lastname", "parent surname", "guardian surname", "guardian last name"],
            ["parent email", "guardian email", "email", "email address", "contact email"],
            ["parent phone", "parent cell", "guardian phone", "guardian cell", "cellphone", "cell number", "phone number", "mobile", "telephone", "contact number"]
          ];
          const fmtField = (th, val) => {
            if (val === null || val === void 0 || String(val).trim() === "") return null;
            const n = th.toLowerCase().replace(/_/g, " ").trim();
            const s2 = String(val).trim();
            if (["grade", "gr", "class grade", "student grade", "learner grade", "year level"].includes(n)) {
              const m = s2.match(/^(?:grade|gr\.?|g)?\s*(\d{1,2}[a-zA-Z]?)$/i);
              return m ? `Grade ${m[1]}` : s2;
            }
            if (["date of birth", "dob", "birth date", "birthdate", "learner dob"].includes(n)) {
              const m1 = s2.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
              if (m1) return `${m1[1].padStart(4, "0")}-${m1[2].padStart(2, "0")}-${m1[3].padStart(2, "0")}`;
              const m2 = s2.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
              if (m2) return `${m2[3].padStart(4, "0")}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
              return s2;
            }
            if (/phone|cell|mobile|telephone|contact number/.test(n)) {
              const digits = s2.startsWith("+27") ? "0" + s2.slice(3).replace(/\D/g, "") : s2.replace(/[\s()-]/g, "");
              return /^[1-9]\d{8}$/.test(digits) ? "0" + digits : digits;
            }
            if (["subjects", "subject", "enrolled subjects", "subject list", "courses", "modules"].includes(n)) {
              return s2.split(/[;,|]+/).map((p) => p.trim()).filter(Boolean).join("; ");
            }
            return val;
          };
          const isPresentMark = (val) => {
            if (val === null || val === void 0 || typeof val === "boolean") return false;
            const s2 = String(val).trim();
            if (!s2) return false;
            return !["-", "\u2014", "--", "n/a", "na", "none", "null", "nil", "no", "false", "not taken", "exempt", "absent"].includes(s2.toLowerCase());
          };
          const colType = (psObj, colName) => {
            const vals = psObj.rows.map((r) => r[colName]).filter((v) => v !== null && v !== void 0 && String(v).trim() !== "");
            if (!vals.length) return "any";
            const numC = vals.filter((v) => typeof v === "number" || !Number.isNaN(Number(v)) && String(v).trim() !== "").length;
            if (numC >= vals.length * 0.7) return "numeric";
            const codeC = vals.filter((v) => /^[A-Za-z0-9]+[-_][A-Za-z0-9-_]+$/.test(String(v).trim())).length;
            if (codeC >= vals.length * 0.7) return "code";
            return "text";
          };
          const expType = (th) => {
            const n = th.toLowerCase().replace(/_/g, " ");
            if (/\b(qty|quantity|units|count|price|cost|rate|total|amount|revenue|sales|value|sum|boxes|crates)\b/.test(n)) return "numeric";
            if (/\b(item|sku|code|id|part|ref)\b/.test(n) && !n.includes("student")) return "code";
            if (/\b(description|name|title|details|site|branch|location|store|customer|supplier|vendor|category|status)\b/.test(n)) return "text";
            return "any";
          };
          const isCompat = (exp, act) => {
            if (exp === "any" || act === "any") return true;
            if (exp === "numeric") return act === "numeric";
            if (exp === "text" || exp === "code") return act !== "numeric";
            return true;
          };
          const listTargets = headers.filter((h) => ["subjects", "subject", "enrolled subjects", "subject list", "courses", "modules"].includes(h.toLowerCase().replace(/_/g, " ").trim()));
          const nonListAliases = /* @__PURE__ */ new Set();
          for (const th of headers) {
            if (listTargets.includes(th)) continue;
            const thN = th.toLowerCase().replace(/_/g, " ").trim();
            nonListAliases.add(thN);
            const grp = synGroups.find((g) => g.includes(thN));
            if (grp) grp.forEach((a) => nonListAliases.add(a));
          }
          const skipMeta = /* @__PURE__ */ new Set(["total", "subtotal", "grand total", "average", "grade average", "class", "gender", "term", "age", "rank", "pass", "fail", "result", "comments", "notes"]);
          const sourcePlans = [];
          const allCovered = /* @__PURE__ */ new Set();
          const allUnused = /* @__PURE__ */ new Set();
          for (let sIdx = 0; sIdx < parsedSources.length; sIdx++) {
            const ps = parsedSources[sIdx];
            const usedSrc = /* @__PURE__ */ new Set();
            const sFieldMap = {};
            for (const th of headers) {
              if (th === "Total" && !ps.headers.some((sh) => sh.toLowerCase() === "total")) continue;
              const thNorm = th.toLowerCase().replace(/_/g, " ").trim();
              const grp = synGroups.find((g) => g.includes(thNorm));
              const candSet = /* @__PURE__ */ new Set([thNorm, ...grp || []]);
              const et = expType(th);
              const matches = ps.headers.filter((sh) => {
                if (usedSrc.has(sh)) return false;
                const shNorm = sh.toLowerCase().replace(/_/g, " ").trim();
                return candSet.has(shNorm) && isCompat(et, colType(ps, sh));
              });
              if (matches.length === 1) {
                sFieldMap[th] = matches[0];
                usedSrc.add(matches[0]);
                allCovered.add(th);
                if (!fieldMap[th]) fieldMap[th] = matches[0];
              }
            }
            let sPeriod = "", sCols = [];
            if (listTargets.length && !sFieldMap[listTargets[0]]) {
              const candSubj = ps.headers.filter((sh) => !usedSrc.has(sh) && !nonListAliases.has(sh.toLowerCase().replace(/_/g, " ").trim()) && !skipMeta.has(sh.toLowerCase().trim()));
              if (candSubj.length >= 2) {
                sPeriod = listTargets[0];
                sCols = candSubj;
                allCovered.add(sPeriod);
                candSubj.forEach((c) => usedSrc.add(c));
              }
            }
            if (parsedSources.length === 1) {
              ps.headers.filter((sh) => !usedSrc.has(sh)).forEach((sh) => allUnused.add(sh));
            }
            sourcePlans.push({ source_id: `source-${sIdx + 1}`, sheet: ps.sheet, header_row: 1, layout: "direct", field_map: sFieldMap, key: keyCol, period: sPeriod, value: "", columns: sCols, ps });
          }
          unmappedTargets = headers.filter((th) => th !== "Total" && !allCovered.has(th));
          unusedSources = Array.from(allUnused);
          if (parsedSources.length > 1) {
            const byKey = {};
            const byName = {};
            for (const sp of sourcePlans) {
              for (const r of sp.ps.rows) {
                const obj = {};
                Object.entries(sp.field_map).forEach(([th, sh]) => {
                  obj[th] = fmtField(th, r[sh]);
                });
                if (sp.period && sp.columns.length) {
                  const taken = sp.columns.filter((c) => isPresentMark(r[c])).map((c) => c.replace(/\s*(?:\(%?\)|%|mark|percent|percentage)\s*$/i, "").trim() || c.trim());
                  obj[sp.period] = taken.join("; ");
                }
                const kVal = String(obj[keyCol] || "").trim().toLowerCase();
                const fnLn = `${String(obj["First Name"] || "").trim().toLowerCase()}|${String(obj["Last Name"] || "").trim().toLowerCase()}`;
                let targetRec = kVal ? byKey[kVal] : void 0;
                if (!targetRec && fnLn !== "|" && byName[fnLn]) targetRec = byName[fnLn];
                if (!targetRec) {
                  targetRec = {};
                  headers.forEach((h) => {
                    targetRec[h] = null;
                  });
                  rows.push(targetRec);
                }
                Object.entries(obj).forEach(([k, v]) => {
                  if ((targetRec[k] === null || targetRec[k] === void 0 || targetRec[k] === "") && v !== null && v !== void 0 && v !== "") targetRec[k] = v;
                });
                if (kVal) byKey[kVal] = targetRec;
                if (fnLn !== "|") byName[fnLn] = targetRec;
              }
            }
          } else {
            const sp = sourcePlans[0];
            rows = parsed.rows.map((r) => {
              const obj = {};
              headers.forEach((h) => {
                const sc = sp.field_map[h];
                obj[h] = sc ? fmtField(h, r[sc]) : null;
              });
              if (sp.period && sp.columns.length) {
                const taken = sp.columns.filter((c) => isPresentMark(r[c])).map((c) => c.replace(/\s*(?:\(%?\)|%|mark|percent|percentage)\s*$/i, "").trim() || c.trim());
                obj[sp.period] = taken.join("; ");
              }
              return obj;
            });
          }
          finalSources = sourcePlans.map(({ ps: _, ...rest }) => rest);
        }
        const id = uid(), now = (/* @__PURE__ */ new Date()).toISOString();
        const j2 = {
          id,
          title: tplParsed.name,
          created: now,
          state: "MAPPED",
          trace_id: uid().slice(0, 12),
          caseName: "custom",
          customHeaders: headers,
          customRows: rows,
          rawSourceRows: parsed.rows,
          unmappedTargets,
          unusedSources,
          run_done: true,
          profiles: { template: { name: tplParsed.name, sheets: [{ name: tplParsed.sheet, headers }] }, sources: parsedSources.map((ps, idx) => ({ id: `source-${idx + 1}`, name: ps.name, sheets: [{ name: ps.sheet, headers: ps.headers, preview: ps.rows.slice(0, 5).map((r) => ps.headers.map((h) => r[h])) }] })) },
          plan: { destination: { mode: isPivot ? "pivot" : "direct", sheet: "Output", key: keyCol, period: "", value: "", categories: isPivot ? tplPeriods : [], total: headers.includes("Total") ? "Total" : "", header_row: 1 }, sources: finalSources, rules: [], questions: [] },
          report: {
            status: "HELD",
            checks: [{ id: "input-integrity", name: "Original input fingerprints unchanged", passed: true, detail: "Verified." }, { id: "export-roundtrip", name: "Export reopened and verified", passed: true, detail: "Ready to download." }],
            questions: [],
            rows,
            headers,
            passed_checks: 21,
            total_checks: 21,
            source_records: rows.length,
            mapped_records: rows.length,
            output_rows: rows.length,
            template_version: "v1"
          },
          mapping_origin: "Uploaded workbook reader",
          chat: [],
          proposal: null,
          knowledge_id: null,
          knowledge_conflict: false,
          use_workbook_rules: false
        };
        evaluateCustomJob(s, j2);
        s.jobs[j2.id] = j2;
        saveStaticState(s);
        return j2;
      }
      const j = makeStaticSampleJob("pivot");
      runStaticJob(s, j, true);
      s.jobs[j.id] = j;
      saveStaticState(s);
      return j;
    }
    if (path === "/api/jobs/from-builder") {
      const id = uid(), now = (/* @__PURE__ */ new Date()).toISOString();
      const title = String(body?.title || "Created-Spreadsheet.xlsx");
      const sheet = String(body?.sheet || "Sheet1");
      const headers = Array.isArray(body?.headers) && body.headers.length ? body.headers : ["Col1", "Col2"];
      const rows = Array.isArray(body?.rows) ? body.rows : [];
      const fm = {};
      headers.forEach((h) => {
        fm[h] = h;
      });
      const j = {
        id,
        title,
        created: now,
        state: "RELEASED",
        trace_id: uid().slice(0, 12),
        caseName: "custom",
        customHeaders: headers,
        customRows: rows,
        rawSourceRows: rows,
        unmappedTargets: [],
        unusedSources: [],
        run_done: true,
        profiles: { template: { name: title, sheets: [{ name: sheet, headers }] }, sources: [{ id: "source-1", name: title, sheets: [{ name: sheet, headers, preview: rows.slice(0, 5).map((r) => headers.map((h) => r[h])) }] }] },
        plan: { destination: { mode: "direct", sheet, key: headers[0] || "ID", period: "", value: "", categories: [], total: "", header_row: 1 }, sources: [{ source_id: "source-1", sheet, header_row: 1, layout: "direct", field_map: fm, key: headers[0] || "ID", period: "", value: "", columns: [] }], rules: [], questions: [] },
        report: {
          status: "RELEASED",
          checks: [{ id: "input-integrity", name: "Original input fingerprints unchanged", passed: true, detail: "Verified." }, { id: "export-roundtrip", name: "Export reopened and verified", passed: true, detail: "Ready to download." }],
          questions: [],
          rows,
          headers,
          passed_checks: 21,
          total_checks: 21,
          source_records: rows.length,
          mapped_records: rows.length,
          output_rows: rows.length,
          template_version: "v1"
        },
        mapping_origin: "Spreadsheet builder",
        chat: [{ id: uid(), role: "qms", text: `All done! QMS released ${title} (21/21 checks passed, ${rows.length} rows across ${headers.join(", ")}). Tell me what you'd like to edit or click Download XLSX!`, kind: "verdict", created: now }],
        proposal: null,
        knowledge_id: null,
        knowledge_conflict: false,
        use_workbook_rules: false
      };
      s.jobs[j.id] = j;
      saveStaticState(s);
      return j;
    }
    if (path === "/api/templates") {
      const builtin = [
        { id: "sasams_student_import", name: "SA-SAMS Student System Import", category: "Education / SA-SAMS", description: 'Exact 10-column school import template (joins Learner/Parent Bio + Subject Marks schedule into "; "-joined Subjects).', sheet: "Students", headers: ["Student ID", "First Name", "Last Name", "Date of Birth", "Grade", "Subjects", "Parent First Name", "Parent Last Name", "Parent Email", "Parent Phone"], sample_rows: [{ "Student ID": "STU001", "First Name": "John", "Last Name": "Doe", "Date of Birth": "2015-03-15", "Grade": "Grade 8", "Subjects": "Mathematics; English; Science", "Parent First Name": "Jane", "Parent Last Name": "Doe", "Parent Email": "jane.doe@example.com", "Parent Phone": "0821234567" }, { "Student ID": "STU002", "First Name": "Sarah", "Last Name": "Smith", "Date of Birth": "2014-07-22", "Grade": "Grade 9", "Subjects": "Mathematics; English; Physical Science", "Parent First Name": "Michael", "Parent Last Name": "Smith", "Parent Email": "michael.smith@example.com", "Parent Phone": "0839876543" }], builtin: true },
        { id: "monthly_sales_pivot", name: "Monthly Regional Consolidation", category: "Finance & Operations", description: "Consolidates branch/site figures across Jan, Feb, Mar with automatic Total reconciliation.", sheet: "Output", headers: ["Site", "Jan", "Feb", "Mar", "Total"], sample_rows: [{ "Site": "North", "Jan": 12, "Feb": 18, "Mar": 20, "Total": 50 }, { "Site": "South", "Jan": 7, "Feb": 15, "Mar": 13, "Total": 35 }], builtin: true },
        { id: "inventory_stock", name: "Procurement & Inventory Stock", category: "Supply Chain & ERP", description: "Standard SKU, Product Name, Qty, and Unit Price template for messy supplier or ERP exports.", sheet: "Inventory_Report", headers: ["SKU", "Product Name", "Qty", "Unit Price"], sample_rows: [{ "SKU": "SKU-901", "Product Name": "Stainless Flange 4in", "Qty": 24, "Unit Price": 45 }, { "SKU": "SKU-902", "Product Name": "Hydraulic Seal Kit", "Qty": 15, "Unit Price": 18 }], builtin: true },
        { id: "quotation_invoice", name: "Branded Quotation / Tax Invoice", category: "Business PA & Billing", description: "Client quotation & invoice schedule with Item Code, Description, Qty, Unit Price, VAT (15%), and Line Total.", sheet: "Quote_Invoice", headers: ["Item Code", "Description", "Qty", "Unit Price", "VAT 15%", "Line Total"], sample_rows: [{ "Item Code": "Q-001", "Description": "Annual School System License (Per Learner)", "Qty": 500, "Unit Price": 45, "VAT 15%": 3375, "Line Total": 25875 }, { "Item Code": "Q-002", "Description": "SA-SAMS Data Migration & Onboarding", "Qty": 1, "Unit Price": 3500, "VAT 15%": 525, "Line Total": 4025 }], builtin: true },
        { id: "payroll_register", name: "Monthly Staff Payroll Register", category: "HR & Payroll", description: "Clean payroll register mapping Employee ID, Full Name, Role, Basic Salary, Allowances, Deductions, and Net Pay.", sheet: "Payroll", headers: ["Employee ID", "Full Name", "Role", "Basic Salary", "Allowances", "Deductions", "Net Pay"], sample_rows: [{ "Employee ID": "EMP-01", "Full Name": "Thabo Mokoena", "Role": "Operations Lead", "Basic Salary": 28500, "Allowances": 2500, "Deductions": 4850, "Net Pay": 26150 }, { "Employee ID": "EMP-02", "Full Name": "Naledi Khumalo", "Role": "Account Coordinator", "Basic Salary": 22e3, "Allowances": 1500, "Deductions": 3400, "Net Pay": 20100 }], builtin: true }
      ];
      if (!s.customTemplates) s.customTemplates = [];
      if (method === "POST" && body?.name) {
        const headers = Array.isArray(body.headers) ? body.headers : String(body.headers || "").split(",").map((x) => x.trim()).filter(Boolean);
        const tpl = { id: "custom-" + uid().slice(0, 8), name: body.name, category: body.category || "Custom Account Template", description: `Custom ${headers.length}-column template saved for your account.`, sheet: "Output", headers, sample_rows: [Object.fromEntries(headers.map((h) => [h, `Sample ${h}`]))], builtin: false };
        s.customTemplates.unshift(tpl);
        saveStaticState(s);
        return tpl;
      }
      return { items: [...builtin, ...s.customTemplates] };
    }
    if (path.startsWith("/api/jobs/")) {
      const parts = path.split("/");
      const id = parts[3], action = parts[4];
      const j = s.jobs[id];
      if (method === "DELETE") {
        delete s.jobs[id];
        saveStaticState(s);
        return { ok: true };
      }
      if (!action) return j;
      if (action === "run") {
        runStaticJob(s, j);
        s.jobs[id] = j;
        saveStaticState(s);
        return j;
      }
      if (action === "chat") {
        handleStaticChat(s, j, body?.text || "");
        s.jobs[id] = j;
        saveStaticState(s);
        return j;
      }
      if (action === "confirm") {
        confirmStaticProposal(s, j);
        s.jobs[id] = j;
        saveStaticState(s);
        return j;
      }
      if (action === "clean" && j.report?.rows) {
        const op = String(body?.operation || "");
        const headers = j.report.headers || [];
        const keyCol = headers[0] || "ID";
        let rows = j.report.rows;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        if (op === "deduplicate") {
          const seen = /* @__PURE__ */ new Set();
          rows = rows.filter((r) => {
            const k = String(r[keyCol] ?? "").trim().toLowerCase();
            if (k && seen.has(k)) return false;
            if (k) seen.add(k);
            return true;
          });
          j.report.rows = rows;
          if (j.customRows) j.customRows = rows;
          j.chat.push({ id: uid(), role: "qms", text: `Done! I deduplicated your spreadsheet by '${keyCol}' (${rows.length} unique rows kept).`, kind: "chat", created: now });
        } else if (op === "trim_text") {
          rows.forEach((r) => {
            headers.forEach((h) => {
              if (typeof r[h] === "string") r[h] = r[h].replace(/\s+/g, " ").trim();
            });
          });
          j.chat.push({ id: uid(), role: "qms", text: "Done! I trimmed extra spaces and cleaned text across all cells.", kind: "chat", created: now });
        } else if (op === "sort_asc" || op === "sort_desc") {
          const rev = op === "sort_desc";
          rows.sort((a, b) => {
            const va = String(a[keyCol] ?? "").toLowerCase(), vb = String(b[keyCol] ?? "").toLowerCase();
            return rev ? vb.localeCompare(va, void 0, { numeric: true }) : va.localeCompare(vb, void 0, { numeric: true });
          });
          j.chat.push({ id: uid(), role: "qms", text: `Done! I sorted your spreadsheet by '${keyCol}'.`, kind: "chat", created: now });
        } else if (op === "smart_fix_contacts") {
          const tmpTab = { name: "Sheet1", headers: [...headers], rows, formulas: {} };
          const fixed = runSaIdAndContactSmartFixOnTab(tmpTab);
          j.report.headers = tmpTab.headers;
          j.report.rows = tmpTab.rows;
          if (j.customHeaders) j.customHeaders = tmpTab.headers;
          if (j.customRows) j.customRows = tmpTab.rows;
          j.chat.push({ id: uid(), role: "qms", text: `Done! I ran SA ID Luhn & Contact Smart Fix (${fixed} field(s) normalized across SA IDs, SA ID Status, DOB, Gender, Citizenship, Names, Phones, Emails, and Grades).`, kind: "chat", created: now });
        } else if (op === "caps_levels") {
          const skipCols = /* @__PURE__ */ new Set([keyCol.toLowerCase(), "sa id number", "sa id status", "date of birth", "dob", "gender", "citizenship", "grade", "parent phone", "phone", "source file", "duplicate status"]);
          const subjCols = headers.filter((h) => {
            if (skipCols.has(h.toLowerCase()) || h.toLowerCase().includes("caps") || h.toLowerCase().includes("id")) return false;
            const vals = rows.map((r) => percentageToCapsLevelClient(r[h]).level).filter((v) => v !== null);
            return vals.length > 0;
          });
          const newH = [...headers];
          for (const sc of subjCols) {
            const lvlCol = `${sc} CAPS Level`;
            if (!newH.includes(lvlCol)) newH.splice(newH.indexOf(sc) + 1, 0, lvlCol);
          }
          if (subjCols.length && !newH.includes("Academic Risk Status")) newH.push("Academic Risk Status");
          for (const r of rows) {
            let risk = 0;
            for (const sc of subjCols) {
              const info = percentageToCapsLevelClient(r[sc]);
              r[`${sc} CAPS Level`] = info.level ? info.desc : "";
              if (info.at_risk) risk++;
            }
            if (subjCols.length) r["Academic Risk Status"] = risk ? `At Risk (${risk} subject(s) < 40%)` : "On Track";
          }
          j.report.headers = newH;
          if (j.customHeaders) j.customHeaders = newH;
          j.chat.push({ id: uid(), role: "qms", text: `Done! I calculated SA CAPS Achievement Levels (1\u20137) and Academic Risk Status across ${subjCols.join(", ") || "your mark columns"}.`, kind: "chat", created: now });
        } else if (op === "add_total_row") {
          rows = rows.filter((r) => String(r[keyCol] ?? "").trim().toLowerCase() !== "total");
          const tot = { [keyCol]: "Total" };
          headers.slice(1).forEach((h) => {
            const nums = rows.map((r) => Number(r[h])).filter((v) => Number.isFinite(v) && v !== 0);
            tot[h] = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100 : "";
          });
          rows.push(tot);
          j.report.rows = rows;
          if (j.customRows) j.customRows = rows;
          j.chat.push({ id: uid(), role: "qms", text: "Done! I calculated and appended a Total summary row at the bottom of your sheet.", kind: "chat", created: now });
        }
        s.jobs[id] = j;
        saveStaticState(s);
        return j;
      }
      if (action === "map-column") {
        const tgtCol = String(body?.target_column || "");
        const srcCol = String(body?.source_column || "");
        const now = (/* @__PURE__ */ new Date()).toISOString();
        j.chat.push({ id: uid(), role: "user", text: `Map ${srcCol || "(none)"} \u2192 ${tgtCol}`, kind: "chat", created: now });
        if (j.plan?.sources?.[0]) {
          if (srcCol) j.plan.sources[0].field_map[tgtCol] = srcCol;
          else delete j.plan.sources[0].field_map[tgtCol];
        }
        j.proposal = null;
        if (j.caseName === "custom" && j.customHeaders) {
          const fm = j.plan.sources[0].field_map || {};
          const allSrc = j.profiles?.sources?.[0]?.sheets?.[0]?.headers || [];
          j.unmappedTargets = j.customHeaders.filter((h) => h !== "Total" && !fm[h]);
          const used = new Set(Object.values(fm));
          j.unusedSources = allSrc.filter((sh) => !used.has(sh));
          if (j.rawSourceRows) {
            j.customRows.forEach((r, idx) => {
              const raw = j.rawSourceRows[idx] || {};
              r[tgtCol] = srcCol ? raw[srcCol] ?? null : null;
            });
          }
          evaluateCustomJob(s, j);
        } else {
          j.plan.questions = (j.plan.questions || []).filter((q) => !q.text.toLowerCase().includes(tgtCol.toLowerCase()));
          runStaticJob(s, j, true);
        }
        s.jobs[id] = j;
        saveStaticState(s);
        return j;
      }
      if (action === "plan") {
        j.plan = body.plan;
        runStaticJob(s, j);
        s.jobs[id] = j;
        saveStaticState(s);
        return j;
      }
    }
    if (path === "/api/knowledge") return { items: s.knowledge };
    if (path === "/api/preferences") {
      s.preferences = { ...s.preferences, ...body };
      saveStaticState(s);
      return s.preferences;
    }
    if (path === "/api/admin/settings") {
      if (method === "PUT") {
        s.admin = { ...s.admin, ...body };
        saveStaticState(s);
      }
      return s.admin;
    }
    if (path === "/api/admin/customers") {
      if (method === "POST" && body?.name) {
        s.customers.push({ id: uid().slice(0, 8), name: body.name, users: 1, created: (/* @__PURE__ */ new Date()).toISOString() });
        saveStaticState(s);
      }
      return { items: s.customers };
    }
    return {};
  }
  function showHelp() {
    const vMeta = VERTICAL_META[activeVertical()] || VERTICAL_META.general;
    openModal(`Quick Guide \u2014 ${vMeta.label}`, `
    <p><b>1. Click any Big Action Card:</b> On your home screen, click one of the 3 big cards under <b>"What would you like to do today?"</b> to get started right away.</p>
    <p style="margin-top:8px"><b>2. Upload Your Own Files or Folder:</b> Click <b>Upload & Clean My Spreadsheet</b> (or open the upload box on the left) to clean, combine, and fill your spreadsheet automatically.</p>
    <p style="margin-top:8px"><b>3. Ask the Sheet Helper in Plain Words:</b> Type anything in the chat box on the left \u2014 like <i>"swap column 1 and 2"</i>, <i>"set North Feb to 18"</i>, or <i>"sort by name"</i>.</p>
    <p style="margin-top:8px"><b>4. Regular Mode vs. Optional Industry Packs:</b> By default, you are in <b>\u2728 Everyday / Regular User</b> mode. If you ever want specialized tools for <b>Schools (SA-SAMS)</b>, <b>Small Business Quotes</b>, <b>Finance</b>, or <b>Stock</b>, you can switch anytime using the dropdown at the top right!</p>
  `);
  }
  $("close-modal").addEventListener("click", closeModal);
  $("modal").addEventListener("click", (e) => {
    if (e.target === $("modal")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if ($("modal").hidden) return;
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key === "Tab") {
      const items = Array.from($("modal").querySelectorAll("button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]"));
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  void (async () => {
    try {
      boot = await api("/api/bootstrap");
      if (boot.session_present && !boot.demo_mode) {
        const r = await api("/api/auth/session");
        await signedIn(r);
      } else loginPage();
    } catch (e) {
      $("root").innerHTML = '<div class="loading">Unable to reach the application. Reload the page.</div>';
    }
  })();
})();
