'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase'
import type {
  Project,
  Editor,
  ProjectType,
  EditorAssignment,
  Stakeholder,
} from '@/lib/types'

interface AppContextType {
  projects: Project[]
  editors: Editor[]
  projectTypes: ProjectType[]
  editorAssignments: EditorAssignment[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>

  createProject: (data: Partial<Project>) => Promise<Project | null>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  createEditor: (data: Partial<Editor>) => Promise<Editor | null>
  updateEditor: (id: string, data: Partial<Editor>) => Promise<void>
  deleteEditor: (id: string) => Promise<void>

  createProjectType: (data: Partial<ProjectType>) => Promise<ProjectType | null>
  updateProjectType: (id: string, data: Partial<ProjectType>) => Promise<void>
  deleteProjectType: (id: string) => Promise<void>

  saveStakeholders: (projectId: string, stakeholders: Omit<Stakeholder, 'id' | 'project_id'>[]) => Promise<void>

  createAssignment: (data: Omit<EditorAssignment, 'id' | 'created_at' | 'editor' | 'project'>) => Promise<EditorAssignment | null>
  updateAssignment: (id: string, data: Partial<EditorAssignment>) => Promise<void>
  deleteAssignment: (id: string) => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [editors, setEditors] = useState<Editor[]>([])
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  const [editorAssignments, setEditorAssignments] = useState<EditorAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      const [projectsRes, editorsRes, typesRes, assignmentsRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*, project_type:project_types(*), stakeholders:project_stakeholders(*), editor_assignments(*, editor:editors(*))')
          .order('created_at', { ascending: false }),
        supabase.from('editors').select('*').eq('is_active', true).order('full_name'),
        supabase.from('project_types').select('*').order('name'),
        supabase
          .from('editor_assignments')
          .select('*, editor:editors(*), project:projects(*, project_type:project_types(*))')
          .order('start_date'),
      ])

      if (projectsRes.error) throw projectsRes.error
      if (editorsRes.error) throw editorsRes.error
      if (typesRes.error) throw typesRes.error
      if (assignmentsRes.error) throw assignmentsRes.error

      setProjects((projectsRes.data as Project[]) ?? [])
      setEditors((editorsRes.data as Editor[]) ?? [])
      setProjectTypes((typesRes.data as ProjectType[]) ?? [])
      setEditorAssignments((assignmentsRes.data as EditorAssignment[]) ?? [])
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to load data. Check your Supabase credentials.')
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    refetch().finally(() => setLoading(false))
  }, [refetch])

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'editors' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_types' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_stakeholders' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'editor_assignments' }, () => refetch())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [refetch])

  // ── Project mutations ────────────────────────────────────────
  const createProject = async (data: Partial<Project>): Promise<Project | null> => {
    const { data: row, error } = await supabase
      .from('projects')
      .insert({ client_name: 'New Project', stage: 'incoming', ...data })
      .select()
      .single()
    if (error) { console.error(error); return null }
    await refetch()
    return row as Project
  }

  const updateProject = async (id: string, data: Partial<Project>) => {
    const { error } = await supabase.from('projects').update(data).eq('id', id)
    if (error) console.error(error)

    // When delivered, free up any assignments that haven't ended yet
    if (data.stage === 'delivered') {
      const now = new Date().toISOString()
      await supabase
        .from('editor_assignments')
        .update({ end_date: now })
        .eq('project_id', id)
        .gt('end_date', now)
    }

    await refetch()
  }

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) console.error(error)
    await refetch()
  }

  // ── Editor mutations ─────────────────────────────────────────
  const createEditor = async (data: Partial<Editor>): Promise<Editor | null> => {
    const { data: row, error } = await supabase
      .from('editors')
      .insert({ full_name: 'New Editor', specialty: 'both', ...data })
      .select()
      .single()
    if (error) { console.error(error); return null }
    await refetch()
    return row as Editor
  }

  const updateEditor = async (id: string, data: Partial<Editor>) => {
    const { error } = await supabase.from('editors').update(data).eq('id', id)
    if (error) console.error(error)
    await refetch()
  }

  const deleteEditor = async (id: string) => {
    const { error } = await supabase.from('editors').update({ is_active: false }).eq('id', id)
    if (error) console.error(error)
    await refetch()
  }

  // ── Project type mutations ───────────────────────────────────
  const createProjectType = async (data: Partial<ProjectType>): Promise<ProjectType | null> => {
    const { data: row, error } = await supabase
      .from('project_types')
      .insert({ name: 'New Type', default_duration_hours: 24, color: '#3B82F6', ...data })
      .select()
      .single()
    if (error) { console.error(error); return null }
    await refetch()
    return row as ProjectType
  }

  const updateProjectType = async (id: string, data: Partial<ProjectType>) => {
    const { error } = await supabase.from('project_types').update(data).eq('id', id)
    if (error) console.error(error)
    await refetch()
  }

  const deleteProjectType = async (id: string) => {
    const { error } = await supabase.from('project_types').delete().eq('id', id)
    if (error) console.error(error)
    await refetch()
  }

  // ── Stakeholder mutations ────────────────────────────────────
  const saveStakeholders = async (
    projectId: string,
    newStakeholders: Omit<Stakeholder, 'id' | 'project_id'>[],
  ) => {
    await supabase.from('project_stakeholders').delete().eq('project_id', projectId)
    const toInsert = newStakeholders
      .filter((s) => s.name.trim() !== '' || s.cost > 0)
      .map((s) => ({ ...s, project_id: projectId }))
    if (toInsert.length > 0) {
      const { error } = await supabase.from('project_stakeholders').insert(toInsert)
      if (error) console.error(error)
    }
    await refetch()
  }

  // ── Assignment mutations ─────────────────────────────────────
  const createAssignment = async (
    data: Omit<EditorAssignment, 'id' | 'created_at' | 'editor' | 'project'>,
  ): Promise<EditorAssignment | null> => {
    const { data: row, error } = await supabase
      .from('editor_assignments')
      .insert(data)
      .select()
      .single()
    if (error) { console.error(error); return null }
    await refetch()
    return row as EditorAssignment
  }

  const updateAssignment = async (id: string, data: Partial<EditorAssignment>) => {
    const { error } = await supabase.from('editor_assignments').update(data).eq('id', id)
    if (error) console.error(error)
    await refetch()
  }

  const deleteAssignment = async (id: string) => {
    const { error } = await supabase.from('editor_assignments').delete().eq('id', id)
    if (error) console.error(error)
    await refetch()
  }

  return (
    <AppContext.Provider
      value={{
        projects, editors, projectTypes, editorAssignments,
        loading, error, refetch,
        createProject, updateProject, deleteProject,
        createEditor, updateEditor, deleteEditor,
        createProjectType, updateProjectType, deleteProjectType,
        saveStakeholders,
        createAssignment, updateAssignment, deleteAssignment,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
