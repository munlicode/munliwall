import { ISource, Wallpaper } from '../types.js';
import { readdir } from 'fs/promises';
import { join, sep } from 'path';
import { imageSizeFromFile } from 'image-size/fromFile';

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

    // --- Get dimensions using image-size/fromFile ---
    let width = 0;
    let height = 0;
    try {
        const dimensions = await imageSizeFromFile(fullPath); // Use the correct async function
        if (dimensions) {
            width = dimensions.width ?? 0;
            height = dimensions.height ?? 0;
        }
    } catch (error) {
        // Ignore dimension errors, fallback to 0
        console.error(`Failed to read dimensions for ${fullPath}`, error);
    }
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
      width,
      height,
    };
  }
}