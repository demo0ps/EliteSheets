from pathlib import Path
p=Path('sheetqms/online.py');t=p.read_text()
t=t.replace("        questions = report['questions'] if report else job['plan']['questions']", """        questions = report['questions'] if report else job['plan']['questions']
        if questions and job.get('explanation_style') == 'concise':
            return 'Output held. ' + questions[0]['text'] + (' More issues are in the check list.' if len(questions)>1 else '') + ' Reply with evidence or a specific correction; I will ask you to confirm before rerunning checks.'""",1)
t=t.replace("        job = get_job(tenant, identifier)\n        if body.request_id in job.get('chat_requests', []):", "        job = get_job(tenant, identifier)\n        job['explanation_style'] = Preferences.model_validate(store.preferences(user['id'])).explanations\n        if body.request_id in job.get('chat_requests', []):",1)
t=t.replace("        return public(run_job(tenant, job))\n\n    @app.post('/api/jobs/{identifier}/analyse')", """        if not Preferences.model_validate(store.preferences(user['id'])).auto_checks:
            message(job, 'qms', 'Your preference is to run checks manually. The confirmed change is saved, but final export remains locked. Use Run transformation when ready.')
            store.save_job(tenant, job, 'awaiting_manual_qms')
            return public(job)
        return public(run_job(tenant, job))

    @app.post('/api/jobs/{identifier}/analyse')""",1)
p.write_text(t)
p=Path('browser_checks.py');t=p.read_text()
old="        passed(f'{width}: operator non-secret preferences saved; no API-key field')"
new="""        page.locator('#theme').select_option('light')
        page.locator('#save-preferences').click()
        expect(page.locator('body')).to_have_class('light compact')
        scan(page,f'preferences-light-{width}')
        page.locator('#theme').select_option('dark')
        page.locator('#save-preferences').click()
        expect(page.locator('body')).to_have_class('compact')
        passed(f'{width}: operator non-secret preferences saved; no API-key field')"""
if new not in t:
    assert old in t;t=t.replace(old,new,1)
p.write_text(t)
print('Implemented saved explanation/manual-check preferences and added light-theme browser checks.')
