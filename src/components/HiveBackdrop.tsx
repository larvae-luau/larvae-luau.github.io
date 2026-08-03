'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import useLiteMotion from '@/lib/use-lite-motion'

/** The three eyes, as a pulsing sigil rather than a static mark. */
const EYES = [
  { cx: 720, cy: 96, delay: 0 },
  { cx: 604, cy: 296, delay: 0.45 },
  { cx: 836, cy: 296, delay: 0.9 },
]

/**
 * Layered depths behind the hero: a green bloom, drifting spores, the three
 * eye sigil, and parallax chitin ridges that separate as you scroll.
 */
export default function HiveBackdrop() {
  const { scrollY } = useScroll()
  const lite = useLiteMotion()
  const farY = useTransform(scrollY, [0, 900], [0, 120])
  const midY = useTransform(scrollY, [0, 900], [0, 230])
  const nearY = useTransform(scrollY, [0, 900], [0, 350])
  const sigilY = useTransform(scrollY, [0, 700], [0, -80])
  const bloomOpacity = useTransform(scrollY, [0, 600], [1, 0])

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Bloom */}
      <motion.div
        style={{ opacity: bloomOpacity }}
        className="absolute inset-0"
      >
        <div className="absolute -top-48 left-1/2 h-[46rem] w-[84rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,230,148,0.18),transparent_62%)] blur-2xl" />
        <div className="absolute -top-24 left-[10%] h-[30rem] w-[34rem] rotate-12 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(166,255,87,0.1),transparent_66%)] blur-3xl" />
        <div className="absolute top-16 right-[6%] h-[28rem] w-[32rem] -rotate-12 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,230,148,0.12),transparent_66%)] blur-3xl" />
      </motion.div>

      {/* Spore motes, static specks so the canvas keeps the moving work */}
      <div className="absolute inset-x-0 top-0 h-2/3 opacity-60 [background-image:radial-gradient(1px_1px_at_12%_18%,#7dffc4_50%,transparent_51%),radial-gradient(1px_1px_at_28%_42%,#a6ff57_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_44%_12%,#c9ffe6_50%,transparent_51%),radial-gradient(1px_1px_at_63%_30%,#7dffc4_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_78%_16%,#a6ff57_50%,transparent_51%),radial-gradient(1px_1px_at_88%_38%,#c9ffe6_50%,transparent_51%)]" />

      {/* The sigil */}
      <motion.svg
        aria-hidden="true"
        style={{ y: lite ? undefined : sigilY }}
        className="absolute top-1/2 left-1/2 h-[54rem] w-[54rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
        viewBox="0 0 1440 460"
        fill="none"
      >
        <title>hive sigil</title>
        {EYES.map((eye) => (
          <motion.g
            key={`${eye.cx}-${eye.cy}`}
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{
              duration: 5.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: eye.delay,
            }}
          >
            <circle
              cx={eye.cx}
              cy={eye.cy}
              r="86"
              stroke="#10e694"
              strokeWidth="26"
            />
            <circle
              cx={eye.cx}
              cy={eye.cy}
              r="34"
              stroke="#a6ff57"
              strokeWidth="16"
            />
          </motion.g>
        ))}
      </motion.svg>

      {/* Chitin ridges */}
      <motion.svg
        aria-hidden="true"
        style={{ y: farY }}
        className="absolute bottom-0 h-[44%] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <title>far ridge</title>
        <path
          d="M0 320 L0 210 Q120 120 240 190 Q360 260 470 150 Q580 60 700 170 Q820 270 940 160 Q1060 60 1180 170 Q1300 270 1440 140 L1440 320 Z"
          fill="#07160f"
        />
        <path
          d="M470 150 Q580 60 700 170"
          stroke="rgba(16,230,148,0.3)"
          strokeWidth="2"
          fill="none"
        />
      </motion.svg>
      <motion.svg
        aria-hidden="true"
        style={{ y: midY }}
        className="absolute bottom-0 h-[36%] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <title>middle ridge</title>
        <path
          d="M0 320 L0 240 Q160 150 320 220 Q480 290 620 180 Q760 80 900 200 Q1040 300 1200 190 Q1320 110 1440 210 L1440 320 Z"
          fill="#05100b"
        />
        <path
          d="M620 180 Q760 80 900 200"
          stroke="rgba(166,255,87,0.16)"
          strokeWidth="2"
          fill="none"
        />
      </motion.svg>
      <motion.svg
        aria-hidden="true"
        style={{ y: nearY }}
        className="absolute bottom-0 h-[26%] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <title>near ridge</title>
        <path
          d="M0 320 L0 260 Q220 170 440 250 Q660 330 880 230 Q1100 130 1440 250 L1440 320 Z"
          fill="#030a07"
        />
      </motion.svg>

      {/* Fade into the page background */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
    </div>
  )
}
