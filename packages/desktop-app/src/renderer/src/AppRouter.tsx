import React, { useState } from 'react'
import { HomeView } from './views/HomeView'
import { HistoryView } from './views/HistoryView'
import { ConfigView } from './views/ConfigView'
import { BookmarksView } from './views/BookmarksView'
import { FavoritesView } from './views/FavoritesView'

const routes: Record<string, React.FC> = {
  home: HomeView,
  history: HistoryView,
  config: ConfigView,
  bookmarks: BookmarksView,
  favorites: FavoritesView
}

const AppRouter: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<keyof typeof routes>('home')

  const ActiveComponent = routes[currentRoute] || HomeView

  return (
    <>
      {/* Navigation Bar (HTML from your index.html) */}
      <header id="app-header">
        <h1>Wallpaper App</h1>
        <nav id="app-nav">
          {/* Use React's onClick handler to update state */}
          <button onClick={() => setCurrentRoute('home')}>🏠 Home</button>
          <button onClick={() => setCurrentRoute('history')}>📜 History</button>
          <button onClick={() => setCurrentRoute('config')}>⚙️ Settings</button>
          <button onClick={() => setCurrentRoute('bookmarks')}>Bookmarks</button>
          <button onClick={() => setCurrentRoute('favorites')}>Favorites</button>
        </nav>
      </header>

      {/* The main content area where the active view is rendered */}
      <main id="app-content">
        <ActiveComponent />
      </main>
    </>
  )
}

export default AppRouter
