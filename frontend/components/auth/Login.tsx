import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSwitchToSignup: () => void
}

export function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null) // Error state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // Reset error before a new attempt
    try {
      await onLogin(email, password)
    } catch (err: any) {
      setError(err.message) // Set error message
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>} {/* Error Message */}
      <Button type="submit" className="w-full">
        Login
      </Button>
      <Button type="button" variant="link" onClick={onSwitchToSignup}>
        Don't have an account? Sign up
      </Button>
    </form>
  )
}
