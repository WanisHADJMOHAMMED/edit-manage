'use client'

import { useState } from 'react'
import {
  startOfDay, addDays, format, differenceInDays, isToday, max, min,
} from 'date-fns'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { EditorAssignment, Project } from '@/lib/types'
import { useApp } from '@/context/AppContext'

const DAY_PX = 72
const ROW_H = 64
const LABEL_W = 180
const DAYS = 14

function hexOpacity(hex: string, alpha: number) {
  return hex + Math.round(alpha * 255).toString(16).padStart(2, '0')
}

function hasConflict(assignments: EditorAssignment[], editorId: string) {
  const editorA = assignments.filter((a) => a.editor_id === editorId)
  for (let i = 0; i < editorA.length; i++) {
    for (let j = i + 1; j < editorA.length; j++) {
      const a = new Date(editorA[i].start_date), b = new Date(editorA[i].end_date)
      const c = new Date(editorA[j].start_date), d = new Date(editorA[j].end_date)
      if (a < d && b > c) return true
    }
  }
  return false
}

export default function GanttTimeline() {
  const { editors, editorAssignments } = useApp()
  const [windowStart, setWindowStart] = useState(startOfDay(new Date()))

  const windowEnd = addDays(windowStart, DAYS)
  const totalWidth = DAYS * DAY_PX
  const days = Array.from({ length: DAYS }, (_, i) => addDays(windowStart, i))
  const today = startOfDay(new Date())
  const todayOffset = differenceInDays(today, windowStart) * DAY_PX

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/50">
        <motion.button
          onClick={() => setWindowStart((d) => addDays(d, -7))}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="p-1.5 rounded-xl hover:bg-white/50 text-navy/50 hover:text-navy transition-colors"
        >
          <ChevronLeft size={16} />
        </motion.button>
        <motion.button
          onClick={() => setWindowStart(startOfDay(new Date()))}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="text-xs px-3 py-1.5 rounded-xl border border-brand/30 text-brand hover:bg-brand/10 font-medium transition-colors"
        >
          Today
        </motion.button>
        <motion.button
          onClick={() => setWindowStart((d) => addDays(d, 7))}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="p-1.5 rounded-xl hover:bg-white/50 text-navy/50 hover:text-navy transition-colors"
        >
          <ChevronRight size={16} />
        </motion.button>
        <span className="text-navy font-semibold text-sm ml-1">
          {format(windowStart, 'd MMM')} — {format(addDays(windowEnd, -1), 'd MMM yyyy')}
        </span>
      </div>

      {/* Gantt */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: LABEL_W + totalWidth }}>
          {/* Header */}
          <div className="flex sticky top-0 z-10 bg-white/30 backdrop-blur-xl border-b border-white/50">
            <div
              style={{ width: LABEL_W, minWidth: LABEL_W }}
              className="shrink-0 px-4 py-2 text-[10px] text-navy/40 uppercase tracking-wider border-r border-white/40 font-semibold"
            >
              Editor
            </div>
            <div className="flex relative" style={{ width: totalWidth }}>
              {days.map((day, i) => (
                <div
                  key={i}
                  style={{ width: DAY_PX }}
                  className={`shrink-0 py-2 text-center border-r border-white/30 ${isToday(day) ? 'bg-brand/10' : ''}`}
                >
                  <div className={`text-[10px] font-semibold ${isToday(day) ? 'text-brand' : 'text-navy/40'}`}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-xs font-bold ${isToday(day) ? 'text-brand' : 'text-navy'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {editors.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-navy/35 text-sm">
              No editors added yet. Add editors in Settings.
            </div>
          ) : (
            editors.map((editor) => {
              const assignments = editorAssignments.filter((a) => a.editor_id === editor.id)
              const conflict = hasConflict(editorAssignments, editor.id)

              return (
                <div key={editor.id} className="flex border-b border-white/30 hover:bg-white/25 transition-colors">
                  {/* Label */}
                  <div
                    style={{ width: LABEL_W, minWidth: LABEL_W, height: ROW_H }}
                    className="shrink-0 px-4 flex items-center gap-2 border-r border-white/40"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-navy text-xs font-semibold truncate max-w-[120px]">{editor.full_name}</p>
                        {conflict && (
                          <span title="Schedule conflict">
                            <AlertTriangle size={11} className="text-amber-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-navy/40 text-[10px] truncate">{editor.specialty.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative" style={{ width: totalWidth, height: ROW_H }}>
                    {/* Today column */}
                    {todayOffset >= 0 && todayOffset < totalWidth && (
                      <div
                        className="absolute top-0 bottom-0 pointer-events-none"
                        style={{
                          left: todayOffset,
                          width: DAY_PX,
                          background: 'rgba(42,164,231,0.06)',
                          borderLeft: '1px solid rgba(42,164,231,0.2)',
                        }}
                      />
                    )}

                    {/* Day lines */}
                    {days.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 pointer-events-none"
                        style={{ left: (i + 1) * DAY_PX - 1, borderRight: '1px solid rgba(255,255,255,0.4)' }}
                      />
                    ))}

                    {/* Assignment blocks */}
                    {assignments.map((assignment) => {
                      const aStart = startOfDay(new Date(assignment.start_date))
                      const aEnd = startOfDay(new Date(assignment.end_date))
                      const clippedStart = max([aStart, windowStart])
                      const clippedEnd = min([aEnd, windowEnd])
                      if (clippedStart >= clippedEnd) return null

                      const left = differenceInDays(clippedStart, windowStart) * DAY_PX
                      const width = Math.max(differenceInDays(clippedEnd, clippedStart) * DAY_PX, DAY_PX / 2)

                      const projectType = (assignment.project as Project | undefined)?.project_type
                      const color = projectType?.color ?? '#2AA4E7'
                      const label = (assignment.project as Project | undefined)?.client_name ?? 'Project'

                      const isConflicted = assignments.some((other) => {
                        if (other.id === assignment.id) return false
                        return new Date(assignment.start_date) < new Date(other.end_date) &&
                               new Date(assignment.end_date) > new Date(other.start_date)
                      })

                      return (
                        <div
                          key={assignment.id}
                          className="gantt-block"
                          style={{
                            left,
                            width,
                            backgroundColor: hexOpacity(color, 0.2),
                            borderLeft: `3px solid ${color}`,
                            color,
                            backdropFilter: 'blur(8px)',
                            outline: isConflicted ? '1px solid #f59e0b' : 'none',
                          }}
                          title={`${label} | ${format(aStart, 'dd MMM')} → ${format(aEnd, 'dd MMM')}`}
                        >
                          <span className="truncate">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
