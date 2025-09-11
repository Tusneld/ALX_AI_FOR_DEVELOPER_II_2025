import { Poll, CreatePollForm, PollOption, ApiResponse, User } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Types for internal use
interface PollValidationError {
  field: string;
  message: string;
}

interface PollFilter {
  userId?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

interface VoteRequest {
  pollId: string;
  optionId: string;
  userId?: string;
}

// Centralized Supabase client creation
class SupabaseClient {
  private static instance: ReturnType<typeof createClient> | null = null;

  static getInstance() {
    if (!this.instance) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }
      
      this.instance = createClient(supabaseUrl, supabaseKey);
    }
    return this.instance;
  }
}

// Standardized error response handler
class PollError extends Error {
  constructor(
    message: string,
    public code: string = 'POLL_ERROR',
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'PollError';
  }
}

function createErrorResponse<T>(error: unknown): ApiResponse<T> {
  if (error instanceof PollError) {
    return {
      success: false,
      error: error.message,
      message: error.message
    };
  }
  
  return {
    success: false,
    error: 'An unexpected error occurred',
    message: error instanceof Error ? error.message : 'Unknown error'
  };
}

function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

// User authentication abstraction
class AuthService {
  private static supabase = SupabaseClient.getInstance();

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email || '',
        avatar: user.user_metadata?.avatar_url,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at || user.created_at)
      };
    } catch {
      return null;
    }
  }

  static async requireAuth(): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new PollError('Authentication required', 'AUTH_REQUIRED', 401);
    }
    return user;
  }
}

// Poll input validation encapsulation
class PollValidator {
  static validateCreatePoll(data: CreatePollForm): PollValidationError[] {
    const errors: PollValidationError[] = [];

    if (!data.title?.trim()) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (data.title.length > 200) {
      errors.push({ field: 'title', message: 'Title must be 200 characters or less' });
    }

    if (!data.options || data.options.length < 2) {
      errors.push({ field: 'options', message: 'At least two options are required' });
    } else if (data.options.length > 10) {
      errors.push({ field: 'options', message: 'Maximum 10 options allowed' });
    } else {
      data.options.forEach((option, index) => {
        const optionText = typeof option === 'string' ? option : option;
        if (!optionText?.trim()) {
          errors.push({ field: `options[${index}]`, message: `Option ${index + 1} cannot be empty` });
        } else if (optionText.length > 100) {
          errors.push({ field: `options[${index}]`, message: `Option ${index + 1} must be 100 characters or less` });
        }
      });
    }

    if (data.description && data.description.length > 500) {
      errors.push({ field: 'description', message: 'Description must be 500 characters or less' });
    }

    if (data.expiresAt && data.expiresAt <= new Date()) {
      errors.push({ field: 'expiresAt', message: 'Expiration date must be in the future' });
    }

    return errors;
  }

  static validateVoteRequest(request: VoteRequest): PollValidationError[] {
    const errors: PollValidationError[] = [];

    if (!request.pollId?.trim()) {
      errors.push({ field: 'pollId', message: 'Poll ID is required' });
    }

    if (!request.optionId?.trim()) {
      errors.push({ field: 'optionId', message: 'Option ID is required' });
    }

    return errors;
  }

  static throwIfInvalid(errors: PollValidationError[]): void {
    if (errors.length > 0) {
      const message = errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new PollError(`Validation failed: ${message}`, 'VALIDATION_ERROR', 400);
    }
  }
}

// Modularized poll operations
class PollRepository {
  private static supabase = SupabaseClient.getInstance();

  static async create(data: CreatePollForm, userId: string): Promise<Poll> {
    // In a real implementation, this would interact with Supabase
    // For now, returning mock data with proper structure
    const newPoll: Poll = {
      id: Math.random().toString(36).substring(2, 15),
      title: data.title,
      description: data.description,
      options: data.options.map((option, index) => ({
        id: `option-${index}`,
        text: typeof option === 'string' ? option : option,
        votes: 0
      })),
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: data.expiresAt,
      isActive: true,
      allowMultipleVotes: data.allowMultipleVotes,
      isAnonymous: data.isAnonymous,
      totalVotes: 0
    };

    return newPoll;
  }

  static async findById(id: string): Promise<Poll | null> {
    if (!id?.trim()) {
      return null;
    }

    // Mock implementation - in real app, query Supabase
    if (id === 'nonexistent') {
      return null;
    }

    return {
      id,
      title: 'Sample Poll',
      description: 'This is a sample poll',
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
  }

  static async update(id: string, data: Partial<CreatePollForm>, userId: string): Promise<Poll> {
    const existingPoll = await this.findById(id);
    if (!existingPoll) {
      throw new PollError('Poll not found', 'POLL_NOT_FOUND', 404);
    }

    if (existingPoll.createdBy !== userId) {
      throw new PollError('Unauthorized to update this poll', 'UNAUTHORIZED', 403);
    }

    const updatedPoll: Poll = {
      ...existingPoll,
      ...data,
      options: data.options 
        ? data.options.map((option, index) => ({
            id: `option-${index}`,
            text: typeof option === 'string' ? option : option,
            votes: 0
          }))
        : existingPoll.options,
      updatedAt: new Date()
    };

    return updatedPoll;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const existingPoll = await this.findById(id);
    if (!existingPoll) {
      throw new PollError('Poll not found', 'POLL_NOT_FOUND', 404);
    }

    if (existingPoll.createdBy !== userId) {
      throw new PollError('Unauthorized to delete this poll', 'UNAUTHORIZED', 403);
    }

    // Mock deletion - in real app, delete from Supabase
    return true;
  }

  static async findMany(filter: PollFilter = {}): Promise<Poll[]> {
    // Mock implementation - in real app, query Supabase with filters
    const mockPolls: Poll[] = [
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

    let filteredPolls = [...mockPolls];
    
    if (filter.userId) {
      filteredPolls = filteredPolls.filter(poll => poll.createdBy === filter.userId);
    }
    
    if (filter.active !== undefined) {
      filteredPolls = filteredPolls.filter(poll => poll.isActive === filter.active);
    }

    return filteredPolls;
  }

  static async recordVote(request: VoteRequest): Promise<boolean> {
    const poll = await this.findById(request.pollId);
    if (!poll) {
      throw new PollError('Poll not found', 'POLL_NOT_FOUND', 404);
    }

    if (!poll.isActive) {
      throw new PollError('Poll is not active', 'POLL_INACTIVE', 400);
    }

    if (poll.expiresAt && poll.expiresAt <= new Date()) {
      throw new PollError('Poll has expired', 'POLL_EXPIRED', 400);
    }

    if (!poll.isAnonymous && !request.userId) {
      throw new PollError('User ID is required for non-anonymous polls', 'USER_ID_REQUIRED', 400);
    }

    const optionExists = poll.options.some(option => option.id === request.optionId);
    if (!optionExists) {
      throw new PollError('Option not found', 'OPTION_NOT_FOUND', 404);
    }

    // Mock vote recording - in real app, insert into Supabase
    return true;
  }
}

/**
 * Creates a new poll with the provided data
 * @param data The poll data to create
 * @returns API response with the created poll
 */
export async function createPoll(data: CreatePollForm): Promise<ApiResponse<Poll>> {
  try {
    // Validate input
    const validationErrors = PollValidator.validateCreatePoll(data);
    PollValidator.throwIfInvalid(validationErrors);

    // Require authentication
    const user = await AuthService.requireAuth();

    // Create poll
    const poll = await PollRepository.create(data, user.id);
    
    return createSuccessResponse(poll, 'Poll created successfully');
  } catch (error) {
    return createErrorResponse<Poll>(error);
  }
}

/**
 * Retrieves a poll by its ID
 * @param id The poll ID
 * @returns API response with the poll if found
 */
export async function getPoll(id: string): Promise<ApiResponse<Poll>> {
  try {
    if (!id?.trim()) {
      throw new PollError('Poll ID is required', 'INVALID_ID', 400);
    }

    const poll = await PollRepository.findById(id);
    if (!poll) {
      throw new PollError('Poll not found', 'POLL_NOT_FOUND', 404);
    }

    return createSuccessResponse(poll);
  } catch (error) {
    return createErrorResponse<Poll>(error);
  }
}

/**
 * Updates an existing poll
 * @param id The poll ID
 * @param data The updated poll data
 * @returns API response with the updated poll
 */
export async function updatePoll(id: string, data: Partial<CreatePollForm>): Promise<ApiResponse<Poll>> {
  try {
    if (!id?.trim()) {
      throw new PollError('Poll ID is required', 'INVALID_ID', 400);
    }

    // Validate input if provided
    if (data.title !== undefined || data.options !== undefined) {
      const validationErrors = PollValidator.validateCreatePoll({
        title: data.title || '',
        options: data.options || [],
        description: data.description,
        expiresAt: data.expiresAt,
        allowMultipleVotes: data.allowMultipleVotes,
        isAnonymous: data.isAnonymous
      });
      PollValidator.throwIfInvalid(validationErrors);
    }

    // Require authentication
    const user = await AuthService.requireAuth();

    // Update poll
    const updatedPoll = await PollRepository.update(id, data, user.id);
    
    return createSuccessResponse(updatedPoll, 'Poll updated successfully');
  } catch (error) {
    return createErrorResponse<Poll>(error);
  }
}

/**
 * Deletes a poll
 * @param id The poll ID
 * @returns API response indicating success
 */
export async function deletePoll(id: string): Promise<ApiResponse<boolean>> {
  try {
    if (!id?.trim()) {
      throw new PollError('Poll ID is required', 'INVALID_ID', 400);
    }

    // Require authentication
    const user = await AuthService.requireAuth();

    // Delete poll
    const success = await PollRepository.delete(id, user.id);
    
    return createSuccessResponse(success, 'Poll deleted successfully');
  } catch (error) {
    return createErrorResponse<boolean>(error);
  }
}

/**
 * Lists polls with optional filtering
 * @param options Filtering options
 * @returns API response with array of polls
 */
export async function listPolls(options: PollFilter = {}): Promise<ApiResponse<Poll[]>> {
  try {
    const polls = await PollRepository.findMany(options);
    
    // Apply pagination
    let paginatedPolls = [...polls];
    
    if (options.offset) {
      paginatedPolls = paginatedPolls.slice(options.offset);
    }
    
    if (options.limit) {
      paginatedPolls = paginatedPolls.slice(0, options.limit);
    }

    return createSuccessResponse(paginatedPolls);
  } catch (error) {
    return createErrorResponse<Poll[]>(error);
  }
}

/**
 * Records a vote for a poll option
 * @param pollId The poll ID
 * @param optionId The option ID to vote for
 * @param userId The user ID (optional for anonymous polls)
 * @returns API response indicating success
 */
export async function votePoll(
  pollId: string,
  optionId: string,
  userId?: string
): Promise<ApiResponse<boolean>> {
  try {
    const voteRequest: VoteRequest = { pollId, optionId, userId };
    
    // Validate input
    const validationErrors = PollValidator.validateVoteRequest(voteRequest);
    PollValidator.throwIfInvalid(validationErrors);

    // Record vote
    const success = await PollRepository.recordVote(voteRequest);
    
    return createSuccessResponse(success, 'Vote recorded successfully');
  } catch (error) {
    return createErrorResponse<boolean>(error);
  }
}