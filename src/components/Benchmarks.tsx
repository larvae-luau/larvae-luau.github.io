'use client'

import { motion } from 'motion/react'
import Reveal from '@/components/Reveal'

interface Workload {
  label: string
  detail: string
  cold: number
  warm: number
  edit: number
  check: number
  darklua: number
  speedup: string
  /** Shown under the card when a number needs context. */
  note?: string
}

const COLUMNS = [
  { term: 'cold', definition: 'first build, empty cache' },
  { term: 'warm', definition: 'rebuild with nothing changed' },
  { term: 'one edit', definition: 'rebuild after touching a single file' },
  {
    term: 'check',
    definition: 'whole-project require validation, parses everything',
  },
  {
    term: 'darklua',
    definition: 'parse and print with every rule off, the least work it can do',
  },
]

const WORKLOADS: Workload[] = [
  {
    label: '3,000 files',
    detail: 'synthetic project',
    cold: 27,
    warm: 14,
    edit: 15,
    check: 22,
    darklua: 441,
    speedup: '16.3x',
  },
  {
    label: '5,000 files',
    detail: 'synthetic project',
    cold: 46,
    warm: 23,
    edit: 25,
    check: 36,
    darklua: 705,
    speedup: '15.3x',
  },
  {
    label: '1 large file',
    detail: 'single 3.5 MB module',
    cold: 17,
    warm: 3,
    edit: 3,
    check: 79,
    darklua: 1356,
    speedup: '79.7x',
    note: 'check is the only column that costs more than a cold build here. It is whole-project validation rather than a build, so one 3.5 MB module is the worst case for it, and it still comes in 17x under darklua.',
  },
]

function Bar({
  label,
  ms,
  max,
  accent,
  delay,
}: {
  label: string
  ms: number
  max: number
  accent: boolean
  delay: number
}) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr_5rem] items-center gap-3">
      {/* chart chrome; the timing beside the bar stays copyable */}
      <span
        className={`select-none font-mono text-xs ${
          accent ? 'text-ice' : 'text-muted'
        }`}
      >
        {label}
      </span>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: ms / max }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ type: 'spring', stiffness: 60, damping: 18, delay }}
          className={`h-full min-w-1 origin-left rounded-full ${
            accent ? 'bg-linear-to-r from-ice to-glacier' : 'bg-muted/35'
          }`}
        />
      </div>
      <span
        className={`text-right font-mono text-xs ${
          accent ? 'text-ice' : 'text-foreground/70'
        }`}
      >
        {ms} ms
      </span>
    </div>
  )
}

export default function Benchmarks() {
  return (
    <section
      id="benchmarks"
      className="relative mx-auto max-w-4xl scroll-mt-24 px-6 py-28"
    >
      <Reveal className="mb-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Cold, hard <span className="ice-text">numbers</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          Full require rewriting in coldluau against darklua 0.19 with an empty
          rule list, so darklua only parses and reprints. Mean of 5 runs.
        </p>
      </Reveal>

      <Reveal className="mb-6">
        <div className="frost-card rounded-2xl p-6">
          <p className="mb-4 select-none font-mono text-xs tracking-widest text-ice/70 uppercase">
            how to read this
          </p>
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {COLUMNS.map((column) => (
              <div key={column.term} className="flex gap-3 text-sm">
                <dt className="w-20 shrink-0 font-mono text-xs leading-6 text-ice">
                  {column.term}
                </dt>
                <dd className="text-muted">{column.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      <div className="flex flex-col gap-6">
        {WORKLOADS.map((run, i) => (
          <Reveal key={run.label} delay={i * 0.12}>
            <div className="frost-card rounded-2xl p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{run.label}</h3>
                  <p className="select-none text-xs text-muted">{run.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-block rounded-full border border-ice/25 bg-ice/10 px-3 py-1 font-mono text-sm font-semibold text-ice">
                    {run.speedup} faster
                  </span>
                  <p className="mt-1 select-none font-mono text-[0.65rem] text-muted">
                    cold vs darklua
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Bar
                  label="coldluau"
                  ms={run.cold}
                  max={run.darklua}
                  accent
                  delay={0.15}
                />
                <Bar
                  label="darklua"
                  ms={run.darklua}
                  max={run.darklua}
                  accent={false}
                  delay={0.25}
                />
              </div>

              {/* incremental modes darklua has no equivalent for */}
              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-ice/10 pt-4 font-mono text-xs">
                {[
                  { key: 'warm', value: run.warm },
                  { key: 'one edit', value: run.edit },
                  { key: 'check', value: run.check },
                ].map((mode) => (
                  <span key={mode.key}>
                    <span className="select-none text-muted">{mode.key} </span>
                    <span className="text-foreground/80">{mode.value} ms</span>
                  </span>
                ))}
              </div>

              {run.note && (
                <p className="mt-4 border-t border-ice/8 pt-4 text-xs leading-relaxed text-muted">
                  {run.note}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
          The bars compare cold builds. Warm, one edit, and check have no
          darklua counterpart because darklua has no cache, and note that a
          one-file edit costs barely more than a fully warm run. darklua is
          doing strictly less work than coldluau in every row here, since it
          runs no rules and rewrites nothing.
        </p>
      </Reveal>
    </section>
  )
}
