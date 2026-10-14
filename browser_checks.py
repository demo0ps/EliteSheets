from pathlib import Path
import json
import shutil
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parent
PROOF=ROOT/'verification'
PROOF.mkdir(exist_ok=True)
axe=ROOT/'web/.local/axe.min.js'
axe.parent.mkdir(exist_ok=True)
shutil.copyfile(ROOT/'node_modules/axe-core/axe.min.js',axe)
result={'checks':[],'accessibility':[],'errors':[],'external_requests':[],'widths':[1280,390]}


def passed(name):result['checks'].append(name)
def geometry(page):
    sizes=page.evaluate('({viewport:innerWidth,document:document.documentElement.scrollWidth})')
    assert sizes['document']<=sizes['viewport'],sizes

def scan(page,name):
    if not page.evaluate('Boolean(window.axe)'):page.add_script_tag(url='/static/.local/axe.min.js')
    violations=page.evaluate("async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));}")
    result['accessibility'].append({'name':name,'violations':violations})

def screenshot(page,name):
    page.evaluate('window.scrollTo(0,0)')
    page.screenshot(path=str(PROOF/(name+'.png')),full_page=True)


with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
    for width in [1280,390]:
        context=browser.new_context(viewport={'width':width,'height':1000},accept_downloads=True)
        page=context.new_page()
        page.on('pageerror',lambda e:result['errors'].append(str(e)))
        page.on('console',lambda m:result['errors'].append(m.text) if m.type=='error' else None)
        page.on('request',lambda r:result['external_requests'].append(r.url) if not r.url.startswith(('http://127.0.0.1:3001','data:')) else None)
        page.goto('http://127.0.0.1:3001',wait_until='networkidle')
        expect(page.locator('#demo-operator')).to_be_visible()
        geometry(page);scan(page,f'login-{width}');screenshot(page,f'login-{width}')
        page.locator('#demo-operator').click()
        expect(page.locator('#load-example')).to_be_visible()
        assert page.locator('[data-page="admin"]').count()==0
        passed(f'{width}: demo operator login and role-specific navigation')
        geometry(page);scan(page,f'studio-empty-{width}')
        page.locator('#sample-case').select_option('hold')
        page.locator('#load-example').click()
        expect(page.locator('#run-job')).to_be_visible()
        page.locator('#run-job').click()
        expect(page.locator('#output-state')).to_have_text('Candidate · held')
        assert page.locator('#download-output').is_disabled()
        expect(page.locator('#messages')).to_contain_text('North / Feb')
        passed(f'{width}: held workbook explains its issue in job chat')
        geometry(page);scan(page,f'held-chat-{width}');screenshot(page,f'held-chat-{width}')
        page.locator('#chat-text').fill('North Feb is 18')
        page.locator('#chat-text').press('Enter')
        expect(page.locator('#confirm-correction')).to_be_visible()
        assert page.locator('#download-output').is_disabled()
        passed(f'{width}: text reply produces explicit correction proposal, no silent release')
        page.locator('#confirm-correction').click()
        expect(page.locator('#output-state')).to_have_text('QMS released')
        expect(page.locator('#messages')).to_contain_text('QMS released this workbook')
        assert page.locator('#download-output').is_enabled()
        passed(f'{width}: confirmed answer triggers real QMS rerun and release')
        page.locator('#chat-text').fill('swap Jan and Feb')
        page.locator('#chat-text').press('Enter')
        expect(page.locator('#messages')).to_contain_text('Done! I swapped Jan and Feb')
        page.locator('#chat-text').fill('replace the first row with row 2')
        page.locator('#chat-text').press('Enter')
        expect(page.locator('#messages')).to_contain_text('Done! I swapped row 1')
        passed(f'{width}: client spreadsheet edit requests (swap columns/rows) executed in chat')
        geometry(page);scan(page,f'released-chat-{width}');screenshot(page,f'studio-{width}')
        with page.expect_download() as event:page.locator('#download-output').click()
        event.value.save_as(str(PROOF/f'chat-verified-{width}.xlsx'))
        passed(f'{width}: released XLSX download')
        page.locator('[data-page="knowledge"]').click()
        page.locator('.knowledge-card').first.wait_for(state='visible')
        assert page.locator('.knowledge-card').count()>=1
        geometry(page);scan(page,f'knowledge-{width}')
        passed(f'{width}: customer-scoped QMS-passed knowledge shown')
        page.locator('[data-page="preferences"]').click()
        expect(page.locator('#preferences-form')).to_be_visible()
        assert page.locator('#api-key').count()==0
        page.locator('#density').select_option('compact')
        page.locator('#save-preferences').click()
        expect(page.locator('#toast')).to_contain_text('preferences were saved')
        geometry(page);scan(page,f'preferences-{width}')
        page.locator('#theme').select_option('light')
        page.locator('#save-preferences').click()
        expect(page.locator('body')).to_have_class('light compact')
        scan(page,f'preferences-light-{width}')
        page.locator('#theme').select_option('dark')
        page.locator('#save-preferences').click()
        expect(page.locator('body')).to_have_class('compact')
        passed(f'{width}: operator non-secret preferences saved; no API-key field')
        page.locator('#help').click()
        expect(page.locator('#modal')).to_be_visible()
        page.keyboard.press('Tab')
        assert page.evaluate("document.querySelector('#modal').contains(document.activeElement)")
        page.keyboard.press('Escape')
        assert page.locator('#modal').is_hidden()
        passed(f'{width}: QMS chat help and keyboard modal')
        page.locator('#mobile-logout' if width==390 else '#logout').click()
        expect(page.locator('#demo-admin')).to_be_visible()
        page.locator('#demo-admin').click()
        expect(page.locator('#admin-form')).to_be_visible()
        assert page.locator('#api-key').is_disabled()
        page.locator('#platform-budget').fill('25')
        page.locator('#ai-budget').fill('0')
        page.locator('#save-admin').click()
        expect(page.locator('#toast')).to_contain_text('No AI request was made')
        geometry(page);scan(page,f'admin-{width}');screenshot(page,f'admin-{width}')
        passed(f'{width}: admin budget creation, live key/AI preview refusal')
        page.locator('#mobile-logout' if width==390 else '#logout').click()
        expect(page.locator('#demo-operator')).to_be_visible()
        passed(f'{width}: logout returns to private sign-in')
        context.close()
    browser.close()
(PROOF/'browser-checks.json').write_text(json.dumps(result,indent=2))
violations=sum(len(s['violations']) for s in result['accessibility'])
print(json.dumps({'workflow_checks':len(result['checks']),'accessibility_violations':violations,'errors':result['errors'],'external_requests':result['external_requests']},indent=2))
assert not result['errors']
assert not result['external_requests']
assert violations==0
