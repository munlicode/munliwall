import React, { useEffect, useState } from 'react'
import { handleSet, WallpaperMode } from '../shared/wallpapers'

interface WallpaperListProps {
  title: string
  defaultMode: WallpaperMode
  fetchItems: () => Promise<{ id: string }[]>
  onRemove?: (id: string) => Promise<void>
  allowAdd?: boolean
  onAdd?: (id: string) => Promise<unknown>
  checkIsCurrent?: boolean | ((id: string) => Promise<boolean>)
  checkIsFavorite?: boolean | ((id: string) => Promise<boolean>)
  checkIsBookmarked?: boolean | ((id: string) => Promise<boolean>)
}

export const WallpaperList: React.FC<WallpaperListProps> = ({
  title,
  defaultMode,
  fetchItems,
  onRemove,
  allowAdd = false,
  onAdd,
  checkIsCurrent = async () => false,
  checkIsFavorite = async () => false,
  checkIsBookmarked = async () => false
}) => {
  const normalize = (
    val: boolean | ((id: string) => Promise<boolean>)
  ): ((id: string) => Promise<boolean>) => (typeof val === 'function' ? val : async () => !!val)

  const checkCurrent = normalize(checkIsCurrent)
  const checkFavorite = normalize(checkIsFavorite)
  const checkBookmarked = normalize(checkIsBookmarked)

  const [items, setItems] = useState<{ id: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [newId, setNewId] = useState('')
  const [mode] = useState<WallpaperMode>(defaultMode)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusColor, setStatusColor] = useState('blue')
  const [itemStatus, setItemStatus] = useState<
    Record<
      string,
      {
        isCurrent: boolean
        isFavorite: boolean
        isBookmarked: boolean
      }
    >
  >({})

  const setStatus = (msg: string, color?: string): void => {
    setStatusMessage(msg)
    if (color) setStatusColor(color)
  }

  const refresh = React.useCallback(async (): Promise<void> => {
    setLoading(true)
    const data = await fetchItems()
    const newStatuses: Record<
      string,
      { isCurrent: boolean; isFavorite: boolean; isBookmarked: boolean }
    > = {}

    await Promise.all(
      data.map(async (item) => {
        const [isCurrent, isFavorite, isBookmarked] = await Promise.all([
          checkCurrent(item.id),
          checkFavorite(item.id),
          checkBookmarked(item.id)
        ])
        newStatuses[item.id] = { isCurrent, isFavorite, isBookmarked }
      })
    )

    setItemStatus(newStatuses)
    setItems(data)
    setLoading(false)
  }, [fetchItems, checkCurrent, checkFavorite, checkBookmarked])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const handleAddClick = async (): Promise<void> => {
    if (!onAdd || !newId.trim()) return
    await onAdd(newId)
    setNewId('')
    refresh()
  }

  const handleRemoveClick = async (id: string): Promise<void> => {
    if (!onRemove) return
    await onRemove(id)
    refresh()
  }

  const handleFavoriteToggle = async (id: string, isFav: boolean): Promise<void> => {
    try {
      setStatus(`${isFav ? 'Removing' : 'Adding'} favorite...`)
      if (isFav) await window.wallpaperAPI.favorites.remove(id)
      else await window.wallpaperAPI.favorites.add(id)
      setStatus(isFav ? 'Removed from favorites.' : 'Added to favorites.', 'green')
      await refresh()
    } catch (e) {
      setStatus('Failed to toggle favorite.', 'red')
      console.error(e)
    }
  }

  const handleBookmarkToggle = async (id: string, isBookmarked: boolean): Promise<void> => {
    try {
      setStatus(`${isBookmarked ? 'Removing' : 'Adding'} bookmark...`)
      if (isBookmarked) await window.wallpaperAPI.bookmarks.remove(id)
      else await window.wallpaperAPI.bookmarks.add(id)
      setStatus(isBookmarked ? 'Removed from bookmarks.' : 'Added to bookmarks.', 'green')
      await refresh()
    } catch (e) {
      setStatus('Failed to toggle bookmark.', 'red')
      console.error(e)
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>{title}</h2>

      {allowAdd && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Enter wallpaper ID"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            style={{ padding: '0.5rem', marginRight: '0.5rem' }}
          />
          <button onClick={handleAddClick}>Add</button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No wallpapers found.</p>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {items.map((item) => {
            const status = itemStatus[item.id] || {
              isCurrent: false,
              isFavorite: false,
              isBookmarked: false
            }

            return (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #ddd',
                  padding: '0.5rem 0'
                }}
              >
                <span>
                  <strong>ID:</strong> {item.id}
                  {status.isCurrent && (
                    <span style={{ marginLeft: '0.5rem', color: 'green', fontWeight: 'bold' }}>
                      ✅ Current
                    </span>
                  )}
                  {status.isFavorite && (
                    <span style={{ marginLeft: '0.5rem', color: 'red' }}>❤️</span>
                  )}
                  {status.isBookmarked && (
                    <span style={{ marginLeft: '0.5rem', color: 'blue' }}>🔖</span>
                  )}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!status.isCurrent && (
                    <button
                      onClick={() =>
                        handleSet(item.id, mode, setStatusMessage, setStatusColor, setNewId)
                      }
                    >
                      🎨 Set
                    </button>
                  )}

                  {/* Toggle favorite */}
                  <button
                    onClick={() => handleFavoriteToggle(item.id, status.isFavorite)}
                    style={{ color: status.isFavorite ? 'red' : 'inherit' }}
                  >
                    {status.isFavorite ? 'Remove Fav' : '⭐ Add Fav'}
                  </button>

                  {/* Toggle bookmark */}
                  <button
                    onClick={() => handleBookmarkToggle(item.id, status.isBookmarked)}
                    style={{ color: status.isBookmarked ? 'blue' : 'inherit' }}
                  >
                    {status.isBookmarked ? 'Remove Bookmark' : '🔖 Add Bookmark'}
                  </button>

                  {onRemove && (
                    <button onClick={() => handleRemoveClick(item.id)}>❌ Remove</button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p style={{ color: statusColor, marginTop: '1rem' }}>{statusMessage}</p>
    </div>
  )
}
