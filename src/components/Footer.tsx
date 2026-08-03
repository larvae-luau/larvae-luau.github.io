import Image from 'next/image'
import Link from 'next/link'
import logo from '@/lib/logo'

export default function Footer() {
  return (
    <footer className="relative select-none border-t border-hive/10 px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt=""
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-sm text-muted">
            lar<span className="text-hive">vae</span> · the Luau toolchain
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <a
            href="https://github.com/larvae-luau/larvae"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-hive"
          >
            GitHub
          </a>
          <Link href="/docs" className="transition-colors hover:text-hive">
            Docs
          </Link>
          <a href="#top" className="transition-colors hover:text-hive">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
