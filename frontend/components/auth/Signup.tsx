"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup, verifyOTP } from "@/utils/api"

interface SignupProps {
  onSignup: (token: string) => void
  onSwitchToLogin: () => void
}

export function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isOtpSent, setIsOtpSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Reset error before a new attempt
    try {
      if (!isOtpSent) {
        await signup(email, password)
        setIsOtpSent(true)
      } else {
        const token = await verifyOTP(email, otp)
        onSignup(email,token)
      }
    } catch (err: any) {
      setError(err.message) // Set error message
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isOtpSent}
      />
      {!isOtpSent && (
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      )}
      {isOtpSent && (
        <Input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full">
        {isOtpSent ? "Verify OTP" : "Sign Up"}
      </Button>
      <Button type="button" variant="link" onClick={onSwitchToLogin}>
        Already have an account? Log in
      </Button>
    </form>
  )
}

