import type { Metadata } from 'next'
import DocsHeader from '@/components/docs/DocsHeader'
import DocsSidebar from '@/components/docs/DocsSidebar'
import Footer from '@/components/Footer'
import { getCategories, getSearchIndex } from '@/lib/docs'

export const metadata: Metadata = {
  title: 'coldluau docs',
  description:
    'Documentation for coldluau, the Luau preprocessor that rewrites aliases into native Roblox string requires.',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = getCategories()
  const entries = getSearchIndex()

  return (
    <div className="relative flex min-h-svh flex-col">
      {/* soft icy wash behind the docs, no moving particles while reading */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 select-none"
      >
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(135,253,255,0.08),transparent_65%)] blur-3xl" />
      </div>

      <DocsHeader entries={entries} />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 pt-28 pb-20 lg:flex-row">
        <DocsSidebar categories={categories} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <Footer />
    </div>
  )
}
