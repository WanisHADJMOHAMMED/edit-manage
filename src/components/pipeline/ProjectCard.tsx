'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, User, Trash2, X, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Project } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import { formatDZD, formatDate, calcMargin, marginDot } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

interface Props {
  project: Project
  onClick: () => void
  isDragOverlay?: boolean
}

export default function ProjectCard({ project, onClick, isDragOverlay }: Props) {
  const { deleteProject, duplicateProject } = useApp()
  const [confirming, setConfirming] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: project.id,
    disabled: isDragOverlay || confirming,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  }

  const stakeholders = project.stakeholders ?? []
  const totalCost = stakeholders.reduce((s, sh) => s + (sh.cost || 0), 0)
  const { marginPct } = calcMargin(project.deal_price || 0, totalCost)
  const editor = (project.editor_assignments ?? [])[0]?.editor

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteProject(project.id)
  }

  const handleConfirmClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirming(true)
  }

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirming(false)
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDuplicating(true)
    await duplicateProject(project.id)
    setDuplicating(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...(isDragOverlay ? {} : listeners)}
      {...(isDragOverlay ? {} : attributes)}
    >
      <motion.div
        whileHover={!isDragging && !confirming && !isDragOverlay ? { y: -4, scale: 1.015 } : undefined}
        whileTap={!confirming ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 28 }}
        onClick={(e) => { if (!confirming) { e.stopPropagation(); onClick() } }}
        className="glass-sm rounded-2xl p-3.5 mb-2.5 select-none cursor-grab active:cursor-grabbing relative group"
      >
        {/* Confirm delete overlay */}
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 z-10"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-navy text-xs font-semibold">Delete this project?</p>
            <div className="flex gap-2">
              <motion.button
                onClick={handleCancelClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-silver text-navy/60 hover:text-navy text-xs transition-colors"
              >
                <X size={11} /> Cancel
              </motion.button>
              <motion.button
                onClick={handleDelete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs transition-colors"
              >
                <Trash2 size={11} /> Delete
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-navy font-semibold text-sm leading-snug line-clamp-1">
            {project.client_name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: marginDot(marginPct) }}
              title={`Margin: ${Math.round(marginPct)}%`}
            />
            <motion.button
              onClick={handleDuplicate}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              disabled={duplicating}
              className="opacity-0 group-hover:opacity-100 text-navy/30 hover:text-brand transition-all p-0.5 rounded-lg disabled:opacity-40"
              title="Duplicate project"
            >
              <Copy size={12} />
            </motion.button>
            <motion.button
              onClick={handleConfirmClick}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="opacity-0 group-hover:opacity-100 text-navy/30 hover:text-red-500 transition-all p-0.5 rounded-lg"
              title="Delete project"
            >
              <Trash2 size={12} />
            </motion.button>
          </div>
        </div>

        {/* Badge */}
        <div className="mb-2">
          <Badge projectType={project.project_type} small />
        </div>

        {/* Editor */}
        {(project.stage === 'editing' || project.stage === 'delivered') && editor && (
          <div className="flex items-center gap-1 text-navy/50 text-xs mb-2">
            <User size={11} />
            <span className="truncate">{editor.full_name}</span>
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-navy font-bold text-xs">
            {formatDZD(project.deal_price || 0)}
          </span>
          {project.deadline && (
            <div className="flex items-center gap-1 text-navy/45 text-[11px]">
              <Calendar size={10} />
              <span>{formatDate(project.deadline)}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
