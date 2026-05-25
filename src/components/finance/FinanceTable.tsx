'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/lib/types'
import { STAGE_LABELS } from '@/lib/types'
import { useApp } from '@/context/AppContext'
import Badge from '@/components/ui/Badge'
import { formatDZD, calcMargin, marginBg, formatDate } from '@/lib/utils'
import ProjectDetailModal from '@/components/project/ProjectDetailModal'

type SortKey = 'margin' | 'deal_price' | 'deadline' | 'margin_pct'
type SortDir = 'asc' | 'desc'

export default function FinanceTable() {
  const { projects, projectTypes, deleteProject } = useApp()
  const [filterStage, setFilterStage] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('margin_pct')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editProject, setEditProject] = useState<Project | null>(null)

  const rows = useMemo(() => {
    return projects
      .filter((p) => !filterStage || p.stage === filterStage)
      .filter((p) => !filterType || p.project_type_id === filterType)
      .map((p) => {
        const s = p.stakeholders ?? []
        const filmmakerCost     = s.find((sh) => sh.role === 'filmmaker')?.cost ?? 0
        const mediaFaceCost     = s.find((sh) => sh.role === 'media_face')?.cost ?? 0
        const voiceOverCost     = s.find((sh) => sh.role === 'voiceover')?.cost ?? 0
        const scriptwriterCost  = s.find((sh) => sh.role === 'scriptwriter')?.cost ?? 0
        const editorCost        = s.find((sh) => sh.role === 'editor')?.cost ?? 0
        const totalCost = filmmakerCost + mediaFaceCost + voiceOverCost + scriptwriterCost + editorCost
        const { margin, marginPct } = calcMargin(p.deal_price ?? 0, totalCost)
        return { p, filmmakerCost, mediaFaceCost, voiceOverCost, scriptwriterCost, editorCost, totalCost, margin, marginPct }
      })
      .sort((a, b) => {
        let va = 0, vb = 0
        if (sortKey === 'margin') { va = a.margin; vb = b.margin }
        else if (sortKey === 'margin_pct') { va = a.marginPct; vb = b.marginPct }
        else if (sortKey === 'deal_price') { va = a.p.deal_price ?? 0; vb = b.p.deal_price ?? 0 }
        else if (sortKey === 'deadline') {
          va = a.p.deadline ? new Date(a.p.deadline).getTime() : 0
          vb = b.p.deadline ? new Date(b.p.deadline).getTime() : 0
        }
        return sortDir === 'asc' ? va - vb : vb - va
      })
  }, [projects, filterStage, filterType, sortKey, sortDir])

  const summary = useMemo(() => {
    const total = rows.reduce((s, r) => s + (r.p.deal_price ?? 0), 0)
    const totalCost = rows.reduce((s, r) => s + r.totalCost, 0)
    const totalMargin = rows.reduce((s, r) => s + r.margin, 0)
    const avgPct = rows.length > 0 ? rows.reduce((s, r) => s + r.marginPct, 0) / rows.length : 0
    return { total, totalCost, totalMargin, avgPct }
  }, [rows])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 hover:text-navy transition-colors"
    >
      {label}
      <ArrowUpDown size={11} className={sortKey === k ? 'text-brand' : 'text-navy/30'} />
    </button>
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="text-xs" style={{ width: 'auto' }}>
          <option value="">All Stages</option>
          {Object.entries(STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-xs" style={{ width: 'auto' }}>
          <option value="">All Types</option>
          {projectTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto glass rounded-2xl">
        <table className="w-full text-xs min-w-[1060px]">
          <thead>
            <tr className="border-b border-white/50 text-navy/50">
              <th className="text-left px-4 py-3.5 font-semibold">Project</th>
              <th className="text-left px-4 py-3.5 font-semibold">Type</th>
              <th className="text-left px-4 py-3.5 font-semibold">Stage</th>
              <th className="text-right px-4 py-3.5 font-semibold"><SortBtn k="deal_price" label="Deal" /></th>
              <th className="text-right px-4 py-3.5 font-semibold">Filmmaker</th>
              <th className="text-right px-4 py-3.5 font-semibold">Media Face</th>
              <th className="text-right px-4 py-3.5 font-semibold">Voice Over</th>
              <th className="text-right px-4 py-3.5 font-semibold">Scriptwriter</th>
              <th className="text-right px-4 py-3.5 font-semibold">Editor</th>
              <th className="text-right px-4 py-3.5 font-semibold">Total Cost</th>
              <th className="text-right px-4 py-3.5 font-semibold"><SortBtn k="margin" label="Margin" /></th>
              <th className="text-right px-4 py-3.5 font-semibold"><SortBtn k="margin_pct" label="%" /></th>
              <th className="text-right px-4 py-3.5 font-semibold"><SortBtn k="deadline" label="Deadline" /></th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, filmmakerCost, mediaFaceCost, voiceOverCost, scriptwriterCost, editorCost, totalCost, margin, marginPct }, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, type: 'spring' as const, stiffness: 400, damping: 30 }}
                onClick={() => setEditProject(p)}
                className="border-b border-white/30 hover:bg-white/35 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-3 text-navy font-semibold max-w-[140px] truncate">{p.client_name}</td>
                <td className="px-4 py-3"><Badge projectType={p.project_type} small /></td>
                <td className="px-4 py-3 text-navy/55">{STAGE_LABELS[p.stage]}</td>
                <td className="px-4 py-3 text-right text-navy font-medium">{formatDZD(p.deal_price ?? 0)}</td>
                <td className="px-4 py-3 text-right text-navy/50">{filmmakerCost    ? formatDZD(filmmakerCost)    : '—'}</td>
                <td className="px-4 py-3 text-right text-navy/50">{mediaFaceCost    ? formatDZD(mediaFaceCost)    : '—'}</td>
                <td className="px-4 py-3 text-right text-navy/50">{voiceOverCost    ? formatDZD(voiceOverCost)    : '—'}</td>
                <td className="px-4 py-3 text-right text-navy/50">{scriptwriterCost ? formatDZD(scriptwriterCost) : '—'}</td>
                <td className="px-4 py-3 text-right text-navy/50">{editorCost       ? formatDZD(editorCost)       : '—'}</td>
                <td className="px-4 py-3 text-right text-navy font-medium">{formatDZD(totalCost)}</td>
                <td className="px-4 py-3 text-right text-navy font-semibold">{formatDZD(margin)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${marginBg(marginPct)}`}>
                    {Math.round(marginPct)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-navy/50">{formatDate(p.deadline)}</td>
                <td className="px-2 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <AnimatePresence mode="wait">
                    {confirmId === p.id ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className="flex items-center gap-1 justify-end"
                      >
                        <button
                          onClick={() => { deleteProject(p.id); setConfirmId(null) }}
                          className="px-2 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] whitespace-nowrap font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2 py-1 rounded-lg border border-silver text-navy/50 hover:text-navy text-[10px]"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="trash"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setConfirmId(p.id)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-navy/30 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </td>
              </motion.tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={14} className="text-center py-12 text-navy/30">No projects found</td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-white/50 font-semibold bg-white/20">
                <td className="px-4 py-3.5 text-navy/55" colSpan={3}>Total ({rows.length} projects)</td>
                <td className="px-4 py-3.5 text-right text-navy font-bold">{formatDZD(summary.total)}</td>
                <td colSpan={5} />
                <td className="px-4 py-3.5 text-right text-navy font-bold">{formatDZD(summary.totalCost)}</td>
                <td className="px-4 py-3.5 text-right text-navy font-bold">{formatDZD(summary.totalMargin)}</td>
                <td className="px-4 py-3.5 text-right">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${marginBg(summary.avgPct)}`}>
                    {Math.round(summary.avgPct)}%
                  </span>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {editProject && (
        <ProjectDetailModal project={editProject} onClose={() => setEditProject(null)} />
      )}
    </div>
  )
}
