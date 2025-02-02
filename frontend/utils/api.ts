import axios from "axios"

const API_URL = "http://localhost:3001" // Update this with your server URL

let token: string | null = null

export async function login(email: string, password: string): Promise<string> {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password })
    token = response.data.token
    localStorage.setItem("token", token)
    return token
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error(error.response.data.error) // Proper error message
    }
    throw new Error("An Known error occured. Please try again later.") // Generic error
  }
}

export async function signup(email: string, password: string): Promise<string> {
  const response = await axios.post(`${API_URL}/signup`, { email, password })
  token = response.data.token
  localStorage.setItem("token", token)
  return token
}

export async function getChats(): Promise<any[]> {
  if (!token) {
    token = localStorage.getItem("token")
  }
  const response = await axios.get(`${API_URL}/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function updateChats(chats: any[]): Promise<void> {
  if (!token) {
    token = localStorage.getItem("token")
  }
  await axios.post(
    `${API_URL}/chats`,
    { chats },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
}

