import { generateGroqResponse } from './groq';

export interface ExtractedResumeData {
    candidateName: string;
    email: string;
    phone: string;
    yearsOfExperience: string;
    skills: string[];
    education: {
        degree: string;
        institution: string;
        year?: string;
    }[];
    workExperience: {
        title: string;
        company: string;
        duration: string;
        description: string;
    }[];
    projects: {
        name: string;
        description: string;
    }[];
    summary: string;
}

/**
 * Extract structured resume data using Groq LLM
 * Only call this when user creates an interview to save API quota
 */
export async function extractResumeWithLLM(resumeContent: string): Promise<ExtractedResumeData> {
    if (!resumeContent || resumeContent.trim().length === 0) {
        throw new Error("Resume content is empty");
    }

    const systemPrompt = `You are an expert resume parser. Extract ONLY the information that is EXPLICITLY written in the resume. Do NOT invent or assume any data.

CRITICAL RULES:
1. Extract EXACT text from the resume - do not paraphrase or invent
2. If a field is not found in the resume, return empty string "" or empty array []
3. Do not add placeholder data or example data
4. Return ONLY valid JSON with no additional text

Extract the following structure:
{
  "candidateName": "exact name from resume",
  "email": "exact email address",
  "phone": "exact phone number",
  "yearsOfExperience": "number only (e.g., '3' or '5')",
  "skills": ["skill1", "skill2", ...],
  "education": [
    {
      "degree": "exact degree name",
      "institution": "exact college/university name",
      "year": "graduation year if mentioned"
    }
  ],
  "workExperience": [
    {
      "title": "exact job title",
      "company": "exact company name",
      "duration": "exact duration (e.g., '2020-2022' or 'Jan 2020 - Dec 2022')",
      "description": "brief summary of responsibilities"
    }
  ],
  "projects": [
    {
      "name": "exact project name",
      "description": "brief description of the project"
    }
  ],
  "summary": "A 2-3 sentence professional summary of the candidate based ONLY on resume content"
}

IMPORTANT: Extract workExperience and projects arrays even if resume doesn't have clear sections. Look for any work history or project mentions.`;

    const userPrompt = `Extract information from this resume:\n\n${resumeContent}`;

    try {
        console.log("🔍 Extracting resume data with LLM...");

        const response = await generateGroqResponse(
            userPrompt,
            "llama-3.3-70b-versatile", // Using the default model
            systemPrompt
        );

        console.log("✅ LLM extraction complete");
        console.log("Raw LLM response:", response);

        // Parse the JSON response
        let extractedData: ExtractedResumeData;

        try {
            // Try to extract JSON from the response (in case LLM adds extra text)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                extractedData = JSON.parse(jsonMatch[0]);
            } else {
                extractedData = JSON.parse(response);
            }
        } catch (parseError) {
            console.error("Failed to parse LLM response as JSON:", parseError);
            console.error("Response was:", response);

            // Return a fallback structure
            return {
                candidateName: "",
                email: "",
                phone: "",
                yearsOfExperience: "",
                skills: [],
                education: [],
                workExperience: [],
                projects: [],
                summary: resumeContent.substring(0, 200) + "..." // Use first 200 chars as summary
            };
        }

        // Validate and ensure all required fields exist
        const validatedData: ExtractedResumeData = {
            candidateName: extractedData.candidateName || "",
            email: extractedData.email || "",
            phone: extractedData.phone || "",
            yearsOfExperience: extractedData.yearsOfExperience || "",
            skills: Array.isArray(extractedData.skills) ? extractedData.skills : [],
            education: Array.isArray(extractedData.education) ? extractedData.education : [],
            workExperience: Array.isArray(extractedData.workExperience) ? extractedData.workExperience : [],
            projects: Array.isArray(extractedData.projects) ? extractedData.projects : [],
            summary: extractedData.summary || ""
        };

        console.log("📊 Extracted resume data:", validatedData);

        return validatedData;

    } catch (error) {
        console.error("Error extracting resume with LLM:", error);
        throw new Error(`Failed to extract resume data: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Format extracted resume data into a readable text format for interview context
 */
export function formatExtractedDataForInterview(data: ExtractedResumeData): string {
    let formatted = `CANDIDATE PROFILE\n\n`;

    if (data.candidateName) {
        formatted += `Name: ${data.candidateName}\n`;
    }

    if (data.email) {
        formatted += `Email: ${data.email}\n`;
    }

    if (data.yearsOfExperience) {
        formatted += `Experience: ${data.yearsOfExperience} years\n`;
    }

    if (data.summary) {
        formatted += `\nSummary:\n${data.summary}\n`;
    }

    if (data.skills && data.skills.length > 0) {
        formatted += `\nSkills:\n${data.skills.join(', ')}\n`;
    }

    if (data.education && data.education.length > 0) {
        formatted += `\nEducation:\n`;
        data.education.forEach(edu => {
            formatted += `- ${edu.degree} from ${edu.institution}${edu.year ? ` (${edu.year})` : ''}\n`;
        });
    }

    if (data.workExperience && data.workExperience.length > 0) {
        formatted += `\nWork Experience:\n`;
        data.workExperience.forEach(exp => {
            formatted += `- ${exp.title} at ${exp.company} (${exp.duration})\n`;
            if (exp.description) {
                formatted += `  ${exp.description}\n`;
            }
        });
    }

    if (data.projects && data.projects.length > 0) {
        formatted += `\nProjects:\n`;
        data.projects.forEach(proj => {
            formatted += `- ${proj.name}: ${proj.description}\n`;
        });
    }

    return formatted;
}
