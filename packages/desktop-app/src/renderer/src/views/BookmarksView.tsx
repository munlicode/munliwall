import React from 'react'
import { WallpaperList } from '../components/WallpaperList'

export const BookmarksView: React.FC = () => {
  return (
    <WallpaperList
      title="🔖 Bookmarks"
      defaultMode="bookmark"
      fetchItems={window.wallpaperAPI.bookmarks.list}
      onAdd={window.wallpaperAPI.bookmarks.add}
      onRemove={window.wallpaperAPI.bookmarks.remove}
      allowAdd
      checkIsBookmarked={window.wallpaperAPI.bookmarks.check}
      checkIsCurrent={window.wallpaperAPI.current.check}
      checkIsFavorite={window.wallpaperAPI.favorites.check}
    />
  )
}
