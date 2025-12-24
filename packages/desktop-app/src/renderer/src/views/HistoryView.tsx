import { WallpaperList } from '../components/WallpaperList'

export const HistoryView = () => (
  <WallpaperList
    title="🕘 History"
    defaultMode="history"
    fetchItems={window.wallpaperAPI.history.list}
    onRemove={window.wallpaperAPI.history.delete}
    checkIsBookmarked={window.wallpaperAPI.bookmarks.check}
    checkIsCurrent={window.wallpaperAPI.current.check}
    checkIsFavorite={window.wallpaperAPI.favorites.check}
  />
)
