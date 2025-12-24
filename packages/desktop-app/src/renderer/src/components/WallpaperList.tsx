import React, { useEffect, useState } from 'react'
import { Wallpaper } from '@munlicode/munliwall-core'
import { handleSet, WallpaperMode } from '../shared/wallpapers'
import { ConfirmModal } from './ConfirmModal'

interface WallpaperListProps {
  title: string
  defaultMode: WallpaperMode
  fetchItems: () => Promise<Wallpaper[]>
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

  const [items, setItems] = useState<Wallpaper[]>([])
  const [loading, setLoading] = useState(true)
  const [newId, setNewId] = useState('')
  const [mode] = useState<WallpaperMode>(defaultMode)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusColor, setStatusColor] = useState('blue')
  const [previews, setPreviews] = useState<Record<string, string | null>>({})
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

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type: 'danger' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  })

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
    const newPreviews: Record<string, string | null> = {}

    await Promise.all(
      data.map(async (item: Wallpaper) => {
        const [isCurrent, isFavorite, isBookmarked, cachedThumb] = await Promise.all([
          checkCurrent(item.id),
          checkFavorite(item.id),
          checkBookmarked(item.id),
          window.wallpaperAPI.cache.get(item.id)
        ])
        newStatuses[item.id] = { isCurrent, isFavorite, isBookmarked }
        // Fallback to remote URL if not in cache
        newPreviews[item.id] =
          cachedThumb || (item.urls ? item.urls.small || item.urls.regular : null)
      })
    )

    setItemStatus(newStatuses)
    setPreviews(newPreviews)
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
    setConfirmModal({
      isOpen: true,
      title: 'Remove Wallpaper',
      message: `Are you sure you want to remove ${id} from your ${title.toLowerCase()}?`,
      type: 'danger',
      onConfirm: async (): Promise<void> => {
        await onRemove(id)
        refresh()
      }
    })
  }

  const handleFavoriteToggle = async (id: string, isFav: boolean): Promise<void> => {
    const action = async (): Promise<void> => {
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

    if (isFav) {
      setConfirmModal({
        isOpen: true,
        title: 'Unfavorite',
        message: 'Remove this wallpaper from your favorites?',
        type: 'danger',
        onConfirm: action
      })
    } else {
      action()
    }
  }

  const handleBookmarkToggle = async (id: string, isBookmarked: boolean): Promise<void> => {
    const action = async () => {
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

    if (isBookmarked) {
      setConfirmModal({
        isOpen: true,
        title: 'Unbookmark',
        message: 'Remove this wallpaper from your bookmarks?',
        type: 'danger',
        onConfirm: action
      })
    } else {
      action()
    }
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {title}
      </h2>

      {allowAdd && (
        <div
          style={{
            marginBottom: '2rem',
            display: 'flex',
            gap: '0.5rem',
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '12px'
          }}
        >
          <input
            type="text"
            placeholder="Enter wallpaper ID (e.g. from Unsplash)"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            style={{
              padding: '0.75rem',
              flex: 1,
              borderRadius: '8px',
              border: '1px solid #ddd',
              outline: 'none'
            }}
          />
          <button
            onClick={handleAddClick}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0a66c2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ➕ Add to List
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#666' }}>⌛ Loading your wallpapers...</p>
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            background: '#f8f9fa',
            borderRadius: '12px'
          }}
        >
          <p style={{ color: '#666' }}>No wallpapers found in this category.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {items.map((item) => {
            const status = itemStatus[item.id] || {
              isCurrent: false,
              isFavorite: false,
              isBookmarked: false
            }
            const thumb = previews[item.id]

            return (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  border: status.isCurrent ? '2px solid #22c55e' : '1px solid #e5e7eb',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Image Preview */}
                <div
                  style={{
                    height: '160px',
                    background: '#eee',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.id}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        padding: '1rem'
                      }}
                    >
                      No preview available
                    </div>
                  )}
                  {status.isCurrent && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: '#22c55e',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      ACTIVE
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      display: 'flex',
                      gap: '4px'
                    }}
                  >
                    {status.isFavorite && <span title="Favorite">❤️</span>}
                    {status.isBookmarked && <span title="Bookmarked">🔖</span>}
                  </div>
                </div>

                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <code
                      style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        background: '#f3f4f6',
                        padding: '2px 4px',
                        borderRadius: '4px'
                      }}
                    >
                      {item.id}
                    </code>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      marginTop: 'auto'
                    }}
                  >
                    {!status.isCurrent && (
                      <button
                        onClick={() =>
                          handleSet(
                            item.id,
                            mode,
                            setStatusMessage,
                            setStatusColor,
                            setNewId,
                            refresh
                          )
                        }
                        style={{
                          gridColumn: 'span 2',
                          padding: '0.5rem',
                          background: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        🎨 Set as Wallpaper
                      </button>
                    )}

                    <button
                      onClick={() => handleFavoriteToggle(item.id, status.isFavorite)}
                      style={{
                        padding: '0.4rem',
                        background: status.isFavorite ? '#fee2e2' : '#f3f4f6',
                        color: status.isFavorite ? '#dc2626' : '#4b5563',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      {status.isFavorite ? 'Unfavorite' : '⭐ Favorite'}
                    </button>

                    <button
                      onClick={() => handleBookmarkToggle(item.id, status.isBookmarked)}
                      style={{
                        padding: '0.4rem',
                        background: status.isBookmarked ? '#dbeafe' : '#f3f4f6',
                        color: status.isBookmarked ? '#2563eb' : '#4b5563',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      {status.isBookmarked ? 'Unbookmark' : '🔖 Bookmark'}
                    </button>

                    {onRemove && (
                      <button
                        onClick={() => handleRemoveClick(item.id)}
                        style={{
                          gridColumn: 'span 2',
                          padding: '0.4rem',
                          background: 'transparent',
                          color: '#9ca3af',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          marginTop: '0.5rem'
                        }}
                      >
                        🗑️ Remove from List
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {statusMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background:
              statusColor === 'red' ? '#fee2e2' : statusColor === 'green' ? '#dcfce7' : 'white',
            color:
              statusColor === 'red' ? '#991b1b' : statusColor === 'green' ? '#166534' : '#1e3a8a',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            zIndex: 100,
            border: `1px solid ${statusColor === 'red' ? '#fecaca' : statusColor === 'green' ? '#bbf7d0' : '#e5e7eb'}`
          }}
        >
          {statusMessage}
        </div>
      )}
    </div>
  )
}
