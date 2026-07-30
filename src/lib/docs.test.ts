import { describe, expect, it } from 'vitest'
import { CATEGORY_ORDER, formatUpdated } from '@/lib/doc-meta'
import {
  getAdjacentDocs,
  getAllDocs,
  getCategories,
  getDoc,
  getSearchIndex,
} from '@/lib/docs'

describe('docs content', () => {
  const docs = getAllDocs()

  it('loads every page with complete frontmatter', () => {
    expect(docs.length).toBeGreaterThanOrEqual(14)
    for (const doc of docs) {
      expect(doc.title.length).toBeGreaterThan(0)
      expect(doc.description.length).toBeGreaterThan(0)
      expect(CATEGORY_ORDER).toContain(doc.category)
      expect(doc.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(doc.slug).not.toContain('\\')
    }
  })

  it('renders every page without em dashes', () => {
    for (const doc of docs) {
      const rendered = getDoc(doc.slug)
      expect(rendered).not.toBeNull()
      expect(rendered?.html).not.toContain('—')
      expect(rendered?.html).not.toContain('–')
    }
  })

  it('highlights fenced code with the site theme classes', () => {
    const doc = getDoc('getting-started/quick-start')
    expect(doc?.html).toContain('doc-code')
    expect(doc?.html).toMatch(/class="text-(ice|glacier|muted|white)"/)
  })

  it('wraps tables so wide ones scroll instead of widening the page', () => {
    const doc = getDoc('reference/cli')
    const wrappers = doc?.html.match(/<div class="doc-table">/g) ?? []
    const tables = doc?.html.match(/<table>/g) ?? []
    expect(tables.length).toBeGreaterThan(0)
    // every table is wrapped, so none can widen the page
    expect(wrappers.length).toBe(tables.length)
  })

  it('gives headings ids that match the table of contents', () => {
    const doc = getDoc('concepts/realms-and-clones')
    expect(doc?.headings.length).toBeGreaterThan(1)
    for (const heading of doc?.headings ?? []) {
      expect(doc?.html).toContain(`id="${heading.id}"`)
      expect(heading.text).not.toContain('`')
    }
  })

  it('escapes markup that appears inside code', () => {
    const roadmap = getDoc('project/roadmap')
    expect(roadmap?.html).not.toContain('<T>= number')
  })

  it('groups categories in order, each with a last updated date', () => {
    const categories = getCategories()
    const names = categories.map((category) => category.name)
    expect(names).toEqual(CATEGORY_ORDER.filter((name) => names.includes(name)))
    for (const category of categories) {
      expect(category.docs.length).toBeGreaterThan(0)
      expect(category.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      // the category date is the newest of its pages
      const newest = category.docs.reduce(
        (latest, doc) => (doc.updated > latest ? doc.updated : latest),
        '',
      )
      expect(category.updated).toBe(newest)
    }
  })

  it('chains previous and next across the whole set', () => {
    const first = getAdjacentDocs(docs[0].slug)
    const last = getAdjacentDocs(docs[docs.length - 1].slug)
    expect(first.previous).toBeNull()
    expect(first.next?.slug).toBe(docs[1].slug)
    expect(last.next).toBeNull()
  })

  it('builds a search index that finds pages by their text', () => {
    const index = getSearchIndex()
    expect(index.length).toBe(docs.length)

    const find = (term: string) =>
      index.filter((entry) =>
        `${entry.title} ${entry.description} ${entry.headings.join(' ')} ${entry.body}`
          .toLowerCase()
          .includes(term),
      )

    // a term deep inside a long page must still be findable
    expect(find('wait_for_child').length).toBeGreaterThan(0)
    expect(find('resolution epoch').length).toBeGreaterThan(0)
    expect(find('starter').length).toBeGreaterThan(0)
    // code fences are stripped from the body, so it stays prose
    for (const entry of index) {
      expect(entry.body).not.toContain('```')
    }
  })
})

describe('formatUpdated', () => {
  it('formats an ISO date for display', () => {
    expect(formatUpdated('2026-07-29')).toBe('Jul 29, 2026')
    expect(formatUpdated('2026-01-01')).toBe('Jan 1, 2026')
  })

  it('degrades gracefully on a bad value', () => {
    expect(formatUpdated('')).toBe('unknown')
    expect(formatUpdated('July 2026')).toBe('unknown')
  })
})
