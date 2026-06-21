const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /dashboard
router.get('/', async (req, res) => {
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('*, categories(name)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    const formattedPosts = (posts || []).map(p => ({
      ...p,
      category_name: p.categories?.name
    }));

    res.render('dashboard/index', { title: 'Dashboard', posts: formattedPosts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /dashboard/new
router.get('/new', async (req, res) => {
  try {
    const { data: categories } = await supabase.from('categories').select('*').order('name');
    res.render('dashboard/editor', { title: 'New Post', post: null, categories: categories || [], error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /dashboard/new
router.post('/new', async (req, res) => {
  const { title, content, excerpt, category_id, status, tags } = req.body;
  let slug = slugify(title, { lower: true, strict: true });

  try {
    // Basic unique slug handling
    const { data: existing } = await supabase.from('posts').select('id').eq('slug', slug);
    if (existing && existing.length > 0) {
      slug = slug + '-' + Math.floor(Math.random() * 1000);
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert([{
        user_id: req.user.id,
        category_id: category_id || null,
        title,
        slug,
        excerpt: excerpt || content.substring(0, 150).replace(/(<([^>]+)>)/gi, ""),
        content,
        status: status || 'draft',
        // Note: featured_image logic should handle Supabase URLs, currently handled via editor
      }])
      .select()
      .single();

    if (error) throw error;

    // Handle tags (simplified)
    if (tags && post) {
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
      for (const t of tagList) {
        const tSlug = slugify(t, { lower: true, strict: true });
        
        let tagId;
        const { data: existingTag } = await supabase.from('tags').select('id').eq('slug', tSlug).single();
        
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag } = await supabase.from('tags').insert([{ name: t, slug: tSlug }]).select().single();
          if (newTag) tagId = newTag.id;
        }
        
        if (tagId) {
          await supabase.from('post_tags').insert([{ post_id: post.id, tag_id: tagId }]);
        }
      }
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    const { data: categories } = await supabase.from('categories').select('*');
    res.render('dashboard/editor', { title: 'New Post', post: req.body, categories: categories || [], error: 'Failed to create post' });
  }
});

// GET /dashboard/edit/:id
router.get('/edit/:id', async (req, res) => {
  try {
    const { data: post } = await supabase
      .from('posts')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!post) return res.status(404).send('Post not found');

    const { data: categories } = await supabase.from('categories').select('*').order('name');
    
    // Get tags
    const { data: postTags } = await supabase
      .from('post_tags')
      .select('tags(name)')
      .eq('post_id', post.id);
      
    const tagsStr = (postTags || []).map(pt => pt.tags.name).join(', ');

    res.render('dashboard/editor', { title: 'Edit Post', post, categories: categories || [], postTags: tagsStr, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /dashboard/edit/:id
router.post('/edit/:id', async (req, res) => {
  const { title, content, excerpt, category_id, status, tags } = req.body;
  let slug = slugify(title, { lower: true, strict: true });

  try {
    const { data: post } = await supabase.from('posts').select('id').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (!post) return res.status(403).send('Unauthorized');

    await supabase
      .from('posts')
      .update({
        title,
        slug,
        category_id: category_id || null,
        excerpt: excerpt || content.substring(0, 150).replace(/(<([^>]+)>)/gi, ""),
        content,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id);

    // Tags updating is complex (delete old, insert new), keeping it simple for this migration by deleting all and recreating
    await supabase.from('post_tags').delete().eq('post_id', req.params.id);
    
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
      for (const t of tagList) {
        const tSlug = slugify(t, { lower: true, strict: true });
        
        let tagId;
        const { data: existingTag } = await supabase.from('tags').select('id').eq('slug', tSlug).single();
        
        if (existingTag) {
          tagId = existingTag.id;
        } else {
          const { data: newTag } = await supabase.from('tags').insert([{ name: t, slug: tSlug }]).select().single();
          if (newTag) tagId = newTag.id;
        }
        
        if (tagId) {
          await supabase.from('post_tags').insert([{ post_id: req.params.id, tag_id: tagId }]);
        }
      }
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /dashboard/delete/:id
router.post('/delete/:id', async (req, res) => {
  try {
    await supabase.from('posts').delete().eq('id', req.params.id).eq('user_id', req.user.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
