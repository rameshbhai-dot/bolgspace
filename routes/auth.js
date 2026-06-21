const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Log In', error: null, user: null });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.render('auth/login', { title: 'Log In', error: error.message, user: null });
    }

    // Set cookies for session
    res.cookie('sb_access_token', data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('sb_refresh_token', data.session.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { title: 'Log In', error: 'An error occurred during login', user: null });
  }
});

// GET /auth/signup
router.get('/signup', (req, res) => {
  res.render('auth/signup', { title: 'Sign Up', error: null, user: null });
});

// POST /auth/signup
router.post('/signup', async (req, res) => {
  const { display_name, email, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return res.render('auth/signup', { title: 'Sign Up', error: 'Passwords do not match', user: null });
  }

  try {
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: display_name,
          username: username,
          role: 'author'
        }
      }
    });

    if (error) {
      return res.render('auth/signup', { title: 'Sign Up', error: error.message, user: null });
    }

    // Usually Supabase requires email confirmation, but we will assume it auto-confirms or they can login
    // If it returns a session, we log them in
    if (data.session) {
      res.cookie('sb_access_token', data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('sb_refresh_token', data.session.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.redirect('/dashboard');
    } else {
      // If email confirmation is required
      res.render('auth/login', { title: 'Log In', error: 'Account created! Please verify your email or log in.', user: null });
    }

  } catch (err) {
    console.error(err);
    res.render('auth/signup', { title: 'Sign Up', error: 'An error occurred during signup', user: null });
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  res.clearCookie('sb_access_token');
  res.clearCookie('sb_refresh_token');
  res.redirect('/');
});

module.exports = router;
