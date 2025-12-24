import { ipcMain } from 'electron'
import { getCachedImagePath } from '@munlicode/munliwall-core'
import fsp from 'fs/promises'
import path from 'path'
import { registerBookmarksHandlers } from './bookmarks.handlers.js'
import { registerConfigHandlers } from './config.handlers.js'
import { registerCurrentWallpaperHandlers } from './currentWallpaper.handlers.js'
import { registerFavoritesHandlers } from './favorites.handlers.js'
import { registerHistoryHandlers } from './history.handlers.js'
import { registerRandomHandlers } from './random.handlers.js'
import { registerSetHandlers } from './set.handlers.js'
import { registerSourcesHandlers } from './sources.handlers.js'
import { registerWallpaperHandlers } from './wallpapers.handlers.js'

export function registerIPCHandlers(): void {
  console.log('📡 Registering IPC Handlers...')

  registerWallpaperHandlers()
  registerBookmarksHandlers()
  registerConfigHandlers()
  registerFavoritesHandlers()
  registerHistoryHandlers()
  registerRandomHandlers()
  registerSetHandlers()
  registerSourcesHandlers()
  registerCurrentWallpaperHandlers()

  // Inline cache handler to verify it's registered
  console.log('📡 Registering wallpaper:cache:get handler...')
  ipcMain.handle('wallpaper:cache:get', async (_event, id: string) => {
    console.log(`🔍 IPC: wallpaper:cache:get (id=${id})`)
    try {
      const filePath = await getCachedImagePath(id)
      if (!filePath) {
        console.log(`⚠️ Cache MISS: ${id}`)
        return null
      }

      const buffer = await fsp.readFile(filePath)
      const ext = path.extname(filePath).slice(1) || 'jpg'
      console.log(`✅ Cache HIT: ${id} (${buffer.length} bytes)`)
      return `data:image/${ext};base64,${buffer.toString('base64')}`
    } catch (e) {
      console.error('❌ Failed to read cached image:', e)
      return null
    }
  })
}
