import { join } from 'path'
import fs from 'fs'
import fsp from 'fs/promises'
import { getDataPath } from './config.js'

export function getCacheDir(): string {
  const dataPath = getDataPath()
  return join(dataPath, 'cache')
}

export async function ensureCacheDir(): Promise<void> {
  const cacheDir = getCacheDir()
  if (!fs.existsSync(cacheDir)) {
    await fsp.mkdir(cacheDir, { recursive: true })
  }
}

export async function getCachedImagePath(id: string): Promise<string | null> {
  const cacheDir = getCacheDir()
  const filePath = join(cacheDir, `${id}.jpg`)
  if (fs.existsSync(filePath)) {
    return filePath
  }
  return null
}

export async function cacheImage(id: string, sourcePath: string): Promise<string> {
  await ensureCacheDir()
  const cacheDir = getCacheDir()
  const destinationPath = join(cacheDir, `${id}.jpg`)

  // Only copy if it doesn't already exist or if we want to overwrite
  if (sourcePath !== destinationPath) {
    await fsp.copyFile(sourcePath, destinationPath)
  }

  return destinationPath
}

export async function cleanupCache(validIds: string[]): Promise<void> {
  const cacheDir = getCacheDir()
  if (!fs.existsSync(cacheDir)) return

  const files = await fsp.readdir(cacheDir)
  const validFileNames = new Set(validIds.map((id) => `${id}.jpg`))

  await Promise.all(
    files.map((file) => {
      if (!validFileNames.has(file)) {
        return fsp.unlink(join(cacheDir, file)).catch((err) => {
          console.error(`Failed to delete unused cache file ${file}:`, err)
        })
      }
      return Promise.resolve()
    })
  )
}
