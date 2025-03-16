"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { changePassword } from "@/utils/api"

interface ChangePasswordProps {
  onBack: () => void
}

export function ChangePassword({ onBack }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password must match.")
      return
    }

    setIsLoading(true)

    try {
      await changePassword(currentPassword, newPassword)
      setMessage("Password updated successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to update password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-center">Change Password</CardTitle>
              <CardDescription className="text-center">Update your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit} className="text-left">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <span className="text-red-500 text-sm">{error}</span>}
            {message && <span className="text-green-500 text-sm">{message}</span>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
