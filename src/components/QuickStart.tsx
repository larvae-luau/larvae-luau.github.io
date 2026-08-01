'use client'

import CodeBlock from '@/components/CodeBlock'
import Reveal from '@/components/Reveal'

interface Step {
  title: string
  code: string
  body: string
  /** Marks a step whose commands are alternatives rather than a sequence. */
  tag?: string
}

const STEPS: Step[] = [
  {
    title: 'Install',
    tag: 'pick one',
    code: `lpm tool add coldluau
# or
lpx coldluau
# or
cargo install coldluau`,
    body: 'Three separate routes to the same binary, not commands to run in order. lpm adds it as a project tool, lpx runs it once and installs nothing, and cargo pulls the published crate. Prebuilt binaries ship on GitHub releases.',
  },
  {
    title: 'Initialize',
    code: 'coldluau init',
    body: 'Writes a starter coldluau.toml with the editor schema line, and offers to add .coldluau/ and dist/ to your .gitignore. Refuses if a config already exists.',
  },
  {
    title: 'Process, then serve',
    code: `coldluau process
rojo serve .coldluau/build.project.json`,
    body: "coldluau writes dist/ and keeps the derived project file fresh, then you point rojo at it. It never runs rojo for you, serving is rojo's job.",
  },
]

const CLI = `coldluau process     # rewrite requires, run rules
coldluau process -w  # rebuild on change
coldluau check       # validation, the CI gate
coldluau init        # write a starter coldluau.toml
coldluau schema      # refresh the editor schema line
coldluau self        # install, update, uninstall`

export default function QuickStart() {
  return (
    <section
      id="quick-start"
      className="relative mx-auto max-w-5xl scroll-mt-24 px-6 py-28"
    >
      <Reveal className="mb-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Frozen in <span className="ice-text">three steps</span>
        </h2>
      </Reveal>

      {/* min-w-0 or a track refuses to shrink below the widest code line, which
          pushes the card past the viewport and takes the whole page horizontal
          with it. The pre scrolls on its own once the track is allowed to be
          narrower than its content. */}
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.12} className="min-w-0">
            <div className="frost-card flex h-full flex-col rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 select-none items-center justify-center rounded-full border border-ice/30 font-mono text-sm text-ice">
                  {i + 1}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                {step.tag && (
                  <span className="ml-auto select-none rounded-full border border-ice/20 bg-ice/5 px-2 py-0.5 font-mono text-[0.65rem] text-ice/80">
                    {step.tag}
                  </span>
                )}
              </div>
              <CodeBlock
                code={step.code}
                lang="shell"
                className="mb-4 rounded-lg border border-ice/10 bg-background/60 px-4 py-3"
              />
              {/* bottom-aligned so the three descriptions share a baseline */}
              <p className="mt-auto text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-6">
        <div className="frost-card rounded-2xl p-6">
          <p className="mb-3 select-none font-mono text-xs tracking-widest text-ice/70 uppercase">
            the full toolkit
          </p>
          <CodeBlock code={CLI} lang="shell" />
        </div>
      </Reveal>
    </section>
  )
}
