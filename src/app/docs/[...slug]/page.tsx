import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatUpdated } from '@/lib/doc-meta'
import { getAdjacentDocs, getAllDocs, getDoc } from '@/lib/docs'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.segments }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const doc = getDoc(slug.join('/'))
  if (!doc) return {}
  return {
    title: `${doc.title} · coldluau docs`,
    description: doc.description,
  }
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const path = slug.join('/')
  const doc = getDoc(path)
  if (!doc) notFound()

  const { previous, next } = getAdjacentDocs(path)

  return (
    <div className="flex gap-12">
      <article className="min-w-0 max-w-3xl flex-1">
        <nav aria-label="Breadcrumb" className="mb-3 select-none text-xs">
          <Link
            href="/docs"
            className="text-muted transition-colors hover:text-ice"
          >
            Docs
          </Link>
          <span className="mx-2 text-muted/50">/</span>
          <span className="font-mono tracking-wide text-ice/70 uppercase">
            {doc.category}
          </span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-lg text-muted text-pretty">{doc.description}</p>
        <p className="mt-4 mb-10 flex select-none flex-wrap gap-x-4 border-b border-ice/10 pb-6 font-mono text-xs text-muted">
          <span>updated {formatUpdated(doc.updated)}</span>
          <span>{doc.readingMinutes} min read</span>
        </p>

        {/* markdown rendered at build time, code highlighted with the site theme */}
        <div
          className="doc-prose"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time markdown from content/docs
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />

        <div className="mt-16 grid gap-4 border-t border-ice/10 pt-8 sm:grid-cols-2">
          {previous ? (
            <Link
              href={`/docs/${previous.slug}`}
              className="frost-card group rounded-xl p-4 transition-colors hover:border-ice/35"
            >
              <span className="select-none text-xs text-muted">Previous</span>
              <span className="mt-1 block font-medium transition-colors group-hover:text-ice">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/docs/${next.slug}`}
              className="frost-card group rounded-xl p-4 text-right transition-colors hover:border-ice/35 sm:col-start-2"
            >
              <span className="select-none text-xs text-muted">Next</span>
              <span className="mt-1 block font-medium transition-colors group-hover:text-ice">
                {next.title}
              </span>
            </Link>
          )}
        </div>
      </article>

      {doc.headings.length > 1 && (
        <aside className="hidden w-52 shrink-0 xl:block">
          <div className="sticky top-28">
            <p className="mb-3 select-none font-mono text-[0.7rem] tracking-widest text-ice/70 uppercase">
              on this page
            </p>
            <ul className="space-y-1 border-l border-ice/10 text-sm">
              {doc.headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    className={`block py-1 text-muted transition-colors hover:text-ice ${
                      heading.depth === 3 ? 'pl-7 text-xs' : 'pl-4'
                    }`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  )
}
