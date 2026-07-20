import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ShellPage } from '@/ui/pages/ShellPage'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ShellPage />
  </StrictMode>,
)
