'use client'

import { useMemo } from 'react'
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { Briefcase, CheckCircle, TrendingUp, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { calcMargin, formatDZD } from '@/lib/utils'

interface KPICardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  iconBg: string
  delay?: number
}

function KPICard({ label, value, sub, icon, iconBg, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 380, damping: 28, delay }}
      whileHover={{ y: -5, transition: { type: 'spring' as const, stiffness: 500, damping: 25 } }}
      className="glass rounded-2xl p-5 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-navy/50 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
      <p className="text-navy text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-navy/45 text-xs mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function KPICards() {
  const { projects } = useApp()

  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const active = projects.filter((p) => p.stage !== 'delivered')
    const delivered = projects.filter((p) => p.stage === 'delivered')
    const deliveredThisMonth = delivered.filter((p) => {
      try {
        return isWithinInterval(parseISO(p.updated_at), { start: monthStart, end: monthEnd })
      } catch { return false }
    })

    const totalPipeline = active.reduce((s, p) => s + (p.deal_price ?? 0), 0)

    const marginsAll = projects
      .filter((p) => (p.deal_price ?? 0) > 0)
      .map((p) => {
        const totalCost = (p.stakeholders ?? []).reduce((s, sh) => s + (sh.cost || 0), 0)
        return calcMargin(p.deal_price ?? 0, totalCost).marginPct
      })

    const avgMargin = marginsAll.length > 0
      ? marginsAll.reduce((s, m) => s + m, 0) / marginsAll.length
      : 0

    return { active: active.length, deliveredThisMonth: deliveredThisMonth.length, totalPipeline, avgMargin }
  }, [projects])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Active Projects"
        value={String(stats.active)}
        sub="in pipeline"
        icon={<Briefcase size={17} color="#0A60AD" />}
        iconBg="rgba(10,96,173,0.12)"
        delay={0}
      />
      <KPICard
        label="Delivered This Month"
        value={String(stats.deliveredThisMonth)}
        sub="projects completed"
        icon={<CheckCircle size={17} color="#10b981" />}
        iconBg="rgba(16,185,129,0.12)"
        delay={0.06}
      />
      <KPICard
        label="Active Pipeline"
        value={formatDZD(stats.totalPipeline)}
        sub="total deal value"
        icon={<DollarSign size={17} color="#2AA4E7" />}
        iconBg="rgba(42,164,231,0.12)"
        delay={0.12}
      />
      <KPICard
        label="Avg Margin"
        value={`${Math.round(stats.avgMargin)}%`}
        sub="across all projects"
        icon={<TrendingUp size={17} color="#f59e0b" />}
        iconBg="rgba(245,158,11,0.12)"
        delay={0.18}
      />
    </div>
  )
}
