"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload } from "lucide-react"

interface ProfileSettingsProps {
  onBack: () => void
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  // const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // Set error message safely
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview || "/placeholder.svg"}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-muted-foreground">
                      {name ? name.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                <Label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <Input id="avatar" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">Upload a new avatar</span>
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled placeholder="Your email" />
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>} {/* Error Message */}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 