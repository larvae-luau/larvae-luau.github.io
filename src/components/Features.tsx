'use client'

import { motion } from 'motion/react'
import Reveal from '@/components/Reveal'
import Tilt from '@/components/Tilt'

const FEATURES = [
  {
    icon: '❄',
    title: 'Parallel by architecture',
    body: 'Every file is processed across all cores with rayon. darklua is single threaded and has been since its parallelize issue was filed in 2021.',
  },
  {
    icon: '🧊',
    title: 'Splices, not reprints',
    body: 'Rewrites are byte range splices into the original source, so untouched bytes are never printed again. No second AST either.',
  },
  {
    icon: '🌨',
    title: 'Native string requires',
    body: 'Expand @alias imports into require("@game/...") paths the Roblox engine understands natively. No Instance chains, output stays diff-able.',
  },
  {
    icon: '🏔',
    title: 'Realm-aware validation',
    body: 'check catches requires that pass on disk but fail in a running game: server/client realm violations, Starter-container clones, and wait semantics.',
  },
  {
    icon: '🌬',
    title: 'Incremental & watch',
    body: 'The cache key covers the whole resolution environment, not just file bytes, so it is never stale. Watch mode keeps the last good output when a save fails to lex.',
  },
  {
    icon: '🧩',
    title: 'One Rojo project file',
    body: 'default.project.json stays the source of truth and coldluau derives the build project from it, instead of the two hand synced files darklua needs.',
  },
]

export default function Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-28"
    >
      <Reveal className="mb-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Fast by <span className="ice-text">architecture</span>
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
                className="frost-card group h-full rounded-2xl p-6 transition-colors hover:border-ice/35"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  aria-hidden="true"
                  className="mb-4 inline-flex h-11 w-11 select-none items-center justify-center rounded-xl border border-ice/20 bg-ice/5 text-xl transition-shadow group-hover:ice-glow"
                  style={{ transform: 'translateZ(28px)' }}
                >
                  {feature.icon}
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
