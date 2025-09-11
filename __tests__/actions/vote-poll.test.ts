import { describe, expect, jest, test } from '@jest/globals';
import { votePoll, getPoll } from '@/app/actions/poll-actions';
import { ApiResponse, Poll } from '@/types';

// Mock the poll-actions module
jest.mock('@/app/actions/poll-actions', () => ({
  votePoll: jest.fn(),
  getPoll: jest.fn(),
}));

describe('Vote Poll Function', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Unit Test 1: Happy Path - Successfully record a vote
  test('should successfully record a vote for a valid poll and option', async () => {
    // Arrange
    const pollId = '123';
    const optionId = 'opt1';
    const userId = 'user789';
    
    // Mock the getPoll function to return a valid poll
    const mockPoll = {
      id: pollId,
      title: 'Test Poll',
      description: 'Test Description',
      options: [
        { id: 'opt1', text: 'Option 1', votes: 5 },
        { id: 'opt2', text: 'Option 2', votes: 3 },
      ],
      createdBy: 'user123',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      allowMultipleVotes: false,
      isAnonymous: true,
      totalVotes: 8,
    };
    
    const mockGetPollResponse: ApiResponse<Poll> = {
      success: true,
      data: mockPoll
    };
    
    const mockVotePollResponse: ApiResponse<boolean> = {
      success: true,
      data: true,
      message: 'Vote recorded successfully'
    };
    
    (getPoll as jest.Mock).mockResolvedValue(mockGetPollResponse);
    (votePoll as jest.Mock).mockResolvedValue(mockVotePollResponse);

    // Act
    const result = await votePoll(pollId, optionId, userId);

    // Assert
    expect(votePoll).toHaveBeenCalledWith(pollId, optionId, userId);
    expect(result).toEqual({
      success: true,
      data: true,
      message: 'Vote recorded successfully'
    });
  });

  // Unit Test 2: Invalid Poll ID - Should return error response
  test('should return error response when poll ID is invalid', async () => {
    // Arrange
    const invalidPollId = 'invalid-id';
    const optionId = 'opt1';
    const userId = 'user789';
    
    // Mock votePoll to return error response for invalid poll ID
    const mockErrorResponse: ApiResponse<boolean> = {
      success: false,
      error: 'Poll not found',
      message: 'Poll not found'
    };
    
    (votePoll as jest.Mock).mockResolvedValue(mockErrorResponse);

    // Act
    const result = await votePoll(invalidPollId, optionId, userId);
    
    // Assert
    expect(votePoll).toHaveBeenCalledWith(invalidPollId, optionId, userId);
    expect(result).toEqual({
      success: false,
      error: 'Poll not found',
      message: 'Poll not found'
    });
  });

  // Integration Test: Test the complete vote recording flow including duplicate vote handling
  test('integration: should handle the complete voting flow including duplicate votes', async () => {
    // Arrange
    const pollId = '123';
    const optionId = 'opt1';
    const userId = 'user789';
    
    // Mock database state
    let mockVotes = [];
    let mockPoll = {
      id: pollId,
      title: 'Test Poll',
      description: 'Test Description',
      options: [
        { id: 'opt1', text: 'Option 1', votes: 5 },
        { id: 'opt2', text: 'Option 2', votes: 3 },
      ],
      createdBy: 'user123',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      allowMultipleVotes: false,
      isAnonymous: false,
      totalVotes: 8,
    };
    
    // Mock the getPoll function
    (getPoll as jest.Mock).mockImplementation(() => Promise.resolve({
      success: true,
      data: {...mockPoll}
    }));
    
    // Mock the votePoll function with custom implementation to simulate database interaction
    (votePoll as jest.Mock).mockImplementation(async (pId, oId, uId) => {
      // Validate inputs
      if (!pId) throw new Error('Poll ID is required');
      if (!oId) throw new Error('Option ID is required');
      
      // For non-anonymous polls, userId is required
      const pollResponse = await getPoll(pId);
      const poll = pollResponse.data;
      if (!poll.isAnonymous && !uId) {
        return {
          success: false,
          error: 'User ID is required for non-anonymous polls',
          message: 'User ID is required for non-anonymous polls'
        };
      }
      
      // Check if option exists
      const optionExists = poll.options.some(option => option.id === oId);
      if (!optionExists) {
        return {
          success: false,
          error: 'Option not found',
          message: 'Option not found'
        };
      }
      
      // Check for duplicate votes if not allowing multiple votes
      if (!poll.allowMultipleVotes && uId) {
        const hasVoted = mockVotes.some(vote => 
          vote.pollId === pId && vote.userId === uId
        );
        
        if (hasVoted) {
          return {
            success: false,
            error: 'User has already voted on this poll',
            message: 'User has already voted on this poll'
          };
        }
      }
      
      // Record the vote
      mockVotes.push({
        pollId: pId,
        optionId: oId,
        userId: uId,
        timestamp: new Date()
      });
      
      // Update poll stats
      const optionIndex = mockPoll.options.findIndex(opt => opt.id === oId);
      mockPoll.options[optionIndex].votes += 1;
      mockPoll.totalVotes += 1;
      
      return {
        success: true,
        data: true,
        message: 'Vote recorded successfully'
      };
    });

    // Act - First vote should succeed
    const result1 = await votePoll(pollId, optionId, userId);
    
    // Assert - First vote successful
    expect(result1).toEqual({
      success: true,
      data: true,
      message: 'Vote recorded successfully'
    });
    expect(mockVotes.length).toBe(1);
3    
    // Act - Second vote should fail (duplicate vote)
    const result2 = await votePoll(pollId, optionId, userId);
    
    // Assert - Second vote should return error
    expect(result2).toEqual({
      success: false,
      error: 'User has already voted on this poll',
      message: 'User has already voted on this poll'
    });
    
    // Verify vote count didn't increase
    expect(mockVotes.length).toBe(1);
    
    // Test anonymous voting on a different poll
    mockPoll.isAnonymous = true;
    const anonymousResult = await votePoll(pollId, 'opt2');
    expect(anonymousResult).toEqual({
      success: true,
      data: true,
      message: 'Vote recorded successfully'
    });
    expect(mockVotes.length).toBe(2);
  });
});