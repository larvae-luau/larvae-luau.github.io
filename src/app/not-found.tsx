import type { Metadata } from 'next'
import Image from 'next/image'
import Embers from '@/components/Embers'
import GlowButton from '@/components/GlowButton'
import MissingPath from '@/components/MissingPath'
import logo from '@/lib/logo'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'That page is not here.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="relative flex flex-1 flex-col">
      <Embers />

      {/* same aurora and ridges as the hero, held still */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[34rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,230,148,0.14),transparent_62%)] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-2/3 opacity-70 [background-image:radial-gradient(1px_1px_at_18%_22%,#cfeeff_50%,transparent_51%),radial-gradient(1px_1px_at_38%_48%,#9fdcff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_62%_18%,#eaf6ff_50%,transparent_51%),radial-gradient(1px_1px_at_82%_36%,#cfeeff_50%,transparent_51%)]" />
        <svg
          aria-hidden="true"
          className="absolute bottom-0 h-[38%] w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            d="M0 320 L0 220 L220 120 L420 210 L620 110 L820 205 L1020 120 L1240 215 L1440 130 L1440 320 Z"
            fill="#0b1526"
          />
          <path
            d="M620 110 L660 134 L583 134 Z M1020 120 L1056 140 L971 140 Z"
            fill="rgba(16,230,148,0.24)"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-background" />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
        <Image
          src={logo}
          alt=""
          width={84}
          height={84}
          draggable={false}
          className="mb-8 select-none opacity-80 filter-[drop-shadow(0_0_16px_rgba(16,230,148,0.35))]"
        />

        <p className="mb-4 select-none font-mono text-6xl font-bold tracking-tight sm:text-7xl">
          <span className="hive-text">404</span>
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          This one drifted off
        </h1>
        <p className="mt-4 max-w-md text-muted text-pretty">
          Nothing lives at that address. It may have moved when the docs were
          reorganised, or the link that brought you here was already stale.
        </p>

        <MissingPath />

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <GlowButton href="/docs">Browse the docs</GlowButton>
          <GlowButton href="/" variant="ghost">
            Back to the start
          </GlowButton>
        </div>
      </main>
    </div>
  )
}
