import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to format dates
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Utility function to calculate poll results
export function calculatePollResults(votes: Record<string, number>): Array<{ option: string; votes: number; percentage: number }> {
  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0)
  
  return Object.entries(votes).map(([option, voteCount]) => ({
    option,
    votes: voteCount,
    percentage: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
  }))
}

// Utility function to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}