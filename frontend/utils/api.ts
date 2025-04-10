import axios from "axios";

const BACKEND_API_URL = "http://localhost:3001"; // Update this with your server URL

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
}

interface Chat {
  id: number;
  title: string;
  messages: Message[];
}

// Retrieve token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

export async function login(email: string, password: string): Promise<string> {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/login`, { email, password });
    const token = response.data.token;
    localStorage.setItem("token", token);
    return token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        throw new Error(error.response.data.error);
      }
    }
    throw new Error("An unknown error occurred. Please try again later.");
  }
}

export async function signup(email: string, password: string): Promise<void> {
  try {
    await axios.post(`${BACKEND_API_URL}/signup`, { email, password });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 403) {
        throw new Error(error.response.data.error);
      }
    }
    throw new Error("An unknown error occurred. Please try again later.");
  }
}

export async function verifyOTP(email: string, otp: string): Promise<string> {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/verify-otp`, { email, otp });
    const token = response.data.token;
    localStorage.setItem("token", token);
    return token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      if ([400, 404].includes(error.response.status)) {
        throw new Error(error.response.data.error);
      }
    }
    throw new Error("An unknown error occurred. Please try again later.");
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<string> {
  const token = getToken();
  if (!token) throw new Error("No token found");

  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to change password.");
  }
}

export async function resendOTP(email: string): Promise<void> {
  try {
    await axios.post(`${BACKEND_API_URL}/resend-otp`, { email })
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error)
    }
    throw new Error("Failed to resend OTP. Please try again later.")
  }
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await axios.post(`${BACKEND_API_URL}/request-password-reset`, { email })
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        throw new Error("User not found")
      }
      throw new Error(error.response.data.error)
    }
    throw new Error("Failed to request password reset. Please try again later.")
  }
}

// Reset password with OTP
export async function resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
  try {
    await axios.post(`${BACKEND_API_URL}/reset-password`, { email, otp, newPassword })
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      if ([400, 404].includes(error.response.status)) {
        throw new Error(error.response.data.error)
      }
      throw new Error(error.response.data.error)
    }
    throw new Error("Failed to reset password. Please try again later.")
  }
}

// Verify token with backend
export async function validateToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/verify-token`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.email;
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

// Fetch user chats
export async function getChats(): Promise<Chat[]> {
  const token = getToken();
  if (!token) throw new Error("No token found");

  try {
    const response = await axios.get(`${BACKEND_API_URL}/chats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to fetch chats. Please try again later.");
  }
}

// Update user chats
export async function updateChats(chats: Chat[]): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("No token found");

  try {
    await axios.post(
      `${BACKEND_API_URL}/chats`,
      { chats },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to update chats. Please try again later.");
  }
}
