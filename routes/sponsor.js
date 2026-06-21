const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

// GET /sponsor
router.get('/', async (req, res) => {
  // If user is logged in, fetch their posts to allow them to select one for sponsorship
  let userPosts = [];
  if (res.locals.user) {
    try {
      const { data } = await supabase
        .from('posts')
        .select('id, title, status')
        .eq('user_id', res.locals.user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      userPosts = data || [];
    } catch (err) {
      console.error(err);
    }
  }

  res.render('sponsor', { title: 'Sponsor a Post', userPosts, success: req.query.success });
});

// POST /sponsor
router.post('/', authenticateToken, async (req, res) => {
  const { post_id, amount_offered, message } = req.body;

  try {
    // Verify the post belongs to the user
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .eq('user_id', req.user.id)
      .single();

    if (!post) {
      return res.status(403).send('Invalid post selected.');
    }

    // Create the sponsorship request
    const { error } = await supabase
      .from('sponsorship_requests')
      .insert([{
        user_id: req.user.id,
        post_id: post.id,
        amount_offered: parseFloat(amount_offered) || 0.00,
        message,
        status: 'pending'
      }]);

    if (error) throw error;

    res.redirect('/sponsor?success=true');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error while processing request.');
  }
});

module.exports = router;
