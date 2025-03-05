import axios from "axios";

let PYTHON_API_URL = "http://localhost:3002";

declare global {
  interface Window {
    PYTHON_SERVER_PORT?: number; // Explicitly define it as a number (or string if needed)
  }
}

const getApiUrl = (): string | null => {
  if (typeof window !== "undefined" && window.PYTHON_SERVER_PORT) {
    return `http://localhost:${window.PYTHON_SERVER_PORT}`;
  }
  return null; // Port not available yet
};

const waitForApiUrl = (retries = 10) =>
  new Promise<string>((resolve) => {
    const interval = setInterval(() => {
      const url = getApiUrl();
      if (url || retries <= 0) {
        clearInterval(interval);
        resolve(url || "http://localhost:3002"); // Fallback port
      }
      retries--;
    }, 500);
  });

waitForApiUrl().then((apiUrl) => {
    PYTHON_API_URL = apiUrl
  console.log("Using API:", apiUrl);
});

export async function getAiResponse(message: string): Promise<string> {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/chat`, { message });

        return response.data.reply; 
    } catch (error) {
        console.error("Error fetching AI response:", error);
        throw new Error("Failed to fetch AI response");
    }
}
