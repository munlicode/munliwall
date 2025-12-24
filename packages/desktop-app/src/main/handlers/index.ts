import { registerBookmarksHandlers } from './bookmarks.handlers.js'
import { registerConfigHandlers } from './config.handlers.js'
import { registerCurrentWallpaperHandlers } from './currentWallpaper.handlers.js'
import { registerFavoritesHandlers } from './favorites.handlers.js'
import { registerHistoryHandlers } from './history.handlers.js'
import { registerRandomHandlers } from './random.handlers.js'
import { registerSetHandlers } from './set.handlers.js'
import { registerSourcesHandlers } from './sources.handlers.js'
import { registerWallpaperHandlers } from './wallpapers.handlers.js'
import { registerCacheHandlers } from './cache.handlers.js'

export function registerIPCHandlers(): void {
  registerWallpaperHandlers()
  registerBookmarksHandlers()
  registerConfigHandlers()
  registerFavoritesHandlers()
  registerHistoryHandlers()
  registerRandomHandlers()
  registerSetHandlers()
  registerSourcesHandlers()
  registerCurrentWallpaperHandlers()
  registerCacheHandlers()
}
