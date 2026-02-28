-- Run this in your Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- 2. Create job_embeddings table
CREATE TABLE IF NOT EXISTS public.job_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.job_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow reading embeddings for jobs the user owns (nested check)
CREATE POLICY "Users can view embeddings for their jobs" ON public.job_embeddings
    FOR SELECT USING (
        job_id IN (SELECT id FROM public.jobs WHERE user_id = auth.uid())
    );

-- 3. Create agent_runs table
CREATE TABLE IF NOT EXISTS public.agent_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) NOT NULL DEFAULT 'pending',
    config JSONB DEFAULT '{}'::jsonb,
    state JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own runs" ON public.agent_runs
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own runs" ON public.agent_runs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own runs" ON public.agent_runs
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Create agent_tasks table (for tracking individual steps in a run)
CREATE TABLE IF NOT EXISTS public.agent_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    run_id UUID REFERENCES public.agent_runs(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    input JSONB DEFAULT '{}'::jsonb,
    output JSONB,
    status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks for their runs" ON public.agent_tasks
    FOR SELECT USING (
        run_id IN (SELECT id FROM public.agent_runs WHERE user_id = auth.uid())
    );
