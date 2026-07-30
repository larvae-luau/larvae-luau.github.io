'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import CodeBlock from '@/components/CodeBlock'
import Reveal from '@/components/Reveal'
import Tilt from '@/components/Tilt'

type Tab = 'source' | 'output'

const TABS: { id: Tab; label: string }[] = [
  { id: 'source', label: 'src/main.luau' },
  { id: 'output', label: 'dist/main.luau' },
]

const SNIPPETS: Record<Tab, { code: string; note: string }> = {
  source: {
    code: `const Signal = require('@pkg/signal')
const Config = require('./config')
const Util = require('@self/util')`,
    note: 'You write clean alias imports, backed by coldluau.toml or your .luaurc.',
  },
  output: {
    code: `const Signal = require('@game/ReplicatedStorage/Packages/signal')
const Config = require('./config')
const Util = require('@self/util')`,
    note: 'coldluau emits native string requires the Roblox engine already understands: readable, diff-able, and free of Instance chains.',
  },
}

const TOML = `# coldluau.toml
[aliases]
pkg = '@game/ReplicatedStorage/Packages'`

export default function CodeShowcase() {
  const [tab, setTab] = useState<Tab>('source')

  return (
    <section
      id="showcase"
      className="relative mx-auto max-w-5xl scroll-mt-24 px-6 py-28"
    >
      <Reveal className="mb-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          The gap <span className="ice-text">nobody fills</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          Roblox ships native string requires but no custom aliases. coldluau
          expands your aliases at build time, and no other tool can rewrite into
          that form.
        </p>
      </Reveal>

      {/* min-w-0 keeps the fr tracks fixed when the wider compiled require
          appears; the note below reserves two lines so the row height never
          changes on tab switch, letting both cards stretch to equal height. */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Reveal className="min-w-0">
          <Tilt max={5} className="h-full">
            <div className="frost-card flex h-full flex-col rounded-2xl p-5">
              <p className="mb-3 select-none font-mono text-xs tracking-widest text-ice/70 uppercase">
                config
              </p>
              <CodeBlock code={TOML} lang="toml" />
              <p className="mt-auto border-t border-ice/10 pt-4 text-sm text-muted">
                Aliases merge over your .luaurc, so projects that already define
                them there need no config at all.
              </p>
            </div>
          </Tilt>
        </Reveal>

        <Reveal delay={0.15} className="min-w-0">
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="frost-card h-full overflow-hidden rounded-2xl p-5"
          >
            <div className="mb-4 flex select-none gap-2">
              {TABS.map((t) => (
                <motion.button
                  key={t.id}
                  type="button"
                  whileTap={{ scale: 0.94, y: 1 }}
                  onClick={() => setTab(t.id)}
                  className={`relative rounded-lg px-4 py-1.5 font-mono text-xs transition-colors ${
                    tab === t.id
                      ? 'text-background'
                      : 'text-muted hover:text-ice'
                  }`}
                >
                  {tab === t.id && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-lg bg-ice"
                      transition={{
                        type: 'spring',
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </motion.button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                {/* min-h covers the horizontal scrollbar the longer compiled
                    lines add, so the card height is identical on both tabs */}
                <CodeBlock
                  code={SNIPPETS[tab].code}
                  lang="luau"
                  className="min-h-22.5"
                />
                <p className="mt-4 min-h-14.25 border-t border-ice/10 pt-4 text-sm text-muted">
                  {SNIPPETS[tab].note}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </Reveal>
      </div>
    </section>
  )
}
