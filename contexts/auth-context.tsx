"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import type { User, AuthSession } from "@/types"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // TODO: Replace with actual API call to check authentication status
      const token = localStorage.getItem('auth_token')
      if (token) {
        // Validate token and get user data
        // const response = await fetch('/api/auth/me', {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
        // if (response.ok) {
        //   const userData = await response.json()
        //   setUser(userData)
        // } else {
        //   localStorage.removeItem('auth_token')
        // }
        
        // Placeholder user data for development
        setUser({
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Login failed')
      // }
      // 
      // const { user, token } = await response.json()
      // localStorage.setItem('auth_token', token)
      // setUser(user)

      // Placeholder implementation
      const mockUser: User = {
        id: '1',
        name: 'John Doe',
        email: email,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      localStorage.setItem('auth_token', 'mock_token_123')
      setUser(mockUser)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password })
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Registration failed')
      // }
      // 
      // const { user, token } = await response.json()
      // localStorage.setItem('auth_token', token)
      // setUser(user)

      // Placeholder implementation
      const mockUser: User = {
        id: '2',
        name: name,
        email: email,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      localStorage.setItem('auth_token', 'mock_token_456')
      setUser(mockUser)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    // Redirect to home page
    window.location.href = '/'
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData, updatedAt: new Date() })
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}