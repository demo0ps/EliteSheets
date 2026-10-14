from pathlib import Path
p=Path('web/styles.css');t=p.read_text();t+='\nbody.light .sidebar,body.light .topbar{--muted:#b2bfd6;--ink:#e9edf8;color:#e9edf8}body.light .workspace-card strong{color:#e9edf8}body.light .page-footer{color:#526079}\n';p.write_text(t)
print('Fixed the measured light-theme shell/footer contrast findings.')
