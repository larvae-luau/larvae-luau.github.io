/**
 * Types and pure helpers shared by server and client docs code.
 * Kept free of node:fs so client components can import it.
 */

/** Sidebar and index ordering. Categories not listed here fall to the end. */
export const CATEGORY_ORDER = [
  'Getting started',
  'Reference',
  'Concepts',
  'Project',
]

export interface DocMeta {
  /** Route slug relative to /docs, ex: 'reference/cli' */
  slug: string
  segments: string[]
  title: string
  description: string
  category: string
  order: number
  /** ISO date from frontmatter */
  updated: string
}

export interface Heading {
  id: string
  text: string
  depth: number
}

export interface Doc extends DocMeta {
  html: string
  headings: Heading[]
  readingMinutes: number
}

export interface DocCategory {
  name: string
  docs: DocMeta[]
  /** Newest `updated` across the category's pages */
  updated: string
}

export interface SearchEntry {
  slug: string
  title: string
  description: string
  category: string
  headings: string[]
  body: string
}

export function categoryRank(name: string): number {
  const index = CATEGORY_ORDER.indexOf(name)
  return index === -1 ? CATEGORY_ORDER.length : index
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Formats an ISO date for display, ex: 'Jul 29, 2026' */
export function formatUpdated(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return 'unknown'
  const [year, month, day] = iso.split('-').map(Number)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}
