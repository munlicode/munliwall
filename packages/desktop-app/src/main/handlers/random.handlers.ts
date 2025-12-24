import { randomWallpaper } from '@munlicode/munliwall-core'
import { ipcMain } from 'electron'

export interface RandomOptions {
  favorites?: boolean
  history?: boolean
  bookmarks?: boolean
  all?: boolean
}

export function registerRandomHandlers() {
  ipcMain.handle('wallpaper:random:set', async (_event, options: RandomOptions) => {
    const mode =
      (options.favorites && 'favorites') ||
      (options.history && 'history') ||
      (options.bookmarks && 'bookmarks') ||
      'all' // Default mode

    const activeModes = [options.favorites, options.history, options.bookmarks, options.all].filter(
      Boolean
    ).length
    if (activeModes > 1) {
      throw new Error(
        'Only one mode (favorites, history, bookmarks, or all) can be selected for random wallpaper.'
      )
    }

    console.log(`Setting random wallpaper from mode: ${mode}`)

    try {
      const result = await randomWallpaper(mode)

      const successMessage = `Wallpaper successfully set from ${mode}.`
      console.log(`✅ ${successMessage}`)

      return {
        success: true,
        message: successMessage,
        wallpaper: result // Return the wallpaper object if your core does
      }
    } catch (err) {
      // Handle Error for Electron (NO process.exitCode = 1)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while setting random wallpaper.'

      console.error('❌ Failed to set random wallpaper:', err)

      throw new Error(errorMessage)
    }
  })
}
