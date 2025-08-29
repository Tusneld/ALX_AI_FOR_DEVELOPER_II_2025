import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ApiResponse, Poll, PaginatedResponse, CreatePollForm } from '@/types'

// Validation schema for creating polls
const createPollSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  options: z.array(z.string().min(1, 'Option cannot be empty')).min(2, 'At least 2 options required').max(10, 'Maximum 10 options allowed'),
  expiresAt: z.string().datetime().optional(),
  allowMultipleVotes: z.boolean().default(false),
  isAnonymous: z.boolean().default(false)
})

// Mock polls data - replace with database queries
const mockPolls: Poll[] = [
  {
    id: "1",
    title: "What's your favorite programming language?",
    description: "Help us understand the community's preferences",
    options: [
      { id: "1a", text: "JavaScript", votes: 45 },
      { id: "1b", text: "Python", votes: 38 },
      { id: "1c", text: "TypeScript", votes: 32 },
      { id: "1d", text: "Go", votes: 15 }
    ],
    createdBy: "John Doe",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    isActive: true,
    allowMultipleVotes: false,
    isAnonymous: false,
    totalVotes: 130
  },
  {
    id: "2",
    title: "Best time for team meetings?",
    description: "Let's find a time that works for everyone",
    options: [
      { id: "2a", text: "9:00 AM", votes: 12 },
      { id: "2b", text: "11:00 AM", votes: 18 },
      { id: "2c", text: "2:00 PM", votes: 25 },
      { id: "2d", text: "4:00 PM", votes: 8 }
    ],
    createdBy: "Jane Smith",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
    expiresAt: new Date("2024-02-14"),
    isActive: true,
    allowMultipleVotes: true,
    isAnonymous: true,
    totalVotes: 63
  }
]

// GET /api/polls - Fetch all polls with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all' // all, active, expired, anonymous
    const sort = searchParams.get('sort') || 'newest' // newest, oldest, most-votes, ending-soon
    
    // TODO: Replace with actual database queries
    let filteredPolls = [...mockPolls]
    
    // Apply search filter
    if (search) {
      filteredPolls = filteredPolls.filter(poll =>
        poll.title.toLowerCase().includes(search.toLowerCase()) ||
        poll.description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Apply category filter
    switch (filter) {
      case 'active':
        filteredPolls = filteredPolls.filter(poll => 
          poll.isActive && (!poll.expiresAt || new Date() < new Date(poll.expiresAt))
        )
        break
      case 'expired':
        filteredPolls = filteredPolls.filter(poll => 
          poll.expiresAt && new Date() > new Date(poll.expiresAt)
        )
        break
      case 'anonymous':
        filteredPolls = filteredPolls.filter(poll => poll.isAnonymous)
        break
    }
    
    // Apply sorting
    switch (sort) {
      case 'newest':
        filteredPolls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        filteredPolls.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'most-votes':
        filteredPolls.sort((a, b) => b.totalVotes - a.totalVotes)
        break
      case 'ending-soon':
        filteredPolls = filteredPolls
          .filter(poll => poll.expiresAt)
          .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())
        break
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPolls = filteredPolls.slice(startIndex, endIndex)
    
    const response: PaginatedResponse<Poll> = {
      data: paginatedPolls,
      pagination: {
        page,
        limit,
        total: filteredPolls.length,
        totalPages: Math.ceil(filteredPolls.length / limit)
      }
    }
    
    return NextResponse.json(
      {
        success: true,
        data: response,
        message: 'Polls fetched successfully'
      } as ApiResponse<PaginatedResponse<Poll>>,
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch polls'
      } as ApiResponse,
      { status: 500 }
    )
  }
}

// POST /api/polls - Create a new poll
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = createPollSchema.safeParse(body)
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
    
    const pollData = validationResult.data
    
    // TODO: Get user ID from authentication token
    // const userId = await getUserIdFromToken(request)
    const userId = 'mock_user_id'
    
    // TODO: Replace with actual database insertion
    const newPoll: Poll = {
      id: 'poll_' + Date.now(),
      title: pollData.title,
      description: pollData.description,
      options: pollData.options.map((text, index) => ({
        id: `option_${Date.now()}_${index}`,
        text,
        votes: 0
      })),
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: pollData.expiresAt ? new Date(pollData.expiresAt) : undefined,
      isActive: true,
      allowMultipleVotes: pollData.allowMultipleVotes,
      isAnonymous: pollData.isAnonymous,
      totalVotes: 0
    }
    
    // Add to mock data (in real app, save to database)
    mockPolls.unshift(newPoll)
    
    return NextResponse.json(
      {
        success: true,
        data: newPoll,
        message: 'Poll created successfully'
      } as ApiResponse<Poll>,
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create poll'
      } as ApiResponse,
      { status: 500 }
    )
  }
}