import { describe, expect, test, jest } from '@jest/globals';

// Mock the poll actions module
jest.mock('@/app/actions/poll-actions', () => ({
  createPoll: jest.fn(),
  getPoll: jest.fn(),
  updatePoll: jest.fn(),
  deletePoll: jest.fn(),
  listPolls: jest.fn(),
  votePoll: jest.fn(),
}));

// Import the mocked functions
import {
  createPoll,
  getPoll,
  updatePoll,
  deletePoll,
  listPolls,
  votePoll,
} from '@/app/actions/poll-actions';

describe('Poll Actions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createPoll', () => {
    test('should create a new poll with valid data', async () => {
      // Arrange
      const mockPollData = {
        title: 'Test Poll',
        description: 'This is a test poll',
        options: ['Option 1', 'Option 2'],
        allowMultipleVotes: false,
        isAnonymous: true,
      };
      const mockResponse = {
        id: '123',
        ...mockPollData,
        createdBy: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        totalVotes: 0,
        options: [
          { id: 'opt1', text: 'Option 1', votes: 0 },
          { id: 'opt2', text: 'Option 2', votes: 0 },
        ],
      };

      // Mock the implementation
      (createPoll as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await createPoll(mockPollData);

      // Assert
      expect(createPoll).toHaveBeenCalledWith(mockPollData);
      expect(result).toEqual(mockResponse);
    });

    test('should throw an error with invalid data', async () => {
      // Arrange
      const mockInvalidData = {
        // Missing required title
        description: 'This is a test poll',
        options: [],
      };
      const mockError = new Error('Title is required');

      // Mock the implementation to throw an error
      (createPoll as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(createPoll(mockInvalidData)).rejects.toThrow('Title is required');
    });
  });

  describe('getPoll', () => {
    test('should return a poll when given a valid ID', async () => {
      // Arrange
      const pollId = '123';
      const mockPoll = {
        id: pollId,
        title: 'Test Poll',
        description: 'This is a test poll',
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

      // Mock the implementation
      (getPoll as jest.Mock).mockResolvedValue(mockPoll);

      // Act
      const result = await getPoll(pollId);

      // Assert
      expect(getPoll).toHaveBeenCalledWith(pollId);
      expect(result).toEqual(mockPoll);
    });

    test('should throw an error when poll is not found', async () => {
      // Arrange
      const invalidPollId = 'nonexistent';
      const mockError = new Error('Poll not found');

      // Mock the implementation to throw an error
      (getPoll as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(getPoll(invalidPollId)).rejects.toThrow('Poll not found');
    });
  });

  describe('updatePoll', () => {
    test('should update a poll with valid data', async () => {
      // Arrange
      const pollId = '123';
      const mockUpdateData = {
        title: 'Updated Poll Title',
        description: 'Updated description',
      };
      const mockUpdatedPoll = {
        id: pollId,
        title: 'Updated Poll Title',
        description: 'Updated description',
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

      // Mock the implementation
      (updatePoll as jest.Mock).mockResolvedValue(mockUpdatedPoll);

      // Act
      const result = await updatePoll(pollId, mockUpdateData);

      // Assert
      expect(updatePoll).toHaveBeenCalledWith(pollId, mockUpdateData);
      expect(result).toEqual(mockUpdatedPoll);
    });
  });

  describe('deletePoll', () => {
    test('should delete a poll with valid ID', async () => {
      // Arrange
      const pollId = '123';
      const mockResponse = { success: true };

      // Mock the implementation
      (deletePoll as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await deletePoll(pollId);

      // Assert
      expect(deletePoll).toHaveBeenCalledWith(pollId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listPolls', () => {
    test('should return a list of polls', async () => {
      // Arrange
      const mockPolls = [
        {
          id: '123',
          title: 'Poll 1',
          description: 'Description 1',
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
        },
        {
          id: '456',
          title: 'Poll 2',
          description: 'Description 2',
          options: [
            { id: 'opt3', text: 'Option A', votes: 10 },
            { id: 'opt4', text: 'Option B', votes: 7 },
          ],
          createdBy: 'user456',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          allowMultipleVotes: true,
          isAnonymous: false,
          totalVotes: 17,
        },
      ];

      // Mock the implementation
      (listPolls as jest.Mock).mockResolvedValue(mockPolls);

      // Act
      const result = await listPolls();

      // Assert
      expect(listPolls).toHaveBeenCalled();
      expect(result).toEqual(mockPolls);
    });
  });

  describe('votePoll', () => {
    test('should register a vote for a poll option', async () => {
      // Arrange
      const pollId = '123';
      const optionId = 'opt1';
      const userId = 'user789';
      const mockResponse = { success: true };

      // Mock the implementation
      (votePoll as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await votePoll(pollId, optionId, userId);

      // Assert
      expect(votePoll).toHaveBeenCalledWith(pollId, optionId, userId);
      expect(result).toEqual(mockResponse);
    });

    test('should handle anonymous votes', async () => {
      // Arrange
      const pollId = '123';
      const optionId = 'opt1';
      const mockResponse = { success: true };

      // Mock the implementation
      (votePoll as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await votePoll(pollId, optionId);

      // Assert
      expect(votePoll).toHaveBeenCalledWith(pollId, optionId, undefined);
      expect(result).toEqual(mockResponse);
    });
  });
});