import { addFavorite, getFavorites, removeFavorite, isFavorite } from '@munlicode/munliwall-core'
import { ipcMain } from 'electron'
import { handleAddActionLogic } from './shared.utils'

export function registerFavoritesHandlers() {
  ipcMain.handle('wallpaper:favorites:list', async () => {
    return await getFavorites()
  })

  ipcMain.handle('wallpaper:favorites:add', async (_event, id?: string) => {
    return await handleAddActionLogic(addFavorite, id)
  })

  ipcMain.handle('wallpaper:favorites:remove', async (_event, id) => {
    return await removeFavorite(id)
  })

  ipcMain.handle('wallpaper:favorites:check', async (_event, id: string) => {
    const isFav = await isFavorite(id)
    return isFav
  })
}
