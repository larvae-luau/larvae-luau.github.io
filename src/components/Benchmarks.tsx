'use client'

import { motion } from 'motion/react'
import Reveal from '@/components/Reveal'

interface Matchup {
  coldluau: number
  darklua: number
  speedup: string
}

interface Run {
  label: string
  detail: string
  /** The headline, both tools running the same 10 rules. */
  sameRules: Matchup
  /** darklua with no rules at all, coldluau still rewriting every require. */
  parseOnly: Matchup
  /** darklua's own default stack, which coldluau cannot match yet. */
  darkluaDefault: number
  incremental: { cold: number; warm: number; edit: number; check: number }
  note?: string
}

const RUNS: Run[] = [
  {
    label: '3,000 files',
    detail: 'synthetic project',
    sameRules: { coldluau: 35, darklua: 493, speedup: '14.0x' },
    parseOnly: { coldluau: 24, darklua: 430, speedup: '17.9x' },
    darkluaDefault: 571,
    incremental: { cold: 24, warm: 14, edit: 13, check: 21 },
  },
  {
    label: '5,000 files',
    detail: 'synthetic project',
    sameRules: { coldluau: 57, darklua: 799, speedup: '14.0x' },
    parseOnly: { coldluau: 40, darklua: 703, speedup: '17.5x' },
    darkluaDefault: 938,
    incremental: { cold: 40, warm: 22, edit: 22, check: 37 },
  },
  {
    label: '1 large file',
    detail: 'single 3.5 MB module',
    sameRules: { coldluau: 140, darklua: 1450, speedup: '10.3x' },
    parseOnly: { coldluau: 16, darklua: 1206, speedup: '75.3x' },
    darkluaDefault: 1605,
    incremental: { cold: 16, warm: 3, edit: 3, check: 80 },
    note: 'Rules cost far more here than require rewriting does, 140 ms against 16 ms, because one enormous module gives the thread pool nothing to split. It is the workload coldluau wins by the smallest margin once rules are on.',
  },
]

const WORKLOADS = [
  {
    term: 'same rules',
    definition: 'both tools run 10 matching rules with retain_lines',
  },
  {
    term: 'parse only',
    definition: 'darklua runs no rules, coldluau still rewrites every require',
  },
  {
    term: 'darklua default',
    definition:
      'darklua’s own default stack plus its dense generator, which coldluau has neither of yet',
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
          The headline is the matched comparison, both tools cold on the same
          tree running the same 10 rules. 16 cores, 7 runs per cell, median
          reported, coldluau 0.1.0 against darklua 0.19.0.
        </p>
      </Reveal>

      <Reveal className="mb-6">
        <div className="frost-card rounded-2xl p-6">
          <p className="mb-4 select-none font-mono text-xs tracking-widest text-ice/70 uppercase">
            the three workloads
          </p>
          <dl className="flex flex-col gap-2">
            {WORKLOADS.map((workload) => (
              <div key={workload.term} className="flex gap-3 text-sm">
                <dt className="w-32 shrink-0 font-mono text-xs leading-6 text-ice">
                  {workload.term}
                </dt>
                <dd className="text-muted">{workload.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      <div className="flex flex-col gap-6">
        {RUNS.map((run, i) => (
          <Reveal key={run.label} delay={i * 0.12}>
            <div className="frost-card rounded-2xl p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{run.label}</h3>
                  <p className="select-none text-xs text-muted">{run.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-block rounded-full border border-ice/25 bg-ice/10 px-3 py-1 font-mono text-sm font-semibold text-ice">
                    {run.sameRules.speedup} faster
                  </span>
                  <p className="mt-1 select-none font-mono text-[0.65rem] text-muted">
                    same rules, both cold
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Bar
                  label="coldluau"
                  ms={run.sameRules.coldluau}
                  max={run.sameRules.darklua}
                  accent
                  delay={0.15}
                />
                <Bar
                  label="darklua"
                  ms={run.sameRules.darklua}
                  max={run.sameRules.darklua}
                  accent={false}
                  delay={0.25}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-ice/10 pt-4 font-mono text-xs">
                <span>
                  <span className="select-none text-muted">parse only </span>
                  <span className="text-foreground/80">
                    {run.parseOnly.coldluau} ms
                  </span>
                  <span className="select-none text-muted"> vs </span>
                  <span className="text-foreground/80">
                    {run.parseOnly.darklua} ms
                  </span>
                  <span className="text-ice"> {run.parseOnly.speedup}</span>
                </span>
                <span>
                  <span className="select-none text-muted">
                    darklua default{' '}
                  </span>
                  <span className="text-foreground/80">
                    {run.darkluaDefault} ms
                  </span>
                </span>
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

      <Reveal delay={0.15} className="mt-6">
        <div className="frost-card rounded-2xl p-6">
          <p className="mb-1 select-none font-mono text-xs tracking-widest text-ice/70 uppercase">
            incremental, ours alone
          </p>
          <p className="mb-5 text-sm text-muted">
            darklua has no cache, so every darklua run is a cold run and these
            columns have no counterpart.
          </p>
          <div
            data-testid="incremental-table"
            className="code-scroll overflow-x-auto"
          >
            <table className="w-full min-w-[26rem] border-collapse font-mono text-xs">
              <thead>
                <tr className="select-none text-left text-muted">
                  <th className="pb-2 font-normal">files</th>
                  <th className="pb-2 text-right font-normal">cold</th>
                  <th className="pb-2 text-right font-normal">warm</th>
                  <th className="pb-2 text-right font-normal">one edit</th>
                  <th className="pb-2 text-right font-normal">check</th>
                </tr>
              </thead>
              <tbody>
                {RUNS.map((run) => (
                  <tr key={run.label} className="border-t border-ice/8">
                    <td className="py-2 text-foreground/80">{run.label}</td>
                    <td className="py-2 text-right text-ice">
                      {run.incremental.cold} ms
                    </td>
                    <td className="py-2 text-right text-foreground/80">
                      {run.incremental.warm} ms
                    </td>
                    <td className="py-2 text-right text-foreground/80">
                      {run.incremental.edit} ms
                    </td>
                    <td className="py-2 text-right text-foreground/80">
                      {run.incremental.check} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2} className="mt-6">
        <div className="frost-card flex flex-wrap items-center justify-center gap-x-10 gap-y-3 rounded-2xl p-6 text-center">
          <p className="select-none font-mono text-xs tracking-widest text-ice/70 uppercase">
            stripped binary
          </p>
          <p className="font-mono text-sm">
            <span className="text-ice">coldluau 4.8 MB</span>
            <span className="select-none text-muted"> against </span>
            <span className="text-foreground/80">darklua 19.2 MB</span>
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.25}>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
          On the matched rows coldluau is also doing require rewriting that
          darklua is not. darklua can convert requires from a rojo sourcemap,
          but that needs a separate rojo run, so it is left off rather than
          timed unfairly. No speedup is claimed against darklua’s default stack,
          because coldluau has neither that rule set nor a dense generator yet.
        </p>
      </Reveal>
    </section>
  )
}
