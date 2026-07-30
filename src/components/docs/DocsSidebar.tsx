'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { type DocCategory, formatUpdated } from '@/lib/doc-meta'

export default function DocsSidebar({
  categories,
}: {
  categories: DocCategory[]
}) {
  const pathname = usePathname()
  const [openOnMobile, setOpenOnMobile] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenOnMobile((value) => !value)}
        className="frost-card mb-6 flex w-full select-none items-center justify-between rounded-xl px-4 py-3 text-sm font-medium lg:hidden"
      >
        Browse docs
        <span aria-hidden="true" className="text-ice">
          {openOnMobile ? '−' : '+'}
        </span>
      </button>

      <nav
        aria-label="Docs navigation"
        className={`${
          openOnMobile ? 'block' : 'hidden'
        } shrink-0 lg:sticky lg:top-28 lg:block lg:max-h-[calc(100svh-9rem)] lg:w-60 lg:self-start lg:overflow-y-auto`}
      >
        {categories.map((category) => (
          <div key={category.name} className="mb-7">
            <p className="mb-2 select-none font-mono text-[0.7rem] tracking-widest text-ice/70 uppercase">
              {category.name}
            </p>
            <p className="mb-3 select-none text-[0.7rem] text-muted">
              updated {formatUpdated(category.updated)}
            </p>
            <ul className="space-y-0.5 border-l border-ice/10">
              {category.docs.map((doc) => {
                const href = `/docs/${doc.slug}`
                const isActive = pathname === href
                return (
                  <li key={doc.slug} className="relative">
                    {isActive && (
                      <motion.span
                        layoutId="docs-active"
                        className="absolute -left-px top-0 h-full w-0.5 bg-ice"
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <Link
                      href={href}
                      onClick={() => setOpenOnMobile(false)}
                      className={`block py-1.5 pl-4 text-sm transition-colors ${
                        isActive
                          ? 'text-ice'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      {doc.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  )
}
