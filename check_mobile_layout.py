from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,args=['--no-sandbox'])
    page=b.new_page(viewport={'width':390,'height':1000})
    page.goto('http://127.0.0.1:3001')
    page.locator('#demo-admin').click()
    expect(page.locator('#admin-form')).to_be_visible()
    print(page.evaluate("[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,id:e.id,cls:e.className,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).filter(e=>e.right>390&&e.width>0).slice(0,20)"))
    b.close()
