'use client'

import { motion, useScroll, useTransform } from 'motion/react'

/**
 * Layered snowy-mountain scene behind the hero: aurora glow, drifting mist,
 * and three parallax mountain ridges that separate as you scroll.
 */
export default function IcyBackdrop() {
  const { scrollY } = useScroll()
  const farY = useTransform(scrollY, [0, 900], [0, 120])
  const midY = useTransform(scrollY, [0, 900], [0, 220])
  const nearY = useTransform(scrollY, [0, 900], [0, 340])
  const auroraOpacity = useTransform(scrollY, [0, 600], [1, 0])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      {/* Aurora */}
      <motion.div
        style={{ opacity: auroraOpacity }}
        className="absolute inset-0"
      >
        <div className="absolute -top-40 left-1/2 h-168 w-7xl -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(135,253,255,0.16),transparent_60%)] blur-2xl" />
        <div className="absolute -top-24 left-[12%] h-120 w-136 rotate-12 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(90,167,255,0.13),transparent_65%)] blur-3xl" />
        <div className="absolute top-10 right-[8%] h-104 w-120 -rotate-12 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(160,120,255,0.1),transparent_65%)] blur-3xl" />
      </motion.div>

      {/* Stars */}
      <div className="absolute inset-x-0 top-0 h-2/3 opacity-70 bg-[radial-gradient(1px_1px_at_12%_18%,#cfeeff_50%,transparent_51%),radial-gradient(1px_1px_at_28%_42%,#9fdcff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_44%_12%,#eaf6ff_50%,transparent_51%),radial-gradient(1px_1px_at_63%_30%,#cfeeff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_78%_16%,#9fdcff_50%,transparent_51%),radial-gradient(1px_1px_at_88%_38%,#eaf6ff_50%,transparent_51%)]" />

      {/* Mountain ridges */}
      <motion.svg
        aria-hidden="true"
        style={{ y: farY }}
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
        style={{ y: midY }}
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
        style={{ y: nearY }}
        className="absolute bottom-0 h-[28%] w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          d="M0 320 L0 250 L260 150 L520 240 L760 140 L1020 250 L1240 170 L1440 260 L1440 320 Z"
          fill="#050b16"
        />
      </motion.svg>

      {/* Ground fade into the page background */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
    </div>
  )
}
