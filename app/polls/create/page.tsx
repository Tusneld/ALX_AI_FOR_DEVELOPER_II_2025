"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { MainLayout } from "@/components/layout/main-layout"
import { Plus, Trash2, ArrowLeft, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { generateId } from "@/lib/utils"
import type { CreatePollForm } from "@/types"

export default function CreatePollPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<CreatePollForm>({
    title: "",
    description: "",
    options: ["", ""],
    allowMultipleVotes: false,
    isAnonymous: false
  })

  // Redirect if not authenticated
  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  const handleInputChange = (field: keyof CreatePollForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, ""]
      }))
    }
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, options: newOptions }))
    }
  }

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return "Poll title is required"
    }
    
    if (formData.title.length > 200) {
      return "Poll title must be less than 200 characters"
    }
    
    if (formData.description && formData.description.length > 1000) {
      return "Poll description must be less than 1000 characters"
    }
    
    const validOptions = formData.options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      return "At least 2 options are required"
    }
    
    if (validOptions.length > 10) {
      return "Maximum 10 options allowed"
    }
    
    const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()))
    if (uniqueOptions.size !== validOptions.length) {
      return "All options must be unique"
    }
    
    if (formData.expiresAt && formData.expiresAt <= new Date()) {
      return "Expiration date must be in the future"
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setIsLoading(true)
    
    try {
      // Filter out empty options
      const validOptions = formData.options.filter(opt => opt.trim())
      
      const pollData = {
        ...formData,
        options: validOptions,
        createdBy: user?.id || 'anonymous'
      }
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/polls', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(pollData)
      // })
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to create poll')
      // }
      // 
      // const result = await response.json()
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Poll created:', pollData)
      setSuccess(true)
      
      // Redirect to the new poll after a short delay
      setTimeout(() => {
        router.push('/polls')
      }, 2000)
      
    } catch (error) {
      console.error('Failed to create poll:', error)
      setError('Failed to create poll. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      setFormData(prev => ({ ...prev, expiresAt: new Date(value) }))
    } else {
      setFormData(prev => ({ ...prev, expiresAt: undefined }))
    }
  }

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold">Poll Created Successfully!</h2>
                <p className="text-muted-foreground">
                  Your poll has been created and is now live. Redirecting you to the polls page...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Poll</h1>
            <p className="text-muted-foreground">
              Create a poll to gather opinions from the community
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the basic details for your poll
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">Poll Title *</Label>
                <Input
                  id="title"
                  placeholder="What's your question?"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/200 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional context or details about your poll..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  maxLength={1000}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description?.length || 0}/1000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Poll Options */}
          <Card>
            <CardHeader>
              <CardTitle>Poll Options</CardTitle>
              <CardDescription>
                Add the options that people can vote for (minimum 2, maximum 10)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Label htmlFor={`option-${index}`} className="sr-only">
                      Option {index + 1}
                    </Label>
                    <Input
                      id={`option-${index}`}
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {formData.options.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Poll Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Poll Settings</CardTitle>
              <CardDescription>
                Configure how your poll behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="expires">Expiration Date (Optional)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expires"
                    type="datetime-local"
                    className="pl-10"
                    onChange={handleDateChange}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty for polls that never expire
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="multiple-votes">Allow Multiple Votes</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to select multiple options
                    </p>
                  </div>
                  <Switch
                    id="multiple-votes"
                    checked={formData.allowMultipleVotes}
                    onCheckedChange={(checked) => handleInputChange('allowMultipleVotes', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="anonymous">Anonymous Voting</Label>
                    <p className="text-sm text-muted-foreground">
                      Hide voter identities from results
                    </p>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Poll..." : "Create Poll"}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}