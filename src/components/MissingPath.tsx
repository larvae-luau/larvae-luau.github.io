'use client'

import { useEffect, useState } from 'react'

/**
 * Shows the path that missed. Pages serves 404.html for any unknown route, so
 * the path is only knowable in the browser, and it stays empty until mount to
 * keep the server and client markup identical.
 */
export default function MissingPath() {
  const [path, setPath] = useState('')

  useEffect(() => {
    setPath(window.location.pathname)
  }, [])

  if (!path) return null

  return (
    <p className="frost-card mt-8 max-w-full overflow-x-auto rounded-xl px-4 py-2.5 font-mono text-sm text-muted">
      <span aria-hidden="true" className="select-none text-ice">
        ${' '}
      </span>
      <span className="text-foreground/80">{path}</span>
    </p>
  )
}
