'use client'

import { startOfDay, isAfter, isBefore, addDays, format } from 'date-fns'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import type { Editor, EditorAssignment, Project } from '@/lib/types'

type EditorStatus = { status: 'available' | 'busy' | 'soon'; freeDate: Date | null; project: string | null }

function getEditorStatus(editor: Editor, assignments: EditorAssignment[]): EditorStatus {
  const now = startOfDay(new Date())
  const editorA = assignments
    .filter((a) => a.editor_id === editor.id)
    .filter((a) => isAfter(new Date(a.end_date), now))
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

  const current = editorA.find(
    (a) => isBefore(new Date(a.start_date), now) && isAfter(new Date(a.end_date), now),
  )

  if (!current) return { status: 'available', freeDate: null, project: null }

  const freeDate = new Date(current.end_date)
  const soonThreshold = addDays(now, 1)
  const isSoon = isBefore(freeDate, soonThreshold)
  const projectName = (current.project as Project | undefined)?.client_name ?? 'Project'

  return { status: isSoon ? 'soon' : 'busy', freeDate, project: projectName }
}

const STATUS_STYLES = {
  available: { dot: '#10b981', label: 'Available', text: 'text-emerald-600', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  soon:      { dot: '#f59e0b', label: 'Frees up soon', text: 'text-amber-600', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  busy:      { dot: '#ef4444', label: 'Busy', text: 'text-red-500', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
}

export default function EditorListMobile() {
  const { editors, editorAssignments } = useApp()

  const withStatus = editors
    .map((e) => ({ editor: e, ...getEditorStatus(e, editorAssignments) }))
    .sort((a, b) => {
      const order = { available: 0, soon: 1, busy: 2 }
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
      if (a.freeDate && b.freeDate) return a.freeDate.getTime() - b.freeDate.getTime()
      return 0
    })

  if (withStatus.length === 0) {
    return (
      <div className="glass rounded-2xl py-16 text-center text-navy/35 text-sm">
        No editors added yet. Add editors in Settings.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {withStatus.map(({ editor, status, freeDate, project }, i) => {
        const s = STATUS_STYLES[status]
        return (
          <motion.div
            key={editor.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring' as const, stiffness: 400, damping: 28 }}
            className="glass rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: s.dot }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-navy font-semibold text-sm truncate">{editor.full_name}</p>
                <span
                  className="text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0"
                  style={{ background: 'rgba(42,164,231,0.1)', color: '#0A60AD', border: '1px solid rgba(42,164,231,0.2)' }}
                >
                  {editor.specialty.replace('_', ' ')}
                </span>
              </div>
              <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
              {project && <p className="text-navy/45 text-xs mt-0.5 truncate">Working on: {project}</p>}
              {freeDate && <p className="text-navy/45 text-xs">Free: {format(freeDate, 'dd MMM yyyy')}</p>}
            </div>
            <div
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: s.bg, color: s.dot, border: `1px solid ${s.border}` }}
            >
              {status === 'available' ? '✓ Free' : status === 'soon' ? 'Soon' : 'Busy'}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
