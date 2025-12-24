import { ipcMain } from 'electron'
import { getCachedImagePath } from '@munlicode/munliwall-core'
import fsp from 'fs/promises'
import path from 'path'

export function registerCacheHandlers(): void {
  ipcMain.handle('wallpaper:cache:get', async (_event, id: string) => {
    const filePath = await getCachedImagePath(id)
    if (!filePath) return null

    try {
      const buffer = await fsp.readFile(filePath)
      const ext = path.extname(filePath).slice(1) || 'jpg'
      return `data:image/${ext};base64,${buffer.toString('base64')}`
    } catch (e) {
      console.error('Failed to read cached image:', e)
      return null
    }
  })
}
