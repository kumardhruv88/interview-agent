/**
 * Adzuna Job API Service
 * Fetches real-time job postings from Adzuna API
 */

export interface JobSearchParams {
    keywords: string[];
    location?: string;
    country?: string;
    resultsPerPage?: number;
    page?: number;
    sortBy?: 'relevance' | 'date' | 'salary';
}

export interface AdzunaJob {
    id: string;
    title: string;
    company: {
        display_name: string;
    };
    location: {
        display_name: string;
        area?: string[];
    };
    description: string;
    created: string;
    redirect_url: string;
    salary_min?: number;
    salary_max?: number;
    salary_is_predicted?: boolean;
    contract_type?: string;
    category?: {
        label: string;
        tag: string;
    };
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    salary: string;
    applyUrl: string;
    postedDate: string;
    contractType?: string;
    category?: string;
}

class AdzunaApiService {
    private appId: string;
    private appKey: string;
    private baseUrl = 'http://localhost:3001/api/adzuna'; // Proxy server to avoid CORS
    private defaultCountry = 'in'; // Changed to India

    constructor() {
        this.appId = import.meta.env.VITE_ADZUNA_APP_ID || '';
        this.appKey = import.meta.env.VITE_ADZUNA_APP_KEY || '';

        if (!this.appId || !this.appKey) {
            console.warn('⚠️ Adzuna API credentials not found in environment variables');
        }
    }

    /**
     * Search for jobs based on parameters
     */
    async searchJobs(params: JobSearchParams): Promise<Job[]> {
        const {
            keywords,
            location = 'remote',
            country = this.defaultCountry,
            resultsPerPage = 50,
            page = 1,
            sortBy = 'relevance'
        } = params;

        try {
            // Build query parameters
            const queryParams = new URLSearchParams({
                app_id: this.appId,
                app_key: this.appKey,
                results_per_page: resultsPerPage.toString(),
                what: keywords.join(' '),
                where: location,
                sort_by: sortBy,
                page: page.toString()
            });

            const url = `${this.baseUrl}/${country}/search/${page}?${queryParams}`;

            console.log('🔍 Searching jobs:', { keywords, location, country });

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Adzuna API error response:', errorText);
                throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Transform Adzuna jobs to our Job interface
            const jobs: Job[] = data.results.map((job: AdzunaJob) => this.transformJob(job));

            console.log(`✅ Found ${jobs.length} jobs`);

            return jobs;

        } catch (error) {
            console.error('❌ Error fetching jobs from Adzuna:', error);
            console.warn('⚠️ Using mock data as fallback');

            // Return mock jobs as fallback
            return this.getMockJobs(keywords, location);
        }
    }

    /**
     * Get mock jobs for demo/fallback purposes
     */
    private getMockJobs(keywords: string[], location: string): Job[] {
        const mockJobs: Job[] = [
            {
                id: 'mock-1',
                title: `${keywords[0] || 'Software'} Engineer`,
                company: 'Tech Corp',
                location: location || 'Remote',
                description: `Looking for an experienced ${keywords[0] || 'Software'} Engineer to join our team. Work on cutting-edge projects with modern technologies.`,
                salary: '$80,000 - $120,000',
                applyUrl: 'https://example.com/job1',
                postedDate: 'Today',
                contractType: 'Full-time'
            },
            {
                id: 'mock-2',
                title: `Senior ${keywords[0] || 'Software'} Developer`,
                company: 'Innovation Labs',
                location: location || 'Remote',
                description: `Join our dynamic team as a Senior Developer. Lead exciting projects and mentor junior developers.`,
                salary: '$100,000 - $140,000',
                applyUrl: 'https://example.com/job2',
                postedDate: 'Yesterday',
                contractType: 'Full-time'
            },
            {
                id: 'mock-3',
                title: `${keywords[1] || 'Full Stack'} Developer`,
                company: 'StartupXYZ',
                location: location || 'Hybrid',
                description: `Fast-growing startup looking for talented developers. Great equity package and benefits.`,
                salary: '$90,000 - $130,000',
                applyUrl: 'https://example.com/job3',
                postedDate: '2 days ago',
                contractType: 'Full-time'
            },
            {
                id: 'mock-4',
                title: 'Lead Engineer',
                company: 'Enterprise Solutions Inc',
                location: location || 'On-site',
                description: `Leadership role in established company. Drive technical strategy and team growth.`,
                salary: '$120,000 - $160,000',
                applyUrl: 'https://example.com/job4',
                postedDate: '3 days ago',
                contractType: 'Full-time'
            },
            {
                id: 'mock-5',
                title: `${keywords[2] || 'Backend'} Engineer`,
                company: 'Cloud Services Ltd',
                location: location || 'Remote',
                description: `Build scalable backend systems serving millions of users. Modern cloud infrastructure.`,
                salary: '$85,000 - $125,000',
                applyUrl: 'https://example.com/job5',
                postedDate: '1 week ago',
                contractType: 'Full-time'
            }
        ];

        return mockJobs;
    }

    /**
     * Get job categories/types available
     */
    async getCategories(country: string = this.defaultCountry): Promise<any[]> {
        try {
            const url = `${this.baseUrl}/${country}/categories?app_id=${this.appId}&app_key=${this.appKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Adzuna API error: ${response.status}`);
            }

            const data = await response.json();
            return data.results;

        } catch (error) {
            console.error('❌ Error fetching categories:', error);
            return [];
        }
    }

    /**
     * Get location suggestions
     */
    async getLocationSuggestions(query: string, country: string = this.defaultCountry): Promise<string[]> {
        try {
            const url = `${this.baseUrl}/${country}/geodata?app_id=${this.appId}&app_key=${this.appKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                return [];
            }

            const data = await response.json();

            // Filter locations matching the query
            const locations = data.locations
                .filter((loc: any) => loc.display_name.toLowerCase().includes(query.toLowerCase()))
                .map((loc: any) => loc.display_name)
                .slice(0, 10);

            return locations;

        } catch (error) {
            console.error('❌ Error fetching location suggestions:', error);
            return [];
        }
    }

    /**
     * Transform Adzuna job to our Job interface
     */
    private transformJob(adzunaJob: AdzunaJob): Job {
        // Format salary
        let salary = 'Not specified';
        if (adzunaJob.salary_min && adzunaJob.salary_max) {
            const min = this.formatSalary(adzunaJob.salary_min);
            const max = this.formatSalary(adzunaJob.salary_max);
            salary = `${min} - ${max}`;
            if (adzunaJob.salary_is_predicted) {
                salary += ' (estimated)';
            }
        } else if (adzunaJob.salary_min) {
            salary = `From ${this.formatSalary(adzunaJob.salary_min)}`;
        }

        // Format location
        const location = adzunaJob.location.display_name;

        // Format posted date
        const postedDate = this.formatDate(adzunaJob.created);

        return {
            id: adzunaJob.id,
            title: adzunaJob.title,
            company: adzunaJob.company.display_name,
            location,
            description: adzunaJob.description,
            salary,
            applyUrl: adzunaJob.redirect_url,
            postedDate,
            contractType: adzunaJob.contract_type,
            category: adzunaJob.category?.label
        };
    }

    /**
     * Format salary to USD
     */
    private formatSalary(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Format date to relative time
     */
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    }

    /**
     * Check if API credentials are configured
     */
    isConfigured(): boolean {
        return !!(this.appId && this.appKey);
    }
}

// Export singleton instance
export const adzunaApi = new AdzunaApiService();
