from pathlib import Path
p=Path('tests/test_online.py');t=p.read_text();t+='''

def test_manual_check_preference_does_not_release_without_qms(client):
    c,_=client
    sign(client)
    c.put('/api/preferences',json={'auto_checks':False})
    job=example(client,'hold')
    c.post(f'/api/jobs/{job["id"]}/run',json={})
    reply=c.post(f'/api/jobs/{job["id"]}/chat',json={'text':'North Feb is 18','request_id':'manual-qms-reply'}).json()
    confirmed=c.post(f'/api/jobs/{job["id"]}/confirm',json={'proposal_id':reply['proposal']['id'],'request_id':'manual-qms-confirm'}).json()
    assert confirmed['state']=='MAPPED' and confirmed['report'] is None
    assert c.get(f'/api/jobs/{job["id"]}/output').status_code==409
    assert c.post(f'/api/jobs/{job["id"]}/run',json={}).json()['state']=='RELEASED'


def test_concise_explanation_preference_is_applied(client):
    c,_=client
    sign(client)
    c.put('/api/preferences',json={'explanations':'concise'})
    job=example(client,'hold')
    c.post(f'/api/jobs/{job["id"]}/run',json={})
    reply=c.post(f'/api/jobs/{job["id"]}/chat',json={'text':'What is blocking this output?','request_id':'concise-explanation'}).json()
    assert reply['chat'][-1]['text'].startswith('Output held.')
    assert 'Reply with evidence' in reply['chat'][-1]['text']
''';p.write_text(t)
print('Added actual preference-behaviour coverage.')
