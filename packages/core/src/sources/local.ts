import { ISource, Wallpaper } from '../types.js';
import { readdir } from 'fs/promises';
import { join, sep } from 'path';
import sharp from 'sharp';

export class LocalSource implements ISource {
  public name = 'local';

  /**
 * Gets a random wallpaper from a local directory.
 * @param folderPath The path to the folder containing images.
 */
  async getWallpaper(folderPath: string): Promise<Wallpaper> {
    const files = await readdir(folderPath);

    // Filter for common image file extensions
    const images = files.filter(f =>
      /\.(jpg|jpeg|png)$/i.test(f)
    );

    if (images.length === 0) {
      throw new Error(`No images found in: ${folderPath}`);
    }

    // Select a random image
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const fullPath = join(folderPath, randomImage);

    // --- Get dimensions using sharp ---
    const metadata = await sharp(fullPath).metadata();
    // ----------------------------------

    const fileUrl = `file://${fullPath}`; // URL for local file access

    return {
      id: fullPath, // Use the full path as the unique ID
      urls: {
        raw: fileUrl,
        full: fileUrl,
        regular: fileUrl,
        small: fileUrl,
      },
      source: this.name,
      author: 'Unknown', // Author is generally not available for local files
      tags: [folderPath.split(sep).pop() || 'local'], // Use folder name as a tag
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
    };
  }
}