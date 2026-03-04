/**
 * Interview Statistics Utilities
 * Tracks and calculates user performance metrics across all interviews
 */

interface Interview {
    id: string;
    createdAt?: string;
    completedAt?: string;
    analysis?: {
        score: number;
    };
    score?: number;
    duration?: number;
    isTopicInterview?: boolean;
}

interface TopicInterview {
    id: string;
    completedAt: string;
    duration: number;
    analysis?: {
        score: number;
    };
}

interface InterviewStats {
    totalInterviews: number;
    minutesPracticed: number;
    averageScore: number;
    leaderboardRank: number;
    leaderboardLabel: string;
}

/**
 * Calculate total minutes practiced across all interviews
 */
export const calculateMinutesPracticed = (): number => {
    let totalMinutes = 0;

    // Regular interviews
    const regularInterviews = localStorage.getItem("interviews");
    if (regularInterviews) {
        const interviews: Interview[] = JSON.parse(regularInterviews);
        interviews.forEach(interview => {
            // Estimate 15 minutes per interview if duration not specified
            totalMinutes += interview.duration || 15;
        });
    }

    // Topic interviews
    const topicInterviews = localStorage.getItem("topic_interviews");
    if (topicInterviews) {
        const topics: TopicInterview[] = JSON.parse(topicInterviews);
        topics.forEach(topic => {
            totalMinutes += topic.duration || 15;
        });
    }

    return totalMinutes;
};

/**
 * Calculate total number of completed interviews
 */
export const calculateTotalInterviews = (): number => {
    let total = 0;

    const regularInterviews = localStorage.getItem("interviews");
    if (regularInterviews) {
        const interviews: Interview[] = JSON.parse(regularInterviews);
        // Only count completed interviews (with transcript or analysis)
        total += interviews.filter(i => i.analysis || (i as any).transcript).length;
    }

    const topicInterviews = localStorage.getItem("topic_interviews");
    if (topicInterviews) {
        const topics: TopicInterview[] = JSON.parse(topicInterviews);
        total += topics.length; // All topic interviews are completed
    }

    return total;
};

/**
 * Calculate average score across all interviews
 */
export const calculateAverageScore = (): number => {
    let totalScore = 0;
    let scoredInterviews = 0;

    // Regular interviews
    const regularInterviews = localStorage.getItem("interviews");
    if (regularInterviews) {
        const interviews: Interview[] = JSON.parse(regularInterviews);
        interviews.forEach(interview => {
            const score = interview.analysis?.score || interview.score;
            if (score !== undefined && score > 0) {
                totalScore += score;
                scoredInterviews++;
            }
        });
    }

    // Topic interviews
    const topicInterviews = localStorage.getItem("topic_interviews");
    if (topicInterviews) {
        const topics: TopicInterview[] = JSON.parse(topicInterviews);
        topics.forEach(topic => {
            const score = topic.analysis?.score;
            if (score !== undefined && score > 0) {
                totalScore += score;
                scoredInterviews++;
            }
        });
    }

    return scoredInterviews > 0 ? Math.round(totalScore / scoredInterviews) : 0;
};

/**
 * Get leaderboard rank and label based on performance
 */
export const getLeaderboardRank = (averageScore: number, totalInterviews: number): { rank: number; label: string } => {
    // Ranking logic based on average score and interview count
    if (totalInterviews === 0) {
        return { rank: 0, label: "Beginner Mode" };
    }

    if (averageScore >= 90 && totalInterviews >= 10) {
        return { rank: 1, label: "Elite Performer" };
    } else if (averageScore >= 80 && totalInterviews >= 7) {
        return { rank: 2, label: "Advanced" };
    } else if (averageScore >= 70 && totalInterviews >= 5) {
        return { rank: 3, label: "Intermediate" };
    } else if (averageScore >= 60 && totalInterviews >= 3) {
        return { rank: 5, label: "Rising Star" };
    } else {
        return { rank: totalInterviews + 10, label: "Getting Started" };
    }
};

/**
 * Get performance label based on average score
 */
export const getPerformanceLabel = (averageScore: number): string => {
    if (averageScore >= 90) return "Excellent";
    if (averageScore >= 80) return "Very Good";
    if (averageScore >= 70) return "Good";
    if (averageScore >= 60) return "Rising Star";
    if (averageScore > 0) return "Keep Going";
    return "Rising Star";
};

/**
 * Get all interview statistics
 * Works for both logged-in users (Supabase) and guests (localStorage)
 */
export const getInterviewStats = async (user?: any): Promise<InterviewStats> => {
    let totalInterviews = 0;
    let minutesPracticed = 0;
    let totalScore = 0;
    let scoredInterviews = 0;

    if (user) {
        // Logged-in user: Fetch from Supabase
        try {
            const { supabase } = await import('@/integrations/supabase/client');
            const { data: interviews, error } = await supabase
                .from('interviews')
                .select('duration_minutes, analysis, score, completed_at, transcript')
                .eq('user_id', user.id);

            if (!error && interviews) {
                interviews.forEach((interview: any) => {
                    // Count completed interviews (have transcript OR analysis OR completed_at)
                    const isCompleted = interview.completed_at ||
                        interview.analysis ||
                        (interview.transcript && interview.transcript.length > 0);

                    if (isCompleted) {
                        totalInterviews++;

                        // Sum duration (default to 15 minutes if not recorded)
                        const duration = interview.duration_minutes || 15;
                        minutesPracticed += duration;

                        // Calculate average score
                        const score = interview.analysis?.score || interview.score;
                        if (score && score > 0) {
                            totalScore += score;
                            scoredInterviews++;
                        }
                    }
                });
            }
        } catch (err) {
            console.error("Error fetching stats from Supabase:", err);
        }
    } else {
        // Guest user: Use localStorage data
        totalInterviews = calculateTotalInterviews();
        minutesPracticed = calculateMinutesPracticed();
        totalScore = 0;
        scoredInterviews = 0;

        // Calculate average score from localStorage
        const regularInterviews = localStorage.getItem("interviews");
        if (regularInterviews) {
            const interviews: Interview[] = JSON.parse(regularInterviews);
            interviews.forEach(interview => {
                const score = interview.analysis?.score || interview.score;
                if (score !== undefined && score > 0) {
                    totalScore += score;
                    scoredInterviews++;
                }
            });
        }
    }

    const averageScore = scoredInterviews > 0 ? Math.round(totalScore / scoredInterviews) : 0;
    const { rank, label } = getLeaderboardRank(averageScore, totalInterviews);

    return {
        totalInterviews,
        minutesPracticed,
        averageScore,
        leaderboardRank: rank,
        leaderboardLabel: label
    };
};

/**
 * Update interview with completion time
 */
export const markInterviewCompleted = (interviewId: string, duration: number, isTopic: boolean = false) => {
    const storageKey = isTopic ? "topic_interviews" : "interviews";
    const saved = localStorage.getItem(storageKey);

    if (saved) {
        const interviews = JSON.parse(saved);
        const updated = interviews.map((interview: any) => {
            if (interview.id === interviewId) {
                return {
                    ...interview,
                    completedAt: new Date().toISOString(),
                    duration: duration
                };
            }
            return interview;
        });
        localStorage.setItem(storageKey, JSON.stringify(updated));
    }
};
