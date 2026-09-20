export function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1).replace(/\.0$/, "")}K`
  return `${views}`
}

export function relativeDateEs(iso: string): string {
  const diffDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)),
  )
  if (diffDays <= 0) return "hoy"
  if (diffDays === 1) return "ayer"
  if (diffDays < 30) return `hace ${diffDays} días`
  const months = Math.floor(diffDays / 30)
  if (months < 12) return months === 1 ? "hace 1 mes" : `hace ${months} meses`
  const years = Math.floor(months / 12)
  return years === 1 ? "hace 1 año" : `hace ${years} años`
}
