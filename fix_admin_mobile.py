from pathlib import Path
p=Path('web/styles.css');t=p.read_text();t+='\n@media(max-width:760px){.topbar:has(#workspace-picker){height:auto;flex-wrap:wrap;padding:10px 17px;gap:10px}.topbar:has(#workspace-picker) .breadcrumb{width:100%}.topbar:has(#workspace-picker) .topbar-right{width:100%;justify-content:flex-end;gap:8px;flex-wrap:wrap}}\n';p.write_text(t)
print('Fixed admin workspace picker/header overflow at mobile width.')
