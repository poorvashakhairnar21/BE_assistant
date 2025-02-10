import axios from "axios";

const API_URL = "http://localhost:3002"; 

export async function getAiResponse(message: string): Promise<string> {
    try {
        const response = await axios.post(`${API_URL}/chat`, { message });

        return response.data.reply; 
    } catch (error) {
        console.error("Error fetching AI response:", error);
        throw new Error("Failed to fetch AI response");
    }
}
