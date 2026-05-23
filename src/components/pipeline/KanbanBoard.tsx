'use client'

import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { motion } from 'framer-motion'
import type { Project, ProjectStage } from '@/lib/types'
import { STAGES } from '@/lib/types'
import { useApp } from '@/context/AppContext'
import KanbanColumn from './KanbanColumn'
import ProjectCard from './ProjectCard'
import AssignEditorModal from './AssignEditorModal'
import ProjectDetailModal from '@/components/project/ProjectDetailModal'
import NewProjectModal from './NewProjectModal'

export default function KanbanBoard() {
  const { projects, updateProject } = useApp()
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [detailProject, setDetailProject] = useState<Project | null>(null)
  const [pendingProject, setPendingProject] = useState<Project | null>(null)
  const [showAssign, setShowAssign] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const p = projects.find((p) => p.id === event.active.id)
    setActiveProject(p ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveProject(null)
    if (!over) return
    const newStage = over.id as ProjectStage
    const project = projects.find((p) => p.id === active.id)
    if (!project || project.stage === newStage) return
    if (newStage === 'editing' && project.stage !== 'editing') {
      setPendingProject(project)
      setShowAssign(true)
    } else {
      updateProject(project.id, { stage: newStage })
    }
  }

  const byStage = (stage: ProjectStage) => projects.filter((p) => p.stage === stage)

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-5 overflow-x-auto px-6 py-6 min-h-[calc(100dvh-64px)] items-start">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              projects={byStage(stage)}
              onCardClick={(p) => setDetailProject(p)}
              onAddProject={stage === 'incoming' ? () => setShowNew(true) : undefined}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeProject && (
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: 1.05, rotate: 1.5 }}
              style={{ boxShadow: '0 20px 60px rgba(42,164,231,0.22), 0 8px 24px rgba(10,96,173,0.12)' }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 28 }}
            >
              <ProjectCard project={activeProject} onClick={() => {}} isDragOverlay />
            </motion.div>
          )}
        </DragOverlay>
      </DndContext>

      <AssignEditorModal
        open={showAssign}
        project={pendingProject}
        onClose={() => { setShowAssign(false); setPendingProject(null) }}
        onConfirm={() => setPendingProject(null)}
      />

      {detailProject && (
        <ProjectDetailModal
          project={projects.find((p) => p.id === detailProject.id) ?? detailProject}
          onClose={() => setDetailProject(null)}
        />
      )}

      <NewProjectModal open={showNew} onClose={() => setShowNew(false)} />
    </>
  )
}
