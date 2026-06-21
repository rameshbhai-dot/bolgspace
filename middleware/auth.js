const { supabase } = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.sb_access_token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.clearCookie('sb_access_token');
      res.clearCookie('sb_refresh_token');
      return res.redirect('/auth/login');
    }

    // Fetch user details from public.users table
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userData && !userData.is_active) {
      res.clearCookie('sb_access_token');
      res.clearCookie('sb_refresh_token');
      return res.status(403).send('Account disabled');
    }

    req.user = userData || { id: user.id, email: user.email };
    res.locals.user = req.user;
    next();
  } catch (err) {
    console.error(err);
    res.redirect('/auth/login');
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).render('error', { title: '403 Forbidden', message: 'Admin access required', user: req.user });
  }
};

const optionalAuth = async (req, res, next) => {
  const token = req.cookies.sb_access_token;
  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
      req.user = userData || { id: user.id, email: user.email };
      res.locals.user = req.user;
    } else {
      res.locals.user = null;
    }
  } catch (err) {
    res.locals.user = null;
  }
  next();
};

module.exports = { authenticateToken, requireAdmin, optionalAuth };
