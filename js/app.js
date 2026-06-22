import { supabase } from './supabase.js';
import { renderAuth } from './views/auth.js';
import { renderSponsor } from './views/sponsor.js';
import { renderAdmin } from './views/admin.js';
import { renderDashboard, renderEditor } from './views/dashboard.js';
import { renderAbout } from './views/about.js';
import { renderHome } from './views/home.js';
import { renderPost } from './views/post.js';
import { renderPrivacy } from './views/privacy.js';
import { renderTerms } from './views/terms.js';

let currentUser = null;

// Initialize App
async function init() {
  // Check auth state
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
    currentUser = userData;
  }
  
  updateNav();
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      currentUser = userData;
    } else {
      currentUser = null;
    }
    updateNav();
  });

  // Handle routing
  window.addEventListener('hashchange', router);
  router(); // Run on load
}

function updateNav() {
  const authNav = document.getElementById('authNav');
  const navLinks = document.getElementById('navLinks');
  
  let linksHtml = `
    <a href="#/" class="nav-link">Home</a>
    <a href="#/about" class="nav-link">About</a>
    <a href="#/about" class="nav-link mobile-nav-item">Contact</a>
    <a href="#/privacy" class="nav-link mobile-nav-item">Privacy Policy</a>
    <a href="#/terms" class="nav-link mobile-nav-item">Terms of Service</a>
  `;
  
  if (currentUser) {
    // Add Dashboard and Admin links directly to the navbar so they are highly visible
    linksHtml += `
      <a href="#/dashboard" class="nav-link">My Posts</a>
      ${currentUser.role === 'admin' ? '<a href="#/admin" class="nav-link">Admin Panel</a>' : ''}
    `;
    navLinks.innerHTML = linksHtml;
    
    authNav.innerHTML = `
      <div style="display: inline-flex; align-items: center; gap: 20px;">
        <a href="#/dashboard/new" class="nav-link" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Write
        </a>
        <div class="nav-dropdown">
          <button class="nav-link dropdown-trigger" style="display: flex; align-items: center; gap: 8px;">
            <div class="avatar avatar-sm">${currentUser.display_name.charAt(0).toUpperCase()}</div>
          </button>
          <div class="dropdown-menu dropdown-menu-right">
            <div style="padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border-light); margin-bottom: var(--space-2);">
              <strong style="display: block; font-size: var(--font-size-sm);">${currentUser.display_name}</strong>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">${currentUser.email}</span>
            </div>
            <a href="#/dashboard" class="dropdown-item">My Posts</a>
            <a href="#/dashboard/new" class="dropdown-item">New Post</a>
            ${currentUser.role === 'admin' ? '<a href="#/admin" class="dropdown-item">Admin Panel</a>' : ''}
            <button id="logoutBtn" class="dropdown-item" style="color: red; width: 100%; text-align: left; cursor: pointer;">Log Out</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.hash = '#/';
    });
  } else {
    navLinks.innerHTML = linksHtml;
    authNav.innerHTML = `
      <a href="#/auth/login" class="nav-link">Log In</a>
      <a href="#/auth/signup" class="btn btn-primary" style="padding: 0.5rem 1rem;">Sign Up</a>
    `;
  }
}

// Simple Hash Router
async function router() {
  window.scrollTo(0, 0);
  const hash = window.location.hash || '#/';
  const root = document.getElementById('app-root');
  
  root.innerHTML = '<div style="text-align: center; padding: 100px;"><h2>Loading...</h2></div>';

  if (hash === '#/') {
    await renderHome(root);
  } else if (hash.startsWith('#/blog/')) {
    const slug = hash.split('#/blog/')[1];
    await renderPost(root, slug, currentUser);
  } else if (hash === '#/about') {
    await renderAbout(root, currentUser);
  } else if (hash === '#/privacy') {
    renderPrivacy(root);
  } else if (hash === '#/terms') {
    renderTerms(root);
  } else if (hash.startsWith('#/auth/')) {
    const type = hash.split('#/auth/')[1];
    await renderAuth(root, type);
  } else if (hash === '#/sponsor') {
    await renderSponsor(root, currentUser);
  } else if (hash.startsWith('#/admin')) {
    await renderAdmin(root, currentUser);
  } else if (hash === '#/dashboard') {
    await renderDashboard(root, currentUser);
  } else if (hash === '#/dashboard/new') {
    await renderEditor(root, currentUser);
  } else if (hash.startsWith('#/dashboard/edit/')) {
    const postId = hash.split('#/dashboard/edit/')[1];
    await renderEditor(root, currentUser, postId);
  } else {
    root.innerHTML = '<div style="text-align: center; padding: 100px;"><h2>404 - Page Not Found</h2></div>';
  }
}

// Helper functions renderHome and renderPost moved to views/home.js and views/post.js

init();
