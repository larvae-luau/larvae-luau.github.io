'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import GlowButton from '@/components/GlowButton'
import logo from '@/lib/logo'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#showcase', label: 'Requires' },
  { href: '#comparison', label: 'vs darklua' },
  { href: '#benchmarks', label: 'Benchmarks' },
  { href: '#quick-start', label: 'Quick start' },
]

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 80, damping: 16 }}
      className="fixed inset-x-0 top-0 z-40"
    >
      {/* select-none inherits: the whole nav is chrome, nothing worth copying */}
      <nav className="hive-card mx-auto mt-4 flex max-w-5xl select-none items-center justify-between rounded-2xl px-5 py-3">
        <a href="#top" className="flex items-center gap-3">
          <Image
            src={logo}
            alt=""
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-semibold tracking-tight">
            lar<span className="text-hive">vae</span>
          </span>
        </a>
        <div className="hidden items-center gap-6 text-sm text-muted sm:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-hive"
            >
              {link.label}
            </a>
          ))}
        </div>
        {/* Docs and GitHub leave the page, so they read as buttons while the
            links above are just in-page scrolls */}
        <div className="flex items-center gap-2">
          <GlowButton href="/docs" size="sm">
            Docs
          </GlowButton>
          <GlowButton
            href="https://github.com/larvae-luau/larvae"
            variant="ghost"
            size="sm"
            external
          >
            GitHub
          </GlowButton>
        </div>
      </nav>
    </motion.header>
  )
}
