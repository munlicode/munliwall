import React from 'react'
import { WallpaperList } from '../components/WallpaperList'

export const FavoritesView: React.FC = () => {
  return (
    <WallpaperList
      title="♡ Favorites"
      defaultMode="favorite"
      fetchItems={window.wallpaperAPI.favorites.list}
      onAdd={window.wallpaperAPI.favorites.add}
      onRemove={window.wallpaperAPI.favorites.remove}
      allowAdd
      checkIsBookmarked={window.wallpaperAPI.bookmarks.check}
      checkIsCurrent={window.wallpaperAPI.current.check}
      checkIsFavorite={window.wallpaperAPI.favorites.check}
    />
  )
}
