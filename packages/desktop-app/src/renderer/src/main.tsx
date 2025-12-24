import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './AppRouter'

declare global {
  interface Window {
    wallpaperAPI: import('../../shared/ipc-channels').IpcRendererApi
  }
}

const rootElement = document.getElementById('app')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppRouter />
    </React.StrictMode>
  )
} else {
  console.error("Failed to find the root element with ID 'app'.")
}
