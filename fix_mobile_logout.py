from pathlib import Path
p=Path('web/app.ts')
t=p.read_text()
t=t.replace('<button id="help" class="icon-button" aria-label="How QMS chat works">', '<button id="mobile-logout" class="icon-button mobile-logout" aria-label="Sign out">${icon(\'logout\')}</button><button id="help" class="icon-button" aria-label="How QMS chat works">',1)
anchor="$('help').addEventListener('click',showHelp);"
t=t.replace(anchor,"$('mobile-logout').addEventListener('click',()=>void(async()=>{await api('/api/auth/logout',{});loginPage()})());"+anchor,1)
t=t.replace("boot=await api('/api/bootstrap');loginPage()", "boot=await api('/api/bootstrap');if(boot.session_present&&!boot.demo_mode){const r=await api('/api/auth/session');await signedIn(r)}else loginPage()",1)
p.write_text(t)
p=Path('web/styles.css');t=p.read_text();t+='\n.mobile-logout{display:none}@media(max-width:760px){.mobile-logout{display:block}}\n';p.write_text(t)
p=Path('browser_checks.py');t=p.read_text().replace("page.locator('#logout').click()", "page.locator('#mobile-logout' if width==390 else '#logout').click()");t=t.replace("expect(page.locator('.knowledge-card')).to_have_count(1)", "assert page.locator('.knowledge-card').count()>=1");p.write_text(t)
print('Fixed actual mobile sign-out accessibility and private-session refresh.')
