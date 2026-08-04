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
 * Ridge geometry, shared so the parallax and flat variants cannot drift.
 * `depth` is how far the layer travels over the scroll range that drives it.
 */
const RIDGES = [
  {
    id: 'far',
    title: 'far ridge',
    height: 'h-[44%]',
    fill: '#07160f',
    depth: 120,
    d: 'M0 320 L0 210 Q120 120 240 190 Q360 260 470 150 Q580 60 700 170 Q820 270 940 160 Q1060 60 1180 170 Q1300 270 1440 140 L1440 320 Z',
    crest: 'M470 150 Q580 60 700 170',
    crestStroke: 'rgba(16,230,148,0.3)',
  },
  {
    id: 'mid',
    title: 'middle ridge',
    height: 'h-[36%]',
    fill: '#05100b',
    depth: 230,
    d: 'M0 320 L0 240 Q160 150 320 220 Q480 290 620 180 Q760 80 900 200 Q1040 300 1200 190 Q1320 110 1440 210 L1440 320 Z',
    crest: 'M620 180 Q760 80 900 200',
    crestStroke: 'rgba(166,255,87,0.16)',
  },
  {
    id: 'near',
    title: 'near ridge',
    height: 'h-[26%]',
    fill: '#030a07',
    depth: 350,
    d: 'M0 320 L0 260 Q220 170 440 250 Q660 330 880 230 Q1100 130 1440 250 L1440 320 Z',
    crest: null,
    crestStroke: null,
  },
] as const

type Ridge = (typeof RIDGES)[number]

const RIDGE_SVG = 'absolute bottom-0 w-full'
const SIGIL_SVG =
  'absolute top-1/2 left-1/2 h-[54rem] w-[54rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]'

function RidgeShape({ ridge }: { ridge: Ridge }) {
  return (
    <>
      <title>{ridge.title}</title>
      <path d={ridge.d} fill={ridge.fill} />
      {ridge.crest && (
        <path
          d={ridge.crest}
          stroke={ridge.crestStroke ?? undefined}
          strokeWidth="2"
          fill="none"
        />
      )}
    </>
  )
}

/** Sits between the bloom and the sigil in both variants, so it is a component
    rather than a sibling the parent could only render above or below both. */
function SporeMotes() {
  return (
    /* Static specks, so the ember canvas keeps all the moving work */
    <div className="absolute inset-x-0 top-0 h-2/3 opacity-60 [background-image:radial-gradient(1px_1px_at_12%_18%,#7dffc4_50%,transparent_51%),radial-gradient(1px_1px_at_28%_42%,#a6ff57_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_44%_12%,#c9ffe6_50%,transparent_51%),radial-gradient(1px_1px_at_63%_30%,#7dffc4_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_78%_16%,#a6ff57_50%,transparent_51%),radial-gradient(1px_1px_at_88%_38%,#c9ffe6_50%,transparent_51%)]" />
  )
}

/**
 * The full depth: a bloom that fades out under you, eyes that pulse, and three
 * ridges that separate as you scroll.
 *
 * Split out so the scroll listener and the five values derived from it are
 * never even attached on the devices that get the flat version instead.
 */
function ParallaxLayers() {
  const { scrollY } = useScroll()
  const bloomOpacity = useTransform(scrollY, [0, 600], [1, 0])
  const sigilY = useTransform(scrollY, [0, 700], [0, -80])
  const farY = useTransform(scrollY, [0, 900], [0, RIDGES[0].depth])
  const midY = useTransform(scrollY, [0, 900], [0, RIDGES[1].depth])
  const nearY = useTransform(scrollY, [0, 900], [0, RIDGES[2].depth])
  const ridgeY = [farY, midY, nearY]

  return (
    <>
      {/* Bloom */}
      <motion.div
        style={{ opacity: bloomOpacity }}
        className="absolute inset-0"
      >
        <div className="absolute -top-48 left-1/2 h-[46rem] w-[84rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,230,148,0.18),transparent_62%)] blur-2xl" />
        <div className="absolute -top-24 left-[10%] h-[30rem] w-[34rem] rotate-12 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(166,255,87,0.1),transparent_66%)] blur-3xl" />
        <div className="absolute top-16 right-[6%] h-[28rem] w-[32rem] -rotate-12 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,230,148,0.12),transparent_66%)] blur-3xl" />
      </motion.div>

      <SporeMotes />

      {/* The sigil */}
      <motion.svg
        aria-hidden="true"
        style={{ y: sigilY }}
        className={SIGIL_SVG}
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
      {RIDGES.map((ridge, i) => (
        <motion.svg
          key={ridge.id}
          aria-hidden="true"
          style={{ y: ridgeY[i] }}
          className={`${RIDGE_SVG} ${ridge.height}`}
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <RidgeShape ridge={ridge} />
        </motion.svg>
      ))}
    </>
  )
}

/**
 * The same scene, as static paint with no per-frame work behind it.
 *
 * Every layer above is either a large blurred surface or a scroll-linked
 * transform, and mobile Safari re-rasterizes rather than reuses both. The
 * bloom is both at once, which is why the very top of the hero was the worst
 * of it. The blur is the redundant half: a radial gradient already fades to
 * nothing on its own, so a 40px box blur over a 1300px-wide ellipse buys a
 * softness the gradient stops give away for free.
 */
function FlatLayers() {
  return (
    <>
      {/* Bloom, as one element's three background layers rather than three
          composited surfaces. At phone width the originals are far wider than
          the viewport and overlap into a single wash anyway, so the stops here
          are placed for a narrow screen instead of being scaled down from a
          desktop layout that was never visible in full. */}
      <div className="absolute inset-x-0 -top-48 h-[46rem] bg-[radial-gradient(ellipse_at_50%_40%,rgba(16,230,148,0.18),transparent_62%),radial-gradient(ellipse_60%_40%_at_0%_58%,rgba(166,255,87,0.1),transparent_70%),radial-gradient(ellipse_55%_38%_at_100%_66%,rgba(16,230,148,0.12),transparent_70%)]" />

      <SporeMotes />

      {/* The sigil, held at the midpoint of the pulse. Animating it is three
          independent repaint regions inside an 864px SVG, forever, to move
          something rendered at five percent opacity. */}
      <svg
        aria-hidden="true"
        className={SIGIL_SVG}
        viewBox="0 0 1440 460"
        fill="none"
      >
        <title>hive sigil</title>
        {EYES.map((eye) => (
          <g key={`${eye.cx}-${eye.cy}`} opacity="0.65">
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
          </g>
        ))}
      </svg>

      {/* Chitin ridges, at the resting offset the parallax starts from */}
      {RIDGES.map((ridge) => (
        <svg
          key={ridge.id}
          aria-hidden="true"
          className={`${RIDGE_SVG} ${ridge.height}`}
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <RidgeShape ridge={ridge} />
        </svg>
      ))}
    </>
  )
}

/**
 * Layered depths behind the hero: a green bloom, drifting spores, the three
 * eye sigil, and parallax chitin ridges that separate as you scroll.
 */
export default function HiveBackdrop() {
  const lite = useLiteMotion()

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {lite ? <FlatLayers /> : <ParallaxLayers />}

      {/* Fade into the page background */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
    </div>
  )
}
