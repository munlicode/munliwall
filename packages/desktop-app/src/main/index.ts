process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
})

import { app, BrowserWindow } from 'electron'
import * as dotenv from 'dotenv'
import { startWallpaperService } from '@munlicode/munliwall-core'
import { registerIPCHandlers } from './handlers/index.js'
import { createMenu } from './menu.js'
import path from 'path'

const currentDir = __dirname
const projectRoot = path.join(currentDir, '../../../../')

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(projectRoot, '.env') })
}
const preloadPath = path.join(__dirname, '../preload/index.js')

function getIconPath(): string {
  if (app.isPackaged) {
    // In production, extraResources copies resources/ directly to the resources folder
    return path.join(process.resourcesPath, 'icon.png')
  }
  // In development, resolve relative to this file
  return path.join(__dirname, '../../resources/icon.png')
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: getIconPath(),
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  if (process.env.NODE_ENV === 'development') {
    console.info('Starting Dev Server')
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'
    win.loadURL(devUrl)
  } else {
    console.info('Starting Production Server')
    win.loadFile(path.join(currentDir, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  createWindow()

  createMenu()
  startWallpaperService()

  registerIPCHandlers()
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
