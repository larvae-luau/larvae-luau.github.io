'use client'

import Reveal from '@/components/Reveal'

const ROWS = [
  {
    dimension: 'Parallelism',
    coldluau: 'All cores, every stage',
    darklua: 'Single-threaded since 2021 (#55)',
  },
  {
    dimension: 'Rewriting',
    coldluau: 'Byte range splices, no second tree',
    darklua: 'Two tree representations, double allocation',
  },
  {
    dimension: 'Rojo project files',
    coldluau: 'One, the build project is derived',
    darklua: 'Two, kept in sync by hand',
  },
  {
    dimension: 'Incremental builds',
    coldluau: 'Resolution-aware cache + watch mode',
    darklua: 'None (#228 open)',
  },
  {
    dimension: 'Runtime validation',
    coldluau: 'Realm and clone aware, refuses broken requires',
    darklua: 'None, disk resolution only',
  },
  {
    dimension: 'Native string requires',
    coldluau: 'First-class output target with aliases',
    darklua: 'Instance chains from a sourcemap only',
  },
  {
    dimension: 'Rule coverage',
    coldluau: 'Four shipped, every darklua name accepted, 27 land in M2',
    darklua: '32 rules today',
  },
  {
    dimension: 'Custom transforms',
    coldluau: 'Luau extensions, planned in M3',
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
          darklua, <span className="ice-text">left in the cold</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          These are structural differences. The numbers below are the receipts.
        </p>
      </Reveal>

      <Reveal>
        <div className="frost-card overflow-hidden rounded-2xl">
          <div className="grid grid-cols-[1fr_1.2fr_1.2fr] gap-x-4 border-b border-ice/15 bg-ice/5 px-6 py-4 text-sm font-semibold">
            <span className="select-none text-muted">&nbsp;</span>
            <span className="text-ice">coldluau</span>
            <span className="text-muted">darklua</span>
          </div>
          {ROWS.map((row, i) => (
            <Reveal key={row.dimension} delay={i * 0.05}>
              <div className="grid grid-cols-[1fr_1.2fr_1.2fr] gap-x-4 border-b border-ice/8 px-6 py-4 text-sm last:border-b-0">
                <span className="font-medium">{row.dimension}</span>
                <span className="text-foreground/90">
                  <span
                    aria-hidden="true"
                    className="mr-2 select-none text-ice"
                  >
                    ❄
                  </span>
                  {row.coldluau}
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
