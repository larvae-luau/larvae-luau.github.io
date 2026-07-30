'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SearchEntry } from '@/lib/doc-meta'

interface Indexed extends SearchEntry {
  haystack: string
}

interface Hit {
  entry: Indexed
  score: number
  heading?: string
  excerpt?: string
}

function scoreEntry(
  entry: Indexed,
  terms: string[],
  query: string,
): Hit | null {
  if (!terms.every((term) => entry.haystack.includes(term))) return null

  let score = 0
  const title = entry.title.toLowerCase()
  if (title === query) score += 120
  else if (title.startsWith(query)) score += 80
  else if (title.includes(query)) score += 60

  if (entry.description.toLowerCase().includes(query)) score += 25
  if (entry.category.toLowerCase().includes(query)) score += 12

  const heading = entry.headings.find((h) => h.toLowerCase().includes(query))
  if (heading) score += 30

  const body = entry.body.toLowerCase()
  const at = body.indexOf(query)
  let excerpt: string | undefined
  if (at !== -1) {
    score += 10
    // snap to word boundaries so the snippet never starts mid word
    let start = Math.max(0, at - 40)
    if (start > 0) {
      const space = entry.body.indexOf(' ', start)
      if (space !== -1 && space < at) start = space + 1
    }
    const end = Math.min(entry.body.length, at + query.length + 60)
    const tail = entry.body.lastIndexOf(' ', end)
    const cut = entry.body.slice(start, tail > at ? tail : end).trim()
    excerpt = `${start > 0 ? '... ' : ''}${cut}${end < entry.body.length ? ' ...' : ''}`
  }

  // every term matched somewhere, so always rank at least minimally
  score += terms.length
  return { entry, score, heading, excerpt }
}

export default function DocsSearch({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const indexed = useMemo<Indexed[]>(
    () =>
      entries.map((entry) => ({
        ...entry,
        haystack:
          `${entry.title} ${entry.category} ${entry.description} ${entry.headings.join(' ')} ${entry.body}`.toLowerCase(),
      })),
    [entries],
  )

  const hits = useMemo<Hit[]>(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []
    const terms = trimmed.split(/\s+/)
    return indexed
      .map((entry) => scoreEntry(entry, terms, trimmed))
      .filter((hit): hit is Hit => hit !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [indexed, query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  const go = useCallback(
    (slug: string) => {
      close()
      router.push(`/docs/${slug}`)
    },
    [close, router],
  )

  // cmd+K / ctrl+K opens from anywhere in the docs
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') close()
    else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((value) => (hits.length ? (value + 1) % hits.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((value) =>
        hits.length ? (value - 1 + hits.length) % hits.length : 0,
      )
    } else if (event.key === 'Enter' && hits[active]) {
      go(hits[active].entry.slug)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="docs-search-trigger"
        className="flex select-none items-center gap-2 rounded-lg border border-ice/15 bg-ice/5 px-3 py-1.5 text-sm text-muted transition-colors hover:border-ice/35 hover:text-ice sm:w-64"
      >
        <span aria-hidden="true">⌕</span>
        <span className="flex-1 text-left">Search docs</span>
        <kbd className="hidden rounded border border-ice/20 px-1.5 py-0.5 font-mono text-[0.65rem] text-ice/70 sm:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-4 pt-24 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(event) => event.stopPropagation()}
              className="frost-card w-full max-w-xl overflow-hidden rounded-2xl"
            >
              <div className="flex items-center gap-3 border-b border-ice/10 px-4 py-3">
                <span aria-hidden="true" className="select-none text-ice">
                  ⌕
                </span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setActive(0)
                  }}
                  onKeyDown={onInputKeyDown}
                  placeholder="Search the docs"
                  aria-label="Search the docs"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
                />
                <button
                  type="button"
                  onClick={close}
                  className="select-none rounded border border-ice/20 px-1.5 py-0.5 font-mono text-[0.65rem] text-muted transition-colors hover:text-ice"
                >
                  esc
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {query.trim() && hits.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-muted">
                    No matches for &ldquo;{query.trim()}&rdquo;
                  </p>
                )}
                {!query.trim() && (
                  <p className="px-4 py-6 text-center text-sm text-muted">
                    Search titles, headings, and page text
                  </p>
                )}
                {hits.map((hit, index) => (
                  <button
                    key={hit.entry.slug}
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(hit.entry.slug)}
                    className={`block w-full border-b border-ice/5 px-4 py-3 text-left transition-colors last:border-b-0 ${
                      index === active ? 'bg-ice/10' : 'hover:bg-ice/5'
                    }`}
                  >
                    <span className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {hit.entry.title}
                      </span>
                      <span className="select-none font-mono text-[0.65rem] tracking-wide text-ice/60 uppercase">
                        {hit.entry.category}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {hit.heading ?? hit.excerpt ?? hit.entry.description}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
