"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signup, verifyOTP, resendOTP } from "@/utils/api"
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
  const [canResendOtp, setCanResendOtp] = useState(true)
  const [resendTimer, setResendTimer] = useState(0)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    } else if (resendTimer === 0) {
      setCanResendOtp(true)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const startResendTimer = () => {
    setCanResendOtp(false)
    setResendTimer(60) // 1 minute
  }

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
        startResendTimer()
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unexpected error occurred")
        }
      }
    } else {
      try {
        const token = await verifyOTP(email, otp)
        onSignup(email, token)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unexpected error occurred")
        }
      }
    }
    setLoading(false) // Reset loading state after operation
  }

  const handleResendOTP = async () => {
    if (!canResendOtp) return

    setError(null)
    setLoading(true)

    try {
      await resendOTP(email)
      startResendTimer()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to resend OTP")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

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
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            disabled={loading}
          />

          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">Resend OTP in {resendTimer} seconds</p>
          ) : (
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm"
              onClick={handleResendOTP}
              disabled={!canResendOtp || loading}
            >
              Resend OTP
            </Button>
          )}
        </div>
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
