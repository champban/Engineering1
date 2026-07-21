import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WorkspacePage } from '@/ui/pages/WorkspacePage'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <WorkspacePage />
  </StrictMode>,
)
