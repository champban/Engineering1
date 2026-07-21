import fs from 'node:fs'

const pagePath = 'src/ui/pages/ObjectStudioPage.tsx'
let page = fs.readFileSync(pagePath, 'utf8')
page = page.replace('useMemo, ', '')
fs.writeFileSync(pagePath, page)

const viewportPath = 'src/viewport/components/ObjectStudioViewport.tsx'
let viewport = fs.readFileSync(viewportPath, 'utf8')
viewport = viewport.replace(
  "      transformControl.setMode(activeTool as 'translate' | 'rotate' | 'scale')\n      if (activeTool === 'move') transformControl.setMode('translate')",
  "      const transformMode = activeTool === 'move' ? 'translate' : activeTool\n      transformControl.setMode(transformMode)",
)
viewport = viewport.replace(
  "      transformControl.addEventListener('dragging-changed', (event) => {\n        controls.enabled = !event.value\n      })",
  "      transformControl.addEventListener('dragging-changed', (event) => {\n        controls.enabled = !(event as { value?: boolean }).value\n      })",
)
fs.writeFileSync(viewportPath, viewport)
