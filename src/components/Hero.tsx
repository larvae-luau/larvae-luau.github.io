'use client'

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type Variants,
} from 'motion/react'
import Image from 'next/image'
import { type ReactNode, useState } from 'react'
import IceButton from '@/components/IceButton'
import IcyBackdrop from '@/components/IcyBackdrop'
import Tilt from '@/components/Tilt'
import { useDisabledEffects } from '@/lib/debug-flags'
import logo from '@/lib/logo'
import { currentRelease } from '@/lib/release'
import useLiteMotion from '@/lib/use-lite-motion'

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const spring = { type: 'spring', stiffness: 90, damping: 16 } as const

const word: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(12px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: spring },
}

/* Same entrance without the per-frame filter re-rasterization. */
const liteWord: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: spring },
}

const CONTENT_CLASS =
  'relative z-10 flex max-w-4xl flex-col items-center text-center'

/**
 * Drifts the hero up and out as you scroll past it. Split out so that the
 * scroll listener is never even attached on the devices that skip the effect.
 */
function ScrollFade({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 700], [0, 180])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])

  return (
    <motion.div style={{ y, opacity }} className={CONTENT_CLASS}>
      {children}
    </motion.div>
  )
}

const HEADLINE = ['Preprocess', 'Luau', 'at', 'sub-zero', 'speed.']

const INSTALLS = [
  { id: 'lpm', command: 'lpm tool add coldluau' },
  { id: 'lpx', command: 'lpx coldluau' },
  { id: 'cargo', command: 'cargo install --path .' },
] as const

type InstallId = (typeof INSTALLS)[number]['id']

export default function Hero() {
  const lite = useLiteMotion()
  const off = useDisabledEffects()
  const release = currentRelease()
  const [installer, setInstaller] = useState<InstallId>('lpm')
  const active = INSTALLS.find((i) => i.id === installer) ?? INSTALLS[0]

  const content = (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 60, damping: 12 }}
        className="mb-8"
      >
        <motion.div
          animate={off.has('float') ? undefined : { y: 6 }}
          initial={off.has('float') ? undefined : { y: -6 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          /* Pinning the layer for the whole session only pays off where the
             logo also carries a filter, which on touch it no longer does. */
          style={lite ? undefined : { willChange: 'transform' }}
          className="relative"
        >
          {/* The wide half of the glow, as a gradient rather than a second
              drop-shadow. Chained drop-shadows blur the first shadow along
              with the artwork, and WebKit's box-blur approximation turns that
              into a visible rectangle behind a transparent PNG.
              Touch drops the remaining drop-shadow too and picks up its cyan
              inner stop here instead. A filter under a transform that never
              stops running is a layer iOS re-rasterizes rather than reuses. */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -inset-10 rounded-full ${
              lite
                ? 'bg-[radial-gradient(circle,rgba(135,253,255,0.20),transparent_45%),radial-gradient(circle,rgba(90,167,255,0.22),transparent_70%)]'
                : 'bg-[radial-gradient(circle,rgba(90,167,255,0.22),transparent_70%)]'
            }`}
          />
          <Tilt max={14}>
            <Image
              src={logo}
              alt="coldluau logo"
              width={130}
              height={130}
              priority
              draggable={false}
              className={`relative select-none ${
                lite
                  ? ''
                  : 'filter-[drop-shadow(0_0_18px_rgba(135,253,255,0.4))]'
              }`}
            />
          </Tilt>
        </motion.div>
      </motion.div>

      <motion.a
        href={release.url}
        target="_blank"
        rel="noreferrer"
        title={
          release.published
            ? 'Read the release notes'
            : 'No release published yet'
        }
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        data-testid="release-badge"
        className="mb-5 select-none rounded-full border border-ice/20 bg-ice/5 px-4 py-1.5 font-mono text-xs tracking-widest text-ice uppercase transition-colors hover:border-ice/40 hover:bg-ice/10"
      >
        Rust-powered Luau preprocessor · {release.label}
      </motion.a>

      <motion.h1
        variants={container}
        initial="hidden"
        animate="show"
        className="text-5xl font-bold tracking-tight text-balance sm:text-7xl"
      >
        {HEADLINE.map((w, i) => (
          <motion.span
            key={w}
            variants={lite ? liteWord : word}
            className={`motion-blur inline-block ${i > 0 ? 'ml-[0.28em]' : ''} ${
              w === 'sub-zero' ? 'ice-text' : ''
            }`}
          >
            {w}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-6 max-w-2xl text-lg text-muted text-pretty"
      >
        Parallel, incremental, and realm aware, with native Roblox string
        requires that no other tool emits. Written in Rust, designed to leave
        darklua out in the cold.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <IceButton href="/docs/getting-started/quick-start">
          Get started
        </IceButton>
        <IceButton
          href="https://github.com/coldluau/cli"
          variant="ghost"
          external
        >
          View on GitHub
        </IceButton>
      </motion.div>

      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          opacity: { delay: 1.2, duration: 0.8 },
          layout: { type: 'spring', stiffness: 260, damping: 26 },
        }}
        data-testid="install-command"
        /* The command cannot wrap, so at the full size the three toggles plus
           the longest command overrun a phone by about thirty pixels. Tighter
           spacing and a step down in type buy that back without truncating,
           and max-w-full keeps the chip inside the viewport regardless. */
        className="frost-card relative mt-12 flex max-w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2.5 font-mono text-xs text-muted sm:gap-4 sm:px-4 sm:text-sm"
      >
        <div className="flex shrink-0 select-none gap-1 border-r border-ice/10 pr-3">
          {INSTALLS.map((option) => (
            <motion.button
              key={option.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setInstaller(option.id)}
              className={`relative rounded-md px-2 py-1 text-xs transition-colors ${
                installer === option.id
                  ? 'text-background'
                  : 'text-muted hover:text-ice'
              }`}
            >
              {installer === option.id && (
                <motion.span
                  layoutId="install-pill"
                  className="absolute inset-0 rounded-md bg-ice"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative">{option.id}</span>
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={active.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap"
          >
            {/* the prompt is chrome: dragging the line copies just the command */}
            <span aria-hidden="true" className="select-none text-ice">
              ${' '}
            </span>
            {active.command}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </>
  )

  return (
    /* The padding is what keeps the logo clear of the fixed navbar. Centering
       alone stops working the moment the content is taller than the viewport,
       which is every phone, and the overflow then splits evenly across the top
       and bottom edges. min-h-svh means the section just grows instead. */
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24">
      <IcyBackdrop />

      {lite ? (
        <div className={CONTENT_CLASS}>{content}</div>
      ) : (
        <ScrollFade>{content}</ScrollFade>
      )}

      {/* Below the fold once the hero outgrows the viewport, so it would be an
          infinite animation nobody sees. */}
      {!lite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 1.6, duration: 2.4, repeat: Infinity }}
          className="absolute bottom-8 z-10 select-none text-2xl text-ice/60"
          aria-hidden="true"
        >
          ↓
        </motion.div>
      )}
    </section>
  )
}
