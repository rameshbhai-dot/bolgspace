const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Helper to get ads and categories (used across pages)
async function getCommonData() {
  const now = new Date().toISOString();
  const [catsRes, adsRes] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('ads')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('position')
  ]);
  return {
    categories: catsRes.data || [],
    ads: adsRes.data || []
  };
}

// GET / - Homepage
router.get('/', async (req, res) => {
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        *,
        users (display_name, username),
        categories (name, slug)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(13);

    const common = await getCommonData();

    // Map relationships for EJS template
    const formattedPosts = (posts || []).map(p => ({
      ...p,
      display_name: p.users?.display_name,
      username: p.users?.username,
      category_name: p.categories?.name,
      category_slug: p.categories?.slug
    }));

    const { data: sponsoredPostsData } = await supabase
      .from('posts')
      .select(`*, users (display_name, username), categories (name, slug)`)
      .eq('status', 'published')
      .eq('is_sponsored', true)
      .order('created_at', { ascending: false });

    const formattedSponsored = (sponsoredPostsData || []).map(p => ({
      ...p,
      display_name: p.users?.display_name,
      username: p.users?.username,
      category_name: p.categories?.name,
      category_slug: p.categories?.slug
    }));

    res.render('home', { 
      title: 'Home', 
      posts: formattedPosts, 
      sponsoredPosts: formattedSponsored,
      categories: common.categories, 
      ads: common.ads 
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', user: res.locals.user });
  }
});

// GET /blog/:slug - Blog post detail
router.get('/blog/:slug', async (req, res) => {
  try {
    const { data: post } = await supabase
      .from('posts')
      .select(`
        *,
        users (display_name, username, bio),
        categories (name, slug)
      `)
      .eq('slug', req.params.slug)
      .eq('status', 'published')
      .single();

    if (!post) {
      return res.status(404).render('error', { title: '404', message: 'Post not found', user: res.locals.user });
    }

    // Increment views
    await supabase.from('posts').update({ views: post.views + 1 }).eq('id', post.id);

    // Get tags
    const { data: tagsData } = await supabase
      .from('post_tags')
      .select('tags(*)')
      .eq('post_id', post.id);
    const tags = (tagsData || []).map(t => t.tags);

    // Get related posts
    const { data: related } = await supabase
      .from('posts')
      .select(`*, users(display_name, username), categories(name, slug)`)
      .eq('category_id', post.category_id)
      .neq('id', post.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3);

    const common = await getCommonData();

    const formattedPost = {
      ...post,
      display_name: post.users?.display_name,
      username: post.users?.username,
      author_bio: post.users?.bio,
      category_name: post.categories?.name,
      category_slug: post.categories?.slug
    };

    const formattedRelated = (related || []).map(p => ({
      ...p,
      display_name: p.users?.display_name,
      username: p.users?.username,
      category_name: p.categories?.name,
      category_slug: p.categories?.slug
    }));

    res.render('post', { title: formattedPost.title, post: formattedPost, tags, relatedPosts: formattedRelated, ads: common.ads });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', user: res.locals.user });
  }
});

// GET /category/:slug
router.get('/category/:slug', async (req, res) => {
  try {
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', req.params.slug)
      .single();

    if (!category) {
      return res.status(404).render('error', { title: '404', message: 'Category not found', user: res.locals.user });
    }

    const { data: posts } = await supabase
      .from('posts')
      .select(`*, users(display_name, username), categories(name, slug)`)
      .eq('category_id', category.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    const formattedPosts = (posts || []).map(p => ({
      ...p,
      display_name: p.users?.display_name,
      username: p.users?.username,
      category_name: p.categories?.name,
      category_slug: p.categories?.slug
    }));

    const common = await getCommonData();

    res.render('category', { title: category.name, category, posts: formattedPosts, categories: common.categories, ads: common.ads });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', user: res.locals.user });
  }
});

// GET /search
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    let posts = [];

    if (q.trim()) {
      // Supabase supports text search, but for simple like we can use .or()
      const { data } = await supabase
        .from('posts')
        .select(`*, users(display_name, username), categories(name, slug)`)
        .eq('status', 'published')
        .or(`title.ilike.%${q}%,content.ilike.%${q}%,excerpt.ilike.%${q}%`)
        .order('created_at', { ascending: false });
        
      posts = data || [];
    }

    const formattedPosts = posts.map(p => ({
      ...p,
      display_name: p.users?.display_name,
      username: p.users?.username,
      category_name: p.categories?.name,
      category_slug: p.categories?.slug
    }));

    const common = await getCommonData();

    res.render('search', { title: 'Search', posts: formattedPosts, query: q, categories: common.categories, ads: common.ads });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', user: res.locals.user });
  }
});

// GET /about
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

module.exports = router;
