import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { formatUpdated } from '@/lib/doc-meta'
import { getCategories } from '@/lib/docs'

export default function DocsIndex() {
  const categories = getCategories()
  const total = categories.reduce((sum, group) => sum + group.docs.length, 0)
  const latest = categories.reduce(
    (newest, group) => (group.updated > newest ? group.updated : newest),
    '',
  )

  return (
    <div className="max-w-3xl">
      <Reveal>
        <p className="mb-3 select-none font-mono text-xs tracking-widest text-hive/70 uppercase">
          documentation
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          larvae <span className="hive-text">docs</span>
        </h1>
        <p className="mt-4 text-lg text-muted text-pretty">
          A Luau preprocessor written in Rust. It turns your aliases into native
          Roblox string requires, refuses to emit a require that would break at
          runtime, and rebuilds incrementally.
        </p>
        <p className="mt-3 select-none font-mono text-xs text-muted">
          {total} pages · {categories.length} categories · last updated{' '}
          {formatUpdated(latest)}
        </p>
      </Reveal>

      <div className="mt-12 flex flex-col gap-5">
        {categories.map((category, index) => (
          <Reveal key={category.name} delay={index * 0.08}>
            <section className="hive-card rounded-2xl p-6">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{category.name}</h2>
                <p className="select-none font-mono text-[0.7rem] text-muted">
                  {category.docs.length} pages · updated{' '}
                  {formatUpdated(category.updated)}
                </p>
              </div>
              <ul className="divide-y divide-hive/8">
                {category.docs.map((doc) => (
                  <li key={doc.slug}>
                    <Link
                      href={`/docs/${doc.slug}`}
                      className="group flex flex-col gap-1 py-3 transition-colors sm:flex-row sm:items-baseline sm:gap-4"
                    >
                      <span className="min-w-52 font-medium text-foreground transition-colors group-hover:text-hive">
                        {doc.title}
                      </span>
                      <span className="flex-1 text-sm text-muted">
                        {doc.description}
                      </span>
                      <span className="select-none font-mono text-[0.7rem] text-muted/70">
                        {formatUpdated(doc.updated)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
