-- Run this in your Supabase SQL Editor to update your database schema

-- 1. Modify the ads table to support time limits and placements
ALTER TABLE public.ads 
ADD COLUMN IF NOT EXISTS placement TEXT DEFAULT 'sidebar' CHECK (placement IN ('sidebar', 'homepage_hero', 'in_article')),
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ DEFAULT (NOW() + interval '30 days');

-- 2. Modify the posts table to support sponsored flags
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false;

-- 3. Create the sponsorship requests table (Manual Payment Flow)
CREATE TABLE public.sponsorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  amount_offered DECIMAL(10,2) DEFAULT 0.00,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
