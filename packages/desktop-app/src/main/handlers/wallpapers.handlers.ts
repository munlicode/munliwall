import { getAndSetWallpaper, type FetchQuery } from '@munlicode/munliwall-core'
import { ipcMain } from 'electron'

export function registerWallpaperHandlers() {
  ipcMain.handle(
    'wallpaper:fetchAndSet',
    async (_event, { source, query }: { source: string; query: string }) => {
      const fetchQuery: FetchQuery = {
        source: source,
        query: query
      }

      try {
        const wallpaper = await getAndSetWallpaper(fetchQuery)

        console.log(`✅ Success! Set wallpaper from ${wallpaper.source}`)
        if (wallpaper.author) {
          console.log(`   Artist: ${wallpaper.author}`)
        }
        console.log(`   ID: ${wallpaper.id}`)

        return {
          success: true,
          message: `Set wallpaper ID ${wallpaper.id} from ${wallpaper.source}.`,
          wallpaper: {
            id: wallpaper.id,
            source: wallpaper.source,
            author: wallpaper.author || null
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred during wallpaper setting.'

        console.error(`❌ Wallpaper Fetch/Set Error: ${errorMessage}`, err)

        throw new Error(errorMessage)
      }
    }
  )
}
