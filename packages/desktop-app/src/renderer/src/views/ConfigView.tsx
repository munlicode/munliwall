import React, { useEffect, useState, useRef } from 'react'
import { SettingInstance, SettingMeta } from '@munlicode/munliwall-core'

export const ConfigView: React.FC = () => {
  const [configItems, setConfigItems] = useState<SettingInstance<SettingMeta>[]>([])
  const [statusMessage, setStatusMessage] = useState('Loading configuration data...')
  const [statusColor, setStatusColor] = useState('blue')
  const [loading, setLoading] = useState(true)

  // keep a reference to active timers for each key
  const timers = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    const fetchConfig = async (): Promise<void> => {
      try {
        const result = await window.wallpaperAPI.config.show()
        setConfigItems(result)
        setStatusMessage('✅ Configuration loaded successfully.')
        setStatusColor('green')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load configuration.'
        setStatusMessage(`❌ Error: ${message}`)
        setStatusColor('red')
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleChange = (item: SettingInstance<SettingMeta>, rawValue: string): void => {
    const { key, type } = item

    // Convert the value to the correct type immediately
    let newValue: string | number | boolean | Record<string, unknown> = rawValue
    if (type === 'number') newValue = Number(rawValue)

    // update local UI immediately
    setConfigItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, currentValue: newValue } : i))
    )

    // Validate early: skip debounce if invalid
    if (!key || newValue === undefined || newValue === null) {
      setStatusMessage(`❌ Cannot save ${key}: missing key or value`)
      setStatusColor('red')
      return
    }

    setStatusMessage(`⏳ Waiting to save ${key}...`)
    setStatusColor('gray')

    // clear previous timer
    if (timers.current[key]) clearTimeout(timers.current[key])

    // debounce save
    timers.current[key] = setTimeout(async (): Promise<void> => {
      setStatusMessage(`Saving ${key}...`)
      setStatusColor('orange')

      try {
        await window.wallpaperAPI.config.set(key, newValue)
        setStatusMessage(`✅ Saved ${key}! New value: "${newValue}"`)
        setStatusColor('green')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error during save.'
        setStatusMessage(`❌ Failed to save ${key}: ${message}`)
        setStatusColor('red')
      }
    }, 5000)
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>⚙️ Application Settings</h2>

      {loading ? (
        <p>Loading configuration data...</p>
      ) : configItems.length === 0 ? (
        <p>No configuration items found.</p>
      ) : (
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            marginTop: '1rem'
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid gray', textAlign: 'left' }}>Key</th>
              <th style={{ borderBottom: '1px solid gray', textAlign: 'left' }}>Value</th>
              <th style={{ borderBottom: '1px solid gray', textAlign: 'left' }}>Description</th>
              <th style={{ borderBottom: '1px solid gray', textAlign: 'left' }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {configItems.map((item) => (
              <tr key={item.key}>
                <td>
                  <code>{item.key}</code>
                </td>
                <td>
                  {item.choices && item.choices.length > 0 ? (
                    <select
                      value={String(item.currentValue)}
                      onChange={(e) => handleChange(item, e.target.value)}
                    >
                      {item.choices.map((choice) => (
                        <option key={choice} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={item.type === 'number' ? 'number' : 'text'}
                      value={
                        typeof item.currentValue === 'object' && item.currentValue !== null
                          ? JSON.stringify(item.currentValue, null, 2)
                          : String(item.currentValue)
                      }
                      onChange={(e) => handleChange(item, e.target.value)}
                    />
                  )}
                </td>
                <td>{item.description}</td>
                <td>
                  {item.type} (Default: {String(item.defaultValue)})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ color: statusColor, marginTop: '15px' }}>{statusMessage}</p>
    </div>
  )
}
