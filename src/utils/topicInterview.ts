import { generateGroqResponse } from "./groq";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

/**
 * Generate topic-specific interview questions with optional resource context
 */
export const generateTopicQuestion = async (
    topicName: string,
    resourceContext: string,
    conversationHistory: Message[] = []
): Promise<string> => {
    const hasContext = resourceContext && resourceContext.trim().length > 0;

    const systemPrompt = hasContext
        ? `You are conducting a technical interview focused on ${topicName}.

CONTEXT FROM PROVIDED RESOURCES:
${resourceContext}

INTERVIEW GUIDELINES:
- Ask specific, in-depth questions about ${topicName}
- Reference concepts from the provided resources when relevant
- Ask follow-up questions based on the candidate's previous answers
- Gauge understanding depth through progressively harder questions
- Be conversational and encouraging
- If the candidate struggles, provide hints or shift to related concepts

Start with a moderate-difficulty question to assess their baseline knowledge.`
        : `You are conducting a technical interview focused on ${topicName}.

INTERVIEW GUIDELINES:
- Ask specific, in-depth questions about ${topicName}
- Cover fundamental concepts, practical applications, and best practices
- Ask follow-up questions based on the candidate's previous answers
- Gauge understanding depth through progressively harder questions
- Be conversational and encouraging
- If the candidate struggles, provide hints or shift to related concepts

Start with a moderate-difficulty question to assess their baseline knowledge.`;

    const messages: Message[] = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
    ];

    const response = await generateGroqResponse(messages);
    return response;
};

/**
 * Evaluate a candidate's answer in topic interview
 */
export const evaluateTopicAnswer = async (
    topicName: string,
    question: string,
    answer: string,
    resourceContext: string
): Promise<{ feedback: string; score: number; suggestedFollowUp: string }> => {
    const hasContext = resourceContext && resourceContext.trim().length > 0;

    const evaluationPrompt = hasContext
        ? `Evaluate this answer for a ${topicName} interview question.

QUESTION: ${question}
ANSWER: ${answer}

REFERENCE CONTEXT:
${resourceContext}

Provide:
1. Brief feedback (2-3 sentences)
2. Score (0-100)
3. A relevant follow-up question

Format: 
FEEDBACK: [your feedback]
SCORE: [number]
FOLLOWUP: [next question]`
        : `Evaluate this answer for a ${topicName} interview question.

QUESTION: ${question}
ANSWER: ${answer}

Provide:
1. Brief feedback (2-3 sentences)
2. Score (0-100)
3. A relevant follow-up question

Format: 
FEEDBACK: [your feedback]
SCORE: [number]
FOLLOWUP: [next question]`;

    const response = await generateGroqResponse([
        { role: "user", content: evaluationPrompt }
    ]);

    // Parse response
    const feedbackMatch = response.match(/FEEDBACK:\s*(.+?)(?=SCORE:|$)/s);
    const scoreMatch = response.match(/SCORE:\s*(\d+)/);
    const followUpMatch = response.match(/FOLLOWUP:\s*(.+?)$/s);

    return {
        feedback: feedbackMatch?.[1]?.trim() || "Good attempt!",
        score: parseInt(scoreMatch?.[1] || "50"),
        suggestedFollowUp: followUpMatch?.[1]?.trim() || "Can you elaborate on that?",
    };
};
