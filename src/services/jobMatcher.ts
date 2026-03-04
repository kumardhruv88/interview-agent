/**
 * Job Matcher Service using Groq LLM
 * Analyzes user profiles and matches them with jobs intelligently
 */

import Groq from 'groq-sdk';
import type { Job } from './adzunaApi';

export interface UserProfile {
    name?: string;
    skills: string[];
    experience_years: number;
    education?: string;
    location_preference?: string;
}

export interface ProfileAnalysis {
    skills: string[];
    strengths: string[];
    experience_level: string;
    career_goals?: string;
    suitable_roles: string[];
}

export interface RankedJob extends Job {
    matchScore: number;
    matchReason: string;
    interviewTips?: string[];
}

class JobMatcherService {
    private groq: Groq;

    constructor() {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        if (!apiKey) {
            throw new Error('VITE_GROQ_API_KEY not found in environment variables');
        }

        this.groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    }

    /**
     * Analyze user profile and resume to extract key information
     */
    async analyzeProfile(resumeText: string, profile: UserProfile): Promise<ProfileAnalysis> {
        const prompt = `Analyze this user's profile and resume to extract key career information.

**User Profile:**
- Skills: ${profile.skills.join(', ')}
- Experience: ${profile.experience_years} years
- Education: ${profile.education || 'Not specified'}
- Location Preference: ${profile.location_preference || 'Any'}

**Resume Text:**
${resumeText || 'No resume provided'}

**Task:** Extract and return a JSON object with:
1. skills: Array of technical skills (include those from profile AND resume)
2. strengths: Top 3-5 professional strengths
3. experience_level: "entry" | "mid" | "senior" | "lead"
4. career_goals: Brief summary of career direction (if identifiable)
5. suitable_roles: Array of 5-7 job titles that would be a good fit

Return ONLY the JSON object, no other text.`;

        try {
            const response = await this.groq.chat.completions.create({
                model: 'llama-3.1-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 1000
            });

            const content = response.choices[0]?.message?.content || '{}';
            const analysis = JSON.parse(content);

            return analysis as ProfileAnalysis;

        } catch (error) {
            console.error('Error analyzing profile:', error);

            // Fallback analysis
            return {
                skills: profile.skills,
                strengths: ['Problem solving', 'Technical expertise', 'Team collaboration'],
                experience_level: profile.experience_years >= 5 ? 'senior' : profile.experience_years >= 2 ? 'mid' : 'entry',
                suitable_roles: ['Software Engineer', 'Developer']
            };
        }
    }

    /**
     * Rank jobs based on match with user profile
     */
    async rankJobs(
        profileAnalysis: ProfileAnalysis,
        jobs: Job[],
        profile: UserProfile,
        topN: number = 10
    ): Promise<RankedJob[]> {
        console.log(`🤖 Ranking ${jobs.length} jobs using Groq LLM...`);

        // Process jobs in batches to avoid token limits
        const batchSize = 5;
        const rankedJobs: RankedJob[] = [];

        for (let i = 0; i < jobs.length; i += batchSize) {
            const batch = jobs.slice(i, i + batchSize);
            const batchResults = await this.rankJobBatch(profileAnalysis, batch, profile);
            rankedJobs.push(...batchResults);
        }

        // Sort by match score and return top N
        return rankedJobs
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, topN);
    }

    /**
     * Rank a batch of jobs
     */
    private async rankJobBatch(
        profileAnalysis: ProfileAnalysis,
        jobs: Job[],
        profile: UserProfile
    ): Promise<RankedJob[]> {
        const jobSummaries = jobs.map((job, idx) => ({
            index: idx,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description.substring(0, 500), // Truncate for token efficiency
            salary: job.salary
        }));

        const prompt = `You are a career advisor AI. Match these jobs with the user's profile.

**User Profile:**
- Skills: ${profileAnalysis.skills.join(', ')}
- Strengths: ${profileAnalysis.strengths.join(', ')}
- Experience Level: ${profileAnalysis.experience_level}
- Experience Years: ${profile.experience_years} years
${profileAnalysis.career_goals ? `- Career Goals: ${profileAnalysis.career_goals}` : ''}

**Jobs to Evaluate:**
${JSON.stringify(jobSummaries, null, 2)}

**Task:** For each job, provide:
1. matchScore: 0-100 score (how well it matches the profile)
2. matchReason: 1-2 sentence explanation of why it's a good/bad match
3. interviewTips: Array of 2-3 specific tips for interviewing for THIS job

Return a JSON array with one object per job, in the same order. Format:
[
  {
    "index": 0,
    "matchScore": 85,
    "matchReason": "...",
    "interviewTips": ["tip1", "tip2", "tip3"]
  },
  ...
]

Return ONLY the JSON array, no other text.`;

        try {
            const response = await this.groq.chat.completions.create({
                model: 'llama-3.1-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.4,
                max_tokens: 2000
            });

            const content = response.choices[0]?.message?.content || '[]';
            const rankings = JSON.parse(content);

            // Combine rankings with original jobs
            return jobs.map((job, idx) => {
                const ranking = rankings.find((r: any) => r.index === idx) || {
                    matchScore: 50,
                    matchReason: 'Potentially relevant to your background',
                    interviewTips: ['Research the company', 'Prepare examples of your work', 'Ask insightful questions']
                };

                return {
                    ...job,
                    matchScore: ranking.matchScore,
                    matchReason: ranking.matchReason,
                    interviewTips: ranking.interviewTips
                };
            });

        } catch (error) {
            console.error('Error ranking jobs:', error);

            // Fallback: simple keyword matching
            return jobs.map(job => ({
                ...job,
                matchScore: this.simpleMatch(job, profileAnalysis.skills),
                matchReason: 'Match based on skill keywords',
                interviewTips: [
                    'Highlight your relevant experience',
                    'Demonstrate your technical skills',
                    'Show enthusiasm for the role'
                ]
            }));
        }
    }

    /**
     * Simple fallback matching based on keyword overlap
     */
    private simpleMatch(job: Job, skills: string[]): number {
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        const matches = skills.filter(skill =>
            jobText.includes(skill.toLowerCase())
        ).length;

        return Math.min(100, Math.round((matches / skills.length) * 100) + 40);
    }

    /**
     * Generate interview questions for a specific job
     */
    async generateInterviewQuestions(job: Job, count: number = 5): Promise<string[]> {
        const prompt = `Generate ${count} relevant interview questions for this job:

**Job Title:** ${job.title}
**Company:** ${job.company}
**Description:** ${job.description.substring(0, 1000)}

Generate ${count} specific, realistic interview questions that would likely be asked for this role.
Focus on technical skills, experience, and role-specific scenarios.

Return ONLY a JSON array of question strings:
["question1", "question2", ...]`;

        try {
            const response = await this.groq.chat.completions.create({
                model: 'llama-3.1-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 800
            });

            const content = response.choices[0]?.message?.content || '[]';
            const questions = JSON.parse(content);

            return questions;

        } catch (error) {
            console.error('Error generating interview questions:', error);
            return [
                'Tell me about your relevant experience for this role.',
                'What interests you about this position?',
                'Describe a challenging project you\'ve worked on.',
                'How do you stay updated with industry trends?',
                'What are your career goals for the next few years?'
            ];
        }
    }
}

// Export singleton instance
export const jobMatcher = new JobMatcherService();
