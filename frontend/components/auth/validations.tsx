export function validatePassword(password: string): string | null {
    const errors = []
    if (password.length < 6) errors.push("at least 6 characters")
    if (!/[A-Z]/.test(password)) errors.push("1 capital letter")
    if (!/\d/.test(password)) errors.push("1 digit")
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("1 symbol")
  
    return errors.length ? `Password must contain ${errors.join(", ")}` : null
}

export const validateEmail = (email: string): string | null => {
    if (!email.includes("@")) return "Email must contain '@'"
    const [local, domain] = email.split("@")
    if (!local) return "Email must have text before '@'"
    if (!domain || !domain.includes(".")) return "Email domain must contain '.'"
    return null
}
  
  