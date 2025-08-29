"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MainLayout } from "@/components/layout/main-layout"
import { ArrowLeft, Clock, Users, Share2, Vote, CheckCircle, AlertCircle } from "lucide-react"
import { formatDate, calculatePollResults } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import type { Poll, Vote as VoteType } from "@/types"

// Mock poll data - replace with actual API call
const mockPoll: Poll = {
  id: "1",
  title: "What's your favorite programming language?",
  description: "Help us understand the community's preferences for modern software development. This poll will help guide our technology decisions for upcoming projects.",
  options: [
    { id: "1a", text: "JavaScript", votes: 45 },
    { id: "1b", text: "Python", votes: 38 },
    { id: "1c", text: "TypeScript", votes: 32 },
    { id: "1d", text: "Go", votes: 15 },
    { id: "1e", text: "Rust", votes: 12 }
  ],
  createdBy: "John Doe",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
  expiresAt: new Date("2024-02-15"),
  isActive: true,
  allowMultipleVotes: false,
  isAnonymous: false,
  totalVotes: 142
}

export default function PollDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [userVote, setUserVote] = useState<VoteType | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadPoll()
    if (isAuthenticated) {
      loadUserVote()
    }
  }, [params.id, isAuthenticated])

  const loadPoll = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/polls/${params.id}`)
      // const data = await response.json()
      // setPoll(data.poll)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      setPoll(mockPoll)
    } catch (error) {
      console.error('Failed to load poll:', error)
      setError('Failed to load poll')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserVote = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/polls/${params.id}/vote`)
      // if (response.ok) {
      //   const data = await response.json()
      //   setUserVote(data.vote)
      //   setSelectedOption(data.vote.optionId)
      // }
      
      // Mock user vote for demonstration
      // setUserVote({
      //   id: 'vote1',
      //   pollId: params.id as string,
      //   optionId: '1a',
      //   userId: user?.id,
      //   createdAt: new Date()
      // })
      // setSelectedOption('1a')
    } catch (error) {
      console.error('Failed to load user vote:', error)
    }
  }

  const handleVote = async (optionId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (userVote || !poll) return

    setIsVoting(true)
    setError("")

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/polls/${poll.id}/vote`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ optionId })
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Vote failed')
      // }
      // 
      // const data = await response.json()
      // setUserVote(data.vote)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update local state optimistically
      const newVote: VoteType = {
        id: 'vote_' + Date.now(),
        pollId: poll.id,
        optionId,
        userId: user?.id,
        createdAt: new Date()
      }
      
      setUserVote(newVote)
      setSelectedOption(optionId)
      
      // Update poll data
      setPoll(prevPoll => {
        if (!prevPoll) return null
        return {
          ...prevPoll,
          options: prevPoll.options.map(option =>
            option.id === optionId
              ? { ...option, votes: option.votes + 1 }
              : option
          ),
          totalVotes: prevPoll.totalVotes + 1
        }
      })
    } catch (error) {
      console.error('Vote failed:', error)
      setError('Failed to submit vote. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: poll?.title,
        text: poll?.description,
        url: window.location.href
      })
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading poll...</span>
        </div>
      </MainLayout>
    )
  }

  if (!poll) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Poll not found</h2>
          <p className="text-muted-foreground mb-4">The poll you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </MainLayout>
    )
  }

  const pollResults = calculatePollResults(
    poll.options.reduce((acc, option) => {
      acc[option.id] = option.votes
      return acc
    }, {} as Record<string, number>)
  )

  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt)
  const canVote = poll.isActive && !isExpired && !userVote && isAuthenticated
  const showResults = userVote || isExpired || !poll.isActive

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Polls
        </Button>

        {/* Poll header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-2xl">{poll.title}</CardTitle>
                {poll.description && (
                  <CardDescription className="text-base">
                    {poll.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            {/* Status badges */}
            <div className="flex items-center space-x-2">
              {!poll.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {isExpired && (
                <Badge variant="destructive">Expired</Badge>
              )}
              {poll.isAnonymous && (
                <Badge variant="outline">Anonymous</Badge>
              )}
              {poll.allowMultipleVotes && (
                <Badge variant="outline">Multiple Votes Allowed</Badge>
              )}
            </div>
            
            {/* Poll metadata */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{poll.totalVotes} total votes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Created {formatDate(poll.createdAt)}</span>
              </div>
              {poll.expiresAt && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {isExpired ? 'Expired' : 'Expires'} {formatDate(poll.expiresAt)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Creator info */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {poll.createdBy.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Created by {poll.createdBy}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Voting status */}
        {userVote && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You voted for: <strong>
                {poll.options.find(opt => opt.id === userVote.optionId)?.text}
              </strong>
            </AlertDescription>
          </Alert>
        )}
        
        {!isAuthenticated && canVote && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/auth/login')}>
                Sign in
              </Button>
              {" "}to vote in this poll.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Poll options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Vote className="h-5 w-5" />
              <span>{showResults ? 'Results' : 'Cast Your Vote'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {poll.options.map((option) => {
              const result = pollResults.find(r => r.option === option.id)
              const percentage = result?.percentage || 0
              const isSelected = selectedOption === option.id

              return (
                <div key={option.id} className="space-y-2">
                  {showResults ? (
                    // Results view
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>
                          {option.text}
                          {isSelected && <CheckCircle className="inline h-4 w-4 ml-2" />}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {option.votes} votes ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </div>
                  ) : (
                    // Voting view
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto p-4 text-left"
                      onClick={() => handleVote(option.id)}
                      disabled={!canVote || isVoting}
                    >
                      <span>{option.text}</span>
                    </Button>
                  )}
                </div>
              )
            })}
            
            {isVoting && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Submitting your vote...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}