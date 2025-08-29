import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ApiResponse, User } from '@/types'

// Validation schema for login request
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          message: validationResult.error.errors[0].message
        } as ApiResponse,
        { status: 400 }
      )
    }
    
    const { email, password } = validationResult.data
    
    // TODO: Replace with actual authentication logic
    // This should:
    // 1. Query the database for user with email
    // 2. Verify password hash
    // 3. Generate JWT token
    // 4. Return user data and token
    
    // Mock authentication for development
    if (email === 'demo@example.com' && password === 'password') {
      const user: User = {
        id: '1',
        email: email,
        name: 'Demo User',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const token = 'mock_jwt_token_' + Date.now()
      
      const response = NextResponse.json(
        {
          success: true,
          data: { user, token },
          message: 'Login successful'
        } as ApiResponse,
        { status: 200 }
      )
      
      // Set HTTP-only cookie for token
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      return response
    }
    
    // Invalid credentials
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      } as ApiResponse,
      { status: 401 }
    )
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      } as ApiResponse,
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'GET method is not supported for this endpoint'
    } as ApiResponse,
    { status: 405 }
  )
}