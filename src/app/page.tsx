import Benchmarks from '@/components/Benchmarks'
import CodeShowcase from '@/components/CodeShowcase'
import Comparison from '@/components/Comparison'
import Features from '@/components/Features'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Navbar from '@/components/Navbar'
import PerfProbe from '@/components/PerfProbe'
import QuickStart from '@/components/QuickStart'
import Snowfall from '@/components/Snowfall'
import { PROBE_AVAILABLE } from '@/lib/debug-flags'

export default function Home() {
  return (
    <div id="top" className="relative flex flex-1 flex-col">
      <Snowfall />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <CodeShowcase />
        <Comparison />
        <Benchmarks />
        <QuickStart />
      </main>
      <Footer />
      {PROBE_AVAILABLE && <PerfProbe />}
    </div>
  )
}
