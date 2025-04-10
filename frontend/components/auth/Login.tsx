"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { requestPasswordReset, verifyOTP, resendOTP, resetPassword } from "@/utils/api"
import {validatePassword, validateEmail} from "@/components/auth/validations"

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSwitchToSignup: () => void
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [massage, setMassage] =useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false)
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
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
    setError(null)
    setLoading(true)
    setMassage(null)

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      setLoading(false)
      return
    }
    
    try {
      if (forgotPasswordMode) {
        if (!isOtpSent) {
          // Step 1: Request password reset OTP
          await requestPasswordReset(email)
          setIsOtpSent(true)
          startResendTimer()
        } else if (isOtpSent && !isOtpVerified) {
          // Step 2: Verify OTP
          await verifyOTP(email, otp)
          setIsOtpVerified(true)
        } else if (isOtpVerified) {
          // Step 3: Set new password
          if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
          }

          const passwordError = validatePassword(newPassword)
          if (passwordError) {
            setError(passwordError)
            setLoading(false)
            return
          }

          await resetPassword(email, otp, newPassword)
          // Reset form and show success
          resetForm()
          setMassage("Password reset successful. You can now login.")
        }
      } else {
        await onLogin(email, password)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResendOtp) return

    setError(null)
    setLoading(true)
    setMassage(null)

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

  const resetForm = () => {
    setForgotPasswordMode(false)
    setIsOtpSent(false)
    setIsOtpVerified(false)
    setOtp("")
    setNewPassword("")
    setConfirmNewPassword("")
    setError(null)
    setMassage(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">{forgotPasswordMode ? "Reset Password" : "Login"}</h2>

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading || (forgotPasswordMode && isOtpSent)}
      />

      {!forgotPasswordMode && (
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
      )}

      {forgotPasswordMode && isOtpSent && !isOtpVerified && (
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

      {forgotPasswordMode && isOtpVerified && (
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {massage && <p className="text-green-500 text-sm">{massage}</p>}
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading
          ? "Processing..."
          : forgotPasswordMode
            ? isOtpVerified
              ? "Reset Password"
              : isOtpSent
                ? "Verify OTP"
                : "Send Reset Otp"
            : "Login"}
      </Button>

      {!forgotPasswordMode ? (
        <div className="flex justify-between">
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={() => setForgotPasswordMode(true)}
            disabled={loading}
          >
            Forgot Password?
          </Button>

          <Button type="button" variant="link" className="p-0 h-auto" onClick={onSwitchToSignup} disabled={loading}>
            Dont have an account? Sign up
          </Button>
        </div>
      ) : (
        <Button type="button" variant="link" className="p-0 h-auto" onClick={resetForm} disabled={loading}>
          Back to Login
        </Button>
      )}
    </form>
  )
}
