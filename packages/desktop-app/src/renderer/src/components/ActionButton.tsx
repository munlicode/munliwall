import React, { useState } from 'react'

interface ActionButtonProps {
  label: string // Button text, e.g. "🔖 Bookmark"
  action: () => Promise<void> // Async function to run on click
  successMessage?: string // Optional success text
  errorPrefix?: string // Optional prefix for error messages
  setStatus?: (msg: string, color?: string) => void // Optional status handler
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  action,
  successMessage = '✅ Done.',
  errorPrefix = '❌ Failed:',
  setStatus
}) => {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await action()
      if (setStatus) setStatus(successMessage, 'green')
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (setStatus) setStatus(`${errorPrefix} ${message}`, 'red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? '⏳...' : label}
    </button>
  )
}
