import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/site.scss'
import { ContentProvider, loadContent } from '@/data/content'
import { App } from '@/App'

const root = createRoot(document.getElementById('root')!)

loadContent()
  .then((content) => {
    root.render(
      <StrictMode>
        <ContentProvider value={content}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ContentProvider>
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error(error)
    root.render(
      <main style={{ padding: '4rem 1rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>Ford Costa Rica</h1>
        <p>No pudimos cargar el sitio en este momento. Intente de nuevo en unos minutos.</p>
      </main>,
    )
  })
