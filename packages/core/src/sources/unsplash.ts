import { ISource, Wallpaper } from '../types.js'
import axios from 'axios'
const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY

export class UnsplashSource implements ISource {
  public name = 'unsplash'

  async getWallpaper(query: string): Promise<Wallpaper> {
    if (!UNSPLASH_API_KEY) {
      console.error('FATAL ERROR: UNSPLASH_API_KEY is not set in your .env file.')
      throw new Error('FATAL ERROR: UNSPLASH_API_KEY is not set in your .env file.')
    }
    console.log(`UnsplashSource: Fetching '${query}'`)

    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: query === 'random' ? undefined : query,
        client_id: UNSPLASH_API_KEY
      }
    })

    const data = response.data
    return {
      id: data.id,
      urls: {
        raw: data.urls.raw,
        full: data.urls.full,
        regular: data.urls.regular,
        small: data.urls.small
      },
      source: this.name,
      author: data.user.name,
      tags: data.tags ? data.tags.map((tag: { title: string }) => tag.title) : [],
      width: data.width,
      height: data.height
    }
  }
}
