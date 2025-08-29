"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Users, Eye, Vote } from "lucide-react"
import { formatDate, calculatePollResults } from "@/lib/utils"
import type { Poll, PollCardProps } from "@/types"

export function PollCard({ poll, showResults = false, onVote }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  const pollResults = calculatePollResults(
    poll.options.reduce((acc, option) => {
      acc[option.id] = option.votes
      return acc
    }, {} as Record<string, number>)
  )

  const handleVote = async (optionId: string) => {
    if (hasVoted || !onVote) return

    setIsVoting(true)
    try {
      await onVote(poll.id, optionId)
      setHasVoted(true)
      setSelectedOption(optionId)
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt)
  const canVote = poll.isActive && !isExpired && !hasVoted

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">
              <Link href={`/polls/${poll.id}`} className="hover:text-primary">
                {poll.title}
              </Link>
            </CardTitle>
            {poll.description && (
              <CardDescription className="text-sm">
                {poll.description}
              </CardDescription>
            )}
          </div>
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
          </div>
        </div>
        
        {/* Poll metadata */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{poll.totalVotes} votes</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatDate(poll.createdAt)}</span>
          </div>
          {poll.expiresAt && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Expires {formatDate(poll.expiresAt)}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Poll options */}
        <div className="space-y-3">
          {poll.options.map((option) => {
            const result = pollResults.find(r => r.option === option.id)
            const percentage = result?.percentage || 0
            const isSelected = selectedOption === option.id

            return (
              <div key={option.id} className="space-y-2">
                {showResults || hasVoted ? (
                  // Results view
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                        {option.text}
                        {isSelected && <Vote className="inline h-4 w-4 ml-1" />}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {option.votes} votes ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ) : (
                  // Voting view
                  <Button
                    variant={selectedOption === option.id ? "default" : "outline"}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => canVote && handleVote(option.id)}
                    disabled={!canVote || isVoting}
                  >
                    <span className="text-left">{option.text}</span>
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Voting status */}
        {hasVoted && (
          <div className="text-sm text-green-600 font-medium">
            ✓ You have voted in this poll
          </div>
        )}
        
        {isExpired && (
          <div className="text-sm text-red-600 font-medium">
            This poll has expired
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {poll.createdBy.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            Created by {poll.createdBy}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/polls/${poll.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}