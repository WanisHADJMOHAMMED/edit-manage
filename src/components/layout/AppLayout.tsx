'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #E9FCFF 0%, #A9EFFB 45%, #E8EBEF 100%)' }}
    >
      {/* Animated blobs */}
      <div className="blob blob-1" aria-hidden />
      <div className="blob blob-2" aria-hidden />
      <div className="blob blob-3" aria-hidden />

      <Sidebar />
      <BottomNav />

      <main className="relative z-10 lg:pl-56 pb-16 lg:pb-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
