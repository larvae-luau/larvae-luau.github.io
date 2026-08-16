'use client'

import Reveal from '@/components/Reveal'

const ROWS = [
  {
    dimension: 'Parallelism',
    larvae: 'All cores, every stage',
    darklua: 'Single-threaded since 2021 (#55)',
  },
  {
    dimension: 'Rewriting',
    larvae: 'Byte range splices, no second tree',
    darklua: 'Two tree representations, double allocation',
  },
  {
    dimension: 'Rojo project files',
    larvae: 'One, the build project is derived',
    darklua: 'Two, kept in sync by hand',
  },
  {
    dimension: 'Incremental builds',
    larvae: 'Resolution-aware cache + watch mode',
    darklua: 'None (#228 open)',
  },
  {
    dimension: 'Runtime validation',
    larvae: 'Realm and clone aware, refuses broken requires',
    darklua: 'None, disk resolution only',
  },
  {
    dimension: 'Native string requires',
    larvae: 'First-class output target with aliases',
    darklua: 'Instance chains from a sourcemap only',
  },
  {
    dimension: 'Rule coverage',
    larvae: "36 shipped, 27 of darklua's names plus 9 it does not have",
    darklua: '32 rules today',
  },
  {
    dimension: 'Formatting & linting',
    larvae: 'Built in, with stylua and selene parity',
    darklua: 'Separate tools',
  },
  {
    dimension: 'Custom transforms',
    larvae: 'Worms: Luau, wasm, or a native binary',
    darklua: 'Fork the project',
  },
]

export default function Comparison() {
  return (
    <section
      id="comparison"
      className="relative mx-auto max-w-5xl scroll-mt-24 px-6 py-28"
    >
      <Reveal className="mb-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Where it <span className="hive-text">pulls ahead</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          These are structural differences. The numbers below are the receipts.
        </p>
      </Reveal>

      <Reveal>
        <div className="hive-card overflow-hidden rounded-2xl">
          <div className="grid grid-cols-[1fr_1.2fr_1.2fr] gap-x-4 border-b border-hive/15 bg-hive/5 px-6 py-4 text-sm font-semibold">
            <span className="select-none text-muted">&nbsp;</span>
            <span className="text-hive">larvae</span>
            <span className="text-muted">darklua</span>
          </div>
          {ROWS.map((row, i) => (
            <Reveal key={row.dimension} delay={i * 0.05}>
              <div className="grid grid-cols-[1fr_1.2fr_1.2fr] gap-x-4 border-b border-hive/8 px-6 py-4 text-sm last:border-b-0">
                <span className="font-medium">{row.dimension}</span>
                <span className="text-foreground/90">
                  <svg
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                    className="mr-2 inline-block h-2.5 w-2.5 shrink-0 align-[0.02em] text-hive"
                  >
                    <title>yes</title>
                    <circle
                      cx="6"
                      cy="6"
                      r="4.2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                    />
                  </svg>
                  {row.larvae}
                </span>
                <span className="text-muted">{row.darklua}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
