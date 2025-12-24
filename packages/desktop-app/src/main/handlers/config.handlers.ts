import { SettingInstance, type SettingMeta } from '@munlicode/munliwall-core'
import {
  settingsMeta,
  setSetting,
  getSettings,
  getSetting,
  getDefaultSettings,
  Settings
} from '@munlicode/munliwall-core'
import { ipcMain } from 'electron'

export function registerConfigHandlers() {
  ipcMain.handle('wallpaper:config:show', async () => {
    try {
      // 1. Fetch current and default values
      const currentSettings = getSettings()
      const defaultSettings = getDefaultSettings() as any

      // 2. Combine data for the renderer
      const settingsData: SettingInstance<SettingMeta>[] = []

      for (const [key, meta] of Object.entries(settingsMeta)) {
        const settingKey = key as keyof Settings

        settingsData.push({
          key: key,
          description: meta.description,
          type: meta.type,
          choices: meta.choices ?? undefined,
          currentValue: currentSettings.get(settingKey) ?? defaultSettings[key],
          defaultValue: defaultSettings[key]
        })
      }

      // Return the structured array to the renderer
      return settingsData
    } catch (err) {
      console.error('❌ Error fetching configuration data:', err)
      throw new Error(`Failed to load configuration: ${(err as Error).message}`)
    }
  })
  ipcMain.handle('wallpaper:config:get', async (_event, key: string) => {
    // Basic validation: Check if the key exists in metadata
    if (!(key in settingsMeta)) {
      throw new Error(`Unknown configuration key: "${key}"`)
    }

    try {
      const value = getSetting(key as keyof Settings)
      // Return the key/value pair to the renderer
      return { key, value }
    } catch (err) {
      console.error(`❌ Error getting key "${key}":`, err)
      throw new Error(`Failed to get setting ${key}: ${(err as Error).message}`)
    }
  })
  ipcMain.handle('wallpaper:config:set', async (_event, key: string, value: any) => {
    if (!key || value === undefined || value === null) {
      throw new Error('Missing configuration key or value.')
    }
    if (!(key in settingsMeta)) {
      throw new Error(`Unknown configuration key: "${key}"`)
    }

    try {
      setSetting(key as keyof Settings, value)
      return { success: true, key, newValue: value }
    } catch (err) {
      console.error(`❌ Error setting key "${key}" to "${value}":`, err)
      throw new Error(`Failed to set ${key}: ${(err as Error).message}`)
    }
  })
}
