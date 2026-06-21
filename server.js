const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database initialization removed (using Supabase)

// Auth middleware - attach user to all requests
const { optionalAuth } = require('./middleware/auth');
app.use(optionalAuth);

// Routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const sponsorRoutes = require('./routes/sponsor');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/api', uploadRoutes);
app.use('/sponsor', sponsorRoutes);
app.use('/', blogRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { title: '404 - Not Found', message: 'Page not found', user: res.locals.user });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong', user: res.locals.user });
});

app.listen(PORT, () => {
  console.log(`BlogSpace server running at http://localhost:${PORT}`);
});
