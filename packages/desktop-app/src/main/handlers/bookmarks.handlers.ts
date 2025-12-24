import { addBookmark, getBookmarks, isBookmarked, removeBookmark } from '@munlicode/munliwall-core'
import { ipcMain } from 'electron'
import { handleAddActionLogic } from './shared.utils'

export function registerBookmarksHandlers() {
  ipcMain.handle('wallpaper:bookmarks:list', async () => {
    return await getBookmarks()
  })

  ipcMain.handle('wallpaper:bookmarks:add', async (_event, id?: string) => {
    return await handleAddActionLogic(addBookmark, id)
  })

  ipcMain.handle('wallpaper:bookmarks:remove', async (_event, id) => {
    return await removeBookmark(id)
  })

  ipcMain.handle('wallpaper:bookmarks:check', async (_event, id: string) => {
    const isBoked = await isBookmarked(id)
    return isBoked
  })
}
