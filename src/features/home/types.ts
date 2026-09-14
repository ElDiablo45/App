export interface NewsItem {
  id: string
  iconLabel: string
  title: string
  body: string
  likes: number
  unread?: boolean
}

export interface FeaturedMember {
  id: string
  name: string
  avatarUrl: string
  flags: string[]
  joinedLabel: string
  logros: string
}
