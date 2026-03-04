-- Migration to add caching columns for Groq API optimization
-- Run this in Supabase SQL Editor

-- Add new columns to user_profiles table for caching
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS parsed_resume_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS profile_analysis JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS resume_last_parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS profile_last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Add comment documentation
COMMENT ON COLUMN user_profiles.parsed_resume_data IS 'Cached LLM-parsed resume data to avoid re-parsing';
COMMENT ON COLUMN user_profiles.profile_analysis IS 'Cached profile analysis (skills, strengths, suitable_roles) for job matching';
COMMENT ON COLUMN user_profiles.resume_last_parsed_at IS 'Timestamp of last resume parsing with LLM';
COMMENT ON COLUMN user_profiles.profile_last_analyzed_at IS 'Timestamp of last profile analysis for job recommendations';
