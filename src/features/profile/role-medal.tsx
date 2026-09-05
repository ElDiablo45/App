import type { RoleMedal } from "./role-medals"

interface RoleMedalBadgeProps {
  medal: RoleMedal
  dateLabel?: string
}

export function RoleMedalBadge({ medal, dateLabel }: RoleMedalBadgeProps) {
  const Icon = medal.icon

  return (
    <span className="hunt-medal" style={{ color: medal.color }} tabIndex={0}>
      {Icon ? (
        <Icon size={14} aria-hidden="true" />
      ) : (
        <span className="hunt-medal-dot" aria-hidden="true" />
      )}
      <span className="hunt-medal-tip" role="tooltip">
        <strong>{medal.title}</strong>
        {medal.description ? <span>{medal.description}</span> : null}
        {dateLabel ? <span>{dateLabel}</span> : null}
      </span>
    </span>
  )
}
