
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { ApiResponse, Poll, Vote } from '@/types'

// Validation schema for voting
const voteSchema = z.object({
  optionIds: z.array(z.string()).min(1, 'At least one option must be selected')
})

// Mock polls data - should match the data from polls/route.ts
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

// Mock votes data - in real app, this would be in database
const mockVotes: Vote[] = []

// GET /api/polls/[id] - Fetch a specific poll
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id
    
    // TODO: Replace with actual database query
    const poll = mockPolls.find(p => p.id === pollId)
    
    if (!poll) {
      return NextResponse.json(
        {
          success: false,
          error: 'Poll not found',
          message: 'The requested poll does not exist'
        } as ApiResponse,
        { status: 404 }
      )
    }
    
    // Check if poll is expired
    const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt)
    
    return NextResponse.json(
      {
        success: true,
        data: {
          ...poll,
          isExpired
        },
        message: 'Poll fetched successfully'
      } as ApiResponse<Poll & { isExpired: boolean }>,
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch poll'
      } as ApiResponse,
      { status: 500 }
    )
  }
}

// POST /api/polls/[id] - Vote on a poll
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id
    const body = await request.json()
    
    // Validate request body
    const validationResult = voteSchema.safeParse(body)
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
    
    const { optionIds } = validationResult.data
    
    // TODO: Get user ID from authentication token
    // const userId = await getUserIdFromToken(request)
    const userId = 'mock_user_id'
    
    // Find the poll
    const pollIndex = mockPolls.findIndex(p => p.id === pollId)
    if (pollIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Poll not found',
          message: 'The requested poll does not exist'
        } as ApiResponse,
        { status: 404 }
      )
    }
    
    const poll = mockPolls[pollIndex]
    
    // Check if poll is active
    if (!poll.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Poll inactive',
          message: 'This poll is no longer accepting votes'
        } as ApiResponse,
        { status: 400 }
      )
    }
    
    // Check if poll is expired
    if (poll.expiresAt && new Date() > new Date(poll.expiresAt)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Poll expired',
          message: 'This poll has expired and is no longer accepting votes'
        } as ApiResponse,
        { status: 400 }
      )
    }
    
    // Validate option IDs
    const validOptionIds = poll.options.map(option => option.id)
    const invalidOptions = optionIds.filter(id => !validOptionIds.includes(id))
    if (invalidOptions.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid options',
          message: 'One or more selected options are invalid'
        } as ApiResponse,
        { status: 400 }
      )
    }
    
    // Check multiple votes policy
    if (!poll.allowMultipleVotes && optionIds.length > 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Multiple votes not allowed',
          message: 'This poll only allows voting for one option'
        } as ApiResponse,
        { status: 400 }
      )
    }
    
    // Check if user has already voted (if not anonymous)
    if (!poll.isAnonymous) {
      const existingVote = mockVotes.find(vote => 
        vote.pollId === pollId && vote.userId === userId
      )
      
      if (existingVote) {
        return NextResponse.json(
          {
            success: false,
            error: 'Already voted',
            message: 'You have already voted on this poll'
          } as ApiResponse,
          { status: 400 }
        )
      }
    }
    
    // TODO: Replace with actual database operations
    // Create vote record
    const newVote: Vote = {
      id: 'vote_' + Date.now(),
      pollId,
      userId: poll.isAnonymous ? undefined : userId,
      optionIds,
      createdAt: new Date()
    }
    
    mockVotes.push(newVote)
    
    // Update vote counts
    optionIds.forEach(optionId => {
      const option = poll.options.find(opt => opt.id === optionId)
      if (option) {
        option.votes += 1
      }
    })
    
    // Update total votes
    poll.totalVotes += 1
    poll.updatedAt = new Date()
    
    // Update the poll in mock data
    mockPolls[pollIndex] = poll
    
    return NextResponse.json(
      {
        success: true,
        data: {
          vote: newVote,
          poll: poll
        },
        message: 'Vote recorded successfully'
      } as ApiResponse<{ vote: Vote; poll: Poll }>,
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error voting on poll:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to record vote'
      } as ApiResponse,
      { status: 500 }
    )
  }
}

// DELETE /api/polls/[id] - Delete a poll (only by creator)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pollId = params.id
    
    // TODO: Get user ID from authentication token
    // const userId = await getUserIdFromToken(request)
    const userId = 'mock_user_id'
    
    // Find the poll
    const pollIndex = mockPolls.findIndex(p => p.id === pollId)
    if (pollIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Poll not found',
          message: 'The requested poll does not exist'
        } as ApiResponse,
        { status: 404 }
      )
    }
    
    const poll = mockPolls[pollIndex]
    
    // Check if user is the creator
    if (poll.createdBy !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You can only delete polls you created'
        } as ApiResponse,
        { status: 403 }
      )
    }
    
    // TODO: Replace with actual database deletion
    // Remove poll from mock data
    mockPolls.splice(pollIndex, 1)
    
    // Remove associated votes
    const voteIndicesToRemove = mockVotes
      .map((vote, index) => vote.pollId === pollId ? index : -1)
      .filter(index => index !== -1)
      .reverse() // Remove from end to avoid index shifting
    
    voteIndicesToRemove.forEach(index => {
      mockVotes.splice(index, 1)
    })
    
    return NextResponse.json(
      {
        success: true,
        message: 'Poll deleted successfully'
      } as ApiResponse,
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error deleting poll:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete poll'
      } as ApiResponse,
      { status: 500 }
    )
  }
}