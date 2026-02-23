-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security for Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Jobs table
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  company text not null,
  location text,
  source text,
  url text,
  description text,
  posted_at timestamp with time zone,
  match_score integer check (match_score >= 0 and match_score <= 100),
  status text check (status in ('discovered', 'saved', 'prepared', 'applied', 'interview', 'offer', 'rejected', 'ghosted')) not null default 'discovered',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security for Jobs
alter table public.jobs enable row level security;

create policy "Users can view own jobs" on public.jobs
  for select using (auth.uid() = user_id);

create policy "Users can insert own jobs" on public.jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own jobs" on public.jobs
  for update using (auth.uid() = user_id);

create policy "Users can delete own jobs" on public.jobs
  for delete using (auth.uid() = user_id);

-- Resumes table
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  storage_path text not null,
  resume_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security for Resumes
alter table public.resumes enable row level security;

create policy "Users can view own resumes" on public.resumes
  for select using (auth.uid() = user_id);

create policy "Users can insert own resumes" on public.resumes
  for insert with check (auth.uid() = user_id);

-- Drafts table
create table public.drafts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  job_id uuid references public.jobs not null,
  draft_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security for Drafts
alter table public.drafts enable row level security;

create policy "Users can view own drafts" on public.drafts
  for select using (auth.uid() = user_id);

create policy "Users can insert own drafts" on public.drafts
  for insert with check (auth.uid() = user_id);

-- Status Events table
create table public.status_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  job_id uuid references public.jobs not null,
  from_status text,
  to_status text not null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security for Status Events
alter table public.status_events enable row level security;

create policy "Users can view own status events" on public.status_events
  for select using (auth.uid() = user_id);

create policy "Users can insert own status events" on public.status_events
  for insert with check (auth.uid() = user_id);

-- Storage Bucket Setup (This needs to be done manually or via API, but here is the policy logic)
-- Create a bucket named 'resumes' in the Supabase dashboard.
-- Policy: "Authenticated users can upload resumes"
-- Policy: "Authenticated users can read own resumes"

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, preferences)
  values (new.id, '{}'::jsonb);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
