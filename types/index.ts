// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: Date
}

// Poll Types
export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Poll {
  id: string
  title: string
  description?: string
  options: PollOption[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  isActive: boolean
  allowMultipleVotes: boolean
  isAnonymous: boolean
  totalVotes: number
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  userId?: string // undefined for anonymous votes
  createdAt: Date
  ipAddress?: string
}

// Form Types
export interface CreatePollForm {
  title: string
  description?: string
  options: string[]
  expiresAt?: Date
  allowMultipleVotes: boolean
  isAnonymous: boolean
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Component Props Types
export interface PollCardProps {
  poll: Poll
  showResults?: boolean
  onVote?: (pollId: string, optionId: string) => void
}

export interface PollResultsProps {
  poll: Poll
  userVote?: Vote
}