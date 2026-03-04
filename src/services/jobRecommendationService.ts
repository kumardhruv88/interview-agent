/**
 * Job Recommendation Service
 * Main orchestrator that combines Adzuna API and Groq LLM matching
 */

import { adzunaApi, type Job, type JobSearchParams } from './adzunaApi';
import { jobMatcher, type UserProfile, type RankedJob } from './jobMatcher';

export interface RecommendationRequest {
    profile: UserProfile;
    resumeText?: string;
    profileAnalysis?: any; // Cached profile analysis to skip Groq LLM call
    preferences?: {
        location?: string;
        country?: string;
        keywords?: string[];
    };
    topN?: number;
}

export interface RecommendationResponse {
    recommendations: RankedJob[];
    totalFound: number;
    searchParams: {
        keywords: string[];
        location: string;
    };
    profileAnalysis?: any; // Return for caching in database
}

class JobRecommendationService {
    /**
     * Get job recommendations for a user
     */
    async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
        const {
            profile,
            resumeText = '',
            profileAnalysis: cachedAnalysis,
            preferences = {},
            topN = 10
        } = request;

        console.log('🎯 Starting job recommendation process...');

        try {
            // Step 1: Analyze user profile with Groq (or use cached analysis)
            let profileAnalysis;

            if (cachedAnalysis) {
                console.log('✅ Using cached profile analysis (no Groq call needed)');
                profileAnalysis = cachedAnalysis;
            } else {
                console.log('📊 Step 1/3: Analyzing profile with Groq LLM...');
                profileAnalysis = await jobMatcher.analyzeProfile(resumeText, profile);
                console.log('✅ Profile analyzed:', profileAnalysis);
            }

            // Step 2: Build search parameters from profile analysis
            const keywords = preferences.keywords || this.buildSearchKeywords(profileAnalysis);
            const location = preferences.location || profile.location_preference || 'remote';
            const country = preferences.country || 'us';

            console.log('🔍 Step 2/3: Searching jobs...');
            console.log('   Keywords:', keywords);
            console.log('   Location:', location);

            const searchParams: JobSearchParams = {
                keywords,
                location,
                country,
                resultsPerPage: 50, // Get more results for better matching
                sortBy: 'relevance'
            };

            // Search for jobs
            const jobs = await adzunaApi.searchJobs(searchParams);
            console.log(`✅ Found ${jobs.length} jobs`);

            if (jobs.length === 0) {
                return {
                    recommendations: [],
                    totalFound: 0,
                    searchParams: { keywords, location },
                    profileAnalysis // Return analysis for caching
                };
            }

            // Step 3: Rank jobs with Groq LLM
            console.log('🤖 Step 3/3: Ranking jobs with AI...');
            const rankedJobs = await jobMatcher.rankJobs(
                profileAnalysis,
                jobs,
                profile,
                topN
            );

            console.log(`✅ Top ${rankedJobs.length} recommendations ready!`);

            return {
                recommendations: rankedJobs,
                totalFound: jobs.length,
                searchParams: { keywords, location },
                profileAnalysis // Return analysis for caching
            };

        } catch (error) {
            console.error('❌ Error getting recommendations:', error);
            throw error;
        }
    }

    /**
     * Build search keywords from profile analysis
     */
    private buildSearchKeywords(analysis: any): string[] {
        const keywords: string[] = [];

        // Add suitable roles (max 2 to keep query simple)
        if (analysis.suitable_roles && analysis.suitable_roles.length > 0) {
            // Take top 2 roles and clean them
            keywords.push(...analysis.suitable_roles
                .slice(0, 2)
                .map((role: string) => role.replace(/[&()]/g, '').trim()) // Remove special chars
            );
        }

        // Add top skills (max 3, cleaned)
        if (analysis.skills && analysis.skills.length > 0) {
            keywords.push(...analysis.skills
                .slice(0, 3)
                .map((skill: string) => skill.replace(/[&()]/g, '').trim()) // Remove special chars
                .filter((skill: string) => skill.length > 0)
            );
        }

        // Fallback - use simple, generic terms
        if (keywords.length === 0) {
            keywords.push('software', 'developer');
        }

        // Limit total keywords to avoid overly long queries
        return keywords.slice(0, 4);
    }

    /**
     * Get interview questions for a specific job
     */
    async getInterviewQuestions(job: Job, count: number = 5): Promise<string[]> {
        return await jobMatcher.generateInterviewQuestions(job, count);
    }

    /**
     * Search jobs with custom parameters (for manual search)
     */
    async searchJobs(params: JobSearchParams): Promise<Job[]> {
        return await adzunaApi.searchJobs(params);
    }

    /**
     * Check if service is properly configured
     */
    isConfigured(): boolean {
        return adzunaApi.isConfigured();
    }
}

// Export singleton instance
export const jobRecommendationService = new JobRecommendationService();
