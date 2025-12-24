import { Wallpaper, Settings, SettingMeta, SettingInstance } from '@munlicode/munliwall-core'
import { RandomOptions } from '../main/handlers/random.handlers'

export interface BookmarksAPI {
  list: () => Promise<Wallpaper[]>
  add: (id: string) => Promise<Wallpaper>
  remove: (id: string) => Promise<void>
  check: (id: string) => Promise<boolean>
}

export interface ConfigAPI {
  show: () => Promise<SettingInstance<SettingMeta>[]>
  get: <K extends keyof Settings>(key: K) => Promise<{ key: K; value: Settings[K] }>
  set: (key: string, value: unknown) => Promise<{ success: boolean }>
}

export interface FavoritesAPI {
  list: () => Promise<Wallpaper[]>
  add: (id: string) => Promise<Wallpaper>
  remove: (id: string) => Promise<void>
  check: (id: string) => Promise<boolean>
}

export interface HistoryAPI {
  list: () => Promise<Wallpaper[]>
  clear: () => Promise<void>
  delete: (id: string) => Promise<void>
}

export interface RandomAPI {
  set: (
    options?: RandomOptions
  ) => Promise<{ success: boolean; message: string; wallpaper?: Wallpaper }>
}

export interface SetAPI {
  history: (id: string) => Promise<void>
  bookmark: (id: string) => Promise<void>
  favorite: (id: string) => Promise<void>
}

export interface SourcesAPI {
  list: () => Promise<string[]>
}
export interface CacheAPI {
  get: (id: string) => Promise<string | null>
}
export interface currentWallpaper {
  get: () => Promise<Wallpaper | null>
  id: () => Promise<string | undefined>
  check: (id: string) => Promise<boolean>
}

/**
 * Defines the complete API exposed to the Renderer.
 */
export interface IpcRendererApi {
  bookmarks: BookmarksAPI
  config: ConfigAPI
  favorites: FavoritesAPI
  history: HistoryAPI
  random: RandomAPI
  set: SetAPI
  sources: SourcesAPI
  fetchAndSet: (query: { source: string; query: string }) => Promise<Wallpaper>
  current: currentWallpaper
  cache: CacheAPI
}
