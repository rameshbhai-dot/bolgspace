-- Run this in your Supabase SQL Editor to secure your database for a Static Frontend

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- 1. Users Table Policies
-- Anyone can view users
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Categories Table Policies
-- Anyone can view categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
-- Only Admins can modify categories
CREATE POLICY "Admins can modify categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role = 'admin')
);

-- 3. Posts Table Policies
-- Anyone can read published posts
CREATE POLICY "Published posts are viewable by everyone" ON public.posts FOR SELECT USING (status = 'published');
-- Users can read all their own posts (including drafts)
CREATE POLICY "Users can view own posts" ON public.posts FOR SELECT USING (auth.uid() = user_id);
-- Admins can read all posts
CREATE POLICY "Admins can view all posts" ON public.posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role = 'admin')
);
-- Users can insert their own posts
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
-- Admins can update any post
CREATE POLICY "Admins can update any post" ON public.posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role = 'admin')
);

-- 4. Ads Table Policies
-- Anyone can view active ads
CREATE POLICY "Active ads are viewable by everyone" ON public.ads FOR SELECT USING (is_active = true);
-- Admins can view and modify all ads
CREATE POLICY "Admins can manage ads" ON public.ads FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role = 'admin')
);

-- 5. Sponsorship Requests Table Policies
-- Users can view their own requests
CREATE POLICY "Users can view own sponsorships" ON public.sponsorship_requests FOR SELECT USING (auth.uid() = user_id);
-- Users can insert their own requests
CREATE POLICY "Users can insert own sponsorships" ON public.sponsorship_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins can view and update all requests
CREATE POLICY "Admins can manage sponsorships" ON public.sponsorship_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND role = 'admin')
);

-- 6. Storage Bucket Policies (If not already secure)
-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND auth.role() = 'authenticated'
);
