import fs from 'node:fs'

const path = 'src/main.tsx'
let source = fs.readFileSync(path, 'utf8')

if (!source.includes("import { ObjectStudioPage }")) {
  source = source.replace(
    "import { WorkspacePage } from '@/ui/pages/WorkspacePage'",
    "import { WorkspacePage } from '@/ui/pages/WorkspacePage'\nimport { ObjectStudioPage } from '@/ui/pages/ObjectStudioPage'",
  )
}

source = source.replace(
  "type AppMode = 'phase1' | 'phase2'",
  "type AppMode = 'phase1' | 'phase2' | 'studio'",
)

if (!source.includes('Object Studio</button>')) {
  source = source.replace(
    '<button className="phase-switch" onClick={() => setMode(\'phase2\')} type="button">Phase 2A · Equipment Data</button>',
    '<button className="phase-switch" onClick={() => setMode(\'phase2\')} type="button">Phase 2A · Equipment Data</button>\n        <button className="studio-switch" onClick={() => setMode(\'studio\')} type="button">Object Studio</button>',
  )
}

if (!source.includes("mode === 'studio'")) {
  source = source.replace(
    "  return <EquipmentDataPage onBack={() => setMode('phase1')} />",
    "  if (mode === 'studio') return <ObjectStudioPage onBack={() => setMode('phase1')} />\n  return <EquipmentDataPage onBack={() => setMode('phase1')} />",
  )
}

if (!source.includes('.studio-switch{')) {
  source = source.replace(
    '.phase-switch{position:fixed;',
    '.studio-switch{position:fixed;z-index:30;right:18px;bottom:68px;padding:11px 15px;border:1px solid #54d08a;border-radius:999px;background:#123025;color:#eef5fb;box-shadow:0 8px 30px #0008;cursor:pointer;font-weight:700}.phase-switch{position:fixed;',
  )
  source = source.replace(
    '.phase-switch{right:10px;bottom:10px}',
    '.phase-switch{right:10px;bottom:10px}.studio-switch{right:10px;bottom:60px}',
  )
}

fs.writeFileSync(path, source)
