'use client'

import { motion } from 'motion/react'
import Reveal from '@/components/Reveal'
import Tilt from '@/components/Tilt'

const FEATURES = [
  {
    icon: 'cores',
    title: 'Parallel by architecture',
    body: 'Every file is processed across all cores with rayon. darklua is single threaded and has been since its parallelize issue was filed in 2021.',
  },
  {
    icon: 'splice',
    title: 'Splices, not reprints',
    body: 'Rewrites are byte range splices into the original source, so untouched bytes are never printed again. No second AST either.',
  },
  {
    icon: 'eyes',
    title: 'Native string requires',
    body: 'Expand @alias imports into require("@game/...") paths the Roblox engine understands natively. No Instance chains, output stays diff-able.',
  },
  {
    icon: 'realm',
    title: 'Realm-aware validation',
    body: 'check catches requires that pass on disk but fail in a running game: server/client realm violations, Starter-container clones, and wait semantics.',
  },
  {
    icon: 'cache',
    title: 'Incremental & watch',
    body: 'The cache key covers the whole resolution environment, not just file bytes, so it is never stale. Watch mode keeps the last good output when a save fails to lex.',
  },
  {
    icon: 'project',
    title: 'One Rojo project file',
    body: 'default.project.json stays the source of truth and larvae derives the build project from it, instead of the two hand synced files darklua needs.',
  },
]

/** Line icons drawn in currentColor, so each inherits the hive tint. */
const ICONS: Record<string, React.ReactNode> = {
  // four lanes running at once
  cores: (
    <>
      <path d="M4 5v14M9.33 5v14M14.67 5v14M20 5v14" />
    </>
  ),
  // a span with one piece swapped in place
  splice: (
    <>
      <path d="M3 12h5M16 12h5" />
      <rect x="8" y="8.5" width="8" height="7" rx="1.5" />
    </>
  ),
  // the three eyes
  eyes: (
    <>
      <circle cx="12" cy="6.4" r="3.4" />
      <circle cx="6.6" cy="16" r="3.4" />
      <circle cx="17.4" cy="16" r="3.4" />
    </>
  ),
  // a boundary that refuses to be crossed
  realm: (
    <>
      <path d="M12 3l7.5 3.2v5.1c0 4.4-3 8.2-7.5 9.7-4.5-1.5-7.5-5.3-7.5-9.7V6.2z" />
      <path d="M9.4 11.6l1.9 1.9 3.5-3.6" />
    </>
  ),
  // reuse rather than redo
  cache: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
      <path d="M20.5 4.2v4.6h-4.6" />
    </>
  ),
  // one root, many mounts
  project: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <path d="M12 7.2v3.6M5.5 19v-2.6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2V19M12 10.8v3.6" />
      <circle cx="5.5" cy="20.4" r="1.5" />
      <circle cx="18.5" cy="20.4" r="1.5" />
    </>
  ),
}

function FeatureIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <title>{name}</title>
      {ICONS[name]}
    </svg>
  )
}

export default function Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-28"
    >
      <Reveal className="mb-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Fast by <span className="hive-text">architecture</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          Parallelism, one parse per file, a constant number of transform
          passes, and incremental builds. Each one is a multiplier that darklua
          can't retrofit.
        </p>
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.title} delay={(i % 3) * 0.1} className="h-full">
            <Tilt className="h-full">
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="hive-card group h-full rounded-2xl p-6 transition-colors hover:border-hive/35"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  aria-hidden="true"
                  className="mb-4 inline-flex h-11 w-11 select-none items-center justify-center rounded-xl border border-hive/20 bg-hive/5 text-hive transition-shadow group-hover:hive-glow"
                  style={{ transform: 'translateZ(28px)' }}
                >
                  <FeatureIcon name={feature.icon} />
                </div>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ transform: 'translateZ(18px)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {feature.body}
                </p>
              </motion.article>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
