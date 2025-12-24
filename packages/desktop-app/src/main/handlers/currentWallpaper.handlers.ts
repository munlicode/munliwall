import { getCurrentWallpaper } from '@munlicode/munliwall-core'
import { ipcMain } from 'electron'

export function registerCurrentWallpaperHandlers(): void {
  ipcMain.handle('wallpaper:current:get', async () => {
    return await getCurrentWallpaper()
  })
  ipcMain.handle('wallpaper:current:id', async () => {
    const current = await getCurrentWallpaper()
    return current?.id
  })
  ipcMain.handle('wallpaper:current:check', async (_event, id: string) => {
    const current = await getCurrentWallpaper()
    return id === current?.id
  })
}
