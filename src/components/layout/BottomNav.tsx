'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Kanban, Calendar, DollarSign, Settings, LayoutDashboard } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/availability', label: 'Avail.', icon: Calendar },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-nav">
      <div className="grid grid-cols-5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 py-3 relative">
              {active && (
                <motion.div
                  layoutId="bottom-active"
                  className="absolute inset-x-2 inset-y-1 rounded-xl bg-brand/12"
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={cn(
                  'relative flex flex-col items-center gap-1 transition-colors',
                  active ? 'text-brand' : 'text-navy/45',
                )}
              >
                <Icon size={18} />
                <span className="text-[9px] font-medium">{label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
