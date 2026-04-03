-- Create profile_projects table
CREATE TABLE IF NOT EXISTS public.profile_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    name TEXT NOT NULL,
    url TEXT,
    technologies TEXT, -- comma separated
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profile_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.profile_projects
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own projects" ON public.profile_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own projects" ON public.profile_projects
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own projects" ON public.profile_projects
    FOR DELETE USING (auth.uid() = user_id);
