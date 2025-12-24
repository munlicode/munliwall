import { getHistory, clearHistory, deleteHistoryById } from '@munlicode/munliwall-core'
import { ipcMain } from 'electron'

export function registerHistoryHandlers() {
  ipcMain.handle('wallpaper:history:list', async () => {
    return await getHistory()
  })

  ipcMain.handle('wallpaper:history:clear', async () => {
    return await clearHistory()
  })

  ipcMain.handle('wallpaper:history:delete', async (_event, id: string) => {
    return await deleteHistoryById(id)
  })
}
