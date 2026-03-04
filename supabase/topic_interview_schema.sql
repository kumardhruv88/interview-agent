-- Topic Wise Interview Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_predefined BOOLEAN DEFAULT FALSE,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topic resources table (for PDFs, links, etc.)
CREATE TABLE IF NOT EXISTS topic_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'link', 'text', 'document')),
    resource_url TEXT, -- Supabase storage URL or external link
    file_name TEXT,
    file_size INTEGER,
    extracted_content TEXT, -- RAG-processed text content
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topic interviews table
CREATE TABLE IF NOT EXISTS topic_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    transcript JSONB DEFAULT '[]'::jsonb,
    context_used TEXT, -- The actual context injected during interview
    score INTEGER,
    feedback JSONB,
    duration_minutes INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_is_predefined ON topics(is_predefined);
CREATE INDEX IF NOT EXISTS idx_topic_resources_topic_id ON topic_resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_interviews_user_id ON topic_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_interviews_topic_id ON topic_interviews(topic_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_interviews ENABLE ROW LEVEL SECURITY;

-- Topics policies
CREATE POLICY "Users can view predefined topics" ON topics
    FOR SELECT USING (is_predefined = true);

CREATE POLICY "Users can view their own topics" ON topics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topics" ON topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" ON topics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" ON topics
    FOR DELETE USING (auth.uid() = user_id);

-- Topic resources policies
CREATE POLICY "Users can view resources for accessible topics" ON topic_resources
    FOR SELECT USING (
        topic_id IN (
            SELECT id FROM topics WHERE user_id = auth.uid() OR is_predefined = true
        )
    );

CREATE POLICY "Users can create resources for their topics" ON topic_resources
    FOR INSERT WITH CHECK (
        topic_id IN (SELECT id FROM topics WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete resources for their topics" ON topic_resources
    FOR DELETE USING (
        topic_id IN (SELECT id FROM topics WHERE user_id = auth.uid())
    );

-- Topic interviews policies
CREATE POLICY "Users can view their own interviews" ON topic_interviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interviews" ON topic_interviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert predefined topics
INSERT INTO topics (name, description, is_predefined, icon, color) VALUES
    ('FastAPI', 'Modern Python web framework for building APIs', true, '⚡', 'from-green-500/20 to-emerald-500/20'),
    ('Large Language Models', 'LLMs, transformers, and AI architectures', true, '🧠', 'from-purple-500/20 to-pink-500/20'),
    ('Generative AI', 'Diffusion models, GANs, prompt engineering', true, '✨', 'from-blue-500/20 to-cyan-500/20'),
    ('Transformers', 'Attention mechanisms, BERT, GPT architecture', true, '🔄', 'from-orange-500/20 to-red-500/20'),
    ('Python', 'Core Python programming and best practices', true, '🐍', 'from-yellow-500/20 to-amber-500/20'),
    ('Java', 'Java programming and frameworks', true, '☕', 'from-red-500/20 to-pink-500/20'),
    ('SQL', 'Databases, queries, and optimization', true, '🗄️', 'from-indigo-500/20 to-purple-500/20'),
    ('Docker', 'Containerization and orchestration', true, '🐳', 'from-blue-600/20 to-cyan-600/20'),
    ('React.js', 'React hooks, components, and patterns', true, '⚛️', 'from-cyan-500/20 to-blue-500/20'),
    ('System Design', 'Scalable system architecture patterns', true, '🏗️', 'from-purple-600/20 to-pink-600/20')
ON CONFLICT DO NOTHING;
