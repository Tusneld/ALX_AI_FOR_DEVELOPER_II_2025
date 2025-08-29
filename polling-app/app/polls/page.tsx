"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PollCard } from "@/components/polls/poll-card"
import { MainLayout } from "@/components/layout/main-layout"
import { Search, Filter, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Poll } from "@/types"

// Mock data - replace with actual API calls
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
  },
  {
    id: "3",
    title: "Office lunch preferences",
    description: "What should we order for the team lunch?",
    options: [
      { id: "3a", text: "Pizza", votes: 22 },
      { id: "3b", text: "Sushi", votes: 15 },
      { id: "3c", text: "Sandwiches", votes: 18 },
      { id: "3d", text: "Salads", votes: 9 }
    ],
    createdBy: "Mike Johnson",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
    expiresAt: new Date("2024-01-20"),
    isActive: false,
    allowMultipleVotes: false,
    isAnonymous: false,
    totalVotes: 64
  }
]

type SortOption = "newest" | "oldest" | "most-votes" | "ending-soon"
type FilterOption = "all" | "active" | "expired" | "anonymous"

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [isLoading, setIsLoading] = useState(true)

  // Load polls on component mount
  useEffect(() => {
    loadPolls()
  }, [])

  // Filter and sort polls when dependencies change
  useEffect(() => {
    let filtered = [...polls]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(poll =>
        poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poll.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filter
    switch (filterBy) {
      case "active":
        filtered = filtered.filter(poll => poll.isActive && (!poll.expiresAt || new Date() < new Date(poll.expiresAt)))
        break
      case "expired":
        filtered = filtered.filter(poll => poll.expiresAt && new Date() > new Date(poll.expiresAt))
        break
      case "anonymous":
        filtered = filtered.filter(poll => poll.isAnonymous)
        break
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "most-votes":
        filtered.sort((a, b) => b.totalVotes - a.totalVotes)
        break
      case "ending-soon":
        filtered = filtered
          .filter(poll => poll.expiresAt)
          .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())
        break
    }

    setFilteredPolls(filtered)
  }, [polls, searchQuery, sortBy, filterBy])

  const loadPolls = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/polls')
      // const data = await response.json()
      // setPolls(data.polls)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPolls(mockPolls)
    } catch (error) {
      console.error('Failed to load polls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      // TODO: Implement actual voting logic
      console.log('Vote:', { pollId, optionId })
      
      // Update local state optimistically
      setPolls(prevPolls =>
        prevPolls.map(poll => {
          if (poll.id === pollId) {
            return {
              ...poll,
              options: poll.options.map(option =>
                option.id === optionId
                  ? { ...option, votes: option.votes + 1 }
                  : option
              ),
              totalVotes: poll.totalVotes + 1
            }
          }
          return poll
        })
      )
    } catch (error) {
      console.error('Vote failed:', error)
      throw error
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Browse Polls</h1>
            <p className="text-muted-foreground">
              Discover and participate in polls from the community
            </p>
          </div>
          <Button asChild>
            <Link href="/polls/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Link>
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Polls</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="anonymous">Anonymous</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-votes">Most Votes</SelectItem>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredPolls.length} poll{filteredPolls.length !== 1 ? 's' : ''} found
          </Badge>
          {searchQuery && (
            <Badge variant="outline">
              Search: "{searchQuery}"
            </Badge>
          )}
          {filterBy !== "all" && (
            <Badge variant="outline">
              Filter: {filterBy}
            </Badge>
          )}
        </div>

        {/* Polls Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading polls...</span>
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No polls found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterBy !== "all"
                ? "Try adjusting your search or filters"
                : "Be the first to create a poll!"}
            </p>
            <Button asChild>
              <Link href="/polls/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Poll
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}