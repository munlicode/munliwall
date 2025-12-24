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

  const groupSettings = (items: SettingInstance<SettingMeta>[]): Record<string, SettingInstance<SettingMeta>[]> => {
    const groups: Record<string, SettingInstance<SettingMeta>[]> = {
      '🏠 General': [],
      '🎨 Image Fetching': [],
      '🔄 Auto-Change': []
    }

    items.forEach((item) => {
      if (['dataPath', 'historyLength'].includes(item.key)) {
        groups['🏠 General'].push(item)
      } else if (['defaultSource', 'imageQuality'].includes(item.key)) {
        groups['🎨 Image Fetching'].push(item)
      } else if (item.key.startsWith('autoChange')) {
        groups['🔄 Auto-Change'].push(item)
      } else {
        if (!groups['🔧 Others']) groups['🔧 Others'] = []
        groups['🔧 Others'].push(item)
      }
    })
    return groups
  }

  const grouped = groupSettings(configItems)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111', margin: 0 }}>
          ⚙️ Application Settings
        </h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Configure how Munliwall behaves and where it stores your data.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#666' }}>⌛ Loading configuration data...</p>
        </div>
      ) : configItems.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            background: '#f8f9fa',
            borderRadius: '12px'
          }}
        >
          <p style={{ color: '#666' }}>No configuration items found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(grouped).map(([groupName, items]) => {
            if (items.length === 0) return null

            return (
              <section key={groupName}>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#4b5563',
                    marginBottom: '1rem',
                    paddingLeft: '0.5rem'
                  }}
                >
                  {groupName}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {items.map((item) => (
                    <div
                      key={item.key}
                      style={{
                        background: 'white',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '2rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.25rem'
                          }}
                        >
                          <span style={{ fontWeight: 600, color: '#111827' }}>{item.key}</span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: '#6b7280',
                              background: '#f3f4f6',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {item.type}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          {item.description}
                        </p>
                      </div>

                      <div style={{ minWidth: '200px' }}>
                        {item.choices && item.choices.length > 0 ? (
                          <select
                            value={String(item.currentValue)}
                            onChange={(e) => handleChange(item, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.6rem',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              background: '#fff',
                              outline: 'none',
                              fontSize: '0.9rem'
                            }}
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
                            style={{
                              width: '100%',
                              padding: '0.6rem',
                              borderRadius: '8px',
                              border: '1px solid #d1d5db',
                              outline: 'none',
                              fontSize: '0.9rem'
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: '#6b7280',
                            marginTop: '0.4rem',
                            textAlign: 'right'
                          }}
                        >
                          Default: {String(item.defaultValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {statusMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: statusColor === 'red' ? '#fee2e2' : statusColor === 'green' ? '#dcfce7' : 'white',
            color: statusColor === 'red' ? '#991b1b' : statusColor === 'green' ? '#166534' : '#1e3a8a',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            zIndex: 100,
            border: `1px solid ${statusColor === 'red' ? '#fecaca' : statusColor === 'green' ? '#bbf7d0' : '#e5e7eb'}`
          }}
        >
          {statusMessage}
        </div>
      )}
    </div>
  )
}
