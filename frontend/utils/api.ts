import axios from "axios";

const API_URL = "http://localhost:3001"; // Update this with your server URL

// Retrieve token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

export async function login(email: string, password: string): Promise<string> {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const token = response.data.token;
    localStorage.setItem("token", token); // Store token persistently
    return token;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error(error.response.data.error);
    }
    throw new Error("An unknown error occurred. Please try again later.");
  }
}

export async function signup(email: string, password: string): Promise<void> {
  try {
    await axios.post(`${API_URL}/signup`, { email, password })
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error(error.response.data.error)
    }
    throw new Error("An unknown error occurred. Please try again later.")
  }
}

export async function verifyOTP(email: string, otp: string): Promise<string> {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp })
    const token = response.data.token
    localStorage.setItem("token", token) // Store token persistently
    return token
  } catch (error: any) {
    if ([400, 404].includes(error.response?.status)) {
      throw new Error(error.response.data.error)
    }
    throw new Error("An unknown error occurred. Please try again later.")
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
export async function getChats(): Promise<any[]> {
  const token = getToken();
  if (!token) throw new Error("No token found");

  const response = await axios.get(`${API_URL}/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

// Update user chats
export async function updateChats(chats: any[]): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("No token found");

  await axios.post(
    `${API_URL}/chats`,
    { chats },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

