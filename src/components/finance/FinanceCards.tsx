'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Trash2, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/lib/types'
import { STAGE_LABELS } from '@/lib/types'
import { useApp } from '@/context/AppContext'
import Badge from '@/components/ui/Badge'
import { formatDZD, calcMargin, marginBg } from '@/lib/utils'
import ProjectDetailModal from '@/components/project/ProjectDetailModal'

export default function FinanceCards() {
  const { projects, projectTypes, deleteProject } = useApp()
  const [filterStage, setFilterStage] = useState('')
  const [filterType, setFilterType] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
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
  }, [projects, filterStage, filterType])

  const summary = useMemo(() => {
    const total = rows.reduce((s, r) => s + (r.p.deal_price ?? 0), 0)
    const totalCost = rows.reduce((s, r) => s + r.totalCost, 0)
    const totalMargin = rows.reduce((s, r) => s + r.margin, 0)
    return { total, totalCost, totalMargin }
  }, [rows])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="flex-1 text-xs">
          <option value="">All Stages</option>
          {Object.entries(STAGE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="flex-1 text-xs">
          <option value="">All Types</option>
          {projectTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        <AnimatePresence>
          {rows.map(({ p, filmmakerCost, mediaFaceCost, voiceOverCost, scriptwriterCost, editorCost, totalCost, margin, marginPct }, i) => {
            const isOpen = expanded === p.id
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04, type: 'spring' as const, stiffness: 400, damping: 28 }}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-stretch">
                  <button
                    className="flex-1 text-left p-4"
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-navy font-semibold text-sm">{p.client_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge projectType={p.project_type} small />
                          <span className="text-navy/45 text-[10px]">{STAGE_LABELS[p.stage]}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-navy font-bold text-sm">{formatDZD(p.deal_price ?? 0)}</p>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${marginBg(marginPct)}`}>
                          {Math.round(marginPct)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-navy/50">
                      <span>Margin: <span className="text-navy font-semibold">{formatDZD(margin)}</span></span>
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex flex-col items-center justify-center px-3 gap-1 border-l border-white/40">
                    <motion.button
                      onClick={() => setEditProject(p)}
                      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                      className="p-2 text-navy/25 hover:text-brand hover:bg-brand/10 rounded-xl transition-colors"
                      title="Edit project"
                    >
                      <Pencil size={13} />
                    </motion.button>

                    <AnimatePresence mode="wait">
                      {confirmId === p.id ? (
                        <motion.div
                          key="confirm"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col gap-1"
                        >
                          <button
                            onClick={() => { deleteProject(p.id); setConfirmId(null) }}
                            className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] whitespace-nowrap font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="px-2 py-1 rounded-lg border border-silver text-navy/50 text-[10px]"
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
                          className="p-2 text-navy/25 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={13} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Expanded cost breakdown */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/40 px-4 pb-4 pt-3 space-y-1.5">
                        {filmmakerCost > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-navy/50">Filmmaker</span>
                            <span className="text-navy font-medium">{formatDZD(filmmakerCost)}</span>
                          </div>
                        )}
                        {mediaFaceCost > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-navy/50">Media Face</span>
                            <span className="text-navy font-medium">{formatDZD(mediaFaceCost)}</span>
                          </div>
                        )}
                        {voiceOverCost > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-navy/50">Voice Over</span>
                            <span className="text-navy font-medium">{formatDZD(voiceOverCost)}</span>
                          </div>
                        )}
                        {scriptwriterCost > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-navy/50">Scriptwriter</span>
                            <span className="text-navy font-medium">{formatDZD(scriptwriterCost)}</span>
                          </div>
                        )}
                        {editorCost > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-navy/50">Editor</span>
                            <span className="text-navy font-medium">{formatDZD(editorCost)}</span>
                          </div>
                        )}
                        <div className="border-t border-white/40 pt-1.5 flex justify-between text-xs font-semibold">
                          <span className="text-navy/60">Total Cost</span>
                          <span className="text-navy">{formatDZD(totalCost)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Summary bar */}
      {rows.length > 0 && (
        <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:left-56 glass-nav px-4 py-3 z-20">
          <div className="flex justify-around text-center gap-4">
            <div>
              <p className="text-[10px] text-navy/45 uppercase font-semibold">Pipeline</p>
              <p className="text-navy text-xs font-bold">{formatDZD(summary.total)}</p>
            </div>
            <div>
              <p className="text-[10px] text-navy/45 uppercase font-semibold">Costs</p>
              <p className="text-navy text-xs font-bold">{formatDZD(summary.totalCost)}</p>
            </div>
            <div>
              <p className="text-[10px] text-navy/45 uppercase font-semibold">Margin</p>
              <p className="text-navy text-xs font-bold">{formatDZD(summary.totalMargin)}</p>
            </div>
          </div>
        </div>
      )}

      {editProject && (
        <ProjectDetailModal project={editProject} onClose={() => setEditProject(null)} />
      )}
    </div>
  )
}
