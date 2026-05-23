import type { ProjectType } from '@/lib/types'

interface BadgeProps {
  projectType?: ProjectType | null
  small?: boolean
}

export default function Badge({ projectType, small }: BadgeProps) {
  if (!projectType) return null
  const color = projectType.color || '#2AA4E7'

  return (
    <span
      className="inline-flex items-center rounded-full font-semibold"
      style={{
        backgroundColor: color + '18',
        border: `1px solid ${color}35`,
        color,
        fontSize: small ? '10px' : '11px',
        padding: small ? '2px 8px' : '3px 10px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {projectType.name}
    </span>
  )
}
