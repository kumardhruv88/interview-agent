
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

interface Message {
    role: string;
    content: string;
}

export const generateGroqResponse = async (
    prompt: string | Message[],
    modelId: string = DEFAULT_MODEL,
    systemInstruction?: string
) => {
    try {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("Groq API key is missing. Please set VITE_GROQ_API_KEY in your .env file.");
        }

        let messages: Message[] = [];

        if (systemInstruction) {
            messages.push({ role: "system", content: systemInstruction });
        }

        if (typeof prompt === 'string') {
            messages.push({ role: "user", content: prompt });
        } else if (Array.isArray(prompt)) {
            messages = [...messages, ...prompt];
        }

        console.log(`Generating response using model: ${modelId}`);

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: modelId,
                messages: messages,
                max_tokens: 2048,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            console.error("Groq API Error:", errorData);
            throw new Error(`Groq API Error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        let generatedText = "";

        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            generatedText = data.choices[0].message.content;
        }

        return generatedText;

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error;
    }
};
