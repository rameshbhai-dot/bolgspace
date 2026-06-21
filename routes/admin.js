const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const { supabase } = require('../config/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireAdmin);

// GET /admin - Dashboard Overview
router.get('/', async (req, res) => {
  try {
    const [{ count: totalPosts }, { count: publishedPosts }, { count: totalUsers }, { data: viewsData }] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('views')
    ]);

    const totalViews = (viewsData || []).reduce((sum, p) => sum + (p.views || 0), 0);

    const stats = {
      totalPosts: totalPosts || 0,
      publishedPosts: publishedPosts || 0,
      totalUsers: totalUsers || 0,
      totalViews
    };

    res.render('admin/index', { title: 'Admin Dashboard', stats });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /admin/posts
router.get('/posts', async (req, res) => {
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('*, users(display_name, username), categories(name)')
      .order('created_at', { ascending: false });

    const formattedPosts = (posts || []).map(p => ({
      ...p,
      display_name: p.users?.display_name,
      username: p.users?.username,
      category_name: p.categories?.name
    }));

    res.render('admin/posts', { title: 'Manage Posts', posts: formattedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/posts/delete/:id
router.post('/posts/delete/:id', async (req, res) => {
  try {
    await supabase.from('posts').delete().eq('id', req.params.id);
    res.redirect('/admin/posts');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /admin/users
router.get('/users', async (req, res) => {
  try {
    const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    res.render('admin/users', { title: 'Manage Users', users: users || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/users/toggle/:id
router.post('/users/toggle/:id', async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('is_active').eq('id', req.params.id).single();
    if (user) {
      await supabase.from('users').update({ is_active: !user.is_active }).eq('id', req.params.id);
    }
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /admin/categories
router.get('/categories', async (req, res) => {
  try {
    const { data: categories } = await supabase.from('categories').select('*').order('name');
    res.render('admin/categories', { title: 'Manage Categories', categories: categories || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/categories
router.post('/categories', async (req, res) => {
  const { name, description } = req.body;
  const slug = slugify(name, { lower: true, strict: true });
  
  try {
    await supabase.from('categories').insert([{ name, slug, description }]);
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/categories/delete/:id
router.post('/categories/delete/:id', async (req, res) => {
  try {
    await supabase.from('categories').delete().eq('id', req.params.id);
    res.redirect('/admin/categories');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /admin/ads
router.get('/ads', async (req, res) => {
  try {
    const { data: ads } = await supabase.from('ads').select('*').order('position');
    res.render('admin/ads', { title: 'Manage Ads', ads: ads || [], ad: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/ads
router.post('/ads', async (req, res) => {
  const { id, slot_name, placement, title, link_url, html_code, position, is_active, existing_image, start_date, end_date } = req.body;
  
  try {
    const adData = {
      slot_name,
      placement: placement || 'sidebar',
      title,
      link_url,
      html_code,
      position: parseInt(position) || 0,
      is_active: is_active ? true : false,
      image_url: existing_image || null,
      start_date: start_date ? new Date(start_date).toISOString() : null,
      end_date: end_date ? new Date(end_date).toISOString() : null
    };

    if (id) {
      await supabase.from('ads').update(adData).eq('id', id);
    } else {
      await supabase.from('ads').insert([adData]);
    }
    res.redirect('/admin/ads');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /admin/ads/edit/:id
router.get('/ads/edit/:id', async (req, res) => {
  try {
    const { data: ads } = await supabase.from('ads').select('*').order('position');
    const { data: ad } = await supabase.from('ads').select('*').eq('id', req.params.id).single();
    
    if (!ad) return res.status(404).send('Ad not found');
    res.render('admin/ads', { title: 'Edit Ad', ads: ads || [], ad });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/ads/delete/:id
router.post('/ads/delete/:id', async (req, res) => {
  try {
    await supabase.from('ads').delete().eq('id', req.params.id);
    res.redirect('/admin/ads');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /admin/sponsorships
router.get('/sponsorships', async (req, res) => {
  try {
    const { data: requests } = await supabase
      .from('sponsorship_requests')
      .select('*, users(email, display_name), posts(title, slug)')
      .order('created_at', { ascending: false });

    res.render('admin/sponsorships', { title: 'Manage Sponsorships', requests: requests || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/sponsorships/:id/approve
router.post('/sponsorships/:id/approve', async (req, res) => {
  try {
    await supabase.from('sponsorship_requests').update({ status: 'approved' }).eq('id', req.params.id);
    await supabase.from('posts').update({ is_sponsored: true }).eq('id', req.body.post_id);
    res.redirect('/admin/sponsorships');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/sponsorships/:id/reject
router.post('/sponsorships/:id/reject', async (req, res) => {
  try {
    await supabase.from('sponsorship_requests').update({ status: 'rejected' }).eq('id', req.params.id);
    await supabase.from('posts').update({ is_sponsored: false }).eq('id', req.body.post_id);
    res.redirect('/admin/sponsorships');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /admin/sponsorships/:id/revoke
router.post('/sponsorships/:id/revoke', async (req, res) => {
  try {
    await supabase.from('sponsorship_requests').update({ status: 'pending' }).eq('id', req.params.id);
    await supabase.from('posts').update({ is_sponsored: false }).eq('id', req.body.post_id);
    res.redirect('/admin/sponsorships');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
