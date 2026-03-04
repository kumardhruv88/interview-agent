
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const apiKey = process.env.VITE_GROQ_API_KEY;

if (!apiKey) {
    console.error("Error: VITE_GROQ_API_KEY not found in .env");
    process.exit(1);
}

async function listModels() {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText}\n${error}`);
        }

        const data = await response.json();
        console.log("Available Models:");
        data.data.forEach(model => {
            console.log(`- ${model.id}`);
        });
    } catch (error) {
        console.error("Failed to fetch models:", error);
    }
}

listModels();
