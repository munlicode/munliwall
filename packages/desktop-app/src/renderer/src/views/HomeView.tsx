import React, { useEffect, useState } from 'react'
import { Wallpaper } from '@munlicode/munliwall-core'

type RandomMode = 'favorites' | 'history' | 'bookmarks' | 'all'

export const HomeView = (): React.ReactElement => {
  const [sources, setSources] = useState<string[]>([])
  const [selectedSource, setSelectedSource] = useState('')
  const [query, setQuery] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusColor, setStatusColor] = useState('black')
  const [randomMode, setRandomMode] = useState<RandomMode>('all') // single choice
  const [currentWallpaper, setCurrentWallpaper] = useState<Wallpaper | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setStatus = (msg: string, color?: string): void => {
    setStatusMessage(msg)
    if (color) setStatusColor(color)
  }

  const fetchCurrentWallpaper = async (): Promise<void> => {
    try {
      const current = await window.wallpaperAPI.current.get()
      setCurrentWallpaper(current)
    } catch (e) {
      console.error('Failed to fetch current wallpaper:', e)
    }
  }

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      try {
        const [sourcesList, defaultSourceObj] = await Promise.all([
          window.wallpaperAPI.sources.list(),
          window.wallpaperAPI.config.get('defaultSource'),
          fetchCurrentWallpaper()
        ])
        setSources(sourcesList)

        const defaultSource = defaultSourceObj?.value
        if (defaultSource && sourcesList.includes(defaultSource)) {
          setSelectedSource(defaultSource)
        } else if (sourcesList.length > 0) {
          setSelectedSource(sourcesList[0])
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        setStatus(`❌ Failed to load sources: ${message}`, 'red')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const handleFetch = async (): Promise<void> => {
    if (!selectedSource) {
      setStatus('⚠️ Please select a source first.', 'orange')
      return
    }

    setStatus(
      query.trim()
        ? `🔍 Fetching "${query}" from ${selectedSource}...`
        : `🎨 Fetching wallpaper from ${selectedSource}...`,
      'blue'
    )

    try {
      setIsLoading(true)
      await window.wallpaperAPI.fetchAndSet({
        source: selectedSource,
        query: query.trim() || ''
      })
      setStatus('✅ Wallpaper fetched successfully!', 'green')
      setQuery('')
      await fetchCurrentWallpaper()
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setStatus(`❌ Failed to fetch: ${message}`, 'red')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRandom = async (): Promise<void> => {
    setStatus('🎲 Fetching random wallpaper...', 'blue')
    try {
      setIsLoading(true)
      await window.wallpaperAPI.random.set({ [randomMode]: true })
      setStatus(`✅ Random wallpaper from ${randomMode} set successfully!`, 'green')
      await fetchCurrentWallpaper()
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setStatus(`❌ Failed to set random wallpaper: ${message}`, 'red')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <h2 style={{ marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>
        🏠 Home
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          {/* Source selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Source:
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
                backgroundColor: 'white',
                fontSize: '1rem'
              }}
              disabled={isLoading}
            >
              {sources.length === 0 ? (
                <option disabled>Loading...</option>
              ) : (
                sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Query input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Search Query:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Nature, space, etc. (optional)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '1rem'
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleFetch}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#007AFF',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
                disabled={isLoading}
              >
                🔍 Fetch
              </button>
            </div>
          </div>

          {/* Random wallpaper options */}
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '12px'
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>🎲 Random Options:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              {(['favorites', 'history', 'bookmarks', 'all'] as RandomMode[]).map((mode) => (
                <label
                  key={mode}
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="randomMode"
                    checked={randomMode === mode}
                    onChange={() => setRandomMode(mode)}
                    style={{ marginRight: '0.5rem' }}
                    disabled={isLoading}
                  />
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </label>
              ))}
            </div>
            <button
              onClick={handleRandom}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#34C759',
                color: 'white',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
              disabled={isLoading}
            >
              🎲 Set Random Wallpaper
            </button>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#f0f0f0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}
        >
          <h4 style={{ marginTop: 0, alignSelf: 'flex-start' }}>🖼️ Current Wallpaper</h4>
          {currentWallpaper ? (
            <div style={{ width: '100%', position: 'relative' }}>
              <img
                src={currentWallpaper.urls.small || currentWallpaper.urls.regular}
                alt="Current wallpaper preview"
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'block'
                }}
              />
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <div>
                  <strong>Source:</strong> {currentWallpaper.source}
                </div>
                <div>
                  <strong>Author:</strong> {currentWallpaper.author}
                </div>
                {currentWallpaper.tags && currentWallpaper.tags.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {currentWallpaper.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: '#e0e0e0',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          marginRight: '4px',
                          fontSize: '0.8rem'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ color: '#999', fontStyle: 'italic' }}>No wallpaper set yet</div>
          )}
        </div>
      </div>

      {/* Status */}
      {statusMessage && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor:
              statusColor === 'red' ? '#fee2e2' : statusColor === 'green' ? '#dcfce7' : '#e0f2fe',
            color:
              statusColor === 'red' ? '#991b1b' : statusColor === 'green' ? '#166534' : '#075985',
            border: `1px solid ${statusColor === 'red' ? '#fecaca' : statusColor === 'green' ? '#bbf7d0' : '#bae6fd'}`,
            textAlign: 'center',
            fontWeight: '500'
          }}
        >
          {statusMessage}
        </div>
      )}
    </div>
  )
}
