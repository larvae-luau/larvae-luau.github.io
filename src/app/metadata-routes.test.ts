import { describe, expect, it } from 'vitest'
import manifest from '@/app/manifest'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { getAllDocs } from '@/lib/docs'
import { SITE_ORIGIN } from '@/lib/site'

describe('sitemap', () => {
  const entries = sitemap()
  const urls = entries.map((entry) => entry.url)

  it('lists the landing page, the docs index, and every page', () => {
    const docs = getAllDocs()
    expect(entries).toHaveLength(docs.length + 2)
    expect(urls).toContain(SITE_ORIGIN)
    expect(urls).toContain(`${SITE_ORIGIN}/docs`)
    for (const doc of docs) {
      expect(urls).toContain(`${SITE_ORIGIN}/docs/${doc.slug}`)
    }
  })

  it('uses absolute urls with no doubled slashes', () => {
    for (const url of urls) {
      expect(url.startsWith('https://')).toBe(true)
      expect(url.slice('https://'.length)).not.toContain('//')
    }
  })

  it('reports the date each page declares rather than the build time', () => {
    const docs = getAllDocs()
    for (const doc of docs) {
      const entry = entries.find(
        (item) => item.url === `${SITE_ORIGIN}/docs/${doc.slug}`,
      )
      expect(entry?.lastModified).toBe(doc.updated)
    }
  })
})

describe('robots', () => {
  const result = robots()

  it('allows crawling and points at the sitemap', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    expect(rules[0].allow).toBe('/')
    expect(result.sitemap).toBe(`${SITE_ORIGIN}/sitemap.xml`)
  })

  it('keeps crawlers out of the hashed build output', () => {
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules]
    expect(rules[0].disallow).toBe('/_next/')
  })
})

describe('manifest', () => {
  const result = manifest()

  it('carries the site identity and theme colors', () => {
    expect(result.name).toBe('larvae')
    expect(result.theme_color).toBe('#10e694')
    expect(result.background_color).toBe('#04070d')
    expect(result.start_url).toBe('/')
  })

  it('points at icons the build actually emits', () => {
    const sources = (result.icons ?? []).map((icon) => icon.src)
    expect(sources).toContain('/icon.png')
    expect(sources).toContain('/apple-icon.png')
  })
})
