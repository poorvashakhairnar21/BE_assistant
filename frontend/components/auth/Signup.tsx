"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup, verifyOTP } from "@/utils/api"
import { Eye, EyeOff } from "lucide-react"

interface SignupProps {
  onSignup: (email: string, token: string) => void
  onSwitchToLogin: () => void
}

export function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Reset error before a new attempt
    setLoading(true) // Set loading state
    setShowPassword(false)
    
    if (!isOtpSent) {
      if (password !== confirmPassword) {
        setError("Password and Confirm Password do not match")
        setLoading(false)
        return
      }
      try {
        await signup(email, password)
        setIsOtpSent(true)
      } catch (err: any) {
        setError(err.message)
      }
    } else {
      try {
        const token = await verifyOTP(email, otp)
        onSignup(email, token)
      } catch (err: any) {
        setError(err.message)
      }
    }
    setLoading(false) // Reset loading state after operation
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isOtpSent || loading}
      />
      {!isOtpSent && (
        <>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </>
      )}
      {isOtpSent && (
        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          disabled={loading}
        />
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Processing..." : isOtpSent ? "Verify OTP" : "Sign Up"}
      </Button>
      <Button type="button" variant="link" onClick={onSwitchToLogin} disabled={loading}>
        Already have an account? Log in
      </Button>
    </form>
  )
}
