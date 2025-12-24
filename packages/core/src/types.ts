/**
 * Represents a single wallpaper.
 */
export interface Wallpaper {
  id: string // A unique ID (e.g., from Unsplash or a generated hash)
  urls: {
    raw: string
    full: string
    regular: string
    small: string
  }
  source: string // e.g., "Unsplash", "URL", "Local"
  author?: string // Name of the creator
  tags?: string[] // Any tags for sorting (e.g., "nature", "dark", "moody")
  width: number
  height: number
}
export type WallpaperError = {
  success: false
  error: string
}
export type WallpaperResult = Wallpaper | WallpaperError

/**
 * Defines the shape of your local database file.
 */
export interface AppData {
  favorites: Wallpaper[]
  history: Wallpaper[]
  bookmarks: Wallpaper[]
}

/**
 * A generic query for any registered source.
 * This is the only FetchQuery definition you need.
 */
export interface FetchQuery {
  /** The name of the registered source (e.g., "unsplash", "local") */
  source: string

  /** The string for that source (e.g., "nature", or a folder path) */
  query: string

  /** Support for index signature to satisfy Record<string, unknown> */
  [key: string]: unknown
}
/**
 * The "contract" that every wallpaper source must follow.
 */
export interface ISource {
  /** The unique name used to identify this source (e.g., "unsplash") */
  name: string

  /**
   * Fetches a wallpaper based on a query.
   * 'query' could be a keyword, a mood, a URL, anything.
   */
  getWallpaper(query: string): Promise<Wallpaper>
}

// Define the type for the resolution function
export type ResolutionFn = () => Promise<{ width: number; height: number } | null>
