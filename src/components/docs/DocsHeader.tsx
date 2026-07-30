import Image from 'next/image'
import Link from 'next/link'
import DocsSearch from '@/components/docs/DocsSearch'
import type { SearchEntry } from '@/lib/doc-meta'

export default function DocsHeader({ entries }: { entries: SearchEntry[] }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 select-none">
      <div className="frost-card mx-auto mt-4 flex max-w-7xl items-center gap-4 rounded-2xl px-5 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/coldluautransparent.png"
            alt=""
            width={30}
            height={30}
            draggable={false}
            className="select-none"
          />
          <span className="font-semibold tracking-tight">
            cold<span className="text-ice">luau</span>
          </span>
        </Link>
        <Link
          href="/docs"
          className="rounded-md border border-ice/20 px-2 py-0.5 font-mono text-[0.7rem] tracking-wide text-ice/80 uppercase transition-colors hover:bg-ice/10"
        >
          docs
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <DocsSearch entries={entries} />
          <Link
            href="/"
            className="hidden text-sm text-muted transition-colors hover:text-ice sm:block"
          >
            Home
          </Link>
          <a
            href="https://github.com/coldluau/coldluau"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-ice/25 px-3 py-1.5 text-sm font-medium text-ice transition-colors hover:bg-ice/10"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  )
}
