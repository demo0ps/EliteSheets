from pathlib import Path
import hashlib,json,shutil,zipfile

ROOT=Path('/home/user')
CLOUD=ROOT/'sheetqms-cloud'
DEST=ROOT/'EliteSheets-online.zip'

for name in ['BRIEF.md','STATUS.md','DECISIONS.md','TEAM.md']:
    dest=CLOUD/'docs/project'/name
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(ROOT/name,dest)

TOP={'README.md','requirements.txt','.gitignore','.env.example','package.json','browser_checks.py','index.html','.nojekyll'}
FOLDERS={'sheetqms','web','tests','docs','deploy','verification'}
BLOCKED={'.local','.cache','.venv','__pycache__','.pytest_cache','node_modules','.git'}
files=[]
for path in sorted(CLOUD.rglob('*')):
    if not path.is_file():continue
    rel=path.relative_to(CLOUD)
    if any(part in BLOCKED for part in rel.parts) or path.name=='DELIVERY-MANIFEST.json':continue
    if path.suffix.lower() in {'.sqlite','.sqlite3','.db','.pem','.key','.pyc'} or path.name=='.env':continue
    if (len(rel.parts)==1 and path.name in TOP) or (len(rel.parts)>1 and rel.parts[0] in FOLDERS):
        files.append(path)
manifest={'version':'0.2.0','artifact':'EliteSheets-online.zip','verification_scope':'Development/synthetic automated (67) and headless Chromium (22) checks passed; live cloud deployment, live AI and real customer spreadsheets not yet verified','files':{str(p.relative_to(CLOUD)):{'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in files}}
(CLOUD/'DELIVERY-MANIFEST.json').write_text(json.dumps(manifest,indent=2))
with zipfile.ZipFile(DEST,'w',zipfile.ZIP_DEFLATED) as z:
    for p in files+[CLOUD/'DELIVERY-MANIFEST.json']:
        z.write(p,'EliteSheets-online/'+str(p.relative_to(CLOUD)))
with zipfile.ZipFile(DEST) as z:
    assert z.testzip() is None
    names=z.namelist()
    assert 'EliteSheets-online/web/app.js' in names and 'EliteSheets-online/deploy/Dockerfile' in names
    assert not any('node_modules' in n or n.endswith('.sqlite3') or n.endswith('/.env') for n in names)
print(json.dumps({'archive':DEST.name,'bytes':DEST.stat().st_size,'files':len(names),'sha256':hashlib.sha256(DEST.read_bytes()).hexdigest()},indent=2))
