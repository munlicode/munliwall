import { sourceRegistry } from '@munlicode/munliwall-core'
import { ipcMain } from 'electron'

export function registerSourcesHandlers() {
  ipcMain.handle('wallpaper:sources:list', async (_event) => {
    return Array.from(sourceRegistry.keys())
  })
}
