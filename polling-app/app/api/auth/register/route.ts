import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ApiResponse, User } from '@/types'

// Validation schema for registration request
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = registerSchema.safeParse(body)
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
    
    const { name, email, password } = validationResult.data
    
    // TODO: Replace with actual registration logic
    // This should:
    // 1. Check if user already exists
    // 2. Hash the password
    // 3. Create user in database
    // 4. Generate JWT token
    // 5. Return user data and token
    
    // Mock registration for development
    // Check if user already exists (mock check)
    if (email === 'existing@example.com') {
      return NextResponse.json(
        {
          success: false,
          error: 'User already exists',
          message: 'An account with this email already exists'
        } as ApiResponse,
        { status: 409 }
      )
    }
    
    // Create new user (mock)
    const user: User = {
      id: 'user_' + Date.now(),
      email: email,
      name: name,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const token = 'mock_jwt_token_' + Date.now()
    
    const response = NextResponse.json(
      {
        success: true,
        data: { user, token },
        message: 'Registration successful'
      } as ApiResponse,
      { status: 201 }
    )
    
    // Set HTTP-only cookie for token
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    return response
    
  } catch (error) {
    console.error('Registration error:', error)
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