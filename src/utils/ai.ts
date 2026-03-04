import { generateGroqResponse } from "./groq";


export interface SkillGapAnalysis {
  matchScore: number;
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: { skill: string; importance: string; explanation: string }[];
  summary: string;
}

export const analyzeResumeGap = async (
  resumeText: string,
  jobDescription: string,
  transcriptText?: string
): Promise<SkillGapAnalysis> => {



  let systemPrompt = `
    You are an expert ATS and Technical Recruiter.
    Compare the Candidate Resume against the Job Description.
    Perform a deep semantic analysis, not just keyword matching.
    
    Output JSON ONLY in the following format:
    {
      "matchScore": number (0-100),
      "matchedSkills": ["skill1", "skill2"],
      "partialSkills": ["skill3 (explanation)"],
      "missingSkills": [
        { "skill": "skill name", "importance": "Critical|Good to have", "explanation": "Why it matters" }
      ],
      "summary": "Brief 1-2 sentence overview of the fit."
    }
  `;

  if (transcriptText) {
    systemPrompt = `
    You are an expert ATS and Technical Recruiter.
    You have the Candidate's RESUME, the JOB DESCRIPTION, and a TRANSCRIPT of their technical interview.
    
    GOAL: Identify the true skill gaps.
    1. Check if skills missing from the RESUME were actually demonstrated in the TRANSCRIPT.
       - If yes, mark them as "matchedSkills" (append " (Demonstrated in Interview)" to the skill name).
    2. Check if skills present on the RESUME were exposed as weak in the TRANSCRIPT.
       - If yes, move them to "partialSkills" or "missingSkills" with explanation "Listed on resume but failed in interview".
    3. Calculate matchScore based on the COMBINED evidence of Resume + Transcript vs JD.

    Output JSON ONLY in the following format:
    {
      "matchScore": number (0-100),
      "matchedSkills": ["skill1", "skill2 (Demonstrated in Interview)"],
      "partialSkills": ["skill3 (explanation)"],
      "missingSkills": [
        { "skill": "skill name", "importance": "Critical|Good to have", "explanation": "Why it matters" }
      ],
      "summary": "Brief 1-2 sentence overview of the fit, mentioning if the interview helped or hurt their case."
    }
    `;
  }

  const userPrompt = `
    JOB DESCRIPTION:
    ${jobDescription}

    CANDIDATE RESUME:
    ${resumeText}

    ${transcriptText ? `INTERVIEW TRANSCRIPT:\n${transcriptText}` : ''}
  `;

  try {
    let text: string;

    // Try Gemini first if configured
    if (isGeminiConfigured()) {
      try {
        console.log("Attempting to use Gemini API...");
        text = await generateGeminiResponse(userPrompt, undefined, systemPrompt);
        console.log("✅ Successfully used Gemini API");
      } catch (geminiError) {
        console.warn("Gemini API failed, falling back to Groq:", geminiError);
        text = await generateGroqResponse(userPrompt, undefined, systemPrompt);
        console.log("✅ Successfully used Groq API (fallback)");
      }
    } else {
      // If Gemini not configured, use Groq directly
      console.log("Gemini not configured, using Groq API...");
      text = await generateGroqResponse(userPrompt, undefined, systemPrompt);
      console.log("✅ Successfully used Groq API");
    }

    // Clean JSON formatting (Markdown blocks)
    const jsonStr = text.replace(/```json|```/g, "").trim();

    return JSON.parse(jsonStr) as SkillGapAnalysis;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw error;
  }
};
