import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { Marked, type RendererObject } from 'marked'
import {
  categoryRank,
  type Doc,
  type DocCategory,
  type DocMeta,
  type Heading,
  type SearchEntry,
} from '@/lib/doc-meta'
import { escapeHtml, highlightToHtml, resolveLang } from '@/lib/highlight'

export type { Doc, DocCategory, DocMeta, Heading, SearchEntry }
export { CATEGORY_ORDER, formatUpdated } from '@/lib/doc-meta'

const DOCS_DIR = path.join(process.cwd(), 'content', 'docs')

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return entry.isFile() && entry.name.endsWith('.md') ? [full] : []
  })
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/`/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  )
}

function uniqueId(base: string, used: Map<string, number>): string {
  const count = used.get(base) ?? 0
  used.set(base, count + 1)
  return count === 0 ? base : `${base}-${count + 1}`
}

function renderMarkdown(markdown: string): {
  html: string
  headings: Heading[]
} {
  const headings: Heading[] = []
  const used = new Map<string, number>()

  const renderer: RendererObject = {
    code({ text, lang }) {
      const resolved = resolveLang(lang)
      const label =
        resolved === 'text'
          ? ''
          : `<span class="doc-code-lang">${escapeHtml(resolved)}</span>`
      return `<div class="doc-code">${label}<pre class="code-scroll"><code>${highlightToHtml(
        text,
        resolved,
      )}</code></pre></div>`
    },
    heading(token) {
      const id = uniqueId(slugify(token.text), used)
      const inline =
        this.parser?.parseInline(token.tokens) ?? escapeHtml(token.text)
      if (token.depth <= 3) {
        headings.push({
          id,
          text: token.text.replace(/`/g, ''),
          depth: token.depth,
        })
      }
      return `<h${token.depth} id="${id}">${inline}</h${token.depth}>`
    },
  }

  const marked = new Marked({ renderer, gfm: true })
  const raw = marked.parse(markdown, { async: false }) as string
  // Wrap tables so wide ones scroll inside the page instead of widening it
  const html = raw
    .replace(/<table>/g, '<div class="doc-table"><table>')
    .replace(/<\/table>/g, '</table></div>')

  return { html, headings }
}

function toPlainText(markdown: string): string {
  return (
    markdown
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/^[|>#*\-\s]+$/gm, ' ')
      // underscores are left alone: snake_case config keys are what people search
      .replace(/[#>*`|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

function requireString(
  data: Record<string, unknown>,
  key: string,
  file: string,
): string {
  const value = data[key]
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Doc ${file} is missing required frontmatter "${key}"`)
  }
  return value
}

interface LoadedDoc {
  meta: DocMeta
  markdown: string
}

let cache: LoadedDoc[] | null = null

function loadAll(): LoadedDoc[] {
  if (cache) return cache

  const loaded = walk(DOCS_DIR).map((file) => {
    const parsed = matter(fs.readFileSync(file, 'utf8'))
    const data = parsed.data as Record<string, unknown>
    const relative = path.relative(DOCS_DIR, file).replace(/\.md$/, '')
    const slug = relative.split(path.sep).join('/')
    const updated = data.updated
    return {
      meta: {
        slug,
        segments: slug.split('/'),
        title: requireString(data, 'title', slug),
        description: requireString(data, 'description', slug),
        category: requireString(data, 'category', slug),
        order: typeof data.order === 'number' ? data.order : 999,
        updated:
          updated instanceof Date
            ? updated.toISOString().slice(0, 10)
            : String(updated ?? '').slice(0, 10),
      },
      markdown: parsed.content,
    }
  })

  loaded.sort((a, b) => {
    const byCategory =
      categoryRank(a.meta.category) - categoryRank(b.meta.category)
    if (byCategory !== 0) return byCategory
    if (a.meta.order !== b.meta.order) return a.meta.order - b.meta.order
    return a.meta.title.localeCompare(b.meta.title)
  })

  cache = loaded
  return loaded
}

export function getAllDocs(): DocMeta[] {
  return loadAll().map((entry) => entry.meta)
}

export function getCategories(): DocCategory[] {
  const groups = new Map<string, DocMeta[]>()
  for (const meta of getAllDocs()) {
    const existing = groups.get(meta.category)
    if (existing) existing.push(meta)
    else groups.set(meta.category, [meta])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => categoryRank(a) - categoryRank(b))
    .map(([name, docs]) => ({
      name,
      docs,
      updated: docs.reduce((latest, doc) => {
        return doc.updated > latest ? doc.updated : latest
      }, ''),
    }))
}

export function getDoc(slug: string): Doc | null {
  const entry = loadAll().find((item) => item.meta.slug === slug)
  if (!entry) return null

  const { html, headings } = renderMarkdown(entry.markdown)
  const words = toPlainText(entry.markdown).split(' ').length
  return {
    ...entry.meta,
    html,
    headings,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  }
}

export function getAdjacentDocs(slug: string): {
  previous: DocMeta | null
  next: DocMeta | null
} {
  const all = getAllDocs()
  const index = all.findIndex((doc) => doc.slug === slug)
  return {
    previous: index > 0 ? all[index - 1] : null,
    next: index >= 0 && index < all.length - 1 ? all[index + 1] : null,
  }
}

export function getSearchIndex(): SearchEntry[] {
  return loadAll().map((entry) => {
    const { headings } = renderMarkdown(entry.markdown)
    return {
      slug: entry.meta.slug,
      title: entry.meta.title,
      description: entry.meta.description,
      category: entry.meta.category,
      headings: headings.map((heading) => heading.text),
      body: toPlainText(entry.markdown),
    }
  })
}
