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

export interface LiveChannel {
  id: string
  username: string
  thumbUrl: string
  offline?: boolean
}

export interface NewMember {
  id: string
  name: string
  avatarUrl: string
  sinceLabel: string
  flags: string[]
}
