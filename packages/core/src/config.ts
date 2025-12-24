import Conf from 'conf'
import { homedir } from 'os'
import { join, dirname, resolve } from 'path'
import fs from 'fs'
import fsp from 'fs/promises'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { AppData, FetchQuery } from './types.js'
import { sourceRegistry } from './sources/index.js'
import { restartWallpaperService } from './scheduler.js'

export interface Settings {
  dataPath: string
  defaultSource: string
  historyLength: number
  autoChangeInterval: number // (in minutes, 0 to disable)
  autoChangeQuery: FetchQuery
  imageQuality: 'auto' | 'raw' | 'full' | 'regular' | 'small'
}

const defaults: Settings = {
  // Default path for the db.json and downloaded images
  dataPath: join(homedir(), '.wallpaper-tool'),
  defaultSource: 'nekos',
  historyLength: 50,
  autoChangeInterval: 0,
  autoChangeQuery: { source: 'nekos', query: 'random' },
  imageQuality: 'auto'
}
type SettingValueType<U extends SettingMeta['type']> = U extends 'string'
  ? string
  : U extends 'number'
    ? number
    : U extends 'boolean'
      ? boolean
      : U extends 'object'
        ? Record<string, unknown>
        : unknown

interface SettingMetaBase {
  description: string
  type: 'string' | 'number' | 'boolean' | 'object'
  choices?: string[]
  key?: string
}

interface ObjectSettingMeta extends SettingMetaBase {
  type: 'object'
  properties: Record<string, SettingMeta>
}

export type SettingMeta = SettingMetaBase | ObjectSettingMeta
type SettingsMetaMap = Record<keyof Settings, SettingMeta>
/**
 * Represents a concrete instance of a setting, combining its structural metadata
 * with its live runtime value and unique key.
 */
export type SettingInstance<T extends SettingMeta> = T & {
  key: string

  currentValue: SettingValueType<T['type']>
  defaultValue: SettingValueType<T['type']>
}

export const settingsMeta: SettingsMetaMap = {
  dataPath: {
    description: 'Path to the wallpaper database file',
    type: 'string'
  },
  defaultSource: {
    description: 'Default image source to fetch wallpapers from',
    type: 'string',
    choices: Array.from(sourceRegistry.keys())
  },
  historyLength: {
    description: 'Maximum number of wallpapers to keep in history',
    type: 'number'
  },
  autoChangeInterval: {
    description: 'Automatically change wallpaper every N minutes (0 to disable)',
    type: 'number'
  },
  autoChangeQuery: {
    description: 'Default source and query for automatic wallpaper changes',
    type: 'object',
    properties: {
      source: {
        description: 'Wallpaper source for auto changes',
        type: 'string',
        choices: ['unsplash', 'nekos', 'wallhaven']
      },
      query: { description: 'Search keyword or mood for auto changes', type: 'string' }
    }
  },
  imageQuality: {
    description: 'The image quality to fetch',
    type: 'string',
    choices: ['auto', 'raw', 'full', 'regular', 'small']
  }
}

export const config = new Conf<Settings>({
  projectName: 'wallpaper-tool',
  defaults: defaults
})

// Define the default structure for a new database
export const defaultData: AppData = {
  favorites: [],
  history: [],
  bookmarks: []
}

export let db: Low<AppData> | null = null

export function getDataPath(): string {
  return config.get('dataPath')
}

/**
 * Ensures the database is loaded from the file.
 * Call this before any db operation.
 */
export async function getDb(): Promise<Low<AppData>> {
  if (db === null) {
    const dataPath = getDataPath()
    const dbPath = join(dataPath, 'db.json')
    const dbDir = dirname(dbPath)

    try {
      await fsp.mkdir(dbDir, { recursive: true })
    } catch (e) {
      console.error('Failed to create database directory:', e)
      throw e
    }

    const adapter = new JSONFile<AppData>(dbPath)

    db = new Low(adapter, defaultData)
  }

  await db.read()

  return db
}

/**
 * Updates the data path, moves the existing database file,
 * and forces LowDB to reload from the new location on next access.
 */
export async function setCustomDataPath(newPath: string): Promise<void> {
  if (!newPath || newPath.trim() === '') {
    console.error('Error: New path cannot be empty.')
    return
  }

  const oldPath = config.get('dataPath') as string
  // Resolve to an absolute path for consistency
  const resolvedNewPath = resolve(newPath)

  if (oldPath === resolvedNewPath) {
    console.log('Path is already set to this location.')
    return
  }

  try {
    // Get the new directory and create it if it doesn't exist.
    const newDir = dirname(resolvedNewPath)
    if (!fs.existsSync(newDir)) {
      console.log(`Creating new directory: ${newDir}`)
      fs.mkdirSync(newDir, { recursive: true })
    }

    // Force-save any pending changes to the old DB file.
    if (db) {
      console.log('Writing pending changes to old database...')
      await db.write()
    }

    // Move the database file from old to new location.
    if (fs.existsSync(oldPath)) {
      console.log(`Moving database from ${oldPath} to ${resolvedNewPath}`)
      fs.renameSync(oldPath, resolvedNewPath)
    } else {
      console.log('No existing database file found to move.')
    }

    // Update the config store with the new path
    config.set('dataPath', resolvedNewPath)

    // Invalidate the current DB instance.
    db = null

    console.log(`✅ Data path successfully updated to: ${resolvedNewPath}`)
    console.log('Database will reload from new path on next access.')
  } catch (err) {
    if (err instanceof Error) {
      console.error(`❌ Error setting new data path: ${err.message}`)
    } else {
      console.error('❌ An unknown error occurred while setting new data path.', err)
    }

    // NOTE: A more robust solution might try to roll back the changes (e.g., move file back, set config back) if any step fails.
  }
}
export function getDefaultSettings(): Settings {
  return defaults
}
export function getSettings(): Conf<Settings> {
  return config
}

export function getSetting<K extends keyof Settings>(key: K): Settings[K] {
  return config.get(key)
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  config.set(key, value)
  restartWallpaperService()
}

export function getHistoryLength(): number {
  return config.get('historyLength')
}

export function setHistoryLength(length: number): void {
  config.set('historyLength', length > 0 ? length : 0) // Add validation
}
export function getImageQuality(): Settings['imageQuality'] {
  return config.get('imageQuality')
}
export function getAutoChangeInterval(): Settings['autoChangeInterval'] {
  return config.get('autoChangeInterval')
}

export function getAutoChangeQuery(): FetchQuery {
  return config.get('autoChangeQuery')
}
