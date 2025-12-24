import { imageSize } from 'image-size'
import * as fs from 'fs'
export * from './types.js'

export {
  addFavorite,
  getFavorites,
  removeFavorite,
  isFavorite,
  addBookmark,
  getBookmarks,
  removeBookmark,
  isBookmarked,
  addToHistory,
  getHistory,
  clearHistory,
  getCurrentWallpaper,
  deleteHistoryById
} from './database.js'
export { sourceRegistry } from './sources/index.js'
export {
  setCustomDataPath,
  getDataPath,
  getSettings,
  getSetting,
  setSetting,
  settingsMeta,
  getDefaultSettings,
  type Settings,
  type SettingMeta,
  type SettingInstance
} from './config.js'
export {
  startWallpaperService,
  stopWallpaperService,
  restartWallpaperService
} from './scheduler.js'

import {
  addToHistory,
  getBookmarks,
  getFavorites,
  getHistory,
  getCurrentWallpaper
} from './database.js'
import { getScreenResolution, selectOptimalUrl } from './resolution.js'
import { resolveWallpaper } from './sources/index.js'
import { downloadImage, setWallpaper } from './system.js'
import { FetchQuery, Wallpaper } from './types.js'
import { tmpdir } from 'os'
import { join } from 'path'
import { getDataPath } from './config.js'

const dataPath = getDataPath()
const FINAL_WALLPAPER_PATH = join(dataPath, 'current.jpg')

/**
 * The main end-to-end function.
 * It handles fetching, downloading, and setting the wallpaper.
 */
export async function getAndSetWallpaper(query: FetchQuery): Promise<Wallpaper> {
  let wallpaper: Wallpaper | null = null
  let finalLocalPath: string | null = null
  let screenResolution: { width: number; height: number } | null = null

  // 0. Get the current wallpaper to prevent setting the same one consecutively
  const currentWallpaper = await getCurrentWallpaper()
  console.log(`Current wallpaper ID: ${currentWallpaper?.id}`)

  // 1. Try to get the screen resolution, but fail gracefully
  try {
    screenResolution = await getScreenResolution()
    if (screenResolution) {
      console.log(
        `🔎 Found screen resolution: ${screenResolution.width}x${screenResolution.height}`
      )
    }
  } catch {
    console.warn('Could not detect screen resolution. Will accept first image found.')
  }
  const MAX_ATTEMPTS = 10
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    console.log(`Attempt ${i + 1}/${MAX_ATTEMPTS} to find suitable wallpaper...`)

    const candidate = await resolveWallpaper(query)

    // Check if this candidate is the same as the current one
    if (currentWallpaper && candidate.id === currentWallpaper.id) {
      console.log(`♻️ Candidate ${candidate.id} is the same as current. Retrying...`)
      continue
    }
    const tempCandidatePath = join(tmpdir(), `wallpaper-check-${Date.now()}-${candidate.id}.jpg`)
    let candidatePathForCleanup: string | null = tempCandidatePath
    let dimensions: { width: number; height: number } | undefined

    try {
      // 1. Download the image to the TEMP path
      const optimalUrl = await selectOptimalUrl(candidate)

      if (optimalUrl.startsWith('file://')) {
        const localPath = decodeURIComponent(optimalUrl.replace('file://', ''))
        // If it's already local, we can just copy it to the temp path for checks
        fs.copyFileSync(localPath, tempCandidatePath)
      } else {
        await downloadImage(optimalUrl, tempCandidatePath) // Pass the temp path
      }

      // 2. Read the file from the TEMP path
      const imageBuffer = fs.readFileSync(tempCandidatePath)

      // 3. Pass the buffer to imageSize
      const size = imageSize(imageBuffer)

      if (size.width && size.height) {
        dimensions = { width: size.width, height: size.height }
        // IMPORTANT: Update the wallpaper object with the real dimensions
        candidate.width = size.width
        candidate.height = size.height
      } else {
        throw new Error('image-size could not read dimensions from file.')
      }

      // 3. If no screen res, we must accept this one.
      if (!screenResolution) {
        console.log('No screen resolution detected. Accepting first image.')
        wallpaper = candidate
        // --- KEY CHANGE 2: Move the good file to the FINAL path ---
        fs.renameSync(tempCandidatePath, FINAL_WALLPAPER_PATH)
        finalLocalPath = FINAL_WALLPAPER_PATH
        candidatePathForCleanup = null // Don't delete this file!
        break // Exit loop
      }

      // 4. The main check
      const resolutionMargin = 0.5

      const minRequiredWidth = screenResolution.width * resolutionMargin
      const minRequiredHeight = screenResolution.height * resolutionMargin

      // Check 1: Ensure it's a landscape image (width > height)
      if (dimensions.width < dimensions.height) {
        console.log(
          `❌ Image ${candidate.id} is portrait (${dimensions.width}x${dimensions.height}). Retrying...`
        )
        continue // Skip this image
      }

      // Check 2: Ensure it meets minimum screen resolution
      if (dimensions.width < minRequiredWidth || dimensions.height < minRequiredHeight) {
        console.log(
          `❌ Image ${candidate.id} is too small (${dimensions.width}x${dimensions.height}). Retrying...`
        )
        continue // Skip this image
      }
      // 5. If we're here, the image passed all checks!
      console.log(
        `✅ Found suitable image: ${candidate.id} (${dimensions.width}x${dimensions.height})`
      )
      wallpaper = candidate

      // --- Move the good file to the FINAL path ---
      fs.renameSync(tempCandidatePath, FINAL_WALLPAPER_PATH)
      finalLocalPath = FINAL_WALLPAPER_PATH // Set the FINAL path
      candidatePathForCleanup = null // Don't delete the file we just moved!
      break // Exit loop
    } catch (err) {
      console.error(`Attempt ${i + 1} failed during download/check.`, err)
    }

    // 6. Clean up the small/failed image file
    if (candidatePathForCleanup) {
      try {
        fs.unlinkSync(candidatePathForCleanup)
      } catch (unlinkErr) {
        console.error(`Failed to delete temp file: ${candidatePathForCleanup}`, unlinkErr)
      }
    }
  } // --- End of loop ---
  // 7. Check if the loop failed completely
  if (!wallpaper || !finalLocalPath) {
    throw new Error(
      `Failed to find a wallpaper with suitable resolution after ${MAX_ATTEMPTS} attempts.`
    )
  }

  // 8. Set the wallpaper and save to history
  await setWallpaper(finalLocalPath)
  await addToHistory(wallpaper)

  console.log(`Successfully set wallpaper from: ${wallpaper.source}`)
  return wallpaper
}
/**
 * A generic helper to find a wallpaper by ID from a list,
 * download it, and set it as the background.
 */
export async function setWallpaperFromList(
  id: string,
  wallpaperList: Wallpaper[],
  listName: string // For logging (e.g., "History", "Bookmarks")
): Promise<void> {
  console.log(`Searching ${listName} for ID: ${id}...`)

  const wallpaper = wallpaperList.find((item) => item.id === id)

  // --- 1. Find the wallpaper ---
  if (!wallpaper) {
    console.error(`❌ Wallpaper with ID '${id}' not found in ${listName}.`)
    return
  }

  // --- 2. Get the URL ---
  // Use the best URL you have, probably 'full' or 'raw'
  const url = wallpaper.urls?.full
  if (!url) {
    console.error(`❌ Wallpaper ${id} (from ${listName}) has no URL to download.`)
    return
  }

  try {
    // --- 3. Download it to the FINAL path ---
    // Since we *know* this is the image we want, we can
    // download it directly to the final destination.
    console.log(`Downloading from ${url}...`)
    await downloadImage(url, FINAL_WALLPAPER_PATH)

    // --- 4. Set the wallpaper ---
    // Now tell the OS to use the file we just downloaded.
    console.log('Setting wallpaper...')
    await setWallpaper(FINAL_WALLPAPER_PATH)

    await addToHistory(wallpaper)
    console.log(`✅ Successfully set wallpaper ${id} from ${listName}.`)
    console.log(`   Source: ${wallpaper.source || 'Unknown'}`)
  } catch (err) {
    console.error(`Failed to download or set wallpaper ${id}.`, err)
  }
}
/**
 * Get random Wallpaper from selected mode
 * @param mode
 * @returns
 */
export async function randomWallpaper(mode: string): Promise<void> {
  const sources = {
    favorites: await getFavorites(),
    history: await getHistory(),
    bookmarks: await getBookmarks()
  }

  let wallpapers: Wallpaper[] = []

  if (mode === 'favorites') wallpapers = sources.favorites
  else if (mode === 'history') wallpapers = sources.history
  else if (mode === 'bookmarks') wallpapers = sources.bookmarks
  else wallpapers = [...sources.favorites, ...sources.history, ...sources.bookmarks]

  // Remove duplicates — assuming paths are unique
  const unique = Array.from(new Set(wallpapers))

  if (unique.length === 0) {
    console.log('No wallpapers found in this category.')
    return
  }

  const random = unique[Math.floor(Math.random() * unique.length)]
  await setWallpaperFromList(random.id, wallpapers, mode)
  console.log(`🎨 Wallpaper set: ${random.id}`)
}
