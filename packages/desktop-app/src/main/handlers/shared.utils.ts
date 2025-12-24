import { getCurrentWallpaper, Wallpaper } from '@munlicode/munliwall-core'

type CoreActionFunction = (id: string) => Promise<Wallpaper>

/**
 * Resolves ID or 'current' flag and calls the core action.
 */
export async function handleAddActionLogic(coreAction: CoreActionFunction, id?: string) {
  let wallpaperId: string

  if (id) {
    // Use the provided ID
    wallpaperId = id
  } else {
    // Fallback: get current wallpaper
    const currentWallpaper = await getCurrentWallpaper()
    if (!currentWallpaper?.id) {
      throw new Error('No wallpaper ID provided and no current wallpaper found.')
    }
    wallpaperId = currentWallpaper.id
  }

  return await coreAction(wallpaperId)
}
