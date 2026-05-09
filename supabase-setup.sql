-- TaxEasy Survey: Supabase Database Setup
-- Run this entire script in your Supabase project's SQL Editor
-- (Supabase Dashboard → SQL Editor → New Query → paste → Run)

-- 1. Create the survey_responses table
create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 2. Add an index on submitted_at for faster sorting
create index if not exists idx_survey_responses_submitted_at
  on survey_responses (submitted_at desc);

-- 3. Enable Row Level Security (RLS)
alter table survey_responses enable row level security;

-- 4. Allow anyone to INSERT a response (anonymous submissions)
create policy "Anyone can submit a response"
  on survey_responses
  for insert
  to anon, authenticated
  with check (true);

-- 5. Allow anyone to SELECT responses (so the public results page works)
-- If you want results to be admin-only, remove this policy and the
-- /api/responses GET endpoint will need to use the service role key instead.
create policy "Anyone can read responses"
  on survey_responses
  for select
  to anon, authenticated
  using (true);

-- Done! Your table is ready.
-- You can verify by running: select count(*) from survey_responses;
