import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:3001"; // Update this with your server URL

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
    const response = await axios.post(`${API_URL}/login`, { email, password });
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
    await axios.post(`${API_URL}/signup`, { email, password });
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
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
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

// Verify token with backend
export async function validateToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await axios.post(
      `${API_URL}/verify-token`,
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
    const response = await axios.get(`${API_URL}/chats`, {
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
      `${API_URL}/chats`,
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
