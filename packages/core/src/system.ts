import axios from 'axios'
import { createWriteStream } from 'fs'
import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

// Create a "promisified" version of exec
const execAsync = promisify(exec)

/**
 * Downloads an image from a URL to a *specific* local file path.
 */
export async function downloadImage(url: string, destinationPath: string): Promise<string> {
  const response = await axios.get(url, {
    responseType: 'stream',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  })

  // Save the file to the *provided* path
  await pipeline(response.data, createWriteStream(destinationPath))

  return destinationPath
}

/**
 * Sets the desktop wallpaper from a local file path.
 */

export async function setWallpaperExternal(localPath: string): Promise<void> {
  const platform = process.platform
  let command: string | undefined

  if (platform === 'win32') {
    // Windows command (unchanged)
    const powershellCommand = `
      function Add-Type($assembly) {
        Add-Type -TypeDefinition @"
          using System;
          using System.Runtime.InteropServices;
          public class SetWallpaper {
            [DllImport("user32.dll", CharSet = CharSet.Auto)]
            public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
          }
"@
      }
      Add-Type
      [SetWallpaper]::SystemParametersInfo(20, 0, "${localPath}", 3)
    `
    command = `powershell.exe -Command "${powershellCommand.replace(/"/g, '\\"')}"`
  } else if (platform === 'darwin') {
    // macOS command (unchanged)
    command = `osascript -e 'tell application "Finder" to set desktop picture to POSIX file "${localPath}"'`
  } else if (platform === 'linux') {
    const cmd1 = `gsettings set org.gnome.desktop.background picture-uri "file://${localPath}"`
    const cmd2 = `gsettings set org.gnome.desktop.background picture-uri-dark "file://${localPath}" 2>/dev/null`

    command = `{ ${cmd1}; ${cmd2}; } || true`
  }
  if (!command) {
    throw new Error(`Platform "${platform}" is not supported.`)
  }

  // Execute the command (unchanged)
  try {
    const { stderr } = await execAsync(command)
    if (stderr) {
      console.warn(`[setWallpaperExternal] Warning: ${stderr}`)
    }
  } catch (error) {
    console.error(`[setWallpaperExternal] Failed to execute command: ${command}`)
    throw error
  }
}

export async function setWallpaper(localPath: string): Promise<void> {
  try {
    const absolutePath = path.resolve(localPath)

    // First, let's verify the file 100% exists
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ File does not exist at path: ${absolutePath}`)
      return
    }

    console.log(`Setting wallpaper from absolute path: ${absolutePath}`)

    // Now we await the external package
    await setWallpaperExternal(absolutePath)

    console.log('✅ setWallpaperExternal command finished.')
  } catch (err) {
    // If the package fails, it should throw an error
    console.error('❌ FAILED TO SET WALLPAPER:')
    if (err instanceof Error) {
      console.error(err.message)
    } else {
      console.error(err)
    }
  }
}
