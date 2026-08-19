export interface Document {
  id: string
  title: string
  file_path: string
  thumbnail_path?: string | null
  cycle: string
  category: string
  created_at: string
  is_memoire?: boolean
  fileUrl?: string
  thumbUrl?: string
}

export interface Profile {
  id: string
  full_name: string | null
  cycle: string | null
  role: string
  user_type: string | null
  is_delegate: boolean
  delegate_cycle?: string | null
  delegate_year?: string | null
  created_at: string
}

export interface User extends Profile {
  email: string
}
