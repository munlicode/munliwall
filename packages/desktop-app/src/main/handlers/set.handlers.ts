import {
  getBookmarks,
  getFavorites,
  getHistory,
  setWallpaperFromList
} from '@munlicode/munliwall-core'
import { ipcMain } from 'electron'

export function registerSetHandlers() {
  ipcMain.handle('wallpaper:set:history', async (_event, id) => {
    const history = await getHistory()
    await setWallpaperFromList(id, history, 'History')
  })

  ipcMain.handle('wallpaper:set:bookmark', async (_event, id) => {
    const bookmarks = await getBookmarks()
    await setWallpaperFromList(id, bookmarks, 'Bookmarks')
  })

  ipcMain.handle('wallpaper:set:favorite', async (_event, id) => {
    const favorites = await getFavorites()
    await setWallpaperFromList(id, favorites, 'Favorites')
  })
}
