'use client'

import { type MotionValue, motion, useScroll, useTransform } from 'motion/react'
import { useDisabledEffects } from '@/lib/debug-flags'
import useLiteMotion from '@/lib/use-lite-motion'

/**
 * Layered snowy-mountain scene behind the hero: aurora glow, drifting mist,
 * and three parallax mountain ridges that separate as you scroll.
 *
 * Touch devices get the same scene without the scroll listener. Four transforms
 * recomputed on every scroll frame is what makes the hero stutter on iOS, and
 * the parallax reads as depth on a slow pointer scroll far more than under a
 * flick with momentum.
 */
export default function IcyBackdrop() {
  const lite = useLiteMotion()
  return lite ? <Scene lite /> : <ParallaxScene />
}

function ParallaxScene() {
  const { scrollY } = useScroll()
  const far = useTransform(scrollY, [0, 900], [0, 120])
  const mid = useTransform(scrollY, [0, 900], [0, 220])
  const near = useTransform(scrollY, [0, 900], [0, 340])
  const aurora = useTransform(scrollY, [0, 600], [1, 0])
  return <Scene far={far} mid={mid} near={near} aurora={aurora} />
}

interface SceneProps {
  lite?: boolean
  far?: MotionValue<number>
  mid?: MotionValue<number>
  near?: MotionValue<number>
  aurora?: MotionValue<number>
}

function Scene({ lite, far, mid, near, aurora }: SceneProps) {
  const off = useDisabledEffects()

  return (
    /* Pinned to one viewport rather than the whole section: the hero grows past
       100svh on a phone, and the ridges belong on the horizon either way. Below
       them the ground fade has already reached the page background. */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-svh select-none overflow-hidden"
    >
      {/* Aurora.
          The desktop version is three oversized divs behind a CSS blur. A blur
          forces each one onto its own rasterized layer at device pixel ratio,
          and the widest is 80rem, so on a 3x phone that single layer is larger
          than the screen it is drawn on. Three of them is enough texture memory
          to push iOS off the GPU path, which is why the top of the page stayed
          slow after the rest of this was fixed and recovered the moment the
          hero scrolled away. Touch collapses them into one unfiltered element:
          a radial gradient is already a soft falloff, so the blur was buying
          very little to begin with. */}
      {off.has('aurora') ? null : lite ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_45%_at_50%_8%,rgba(135,253,255,0.16),transparent_60%),radial-gradient(ellipse_60%_32%_at_14%_14%,rgba(90,167,255,0.13),transparent_65%),radial-gradient(ellipse_55%_28%_at_88%_22%,rgba(160,120,255,0.1),transparent_65%)]" />
      ) : (
        <motion.div style={{ opacity: aurora }} className="absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-168 w-7xl -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(135,253,255,0.16),transparent_60%)] blur-2xl" />
          <div className="absolute -top-24 left-[12%] h-120 w-136 rotate-12 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(90,167,255,0.13),transparent_65%)] blur-3xl" />
          <div className="absolute top-10 right-[8%] h-104 w-120 -rotate-12 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(160,120,255,0.1),transparent_65%)] blur-3xl" />
        </motion.div>
      )}

      {/* Stars */}
      {!off.has('stars') && (
        <div className="absolute inset-x-0 top-0 h-2/3 opacity-70 bg-[radial-gradient(1px_1px_at_12%_18%,#cfeeff_50%,transparent_51%),radial-gradient(1px_1px_at_28%_42%,#9fdcff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_44%_12%,#eaf6ff_50%,transparent_51%),radial-gradient(1px_1px_at_63%_30%,#cfeeff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_78%_16%,#9fdcff_50%,transparent_51%),radial-gradient(1px_1px_at_88%_38%,#eaf6ff_50%,transparent_51%)]" />
      )}

      {/* Mountain ridges */}
      {!off.has('ridges') && (
        <>
          <motion.svg
            aria-hidden="true"
            style={{ y: far }}
            className="absolute bottom-0 h-[46%] w-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M0 320 L0 200 L160 120 L300 190 L470 80 L620 170 L780 60 L950 160 L1120 90 L1280 180 L1440 110 L1440 320 Z"
              fill="#0b1526"
            />
            {/* Snow caps: triangle bases sit exactly on the ridge slope lines */}
            <path
              d="M470 80 L510 104 L433 104 Z M780 60 L821 84 L745 84 Z M1120 90 L1156 110 L1071 110 Z"
              fill="rgba(135,253,255,0.28)"
            />
          </motion.svg>
          <motion.svg
            aria-hidden="true"
            style={{ y: mid }}
            className="absolute bottom-0 h-[38%] w-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M0 320 L0 230 L200 130 L380 210 L560 100 L740 200 L920 110 L1100 210 L1260 140 L1440 220 L1440 320 Z"
              fill="#081020"
            />
            <path
              d="M560 100 L600 122 L524 122 Z M920 110 L956 130 L880 130 Z"
              fill="rgba(135,253,255,0.16)"
            />
          </motion.svg>
          <motion.svg
            aria-hidden="true"
            style={{ y: near }}
            className="absolute bottom-0 h-[28%] w-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              d="M0 320 L0 250 L260 150 L520 240 L760 140 L1020 250 L1240 170 L1440 260 L1440 320 Z"
              fill="#050b16"
            />
          </motion.svg>
        </>
      )}

      {/* Ground fade into the page background */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
    </div>
  )
}
