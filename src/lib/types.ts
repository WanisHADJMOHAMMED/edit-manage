export type ProjectStage = 'incoming' | 'pre-production' | 'shooting' | 'editing' | 'delivered'
export type EditorSpecialty = 'talking_head' | 'motion' | 'both'
export type StakeholderRole = 'filmmaker' | 'media_face' | 'voiceover' | 'scriptwriter' | 'editor'

export interface ProjectType {
  id: string
  name: string
  default_duration_hours: number
  color: string
  created_at: string
}

export interface Editor {
  id: string
  full_name: string
  specialty: EditorSpecialty
  contact_info: string
  notes: string
  is_active: boolean
  created_at: string
}

export interface Project {
  id: string
  client_name: string
  project_type_id: string | null
  deal_price: number
  deadline: string | null
  stage: ProjectStage
  notes: string
  created_at: string
  updated_at: string
  // Joined relations
  project_type?: ProjectType | null
  stakeholders?: Stakeholder[]
  editor_assignments?: EditorAssignment[]
}

export interface Stakeholder {
  id: string
  project_id: string
  role: StakeholderRole
  name: string
  editor_id: string | null
  cost: number
}

export interface EditorAssignment {
  id: string
  editor_id: string
  project_id: string
  start_date: string
  end_date: string
  created_at: string
  // Joined
  editor?: Editor
  project?: Project
}

export const STAGES: ProjectStage[] = [
  'incoming',
  'pre-production',
  'shooting',
  'editing',
  'delivered',
]

export const STAGE_LABELS: Record<ProjectStage, string> = {
  incoming: 'Incoming',
  'pre-production': 'Pre-production',
  shooting: 'Shooting',
  editing: 'Editing',
  delivered: 'Delivered',
}

export const STAGE_COLORS: Record<ProjectStage, string> = {
  incoming: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  'pre-production': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  shooting: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  editing: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  delivered: 'text-green-400 bg-green-500/10 border-green-500/20',
}

export const STAKEHOLDER_LABELS: Record<StakeholderRole, string> = {
  filmmaker: 'Filmmaker',
  media_face: 'Media Face',
  voiceover: 'Voice Over',
  scriptwriter: 'Scriptwriter',
  editor: 'Editor',
}

export const SPECIALTY_LABELS: Record<EditorSpecialty, string> = {
  talking_head: 'Talking Head',
  motion: 'Motion Design',
  both: 'Both',
}
