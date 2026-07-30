'use client'

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type Variants,
} from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import IceButton from '@/components/IceButton'
import IcyBackdrop from '@/components/IcyBackdrop'
import Tilt from '@/components/Tilt'

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const word: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(12px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 90, damping: 16 },
  },
}

const HEADLINE = ['Preprocess', 'Luau', 'at', 'sub-zero', 'speed.']

const INSTALLS = [
  { id: 'lpm', command: 'lpm tool add coldluau' },
  { id: 'lpx', command: 'lpx coldluau' },
  { id: 'cargo', command: 'cargo install --path .' },
] as const

type InstallId = (typeof INSTALLS)[number]['id']

export default function Hero() {
  const { scrollY } = useScroll()
  const contentY = useTransform(scrollY, [0, 700], [0, 180])
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const [installer, setInstaller] = useState<InstallId>('lpm')
  const active = INSTALLS.find((i) => i.id === installer) ?? INSTALLS[0]

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      <IcyBackdrop />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex max-w-4xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 12 }}
          className="mb-8"
        >
          <motion.div
            animate={{ y: 6 }}
            initial={{ y: -6 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
            style={{ willChange: 'transform' }}
          >
            <Tilt max={14}>
              <Image
                src="/coldluautransparent.png"
                alt="coldluau logo"
                width={130}
                height={130}
                priority
                draggable={false}
                className="select-none filter-[drop-shadow(0_0_18px_rgba(135,253,255,0.4))_drop-shadow(0_0_60px_rgba(90,167,255,0.25))]"
              />
            </Tilt>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 select-none rounded-full border border-ice/20 bg-ice/5 px-4 py-1.5 font-mono text-xs tracking-widest text-ice uppercase"
        >
          Rust-powered Luau preprocessor · v0.1.0
        </motion.p>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="text-5xl font-bold tracking-tight text-balance sm:text-7xl"
        >
          {HEADLINE.map((w, i) => (
            <motion.span
              key={w}
              variants={word}
              className={`inline-block ${i > 0 ? 'ml-[0.28em]' : ''} ${
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
          requires that no other tool emits. Written in Rust to leave darklua
          out in the cold.
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
            href="https://github.com/coldluau/coldluau"
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
          className="frost-card relative mt-12 flex items-center gap-4 overflow-hidden rounded-xl px-4 py-2.5 font-mono text-sm text-muted"
        >
          <div className="flex select-none gap-1 border-r border-ice/10 pr-3">
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 1.6, duration: 2.4, repeat: Infinity }}
        className="absolute bottom-8 z-10 select-none text-2xl text-ice/60"
        aria-hidden="true"
      >
        ↓
      </motion.div>
    </section>
  )
}
